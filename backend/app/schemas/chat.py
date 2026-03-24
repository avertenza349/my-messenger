from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class CreatePrivateChat(BaseModel):
    user_id: int


class CreateGroupChat(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    participant_ids: List[int]


class ChatParticipantSchema(BaseModel):
    id: int
    username: Optional[str] = None
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class LastMessageSchema(BaseModel):
    id: int
    sender_id: int
    content: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    id: int
    title: Optional[str]
    is_group: bool
    created_by: int
    participants: List[ChatParticipantSchema]
    last_message: Optional[LastMessageSchema] = None

    class Config:
        from_attributes = True