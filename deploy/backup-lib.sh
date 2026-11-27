# 백업 스크립트 공통(OPS-005). source해서 쓴다.
ALKKAGI_HOME=${ALKKAGI_HOME:-/opt/alkkagi}
ENV_FILE="$ALKKAGI_HOME/.env"
APP_DIR="$ALKKAGI_HOME/app"
COMPOSE=(docker compose --env-file "$ENV_FILE" -f "$APP_DIR/deploy/compose.yaml")
STANZA=alkkagi

# .env에서 한 값만 읽는다(값을 출력하지 않는다).
env_value() { grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2-; }

# 컨테이너 안에서 postgres 사용자로 pgBackRest를 실행한다.
pgbr() { "${COMPOSE[@]}" exec -T -u postgres postgres pgbackrest --stanza="$STANZA" "$@"; }
psql_q() { "${COMPOSE[@]}" exec -T postgres psql -U alkkagi -d alkkagi -Atc "$1"; }

# Discord로 알린다. 주소가 없으면 표준 오류로만 남긴다.
notify() {
  local msg="[playalkkagi] $1" url
  url=$(env_value DISCORD_WEBHOOK_URL)
  echo "$msg" >&2
  [ -n "$url" ] || return 0
  curl -fsS -m 10 -H 'Content-Type: application/json' \
    -d "$(printf '{"content":%s}' "$(printf '%s' "$msg" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))')")" \
    "$url" > /dev/null || echo "Discord 알림 전송 실패" >&2
}
