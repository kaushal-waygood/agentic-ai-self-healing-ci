import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_fix(logs):
    prompt = f"""
You are a senior DevOps engineer.

Analyze this CI failure log and:
1. Identify root cause
2. Suggest exact code fix
3. Output JSON:
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

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content


if __name__ == "__main__":
    logs = open("analysis.json").read() if os.path.exists("analysis.json") else "No logs"

    result = generate_fix(logs)

    with open("fix.json", "w") as f:
        f.write(result)
