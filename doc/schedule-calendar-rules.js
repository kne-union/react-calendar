/* global _ReactCalendar, antd, React, dayjs, render */

const { default: ScheduleCalendar } = _ReactCalendar;
const { Flex, Select, Typography } = antd;
const { useState } = React;
const { Text } = Typography;

const localeOptions = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' }
];

const interviewEvents = [
  {
    id: 'iv-1001',
    title: '前端工程师 - 张三',
    start: '2026-06-11 10:00',
    end: '2026-06-11 10:30'
  },
  {
    id: 'iv-1002',
    title: '产品经理 - 王芳',
    start: '2026-06-11 14:00',
    end: '2026-06-11 15:00'
  },
  {
    id: 'iv-1003',
    title: 'Java 工程师 - 陈浩',
    start: '2026-06-12 09:30',
    end: '2026-06-12 11:00'
  }
];

const isWeekend = date => [0, 6].includes(date.getDay());

const workdayAvailable = ({ date, slot }) => {
  if (isWeekend(date)) {
    return false;
  }
  if (!slot) {
    return true;
  }
  const hour = dayjs(slot.start).hour();
  return hour >= 9 && hour < 18;
};

const lunchDisabled = ({ slot }) => {
  if (!slot) {
    return false;
  }
  if (dayjs(slot.start).hour() === 12) {
    return { disabled: true, reason: '12:00-13:00 午休不可预约' };
  }
  return false;
};

const RulesExample = () => {
  const [locale, setLocale] = useState('zh-CN');

  return (
    <Flex vertical gap={12}>
      <Select value={locale} onChange={setLocale} style={{ width: 120 }} options={localeOptions} />
      <Text type="secondary">
        规则 API：`disabledDate`（禁用 6/10 前日期）、`availableDateTime`（仅工作日 9:00-18:00）、`disabledDateTime`（12:00 午休禁用并展示 reason）。
      </Text>
      <ScheduleCalendar
        locale={locale}
        mode="schedule"
      defaultValue="2026-06-11"
      events={interviewEvents}
      timeUnit={30}
      dayStart="08:00"
      dayEnd="20:00"
      disabledDate={date => dayjs(date).isBefore(dayjs('2026-06-10'), 'day')}
      availableDateTime={workdayAvailable}
      disabledDateTime={lunchDisabled}
      renderPanelHeader={({ date }) => (
        <Flex vertical gap={2}>
          <Text strong>{dayjs(date).format('YYYY-MM-DD')} 开放规则</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            周末关闭 · 工作日 9-18 点 · 12 点午休禁用
          </Text>
        </Flex>
      )}
      />
    </Flex>
  );
};

render(<RulesExample />);
