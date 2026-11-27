# 진행 상황

## 기준과 확인 범위

기준 브랜치: `main`. 확인일: 2026-11-27. 작업 상태는 [TASKS](TASKS.md), 상세 검증은 날짜별 [worklog](worklogs/TEMPLATE.md)를 따른다. 2026-11-25 개인 프로젝트 전환([DEC-091](DECISIONS.md#결정-색인)) 전의 진행 상황은 [팀 시절 진행 기록](legacy/PROGRESS-team.md)에 동결했다([DEC-092](DECISIONS.md#결정-색인)).

## 현재 상태

- 2인 팀 시절(2026-10-27~11-05)에 로컬 2인·AI 대전·온라인 1:1(계정·로비·대기실·결과·전적)과 방해요소·방 테마·캐릭터 꾸미기·감정표현·소리를 구현했다. 기능 소개는 [README](../README.md#어떤-게임인가), 규칙은 [PRD](PRD.md)를 따른다.
- 2026-11-25 개인 프로젝트로 전환했다([DOC-013](TASKS.md#doc-013-개인-프로젝트-전환)). 이후 작업은 [자기 검토](CONTRIBUTING.md#자기-검토) 후 병합한다.
- 같은 날 팀 시절 작업 64건을 [팀 시절 작업 기록](legacy/TASKS-team.md)으로 옮겨 닫았다([DOC-014](TASKS.md#doc-014-팀-시절-작업진행-기록-분리)).
- 2026-11-26 운영 보완 방향을 정했다([DEC-094](DECISIONS.md#결정-색인)): 배포 자동화, 월 0원 유지, 호스팅 재검토 허용, 외부 백업 보류. 보완 작업 6건(CI·보안·호스팅·배포 자동화·모니터링·부하/E2E)을 등록했다([DOC-016](TASKS.md#doc-016-운영-보완-결정과-작업-등록)).
- 같은 날 호스팅 재검토([OPS-002](TASKS.md#ops-002-0원-호스팅-재검토))에서 운영 기준을 다시 정하고(동시 접속 최대 50명·24시간·가동률 95%·계정 손실 없음·월 1만 원 이하, [DEC-096](DECISIONS.md#결정-색인)), 게임 포털 배포(itch.io → CrazyGames, [DEC-097](DECISIONS.md#결정-색인)), 운영 인프라(HostHatch VM + 자체 PostgreSQL + R2 백업 + Cloudflare, [DEC-098](DECISIONS.md#결정-색인)·[ADR-0005](adr/0005-hosting-and-data.md)), 모니터링 도구([DEC-099](DECISIONS.md#결정-색인))를 정했다.
- 2026-11-27 서버 보안을 보강했다([SEC-001](TASKS.md#sec-001-서버-보안-강화)): 모든 응답에 CSP 등 보안 헤더, Socket.IO 다른 출처 거부·메시지 4 KiB 상한, 경기 입력 사용자별 빈도 제한, 세션 비밀값 무중단 교체. 로그인·로비·온라인·로컬 2인·AI 대전 화면이 CSP 위반 없이 동작함을 브라우저로 확인했다.

## 남은 일과 한계

- 2026-11-27 운영 서버를 열었다: https://playalkkagi.com (HostHatch 서울 VM + Cloudflare, [OPS-004](TASKS.md#ops-004-운영-서버-구축)). 백업·자동 배포·모니터링은 아직 없다. 남은 순서는 [OPS-005](TASKS.md#ops-005-db-백업복구)(백업)·[OPS-003](TASKS.md#ops-003-배포-자동화)(자동 배포)·[OBS-001](TASKS.md#obs-001-모니터링알림)(모니터링) → [POR-001](TASKS.md#por-001-itchio-배포)(itch.io)다([README 배포 접속](../README.md#배포-접속)).
- PR마다 CI(검사·DB 테스트·비밀값 검사)가 돌고 `main`은 보호된다([CI-001](TASKS.md#ci-001-pr-검사-자동화)). 의존성 취약점은 알림으로 받아 운영 의존성 high 이상만 바로 고치고 나머지는 월 1회 정기 패치로 처리한다([DEC-095](DECISIONS.md#결정-색인), 첫 회 [MNT-001](TASKS.md#mnt-001-2026-12-정기-의존성-패치)). 부하 기준선은 아직 없다([VAL-003](TASKS.md#val-003-부하e2e-검증)). 급증 대응과 포털 빌드 세부(인증 방식·게스트 범위·CrazyGames SDK)는 미정이다.
- 팀 시절에 진행 중이던 12건의 남은 확인(온라인 두 계정·DB 테스트, GPU 프레임 시간 측정, 사용자 실제 화면·소리 확인)은 이어 가지 않기로 했고 새 작업으로 등록하지 않았다([DEC-092](DECISIONS.md#결정-색인)). 필요해지면 TASKS에 새로 등록한다.
- 물리·방해요소 수치는 제안값이며 플레이 테스트 후 [DECISIONS](DECISIONS.md)로 확정한다.
- 로컬 2인은 창을 오래 가리면 브라우저 타이머 제한으로 기권패될 수 있다([LOCAL](design/LOCAL.md#로컬-2인-구성-창-2개)).
- 이용 조건을 확인하지 못한 에셋 항목은 [CREDITS](CREDITS.md)에 "미확인"으로 남아 있다.
