# 배포·데이터 운영 설계

## 상태

| 구분 | 상태 |
| --- | --- |
| 승인된 미구현 설계 (2026-11-26) | 아래 [운영 구성](#운영-구성-승인-미구현)([DEC-098](../DECISIONS.md#결정-색인), [ADR-0005](../adr/0005-hosting-and-data.md)), [모니터링](#모니터링)([DEC-099](../DECISIONS.md#결정-색인)), CI 통과 후 자동 배포·배포 뒤 확인·실패 알림([DEC-094](../DECISIONS.md#결정-색인)). 구현 작업은 [OPS-004](../TASKS.md#ops-004-운영-서버-구축)·[OPS-005](../TASKS.md#ops-005-db-백업복구)·[OPS-003](../TASKS.md#ops-003-배포-자동화)·[OBS-001](../TASKS.md#obs-001-모니터링알림) |
| 현재 구현 | 운영 서버 구성 파일([서버 구성 파일](#서버-구성-파일), VM 미구축). 의존성 취약점 알림과 월 1회 정기 패치([DEC-095](../DECISIONS.md#결정-색인), 아래 [의존성·취약점 관리](#의존성취약점-관리)). 운영 서비스는 없다: 이전 구성(Render·Neon)의 서비스는 2026-11-25 확인 시 소유자 일시 중지 상태이고 새 구성이 가동되면 끝낸다 |
| 확정 (OPS-001 완료) | 아래 [서버 로그](#서버-로그)·[서버 시작 시 `rooms` 정리](#서버-시작-시-rooms-정리) 등 [OPS-001](../legacy/TASKS-team.md#ops-001-운영-설계-확정) 세부 절차 중 새 구성에서도 유지하는 항목 |
| 미정 | 아래 [남은 미정](#남은-미정구현-단계-확인) |

운영 기준(규모·지연·가동률·데이터 손실·비용·운영 시간)은 [PRD 비기능 요구사항](../PRD.md#4-비기능-요구사항과-제약), 실행 절차는 [README](../../README.md), 성능·실패 실험 방법은 [ENGINEERING-VALIDATION](../ENGINEERING-VALIDATION.md)을 따른다.

## 운영 구성 (승인, 미구현)

[DEC-098](../DECISIONS.md#결정-색인)·[ADR-0005](../adr/0005-hosting-and-data.md). 선택 이유와 대안은 ADR에 있다.

```text
플레이어 브라우저 (자체 도메인 웹 / itch.io·CrazyGames iframe)
  └─ HTTPS·WSS ─→ Cloudflare (DNS·프록시·TLS, 무료)
                    └─→ VM: HostHatch 2GB (서울 우선, 도쿄 차선)
                          Docker Compose
                          ├─ Caddy (TLS 종단·리버스 프록시)
                          ├─ Node 서버 (Express + Socket.IO, 경기 상태는 메모리)
                          ├─ PostgreSQL (가입 계정·전적·세션)
                          │    └─ WAL·전체 백업 ─→ Cloudflare R2 (무료 10GB)
                          └─ Grafana Alloy ─→ Grafana Cloud (지표·로그)
```

- **서버**: HostHatch 2GB VM 1대. 주문할 때 위치별 월 가격·결제 주기·부가세·공유 CPU 약관을 확인하고([비용·한도 확인](#비용한도-확인-2026-11-26)), 조건이 어긋나면 대체안(Vultr 서울 1GB + Supabase 서울 무료 + 1시간 덤프)으로 간다.
- **도메인·앞단**: 자체 도메인을 Cloudflare 무료 DNS·프록시로 운영한다. 포털 빌드에 고정되는 서버 주소는 이 도메인이다. 프록시가 Cloudflare → Caddy 두 단계라 서버는 `TRUST_PROXY_HOPS=2`로 클라이언트 IP를 읽는다([AUTH 해시·프록시](AUTH.md#해시프록시), 아래 [서버 구성 파일](#서버-구성-파일)).
- **DB**: 같은 VM의 PostgreSQL. 진행 중 경기 상태는 서버 메모리, 방 정보(`rooms`)·회원·전적·세션은 DB에 둔다([DEC-023](../DECISIONS.md#결정-색인)). 게스트는 저장하지 않는다([DEC-097](../DECISIONS.md#결정-색인)).
- **환경 설정 이름**: 서버는 `DATABASE_URL`, `SESSION_SECRET`, `SESSION_SECRET_PREVIOUS`(교체 중에만), `PORT`, `NODE_ENV`, `TRUST_PROXY_HOPS`를 읽는다. 운영 Compose는 VM의 `/opt/alkkagi/.env`에서 `ALKKAGI_DOMAIN`, `POSTGRES_PASSWORD`, `SESSION_SECRET`(·`SESSION_SECRET_PREVIOUS`)를 받아 나머지를 채운다([`deploy/env.example`](../../deploy/env.example)). 로컬은 `.env`와 값이 없는 `.env.example`을 쓰고, 운영 값은 VM의 저장소 밖 환경 파일과 GitHub 비밀 저장소에만 둔다. 값과 비밀정보는 문서에 기록하지 않는다.
- **메모리 예산**: OS·Docker, Caddy, Node, PostgreSQL, Alloy를 2GB 안에 둔다. 각 사용량은 추정이라 구축 때 측정한다([OPS-004](../TASKS.md#ops-004-운영-서버-구축)).
- **디스크(10GB)**: Docker 이미지 정리, 로그 순환, 로컬 WAL 보관 상한을 둔다.
- 기존 시뮬레이션 기록 30fps 샘플링은 기록 후 재생 기준이었다. 이동 중 방해요소 입력을 위한 실시간 방식은 [ADR-0004](../adr/0004-realtime-hazards.md)로 승인됐다. 전송 주기는 물리와 분리하며 부하 측정으로 정한다(아래 사용량·부하).
- 오디오는 브라우저 입력 후 활성화한다.

### 서버 구성 파일

[OPS-004](../TASKS.md#ops-004-운영-서버-구축)에서 만든 파일이다. 구축 순서는 [README 운영 서버 구축](../../README.md#운영-서버-구축)에 있다.

| 파일 | 내용 |
| --- | --- |
| [`Dockerfile`](../../Dockerfile) | 빌드 단계에서 `npm ci`·`npm run build` 뒤 개발 의존성을 지우고, 실행 단계(`node:24-bookworm-slim`, `node` 사용자)에는 운영 의존성·서버 번들·마이그레이션·클라이언트 빌드만 둔다 |
| [`deploy/compose.yaml`](../../deploy/compose.yaml) | `postgres`(17, 포트 비공개, 볼륨 `pgdata`), `server`(루프백 3000만 공개), `caddy`(호스트 네트워크 443). 모두 `restart: unless-stopped`, 컨테이너 로그 10MB×3 |
| [`deploy/Caddyfile`](../../deploy/Caddyfile) | Cloudflare Origin CA 인증서로 TLS를 받고 서버로 넘긴다. 관리 API·자동 HTTPS·접근 로그를 끈다. Cloudflare 대역만 신뢰 프록시로 둔다 |
| [`deploy/vm-setup.sh`](../../deploy/vm-setup.sh) | 새 VM 한 번 설정: 패키지 갱신·자동 보안 업데이트, 운영 계정(sudo·docker), SSH 키 로그인만, 스왑 2GB, Docker 공식 저장소, ufw |
| [`deploy/cloudflare-ips.sh`](../../deploy/cloudflare-ips.sh) | Cloudflare IP 대역으로 ufw 443 규칙과 Caddy 신뢰 프록시 목록을 만든다. 대역이 바뀌면 다시 실행한다 |

- **TLS**: Cloudflare SSL 모드를 Full (strict)로 두고 VM의 Caddy는 Cloudflare Origin CA 인증서(도메인·와일드카드, 15년)를 쓴다. 그래서 Cloudflare와 서버 사이도 검증된 TLS이고, 인증서 자동 발급(ACME)이 필요 없다. Origin CA 인증서는 Cloudflare 프록시를 거친 요청에서만 브라우저가 믿는다.
- **방화벽**: 22는 어디서나(SSH 키만), 443은 Cloudflare 대역만 연다. 80은 열지 않는다(HTTP→HTTPS는 Cloudflare "Always Use HTTPS"). Docker가 공개한 포트는 ufw를 우회하므로 Caddy는 호스트 네트워크로 두고 서버는 루프백에만, DB는 포트를 공개하지 않는다.
- **클라이언트 IP**: Cloudflare가 붙인 `X-Forwarded-For` 뒤에 Caddy가 Cloudflare 엣지 IP를 덧붙인다(신뢰 프록시일 때만). 서버는 오른쪽에서 두 단계(`TRUST_PROXY_HOPS=2`)를 건너 클라이언트 IP를 읽고, 클라이언트가 위조해 보낸 앞쪽 값은 쓰지 않는다(`auth/proxy.test.ts`).
- **메모리 상한(초기값)**: DB 512MB, 서버 512MB(Node 힙 384MB), Caddy 128MB. 구축 뒤 대기·경기 중 사용량을 재서 고친다. PostgreSQL은 `max_connections=20`, `shared_buffers=128MB`다.
- **이미지 빌드**: OPS-004에서는 VM이 저장소를 받아 직접 빌드한다(스왑 2GB 전제). 이미지 저장소·자동 배포는 [OPS-003](../TASKS.md#ops-003-배포-자동화)에서 바꾼다. 기반 이미지는 메이저 태그(`node:24-bookworm-slim`·`postgres:17-bookworm`·`caddy:2`)이며 고정 여부는 OPS-003에서 정한다.

이전 구성(Render 무료 웹 서비스 + Neon 무료 + UptimeRobot 절전 방지 요청, [DEC-013](../DECISIONS.md#결정-색인)·[DEC-047](../DECISIONS.md#결정-색인))은 DEC-098로 대체됐다. 이전 절차의 원문은 Git 이력으로 추적한다.

## 비용·한도 확인 (2026-11-26)

공식 문서·공식 API로 확인했다. 비교 전체와 확인하지 못한 항목은 [2026-11-26 worklog](../worklogs/2026-11-26.md#ops-002-운영-인프라-재검토)에 있다.

| 대상 | 확인한 내용 | 공식 문서 |
| --- | --- | --- |
| HostHatch Compute VM | "NVMe 2 GB" 1 AMD EPYC core(fair share)·2 GB·10 GB NVMe·1 TB, "from $4.00 / month". 서울(KINX Dogok)·도쿄(Equinix TY8) 데이터센터가 있다. 위치·가격은 가입 뒤 주문 화면과 `GET /projects/{slug}/pricing`에서만 보이고, 주문은 계정 크레딧이나 청구서 결제로 처리된다. 위치별 가격·결제 주기·부가세·CPU 약관은 미확인(주문 때 확인) | [Products](https://hosthatch.com/products), [Datacenters](https://docs.hosthatch.com/features/), [Orders and payment](https://docs.hosthatch.com/api/orders-and-payment/) |
| Cloudflare R2 | 월 10 GB-month 저장, Class A 100만·Class B 1000만 요청 무료, 외부 전송 무료. S3 호환 엔드포인트 | [R2 pricing](https://developers.cloudflare.com/r2/pricing/) |
| Grafana Cloud Free | 활성 시계열 10k, 로그·트레이스 각 월 50 GB, 보관 14일, 사용자 3명. 요금 페이지에 요금 체계 변경 예고 문구가 있어 도입 때 다시 확인한다 | [Pricing](https://grafana.com/pricing/) |
| UptimeRobot Free | 모니터 50개, 5분 간격, 상태 페이지 1개, 개인·상업 프로젝트 허용. 무료 알림 채널에 Discord 포함(Slack·Telegram·webhook은 유료) | [Pricing](https://uptimerobot.com/pricing/), [Integrations](https://help.uptimerobot.com/en/articles/11361285-uptimerobot-integrations-basic-information-overview) |
| Sentry Developer | 오류 5k(월 단위로 추정, 미확인), 보관 30일, 사용자 1명, 알림은 이메일 | [Pricing](https://sentry.io/pricing/) |
| 대체안 Vultr 서울 | `vc2-1c-1gb` 1 vCPU·1 GB·1 TB $5, `vc2-1c-2gb` $10. 한국 부가세 10% 부과 | 공개 API `api.vultr.com/v2/plans`, [VAT](https://docs.vultr.com/support/platform/billing/does-vultr-collect-vat-or-sales-tax) |
| 대체안 Supabase Free | 사용 시간 한도 명시 없음, DB 500 MB, 전송 5 GB, 1주 비활성 시 일시 정지, 무료 플랜 백업 없음. 무료 플랜의 서울 선택 가능 여부는 미확인 | [Pricing](https://supabase.com/pricing), [Backups](https://supabase.com/docs/guides/platform/backups) |

구축 뒤 월 1회 사용량·청구를 확인한다. 한도의 80%를 넘으면 알림을 받는다([모니터링](#모니터링)).

## 세부 절차 (확정안)

### 헬스체크

- **UptimeRobot**이 5분 간격으로 `/health`를 확인하고 **다운·복구 때만** Discord로 알린다([DEC-099](../DECISIONS.md#결정-색인)). VM은 절전하지 않으므로 절전 방지 요청은 쓰지 않는다.
- `/health`는 DB를 조회하지 않는다. 서버 밖에서 확인해야 VM 자체가 죽은 것도 알 수 있다.

### SPA fallback

`/api`·`/socket.io`·`/health`를 제외한 GET 요청은 `index.html`을 반환한다. 이 경로 밖에서 파일 확장자가 있는 요청(정적 자산)이 없으면 404를 반환하고 `index.html`로 대체하지 않는다.

포털 빌드([DEC-097](../DECISIONS.md#결정-색인))는 정적 파일을 포털이 서비스하므로 이 규칙은 자체 도메인의 웹 접속에만 적용된다.

### 배포·롤백

> 승인된 방향([DEC-094](../DECISIONS.md#결정-색인)·[DEC-096](../DECISIONS.md#결정-색인)): CI를 통과한 `main` 커밋만 CI/CD 파이프라인으로 배포하고, 배포 뒤 상태를 확인하고 실패를 알린다. 구체 절차는 [OPS-003](../TASKS.md#ops-003-배포-자동화)에서 정해 이 절에 쓴다. 새 구성이 가동되기 전에는 운영 배포가 없다.

- 배포는 서버를 재시작해 진행 중 경기와 연결이 끊긴다. 허용하되 모니터링으로 이용자가 적은 시간을 골라 배포한다([PRD 비기능 요구사항](../PRD.md#4-비기능-요구사항과-제약)).
- 롤백은 DB를 되돌리지 않는다. 마이그레이션은 되돌림 스크립트 대신 "앞으로 호환되는 변경만" 원칙을 쓴다([DATABASE](DATABASE.md#마이그레이션)). 새 버전이 스키마를 바꾼 뒤 이전 버전으로 롤백해도 이전 코드가 동작해야 한다.

### 서버 로그

[GAME의 명령 경합과 시간](GAME.md#명령-경합과-시간)이 정한 필드를 그대로 쓰고 운영에 필요한 항목을 더한다. 구조화 JSON 한 줄 로그를 stdout으로 내보낸다. 새 구성에서는 Docker stdout을 Alloy가 Grafana Cloud(Loki)로 보내 14일 보관하고 검색한다([모니터링](#모니터링)).

| 항목 | 내용 | GAME 필드 |
| --- | --- | --- |
| 시각 | `ts`(UTC), `mono`(단조 시각 ms) | UTC·단조 시각 |
| 식별 | `roomId`, `gameId`, `turnId`, `userId` | 경기·턴 ID, userId·roomId |
| 순서 | `ingressSeq`, `serverTick` | ingressSeq, serverTick |
| 이벤트 `event` | `start_commit`, `turn_start`, `shot`, `hazard_use`, `hazard_trigger`, `leave`, `forfeit`, `tick_skipped`, `game_over` | 턴 시작·발사·방해요소 사용/발동·이탈·종료 |
| 결과 | `result`(명령 판정 결과, API 오류 코드와 같은 이름), `reason`(종료 사유) | 명령 종류·판정 결과, 종료 사유 |

- `leave`는 연결 끊김·나가기·접속 대체로 이탈이 큐에서 관찰된 시점이며 `reason`에 `disconnect`·`leave_button`·`session_replaced`를 적는다. 접속 대체도 별도 이벤트 없이 `leave` 하나로 기록한다.
- `forfeit`는 기권패가 확정된 시점이며 `reason`은 `leave`(위 `leave`로 확정)·`command`(`game:forfeit` 명령)·`timeout`(연속 시간초과 누적) 중 하나다. `game_over`의 `reason`에 나오는 `timeout_forfeit`는 `game_over`에만 쓰며 `forfeit` 이벤트에는 `timeout`으로 적는다. `game_over`는 `finishOnce` 실행 결과(`reason`: [API `game:over`](API.md#경기-이벤트-필드)의 `all_stones_out`·`final_round`·`forfeit`·`timeout_forfeit`)다.
- `tick_skipped`는 [틱 따라잡기 상한](GAME.md#전송실행)을 넘어 버린 지연 시간을 `result`에 적는다.
- 경기 로그와 별도로 `rate_limited` 줄(`ts`·`event`·`userId`·`result`=묶음 이름 `command`·`board:rotate`·`aim:update`·`hazard:aim`)을 남긴다. 사용자·묶음마다 1초 창에서 한도를 넘긴 첫 호출에만 남기며 입력 내용은 싣지 않는다([AUTH 경기 입력 빈도 제한](AUTH.md#경기-입력-빈도-제한)).
- 이 로그가 동시 이탈과 시작 직전 이탈의 판정 근거다([게임 규칙](../PRD.md#게임-규칙)). 경기 종료 사유는 DB에 저장하지 않고 여기에만 남는다([DATABASE](DATABASE.md#경기-종료-저장)).

`ingressSeq`는 **방 단위 큐**([GAME 구현 경계](GAME.md#구현-경계-ab)의 방별 단일 큐)가 붙이는 순번이며 서버가 켜져 있는 동안 방 안에서 계속 늘어난다. 재도전으로 새 경기가 시작돼도 0으로 되돌리지 않는다. 대기실 이벤트(시작 전 `leave`)는 경기가 없어 `gameId`가 `null`이고 `roomId`로 묶으며, `start_commit`에서 새 `gameId`가 붙어 그 뒤 이벤트는 `gameId`를 가진다. 재도전 경기는 새 `gameId`를 받지만 같은 방의 `ingressSeq`가 이어진다. 그래서 판정은 `roomId`와 `ingressSeq`로 한다.
판정 방법(같은 `roomId`의 로그를 `ingressSeq` 순으로 본다):

| 상황 | 판정 |
| --- | --- |
| 동시 이탈 | 두 사람의 `leave` 중 `ingressSeq`가 작은 쪽(먼저 관찰된 쪽)을 기권패로 본다. 같은 시각이어도 `ingressSeq`가 서로 다르다 |
| 시작 직전 이탈 | `leave`의 `ingressSeq`가 `start_commit`보다 작으면 대기실 이탈로 전적에 남기지 않고, 크면 기권패다. `start_commit`이 로그에 없으면 시작 처리 전이다 |

- 구현([IMPL-009](../legacy/TASKS-team.md#impl-009-온라인-대전-서버), [DEC-043](../DECISIONS.md#결정-색인)): 방마다 `RoomRuntime` 하나가 `start_commit`·`leave`를 모두 남기고 `ingressSeq`를 대기실부터 이어 매긴다. 대기실의 이탈도 같은 런타임이 `gameId: null`인 `leave`로 남긴다. 입장 UPDATE(시작 커밋) 뒤에 들어온 이탈은 경기 생성이 끝난 뒤 관찰되므로 `ingressSeq`가 `start_commit`보다 크다. 줄은 `ts`·`mono`·`roomId`·`gameId`·`turnId`·`userId`·`ingressSeq`·`serverTick`·`event`·`result`·`reason`만 직렬화한다(`game-log.ts`).
- 틱마다 로그를 남기지 않는다. 비밀번호·세션·쿠키·상대의 비공개 보유 상태는 기록하지 않는다. 재접속 복구가 없어 재접속 이벤트는 두지 않는다.
- **민감정보 제거 방식**: 위 표의 필드만 직렬화하는 허용 목록 방식이다. 로거 함수는 정해진 키만 받고 요청·소켓·세션 객체 전체를 넘기지 않는다. 오류 로그에는 메시지와 코드만 남기고 요청 본문·헤더·쿠키·`DATABASE_URL`을 넣지 않는다. 방해요소 보유 상태는 `hazard_use`·`hazard_trigger`가 일어난 뒤 공개된 사실만 적는다.
- 로그 보관은 Grafana Cloud Free의 14일이다([DEC-099](../DECISIONS.md#결정-색인)). 판정이 필요한 문제는 14일 안에 확인한다. 허용 목록 원칙은 외부 수집 뒤에도 그대로 지킨다.

### 사용량·부하 확인

- 월 1회 VM 전송량(1 TB), R2 저장량(10 GB), Grafana Cloud 사용량을 확인해 worklog에 기록한다. 한도의 80%를 넘으면 알림을 받고 대응은 그때 정한다([DEC-096](../DECISIONS.md#결정-색인)).
- **상태 전송 부하 측정 항목**: 변수는 동시 방 수(1·5·25방, 최대 목표 동시 경기 25판)와 알 이동 중 스냅샷 주기(초당 10·20·30회, 기본 30회는 [GAME](GAME.md#전송실행))다. 한 번에 한 변수만 바꾼다. 지표는 서버 CPU 사용률, 이벤트 루프 지연, 틱 지연(`tick_skipped` 횟수), 스냅샷 전송 지연(서버 전송 시각 대비 클라이언트 수신 시각), 서버 송신 대역폭, 메모리다. 합격 기준은 최대 부하에서 `tick_skipped` 0건이다([PRD](../PRD.md#4-비기능-요구사항과-제약), [VAL-003](../TASKS.md#val-003-부하e2e-검증)).

### 서버 시작 시 `rooms` 정리

서버는 연결을 받기 전에 마이그레이션을 적용하고([DATABASE](DATABASE.md#마이그레이션)) `rooms`를 전부 삭제한다([DATABASE](DATABASE.md#방-생명주기)). 새 DB도 첫 시작에서 테이블이 만들어진다. 배포·재시작으로 메모리의 연결·경기가 사라지기 때문이다. 마이그레이션이나 삭제가 실패하면 서버를 시작하지 않고 오류로 종료한다. 서버 장애 중의 경기 처리 규칙은 두지 않는다([PRD 비기능 요구사항](../PRD.md#4-비기능-요구사항과-제약)).

### 클라이언트 음량 설정 저장

음량은 브라우저 `localStorage`에 저장한다([환경설정](../PRD.md#환경설정)의 브라우저 저장 범위). 읽기·쓰기는 예외를 처리하고, 저장소를 쓸 수 없으면 기본값으로 동작한다. 서버·DB에는 보내지 않는다.

### 백업·복구

가입 계정·전적을 잃지 않는다는 기준([DEC-096](../DECISIONS.md#결정-색인))에 따라 VM의 PostgreSQL을 외부에 백업한다([DEC-098](../DECISIONS.md#결정-색인)). 구현은 [OPS-005](../TASKS.md#ops-005-db-백업복구)다.

- **연속 보관**: WAL을 1분 안팎(`archive_timeout` 등)으로 Cloudflare R2에 보관해 시점 복구가 가능하게 한다. 도구는 pgBackRest를 우선한다(S3 호환 저장소 지원). R2와의 호환은 구축 때 확인한다.
- **전체 백업**: 주기적으로 전체 백업을 R2에 둔다. 보관 개수는 R2 무료 10 GB 안에서 정한다.
- **복구 연습**: 월 1회 임시 컨테이너에 복구해 회원·전적 수를 원본과 비교하고 worklog에 남긴다. 보관이 실패하면 알림을 받는다.
- **한계**: VM이 통째로 사라지면 마지막 보관 이후의 변경(약 1분)을 잃는다. 대체안(Supabase)으로 가면 1시간 덤프라 최대 1시간을 잃는다.

### 세션 비밀값 교체

`SESSION_SECRET`이 새었거나 주기적으로 바꿀 때 로그인한 사용자를 끊지 않고 교체한다([SEC-001](../TASKS.md#sec-001-서버-보안-강화)). 서버는 `SESSION_SECRET_PREVIOUS`가 있으면 새 쿠키는 `SESSION_SECRET`으로 서명하고 검증은 두 값으로 한다([AUTH 해시·프록시](AUTH.md#해시프록시)).

1. 새 값을 만든다(32자 이상, 예: `openssl rand -base64 48`). 값은 서버의 비밀값 저장 위치에만 넣고 문서·로그·채팅에 남기지 않는다.
2. 지금 값을 `SESSION_SECRET_PREVIOUS`로 옮기고 `SESSION_SECRET`에 새 값을 넣은 뒤 서버를 재시작한다. 재시작으로 진행 중 소켓·경기는 끊기지만(재접속 복구 없음) 로그인 세션은 그대로다. 경기가 없는 시간에 한다.
3. 로그인·`GET /api/me`가 되는지 확인한다.
4. 서버 쪽 세션 만료(마지막 사용 후 24시간)가 지난 뒤 `SESSION_SECRET_PREVIOUS`를 지우고 다시 재시작한다. 그때까지 브라우저를 계속 열어 둔 사용자만 다시 로그인한다.

- **유출 대응**: 이전 값이 새었으면 2단계에서 `SESSION_SECRET_PREVIOUS`를 두지 않는다. 모든 사용자가 다시 로그인한다. 필요하면 `session` 테이블을 비워 서버 쪽 세션도 끝낸다.
- 교체 날짜와 이유만 worklog에 남기고 값은 적지 않는다.

### 의존성·취약점 관리

[DEC-095](../DECISIONS.md#결정-색인)에 따라 취약점은 알림으로 받고 PR은 자동으로 만들지 않는다.

- **알림**: 저장소의 Dependabot alerts가 켜져 있다. 자동 보안 수정 PR(security updates)과 버전 갱신 PR(`.github/dependabot.yml`)은 쓰지 않는다. 알림은 저장소 Security 탭에 쌓이고, 메일·웹 알림 여부는 GitHub 계정의 알림 설정(Dependabot alerts)을 따른다.
- **긴급**: 알림이 **운영 의존성**(스코프 runtime)의 **high·critical**이면 정기 패치를 기다리지 않고 작업 ID를 등록해 바로 고친다. 수정 버전이 없으면 영향 범위와 임시 조치를 worklog에 남긴다.
- **정기 패치(월 1회)**: 그 밖의 알림과 일반 갱신은 매달 한 번 모아 처리한다. 매달 TASKS에 `MNT-xxx YYYY-MM 정기 의존성 패치` 작업을 두고, 마무리 PR에서 다음 달 작업을 등록한다. 메이저 갱신은 호환성을 확인해 따로 정한다.
- **PR 검사**: CI `check` 작업의 `npm audit --omit=dev --audit-level=high`가 운영 의존성의 high 이상을 PR 단계에서 막는다. 개발 의존성 권고는 CI를 막지 않고 정기 패치에서 처리한다.

### 모니터링

[DEC-099](../DECISIONS.md#결정-색인). 구현은 [OBS-001](../TASKS.md#obs-001-모니터링알림)이다.

| 용도 | 도구 | 내용 |
| --- | --- | --- |
| 다운 감지 | UptimeRobot Free | `/health` 5분 간격 확인, 다운·복구 때만 Discord 알림 |
| 지표·로그 | Grafana Cloud Free + Alloy | 호스트(CPU·메모리·디스크·전송량)와 앱 지표(이벤트 루프 지연·힙·동시 소켓·진행 중 경기·`tick_skipped`·왕복 지연), Docker 로그. 보관 14일, Discord·Telegram 알림 |
| 트레이스 (2단계) | Grafana Cloud Tempo | OpenTelemetry로 HTTP 요청·DB 쿼리를 추적한다 |
| 오류 | Sentry Developer | 서버·브라우저 오류, 이메일 알림 |
| 한도 알림 | Grafana 알림 | 월 전송량·R2 저장량이 한도의 80%를 넘으면 알림 |

- 지표 라벨에 방·경기·소켓·사용자 ID를 쓰지 않는다(시계열 수 제한).
- 앱 지표 경로(`/metrics`)는 내부에서만 열고 Cloudflare 밖으로 공개하지 않는다.
- 서버 로그의 허용 목록 원칙([서버 로그](#서버-로그))은 Sentry·Grafana로 보내는 데이터에도 적용한다.

## 남은 미정·구현 단계 확인

- HostHatch 위치별 월 가격·결제 주기·부가세·공유 CPU 약관: 주문 때 확인한다([OPS-004](../TASKS.md#ops-004-운영-서버-구축)).
- 기존 Neon 데이터를 옮길지: 미정(기본안은 새로 시작).
- 급증 대응(동시 경기 상한 값과 안내 방식): 미정([PRD](../PRD.md#4-비기능-요구사항과-제약)).
- 자동 배포 절차(이미지 저장소·배포 방법·배포 뒤 확인·롤백): [OPS-003](../TASKS.md#ops-003-배포-자동화)에서 정한다.
- 측정 합격 목표값 중 PRD에 없는 항목: 첫 측정 뒤 정한다([ENGINEERING-VALIDATION](../ENGINEERING-VALIDATION.md)).

제품 정책이 미정인 항목은 구현 편의로 결정하지 않는다. 실제 장애 사례는 [TROUBLESHOOTING](../TROUBLESHOOTING.md), 날짜별 실행·결과는 worklog에서 관리한다.
