# ============================================================
# app/api/routes/chatbot.py
# Chatbot API Route — JWT Protected
# ============================================================

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.chatbot_service import get_chat_response

router = APIRouter(
    prefix="/api/v1/chatbot",
    tags=["Chatbot"],
)


class ChatRequest(BaseModel):
    message: str

    class Config:
        json_schema_extra = {
            "example": {"message": "What are the symptoms of malaria?"}
        }


class ChatResponse(BaseModel):
    response: str


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Chat with AI Health Assistant",
    description="Send a health-related question and receive an AI-powered response.",
)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    if not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"status": "error", "message": "Message cannot be empty."},
        )

    try:
        reply = get_chat_response(request.message.strip())
        return ChatResponse(response=reply)

    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"status": "error", "message": str(e)},
        )