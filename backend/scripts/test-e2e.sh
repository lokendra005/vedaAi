#!/usr/bin/env bash
set -euo pipefail
API="${API_URL:-http://localhost:4000}"

echo "=== E2E API Tests ==="

echo "1) Health..."
HEALTH=$(curl -sf "$API/health")
echo "$HEALTH" | head -c 500
MOCK=$(echo "$HEALTH" | grep -o '"mockAi":[^,]*' || true)
if echo "$HEALTH" | grep -q '"mockAi":true'; then
  echo "FAIL: mockAi still true"
  exit 1
fi
if echo "$HEALTH" | grep -q '"llmReachable":false'; then
  echo "FAIL: LLM not reachable"
  exit 1
fi
echo " OK"

DUE=$(date -u -v+7d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '+7 days' +%Y-%m-%dT%H:%M:%SZ)

echo "2) Create assignment..."
CREATE=$(curl -sf -X POST "$API/api/assignments" \
  -F "title=Groq E2E Test" \
  -F "subject=Chemistry" \
  -F "grade=10" \
  -F "dueDate=$DUE" \
  -F 'questionTypes=["MCQ"]' \
  -F "totalQuestions=3" \
  -F "marksPerQuestion=2" \
  -F 'difficulty={"easy":34,"medium":33,"hard":33}')
ID=$(echo "$CREATE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo " Assignment ID: $ID"

echo "3) Poll until completed (max 60s)..."
for i in $(seq 1 30); do
  sleep 2
  DATA=$(curl -sf "$API/api/assignments/$ID")
  STATUS=$(echo "$DATA" | grep -o '"status":"[^"]*"' | head -1)
  echo "  [$i] $STATUS"
  if echo "$DATA" | grep -q '"status":"completed"'; then
    if echo "$DATA" | grep -q 'Sample question'; then
      echo "FAIL: mock content in completed paper"
      exit 1
    fi
    echo " OK — real paper generated"
    break
  fi
  if echo "$DATA" | grep -q '"status":"failed"'; then
    echo "FAIL: generation failed"
    echo "$DATA"
    exit 1
  fi
  if [ "$i" -eq 30 ]; then
    echo "FAIL: timeout"
    exit 1
  fi
done

echo "4) PDF export..."
CODE=$(curl -sf -o /tmp/veda-e2e.pdf -w "%{http_code}" "$API/api/assignments/$ID/pdf")
file /tmp/veda-e2e.pdf
[ "$CODE" = "200" ] && echo " OK" || exit 1

echo "5) Validation error (past due date)..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/assignments" \
  -F "title=x" -F "subject=x" -F "dueDate=2020-01-01T00:00:00.000Z" \
  -F 'questionTypes=["MCQ"]' -F "totalQuestions=1" -F "marksPerQuestion=1" \
  -F 'difficulty={"easy":100,"medium":0,"hard":0}')
[ "$CODE" = "400" ] && echo " OK (400)" || echo " WARN expected 400 got $CODE"

echo "=== E2E passed ==="
