#!/usr/bin/env bash
# run_all_tests.sh — Run all OneProductIQ service tests
# Usage: bash scripts/run_all_tests.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=============================================="
echo "  OneProductIQ — Full Service Test Suite"
echo "=============================================="
echo ""

run_test() {
    local name="$1"
    local script="$2"
    echo ""
    echo "▶ Running: $name"
    echo "----------------------------------------------"
    python3 "$ROOT_DIR/scripts/$script"
    echo ""
}

run_test "MongoDB"  "test_mongodb.py"
run_test "ChromaDB" "test_chromadb.py"
run_test "vLLM"     "test_vlm.py"

echo "=============================================="
echo "  ✅ All tests completed!"
echo "=============================================="
