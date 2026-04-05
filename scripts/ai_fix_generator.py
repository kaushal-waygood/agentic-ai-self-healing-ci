import os
import json
from openai import OpenAI

# Initialize OpenAI client using environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_fix(logs):
    """
    Generates AI-based fixes for CI failures.
    Returns a JSON string with branch_name, commit_message, and file_changes.
    """
    prompt = f"""
You are a senior DevOps engineer.

Analyze this CI failure log and:
1. Identify the root cause
2. Suggest exact code fix
3. Output JSON in the following format:
{{
  "branch_name": "...",
  "commit_message": "...",
  "file_changes": [
    {{
      "file": "path",
      "content": "updated content"
    }}
  ]
}}

Logs:
{logs}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # standard ASCII hyphens
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content

    except Exception as e:
        print("⚠️ OpenAI request failed:", e)
        # Return a safe JSON so CI doesn't break
        return json.dumps({
            "branch_name": "ai-fix-fallback",
            "commit_message": "AI fix skipped due to OpenAI error",
            "file_changes": []
        })


if __name__ == "__main__":
    # Load CI failure logs
    logs = "No logs available"
    if os.path.exists("analysis.json"):
        with open("analysis.json", "r") as f:
            logs = f.read()

    # Generate AI fix
    result = generate_fix(logs)

    # Validate JSON output before writing
    try:
        parsed = json.loads(result)
        with open("fix.json", "w") as f:
            json.dump(parsed, f, indent=2)
        print("✅ AI fix successfully generated and written to fix.json")
    except json.JSONDecodeError:
        print("⚠️ AI output is not valid JSON, writing raw text to fix.json")
        with open("fix.json", "w") as f:
            f.write(result)
