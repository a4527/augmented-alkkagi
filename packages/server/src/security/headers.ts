import type { RequestHandler } from 'express';

/**
 * 콘텐츠 보안 정책(SEC-001, AUTH "HTTP 보안 헤더"). 클라이언트의 스크립트·스타일·글꼴·이미지·소리·영상·
 * Worker·SharedWorker·API·Socket.IO는 모두 같은 출처라 'self'만 허용한다. 인라인 스크립트·스타일과
 * eval은 쓰지 않는다(React의 style 속성은 CSSOM으로 적용돼 style-src에 걸리지 않는다).
 * connect-src 'self'는 같은 호스트의 ws·wss도 허용한다(CSP Level 3).
 * 다른 사이트의 iframe에 넣는 것은 막는다. 포털(itch.io 등) 허용은 POR-001에서 정한다.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

/** HSTS는 운영(HTTPS)에서만 붙인다. 하위 도메인·preload는 도메인을 정할 때(OPS-004) 따로 판단한다. */
export const HSTS_VALUE = 'max-age=31536000';

/** 모든 응답에 보안 헤더를 붙인다. 정적 파일·API·헬스체크보다 앞에 둔다. */
export function securityHeaders(options: { isProduction: boolean }): RequestHandler {
  return (_req, res, next) => {
    res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    if (options.isProduction) res.setHeader('Strict-Transport-Security', HSTS_VALUE);
    next();
  };
}
