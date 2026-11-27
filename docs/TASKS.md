# 작업

## 관리 원칙

작업별로 관련 PRD·설계 절과 worklog 검증 근거를 연결한다. 2026-11-25 개인 프로젝트 전환 전의 작업(DOC-001~012, IMPL·설계 작업 등 64건)은 [팀 시절 작업 기록](legacy/TASKS-team.md)에 동결했다([DEC-092](DECISIONS.md#결정-색인)). 과거 작업을 따라갈 때만 읽는다. 문서별 작성 경계는 [AGENTS](../AGENTS.md#작업-목적에-따라-읽을-문서)를 따른다.

[GitHub Issues](https://github.com/a4527/augmented-alkkagi/issues)는 작업 메모·외부 연결에 사용할 수 있다. 2026-11-25 개인 프로젝트 전환([DEC-091](DECISIONS.md#결정-색인)) 전 작업의 Issue·PR 링크는 [팀 저장소](https://github.com/moguab2808-commits/mini-project-1-1)를 가리키며 기록으로 유지한다. 상태와 수용 기준은 이 문서를 기준으로 하고, Issue에는 작업 ID와 해당 절 링크를 남긴다. [Issue 양식](templates/ISSUE_TASK.md)과 [협업 규칙](CONTRIBUTING.md)을 따른다.

## 상태·우선순위

| 상태 | 의미 |
| --- | --- |
| 예정 | 등록됐으나 착수하지 않음 |
| 진행 중 | 범위에 따라 수정·합의·검증 중 |
| 막힘 | 진행 불가 조건과 해소 조건을 해당 작업에 기록 |
| 리뷰 중 | 검증 근거와 변경을 PR로 제출하고 리뷰를 기다림 |
| 완료 | 수용 기준 충족, 검증 근거 연결, 리뷰(1인 개발은 [자기 검토](CONTRIBUTING.md#자기-검토)) 후 기준 브랜치 병합. 1인 개발은 마무리 PR에서 완료로 바꾸고 병합한다 |
| 취소 | 결정 철회 등으로 하지 않기로 함. 근거 DEC와 사유를 해당 작업에 기록 |

우선순위는 P0(현재 진행을 막는 작업), P1(다음 착수 대상), P2(이후 검토)로 표시한다. 우선순위·작업 등록은 미정 제품 정책·기술안을 승인하는 행위가 아니다.

## 작업 목록

| ID | 작업 | 우선순위 | 의존성 | 상태 | 담당 | Issue·PR |
| --- | --- | --- | --- | --- | --- | --- |
| [DOC-013](#doc-013-개인-프로젝트-전환) | 개인 프로젝트 전환 | P1 | 없음 | 완료 | Claude — 사용자 요청 수행 | [PR #1](https://github.com/a4527/augmented-alkkagi/pull/1) |
| [DOC-014](#doc-014-팀-시절-작업진행-기록-분리) | 팀 시절 작업·진행 기록 분리 | P1 | DOC-013 | 완료 | Claude — 사용자 요청 수행 | [PR #3](https://github.com/a4527/augmented-alkkagi/pull/3) |
| [DOC-015](#doc-015-포트폴리오-1부-단일-html) | 포트폴리오 1부 단일 HTML | P2 | 없음 | 완료 | Claude — 사용자 요청 수행 | 미생성 |
| [DOC-016](#doc-016-운영-보완-결정과-작업-등록) | 운영 보완 결정과 작업 등록 | P1 | 없음 | 완료 | Claude — 사용자 요청 수행 | [PR #6](https://github.com/a4527/augmented-alkkagi/pull/6) |
| [CI-001](#ci-001-pr-검사-자동화) | PR 검사 자동화 | P1 | 없음 | 완료 | Claude — 사용자 요청 수행 | [PR #6](https://github.com/a4527/augmented-alkkagi/pull/6), [PR #12](https://github.com/a4527/augmented-alkkagi/pull/12) |
| [SEC-001](#sec-001-서버-보안-강화) | 서버 보안 강화 | P1 | 없음 | 완료 | Claude — 사용자 요청 수행 | [PR #14](https://github.com/a4527/augmented-alkkagi/pull/14) |
| [OPS-002](#ops-002-0원-호스팅-재검토) | 0원 호스팅 재검토 | P1 | 없음 | 완료 | Claude — 사용자 요청 수행 | [PR #13](https://github.com/a4527/augmented-alkkagi/pull/13) |
| [OPS-004](#ops-004-운영-서버-구축) | 운영 서버 구축 | P1 | OPS-002 | 완료 | Claude — 사용자 요청 수행 | [PR #15](https://github.com/a4527/augmented-alkkagi/pull/15) |
| [OPS-005](#ops-005-db-백업복구) | DB 백업·복구 | P1 | OPS-004 | 완료 | Claude — 사용자 요청 수행 | 미생성 |
| [OPS-003](#ops-003-배포-자동화) | 배포 자동화 | P1 | CI-001, OPS-004 | 예정 | 미정 | 미생성 |
| [OBS-001](#obs-001-모니터링알림) | 모니터링·알림 | P1 | OPS-004 | 예정 | 미정 | 미생성 |
| [VAL-003](#val-003-부하e2e-검증) | 부하·E2E 검증 | P2 | CI-001, OPS-004 | 예정 | 미정 | 미생성 |
| [POR-001](#por-001-itchio-배포) | itch.io 배포 | P1 | OPS-004, OPS-003 | 예정 | 미정 | 미생성 |
| [POR-002](#por-002-crazygames-배포) | CrazyGames 배포 | P2 | POR-001 | 예정 | 미정 | 미생성 |
| [MNT-001](#mnt-001-2026-12-정기-의존성-패치) | 2026-12 정기 의존성 패치 | P2 | 없음 | 예정 | 미정 | 미생성 |

## 새 작업 등록 양식

```markdown
## <작업 ID> <작업명>

우선순위: P0/P1/P2
상태: 예정
담당: 미정
의존성: 없음 또는 선행 작업 ID
범위: 작업의 결과와 경계
관련 문서: PRD 절 / DESIGN 상세 절 / DEC ID
Issue·PR: 링크 또는 미생성

수용 기준:
- [ ] 확인할 사용자 동작·오류·경계와 관찰 가능한 결과

검증 근거: 날짜별 worklog의 해당 작업 절
막힘·해소 조건: 해당할 때 작성
```

## DOC-013 개인 프로젝트 전환

우선순위: P1
상태: 완료
담당: Claude — 사용자 요청 수행
의존성: 없음
범위: 2인 팀 프로젝트에서 개인 프로젝트로 전환한 결정을 기록하고, README 출처와 협업 규칙을 1인 개발에 맞게 고친다. gitleaks 오탐을 `.gitleaksignore`에 등록한다. 과거 작업의 담당·Issue·PR 기록과 제품 요구사항·설계는 바꾸지 않는다.
관련 문서: [DEC-091](DECISIONS.md#결정-색인), [README 출처](../README.md#출처), [CONTRIBUTING](CONTRIBUTING.md)
Issue·PR: [PR #1](https://github.com/a4527/augmented-alkkagi/pull/1)

수용 기준:

- [x] DECISIONS에 전환 결정(일자·저장소 기준·리뷰 방식·과거 기록 처리)을 동의 근거와 함께 기록한다.
- [x] README에 팀 프로젝트에서 시작한 출처와 현재 저장소, 공동 기여 기록 위치를 밝힌다.
- [x] CONTRIBUTING에서 담당 조율·상대방 리뷰를 1인 개발의 흐름·자기 검토로 바꾸고, TASKS의 완료 정의·Issue 안내와 어긋나지 않는다.
- [x] `tests/integration/online.db.test.ts`의 테스트용 세션 키 오탐을 `.gitleaksignore`에 등록하고 `gitleaks git`·`gitleaks dir`가 누출 없음으로 끝난다.
- [x] 전체 문서의 상대 링크·앵커, 협업 규칙 문구, TASKS 표와 본문 상태, README 배포 안내를 대조하고 어긋난 곳을 고친다.
- [x] 자기 검토 후 기준 브랜치에 병합됐다([PR #1](https://github.com/a4527/augmented-alkkagi/pull/1), 2026-11-25 병합 `d0e221e`).

검증 근거: [2026-11-25 worklog](worklogs/2026-11-25.md#doc-013-개인-프로젝트-전환)

## DOC-014 팀 시절 작업·진행 기록 분리

우선순위: P1
상태: 완료
담당: Claude — 사용자 요청 수행
의존성: DOC-013
범위: 문서를 읽는 컨텍스트를 줄이려고 팀 시절 TASKS·PROGRESS를 `docs/legacy/`로 옮겨 동결하고, TASKS·PROGRESS를 개인 프로젝트 기준으로 짧게 다시 쓴다. 진행 중이던 팀 시절 작업 12건은 이어 가지 않고 닫는다. 다른 문서의 링크를 옮긴 위치로 바꾼다. DECISIONS는 옮기지 않는다. 사용자 후속 요청으로 병합 후 완료 반영 PR을 없애는 규칙 변경([DEC-093](DECISIONS.md#결정-색인))도 함께 한다.
관련 문서: [DEC-092](DECISIONS.md#결정-색인), [팀 시절 작업 기록](legacy/TASKS-team.md), [팀 시절 진행 기록](legacy/PROGRESS-team.md), [AGENTS 문서 구조](../AGENTS.md#문서-구조)
Issue·PR: [PR #3](https://github.com/a4527/augmented-alkkagi/pull/3)

수용 기준:

- [x] 팀 시절 작업 64건의 절·표가 `docs/legacy/TASKS-team.md`에 옮기기 전 내용 그대로 있고, 진행 중이던 12건은 종료로 표시돼 있다.
- [x] 새 TASKS에는 관리 원칙·상태·작업 목록·등록 양식과 개인 프로젝트 작업(DOC-013~)만 있다.
- [x] PROGRESS를 개인 프로젝트 기준으로 다시 쓰고 팀 시절 내용은 `docs/legacy/PROGRESS-team.md`에 그대로 둔다.
- [x] AGENTS의 문서 책임 표·구조·작업 규칙에 legacy 위치와 읽기 조건을 적고, DECISIONS에 결정을 기록한다.
- [x] 저장소 Markdown 전체의 상대 링크·앵커가 깨지지 않고, 과거 기록(이전 worklog·legacy·DEC-001~090)의 TASKS·PROGRESS 링크는 legacy를 가리킨다.
- [x] CONTRIBUTING·PR 양식·TASKS 완료 정의를 "마무리 PR에서 완료 표시, 병합 후 완료 반영 PR 없음"으로 고치고 DEC-093을 기록한다.

검증 근거: [2026-11-25 worklog](worklogs/2026-11-25.md#doc-014-팀-시절-작업진행-기록-분리)

## DOC-015 포트폴리오 1부 단일 HTML

우선순위: P2
상태: 완료
담당: Claude — 사용자 요청 수행
의존성: 없음
범위: 포트폴리오 1부(claude.ai Artifact, 조직 밖 공유 꺼짐)를 어디서나 열리는 HTML 한 파일로 만들어 저장소 루트에 둔다. 내용·수치는 1부(기준 커밋 `87dfdcd`) 그대로 두고, 사용자 요청에 따라 소제목 번호의 강조와 줄글 너비만 바꾼다. 웹 공개(GitHub Pages 등)는 하지 않는다.
관련 문서: [AGENTS 문서 구조](../AGENTS.md#문서-구조), [CREDITS](CREDITS.md)
Issue·PR: 미생성

수용 기준:

- [x] `augmented-alkkagi-portfolio-1.html` 한 파일만으로 이미지 11장과 제목 글꼴이 보이고, 상대 경로 참조·스크립트가 없다.
- [x] 데스크톱(1280px)·모바일(390px)과 네트워크를 막은 상태에서 레이아웃·이미지가 원본과 같게 나온다.
- [x] 소제목 번호(01·02 등)가 강조색·굵은 글씨로 보이고, 줄글 너비가 표·사진 너비(64rem)와 맞는다.
- [x] 파일 안에 넣은 글꼴의 출처·이용 조건을 CREDITS에 적고 비밀값 검사에서 누출이 없다.

검증 근거: [2026-11-25 worklog](worklogs/2026-11-25.md#doc-015-포트폴리오-1부-단일-html)

## DOC-016 운영 보완 결정과 작업 등록

우선순위: P1
상태: 완료
담당: Claude — 사용자 요청 수행
의존성: 없음
범위: 클라우드·DevOps·아키텍처 관점의 보완 검토(보안·운영·모니터링·CI/CD·검증)에서 사용자가 정한 방향(배포 자동화, 월 0원 유지, 호스팅 재검토 허용, 백업 보류)을 결정으로 기록하고, 관련 설계 문서에 예정·미정을 표시하고, 보완 작업을 등록한다. 코드·배포 설정은 바꾸지 않는다.
관련 문서: [DEC-094](DECISIONS.md#결정-색인), [OPERATIONS](design/OPERATIONS.md), [TECH_STACK](design/TECH_STACK.md#채택한-기술)
Issue·PR: [PR #6](https://github.com/a4527/augmented-alkkagi/pull/6)

수용 기준:

- [x] DECISIONS에 DEC-094(배포 자동화·0원 유지·호스팅 재검토·백업 보류)를 동의 근거와 함께 기록하고, DEC-013·029·047의 대체 관계에 연결한다.
- [x] OPERATIONS에 자동 배포 전환 예정(구현 전까지 수동 배포 유지)·호스팅 재검토·백업 보류를 표시하고, 현재 구현과 승인된 미구현 설계를 구분한다. TECH_STACK의 배포 행에 재검토 중임을 적는다.
- [x] 보완 작업(CI-001·SEC-001·OPS-002·OPS-003·OBS-001·VAL-003)을 범위·의존성·수용 기준과 함께 등록하고, 미정 사항을 확정하지 않고 해당 작업에 연결한다.
- [x] 저장소 Markdown의 상대 링크·앵커가 깨지지 않고 비밀값 검사에서 누출이 없다.

검증 근거: [2026-11-26 worklog](worklogs/2026-11-26.md#doc-016-운영-보완-결정과-작업-등록)

## CI-001 PR 검사 자동화

우선순위: P1
상태: 완료
담당: Claude — 사용자 요청 수행
의존성: 없음
범위: GitHub Actions로 PR과 `main` 푸시마다 저장소의 기존 검사 명령과 비밀값 검사를 실행하고, 통과를 병합 조건으로 둔다. 의존성 취약점은 알림으로 받는다(자동 PR 없음, [DEC-095](DECISIONS.md#결정-색인)). 배포는 [OPS-003](#ops-003-배포-자동화)에서 다룬다. 공개 저장소의 무료 범위 안에서 운영한다([DEC-094](DECISIONS.md#결정-색인)). CI에서 처음 실행한 `test:db`가 드러낸 낡은 테스트 기대값을 현행 계약에 맞춘다.
관련 문서: [LOCAL](design/LOCAL.md), [ENGINEERING-VALIDATION](ENGINEERING-VALIDATION.md#기능회귀-검증-설계-후보), [CONTRIBUTING 자기 검토](CONTRIBUTING.md#자기-검토)
Issue·PR: [PR #6](https://github.com/a4527/augmented-alkkagi/pull/6), [PR #12](https://github.com/a4527/augmented-alkkagi/pull/12)

수용 기준:

- [x] PR과 `main` 푸시에서 `npm ci` 뒤 `npm run lint`·`npm run format`·`npm run build`(타입 검사 포함)·`npm test`가 실행되고, 하나라도 실패하면 검사가 실패로 표시된다.
- [x] `npm run test:db`가 워크플로 안의 PostgreSQL 서비스 컨테이너로 실행된다. 접속 정보는 테스트 전용 값이며 저장소 비밀값을 쓰지 않는다.
- [x] gitleaks가 PR의 변경 이력을 검사해 `.gitleaksignore` 밖의 누출이 있으면 실패한다.
- [x] `main` 브랜치 보호에서 위 검사 통과를 병합 조건으로 두고 직접 푸시를 막는다. 일부러 실패시킨 PR에서 병합 버튼이 막히는 것을 확인한다.
- [x] 의존성 취약점이 공개되면 저장소 알림(Dependabot alerts)으로 알 수 있고, 갱신·보안 수정 PR은 자동으로 만들어지지 않는다([DEC-095](DECISIONS.md#결정-색인)). 저장소 설정 API로 알림 켜짐·자동 보안 수정 꺼짐을 확인하고, 버전 갱신 설정 파일(`.github/dependabot.yml`)이 없다. 처음 넣었던 주간 갱신 PR 방식은 기본 브랜치 반영 뒤 PR 4건이 만들어지고 CI를 거치는 것까지 확인한 뒤 이 방식으로 바꿨다.
- [x] 워크플로의 실행 시간과 무료 범위(공개 저장소 Actions)를 worklog에 기록하고, CONTRIBUTING 자기 검토에 CI 결과 확인을 넣는다.

검증 근거: [2026-11-26 worklog](worklogs/2026-11-26.md#ci-001-pr-검사-자동화), [의존성 관리 방식 변경](worklogs/2026-11-26.md#ci-001-의존성-관리-방식-변경)

## SEC-001 서버 보안 강화

우선순위: P1
상태: 완료
담당: Claude — 사용자 요청 수행
의존성: 없음
범위: HTTP 보안 헤더와 Socket.IO 연결·메시지 경계를 강화한다. 대상은 출처 확인, 메시지 크기, 경기 명령·조준 스트림 빈도 제한이다. 사용자당 소켓 연결은 이미 1개로 대체되므로(`realtime/connections.ts`) 연결 수 제한은 범위에서 뺀다. 인증 방식·세션 정책은 바꾸지 않는다. 포털 출처 허용은 [POR-001](#por-001-itchio-배포)에서 다룬다.
관련 문서: [AUTH](design/AUTH.md), [API](design/API.md), [ENGINEERING-VALIDATION 비공개 정보·권한](ENGINEERING-VALIDATION.md#최소-측정-항목)
Issue·PR: [PR #14](https://github.com/a4527/augmented-alkkagi/pull/14)

수용 기준:

- [x] 응답에 CSP·`X-Content-Type-Options`·`Referrer-Policy`, 운영에서 HSTS가 붙는다. 로그인·로비·온라인 경기·로컬 2인·AI 대전 화면(Worker·SharedWorker·WebGL·오디오·글꼴·영상)이 CSP 위반 없이 동작한다.
- [x] 허용하지 않은 출처(Origin)의 Socket.IO 연결이 거부되고, 같은 출처 연결은 그대로 된다.
- [x] Socket.IO 메시지 크기 상한을 기본값(1MB)에서 실제 최대 메시지에 맞춰 줄이고, 넘는 메시지는 처리하지 않는다.
- [x] 경기 명령(`shot:submit` 등)과 응답 없는 스트림(`aim:update`·`hazard:aim`)에 사용자별 빈도 제한이 있다. 한도를 넘는 명령은 오류 ack로 거부하고 스트림은 상대에게 전달하지 않는다. 한도 값은 정상 플레이 관찰로 정해 근거와 함께 AUTH에 적는다.
- [x] 위 경계와 상대 비공개 정보(보유 방해요소) 비노출을 단위·통합 테스트로 고정하고 기존 `npm test`·`npm run test:db`가 통과한다.
- [x] 세션 서명 비밀값 교체 절차(이전 값을 함께 받는 무중단 교체)를 OPERATIONS에 적는다.

검증 근거: [2026-11-27 worklog](worklogs/2026-11-27.md#sec-001-서버-보안-강화). 한도는 클라이언트 코드의 최대 빈도와 자동 연속 입력으로 정했고 사람 두 명의 실제 경기 빈도는 운영 로그(`rate_limited`)로 본다. HSTS의 HTTPS 브라우저 확인은 OPS-004

## OPS-002 0원 호스팅 재검토

우선순위: P1
상태: 완료
담당: Claude — 사용자 요청 수행
의존성: 없음
범위: 월 0원 조건([DEC-094](DECISIONS.md#결정-색인))으로 Render 유지와 다른 호스팅을 비교해 하나를 정한다. 운영 재개 여부와 운영 계정도 함께 정한다. DB(Neon)를 바꿀지도 비교에 넣되, 바꾸지 않으면 현행을 유지한다. 비교와 추천까지가 Claude의 범위이고 선택은 사용자가 한다. 진행 중 사용자가 게임 포털 배포([DEC-097](DECISIONS.md#결정-색인))와 운영 기준([DEC-096](DECISIONS.md#결정-색인), 월 1만 원 이하·24시간 이용·계정 손실 없음 등)을 새로 정해 비교 조건을 그 기준으로 바꿨다.
관련 문서: [OPERATIONS 비용·한도](design/OPERATIONS.md#비용한도-확인-2026-11-26), [ADR-0005](adr/0005-hosting-and-data.md), [PRD 비기능 요구사항](PRD.md#4-비기능-요구사항과-제약)
Issue·PR: [PR #13](https://github.com/a4527/augmented-alkkagi/pull/13)

수용 기준:

- [x] Render를 포함한 후보 3개 이상을 공식 문서(확인일 포함)로 비교한다. 비교 기준은 다음과 같다: 카드 등록·체험 크레딧 소진 뒤에도 비용 조건 안에서 상시 실행되는지, WebSocket 지원, 단일 인스턴스 메모리 상태 유지(자동 축소·재시작·절전), 첫 접속 시간, 한국에서의 지연과 DB와의 거리, Git 연동 자동 배포·롤백, 로그 보관. 비용 조건은 작업 중 월 0원에서 월 1만 원 이하로 바뀌었다([DEC-096](DECISIONS.md#결정-색인)).
- [x] 사용자가 고른 결과를 기록한다. 호스팅을 바꾸면 ADR과 새 DEC로, 유지하면 DEC로 남긴다. 운영 재개 여부·계정도 같은 결정에 적는다.
- [x] OPERATIONS·TECH_STACK·README 배포 절을 결정에 맞게 고친다.

검증 근거: [2026-11-26 worklog](worklogs/2026-11-26.md#ops-002-운영-인프라-재검토)

## OPS-003 배포 자동화

우선순위: P1
상태: 예정
담당: 미정
의존성: CI-001, OPS-004
범위: [DEC-094](DECISIONS.md#결정-색인)에 따라 `main`의 커밋이 CI를 통과하면 자동으로 배포하고, 배포 뒤 상태를 확인하고, 실패를 알린다. 대상은 [DEC-098](DECISIONS.md#결정-색인)의 VM(Docker Compose)이며 이미지 저장소·배포 방법(예: GHCR + SSH)은 이 작업에서 정한다. 진행 중 경기는 배포 때 끊기는 현행 정책을 유지하고 이용자가 적은 시간에 배포한다([DEC-096](DECISIONS.md#결정-색인)). 프록시 단계 설정(`TRUST_PROXY_HOPS`, 운영 2)은 OPS-004에서 넣었고 여기서는 운영에서 클라이언트 IP 판별을 확인한다.
관련 문서: [OPERATIONS 배포·롤백](design/OPERATIONS.md#배포롤백), [DATABASE 마이그레이션](design/DATABASE.md#마이그레이션), [AUTH](design/AUTH.md)
Issue·PR: 미생성

수용 기준:

- [ ] CI를 통과한 `main` 커밋만 배포가 시작되고, CI가 실패한 커밋은 배포되지 않는다. 두 경우 모두 실제로 확인한다.
- [ ] 배포 뒤 `/health`와 첫 화면(`/`)을 자동으로 확인하고, 배포나 확인이 실패하면 알림을 받는다.
- [ ] 배포 설정(Compose·워크플로)은 저장소에 두고 비밀값은 VM의 저장소 밖 환경 파일과 GitHub 비밀 저장소에만 둔다. 배포용 SSH 키는 배포 전용이다.
- [ ] Cloudflare·Caddy 뒤에서 요청의 클라이언트 IP가 실제 접속자 IP로 판별되어 IP당 빈도 제한이 동작하고, 운영 쿠키에 `secure`가 붙는다. AUTH의 프록시 신뢰 절을 고친다.
- [ ] 시작 시 마이그레이션이 실패할 때 서비스 상태(이전 버전 유지 여부)를 확인해 기록한다.
- [ ] 이전 이미지로 되돌리는 롤백 절차를 쓰고 한 번 실행해 본다. OPERATIONS 배포·롤백 절과 README를 고친다.

검증 근거: 작업일의 worklog

## OPS-004 운영 서버 구축

우선순위: P1
상태: 완료
담당: Claude — 사용자 요청 수행
의존성: OPS-002
범위: [DEC-098](DECISIONS.md#결정-색인)·[ADR-0005](adr/0005-hosting-and-data.md)의 VM·도메인·Compose 구성을 만들고 서버·DB를 띄운다. 백업은 [OPS-005](#ops-005-db-백업복구), 자동 배포는 [OPS-003](#ops-003-배포-자동화), 모니터링은 [OBS-001](#obs-001-모니터링알림)에서 한다. 계정 생성·결제·비밀값 입력은 사용자가 하고 Claude는 설정 파일·절차를 준비한다.
관련 문서: [OPERATIONS 운영 구성](design/OPERATIONS.md#운영-구성-승인-미구현), [PRD 비기능 요구사항](PRD.md#4-비기능-요구사항과-제약)
Issue·PR: [PR #15](https://github.com/a4527/augmented-alkkagi/pull/15)

수용 기준:

- [x] 주문 전에 HostHatch 서울(차선 도쿄)의 월 가격·결제 주기·부가세·공유 CPU 약관을 확인하고 worklog와 OPERATIONS 비용 표에 남긴다. 월 결제 불가, 부가세·도메인 포함 월 1만 원 초과, 상시 CPU 사용 제한 중 하나라도 해당하면 대체안([ADR-0005](adr/0005-hosting-and-data.md#선택과-핵심-조건))으로 바꾸고 사용자에게 알린다.
- [x] 자체 도메인이 Cloudflare 프록시를 거쳐 HTTPS·WSS로 서버에 닿는다. Cloudflare와 서버 사이도 검증된 TLS다.
- [x] VM은 SSH 키 로그인만 허용하고, 방화벽으로 필요한 포트만 연다. 자동 보안 업데이트와 스왑을 켠다.
- [x] Docker Compose로 Caddy·서버·PostgreSQL이 실행되고, 컨테이너 종료와 VM 재부팅 뒤 자동으로 다시 올라온다(실제로 재부팅해 확인).
- [x] 대기 상태와 온라인 경기 1판 중의 메모리·디스크 사용량, 한국에서의 왕복 지연을 측정해 worklog에 남긴다.
- [x] 두 계정으로 로그인 → 방 생성·입장 → 경기 종료 → 전적 반영까지 확인한다.
- [x] 운영 도메인 응답에 HSTS가 붙고, Cloudflare·Caddy를 거친 Socket.IO 연결이 출처 확인(`Host` 유지)을 통과하며 브라우저에 CSP 위반이 없다([SEC-001](#sec-001-서버-보안-강화)).
- [x] 기존 Neon 데이터 이전 여부를 사용자가 정하고, 이전 운영 서비스(Render·Neon·UptimeRobot 절전 방지 요청)를 정리한다. README 배포 접속 절을 새 주소로 고친다.


검증 근거: [2026-11-27 worklog](worklogs/2026-11-27.md#ops-004-운영-서버-구축). https://playalkkagi.com 개통. 결제 주기·CPU 약관은 사용자가 주문 화면에서 확인했고, 이전 서비스는 사용자 계정이 아니라 정리 대상이 없다

## OPS-005 DB 백업·복구

우선순위: P1
상태: 완료
담당: Claude — 사용자 요청 수행
의존성: OPS-004
범위: 가입 계정·전적을 잃지 않는다는 기준([DEC-096](DECISIONS.md#결정-색인))에 따라 VM PostgreSQL의 연속 백업과 복구 절차를 만든다([OPERATIONS 백업·복구](design/OPERATIONS.md#백업복구)). 저장소는 Cloudflare R2 무료 범위다.
관련 문서: [OPERATIONS 백업·복구](design/OPERATIONS.md#백업복구), [ADR-0005](adr/0005-hosting-and-data.md)
Issue·PR: 미생성

수용 기준:

- [x] WAL이 1분 안팎 간격으로 R2에 보관되고 주기 전체 백업이 쌓인다. 도구·보관 개수·R2 사용량을 OPERATIONS에 적는다.
- [x] 보관이나 백업이 실패하면 알림을 받는다(일부러 실패시켜 확인).
- [x] 임시 컨테이너에 특정 시점으로 복구해 회원·전적 수가 원본과 같은지 확인하고, 복구 소요 시간과 실제 손실 범위를 기록한다. 복구 시간은 24시간 기준 안이어야 한다.
- [x] 월 1회 복구 연습 절차를 OPERATIONS에 적는다.

검증 근거: [2026-11-27 worklog](worklogs/2026-11-27.md#ops-005-db-백업복구)

## OBS-001 모니터링·알림

우선순위: P1
상태: 예정
담당: 미정
의존성: OPS-004
범위: [DEC-099](DECISIONS.md#결정-색인)의 도구(UptimeRobot·Grafana Cloud Free + Alloy·Sentry Developer)로 장애 알림·서버 지표·로그·오류·한도 알림을 만든다([OPERATIONS 모니터링](design/OPERATIONS.md#모니터링)). 로그 민감정보 허용 목록 원칙([OPERATIONS 서버 로그](design/OPERATIONS.md#서버-로그))은 유지한다. 트레이스(Tempo)는 2단계로 이 작업 범위 밖이다. 측정 목표값 중 PRD에 없는 항목은 첫 측정 뒤 정한다.
관련 문서: [OPERATIONS 모니터링](design/OPERATIONS.md#모니터링), [ENGINEERING-VALIDATION](ENGINEERING-VALIDATION.md#최소-측정-항목)
Issue·PR: 미생성

수용 기준:

- [ ] 서버가 응답하지 않으면 UptimeRobot이 Discord로 알리고, 복구되면 다시 알린다(실제로 서비스를 멈춰 확인).
- [ ] Alloy로 호스트 지표(CPU·메모리·디스크·전송량)와 앱 지표(동시 소켓·진행 중 경기·이벤트 루프 지연·`tick_skipped`·메모리·왕복 지연)가 Grafana Cloud에 들어오고 대시보드로 본다. 앱 지표 경로는 외부에 공개되지 않는다. Alloy 메모리 사용량을 기록한다.
- [ ] 서버 로그가 Grafana Cloud에서 검색되고, 오류 로그에 요청 본문·쿠키·연결 문자열이 들어가지 않는다(테스트로 확인).
- [ ] Sentry가 서버·브라우저 오류를 소스맵과 함께 수집하고, 보내는 항목은 허용 목록으로 제한한다.
- [ ] 월 전송량과 R2 저장량이 한도의 80%를 넘으면 알림이 온다.

검증 근거: 작업일의 worklog

## VAL-003 부하·E2E 검증

우선순위: P2
상태: 예정
담당: 미정
의존성: CI-001, OPS-004
범위: 설계만 있고 실행하지 않은 서비스 부하 기준선, 두 계정 온라인 흐름 E2E, 실패 주입을 실행한다. 합격 목표값은 정하지 않고 첫 측정을 기준선으로 보관한다([ENGINEERING-VALIDATION](ENGINEERING-VALIDATION.md#기준선부하-실험-절차)).
관련 문서: [OPERATIONS 사용량·부하](design/OPERATIONS.md#사용량부하-확인), [ENGINEERING-VALIDATION](ENGINEERING-VALIDATION.md), [PRD 성공 기준](PRD.md#5-성공-기준)
Issue·PR: 미생성

수용 기준:

- [ ] Socket.IO 부하 스크립트로 운영 VM에서 동시 방 수(1·5·25)와 스냅샷 주기(초당 10·20·30회)를 한 번에 하나씩 바꿔 CPU·이벤트 루프 지연·`tick_skipped`·스냅샷 전송 지연·송신 대역폭·메모리를 기록한다. 동시 25경기에서 `tick_skipped` 0건인지 판정한다([PRD 운영 기준](PRD.md#4-비기능-요구사항과-제약)).
- [ ] 왕복 지연을 인위로 50·100·200·300ms 넣고 플레이해 조준·발사와 이동 중 방해요소 사용이 어느 지연부터 불편한지 기록하고, PRD의 지연 기준(목표 150ms·한계 500ms)과 비교한다.
- [ ] 두 계정이 로그인 → 방 생성·입장 → 경기 종료 → 전적 반영까지 가는 브라우저 E2E가 CI에서 실행된다.
- [ ] 서버 재시작 전후로 회원·전적이 일치하는지(PRD 성공 기준 4) 자동 테스트로 확인한다.
- [ ] 소켓 끊김·DB 저장 실패를 주입해 전적이 한 번만 저장되고 사용자 안내가 나오는지 확인한다. 재사용할 진단이 나오면 TROUBLESHOOTING에 등록한다.

검증 근거: 작업일의 worklog

## MNT-001 2026-12 정기 의존성 패치

우선순위: P2
상태: 예정
담당: 미정
의존성: 없음
범위: [DEC-095](DECISIONS.md#결정-색인)의 월 1회 정기 패치(2026-12분). 열린 Dependabot 알림과 `npm audit`·`npm outdated` 결과를 보고 minor·patch 갱신을 모아 올린다. 메이저 갱신은 호환성을 확인해 올릴지 따로 정하고, 올리지 않으면 이유를 남긴다. 다음 달 정기 패치 작업(MNT-002)을 이 작업의 마무리 PR에서 등록한다.
관련 문서: [OPERATIONS 의존성·취약점 관리](design/OPERATIONS.md#의존성취약점-관리)
Issue·PR: 미생성

수용 기준:

- [ ] 작업 시점의 열린 Dependabot 알림을 하나씩 처리(갱신으로 해소)하거나, 해소하지 않는 이유(개발 의존성만 해당·수정 버전 없음 등)를 worklog에 남긴다.
- [ ] 개발 의존성 minor·patch 갱신을 올리고 CI(`check`·`test-db`·`secrets`)가 통과한다. 2026-11-26 Dependabot이 제안했던 묶음(eslint·prettier·typescript-eslint·vitest·@vitejs/plugin-react·vite·supertest)을 포함한다.
- [ ] 같은 묶음 갱신 CI에서 시간 초과(5초)로 실패한 `packages/client/src/ai/ai-controller.test.ts`의 "planShotSteps는 미리보기마다 멈추고 끝까지 돌리면 planShot과 같은 계획이다"가 CI에서 안정적으로 통과한다(원인이 갱신인지 CI 속도인지 확인해 기록).
- [ ] TypeScript 7·`@types/node` 26 같은 메이저 갱신은 올리지 않거나, 올린다면 lint·빌드·테스트 통과를 확인한다. 결정과 이유를 worklog에 남긴다.
- [ ] 다음 정기 패치 작업(2027-01)을 TASKS에 등록한다.

검증 근거: 작업일의 worklog

## POR-001 itch.io 배포

우선순위: P1
상태: 예정
담당: 미정
의존성: OPS-004, OPS-003
범위: 포털 배포 1단계([DEC-097](DECISIONS.md#결정-색인), [PRD 배포 채널](PRD.md#16-배포-채널)). itch.io 페이지의 iframe(다른 도메인)에서 자체 도메인 서버로 로그인·온라인 대전을 할 수 있게 하고 클라이언트 빌드를 제출한다. 포털 iframe에서는 쿠키 세션이 전송되지 않는 브라우저가 있어 인증 방식을 바꿔야 한다. 인증 방식·게스트 범위는 미정이라 설계안을 만들어 사용자가 정한다. 지금 서버는 `Host`와 다른 출처의 Socket.IO 핸드셰이크를 거부하고 CSP `frame-ancestors 'none'`을 보내므로([AUTH](design/AUTH.md#http-보안-헤더), SEC-001) 허용 출처 목록에 맞춰 함께 고친다.
관련 문서: [AUTH](design/AUTH.md), [API](design/API.md), [DATABASE](design/DATABASE.md), [OPS-002 worklog의 포털 조사](worklogs/2026-11-26.md#ops-002-운영-인프라-재검토)
Issue·PR: 미생성

수용 기준:

- [ ] 포털 빌드의 인증 방식(예: 토큰을 헤더·Socket.IO 연결 정보로 전달)과 게스트 범위를 사용자가 정하고 DEC·AUTH·API에 기록한다. 게스트는 DB에 저장하지 않는다.
- [ ] 허용한 출처(자체 도메인, itch.io HTML 도메인)의 REST·Socket.IO 요청만 받고 그 밖의 출처는 거부한다.
- [ ] 제3자 쿠키를 막는 브라우저(Safari 포함)에서 itch.io 페이지 안 로그인·온라인 대전·전적 반영이 된다.
- [ ] itch.io용 빌드(서버 주소는 자체 도메인, 상대 경로)를 itch.io 업로드 제한 안에서 올리고 공개 페이지에서 두 계정 대전을 확인한다.
- [ ] 기존 `npm test`·`npm run test:db`와 자체 도메인 접속이 그대로 동작한다.

검증 근거: 작업일의 worklog

## POR-002 CrazyGames 배포

우선순위: P2
상태: 예정
담당: 미정
의존성: POR-001
범위: 포털 배포 2단계([DEC-097](DECISIONS.md#결정-색인)). CrazyGames 요구사항(자체 가입·외부 로그인 비활성, 게스트 플레이 기본, CrazyGames 사용자명 표시, SDK)에 맞춘 빌드를 제출한다. CrazyGames 연동 계정의 전적은 가입 계정처럼 DB에 남겨 백업 대상에 넣는다. SDK 광고·초대·즉시 멀티플레이 범위는 미정이다.
관련 문서: [PRD 배포 채널](PRD.md#16-배포-채널), [OPS-002 worklog의 포털 조사](worklogs/2026-11-26.md#ops-002-운영-인프라-재검토)
Issue·PR: 미생성

수용 기준:

- [ ] CrazyGames 요구사항과 이 게임의 차이를 정리하고, 광고·초대·계정 연동 범위를 사용자가 정해 PRD·DEC에 기록한다.
- [ ] 서버가 CrazyGames 사용자 토큰을 공식 공개키(JWKS)와 `gameId`로 검증해 계정에 연결하고, 연동 계정의 전적이 DB에 남아 백업([OPS-005](#ops-005-db-백업복구))에 포함된다.
- [ ] CrazyGames 빌드에서 자체 가입·로그인이 보이지 않고 게스트로 바로 플레이할 수 있다.
- [ ] CrazyGames 출처의 요청만 추가로 허용하고 빌드를 제출한다(Basic Launch).

검증 근거: 작업일의 worklog

