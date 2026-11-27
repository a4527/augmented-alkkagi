import { EventEmitter } from 'node:events';
import type { Socket } from 'socket.io';
import { describe, expect, it, vi } from 'vitest';
import type { CommandResult } from '@alkkagi/shared';
import { toLogLine } from './game-log.ts';
import { registerGameHandlers } from './game-handlers.ts';
import type { GameService } from './game-service.ts';
import { GAME_RATE_LIMITS, GameRateLimiter } from './game-rate-limit.ts';

/** 소켓 대역: 서버가 등록한 이벤트 핸들러만 부른다. */
function fakeSocket() {
  const emitter = new EventEmitter();
  return {
    socket: emitter as unknown as Socket,
    fire: (event: string, payload: unknown, ack?: unknown) => emitter.emit(event, payload, ack),
  };
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

describe('경기 소켓 핸들러', () => {
  it('명령 처리 중 예외가 나면 ack는 INTERNAL_ERROR인 CommandResult다', async () => {
    const onError = vi.fn();
    const game = {
      submitShot: () => Promise.reject(new Error('boom')),
    } as unknown as GameService;
    const { socket, fire } = fakeSocket();
    registerGameHandlers(socket, 7, { game, limiter: new GameRateLimiter(), onError });
    const ack = vi.fn();
    fire('shot:submit', {}, ack);
    await settle();
    expect(ack).toHaveBeenCalledWith({
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: expect.any(String) as string },
    });
    expect(onError).toHaveBeenCalledOnce();
  });

  it('사용자 번호는 세션의 값만 서비스에 넘기고 입력의 값은 쓰지 않는다', async () => {
    const calls: unknown[][] = [];
    const ok: CommandResult = { ok: true };
    const game = {
      useHazard: (...args: unknown[]) => {
        calls.push(args);
        return Promise.resolve(ok);
      },
    } as unknown as GameService;
    const { socket, fire } = fakeSocket();
    registerGameHandlers(socket, 7, { game, limiter: new GameRateLimiter() });
    const ack = vi.fn();
    const payload = { gameId: 'g', hazardInstanceId: 'h', userId: 99, seat: 1 };
    fire('hazard:use', payload, ack);
    await settle();
    expect(calls[0]?.[0]).toBe(7);
    expect(ack).toHaveBeenCalledWith(ok);
  });

  it('ack가 없는 호출과 응답 없는 입력의 예외는 서버를 멈추지 않는다', async () => {
    const onError = vi.fn();
    const game = {
      forfeit: () => Promise.resolve({ ok: true }),
      relayAim: () => {
        throw new Error('boom');
      },
    } as unknown as GameService;
    const { socket, fire } = fakeSocket();
    registerGameHandlers(socket, 7, { game, limiter: new GameRateLimiter(), onError });
    expect(() => {
      fire('game:forfeit', { gameId: 'g' });
      fire('aim:update', {});
    }).not.toThrow();
    await settle();
    expect(onError).toHaveBeenCalledOnce();
  });
});

