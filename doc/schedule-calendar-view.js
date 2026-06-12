/* global _ReactCalendar, antd, React, dayjs, render */

const { default: ScheduleCalendar } = _ReactCalendar;
const { Flex, Select, Space, Switch, Typography, message } = antd;
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
    raw: { type: '电话', label: '电话' },
    onClick: event => message.info(`打开详情：${event.title}`)
  },
  {
    id: 'iv-1002',
    title: '产品经理 - 王芳',
    detail: '视频复试 · 面试官：赵强、周琳',
    start: '2026-06-11 14:00',
    end: '2026-06-11 15:00',
    color: 'purple',
    raw: { type: '视频', label: '视频' },
    onClick: event => message.info(`打开详情：${event.title}`)
  },
  {
    id: 'iv-1003',
    title: 'Java 工程师 - 陈浩',
    detail: '现场面试 · 会议室 A-301',
    start: '2026-06-12 09:30',
    end: '2026-06-12 11:00',
    color: 'green',
    raw: { type: '现场', label: '现场' },
    onClick: event => message.info(`打开详情：${event.title}`)
  },
  {
    id: 'iv-1004',
    title: 'UI 设计师 - 孙悦',
    detail: '作品集评审',
    start: '2026-06-12 15:00',
    end: '2026-06-12 16:00',
    color: 'purple',
    raw: { type: '视频', label: '视频' }
  },
  {
    id: 'iv-1005',
    title: '测试工程师 - 吴磊',
    detail: '技术面二面',
    start: '2026-06-16 10:00',
    end: '2026-06-16 11:30',
    color: 'green',
    raw: { type: '现场', label: '现场' }
  }
];

const ViewExample = () => {
  const [locale, setLocale] = useState('zh-CN');
  const [loading, setLoading] = useState(false);
  const [lastChange, setLastChange] = useState('-');

  return (
    <Flex vertical gap={12}>
      <Text type="secondary">
        单条日程可通过 `event.onClick` 响应点击；未配置时由 `onEventClick` 统一处理（见 iv-1004、iv-1005）。
      </Text>
      <Select value={locale} onChange={setLocale} style={{ width: 120 }} options={localeOptions} />
      <Space wrap>
        <Switch checked={loading} onChange={setLoading} checkedChildren="loading" unCheckedChildren="idle" />
        <Text type="secondary" style={{ fontSize: 12 }}>
          onDateChange：{lastChange}
        </Text>
      </Space>
      <ScheduleCalendar
        locale={locale}
        mode="view"
        defaultValue="2026-06-11"
        defaultCurrent="2026-06-01"
        events={interviewEvents}
        loading={loading}
        badgeMaxCount={9}
        onDateChange={(date, info) => setLastChange(`${dayjs(date).format('YYYY-MM-DD')} (${info.source})`)}
        onEventClick={(event, ctx) => message.info(`onEventClick：${event.title}（${ctx.mode}）`)}
        panelProps={{ 'data-demo': 'view-panel' }}
        calendarProps={{ 'data-demo': 'view-calendar' }}
      />
    </Flex>
  );
};

render(<ViewExample />);
