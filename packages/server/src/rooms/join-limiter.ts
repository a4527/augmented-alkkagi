import { FixedWindowLimiter, type FixedWindowOptions } from '../realtime/fixed-window.ts';

export const JOIN_RATE_LIMIT = { windowMs: 60_000, limit: 30 } as const;

/**
 * `room:join` 빈도 제한: 사용자당 분당 30회(AUTH). 6자리 코드를 대입해 보는 시도를 막는다.
 * 재접속해도 초기화되지 않게 연결이 아니라 사용자 번호를 키로 두며, 메모리 저장이라 서버가 재시작하면 사라진다.
 * 성공·실패와 입력 오류를 모두 센다.
 */
export class JoinRateLimiter extends FixedWindowLimiter<number> {
  constructor(now: () => number = Date.now, options: FixedWindowOptions = JOIN_RATE_LIMIT) {
    super(options, now);
  }
}