describe('경기 입력 빈도 제한', () => {
  const ok: CommandResult = { ok: true };

  /** 수동 시계와 호출 횟수를 세는 서비스 대역으로 핸들러를 만든다. */
  function setup(userId = 7, shared?: { limiter: GameRateLimiter; now: { t: number } }) {
    const now = shared?.now ?? { t: 0 };
    const onLimited = vi.fn();
    const limiter = shared?.limiter ?? new GameRateLimiter(onLimited, () => now.t);
    const calls = { submitShot: 0, rotateBoard: 0, relayAim: 0, aimHazard: 0, sendEmote: 0 };
    const game = {
      submitShot: () => (calls.submitShot++, Promise.resolve(ok)),
      sendEmote: () => (calls.sendEmote++, Promise.resolve(ok)),
      rotateBoard: () => (calls.rotateBoard++, Promise.resolve(ok)),
      relayAim: () => void calls.relayAim++,
      aimHazard: () => void calls.aimHazard++,
    } as unknown as GameService;
    const { socket, fire } = fakeSocket();
    registerGameHandlers(socket, userId, { game, limiter });
    return { now, limiter, onLimited, calls, fire };
  }

  async function sendCommands(
    fire: (e: string, p: unknown, a?: unknown) => void,
    event: string,
    n: number,
  ) {
    const acks: CommandResult[] = [];
    for (let i = 0; i < n; i++) fire(event, {}, (r: CommandResult) => acks.push(r));
    await settle();
    return acks;
  }

  it('경기 명령은 묶음 한도(초당 10회)를 넘으면 서비스에 넘기지 않고 RATE_LIMITED ack를 준다', async () => {
    const { calls, fire, onLimited } = setup();
    const limit = GAME_RATE_LIMITS.command;
    // shot:submit·emote:send 등은 한 묶음으로 센다.
    const first = await sendCommands(fire, 'shot:submit', limit - 1);
    const rest = await sendCommands(fire, 'emote:send', 3);
    expect(first.every((r) => r.ok)).toBe(true);
    // 거부 ack는 서비스를 기다리지 않아 먼저 도착할 수 있으므로 개수로 본다.
    expect(rest.filter((r) => r.ok)).toHaveLength(1);
    expect(rest.filter((r) => !r.ok)).toEqual([
      { ok: false, error: { code: 'RATE_LIMITED', message: expect.any(String) as string } },
      { ok: false, error: { code: 'RATE_LIMITED', message: expect.any(String) as string } },
    ]);
    expect(calls.submitShot + calls.sendEmote).toBe(limit);
    // 운영 로그는 한도를 넘긴 첫 호출에서 한 번만 남긴다.
    expect(onLimited).toHaveBeenCalledOnce();
    expect(onLimited).toHaveBeenCalledWith({ userId: 7, group: 'command' });
  });

  it('조준 스트림은 한도를 넘으면 상대에게 중계하지 않고 다음 1초 창에서 다시 받는다', () => {
    const { now, calls, fire } = setup();
    for (let i = 0; i < 40; i++) fire('aim:update', {});
    for (let i = 0; i < 40; i++) fire('hazard:aim', {});
    expect(calls.relayAim).toBe(GAME_RATE_LIMITS['aim:update']);
    expect(calls.aimHazard).toBe(GAME_RATE_LIMITS['hazard:aim']);
    now.t += 1_000;
    fire('aim:update', {});
    expect(calls.relayAim).toBe(GAME_RATE_LIMITS['aim:update'] + 1);
  });

  it('판 돌리기는 명령 묶음과 따로 초당 30회까지 받는다', async () => {
    const { calls, fire } = setup();
    const rotate = await sendCommands(fire, 'board:rotate', 31);
    expect(calls.rotateBoard).toBe(GAME_RATE_LIMITS['board:rotate']);
    expect(rotate.filter((r) => !r.ok)).toMatchObject([{ error: { code: 'RATE_LIMITED' } }]);
    // 판 돌리기를 다 써도 발사는 막히지 않는다.
    expect(await sendCommands(fire, 'shot:submit', 1)).toEqual([ok]);
  });

  it('한도는 사용자별이고 같은 사용자의 새 연결에도 이어진다', async () => {
    const a = setup(7);
    await sendCommands(a.fire, 'shot:submit', GAME_RATE_LIMITS.command);
    // 같은 사용자 7의 새 소켓(재접속): 같은 제한기를 쓰므로 바로 거부된다.
    const reconnect = setup(7, a);
    expect(await sendCommands(reconnect.fire, 'shot:submit', 1)).toMatchObject([
      { ok: false, error: { code: 'RATE_LIMITED' } },
    ]);
    // 다른 사용자 8은 영향받지 않는다.
    const other = setup(8, a);
    expect(await sendCommands(other.fire, 'shot:submit', 1)).toEqual([ok]);
  });
});

describe('서버 로그 줄', () => {
  const context = { roomId: 3, userIdOf: (seat: 0 | 1) => (seat === 0 ? 10 : 11) };

  it('허용된 키만 담고 좌석을 사용자 번호로 바꾼다', () => {
    const line = toLogLine(
      {
        event: 'leave',
        mono: 5,
        gameId: null,
        ingressSeq: 2,
        seat: 1,
        reason: 'disconnect',
      },
      context,
    );
    expect(line).toMatchObject({
      roomId: 3,
      gameId: null,
      userId: 11,
      ingressSeq: 2,
      reason: 'disconnect',
    });
    expect(Object.keys(line)).not.toContain('seat');
    expect(new Date(line.ts).toISOString()).toBe(line.ts);
  });

  it('좌석이 없는 항목에는 사용자 번호를 넣지 않는다', () => {
    const line = toLogLine({ event: 'tick_skipped', mono: 1, gameId: 'g', result: '300' }, context);
    expect(line.userId).toBeUndefined();
    expect(line.result).toBe('300');
  });
});
