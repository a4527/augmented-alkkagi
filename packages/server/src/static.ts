import { existsSync } from 'node:fs';
import path from 'node:path';
import express, { type RequestHandler } from 'express';

const API_PREFIXES = ['/api', '/socket.io', '/health'];

/**
 * HTML 응답의 캐시 정책. 매번 재확인(`max-age=0`)은 기본값과 같고 `no-transform`을 더해 앞단(Cloudflare)이
 * HTML을 고치지 못하게 한다. Cloudflare는 프록시한 HTML에 분석 스크립트를 자동으로 끼워 넣는데 이는
 * 다른 출처 스크립트라 CSP(`script-src 'self'`)가 막고 위반 보고를 남긴다(OPS-004, AUTH HTTP 보안 헤더).
 */
export const HTML_CACHE_CONTROL = 'public, max-age=0, no-transform';

function isReserved(requestPath: string): boolean {
  return API_PREFIXES.some(
    (prefix) => requestPath === prefix || requestPath.startsWith(`${prefix}/`),
  );
}

/**
 * 빌드된 클라이언트를 정적 파일로 제공한다(OPERATIONS SPA fallback).
 * `/api`·`/socket.io`·`/health` 밖의 확장자 없는 GET은 `index.html`로 대체하고,
 * 확장자가 있는 요청은 파일이 없으면 404로 둔다.
 */
export function createStaticHandlers(staticDir: string): RequestHandler[] {
  const indexFile = path.join(staticDir, 'index.html');
  const serveFiles = express.static(staticDir, {
    index: false,
    fallthrough: true,
    setHeaders: (res, filePath) => {
      if (path.extname(filePath) === '.html') res.setHeader('Cache-Control', HTML_CACHE_CONTROL);
    },
  });
  const fallback: RequestHandler = (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (isReserved(req.path)) return next();
    if (path.extname(req.path) !== '') {
      res.status(404).type('text/plain').send('Not Found');
      return;
    }
    // send는 Cache-Control이 이미 있으면 덮어쓰지 않는다.
    res.setHeader('Cache-Control', HTML_CACHE_CONTROL);
    res.sendFile(indexFile);
  };
  return [serveFiles, fallback];
}

export function hasClientBuild(staticDir: string): boolean {
  return existsSync(path.join(staticDir, 'index.html'));
}
