#!/usr/bin/env bash
# 복구 연습(OPS-005, 월 1회). R2 백업을 임시 컨테이너에 복구해 운영 DB와 비교한다. 운영 DB는 건드리지 않는다.
#   bash deploy/restore-drill.sh                       # 가장 최근 시점까지
#   bash deploy/restore-drill.sh '2026-11-27 08:00:00+00' # 그 시점까지(시점 복구)
# 복구한 인스턴스는 WAL 보관을 끈다(archive_mode=off). 운영 백업 저장소에 다른 이력을 올리지 않게 하려는 것이다.
set -euo pipefail
cd "$(dirname "$0")/.."
. deploy/backup-lib.sh
target=${1:-}
NAME=alkkagi-restore-drill
IMAGE=alkkagi-postgres:local

# 값은 프로세스 인자에 싣지 않고 환경으로 넘긴다.
export PGBACKREST_REPO1_S3_ENDPOINT=$(env_value R2_ENDPOINT)
export PGBACKREST_REPO1_S3_BUCKET=$(env_value R2_BUCKET)
export PGBACKREST_REPO1_S3_KEY=$(env_value R2_ACCESS_KEY_ID)
export PGBACKREST_REPO1_S3_KEY_SECRET=$(env_value R2_SECRET_ACCESS_KEY)
export PGBACKREST_REPO1_CIPHER_PASS=$(env_value BACKUP_CIPHER_PASS)
ENVS=(-e PGBACKREST_REPO1_S3_ENDPOINT -e PGBACKREST_REPO1_S3_BUCKET -e PGBACKREST_REPO1_S3_KEY -e PGBACKREST_REPO1_S3_KEY_SECRET -e PGBACKREST_REPO1_CIPHER_PASS)

cleanup() { docker rm -f "$NAME" > /dev/null 2>&1 || true; docker volume rm "$NAME" > /dev/null 2>&1 || true; }
cleanup
trap cleanup EXIT

start=$(date +%s)
opts=()
[ -n "$target" ] && opts=(--type=time "--target=$target" --target-action=promote)
docker volume create "$NAME" > /dev/null
docker run --rm "${ENVS[@]}" -u postgres -v "$NAME:/var/lib/postgresql/data" "$IMAGE" \
  pgbackrest --stanza="$STANZA" restore "${opts[@]}"
docker run -d --name "$NAME" "${ENVS[@]}" -e POSTGRES_PASSWORD=unused -v "$NAME:/var/lib/postgresql/data" "$IMAGE" \
  postgres -c archive_mode=off > /dev/null
q() { docker exec "$NAME" psql -U alkkagi -d alkkagi -Atc "$1" 2>/dev/null; }
for _ in $(seq 1 150); do
  [ "$(q 'select pg_is_in_recovery()')" = f ] && break
  sleep 2
done
[ "$(q 'select pg_is_in_recovery()')" = f ] || { echo "복구가 끝나지 않았다." >&2; docker logs --tail 20 "$NAME" >&2; exit 1; }
elapsed=$(( $(date +%s) - start ))

SQL="select count(*), coalesce(sum(total_games),0), coalesce(sum(wins),0), coalesce(sum(losses),0) from users"
restored=$(q "$SQL")
live=$(psql_q "$SQL")
last=$(q "select coalesce(max(id), 0) from users")
echo "복구 시점: ${target:-최신}"
echo "복구 소요: ${elapsed}초"
echo "users(수|경기|승|패) 복구본: $restored / 운영: $live"
echo "복구본의 마지막 사용자 번호: $last / 운영: $(psql_q "select coalesce(max(id), 0) from users")"
