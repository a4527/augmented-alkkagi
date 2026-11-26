import { expect, it } from 'vitest';

// CI-001 병합 차단 확인용 임시 실패 테스트. 병합하지 않는다.
it('일부러 실패한다', () => {
  expect(1).toBe(2);
});
