export type ServerConfig = {
  databaseUrl: string;
  sessionSecret: string;
  /** 비밀값 교체 중에만 둔다. 이 값으로 서명된 기존 세션 쿠키도 받는다(OPERATIONS 세션 비밀값 교체). */
  previousSessionSecret?: string;
  port: number;
  isProduction: boolean;
  /** 서버 앞 프록시 단계 수. Express `trust proxy`에 넣어 클라이언트 IP와 HTTPS 여부를 읽는다. */
  trustProxyHops: number;
};

const MIN_SECRET_LENGTH = 32;

/** 환경 변수에서 설정을 읽는다. 값은 로그·오류 메시지에 싣지 않는다. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL이 설정되지 않았다.');

  const sessionSecret = env.SESSION_SECRET;
  if (!sessionSecret) throw new Error('SESSION_SECRET이 설정되지 않았다.');
  if (sessionSecret.length < MIN_SECRET_LENGTH) {
    throw new Error(`SESSION_SECRET은 ${MIN_SECRET_LENGTH}자 이상이어야 한다.`);
  }

  const previousSessionSecret = env.SESSION_SECRET_PREVIOUS || undefined;
  if (previousSessionSecret !== undefined) {
    if (previousSessionSecret.length < MIN_SECRET_LENGTH) {
      throw new Error(`SESSION_SECRET_PREVIOUS는 ${MIN_SECRET_LENGTH}자 이상이어야 한다.`);
    }
    if (previousSessionSecret === sessionSecret) {
      throw new Error('SESSION_SECRET_PREVIOUS가 SESSION_SECRET과 같다.');
    }
  }

  const port = env.PORT ? Number(env.PORT) : 3000;
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT가 올바르지 않다.');

  // 운영은 Cloudflare → Caddy 두 단계다(OPERATIONS 운영 구성). 로컬·테스트는 기본 1.
  const trustProxyHops = env.TRUST_PROXY_HOPS ? Number(env.TRUST_PROXY_HOPS) : 1;
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0 || trustProxyHops > 5) {
    throw new Error('TRUST_PROXY_HOPS는 0~5의 정수여야 한다.');
  }

  return {
    databaseUrl,
    sessionSecret,
    ...(previousSessionSecret === undefined ? {} : { previousSessionSecret }),
    port,
    isProduction: env.NODE_ENV === 'production',
    trustProxyHops,
  };
}
