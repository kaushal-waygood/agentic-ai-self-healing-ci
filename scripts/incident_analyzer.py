#!/usr/bin/env python3
import json
import os
import re
from datetime import datetime

# ─────────── CONFIG ───────────
TEST_LOG_PATH = "backend/tests/output/jest-report.html"  # or any log path
OUTPUT_FILE = "analysis.json"
CRITICAL_ENV_VARS = ["NODE_ENV", "MONGO_URL"]

# ─────────── HELPERS ───────────
def load_test_log():
    if not os.path.exists(TEST_LOG_PATH):
        return None
    with open(TEST_LOG_PATH, "r", encoding="utf-8") as f:
        return f.read()

def detect_missing_env_vars():
    missing = []
    for var in CRITICAL_ENV_VARS:
        if not os.environ.get(var):
            missing.append(var)
    return missing

def detect_failed_tests(log_content):
    """
    Returns a list of failed test cases extracted from jest HTML or console log.
    """
    failed_tests = []

    # Example: look for 'FAIL tests/...'
    pattern = re.compile(r"FAIL\s+([^\s]+)")
    matches = pattern.findall(log_content or "")
    for match in matches:
        failed_tests.append(match)

    return failed_tests

def detect_error_messages(log_content):
    """
    Collect common error messages from logs.
    """
    errors = []
    if not log_content:
        return errors

    # Capture console.error or uncaught exceptions
    for line in log_content.splitlines():
        if "❌" in line or "Error" in line or "Exception" in line:
            errors.append(line.strip())
    return errors

# ─────────── MAIN ───────────
def main():
    report = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "status": "passed",
        "failed_tests": [],
        "missing_env_vars": [],
        "errors": [],
        "summary": ""
    }

    log_content = load_test_log()

    # Detect missing env vars
    report["missing_env_vars"] = detect_missing_env_vars()
    if report["missing_env_vars"]:
        report["status"] = "failed"

    # Detect failed tests
    report["failed_tests"] = detect_failed_tests(log_content)
    if report["failed_tests"]:
        report["status"] = "failed"

    # Detect errors
    report["errors"] = detect_error_messages(log_content)
    if report["errors"]:
        report["status"] = "failed"

    # Summary
    summary = []
    if report["missing_env_vars"]:
        summary.append(f"Missing env vars: {', '.join(report['missing_env_vars'])}")
    if report["failed_tests"]:
        summary.append(f"Failed tests: {', '.join(report['failed_tests'])}")
    if report["errors"]:
        summary.append(f"Errors: {len(report['errors'])} error(s) detected")

    report["summary"] = " | ".join(summary) if summary else "No issues detected ✅"

    # Write JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"✅ Incident analysis saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
