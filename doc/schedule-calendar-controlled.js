/* global _ReactCalendar, antd, React, dayjs, render */

const { default: ScheduleCalendar } = _ReactCalendar;
const { Flex, Space, Typography } = antd;
const { useState } = React;
const { Text } = Typography;

const interviewEvents = [
  {
    id: 'iv-1001',
    title: '前端工程师 - 张三',
    detail: '电话初筛',
    start: '2026-06-11 10:00',
    end: '2026-06-11 10:30'
  },
  {
    id: 'iv-1002',
    title: '产品经理 - 王芳',
    detail: '视频复试',
    start: '2026-06-16 14:00',
    end: '2026-06-16 15:00'
  }
];

const ControlledExample = () => {
  const [selectedDate, setSelectedDate] = useState('2026-06-11');
  const [currentMonth, setCurrentMonth] = useState('2026-06-01');
  const [logs, setLogs] = useState([]);

  const appendLog = (label, payload) => {
    setLogs(list => [`${label}: ${JSON.stringify(payload)}`, ...list].slice(0, 6));
  };

  return (
    <Flex vertical gap={12}>
      <Text type="secondary">受控 API：`value` / `onChange` 控制选中日期，`current` / `onCurrentChange` 控制浏览月份（与 `defaultValue` / `defaultCurrent` 相对）。</Text>
      <Space wrap>
        <Text>选中日期：{selectedDate}</Text>
        <Text>浏览月份：{dayjs(currentMonth).format('YYYY-MM')}</Text>
      </Space>
      <ScheduleCalendar
        mode="view"
        value={selectedDate}
        current={currentMonth}
        events={interviewEvents}
        onChange={(date, info) => {
          setSelectedDate(dayjs(date).format('YYYY-MM-DD'));
          appendLog('onChange', { date: dayjs(date).format('YYYY-MM-DD'), source: info.source });
        }}
        onDateChange={(date, info) => {
          appendLog('onDateChange', { date: dayjs(date).format('YYYY-MM-DD'), source: info.source });
        }}
        onCurrentChange={(date, info) => {
          setCurrentMonth(dayjs(date).startOf('month').format('YYYY-MM-DD'));
          appendLog('onCurrentChange', { month: dayjs(date).format('YYYY-MM'), source: info.source });
        }}
      />
      {logs.length ? (
        <Flex vertical gap={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            回调日志：
          </Text>
          {logs.map((item, index) => (
            <Text key={index} code style={{ fontSize: 12 }}>
              {item}
            </Text>
          ))}
        </Flex>
      ) : null}
    </Flex>
  );
};

render(<ControlledExample />);
