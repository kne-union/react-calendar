/* global _ReactCalendar, _FormInfo, antd, React, dayjs, render */

const { default: ScheduleCalendar } = _ReactCalendar;
const { default: FormInfo, Input, TextArea, Select: FormSelect } = _FormInfo;
const { Flex, Select, Space, Typography, message } = antd;
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
    end: '2026-06-11 10:30'
  },
  {
    id: 'iv-1002',
    title: '产品经理 - 王芳',
    detail: '视频复试 · 面试官：赵强',
    start: '2026-06-11 14:00',
    end: '2026-06-11 15:00'
  },
  {
    id: 'iv-1003',
    title: 'Java 工程师 - 陈浩',
    detail: '现场面试 · 会议室 A-301',
    start: '2026-06-12 09:30',
    end: '2026-06-12 11:00'
  }
];

const formInner = (
  <FormInfo
    column={1}
    list={[
      <Input name="title" label="面试主题" rule="REQ" placeholder="如：前端工程师 - 候选人姓名" block />,
      <FormSelect
        name="interviewType"
        label="面试形式"
        rule="REQ"
        options={[
          { label: '电话初筛', value: 'phone' },
          { label: '视频复试', value: 'video' },
          { label: '现场面试', value: 'onsite' }
        ]}
        block
      />,
      <Input name="interviewer" label="面试官" rule="REQ" block />,
      <TextArea name="detail" label="备注" placeholder="会议室、候选人背景等" block />
    ]}
  />
);

const ScheduleExample = () => {
  const [locale, setLocale] = useState('zh-CN');
  const [events, setEvents] = useState(interviewEvents);
  const [selectedDate, setSelectedDate] = useState('2026-06-11');
  const [actionLog, setActionLog] = useState([]);

  const appendLog = (label, payload) => {
    setActionLog(log => [`${label}: ${JSON.stringify(payload)}`, ...log].slice(0, 4));
  };

  const handleCreate = async (values, context) => {
    const firstSlot = context.slots[0];
    const lastSlot = context.slots[context.slots.length - 1];
    setEvents(list =>
      list.concat({
        id: `iv-${Date.now()}`,
        title: values.title,
        detail: `${values.detail || ''}${values.interviewer ? ` · 面试官：${values.interviewer}` : ''}`.trim(),
        start: firstSlot.start,
        end: lastSlot.end
      })
    );
    message.success(`已创建：${values.title}`);
  };

  return (
    <Flex vertical gap={12}>
      <Select value={locale} onChange={setLocale} style={{ width: 120 }} options={localeOptions} />
      <Text type="secondary">
        安排模式 API：`timeUnit`、`dayStart`、`dayEnd`、`allowMultiSelect`、`formInner`、`formProps`、`defaultFormValues`、`onCreate`、`onFreeSlotClick`、`onSlotRangeChange`。
      </Text>
      <ScheduleCalendar
        locale={locale}
        mode="schedule"
        value={selectedDate}
        onChange={(date, info) => {
          setSelectedDate(dayjs(date).format('YYYY-MM-DD'));
          appendLog('onChange', { date: dayjs(date).format('YYYY-MM-DD'), source: info.source });
        }}
        events={events}
        timeUnit={30}
        dayStart="09:00"
        dayEnd="18:00"
        allowMultiSelect
        formInner={formInner}
        formProps={{ size: 'small' }}
        defaultFormValues={({ date, slots }) => ({
          title: '',
          interviewType: 'video',
          interviewer: '',
          detail: slots.length > 1 ? `连续选择 ${slots.length} 个时段` : `日期 ${dayjs(date).format('YYYY-MM-DD')}`
        })}
        onFreeSlotClick={slot =>
          appendLog('onFreeSlotClick', {
            range: `${dayjs(slot.start).format('HH:mm')}-${dayjs(slot.end).format('HH:mm')}`
          })
        }
        onSlotRangeChange={(slots, info) =>
          appendLog('onSlotRangeChange', {
            action: info.action,
            count: slots.length
          })
        }
        onCreate={handleCreate}
        renderPanelHeader={({ date }) => (
          <Flex vertical gap={2}>
            <Text strong>{dayjs(date).format('M月D日')} 可预约时段</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              点击或拖选空闲段后填写表单创建面试
            </Text>
          </Flex>
        )}
      />
      {actionLog.length ? (
        <Flex vertical gap={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            最近回调：
          </Text>
          {actionLog.map((item, index) => (
            <Text key={index} code style={{ fontSize: 12 }}>
              {item}
            </Text>
          ))}
        </Flex>
      ) : null}
    </Flex>
  );
};

render(<ScheduleExample />);
