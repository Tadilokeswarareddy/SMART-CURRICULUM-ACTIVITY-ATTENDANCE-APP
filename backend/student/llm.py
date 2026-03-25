import google.generativeai as genai
from django.conf import settings
import json
import re



genai.configure(api_key=settings.GEMINI_API_KEY, transport='rest')

# Use a confirmed model name like gemini-1.5-flash or gemini-2.0-flash
MODEL = genai.GenerativeModel(
    model_name="gemini-2.5-flash-lite", 
    generation_config={"response_mime_type": "application/json"}
)

# llm.py

PROMPT = """
Generate FIVE unique, useful tasks for a college student that take 10–20 minutes each.
Return a JSON array of objects. Each object must have these keys: 
"title", "description", and "duration" (as an integer).
"""

def generate_task_from_llm():
    try:
        print("🚀 Calling Gemini for 5 tasks...")
        response = MODEL.generate_content(
            PROMPT,
            request_options={"timeout": 30} 
        )
        
        # Clean text logic (same as before)
        clean_text = response.text
        if "```json" in clean_text:
            clean_text = re.search(r'```json\n(.*?)\n```', clean_text, re.DOTALL).group(1)
        
        tasks_data = json.loads(clean_text.strip())
        # Ensure it returns a list even if Gemini trips up
        return tasks_data if isinstance(tasks_data, list) else [tasks_data]

    except Exception as e:
        print(f"❌ Gemini Error: {str(e)}")
        # Return a list of 1 fallback task if API fails
        return [{
            "title": "Quick Productivity Review",
            "description": "Clean your digital desktop and organize your files.",
            "duration": 10,
        }]