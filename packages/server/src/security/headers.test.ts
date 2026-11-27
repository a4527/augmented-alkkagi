import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createAppServer, type AppServer } from '../app.ts';
import { CONTENT_SECURITY_POLICY, HSTS_VALUE } from './headers.ts';

// 아래 요청은 DB를 건드리지 않으므로 연결되지 않는 연결 풀로 충분하다.
describe('HTTP 보안 헤더', () => {
  let dir: string;
  let pool: pg.Pool;
  let dev: AppServer;
  let prod: AppServer;

  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'alkkagi-headers-'));
    mkdirSync(path.join(dir, 'assets'));
    writeFileSync(path.join(dir, 'index.html'), '<!doctype html><title>app</title>');
    writeFileSync(path.join(dir, 'assets', 'app.js'), 'console.log(1);');
    pool = new pg.Pool({ connectionString: 'postgres://unused:unused@127.0.0.1:1/unused' });
    const base = { pool, sessionSecret: 'x'.repeat(32), staticDir: dir };
    dev = createAppServer({ ...base, isProduction: false });
    prod = createAppServer({ ...base, isProduction: true });
  });

  afterAll(async () => {
    await dev.close();
    await prod.close();
    await pool.end();
    rmSync(dir, { recursive: true, force: true });
  });

  // 화면(index.html)·정적 자산·헬스체크·API 오류 응답 모두에 붙는다.
  const paths = ['/', '/lobby', '/assets/app.js', '/health', '/api/me'];

  it.each(paths)('%s 응답에 CSP·nosniff·Referrer-Policy가 붙는다', async (url) => {
    const res = await request(dev.httpServer).get(url);
    expect(res.headers['content-security-policy']).toBe(CONTENT_SECURITY_POLICY);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('same-origin');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('CSP는 같은 출처만 허용하고 인라인 스크립트·eval·다른 사이트 iframe을 막는다', () => {
    const directives = new Map(
      CONTENT_SECURITY_POLICY.split('; ').map((d) => {
        const [name, ...values] = d.split(' ');
        return [name!, values] as const;
      }),
    );
    expect(directives.get('default-src')).toEqual(["'self'"]);
    expect(directives.get('script-src')).toEqual(["'self'"]);
    expect(directives.get('object-src')).toEqual(["'none'"]);
    expect(directives.get('frame-ancestors')).toEqual(["'none'"]);
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/unsafe-inline|unsafe-eval|\*/);
  });

  it('HSTS는 운영에서만 붙는다', async () => {
    const prodRes = await request(prod.httpServer).get('/health');
    expect(prodRes.headers['strict-transport-security']).toBe(HSTS_VALUE);
    const devRes = await request(dev.httpServer).get('/health');
    expect(devRes.headers['strict-transport-security']).toBeUndefined();
  });
});
