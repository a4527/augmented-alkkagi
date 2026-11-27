#!/usr/bin/env bash
# 새 VM(Ubuntu 24.04 LTS) 초기 설정(OPS-004). 주문 때 등록한 SSH 키로 root 접속한 뒤 한 번 실행한다:
#   bash vm-setup.sh <운영 계정 이름>
# 하는 일: 패키지 갱신·자동 보안 업데이트, 운영 계정(sudo·docker), SSH 키 로그인만 허용,
# 스왑 2GB, Docker(공식 저장소), Docker 로그 순환, ufw(22 전체·443 Cloudflare 대역만), 작업 폴더.
# 여러 번 실행해도 결과가 같게 만든다. 값·비밀은 다루지 않는다.
set -euo pipefail

DEPLOY_USER=${1:?운영 계정 이름을 인자로 준다(예: deploy)}
ALKKAGI_HOME=/opt/alkkagi
HERE=$(cd "$(dirname "$0")" && pwd)

if [ "$(id -u)" -ne 0 ]; then echo "root로 실행한다." >&2; exit 1; fi
if [ ! -s /root/.ssh/authorized_keys ]; then
  echo "/root/.ssh/authorized_keys가 비어 있다. 키 없이 비밀번호 로그인을 끄면 잠긴다." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get -y upgrade
apt-get -y install ca-certificates curl git ufw unattended-upgrades

# 자동 보안 업데이트(매일 목록 갱신·보안 업데이트 설치). 커널 갱신의 재부팅은 수동으로 한다.
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'CONF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
CONF
systemctl enable --now unattended-upgrades

# 운영 계정: root의 키를 복사하고 sudo를 준다.
if ! id "$DEPLOY_USER" > /dev/null 2>&1; then
  adduser --disabled-password --gecos '' "$DEPLOY_USER"
fi
usermod -aG sudo "$DEPLOY_USER"
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
install -m 600 -o "$DEPLOY_USER" -g "$DEPLOY_USER" /root/.ssh/authorized_keys "/home/$DEPLOY_USER/.ssh/authorized_keys"
# 키 로그인이라 sudo 비밀번호가 없다. 운영 계정만 비밀번호 없이 sudo를 쓴다.
echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/90-$DEPLOY_USER"
chmod 440 "/etc/sudoers.d/90-$DEPLOY_USER"
visudo -cf "/etc/sudoers.d/90-$DEPLOY_USER"

# SSH: 키 로그인만, root는 키로만. sshd는 같은 항목의 첫 값을 쓰고 HostHatch 이미지에
# 01-hosthatch.conf(PermitRootLogin yes)가 있으므로 그보다 먼저 읽히는 00-으로 둔다.
rm -f /etc/ssh/sshd_config.d/10-alkkagi.conf
cat > /etc/ssh/sshd_config.d/00-alkkagi.conf <<'CONF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
PubkeyAuthentication yes
CONF
sshd -t
systemctl reload ssh
# 실제로 적용된 값을 확인한다. 다르면 여기서 멈춘다.
effective=$(sshd -T | grep -E '^(passwordauthentication|kbdinteractiveauthentication|permitrootlogin) ' | sort)
expected=$'kbdinteractiveauthentication no\npasswordauthentication no\npermitrootlogin without-password'
if [ "$effective" != "$expected" ]; then
  echo "SSH 설정이 기대와 다르다:" >&2
  echo "$effective" >&2
  exit 1
fi

# 스왑 2GB: 이미지 빌드·순간 메모리 증가로 OOM이 나지 않게 한다.
if ! swapon --show | grep -q '/swapfile'; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
echo 'vm.swappiness=10' > /etc/sysctl.d/90-alkkagi.conf
sysctl --system > /dev/null

# Docker 공식 저장소(docs.docker.com/engine/install/ubuntu).
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'CONF'
{ "log-driver": "json-file", "log-opts": { "max-size": "10m", "max-file": "3" } }
CONF
systemctl enable docker
systemctl restart docker
usermod -aG docker "$DEPLOY_USER"

# 방화벽: 기본 거부, SSH는 어디서나(키만 허용), 443은 Cloudflare 대역만.
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw --force enable

# 작업 폴더: 인증서·비밀 환경 파일은 저장소 밖에 둔다.
install -d -m 755 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$ALKKAGI_HOME"
install -d -m 700 "$ALKKAGI_HOME/certs"
install -d -m 755 "$ALKKAGI_HOME/caddy"
ALKKAGI_HOME=$ALKKAGI_HOME bash "$HERE/cloudflare-ips.sh"

echo
echo "완료. 새 터미널에서 ssh $DEPLOY_USER@<서버 IP> 로그인이 되는지 확인한 뒤 이 root 세션을 닫는다."
ufw status verbose
