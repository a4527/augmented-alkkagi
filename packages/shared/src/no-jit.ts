// 브라우저 진입점(창·Worker·SharedWorker)이 다른 모듈보다 먼저 import한다(`import '@alkkagi/shared/no-jit'`).
// Zod는 객체 스키마를 만들 때 `Function('')`으로 JIT 가능 여부를 시험하는데, 서버의 CSP(`script-src 'self'`,
// eval 금지, AUTH "HTTP 보안 헤더")가 이를 막아 페이지마다 위반 보고가 생긴다. 스키마를 만들기 전에 JIT를 끄면
// 시험하지 않고 같은 검증 결과를 낸다. CSP가 없는 서버는 import하지 않는다.
import { z } from 'zod';

z.config({ jitless: true });
