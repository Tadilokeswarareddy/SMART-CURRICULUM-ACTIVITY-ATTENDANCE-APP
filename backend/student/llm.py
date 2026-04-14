import json, re, base64, random, requests
from django.conf import settings

# --- APRIL 2026 STABLE CONFIG ---
MODEL_ID = "gemini-2.5-flash"

# Always use v1beta — supports responseMimeType + newer features
API_URL      = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_ID}:generateContent?key={settings.GEMINI_API_KEY}"
REVIEW_URL   = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_ID}:generateContent?key={settings.GEMINI_API_KEY}"

FALLBACK_TASK_POOLS = [
    [
        {"title": "Reverse a Linked List",   "description": "Implement a function that reverses a singly linked list in-place. Submission: Upload .py or .js file.", "duration": 20},
        {"title": "Build a REST API",         "description": "Create a GET /products endpoint. Submission: Upload views file.", "duration": 25},
        {"title": "SQL Optimization",         "description": "Rewrite a slow JOIN query. Submission: Upload .sql file.", "duration": 15},
        {"title": "React useReducer",         "description": "Build a counter component using useReducer. Submission: Upload .jsx file.", "duration": 20},
        {"title": "Git Workflow",             "description": "Resolve a merge conflict. Submission: Upload git log.", "duration": 15},
    ]
]


def generate_task_from_llm():
    prompt = """
    Generate 5 coding tasks for a CS student.
    Return ONLY a JSON array of objects with keys: "title", "description", "duration".
    The "duration" MUST be a plain number (minutes). No markdown, no backticks.
    """
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        print(f"--- AI CALL: {MODEL_ID} ---")
        response = requests.post(API_URL, json=payload, timeout=20)

        if response.status_code != 200:
            print(f"AI ERROR: {response.status_code} — {response.text[:200]}")
            return random.choice(FALLBACK_TASK_POOLS)

        res_data = response.json()
        if 'candidates' not in res_data:
            print("AI ERROR: no candidates in response")
            return random.choice(FALLBACK_TASK_POOLS)

        raw_text = res_data['candidates'][0]['content']['parts'][0]['text']
        clean = re.sub(r'```json|```', '', raw_text).strip()
        match = re.search(r'\[.*\]', clean, re.DOTALL)
        tasks = json.loads(match.group(0)) if match else json.loads(clean)

        final_tasks = []
        for t in tasks[:5]:
            raw_duration   = str(t.get("duration", "20"))
            clean_duration = re.search(r'\d+', raw_duration)
            duration_val   = int(clean_duration.group(0)) if clean_duration else 20
            final_tasks.append({
                "title":       t.get("title",       "Coding Task"),
                "description": t.get("description", "Complete the task."),
                "duration":    duration_val,
            })

        print(f"AI SUCCESS: {len(final_tasks)} tasks ready.")
        return final_tasks

    except Exception as e:
        print(f"AI SCRUBBER ERROR: {str(e)}")
        return random.choice(FALLBACK_TASK_POOLS)


def review_submission_with_gemini(
    file_bytes: bytes,
    mime_type: str,
    task_title: str,
    task_description: str,
) -> tuple:
    try:
        encoded_file = base64.b64encode(file_bytes).decode("utf-8")

        prompt = f"""
You are a strict technical grader for a university CS course.

TASK TITLE: {task_title}
TASK DESCRIPTION: {task_description}

GRADING INSTRUCTIONS — follow every step in order:

STEP 1 — IDENTIFY CONTENT
Look at the uploaded image/file carefully.
Is this a programming environment? (VS Code, terminal, code editor, syntax highlighting, line numbers)

STEP 2 — DETECT CHEATING
Is this a non-programming app? (Swiggy, Zomato, Instagram, WhatsApp, games, photos, memes, social media)
If YES → score is 0.0. Stop here.

STEP 3 — MATCH TO TASK
Does the code visible relate to the task "{task_title}"?
- If it is programming content but completely the wrong task → score 1.0–3.0
- If it is the right context but incomplete or has errors → score 4.0–7.0
- If it clearly and correctly solves "{task_title}" → score 8.0–10.0

STEP 4 — OUTPUT
Return ONLY a raw JSON object. No markdown, no backticks, no explanation outside the JSON.

{{
  "is_code": true or false,
  "content_summary": "one sentence describing exactly what you see",
  "score": 0.0,
  "reason": "one sentence explaining the score",
  "remark": "2-3 words of feedback shown to the student, e.g. 'Good linked list', 'Wrong task uploaded', 'Incomplete solution', 'Excellent work'"
}}
"""

        payload = {
            "contents": [{
                "parts": [
                    {"inlineData": {"mimeType": mime_type, "data": encoded_file}},
                    {"text": prompt},
                ]
            }],
            "generationConfig": {
                "temperature": 0.0,
                "responseMimeType": "application/json",
            },
        }

        response = requests.post(REVIEW_URL, json=payload, timeout=30)

        if response.status_code != 200:
            print(f"REVIEW API ERROR: {response.status_code} — {response.text[:200]}")
            return _fallback_score(file_bytes, mime_type)

        res_data = response.json()

        if 'candidates' not in res_data or not res_data['candidates']:
            print("REVIEW ERROR: no candidates")
            return _fallback_score(file_bytes, mime_type)

        text_out = res_data['candidates'][0]['content']['parts'][0]['text']

        # Strip any accidental markdown fences
        clean = re.sub(r'```json|```', '', text_out).strip()
        result = json.loads(clean)

        score = float(result.get("score", 0))
        score = max(0.0, min(10.0, score))  # Clamp to [0, 10]
        remark = result.get("remark", "")

        print(f"\n--- AI GRADER DEBUG ---")
        print(f"Content : {result.get('content_summary')}")
        print(f"Reason  : {result.get('reason')}")
        print(f"Remark  : {remark}")
        print(f"Score   : {score}")
        print(f"-----------------------\n")

        return score, remark  

    except json.JSONDecodeError as e:
        print(f"JSON PARSE ERROR in grader: {e}")
        return _fallback_score(file_bytes, mime_type)
    except Exception as e:
        print(f"REVIEW ERROR: {str(e)}")
        return _fallback_score(file_bytes, mime_type)


def _fallback_score(file_bytes: bytes, mime_type: str) -> tuple:
    """Heuristic scoring when AI is unavailable."""
    size = len(file_bytes)
    if mime_type == "text/plain":
        return (7.0, "Looks reasonable") if size > 150 else (4.5, "Too short")
    if size < 10_000:  return (4.0, "File too small")
    if size < 100_000: return (6.5, "Partial submission")
    return (8.0, "Good file size")