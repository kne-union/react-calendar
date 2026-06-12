/* global _ReactCalendar, antd, React, dayjs, render */

const { default: ScheduleCalendar } = _ReactCalendar;
const { Flex, Select, Space, Tag, Typography, message } = antd;
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

const CustomRenderExample = () => {
  const [locale, setLocale] = useState('zh-CN');
  const [events, setEvents] = useState(interviewEvents);

  return (
    <Flex vertical gap={12}>
      <Select value={locale} onChange={setLocale} style={{ width: 120 }} options={localeOptions} />
      <Text type="secondary">
        自定义渲染 API：`renderDateCell`、`renderTimeSlot`、`renderOccupiedSlot`、`renderPanelHeader`，以及根节点 `className` / `style`。
      </Text>
      <ScheduleCalendar
        locale={locale}
        mode="schedule"
        defaultValue="2026-06-12"
        events={events}
        timeUnit={60}
        dayStart="09:00"
        dayEnd="18:00"
        allowMultiSelect={false}
        className="demo-schedule-calendar-custom"
        style={{ boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }}
        onCreate={(values, { slots }) => {
          const firstSlot = slots[0];
          const lastSlot = slots[slots.length - 1];
          setEvents(list =>
            list.concat({
              id: `iv-${Date.now()}`,
              title: values.title,
              detail: values.detail,
              start: firstSlot.start,
              end: lastSlot.end
            })
          );
          message.success(`已创建：${values.title}`);
        }}
        renderDateCell={(date, { events: dateEvents, selected, currentMonth }) => (
          <div
            style={{
              width: '100%',
              aspectRatio: 1,
              minHeight: 44,
              padding: '8%',
              borderRadius: '12%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: selected ? '#1677ff' : dateEvents.length ? '#e6f4ff' : 'transparent',
              color: selected ? '#fff' : currentMonth ? '#202124' : 'rgba(0,0,0,0.35)'
            }}
          >
            <strong>{dayjs(date).date()}</strong>
            <span style={{ fontSize: 11 }}>{dateEvents.length ? `${dateEvents.length} 场` : '—'}</span>
          </div>
        )}
        renderTimeSlot={(slot, { selected }) => (
          <div
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 10,
              textAlign: 'center',
              background: selected ? '#1677ff' : slot.status === 'free' ? '#fff' : slot.status === 'occupied' ? '#fff1f0' : '#f0f0f0',
              color: selected ? '#fff' : undefined,
              opacity: slot.status === 'disabled' ? 0.55 : 1
            }}
          >
            {dayjs(slot.start).format('HH:mm')} - {dayjs(slot.end).format('HH:mm')}
          </div>
        )}
        renderOccupiedSlot={(slot, { events: slotEvents }) => (
          <Space size={4} wrap>
            <Tag color="red">冲突</Tag>
            <span style={{ fontSize: 12 }}>{slotEvents.map(item => item.title).join('、')}</span>
          </Space>
        )}
        renderPanelHeader={({ date, mode, events: dayEvents }) => (
          <Text strong>
            {dayjs(date).format('YYYY-MM-DD')} · {mode} · {dayEvents.length} 条
          </Text>
        )}
      />
    </Flex>
  );
};

render(<CustomRenderExample />);
