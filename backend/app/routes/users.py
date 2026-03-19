from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.contact import Contact
from app.models.user import User
from app.schemas.user import ContactCreate, UserResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
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

    return {"message": "Контакт удалён"}