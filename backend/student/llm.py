import google.generativeai as genai
from django.conf import settings
import json

# Configure the API
genai.configure(api_key=settings.GEMINI_API_KEY)

# Use JSON response_mime_type to ensure Gemini returns ONLY valid JSON
MODEL = genai.GenerativeModel(
    model_name="gemini-2.5-flash-lite",
    generation_config={"response_mime_type": "application/json"}
)

PROMPT = """
Generate ONE useful task for a college student that takes 10–20 minutes.
Return a JSON object with these keys: "title", "description", and "duration" (as an integer).
"""

def generate_task_from_llm():
    print(f"DEBUG: API KEY is {settings.GEMINI_API_KEY[:10]}...")
    try:
        print("🚀 Calling Gemini...")
        
        # Increased timeout to 30s to prevent the DNS/Connection hang
        response = MODEL.generate_content(
            PROMPT,
            request_options={"timeout": 30} 
        )

        # Since we set response_mime_type, response.text is guaranteed to be JSON
        return json.loads(response.text)

    except Exception as e:
        print(f"❌ Gemini Error: {e}")
        # Robust fallback
        return {
            "title": "Quick Productivity Review",
            "description": "Clean your digital desktop and organize your files for 10 minutes.",
            "duration": 10,
        }