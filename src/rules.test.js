import dayjs from 'dayjs';
import { checkRule } from './rules';

describe('checkRule', () => {
  const date = dayjs('2026-06-11');

  it('returns disabled when disabledDate matches', () => {
    const result = checkRule({
      date,
      mode: 'schedule',
      disabledDate: current => current.getDate() === 11
    });
    expect(result).toEqual({ disabled: true });
  });

  it('returns disabled reason from disabledDateTime', () => {
    const result = checkRule({
      date,
      mode: 'schedule',
      disabledDateTime: () => ({ disabled: true, reason: 'Blocked' })
    });
    expect(result).toEqual({ disabled: true, reason: 'Blocked' });
  });

  it('returns disabled when availableDateTime returns false', () => {
    const result = checkRule({
      date,
      mode: 'schedule',
      availableDateTime: () => false
    });
    expect(result).toEqual({ disabled: true });
  });

  it('returns null when all rules pass', () => {
    const result = checkRule({
      date,
      mode: 'schedule',
      disabledDate: () => false,
      disabledDateTime: () => false,
      availableDateTime: () => true
    });
    expect(result).toBeNull();
  });

  it('prioritizes disabledDate over availableDateTime', () => {
    const result = checkRule({
      date,
      mode: 'schedule',
      disabledDate: () => true,
      availableDateTime: () => true
    });
    expect(result).toEqual({ disabled: true });
  });
});
