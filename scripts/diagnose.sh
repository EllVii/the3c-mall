#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "== Manifest checks =="
if [[ -f public/manifest.json ]]; then
  if command -v python3 >/dev/null 2>&1; then
    if python3 -m json.tool public/manifest.json >/dev/null 2>&1; then
      echo "manifest.json: valid JSON"
    else
      echo "manifest.json: INVALID JSON"
    fi
  else
    echo "python3 not available; skipped JSON validation"
  fi
else
  echo "manifest.json: missing at public/manifest.json"
fi

echo
if [[ -f index.html ]]; then
  manifest_links=$(grep -n "<link rel=\"manifest\"" index.html || true)
  manifest_count=$(printf "%s" "$manifest_links" | grep -c "manifest" || true)
  echo "index.html: manifest link count = ${manifest_count}"
  if [[ -n "$manifest_links" ]]; then
    echo "$manifest_links"
  fi
  if grep -n "manifest.webmanifest" index.html >/dev/null 2>&1; then
    echo "index.html: references manifest.webmanifest (file not in public/)"
  fi
else
  echo "index.html: missing"
fi

echo

echo "== Supabase env checks =="
if [[ -f server/.env ]]; then
  if grep -E -q "^SUPABASE_URL=.+$" server/.env; then
    echo "server/.env: SUPABASE_URL set"
  else
    echo "server/.env: SUPABASE_URL missing or empty"
  fi

  if grep -E -q "^SUPABASE_SERVICE_ROLE_KEY=.+$" server/.env; then
    echo "server/.env: SUPABASE_SERVICE_ROLE_KEY set"
  else
    echo "server/.env: SUPABASE_SERVICE_ROLE_KEY missing or empty"
  fi
else
  echo "server/.env: missing"
fi

echo

echo "== Supabase health endpoint =="
echo "Run: curl -s http://localhost:3001/api/health/supabase"
