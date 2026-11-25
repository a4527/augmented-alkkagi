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
| 완료 | 수용 기준 충족, 검증 근거 연결, 리뷰(1인 개발은 [자기 검토](CONTRIBUTING.md#자기-검토)) 후 기준 브랜치 병합 |
| 취소 | 결정 철회 등으로 하지 않기로 함. 근거 DEC와 사유를 해당 작업에 기록 |

우선순위는 P0(현재 진행을 막는 작업), P1(다음 착수 대상), P2(이후 검토)로 표시한다. 우선순위·작업 등록은 미정 제품 정책·기술안을 승인하는 행위가 아니다.

## 작업 목록

| ID | 작업 | 우선순위 | 의존성 | 상태 | 담당 | Issue·PR |
| --- | --- | --- | --- | --- | --- | --- |
| [DOC-013](#doc-013-개인-프로젝트-전환) | 개인 프로젝트 전환 | P1 | 없음 | 완료 | Claude — 사용자 요청 수행 | [PR #1](https://github.com/a4527/augmented-alkkagi/pull/1) |
| [DOC-014](#doc-014-팀-시절-작업진행-기록-분리) | 팀 시절 작업·진행 기록 분리 | P1 | DOC-013 | 리뷰 중 | Claude — 사용자 요청 수행 | [PR #3](https://github.com/a4527/augmented-alkkagi/pull/3) |

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
상태: 리뷰 중
담당: Claude — 사용자 요청 수행
의존성: DOC-013
범위: 문서를 읽는 컨텍스트를 줄이려고 팀 시절 TASKS·PROGRESS를 `docs/legacy/`로 옮겨 동결하고, TASKS·PROGRESS를 개인 프로젝트 기준으로 짧게 다시 쓴다. 진행 중이던 팀 시절 작업 12건은 이어 가지 않고 닫는다. 다른 문서의 링크를 옮긴 위치로 바꾼다. DECISIONS는 옮기지 않는다.
관련 문서: [DEC-092](DECISIONS.md#결정-색인), [팀 시절 작업 기록](legacy/TASKS-team.md), [팀 시절 진행 기록](legacy/PROGRESS-team.md), [AGENTS 문서 구조](../AGENTS.md#문서-구조)
Issue·PR: [PR #3](https://github.com/a4527/augmented-alkkagi/pull/3)

수용 기준:

- [x] 팀 시절 작업 64건의 절·표가 `docs/legacy/TASKS-team.md`에 옮기기 전 내용 그대로 있고, 진행 중이던 12건은 종료로 표시돼 있다.
- [x] 새 TASKS에는 관리 원칙·상태·작업 목록·등록 양식과 개인 프로젝트 작업(DOC-013~)만 있다.
- [x] PROGRESS를 개인 프로젝트 기준으로 다시 쓰고 팀 시절 내용은 `docs/legacy/PROGRESS-team.md`에 그대로 둔다.
- [x] AGENTS의 문서 책임 표·구조·작업 규칙에 legacy 위치와 읽기 조건을 적고, DECISIONS에 결정을 기록한다.
- [x] 저장소 Markdown 전체의 상대 링크·앵커가 깨지지 않고, 과거 기록(이전 worklog·legacy·DEC-001~090)의 TASKS·PROGRESS 링크는 legacy를 가리킨다.
- [ ] 자기 검토 후 기준 브랜치에 병합됐다.

검증 근거: [2026-11-25 worklog](worklogs/2026-11-25.md#doc-014-팀-시절-작업진행-기록-분리)
