# ============================================================
# app/services/chatbot_service.py
# OpenRouter AI Chatbot Service
# ============================================================

import requests
from app.core.config import settings

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

SYSTEM_PROMPT = """
You are HealthAI Assistant, a helpful and empathetic AI healthcare companion.

Your role:
- Answer health and medical questions clearly and concisely
- Provide general health information and wellness tips
- Help users understand symptoms and medical terms
- Guide users to seek professional medical help when needed

Rules:
- Keep responses concise (2-4 sentences max)
- Always be empathetic and supportive
- Never diagnose definitively
- Suggest consulting a doctor for serious concerns
- Stay focused on health topics
- Be friendly and conversational

Always add:
"This is not a substitute for professional medical advice."
when discussing serious medical topics.
"""


def get_chat_response(user_message: str) -> str:
    """
    Sends user message to OpenRouter AI and returns AI response.
    """

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Health Assistant",
    }

    payload = {
        "model": "openai/gpt-oss-20b:free",
        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": user_message
            }
        ],
        "max_tokens": 300,
        "temperature": 0.7,
    }

    try:
        response = requests.post(
            OPENROUTER_API_URL,
            headers=headers,
            json=payload,
            timeout=30,
        )

        response.raise_for_status()

        data = response.json()

        return data["choices"][0]["message"]["content"]

    except Exception as e:
        raise RuntimeError(f"OpenRouter API error: {str(e)}")