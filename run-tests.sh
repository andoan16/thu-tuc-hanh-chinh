#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "=== BUILD ==="
npm run build 2>&1 | tail -5
echo "=== UNIT TESTS ==="
node --test tests/combobox.test.mjs tests/fee.test.mjs tests/search.test.mjs tests/viewall.test.mjs 2>&1 | tail -20
echo "=== RENDER TESTS ==="
node tests/render.test.mjs 2>&1
echo "=== E2E (headless) ==="
npx vite preview --port 4173 &
PREVIEW_PID=$!
sleep 2
node tests/e2e-headless.mjs 2>&1 || true
kill $PREVIEW_PID 2>/dev/null || true
echo "=== DONE ==="