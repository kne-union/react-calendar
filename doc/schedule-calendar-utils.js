/* global _ReactCalendar, antd, React, dayjs, render */

const { default: ScheduleCalendar, groupEventsByDate, generateTimeSlots } = _ReactCalendar;
const { Flex, Select, Typography } = antd;
const { useMemo, useState } = React;
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
    end: '2026-06-11 15:30'
  },
  {
    id: 'iv-1003',
    title: 'Java 工程师 - 陈浩',
    start: '2026-06-12 09:30',
    end: '2026-06-12 11:00'
  }
];

const UtilsExample = () => {
  const [locale, setLocale] = useState('zh-CN');
  const [selectedDate, setSelectedDate] = useState('2026-06-11');

  const grouped = useMemo(() => groupEventsByDate(interviewEvents), []);
  const slots = useMemo(
    () =>
      generateTimeSlots({
        date: selectedDate,
        events: grouped[selectedDate] || [],
        timeUnit: 30,
        dayStart: '09:00',
        dayEnd: '18:00',
        mode: 'schedule'
      }),
    [grouped, selectedDate]
  );

  const freeCount = slots.filter(item => item.status === 'free').length;
  const occupiedCount = slots.filter(item => item.status === 'occupied').length;

  return (
    <Flex vertical gap={12}>
      <Select value={locale} onChange={setLocale} style={{ width: 120 }} options={localeOptions} />
      <Text type="secondary">
        工具函数：`groupEventsByDate` 按天聚合日程，`generateTimeSlots` 生成时间段及 `free/occupied/disabled` 状态。下方组件切换日期时同步更新统计。
      </Text>
      <ScheduleCalendar
        locale={locale}
        mode="view"
        value={selectedDate}
        onChange={date => setSelectedDate(dayjs(date).format('YYYY-MM-DD'))}
        events={interviewEvents}
      />
      <Flex vertical gap={4} style={{ paddingTop: 8, borderTop: '1px solid #eceef3' }}>
        <Text code style={{ fontSize: 12 }}>
          groupEventsByDate → {Object.keys(grouped).length} 天有日程
        </Text>
        <Text code style={{ fontSize: 12 }}>
          generateTimeSlots({selectedDate}) → 共 {slots.length} 段，空闲 {freeCount}，占用 {occupiedCount}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          首段：{slots[0] ? `${dayjs(slots[0].start).format('HH:mm')}-${dayjs(slots[0].end).format('HH:mm')} (${slots[0].status})` : '-'}
        </Text>
      </Flex>
    </Flex>
  );
};

render(<UtilsExample />);
