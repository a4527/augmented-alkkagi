// 경기 Socket.IO 입력의 사용자별 빈도 제한(SEC-001, AUTH "경기 입력 빈도 제한").
// 클라이언트는 조준·판 돌리기 스트림을 50ms 간격(최대 20Hz)으로 보내고 키 반복 입력을 거른다.
// 한도는 그 최대치에 1.5배 여유를 둔 값이다. 사용자 번호를 키로 두어 재접속해도 초기화되지 않는다.
import { FixedWindowLimiter } from '../realtime/fixed-window.ts';

export const GAME_RATE_WINDOW_MS = 1_000;

/** 한도를 함께 세는 묶음과 1초당 한도. */
export const GAME_RATE_LIMITS = {
  /** 응답이 있는 경기 명령. 사람이 누르는 입력이라 초당 몇 번을 넘지 않는다. */
  command: 10,
  /** 판을 돌리는 동안 50ms마다 보내는 명령. */
  'board:rotate': 30,
  /** 응답 없는 조준 스트림(50ms 간격). */
  'aim:update': 30,
  'hazard:aim': 30,
} as const;

export type GameRateGroup = keyof typeof GAME_RATE_LIMITS;

export const GAME_COMMAND_EVENTS = [
  'shot:submit',
  'hazard:use',
  'game:forfeit',
  'emote:send',
  'rematch:request',
] as const;

/** 이벤트 이름 → 묶음. 목록에 없는 이벤트는 제한 대상이 아니다. */
export function rateGroupOf(event: string): GameRateGroup | undefined {
  if ((GAME_COMMAND_EVENTS as readonly string[]).includes(event)) return 'command';
  if (event === 'board:rotate' || event === 'aim:update' || event === 'hazard:aim') return event;
  return undefined;
}

export type RateLimitedInfo = { userId: number; group: GameRateGroup };

/**
 * 묶음마다 사용자별 1초 고정 창으로 센다. 한도를 넘긴 첫 호출에서만 `onLimited`를 불러
 * 운영 로그가 메시지마다 쌓이지 않게 한다.
 */
export class GameRateLimiter {
  readonly #limiters = new Map<GameRateGroup, FixedWindowLimiter<number>>();

  constructor(
    private readonly onLimited?: (info: RateLimitedInfo) => void,
    now: () => number = Date.now,
  ) {
    for (const [group, limit] of Object.entries(GAME_RATE_LIMITS) as [GameRateGroup, number][]) {
      this.#limiters.set(
        group,
        new FixedWindowLimiter({ windowMs: GAME_RATE_WINDOW_MS, limit }, now),
      );
    }
  }

  /** 이번 호출을 세고, 한도 안이면 true를 돌려준다. */
  tryConsume(userId: number, group: GameRateGroup): boolean {
    const count = this.#limiters.get(group)!.hit(userId);
    const limit = GAME_RATE_LIMITS[group];
    if (count === limit + 1) this.onLimited?.({ userId, group });
    return count <= limit;
  }
}
