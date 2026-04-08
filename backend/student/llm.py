import google.generativeai as genai
from django.conf import settings
import json, re, base64, mimetypes

genai.configure(api_key=settings.GEMINI_API_KEY, transport='rest')

MODEL = genai.GenerativeModel(
    model_name="gemini-2.0-flash-lite",
    generation_config={"response_mime_type": "application/json"}
)

PROMPT = """
You are an expert Senior Software Engineer. Generate 5 highly technical, hands-on coding tasks for a Computer Science student.
Each task must be a mini-programming challenge that takes 15-30 minutes.

Focus on these areas:
- Algorithms & Data Structures
- REST API Design
- Database Query Optimization (SQL)
- Frontend State Management
- Basic DevOps/Git workflows

Return a JSON array of objects with keys: "title", "description", "duration".
The description must include a specific "Submission Requirement" (e.g., "Upload the Python script" or "Paste the SQL query").
"""

def generate_task_from_llm():
    try:
        response = MODEL.generate_content(PROMPT, request_options={"timeout": 30})
        clean_text = response.text
        if "```json" in clean_text:
            clean_text = re.search(r'```json\n(.*?)\n```', clean_text, re.DOTALL).group(1)
        tasks_data = json.loads(clean_text.strip())
        return tasks_data if isinstance(tasks_data, list) else [tasks_data]
    except Exception as e:
        print(f"Gemini Error: {str(e)}")
        return [{"title": "Quick Productivity Review", "description": "Clean your digital desktop and organize your files.", "duration": 10}]


def review_submission_with_gemini(file_bytes: bytes, mime_type: str, task_title: str, task_description: str) -> float:
    """
    Send the submitted file to Gemini along with the task context.
    Returns a score out of 10.
    """
    review_model = genai.GenerativeModel(model_name="gemini-2.0-flash-lite")

    prompt = f"""
You are a strict but fair university professor grading a student submission.

Task Title: {task_title}
Task Description: {task_description}

The student has submitted the file above as their answer.

Grade this submission out of 10 based on:
- Correctness and completeness
- Code quality or clarity (if applicable)
- How well it addresses the task requirements

Respond ONLY with a JSON object like this: {{"score": 7.5}}
Do not include any explanation, markdown, or extra text.
"""

    # Encode file as base64 inline part
    encoded = base64.b64encode(file_bytes).decode("utf-8")

    response = review_model.generate_content([
        {
            "role": "user",
            "parts": [
                {
                    "inline_data": {
                        "mime_type": mime_type,
                        "data": encoded,
                    }
                },
                {"text": prompt}
            ]
        }
    ])

    try:
        raw = response.text.strip()
        raw = re.sub(r"```json|```", "", raw).strip()
        result = json.loads(raw)
        score = float(result.get("score", 0))
        return max(0.0, min(10.0, score))  # clamp between 0-10
    except Exception as e:
        print(f"Gemini review parse error: {e}")
        return 0.0