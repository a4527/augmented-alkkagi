# 증강 알까기 (Augmented Alkkagi)

알까기에 방해요소 시스템을 더한 데스크톱 웹 브라우저용 1:1 온라인 대전 미니프로젝트다.

## 어떤 게임인가

![AI 대전 경기 화면: 장난감 놀이방 테마에서 판을 사이에 두고 상대 캐릭터와 마주 앉은 모습](docs/images/gameplay.jpg)

전통 놀이 알까기를 3D로 옮기고, 상대가 조준하는 동안 상대를 흔들 수 있는 **방해요소**를 더한 1:1 대전 게임이다. 설치 없이 링크 하나로 모여 쉬는 시간에 한 판(10분 이내)씩 가볍게 겨루는 것을 목표로 한다. 스팀 게임 "증강 윷놀이"처럼 익숙한 놀이에 특수 규칙을 더하는 컨셉에서 출발했으며, 상업 출시가 아니라 웹 게임을 직접 만들고 무료 인프라로 배포해 보는 미니프로젝트다.

### 한 판의 흐름

1. 로비에서 방을 만들거나(공개 또는 6자리 코드의 비공개) 방 목록·즉시 참가로 들어간다. 상대가 입장하면 바로 시작한다. 방을 만들 때 AI를 상대로 고를 수도 있다.
2. 내 턴(30초)에 내 알 하나를 끌어 조준하고, 오르내리는 세기 막대에서 버튼을 놓아 튕긴다. 세게 치면 알이 떠올라 다른 알 위를 넘어가고, 판 밖으로 나간 알은 제거된다. 손이 닿지 않는 알은 판을 돌려 가까이 가져온다.
3. 상대 알을 모두 떨어뜨리면 이긴다. 10라운드가 끝날 때까지 승부가 나지 않으면 남은 알이 많은 쪽이 이기고, 같으면 무승부다.

### 방해요소

- 라운드가 바뀔 때마다 두 사람 모두 18종 중 1개를 무작위로 새로 받는다. 상대가 무엇을 가졌는지는 볼 수 없다.
- 내 턴·상대 턴, 조준 중·알이 움직이는 중을 가리지 않고 E 키로 쓴다. 상대 화면을 바래게 하는 후레쉬·물총, 판을 45도 돌리기, 기절, 판 위에 놓는 벽·끈끈이·자석·구멍·폭탄, 어느 쪽이 진짜인지 숨기는 가짜벽·분신술 등이 있다.
- 피로도 게이지·쿨타임·턴당 1회 같은 사용 제한이 있어 "언제 쓸지"를 판단하는 것이 매 판의 전략이 된다.

![판 위에 놓인 방해요소: 자석·벽·끈끈이·구멍 등](docs/images/hazards.jpg)

### 그 밖의 특징

- **3D 장면**: 판을 사이에 두고 두 캐릭터가 마주 앉아 팔을 뻗어 알을 튕기고, 결과에 따라 표정과 몸짓을 보인다.
- **캐릭터 꾸미기**: 두상·머리카락·눈·코·입·피부색·안경·모자·옷 등 10개 항목을 골라 사람 아바타를 꾸민다.
- **방 테마 4종**: 장난감 왕국 화풍의 바·밤 옥상·교실·해변 중 하나를 골라 배경·조명·판 겉모양을 바꾼다.
- **감정표현 6종**: 하품·도발·졸기·인사·웃기·놀람을 숫자키 1~6으로 쓴다.
- **전적**: 계정마다 판수·승·패를 누적한다. AI 대전은 전적에 넣지 않는다.
- **플레이 방식**: 온라인 1:1, AI 대전, 같은 브라우저의 로컬 2인(개발용).

![방 테마 4종: 바·밤 옥상·교실·해변](docs/images/themes.jpg)

데스크톱 최신 Chrome·Edge를 대상으로 하며, 물리·방해요소 수치는 플레이 테스트로 조정 중이다. 상세 규칙은 [PRD](docs/PRD.md), 진행 상황은 [PROGRESS](docs/PROGRESS.md)에서 확인한다.

## 기술 스택

