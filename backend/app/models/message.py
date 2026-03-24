from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, String
from datetime import datetime
from app.db import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=True)
    message_type = Column(String, nullable=False, default="text")
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)