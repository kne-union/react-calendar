import { createIntl } from '@kne/react-intl';
import zhCN from './locale/zh-CN';
import enUS from './locale/en-US';
import { getHeaderMonthLabel, getMonthName, getMonthPickerItemLabel, getPanelDateLabel } from './formatCalendarLabels';

const createFormatMessage = locale => {
  const messages = locale === 'zh-CN' ? zhCN : enUS;
  const intl = createIntl({ locale, message: messages, namespace: 'react-calendar' });
  return intl.formatMessage;
};

describe('formatCalendarLabels', () => {
  it('formats panel date label in zh-CN', () => {
    const formatMessage = createFormatMessage('zh-CN');
    expect(getPanelDateLabel(formatMessage, '2026-06-11')).toBe('2026年6月11日');
  });

  it('formats panel date label in en-US', () => {
    const formatMessage = createFormatMessage('en-US');
    expect(getPanelDateLabel(formatMessage, '2026-06-11')).toBe('Jun 11, 2026');
  });

  it('formats header month label from locale month names', () => {
    const zhFormatMessage = createFormatMessage('zh-CN');
    const enFormatMessage = createFormatMessage('en-US');
    expect(getHeaderMonthLabel(zhFormatMessage, '2026-06-11')).toBe('6月');
    expect(getHeaderMonthLabel(enFormatMessage, '2026-06-11')).toBe('Jun');
  });

  it('formats month picker labels from locale month names', () => {
    const enFormatMessage = createFormatMessage('en-US');
    expect(getMonthPickerItemLabel(enFormatMessage, '2026-06-11', 0)).toBe('Jan');
    expect(getMonthName(enFormatMessage, 5)).toBe('Jun');
  });
});
