#!/usr/bin/env bash
# 전체(full)·차등(diff) 백업을 R2에 만든다(OPS-005). systemd 타이머가 부르고 실패하면 Discord로 알린다.
#   bash deploy/backup.sh full|diff
set -uo pipefail
. "$(dirname "$0")/backup-lib.sh"
type=${1:?full 또는 diff}
start=$(date +%s)
if out=$(pgbr --type="$type" backup 2>&1); then
  info=$(pgbr info --output=json 2>/dev/null | python3 -c '
import json, sys
b = json.load(sys.stdin)[0]["backup"][-1]
print(b["label"], "저장", b["info"]["repository"]["delta"] // 1024, "KiB")' 2>/dev/null)
  echo "백업 성공($type, $(( $(date +%s)-start ))초): $info"
else
  notify "DB 백업 실패($type): $(printf '%s' "$out" | grep -E 'ERROR|WARN' | head -3)"
  exit 1
fi
