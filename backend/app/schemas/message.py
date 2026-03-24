from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class CreateMessage(BaseModel):
    content: str = Field(min_length=1, max_length=5000)


class MessageResponse(BaseModel):
    id: int
    chat_id: int
    sender_id: int
    content: Optional[str]
    message_type: str
    image_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True