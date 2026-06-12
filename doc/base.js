/* global _ReactCalendar, antd, React, dayjs, render */

const { default: ScheduleCalendar } = _ReactCalendar;
const { Flex, Select, Typography, message } = antd;
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
    detail: '电话初筛 · 面试官：李敏',
    start: '2026-06-11 10:00',
    end: '2026-06-11 10:30',
    color: 'blue',
    raw: { type: '电话' },
    onClick: event => message.info(`查看面试：${event.title}`)
  },
  {
    id: 'iv-1002',
    title: '产品经理 - 王芳',
    detail: '视频复试 · 面试官：赵强',
    start: '2026-06-11 14:00',
    end: '2026-06-11 15:00',
    color: 'purple',
    raw: { type: '视频' },
    onClick: event => message.info(`查看面试：${event.title}`)
  },
  {
    id: 'iv-1003',
    title: 'Java 工程师 - 陈浩',
    detail: '现场面试 · 会议室 A-301',
    start: '2026-06-12 09:30',
    end: '2026-06-12 11:00',
    color: 'green',
    raw: { type: '现场' },
    onClick: event => message.info(`查看面试：${event.title}`)
  }
];

const BaseExample = () => {
  const [locale, setLocale] = useState('zh-CN');

  return (
    <Flex vertical gap={8}>
      <Select value={locale} onChange={setLocale} style={{ width: 120 }} options={localeOptions} />
      <Text type="secondary">最基础用法：`mode="view"` + `events` + `defaultValue`。日程项可配置 `onClick` 响应点击。</Text>
      <ScheduleCalendar locale={locale} mode="view" defaultValue="2026-06-11" defaultCurrent="2026-06-01" events={interviewEvents} />
    </Flex>
  );
};

render(<BaseExample />);