| 영역 | 사용 |
| --- | --- |
| 클라이언트 | TypeScript, Vite, React, Three.js(React Three Fiber) |
| 서버 | Node.js 24, Express, Socket.IO |
| 인증·검증 | express-session(세션을 DB에 저장), argon2id, Zod |
| 저장 | PostgreSQL, Drizzle ORM. 운영 DB는 서버 VM 안으로 옮기고 Cloudflare R2에 백업한다(예정, [DEC-098](docs/DECISIONS.md#결정-색인)) |
| 배포 | HostHatch VM(서울 우선) + Docker Compose + 자체 도메인(Cloudflare)으로 옮긴다(예정, [ADR-0005](docs/adr/0005-hosting-and-data.md)). 이전 운영은 Render 무료 웹 서비스 + Neon 무료 플랜이었다 |

npm workspaces 모노레포이며 패키지는 `client`·`server`·`game-core`·`game-runtime`·`shared` 다섯 개다. 채택 이유와 대안은 [TECH_STACK](docs/design/TECH_STACK.md)과 [ADR-0003](docs/adr/0003-tech-stack-and-architecture.md)에 있다.

## 설치·실행

Node.js 24 이상과 npm을 사용한다.

```bash
npm ci
npm test
npm run lint
npm run format
npm run build
```

Windows에서 Git이 줄바꿈을 CRLF로 바꿔 받으면(`core.autocrlf=true`) `npm run format`이 대부분의 파일에서 경고를 내며 실패한다. 처음 내려받을 때 `git clone -c core.autocrlf=false <저장소 주소>`를 쓰면 피할 수 있다. 이미 받은 저장소는 `git config core.autocrlf false`만으로는 작업 폴더의 파일이 그대로이므로, 변경 사항을 커밋하거나 `git stash`한 뒤 `git rm --cached -r .`와 `git reset --hard`로 작업 폴더를 다시 만든다(저장하지 않은 변경은 사라진다). 줄바꿈만 무시하고 확인하려면 `npx prettier --config config/prettier.json --ignore-path config/prettier.ignore --end-of-line auto --check .`를 쓴다.

클라이언트 개발 서버는 `npm run dev -w @alkkagi/client`로 실행한다. `/local?seat=0`·`/local?seat=1`은 같은 브라우저의 두 창, `/ai`는 AI 대전이고, 로그인·로비·대기실·경기를 잇는 실제 화면은 `/`다. 개발 서버의 `/api`·`/socket.io`는 `127.0.0.1:3000`으로 전달한다.

### 서버 없이 AI·로컬 2인 실행

```bash
npm run dev -w @alkkagi/client -- --host 127.0.0.1
```

터미널에 표시된 주소의 `/ai`에서 판·알 개수·방 테마를 고른 뒤 시작한다. 로컬 2인은 같은 브라우저 프로필에서 `/local?seat=0`과 `/local?seat=1`을 각각 열면 시작한다. 두 창의 `theme=bar|rooftop|classroom|beach`가 다르면 먼저 접속한 창의 값을 쓰며, 생략하거나 잘못된 값이면 바 테마다. 서로 다른 브라우저나 시크릿 프로필은 SharedWorker를 공유하지 않는다. 두 모드는 계정·DB·온라인 서버 없이 실행한다.

- 내 알을 왼쪽 버튼으로 끌어 발사하고, 조준 중 오른쪽 클릭으로 취소한다.
- E로 방해요소를 사용한다. 위치형은 클릭으로 배치하며 ESC로 취소한다. R로 벽 방향을 바꾼다.
- A·D 또는 ←·→를 누르는 동안 판을 돌리고, 오른쪽 드래그로 고개를 돌린다.
- 숫자키 1~6 또는 감정표현 메뉴로 하품·도발·졸기·인사·웃기·놀람을 사용한다. 공통 쿨타임은 3초이고 경기 중에만 사용할 수 있다.
- 결과 화면에서 재도전한다. 로컬 2인은 두 창 모두 15초 안에 눌러야 하고, AI는 한 번 누르면 다시 시작한다.

로컬 창을 닫거나 새로고침하면 이탈로 처리한다. 새 로컬 경기를 만들려면 두 창을 모두 닫고 다시 연다. 오래 가려진 탭의 타이머 제한은 [로컬 실행의 한계](docs/design/LOCAL.md#로컬-2인-구성-창-2개)를 확인한다.

온라인 서버는 PostgreSQL 연결 설정 `DATABASE_URL`(PostgreSQL 연결 문자열)과 32자 이상인 `SESSION_SECRET`이 필요하다. 변수 이름은 [.env.example](.env.example)에 있으며 복사해 `.env`로 만들고 값을 채운다. 환경에 값을 설정한 뒤 `npm run db:migrate -w @alkkagi/server`, `npm run dev -w @alkkagi/server`를 실행한다. 마이그레이션 명령은 루트 `.env`도 읽지만 개발 서버 명령은 프로세스 환경을 읽는다. `/`(로그인·로비·대기실)는 서버를 띄운 뒤 개발 서버로 연다.

DB 테스트는 `DATABASE_URL`이 설정된 환경에서 `npm run test:db`로 실행한다. 연결 계정에 임시 DB 생성·삭제 권한이 필요하고, 테스트는 임시 DB를 만들었다가 지운다. 환경변수 실제 값과 비밀정보는 문서에 적지 않는다. PR마다 GitHub Actions가 위 검사와 `test:db`(PostgreSQL 컨테이너), 비밀값 검사를 실행하며 통과해야 `main`에 병합된다([워크플로](.github/workflows/ci.yml)).

새 환경에서 처음부터 실행해 확인한 조건·결과는 [DOC-011 worklog](docs/worklogs/2026-11-05.md#doc-011-readme-새-환경-검증)에 있다. 온라인 대전 클라이언트의 검증 조건·한계는 [IMPL-010 worklog](docs/worklogs/2026-11-03.md#impl-010-온라인-대전-클라이언트)에 있다.

## 배포 접속

운영 주소: **https://playalkkagi.com** (2026-11-27 개통, [OPS-004](docs/TASKS.md#ops-004-운영-서버-구축)).

HostHatch 서울 VM 한 대에 서버·DB를 두고 Cloudflare로 연결한다([DEC-098](docs/DECISIONS.md#결정-색인), [ADR-0005](docs/adr/0005-hosting-and-data.md)). itch.io를 시작으로 게임 포털에도 제출할 예정이다([DEC-097](docs/DECISIONS.md#결정-색인)). 배포·백업·모니터링 절차는 [OPERATIONS](docs/design/OPERATIONS.md)를 따른다. 자동 배포·백업·모니터링은 아직 없다([OPS-003](docs/TASKS.md#ops-003-배포-자동화)·[OPS-005](docs/TASKS.md#ops-005-db-백업복구)·[OBS-001](docs/TASKS.md#obs-001-모니터링알림)). 이전 주소(https://alkkagi-6q64.onrender.com, Render + Neon)는 쓰지 않으며 데이터는 옮기지 않았다.

### 운영 서버 구축

[OPS-004](docs/TASKS.md#ops-004-운영-서버-구축)의 구축 순서다. 구성과 선택 이유는 [OPERATIONS 서버 구성 파일](docs/design/OPERATIONS.md#서버-구성-파일)에 있다. 비밀값은 VM의 `/opt/alkkagi/.env`와 `/opt/alkkagi/certs`에만 두고 저장소·문서·채팅에 남기지 않는다.

1. **주문 전 확인**: HostHatch에 가입해 주문 화면에서 서울(차선 도쿄) "NVMe 2 GB"의 월 가격·결제 주기·부가세와 약관의 CPU 사용 제한을 확인한다. 월 결제가 안 되거나, 부가세·도메인(`.com` 연 약 $10.5)을 합쳐 월 1만 원을 넘거나, 상시 CPU 사용 제한이 있으면 주문하지 않고 대체안([ADR-0005](docs/adr/0005-hosting-and-data.md#선택과-핵심-조건))으로 간다.
2. **도메인**: 도메인을 사서 Cloudflare에 연결한다(Cloudflare Registrar면 자동).
3. **VM 주문**: Ubuntu 24.04 LTS, SSH 공개 키를 등록한다.
4. **Cloudflare 설정**: DNS에 VM IP의 A(IPv6가 있으면 AAAA) 레코드를 프록시 켬(주황 구름)으로 만든다. SSL/TLS 모드는 Full (strict), Edge Certificates의 Always Use HTTPS를 켠다. Origin Server에서 Origin CA 인증서(도메인과 `*.도메인`)를 만들어 인증서·개인 키를 받아 둔다.
5. **VM 초기 설정**(root로 SSH 접속):

   ```bash
   apt-get update && apt-get -y install git
   git clone https://github.com/a4527/augmented-alkkagi.git /opt/alkkagi/app
   bash /opt/alkkagi/app/deploy/vm-setup.sh deploy
   ```

   새 터미널에서 `ssh deploy@<VM IP>`가 되는지 확인한 뒤 root 세션을 닫는다. 이후는 `deploy` 계정으로 한다. 첫 부팅 직후에는 자동 보안 업데이트가 20분가량 패키지 잠금을 잡고 있어 스크립트가 기다리다 멈출 수 있다. `pgrep -f unattended-upgrade`가 비면 다시 실행한다. 커널이 갱신됐으면(`/var/run/reboot-required`) 재부팅한다.

6. **인증서·환경 파일**:

   ```bash
   sudo chown -R deploy:deploy /opt/alkkagi/app
   sudo nano /opt/alkkagi/certs/origin.pem   # 4단계의 인증서
   sudo nano /opt/alkkagi/certs/origin.key   # 4단계의 개인 키
   # 붙여넣기 때 터미널 제어 문자(ESC[200~)가 섞이면 openssl이 못 읽는다. 지운 뒤 권한을 줄인다.
   # certs는 root만 열 수 있어 * 를 root 셸에서 펼친다.
   sudo sh -c 'sed -i "s/\x1b\[20[01]~//g" /opt/alkkagi/certs/origin.*; chmod 600 /opt/alkkagi/certs/origin.*'
   # 인증서·키 짝 확인(두 값이 같아야 한다)
   sudo sh -c 'openssl x509 -in /opt/alkkagi/certs/origin.pem -noout -pubkey | sha256sum; openssl pkey -in /opt/alkkagi/certs/origin.key -pubout | sha256sum'
   cp /opt/alkkagi/app/deploy/env.example /opt/alkkagi/.env && chmod 600 /opt/alkkagi/.env
   nano /opt/alkkagi/.env                     # 도메인, openssl rand로 만든 비밀값
   ```

7. **설정 검사와 실행**:

   ```bash
   cd /opt/alkkagi/app
   COMPOSE="docker compose --env-file /opt/alkkagi/.env -f deploy/compose.yaml"
   $COMPOSE config --quiet
   docker run --rm -e ALKKAGI_DOMAIN="$(grep '^ALKKAGI_DOMAIN=' /opt/alkkagi/.env | cut -d= -f2)" \
     -v "$PWD/deploy/Caddyfile:/etc/caddy/Caddyfile:ro" \
     -v /opt/alkkagi/caddy/cloudflare-trusted.caddy:/etc/caddy/cloudflare-trusted.caddy:ro \
     -v /opt/alkkagi/certs:/certs:ro caddy:2 caddy validate --config /etc/caddy/Caddyfile
   $COMPOSE up -d --build
   $COMPOSE ps
   curl -fsS https://<도메인>/health
   ```

   두 검사가 오류 없이 끝나야 실행한다. 서버를 다시 빌드·실행할 때는 `git pull` 뒤 `$COMPOSE up -d --build`를 쓴다(자동 배포는 [OPS-003](docs/TASKS.md#ops-003-배포-자동화)).

8. **DB 백업 켜기**([OPERATIONS 백업·복구](docs/design/OPERATIONS.md#백업복구)): Cloudflare R2에 버킷을 만들고 그 버킷만 읽기·쓰기 가능한 API 토큰을 발급한다. Discord 채널 웹후크를 만든다. `/opt/alkkagi/.env`의 `R2_*`·`DISCORD_WEBHOOK_URL`을 채우고 `BACKUP_CIPHER_PASS`(`openssl rand -base64 48`)를 넣은 뒤 그 값을 VM 밖에도 보관한다. 그다음 실행한다:

   ```bash
   cd /opt/alkkagi/app && bash deploy/backup-setup.sh
   ```

   Discord에 "DB 백업을 켰다" 알림이 오면 된다. 복구 연습은 `bash deploy/restore-drill.sh`다.

## 출처

이 프로젝트는 2026-10-27 두 개발자가 [팀 저장소](https://github.com/moguab2808-commits/mini-project-1-1)에서 함께 시작한 미니프로젝트이며, 2026-11-25부터 이 저장소에서 개인 프로젝트로 이어 간다([DEC-091](docs/DECISIONS.md#결정-색인)). 전환 전의 기획·설계·구현은 두 사람의 공동 작업이고, 기여 내역은 Git 이력과 팀 저장소의 Issue·PR에 남아 있다. 문서의 "개발자 A·B"는 당시 담당 구분이다. 협업 규칙은 [CONTRIBUTING](docs/CONTRIBUTING.md)을 따른다.

반입한 이미지·소리·글꼴 등 에셋의 출처와 이용 조건은 [CREDITS](docs/CREDITS.md)에 있다.

## 문서 안내

작업 목적별 기준 문서와 각 문서의 책임은 [AGENTS](AGENTS.md#작업-목적에-따라-읽을-문서)에서 확인한다.
