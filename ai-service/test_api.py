import requests
import json
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

base_url = "http://localhost:8000/api/v1"
headers = {"X-Inter-Service-Key": "nyaya_supersecret_2026"}

print("========================================")
print("1. TESTING RAG Q&A (/query)")
print("========================================")
try:
    res = requests.post(
        f"{base_url}/query",
        headers=headers,
        json={"question": "What is the punishment for cheating under the BNS?"},
        timeout=30
    )
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print("\nAnswer:\n", data.get("answer"))
        print("\nSources Cited:")
        for s in data.get("sources", []):
            print(f"  - {s.get('act')} Section {s.get('section')}")
    else:
        print(res.text)
except Exception as e:
    print("Error:", e)

print("\n========================================")
print("2. TESTING LEGAL DRAFTING (/draft)")
print("========================================")
try:
    res2 = requests.post(
        f"{base_url}/draft",
        headers=headers,
        json={
            "situation": "My landlord stole my security deposit of 50,000 rupees and refuses to give it back.", 
            "document_type": "Legal Notice"
        },
        timeout=60
    )
    print(f"Status: {res2.status_code}")
    if res2.status_code == 200:
        data2 = res2.json()
        print("\nSimplified Explanation:\n")
        print(data2.get("simplified_explanation"))
        print("\nDraft Preview (first 250 chars):\n")
        print(data2.get("draft")[:250] + "...")
    else:
        print(res2.text)
except Exception as e:
    print("Error:", e)
