#!/usr/bin/env bash
# Cloudflare IP 대역을 받아 ① ufw에서 443을 그 대역에만 열고 ② Caddy의 신뢰 프록시 목록을 만든다.
# vm-setup.sh가 처음 한 번 부르고, 대역이 바뀌면(Cloudflare 공지) 다시 실행한다. root로 실행한다.
set -euo pipefail

ALKKAGI_HOME=${ALKKAGI_HOME:-/opt/alkkagi}
SNIPPET="$ALKKAGI_HOME/caddy/cloudflare-trusted.caddy"

ranges=$( (curl -fsS https://www.cloudflare.com/ips-v4; echo; curl -fsS https://www.cloudflare.com/ips-v6) | grep -E '^[0-9a-f:.]+/[0-9]+$')
count=$(printf '%s\n' "$ranges" | wc -l)
if [ "$count" -lt 10 ]; then
  echo "Cloudflare IP 대역을 받지 못했다($count개). 바꾸지 않고 끝낸다." >&2
  exit 1
fi

mkdir -p "$(dirname "$SNIPPET")"
printf 'trusted_proxies static %s\n' "$(printf '%s\n' "$ranges" | tr '\n' ' ')" > "$SNIPPET.tmp"
mv "$SNIPPET.tmp" "$SNIPPET"

# 이전에 이 스크립트가 연 443 규칙을 지우고 새 대역으로 다시 연다.
while ufw status numbered | grep -q 'alkkagi-cloudflare'; do
  n=$(ufw status numbered | grep 'alkkagi-cloudflare' | head -1 | sed -E 's/^\[ *([0-9]+)\].*/\1/')
  ufw --force delete "$n" > /dev/null
done
while read -r range; do
  ufw allow proto tcp from "$range" to any port 443 comment 'alkkagi-cloudflare' > /dev/null
done <<< "$ranges"

echo "Cloudflare 대역 ${count}개를 반영했다. Caddy가 떠 있으면 다시 시작한다: docker compose ... restart caddy"
