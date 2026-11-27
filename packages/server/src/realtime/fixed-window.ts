export type FixedWindowOptions = { windowMs: number; limit: number };

/**
 * 고정 창 빈도 제한. 키마다 창 시작 시각과 횟수를 메모리에 둔다(단일 인스턴스 전제, AUTH).
 * 서버가 재시작하면 사라진다.
 */
export class FixedWindowLimiter<K> {
  readonly #windows = new Map<K, { startedAt: number; count: number }>();

  constructor(
    private readonly options: FixedWindowOptions,
    private readonly now: () => number = Date.now,
  ) {}

  /** 이번 호출을 세고 이 창에서 몇 번째인지 돌려준다. 한도 안이면 `count <= limit`이다. */
  hit(key: K): number {
    const now = this.now();
    const current = this.#windows.get(key);
    if (!current || now - current.startedAt >= this.options.windowMs) {
      this.#windows.set(key, { startedAt: now, count: 1 });
      this.#prune(now);
      return 1;
    }
    current.count += 1;
    return current.count;
  }

  /** 이번 호출을 세고, 한도 안이면 true를 돌려준다. */
  tryConsume(key: K): boolean {
    return this.hit(key) <= this.options.limit;
  }

  /** 지난 창을 지워 사용자가 늘어도 맵이 계속 커지지 않게 한다. */
  #prune(now: number): void {
    for (const [key, w] of this.#windows) {
      if (now - w.startedAt >= this.options.windowMs) this.#windows.delete(key);
    }
  }
}
