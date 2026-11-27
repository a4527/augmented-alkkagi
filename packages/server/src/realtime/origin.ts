/**
 * Socket.IO 핸드셰이크의 출처 확인(SEC-001, AUTH "Socket.IO 연결 경계"). 다른 사이트의 페이지가
 * 사용자의 쿠키로 소켓을 여는 것을 막는다. 브라우저는 WebSocket과 다른 출처 요청에 항상 `Origin`을
 * 붙이므로 `Origin`의 호스트가 요청의 `Host`와 같을 때만 받는다. `Origin`이 없는 요청(같은 출처의
 * 폴링 GET, 브라우저가 아닌 클라이언트)은 세션 쿠키 인증만 거친다. 프록시(Caddy·Cloudflare·Vite 개발 서버)는
 * `Host`를 바꾸지 않는다. 포털 출처 허용은 POR-001에서 정한다.
 */
export function isAllowedOrigin(origin: string | undefined, host: string | undefined): boolean {
  if (origin === undefined) return true;
  if (!host) return false;
  try {
    // `null`(샌드박스 iframe·파일)처럼 URL이 아닌 값은 여기서 거부된다.
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}
