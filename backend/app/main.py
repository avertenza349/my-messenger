from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db import Base, engine
from app.models.chat import Chat, ChatParticipant
from app.models.contact import Contact
from app.models.message import Message
from app.models.user import User
from app.routes.auth import router as auth_router
from app.routes.chats import router as chats_router
from app.routes.messages import router as messages_router
from app.routes.users import router as users_router
from app.routes.ws import router as ws_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(chats_router)
app.include_router(messages_router)
app.include_router(ws_router)


@app.get("/")
def read_root():
    return {"message": "Messenger backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}