import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.ts';

const base = { DATABASE_URL: 'postgres://u:p@localhost/db', SESSION_SECRET: 'a'.repeat(32) };

describe('서버 설정', () => {
  it('이전 세션 비밀값은 비어 있으면 두지 않는다', () => {
    expect(loadConfig(base).previousSessionSecret).toBeUndefined();
    expect(
      loadConfig({ ...base, SESSION_SECRET_PREVIOUS: '' }).previousSessionSecret,
    ).toBeUndefined();
  });

  it('교체 중이면 이전 세션 비밀값을 함께 읽는다', () => {
    const config = loadConfig({ ...base, SESSION_SECRET_PREVIOUS: 'b'.repeat(32) });
    expect(config.sessionSecret).toBe('a'.repeat(32));
    expect(config.previousSessionSecret).toBe('b'.repeat(32));
  });

  it('이전 비밀값이 짧거나 현재 값과 같으면 시작하지 않고 값은 메시지에 싣지 않는다', () => {
    expect(() => loadConfig({ ...base, SESSION_SECRET_PREVIOUS: 'short' })).toThrow(/32자 이상/);
    expect(() => loadConfig({ ...base, SESSION_SECRET_PREVIOUS: base.SESSION_SECRET })).toThrow(
      /같다/,
    );
    try {
      loadConfig({ ...base, SESSION_SECRET_PREVIOUS: base.SESSION_SECRET });
    } catch (error) {
      expect((error as Error).message).not.toContain(base.SESSION_SECRET);
    }
  });
});
