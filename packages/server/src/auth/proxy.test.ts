import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { createAppServer, type AppServer } from '../app.ts';
import { AUTH_RATE_LIMIT } from './rate-limit.ts';

// 입력 형식 오류(400)는 DB 전에 끝나므로 연결되지 않는 풀로 IP 판별만 본다.
describe('프록시 뒤 클라이언트 IP 판별', () => {
  let pool: pg.Pool;
  let twoHops: AppServer;

  beforeAll(() => {
    pool = new pg.Pool({ connectionString: 'postgres://unused:unused@127.0.0.1:1/unused' });
    twoHops = createAppServer({
      pool,
      sessionSecret: 'x'.repeat(32),
      isProduction: false,
      trustProxyHops: 2,
    });
  });

  afterAll(async () => {
    await twoHops.close();
    await pool.end();
  });

  // Cloudflare가 붙인 클라이언트 IP 뒤에 Caddy가 Cloudflare 엣지 IP를 덧붙인 모양이다.
  const login = (forwardedFor: string) =>
    request(twoHops.httpServer)
      .post('/api/auth/login')
      .set('X-Forwarded-For', forwardedFor)
      .send({});

  it('2단계면 엣지 IP가 달라도 같은 클라이언트로 세고, 클라이언트가 보낸 값은 믿지 않는다', async () => {
    for (let i = 0; i < AUTH_RATE_LIMIT.limit; i++) {
      // 클라이언트가 위조해 붙인 맨 앞 값은 매번 바꿔도 같은 사용자로 센다.
      await login(`198.51.100.${i}, 203.0.113.7, 172.70.${i % 3}.1`).expect(400);
    }
    await login('203.0.113.7, 172.70.9.9').expect(429);
    // 다른 클라이언트는 영향받지 않는다.
    await login('203.0.113.8, 172.70.0.1').expect(400);
  });
});
