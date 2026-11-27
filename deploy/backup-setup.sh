#!/usr/bin/env bash
# DB 백업을 처음 켠다(OPS-005). deploy 계정으로 저장소 루트에서 한 번 실행한다:
#   bash deploy/backup-setup.sh
# 1) pgBackRest 이미지로 postgres를 다시 만든다(수 초 중단) 2) R2에 stanza를 만든다
# 3) WAL 보관을 켠다(ALTER SYSTEM, 재시작) 4) check·첫 전체 백업 5) systemd 타이머를 설치한다.
set -euo pipefail
cd "$(dirname "$0")/.."
. deploy/backup-lib.sh

for k in R2_ENDPOINT R2_BUCKET R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY BACKUP_CIPHER_PASS DISCORD_WEBHOOK_URL; do
  [ -n "$(env_value "$k")" ] || { echo "$ENV_FILE에 $k가 비어 있다." >&2; exit 1; }
done

"${COMPOSE[@]}" build postgres
"${COMPOSE[@]}" up -d postgres
until "${COMPOSE[@]}" exec -T postgres pg_isready -U alkkagi -d alkkagi > /dev/null 2>&1; do sleep 2; done

pgbr stanza-create
psql_q "ALTER SYSTEM SET archive_mode = 'on'"
psql_q "ALTER SYSTEM SET archive_command = 'pgbackrest --stanza=$STANZA archive-push %p'"
# 1분 동안 변경이 있으면 WAL 조각을 닫아 보낸다. 변경이 없으면 보내지 않는다.
psql_q "ALTER SYSTEM SET archive_timeout = '60s'"
"${COMPOSE[@]}" restart postgres
until "${COMPOSE[@]}" exec -T postgres pg_isready -U alkkagi -d alkkagi > /dev/null 2>&1; do sleep 2; done
[ "$(psql_q 'show archive_mode')" = on ]

pgbr check
bash deploy/backup.sh full

sudo install -m 644 deploy/systemd/alkkagi-backup@.service deploy/systemd/alkkagi-backup-*.service deploy/systemd/alkkagi-backup-*.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now alkkagi-backup-full.timer alkkagi-backup-diff.timer alkkagi-backup-check.timer
systemctl list-timers 'alkkagi-*' --no-pager
notify "DB 백업을 켰다(WAL 60초, 매주 전체·매일 차등, 전체 4개 보관). 이 알림이 보이면 알림 경로도 정상이다."
