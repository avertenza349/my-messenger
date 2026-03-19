from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
import uuid

from app.db import get_db
from app.models.message import Message
from app.models.chat import Chat, ChatParticipant
from app.models.user import User
from app.schemas.message import CreateMessage, MessageResponse
from app.utils.security import get_current_user
from app.websocket_manager import manager


router = APIRouter(prefix="/chats", tags=["messages"])


# Проверка: пользователь в чате
def ensure_user_in_chat(chat_id: int, user_id: int, db: Session):
    participant = db.query(ChatParticipant).filter(
        ChatParticipant.chat_id == chat_id,
        ChatParticipant.user_id == user_id
    ).first()

    if not participant:
        raise HTTPException(status_code=403, detail="Not a participant of this chat")


# Получить сообщения чата
@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
def get_chat_messages(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    ensure_user_in_chat(chat_id, current_user.id, db)

    messages = (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return messages


# Отправка текстового сообщения
@router.post("/{chat_id}/messages", response_model=MessageResponse)
async def send_message(
    chat_id: int,
    data: CreateMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    ensure_user_in_chat(chat_id, current_user.id, db)

    new_message = Message(
        chat_id=chat_id,
        sender_id=current_user.id,
        content=data.content,
        message_type="text",
        image_url=None
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # WebSocket payload
    message_payload = {
        "type": "new_message",
        "chat_id": new_message.chat_id,
        "message": {
            "id": new_message.id,
            "chat_id": new_message.chat_id,
            "sender_id": new_message.sender_id,
            "content": new_message.content,
            "message_type": new_message.message_type,
            "image_url": new_message.image_url,
            "created_at": new_message.created_at.isoformat(),
        }
    }

    participants = db.query(ChatParticipant).filter(
        ChatParticipant.chat_id == chat_id
    ).all()

    for participant in participants:
        await manager.send_to_user(participant.user_id, message_payload)

    return new_message


# Отправка картинки
@router.post("/{chat_id}/images", response_model=MessageResponse)
async def send_image(
    chat_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    ensure_user_in_chat(chat_id, current_user.id, db)

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    os.makedirs("uploads", exist_ok=True)

    ext = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join("uploads", unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"/uploads/{unique_filename}"

    new_message = Message(
        chat_id=chat_id,
        sender_id=current_user.id,
        content=None,
        message_type="image",
        image_url=image_url
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # WebSocket payload
    message_payload = {
        "type": "new_message",
        "chat_id": new_message.chat_id,
        "message": {
            "id": new_message.id,
            "chat_id": new_message.chat_id,
            "sender_id": new_message.sender_id,
            "content": new_message.content,
            "message_type": new_message.message_type,
            "image_url": new_message.image_url,
            "created_at": new_message.created_at.isoformat(),
        }
    }

    participants = db.query(ChatParticipant).filter(
        ChatParticipant.chat_id == chat_id
    ).all()

    for participant in participants:
        await manager.send_to_user(participant.user_id, message_payload)

    return new_message