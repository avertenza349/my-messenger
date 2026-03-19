from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, TokenResponse
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.email_sender import send_verification_email
from app.config import APP_BASE_URL

from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    generate_verification_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = hash_password(user_data.password)
    verification_token = generate_verification_token()

    new_user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hashed_password,
        is_verified=False,
        verification_token=verification_token
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    verification_link = f"{APP_BASE_URL}/auth/verify-email?token={verification_token}"
    send_verification_email(new_user.email, verification_link)

    return new_user


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before logging in")

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user.is_verified = True
    user.verification_token = None

    db.commit()

    return {"message": "Email successfully verified"}