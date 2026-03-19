from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.models.chat import Chat, ChatParticipant
from app.schemas.chat import CreatePrivateChat, CreateGroupChat, ChatResponse
from app.utils.security import get_current_user
from app.models.message import Message

router = APIRouter(prefix="/chats", tags=["chats"])

@router.post("/private", response_model=ChatResponse)
def create_private_chat(
    data: CreatePrivateChat,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot create a chat with yourself")

    other_user = db.query(User).filter(User.id == data.user_id).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Ищем существующий личный чат между двумя пользователями
    current_user_chat_ids = db.query(ChatParticipant.chat_id).filter(
        ChatParticipant.user_id == current_user.id
    ).all()

    current_user_chat_ids = [item[0] for item in current_user_chat_ids]

    if current_user_chat_ids:
        existing_chats = (
            db.query(Chat)
            .filter(Chat.id.in_(current_user_chat_ids), Chat.is_group == False)
            .all()
        )

        for chat in existing_chats:
            participants = db.query(ChatParticipant).filter(
                ChatParticipant.chat_id == chat.id
            ).all()
            participant_ids = sorted([p.user_id for p in participants])

            if participant_ids == sorted([current_user.id, data.user_id]):
                return build_chat_response(chat, db)

    # Создаём новый чат
    new_chat = Chat(
        title=None,
        is_group=False,
        created_by=current_user.id
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    participant_1 = ChatParticipant(chat_id=new_chat.id, user_id=current_user.id)
    participant_2 = ChatParticipant(chat_id=new_chat.id, user_id=data.user_id)

    db.add(participant_1)
    db.add(participant_2)
    db.commit()

    return build_chat_response(new_chat, db)
    if data.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot create a chat with yourself")

    other_user = db.query(User).filter(User.id == data.user_id).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Ищем существующий личный чат между двумя пользователями
    current_user_chat_ids = db.query(ChatParticipant.chat_id).filter(
        ChatParticipant.user_id == current_user.id
    ).all()

    current_user_chat_ids = [item[0] for item in current_user_chat_ids]

    if current_user_chat_ids:
        existing_chat = (
            db.query(Chat)
            .filter(Chat.id.in_(current_user_chat_ids), Chat.is_group == False)
            .all()
        )

        for chat in existing_chat:
            participants = db.query(ChatParticipant).filter(ChatParticipant.chat_id == chat.id).all()
            participant_ids = sorted([p.user_id for p in participants])

            if participant_ids == sorted([current_user.id, data.user_id]):
                return build_chat_response(new_chat, db)

    # Создаём новый чат
    new_chat = Chat(
        title=None,
        is_group=False,
        created_by=current_user.id
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    participant_1 = ChatParticipant(chat_id=new_chat.id, user_id=current_user.id)
    participant_2 = ChatParticipant(chat_id=new_chat.id, user_id=data.user_id)

    db.add(participant_1)
    db.add(participant_2)
    db.commit()

    return new_chat

@router.post("/group", response_model=ChatResponse)
def create_group_chat(
    data: CreateGroupChat,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    participant_ids = list(set(data.participant_ids))

    if current_user.id not in participant_ids:
        participant_ids.append(current_user.id)

    users = db.query(User).filter(User.id.in_(participant_ids)).all()

    if len(users) != len(participant_ids):
        raise HTTPException(status_code=404, detail="One or more users not found")

    new_chat = Chat(
        title=data.title,
        is_group=True,
        created_by=current_user.id
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    for user_id in participant_ids:
        participant = ChatParticipant(chat_id=new_chat.id, user_id=user_id)
        db.add(participant)

    db.commit()

    return create_group_chat

@router.get("/", response_model=list[ChatResponse])
def get_my_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    participant_rows = db.query(ChatParticipant).filter(
        ChatParticipant.user_id == current_user.id
    ).all()

    chat_ids = [row.chat_id for row in participant_rows]

    if not chat_ids:
        return []

    chats = db.query(Chat).filter(Chat.id.in_(chat_ids)).order_by(Chat.created_at.desc()).all()
    return [build_chat_response(chat, db) for chat in chats]

def build_chat_response(chat: Chat, db: Session):
    participants = (
        db.query(User)
        .join(ChatParticipant, ChatParticipant.user_id == User.id)
        .filter(ChatParticipant.chat_id == chat.id)
        .all()
    )

    last_message = (
        db.query(Message)
        .filter(Message.chat_id == chat.id)
        .order_by(Message.created_at.desc())
        .first()
    )

    return {
        "id": chat.id,
        "title": chat.title,
        "is_group": chat.is_group,
        "created_by": chat.created_by,
        "participants": participants,
        "last_message": last_message,
    }