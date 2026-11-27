import { createServer, request as httpRequest, type Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { RequestHandler } from 'express';
import { io as connect, type Socket as ClientSocket } from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  AimUpdateSchema,
  HazardAimSchema,
  HazardUseSchema,
  ROOM_TITLE_MAX,
  RoomCreateSchema,
} from '@alkkagi/shared';
import type { z } from 'zod';
import { isAllowedOrigin } from './origin.ts';
import { createRealtime, SOCKET_MAX_MESSAGE_BYTES, type Realtime } from './socket.ts';

// 세션 저장소(DB) 대신 모든 요청을 사용자 1로 인증하는 대역을 넣는다. 출처·크기 경계만 본다.
const fakeSession: RequestHandler = (req, _res, next) => {
  Object.assign(req, { session: { userId: 1 }, sessionID: 'sid-1' });
  next();
};

describe('Socket.IO 연결 경계', () => {
  let httpServer: HttpServer;
  let realtime: Realtime;
  let port: number;
  const received: { event: string; bytes: number }[] = [];
  const sockets: ClientSocket[] = [];

  beforeAll(async () => {
    httpServer = createServer();
    realtime = createRealtime(httpServer, fakeSession, undefined, (socket) => {
      socket.onAny((event: string, payload: unknown) => {
        received.push({ event, bytes: JSON.stringify(payload).length });
      });
    });
    await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
    port = (httpServer.address() as AddressInfo).port;
  });

  afterAll(async () => {
    for (const socket of sockets) socket.disconnect();
    await realtime.io.close();
  });

  /** 폴링 핸드셰이크를 직접 보내 상태 코드를 본다. `Host`는 `127.0.0.1:포트`다. */
  function handshake(origin?: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const req = httpRequest(
        {
          host: '127.0.0.1',
          port,
          path: '/socket.io/?EIO=4&transport=polling',
          headers: origin === undefined ? {} : { origin },
        },
        (res) => {
          res.resume();
          resolve(res.statusCode ?? 0);
        },
      );
      req.on('error', reject);
      req.end();
    });
  }

  function open(origin?: string): Promise<ClientSocket> {
    return new Promise((resolve, reject) => {
      const socket = connect(`http://127.0.0.1:${port}`, {
        extraHeaders: origin ? { origin } : {},
        reconnection: false,
        forceNew: true,
      });
      sockets.push(socket);
      socket.on('connect', () => resolve(socket));
      socket.on('connect_error', reject);
    });
  }

  it('다른 출처의 핸드셰이크는 거부하고 같은 출처·Origin 없는 요청은 받는다', async () => {
    expect(await handshake(`http://127.0.0.1:${port}`)).toBe(200);
    expect(await handshake()).toBe(200);
    expect(await handshake('https://evil.example')).toBe(403);
    expect(await handshake(`http://127.0.0.1:${port + 1}`)).toBe(403);
    expect(await handshake('null')).toBe(403);
    await expect(open('https://evil.example')).rejects.toThrow();
    await expect(open(`http://127.0.0.1:${port}`)).resolves.toMatchObject({ connected: true });
  });

  it('출처 비교는 호스트만 보고 대소문자를 가리지 않는다', () => {
    expect(isAllowedOrigin('https://Alkkagi.example', 'alkkagi.example')).toBe(true);
    expect(isAllowedOrigin('https://alkkagi.example', 'alkkagi.example:8443')).toBe(false);
    expect(isAllowedOrigin('https://alkkagi.example.evil.example', 'alkkagi.example')).toBe(false);
    expect(isAllowedOrigin('not a url', 'alkkagi.example')).toBe(false);
    expect(isAllowedOrigin('https://alkkagi.example', undefined)).toBe(false);
  });

  it('가장 큰 정상 메시지도 상한의 1/4보다 작다', () => {
    const gameId = crypto.randomUUID();
    // 모든 선택 필드를 채우고 숫자는 가장 긴 표기(음수·17자리)로 둔다.
    const n = -0.12345678901234568;
    const point = { x: n, y: n, h: n };
    const largest: [string, z.ZodType, unknown][] = [
      [
        'aim:update',
        AimUpdateSchema,
        {
          gameId,
          mode: 'hold_hazard',
          pull: 0.12345678901234568,
          lookYaw: n,
          lookPitch: n,
          stoneId: 8,
          angle: n,
          power: 99.99999999999999,
          kind: 'gravity_zone',
          target: point,
        },
      ],
      [
        'hazard:use',
        HazardUseSchema,
        {
          gameId,
          hazardInstanceId: `${gameId}-h99`,
          target: { x: n, y: n, h: n, orientation: 'horizontal', directionRad: n },
          direction: -1,
        },
      ],
      [
        'hazard:aim',
        HazardAimSchema,
        { gameId, hazardInstanceId: `${gameId}-h99`, target: point, active: false },
      ],
      [
        'room:create',
        RoomCreateSchema,
        {
          // 4바이트 문자(이모지)는 UTF-16 2칸이라 제목 상한 안에서 가장 긴 바이트가 된다.
          title: '😀'.repeat(ROOM_TITLE_MAX / 2),
          isPublic: false,
          pieceCount: 9,
          board: 'standard',
          theme: 'classroom',
          code: 'ABCDEF',
        },
      ],
    ];
    for (const [event, schema, payload] of largest) {
      // 서버가 받아들이는 정상 입력인지 먼저 확인한다.
      expect(schema.safeParse(payload).success, event).toBe(true);
      // socket.io 이벤트 패킷: 엔진 타입 '4' + 이벤트 '2' + ack 번호 + JSON 배열
      const packet = `42999999${JSON.stringify([event, payload])}`;
      expect(Buffer.byteLength(packet), event).toBeLessThan(SOCKET_MAX_MESSAGE_BYTES / 4);
    }
  });

  it('상한을 넘는 메시지는 처리하지 않고 연결을 끊는다', async () => {
    const socket = await open();
    received.length = 0;
    socket.emit('aim:update', { pad: 'x'.repeat(100) });
    const closed = new Promise<string>((resolve) => socket.once('disconnect', resolve));
    socket.emit('aim:update', { pad: 'x'.repeat(SOCKET_MAX_MESSAGE_BYTES) });
    await closed;
    expect(received.map((r) => r.bytes)).toEqual([JSON.stringify({ pad: 'x'.repeat(100) }).length]);
  });
});
