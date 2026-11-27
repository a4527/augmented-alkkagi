#!/usr/bin/env bash
# WAL 보관 상태를 확인한다(OPS-005). systemd 타이머가 10분마다 부른다.
# 마지막 실패가 마지막 성공보다 늦으면 지금 보관이 실패 중이다. 실패 시작과 복구 때 한 번씩만 알린다.
set -uo pipefail
. "$(dirname "$0")/backup-lib.sh"
STATE="$ALKKAGI_HOME/backup-check.state"
# psql -c는 여러 문장 중 마지막 결과만 돌려주므로 나눠 묻는다.
mode=$(psql_q "show archive_mode" 2>&1) && row=$(psql_q "select coalesce(last_failed_time > coalesce(last_archived_time, 'epoch'), false), last_archived_wal, last_archived_time, failed_count from pg_stat_archiver" 2>&1) || {
  notify "WAL 보관 상태를 읽지 못했다: $(printf '%s' "${row:-$mode}" | head -1)"; exit 1; }
failing=$(printf '%s' "$row" | cut -d'|' -f1)
prev=$(cat "$STATE" 2>/dev/null || echo ok)
if [ "$mode" != on ]; then
  echo "archive_mode=$mode (백업 설정 전)"; exit 0
fi
if [ "$failing" = t ]; then
  [ "$prev" = failing ] || notify "WAL 보관 실패 중: $row"
  echo failing > "$STATE"; exit 1
fi
[ "$prev" = failing ] && notify "WAL 보관 복구됨: $row"
echo ok > "$STATE"
echo "WAL 보관 정상: $row"
