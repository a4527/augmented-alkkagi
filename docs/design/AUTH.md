# 인증·권한·입력 검증 설계

## 상태

| 구분 | 상태 |
| --- | --- |
| 승인된 미구현 설계 | 세션 쿠키 인증(express-session + connect-pg-simple), argon2id(@node-rs/argon2), Zod 입력 검증 ([DEC-013](../DECISIONS.md#결정-색인)). IP당 인증 요청 제한([DEC-025](../DECISIONS.md#결정-색인)). 세션 만료·비밀번호 변경 시 다른 세션 종료([DEC-028](../DECISIONS.md#결정-색인)) |
| 현재 구현 | 가입·로그인·로그아웃·`GET /api/me`·비밀번호 변경·캐릭터 변경 API, 세션, IP당 빈도 제한, argon2id, Socket.IO 연결 인증·중복 접속 대체(`packages/server/src/auth`·`realtime`, [IMPL-007](../legacy/TASKS-team.md#impl-007-인증)). 기권 명령 변환은 IMPL-009. HTTP 보안 헤더, Socket.IO 출처 확인·메시지 크기 상한, 경기 입력 사용자별 빈도 제한, 세션 비밀값 교체([SEC-001](../TASKS.md#sec-001-서버-보안-강화), `packages/server/src/security`·`realtime`·`game/game-rate-limit.ts`) |
| 확정 (AUTH-001 완료) | 아래 [AUTH-001](../legacy/TASKS-team.md#auth-001-인증-상세-설계-확정) 세부 설정, 인증 요청 빈도 제한의 한도·응답 형식, 검증 경계 |
| 미정 | 없음. 해시 시간은 구현 때 측정해 파라미터를 조정한다 |

제품의 가입·로그인·중복 접속·정보 수정 동작은 [화면](../PRD.md#화면별-요구사항)과 [게임 규칙](../PRD.md#게임-규칙), 민감정보·권한의 제품 제약은 [PRD](../PRD.md)를 따른다. 이 문서는 인증 상태 전달·인가·검증 구현을 관리한다.

## 인증 구성 (승인)

- 로그인 성공 시 서버 세션을 만들고 세션은 PostgreSQL에 저장한다(connect-pg-simple). Socket.IO 연결은 같은 세션 쿠키로 인증한다.
- 비밀번호는 argon2id(@node-rs/argon2)로 해시한다.
- 요청·이벤트 입력은 `shared`의 Zod 스키마로 검증한다.
- 세션 쿠키는 httpOnly, 배포 시 secure, sameSite=lax로 둔다. 클라이언트와 서버가 같은 출처라 CORS를 열지 않는다.

## 세부 설정 (확정안)

### 세션

- **만료**: 쿠키에 `maxAge`를 두지 않아 브라우저를 닫으면 만료된다([DEC-028](../DECISIONS.md#결정-색인)).
- **서버 쪽 안전 만료**: 브라우저가 탭을 복원하면 세션 쿠키가 남을 수 있어서 connect-pg-simple의 기본 만료(마지막 사용 후 24시간)를 그대로 쓴다. 별도 구현은 없다. 기본값(쿠키 `maxAge`가 없으면 `ttl` 1일, 만료 행은 기본 15분 주기로 정리)은 connect-pg-simple 10.0.0 README로 확인했고, 실제 DB로 만료 시각이 24시간 뒤이고 정리 호출이 만료 행을 지우는 것을 검증했다([worklog](../worklogs/2026-11-02.md#impl-007-인증)).
- **가입은 세션을 만들지 않는다**: 가입 API는 성공만 응답하고 사용자가 로그인한다([회원등록](../PRD.md#회원등록)).
- **비밀번호 변경**: 현재 세션만 남기고 같은 사용자의 다른 세션 행을 모두 삭제한다. 새 비밀번호 저장과 세션 행 삭제는 한 트랜잭션이며 연결 끊기는 커밋 뒤에 한다. 이미 열려 있는 다른 접속의 Socket.IO 연결도 끊어 `session:replaced`와 같은 흐름으로 로그인 화면으로 보낸다([DEC-028](../DECISIONS.md#결정-색인)).

### 해시·프록시

- **argon2id 파라미터**: `@node-rs/argon2` 기본값 대신 OWASP 최소 권장(메모리 19 MiB, 반복 2, 병렬 1)으로 시작하고 Render 무료 인스턴스의 해시 시간(목표 약 100~300ms)을 측정해 조정한다. 구현 때 이 PC(i5-1335U)에서는 해시 1회가 약 11ms였다. Render 무료 인스턴스에서 서버 안 로그로 11회 잰 결과 중앙값 약 311ms·평균 약 361ms(130~716ms)로 목표 상단에 걸쳐 **파라미터를 올리지 않고 그대로 둔다**([IMPL-013](../legacy/TASKS-team.md#impl-013-배포), [worklog](../worklogs/2026-11-05.md#impl-013-argon2id-해시-시간-서버-내-로그)). 더 내리면 OWASP 최소 권장 아래가 된다. 인스턴스 사양이 바뀌면 `argon2_timing` 로그로 다시 확인한다.
- **프록시 신뢰**: `app.set('trust proxy', TRUST_PROXY_HOPS)`(기본 1). 운영은 Cloudflare → Caddy 두 단계라 Compose가 2를 넣는다([DEC-098](../DECISIONS.md#결정-색인), [OPERATIONS 서버 구성 파일](OPERATIONS.md#서버-구성-파일)). Caddy는 Cloudflare 대역에서 온 요청에만 `X-Forwarded-For`를 이어 붙이므로, 서버가 오른쪽에서 두 단계를 건너 읽은 값이 Cloudflare가 본 접속자 IP다. 이전 Render 구성은 1단이었다. 운영에서의 확인은 [OPS-003](../TASKS.md#ops-003-배포-자동화)이다. `secure` 쿠키와 IP 제한이 이에 의존한다. 운영 설정에서 `X-Forwarded-Proto: https`가 있을 때 세션 쿠키에 `Secure`가 붙는 것을 테스트로 확인했다.
- **환경 변수**: `SESSION_SECRET`은 32자 이상이어야 서버가 시작한다. 교체 중에만 이전 값을 `SESSION_SECRET_PREVIOUS`(32자 이상, 현재 값과 달라야 함)로 함께 둔다. 새 쿠키는 현재 값으로 서명하고 검증은 두 값으로 한다. 절차는 [OPERATIONS 세션 비밀값 교체](OPERATIONS.md#세션-비밀값-교체)다. 값은 문서·로그에 남기지 않는다([OPERATIONS](OPERATIONS.md)).

### Socket.IO 인증·중복 접속

- 연결 시 세션 쿠키로 인증하고 실패하면 연결을 거부한다.
- **단일 인스턴스 전제**: 연결 등록부(사용자당 연결 하나)와 빈도 제한 카운터는 프로세스 메모리에 있다. 서버 인스턴스가 둘 이상이면 중복 접속 대체와 비밀번호 변경 시 연결 종료가 동작하지 않는다.
- 같은 계정의 새 연결이 생기면 기존 연결에 `session:replaced`를 보내고 끊는다. 기존 연결이 게임 중이었다면 별도 경로가 아니라 **방 큐의 기권 명령**으로 처리한다([GAME](GAME.md#명령-경합과-시간), [PRD](../PRD.md#연결-끊김과-중복-접속)). 비밀번호 변경으로 끊긴 연결도 같다. 접속 대체도 일반 이탈과 같은 규칙을 따른다. 시작 커밋 전이면 대기실 처리이고 결과 화면의 재도전 15초 구간은 기권이 아니다([GAME](GAME.md#명령-경합과-시간)).
- 재접속 복구는 없다. 끊기면 기권패이고 클라이언트는 로그인 화면으로 간다.
- **출처 확인**: 핸드셰이크 요청에 `Origin`이 있으면 그 호스트가 요청의 `Host`와 같을 때만 받는다(`realtime/origin.ts`). 다른 사이트의 페이지가 사용자의 쿠키로 소켓을 여는 것을 막는다. 브라우저는 WebSocket과 다른 출처 요청에 항상 `Origin`을 붙이므로, `Origin`이 없는 요청(같은 출처 폴링 GET·브라우저가 아닌 클라이언트)은 세션 인증만 거친다. 거부는 세션 조회 전 HTTP 403이다. Caddy·Cloudflare·Vite 개발 서버는 `Host`를 바꾸지 않는다. 포털(itch.io 등) 출처 허용은 [POR-001](../TASKS.md#por-001-itchio-배포)에서 정한다.
- **메시지 크기 상한**: 클라이언트 → 서버 메시지 한 개를 4 KiB로 제한한다(Socket.IO `maxHttpBufferSize`, 기본 1 MB). 가장 큰 정상 메시지는 모든 필드를 채운 `aim:update`로 359바이트이며 `realtime/socket.test.ts`가 스키마를 통과하는 최대 입력이 상한의 1/4 아래임을 고정한다. 넘는 메시지는 처리하지 않고 연결을 끊는다(경기 중이면 이탈과 같이 기권패). 폴링 전송도 클라이언트가 핸드셰이크의 상한에 맞춰 묶음을 나눠 보낸다.

### HTTP 보안 헤더

모든 응답(화면·정적 자산·API·헬스체크)에 붙인다(`security/headers.ts`).

- **CSP**: `default-src`·`script-src`·`style-src`·`img-src`·`font-src`·`media-src`·`connect-src`·`worker-src`를 모두 `'self'`로 둔다. 클라이언트의 스크립트·스타일·글꼴·이미지·소리·영상·Worker·SharedWorker·API·Socket.IO가 모두 같은 출처이고 외부 CDN을 쓰지 않기 때문이다. `connect-src 'self'`는 같은 호스트의 `ws:`·`wss:`도 허용한다(CSP Level 3). `object-src 'none'`, `base-uri 'none'`, `form-action 'self'`, `frame-ancestors 'none'`(다른 사이트의 iframe 금지, 포털 허용은 POR-001). 인라인 스크립트·스타일·`eval`은 허용하지 않는다. React의 `style` 속성은 CSSOM으로 적용돼 막히지 않는다.
- **Zod JIT**: Zod 4는 객체 스키마를 만들 때 `Function('')`으로 JIT 가능 여부를 시험해 CSP 위반 보고를 남긴다(검증은 일반 경로로 정상 동작). 브라우저 진입점(`main.tsx`·`ai-worker.ts`·`local-worker.ts`)이 첫 import로 `@alkkagi/shared/no-jit`을 불러 스키마가 만들어지기 전에 JIT를 끈다. 서버는 CSP 대상이 아니라 끄지 않는다.
- **그 밖**: `X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin`. 운영(`NODE_ENV=production`)에서만 `Strict-Transport-Security: max-age=31536000`을 붙인다. `includeSubDomains`·`preload`는 도메인을 정할 때([OPS-004](../TASKS.md#ops-004-운영-서버-구축)) 판단한다.
- 화면별 확인 결과는 [worklog](../worklogs/2026-11-27.md#sec-001-서버-보안-강화)에 있다.

### 오류 형식

REST와 Socket.IO ack의 오류 형식·코드 목록은 [API](API.md#오류-형식과-코드)에서 한 곳으로 관리한다. 인증 관련 코드는 `INVALID_INPUT`·`UNAUTHENTICATED`·`INVALID_CREDENTIALS`·`NICKNAME_TAKEN`·`RATE_LIMITED`다. 로그인 실패는 닉네임 없음과 비밀번호 틀림을 구분하지 않는다.

## 검증 경계

[게임 규칙](../PRD.md#게임-규칙)과 [방해요소 규칙](../PRD.md#방해요소-규칙)의 유효성·권한은 클라이언트를 믿지 않고 서버가 세 단계로 강제한다. 규칙 값과 전체 동작은 제품 문서·[GAME](GAME.md)을 따르고 여기서는 검사 위치와 오류 계약만 정한다.

| 단계 | 위치 | 검사 | 실패 시 |
| --- | --- | --- | --- |
| 1. 연결·입력 형태 | Socket.IO 연결 미들웨어, 이벤트 핸들러 | 세션 쿠키로 사용자 인증. 이벤트 입력을 `shared`의 Zod 스키마로 검증. 사용자는 세션에서만 얻고 입력에 사용자 번호를 받지 않는다 | 연결 거부 또는 ack `INVALID_INPUT` |
| 2a. 사용자→좌석 변환 | `game-runtime`·서버(B). 시작 커밋 때 메모리에 만든 맵 | 연결의 사용자를 좌석 0·1로 바꿔 `game-core`에 전달한다. 좌석은 입력에서 받지 않는다. 맵에 없는 사용자(경기 중이 아님)의 경기 명령은 `GAME_NOT_ACTIVE`다(방 명령의 `NOT_IN_ROOM`·`NOT_HOST`는 `room:start`와 함께 없앴다, DEC-040) | ack `GAME_NOT_ACTIVE` |
| 2b. 경기 규칙 | `game-core`(A). 방별 단일 큐에서 틱 안에 검증하며 `users.id`를 모르고 좌석만 받는다 | 발사는 아래 순서로 첫 실패에서 멈춘다: `GAME_NOT_ACTIVE` → `STALE_TURN`(gameId·turnId. 마감 정산이 명령 처리보다 먼저라 마감 뒤 도착한 발사도 턴이 넘어가 이 코드) → `NOT_YOUR_TURN` → `SHOT_ALREADY_SUBMITTED`(`shotCommitted`) → `INVALID_STONE` → `PLAYER_STUNNED` → `OUT_OF_REACH`. 기본 판 돌리기는 `GAME_NOT_ACTIVE` → `STALE_TURN` → `NOT_YOUR_TURN` → `BOARD_ROTATE_NOT_ALLOWED`(조준 단계 아님·이미 발사함·기절) ([DEC-036](../DECISIONS.md#결정-색인), 제안). 방해요소는 `GAME_NOT_ACTIVE` → `STALE_HAZARD`(gameId·hazardInstanceId로 서버가 가진 내 보유 1개와 대조) → `HAZARD_NOT_USABLE` → `HAZARD_COOLDOWN`·`HAZARD_OVERHEATED` → `HAZARD_INVALID_TARGET` | 해당 오류 코드로 ack. 거부된 명령은 상태와 난수를 바꾸지 않는다 |

- **무작위 지급의 공정성**: 지급·교체 추첨과 책상 흔들기 같은 난수는 서버가 가진 경기별 독립 PRNG 스트림만 쓴다. 클라이언트는 난수 값·시드를 보내거나 받지 않는다. 로컬·AI 모드는 같은 `game-core`를 브라우저에서 돌리며 서버 권한 대상이 아니다([DEC-021](../DECISIONS.md#결정-색인)).
- **비공개 정보 노출**: 상대 보유 방해요소·교체 추첨 결과·게이지·쿨타임·시드는 `getViewFor`의 허용 목록 방식으로 걸러 보내지 않는다. 필드 단위 점검은 [API 상대 비공개 필드 점검](API.md#상대-비공개-필드-점검)에 있다.
- **감수하는 위험**: 조준 방향·세기는 클라이언트가 계산해 보내므로 바람·세기 막대 효과 무시 같은 조작은 서버가 알 수 없다([GAME](GAME.md#방해요소별-처리), [DEC-026](../DECISIONS.md#결정-색인)). 서버는 값 범위·알 소유·기절·마감·turnId만 검증한다. 발사 각도 범위는 구현 때 정해 API의 미정 표시를 푼다(제안: 유한한 숫자이며 판 좌표계 (−π, π]만 받고, 범위 밖·NaN은 `INVALID_INPUT`. IMPL-002가 임시로 따랐으나 승인 전). 세기는 0 초과 100 이하다([API](API.md)).
- 위 검사 순서는 개발자 A가 GAME의 [명령 경합과 시간](GAME.md#명령-경합과-시간)과 대조해 확인했고, GAME도 이 순서를 따른다.
- 이탈·기권·접속 대체는 같은 방 큐의 기권 명령이라 검증 단계 2와 순서가 섞이지 않는다([GAME](GAME.md#명령-경합과-시간)).

## 인증 요청 빈도 제한

닉네임별 로그인 실패 제한은 두지 않는다. `/api/auth/*` 요청을 **IP당 분당 20회**로 제한한다([로그인](../PRD.md#로그인), [DEC-025](../DECISIONS.md#결정-색인)).

- 닉네임이 방 목록에 공개돼 있어 비밀번호를 계속 대입해 볼 수 있다는 점은 감수한다. IP당 제한과 argon2id 해시 시간이 최소한의 방어다. 부족하면 로그인 실패 제한을 다시 검토한다.
- 구현은 `express-rate-limit`의 메모리 저장을 쓴다. 인스턴스가 1개라 충분하다. 서버가 재시작하면 카운터가 초기화되는 것은 감수한다.
- 한도: 고정 1분 창에서 IP당 20회. `signup`·`login`·`logout`이 하나의 카운터를 공유한다. 성공·실패 요청을 모두 센다.
- 초과 응답: HTTP `429`, 본문 `{ error: { code: "RATE_LIMITED", message } }`([API 오류 형식](API.md#오류-형식과-코드)), `Retry-After` 헤더(초). 응답은 닉네임·비밀번호와 무관하다. 클라이언트가 읽는 계약이라 [API](API.md#오류-형식과-코드)에도 적었다.
- 학교·공용 NAT처럼 같은 IP를 여러 명이 쓰면 가입·로그인이 몰릴 수 있다. 플레이 테스트에서 걸리면 한도를 올린다.
- 클라이언트 IP를 얻으려면 위 프록시 신뢰 설정이 필요하다.
- `room:join`에도 사용자당 빈도 제한을 둔다([API](API.md#방-이벤트-필드)). 한도는 사용자당 분당 30회이며 초과하면 ack `RATE_LIMITED`를 돌려준다. 카운터는 `userId`를 키로 한 메모리 맵에 두어 재접속해도 초기화되지 않게 한다(6자리 코드 대입 방어). 서버가 재시작하면 사라진다.

## 경기 입력 빈도 제한

경기 Socket.IO 입력에 사용자별 1초 고정 창 한도를 둔다(`game/game-rate-limit.ts`, [SEC-001](../TASKS.md#sec-001-서버-보안-강화)). 카운터는 `room:join`과 같이 `userId`를 키로 한 메모리 맵이라 재접속해도 이어지고 서버가 재시작하면 사라진다.

| 묶음 | 이벤트 | 한도(초당) | 초과 시 |
| --- | --- | --- | --- |
| 경기 명령 | `shot:submit`·`hazard:use`·`game:forfeit`·`emote:send`·`rematch:request` (함께 센다) | 10 | ack `RATE_LIMITED`. 입력 검증·방 큐에 넣지 않는다 |
| 판 돌리기 | `board:rotate` | 30 | ack `RATE_LIMITED`(클라이언트는 조용히 무시하고 다음 스냅샷을 따른다) |
| 조준 | `aim:update` | 30 | 상대에게 중계하지 않는다 |
| 방해요소 조준 | `hazard:aim` | 30 | 처리하지 않는다 |

- **한도 근거**: 클라이언트 코드에서 정상 입력의 최대 빈도를 확인했다. 조준·판 돌리기·방해요소 조준은 각각 50ms 간격(`STREAM_INTERVAL_MS`, 최대 20Hz)으로 보내고, 경기 명령은 키 반복(`e.repeat`)을 거른 사람의 클릭·키 입력이라 초당 몇 번을 넘지 않는다. 한도는 그 최대치에 1.5배 이상 여유를 둔 값이다. 실제 두 사람 온라인 경기에서의 빈도는 아직 재지 않았다. 운영에서 정상 사용자가 걸리는지는 아래 로그로 보고 한도를 고친다.
- **기록**: 사용자·묶음마다 한도를 넘긴 첫 호출에서만 서버 로그 `rate_limited`를 한 줄 남긴다([OPERATIONS 서버 로그](OPERATIONS.md#서버-로그)).
- 로컬 2인·AI 대전은 브라우저 안에서 돌아 서버 한도가 없다.

계정 삭제와 건의 기능은 MVP에서 제공하지 않으므로 해당 인가 경계는 두지 않는다. 비밀번호 길이는 제품 규칙(8~64자)을 따른다. 닉네임 중복 검사는 NFC 정규화·영문 대소문자 무시 기준([회원등록](../PRD.md#회원등록))으로 하며 DB의 `lower(nickname)` 유니크 인덱스가 강제한다([DATABASE](DATABASE.md)).
