import os
import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.contact import Contact
from app.models.user import User
from app.schemas.user import ContactCreate, UserResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = BASE_DIR / "uploads" / "avatars"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/me/avatar", response_model=UserResponse)
def upload_my_avatar(
    avatar: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not avatar.content_type or not avatar.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Можно загружать только изображения")

    ext = Path(avatar.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Разрешены только: .jpg, .jpeg, .png, .webp, .gif",
        )

    filename = f"user_{current_user.id}_{uuid4().hex}{ext}"
    file_path = UPLOADS_DIR / filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(avatar.file, buffer)

    # удаляем старый файл, если он был загружен ранее
    if current_user.avatar_url:
        old_name = Path(current_user.avatar_url).name
        old_path = UPLOADS_DIR / old_name
        if old_path.exists():
            try:
                old_path.unlink()
            except OSError:
                pass

    current_user.avatar_url = f"/uploads/avatars/{filename}"
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return current_user


@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = (
        db.query(User)
        .filter(User.id != current_user.id)
        .order_by(User.username.asc())
        .all()
    )
    return users


@router.get("/contacts", response_model=list[UserResponse])
def get_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contacts = (
        db.query(User)
        .join(Contact, Contact.contact_user_id == User.id)
        .filter(Contact.owner_user_id == current_user.id)
        .order_by(User.username.asc())
        .all()
    )
    return contacts


@router.post("/contacts", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def add_contact(
    data: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_to_add = db.query(User).filter(User.email == data.email).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="Пользователь с такой почтой не найден")

    if user_to_add.id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя добавить себя в контакты")

    existing_contact = (
        db.query(Contact)
        .filter(
            Contact.owner_user_id == current_user.id,
            Contact.contact_user_id == user_to_add.id,
        )
        .first()
    )
    if existing_contact:
        raise HTTPException(status_code=400, detail="Пользователь уже есть в контактах")

    contact = Contact(
        owner_user_id=current_user.id,
        contact_user_id=user_to_add.id,
    )
    db.add(contact)
    db.commit()

    return user_to_add


@router.delete("/contacts/{contact_user_id}")
def remove_contact(
    contact_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = (
        db.query(Contact)
        .filter(
            Contact.owner_user_id == current_user.id,
            Contact.contact_user_id == contact_user_id,
        )
        .first()
    )

    if not contact:
        raise HTTPException(status_code=404, detail="Контакт не найден")

    db.delete(contact)
    db.commit()

    return {"ok": True, "message": "Контакт удалён"}