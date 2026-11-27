import type { RequestHandler } from 'express';
import type { Server as HttpServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import { ConnectionRegistry } from './connections.ts';
import { isAllowedOrigin } from './origin.ts';

/**
 * 클라이언트 → 서버 메시지 한 개의 크기 상한(기본 1MB). 가장 큰 정상 메시지는 모든 필드를 채운
 * `aim:update`로 약 360바이트다(`socket.test.ts`가 고정). 넘는 메시지는 처리하지 않고 연결을 끊는다.
 * 폴링 전송도 클라이언트가 핸드셰이크의 이 값에 맞춰 묶음을 나눠 보낸다.
 */
export const SOCKET_MAX_MESSAGE_BYTES = 4 * 1024;

type SessionRequest = { session?: { userId?: number }; sessionID?: string };

export type Realtime = { io: Server; registry: ConnectionRegistry };

/**
 * Socket.IO 서버를 붙인다. 핸드셰이크 요청에 세션 미들웨어를 적용해 같은 세션 쿠키로 사용자를
 * 인증하고, 로그인하지 않았으면 연결을 거부한다. 같은 출처라 CORS를 열지 않고, 다른 출처의 핸드셰이크는
 * 세션 확인 전에 거부한다.
 */
export function createRealtime(
  httpServer: HttpServer,
  sessionMiddleware: RequestHandler,
  registry = new ConnectionRegistry(),
  onConnection?: (socket: Socket, userId: number) => void,
): Realtime {
  const io = new Server(httpServer, {
    maxHttpBufferSize: SOCKET_MAX_MESSAGE_BYTES,
    allowRequest: (req, callback) => {
      callback(null, isAllowedOrigin(req.headers.origin, req.headers.host));
    },
  });
  io.engine.use(sessionMiddleware);

  io.use((socket, next) => {
    const request = socket.request as SessionRequest;
    const userId = request.session?.userId;
    if (userId === undefined || !request.sessionID) {
      return next(new Error('UNAUTHENTICATED'));
    }
    socket.data.userId = userId;
    socket.data.sid = request.sessionID;
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as number;
    registry.register(userId, socket);
    socket.on('disconnect', () => registry.unregister(userId, socket));
    onConnection?.(socket, userId);
  });

  return { io, registry };
}
