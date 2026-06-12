# react-calendar

### 描述

实现一个日程的组件

### 安装

```shell
npm i --save @kne/react-calendar
```

### 概述

### 项目概述

`@kne/react-calendar` 提供一个左右布局的日程组件，支持日程查看和日程安排两种状态。

左侧日历按日期聚合日程并展示 badge，右侧面板在查看状态展示当天日程列表，在安排状态按时间单位展示空闲、占用和禁用时间段。组件支持受控和非受控模式，内部使用 `@kne/use-control-value` 管理当前选中日期，并使用 `dayjs` 处理时间计算。

组件还支持通过 `disabledDateTime` 和 `availableDateTime` 配置安排规则，用于禁用部分日期时间或仅开放符合条件的日期时间。

### 主要特性

- 左右布局：左侧月日历，右侧动态面板。
- 查看状态：日期下方展示日程数量 badge，右侧展示当天日程列表。
- 安排状态：按固定时间单位生成当天时间段，区分空闲、占用和禁用状态。
- 规则控制：支持按规则禁用日期时间，也支持仅开放符合条件的日期时间。
- 表单扩展：默认提供标题和详情字段，也可以通过 `formInner` 传入 `FormInfo` 自定义表单内容。
- 渲染扩展：支持自定义日期格、日程 item、时间段、占用时间段和右侧面板头部。
- 状态模式：通过 `@kne/use-control-value` 同时支持受控和非受控用法。

### 使用场景

- 会议室、面试、服务预约等需要按时间段安排资源的场景。
- 项目排期、客户回访、值班表等需要按日期查看日程的场景。
- 需要在业务系统中嵌入可定制日程组件，并由外部接口提供日程数据的场景。


### 示例

#### 示例代码

- 基础用法
- view 模式最简接入：events + defaultValue
- _ReactCalendar(@kne/current-lib_react-calendar)[import * as _ReactCalendar from "@kne/react-calendar"],(@kne/current-lib_react-calendar/dist/index.css),antd(antd),dayjs(dayjs)

```jsx
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
    onClick: event => message.info(&#96;查看面试：${event.title}&#96;)
  },
  {
    id: 'iv-1002',
    title: '产品经理 - 王芳',
    detail: '视频复试 · 面试官：赵强',
    start: '2026-06-11 14:00',
    end: '2026-06-11 15:00',
    color: 'purple',
    raw: { type: '视频' },
    onClick: event => message.info(&#96;查看面试：${event.title}&#96;)
  },
  {
    id: 'iv-1003',
    title: 'Java 工程师 - 陈浩',
    detail: '现场面试 · 会议室 A-301',
    start: '2026-06-12 09:30',
    end: '2026-06-12 11:00',
    color: 'green',
    raw: { type: '现场' },
    onClick: event => message.info(&#96;查看面试：${event.title}&#96;)
  }
];

const BaseExample = () => {
  const [locale, setLocale] = useState('zh-CN');

  return (
    <Flex vertical gap={8}>
      <Select value={locale} onChange={setLocale} style={{ width: 120 }} options={localeOptions} />
      <Text type="secondary">最基础用法：&#96;mode="view"&#96; + &#96;events&#96; + &#96;defaultValue&#96;。日程项可配置 &#96;onClick&#96; 响应点击。</Text>
      <ScheduleCalendar locale={locale} mode="view" defaultValue="2026-06-11" defaultCurrent="2026-06-01" events={interviewEvents} />
    </Flex>
  );
};

render(<BaseExample />);

```

- 查看模式
- view 模式默认样式、event.onClick / onEventClick、loading、onDateChange 等 API
- _ReactCalendar(@kne/current-lib_react-calendar)[import * as _ReactCalendar from "@kne/react-calendar"],(@kne/current-lib_react-calendar/dist/index.css),antd(antd),dayjs(dayjs)

```jsx
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
    onClick: event => message.info(&#96;打开详情：${event.title}&#96;)
  },
  {
    id: 'iv-1002',
    title: '产品经理 - 王芳',
    detail: '视频复试 · 面试官：赵强、周琳',
    start: '2026-06-11 14:00',
    end: '2026-06-11 15:00',
    color: 'purple',
    raw: { type: '视频', label: '视频' },
    onClick: event => message.info(&#96;打开详情：${event.title}&#96;)
  },
  {
    id: 'iv-1003',
    title: 'Java 工程师 - 陈浩',
    detail: '现场面试 · 会议室 A-301',
    start: '2026-06-12 09:30',
    end: '2026-06-12 11:00',
    color: 'green',
    raw: { type: '现场', label: '现场' },
    onClick: event => message.info(&#96;打开详情：${event.title}&#96;)
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
        单条日程可通过 &#96;event.onClick&#96; 响应点击；未配置时由 &#96;onEventClick&#96; 统一处理（见 iv-1004、iv-1005）。
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
        onDateChange={(date, info) => setLastChange(&#96;${dayjs(date).format('YYYY-MM-DD')} (${info.source})&#96;)}
        onEventClick={(event, ctx) => message.info(&#96;onEventClick：${event.title}（${ctx.mode}）&#96;)}
        panelProps={{ 'data-demo': 'view-panel' }}
        calendarProps={{ 'data-demo': 'view-calendar' }}
      />
    </Flex>
  );
};

render(<ViewExample />);

```

- 安排模式
- 时间段安排、自定义表单、拖选多段、onCreate / onFreeSlotClick / onSlotRangeChange
- _ReactCalendar(@kne/current-lib_react-calendar)[import * as _ReactCalendar from "@kne/react-calendar"],(@kne/current-lib_react-calendar/dist/index.css),_FormInfo(@kne/form-info)[import * as _FormInfo from "@kne/form-info"],(@kne/form-info/dist/index.css),antd(antd),dayjs(dayjs)

```jsx
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
    setActionLog(log => [&#96;${label}: ${JSON.stringify(payload)}&#96;, ...log].slice(0, 4));
  };

  const handleCreate = async (values, context) => {
    const firstSlot = context.slots[0];
    const lastSlot = context.slots[context.slots.length - 1];
    setEvents(list =>
      list.concat({
        id: &#96;iv-${Date.now()}&#96;,
        title: values.title,
        detail: &#96;${values.detail || ''}${values.interviewer ? &#96; · 面试官：${values.interviewer}&#96; : ''}&#96;.trim(),
        start: firstSlot.start,
        end: lastSlot.end
      })
    );
    message.success(&#96;已创建：${values.title}&#96;);
  };

  return (
    <Flex vertical gap={12}>
      <Select value={locale} onChange={setLocale} style={{ width: 120 }} options={localeOptions} />
      <Text type="secondary">
        安排模式 API：&#96;timeUnit&#96;、&#96;dayStart&#96;、&#96;dayEnd&#96;、&#96;allowMultiSelect&#96;、&#96;formInner&#96;、&#96;formProps&#96;、&#96;defaultFormValues&#96;、&#96;onCreate&#96;、&#96;onFreeSlotClick&#96;、&#96;onSlotRangeChange&#96;。
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
          detail: slots.length > 1 ? &#96;连续选择 ${slots.length} 个时段&#96; : &#96;日期 ${dayjs(date).format('YYYY-MM-DD')}&#96;
        })}
        onFreeSlotClick={slot =>
          appendLog('onFreeSlotClick', {
            range: &#96;${dayjs(slot.start).format('HH:mm')}-${dayjs(slot.end).format('HH:mm')}&#96;
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

```

- 开放与禁用规则
- disabledDate、availableDateTime、disabledDateTime 组合配置
- _ReactCalendar(@kne/current-lib_react-calendar)[import * as _ReactCalendar from "@kne/react-calendar"],(@kne/current-lib_react-calendar/dist/index.css),antd(antd),dayjs(dayjs)

```jsx
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
        规则 API：&#96;disabledDate&#96;（禁用 6/10 前日期）、&#96;availableDateTime&#96;（仅工作日 9:00-18:00）、&#96;disabledDateTime&#96;（12:00 午休禁用并展示 reason）。
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

```

- 受控模式
- value / onChange 与 current / onCurrentChange 受控用法
- _ReactCalendar(@kne/current-lib_react-calendar)[import * as _ReactCalendar from "@kne/react-calendar"],(@kne/current-lib_react-calendar/dist/index.css),antd(antd),dayjs(dayjs)

```jsx
/* global _ReactCalendar, antd, React, dayjs, render */

const { default: ScheduleCalendar } = _ReactCalendar;
const { Flex, Select, Space, Typography } = antd;
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
  const [locale, setLocale] = useState('zh-CN');
  const [selectedDate, setSelectedDate] = useState('2026-06-11');
  const [currentMonth, setCurrentMonth] = useState('2026-06-01');
  const [logs, setLogs] = useState([]);

  const appendLog = (label, payload) => {
    setLogs(list => [&#96;${label}: ${JSON.stringify(payload)}&#96;, ...list].slice(0, 6));
  };

  return (
    <Flex vertical gap={12}>
      <Text type="secondary">受控 API：&#96;value&#96; / &#96;onChange&#96; 控制选中日期，&#96;current&#96; / &#96;onCurrentChange&#96; 控制浏览月份（与 &#96;defaultValue&#96; / &#96;defaultCurrent&#96; 相对）。</Text>
      <Select value={locale} onChange={setLocale} style={{ width: 120 }} options={localeOptions} />
      <Space wrap>
        <Text>选中日期：{selectedDate}</Text>
        <Text>浏览月份：{dayjs(currentMonth).format('YYYY-MM')}</Text>
      </Space>
      <ScheduleCalendar
        locale={locale}
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

```

- 自定义渲染
- renderDateCell、renderTimeSlot、renderOccupiedSlot、className、style
- _ReactCalendar(@kne/current-lib_react-calendar)[import * as _ReactCalendar from "@kne/react-calendar"],(@kne/current-lib_react-calendar/dist/index.css),antd(antd),dayjs(dayjs)

```jsx
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
        自定义渲染 API：&#96;renderDateCell&#96;、&#96;renderTimeSlot&#96;、&#96;renderOccupiedSlot&#96;、&#96;renderPanelHeader&#96;，以及根节点 &#96;className&#96; / &#96;style&#96;。
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
              id: &#96;iv-${Date.now()}&#96;,
              title: values.title,
              detail: values.detail,
              start: firstSlot.start,
              end: lastSlot.end
            })
          );
          message.success(&#96;已创建：${values.title}&#96;);
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
            <span style={{ fontSize: 11 }}>{dateEvents.length ? &#96;${dateEvents.length} 场&#96; : '—'}</span>
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

```

- 工具函数
- groupEventsByDate 与 generateTimeSlots 独立使用示例
- _ReactCalendar(@kne/current-lib_react-calendar)[import * as _ReactCalendar from "@kne/react-calendar"],(@kne/current-lib_react-calendar/dist/index.css),antd(antd),dayjs(dayjs)

```jsx
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
        工具函数：&#96;groupEventsByDate&#96; 按天聚合日程，&#96;generateTimeSlots&#96; 生成时间段及 &#96;free/occupied/disabled&#96; 状态。下方组件切换日期时同步更新统计。
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
          首段：{slots[0] ? &#96;${dayjs(slots[0].start).format('HH:mm')}-${dayjs(slots[0].end).format('HH:mm')} (${slots[0].status})&#96; : '-'}
        </Text>
      </Flex>
    </Flex>
  );
};

render(<UtilsExample />);

```

### API

### ScheduleCalendar API

`ScheduleCalendar` 是一个左右布局的日程查看和日程安排组件。左侧显示月日历，右侧根据 `mode` 展示日程列表或当天时间段安排面板。

#### 基础类型

```ts
type DateLike = string | Date;

type CalendarEvent = {
  id: string | number;
  title: string;
  detail?: React.ReactNode;
  date?: DateLike;
  start: DateLike;
  end: DateLike;
  disabled?: boolean;
  color?: string;
  raw?: unknown;
  onClick?: (event: CalendarEvent, ctx: { date: Date; mode: 'view' | 'schedule' }) => void;
};

type TimeSlot = {
  key: string;
  date: string;
  start: Date;
  end: Date;
  status: 'free' | 'occupied' | 'disabled';
  disabledReason?: React.ReactNode;
  events: CalendarEvent[];
};

type ScheduleDateTimeRuleContext = {
  date: Date;
  slot?: {
    start: Date;
    end: Date;
  };
  mode: 'view' | 'schedule';
};
```

#### Props

| 属性               | 类型                                                                   | 默认值                | 说明                                                         |
| ------------------ | ---------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------ |
| mode               | `'view' \| 'schedule'`                                                 | `'view'`              | 组件模式，查看状态展示日程列表，安排状态展示时间段和创建表单 |
| locale             | `'zh-CN' \| 'en-US' \| string`                                         | `'zh-CN'`             | 组件内置文案语言，传入后切换中英文界面                         |
| value              | `DateLike`                                                             | -                     | 当前选中日期，传入后为受控模式                               |
| defaultValue       | `DateLike`                                                             | -                     | 当前选中日期默认值，不传 `value` 时为非受控模式              |
| onChange           | `(date: Date, info) => void`                                           | -                     | 当前选中日期变化回调，配合 `@kne/use-control-value`          |
| onDateChange       | `(date: Date, info) => void`                                           | -                     | 当前选中日期变化的语义化回调，会和 `onChange` 同步触发       |
| onEventClick       | `(event, ctx) => void`                                                 | -                     | 日程项点击回调；单条 `event.onClick` 存在时优先执行          |
| current            | `DateLike`                                                             | -                     | 当前浏览年月，传入后浏览年月为受控模式                       |
| defaultCurrent     | `DateLike`                                                             | -                     | 当前浏览年月默认值                                           |
| onCurrentChange    | `(date: Date, info) => void`                                           | -                     | 浏览年月变化回调                                             |
| events             | `CalendarEvent[]`                                                      | `[]`                  | 日程数据，左侧 badge 和右侧面板都由它驱动                    |
| loading            | `boolean`                                                              | `false`               | 右侧面板加载状态                                             |
| disabledDate       | `(date: Date) => boolean`                                              | -                     | 禁用某些日期                                                 |
| disabledDateTime   | `(ctx) => boolean \| { disabled?: boolean; reason?: React.ReactNode }` | -                     | 按规则禁用某些日期或时间段                                   |
| availableDateTime  | `(ctx) => boolean`                                                     | -                     | 白名单规则，仅开放返回 `true` 的日期或时间段                 |
| badgeMaxCount      | `number`                                                               | `9`                   | 日期 badge 最大展示数量，超过后显示 `9+`                     |
| timeUnit           | `number`                                                               | `30`                  | 安排状态下的时间段粒度，单位分钟                             |
| dayStart           | `string`                                                               | `'09:00'`             | 安排状态下当天开始时间                                       |
| dayEnd             | `string`                                                               | `'18:00'`             | 安排状态下当天结束时间                                       |
| allowMultiSelect   | `boolean`                                                              | `mode === 'schedule'` | 是否允许拖动选择多个空闲时间段                               |
| renderEventItem    | `(event, ctx) => React.ReactNode`                                      | -                     | 自定义查看状态下的日程列表 item                              |
| renderDateCell     | `(date, ctx) => React.ReactNode`                                       | -                     | 自定义左侧日期单元格                                         |
| renderTimeSlot     | `(slot, ctx) => React.ReactNode`                                       | -                     | 自定义安排状态下的时间段                                     |
| renderOccupiedSlot | `(slot, ctx) => React.ReactNode`                                       | -                     | 自定义占用时间段内容                                         |
| renderPanelHeader  | `(ctx) => React.ReactNode`                                             | -                     | 自定义右侧面板头部                                           |
| formInner          | `React.ReactNode`                                                      | 默认标题和详情        | 自定义创建日程表单内部 JSX 内容                              |
| formProps          | `object`                                                               | -                     | 传给 `@kne/form-info` 的 `Form`                              |
| defaultFormValues  | `object \| (ctx) => object`                                            | -                     | 创建表单默认值                                               |
| onFreeSlotClick    | `(slot: TimeSlot) => void`                                             | -                     | 点击空闲时间段回调                                           |
| onSlotRangeChange  | `(slots: TimeSlot[], info) => void`                                    | -                     | 拖动选择时间段变化回调                                       |
| onCreate           | `(values, ctx) => void \| Promise<void>`                               | -                     | 创建日程提交回调；Promise reject 时保留表单与选中时段         |
| className          | `string`                                                               | -                     | 根节点类名                                                   |
| style              | `React.CSSProperties`                                                  | -                     | 根节点样式                                                   |
| stackAt            | `number`                                                               | `560`                 | 容器宽度 **小于** 该值（px）时左右面板改为上下排列；通过 `ResizeObserver` 监听组件根节点实际宽度 |
| calendarProps      | `object`                                                               | -                     | 透传给 `antd` 的 `Calendar`                                  |
| panelProps         | `object`                                                               | -                     | 透传给右侧面板容器                                           |

#### 回调信息

| 回调              | info/context 结构                                    | 说明                                                 |
| ----------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| onChange          | `{ source: 'date' \| 'today' }`                      | 当前选中日期变化，内部由 `useControlValue` 触发      |
| onDateChange      | `{ source: 'date' \| 'today' }`                      | 与 `onChange` 同步触发，用于更语义化地监听日期变化   |
| onEventClick      | `{ date: Date; mode: 'view' \| 'schedule' }`          | 点击日程项时触发；也可在单条 event 上配置 `onClick`  |
| onCurrentChange   | `{ source: 'prevMonth' \| 'nextMonth' \| 'picker' \| 'today' }` | 浏览年月变化，来源分别为上一月、下一月、年月下拉选择、回到今天 |
| onSlotRangeChange | `{ action: 'select' \| 'clear' }`                    | 拖动或取消选择空闲时间段                             |
| onCreate          | `{ date: Date; slots: TimeSlot[] }`                  | 创建表单提交时返回当前日期和选中的时间段             |

#### 开放与禁用规则

规则优先级为：

1. `disabledDate` / `disabledDateTime`
2. `availableDateTime`
3. `events` 占用判断

也就是说，被禁用或不在开放范围内的时间段会直接变成 `disabled`，不会再被视为空闲时间段，也不会参与拖动多选。

```jsx
<ScheduleCalendar
  mode="schedule"
  availableDateTime={({ date, slot }) => {
    if ([0, 6].includes(date.getDay())) return false;
    if (!slot) return true;
    const hour = dayjs(slot.start).hour();
    return hour >= 9 && hour < 18;
  }}
  disabledDateTime={({ slot }) => {
    if (slot && dayjs(slot.start).hour() === 12) {
      return { disabled: true, reason: '午休时间' };
    }
    return false;
  }}
/>
```

#### 默认表单

安排状态下，点击空闲时间段会展示默认表单。默认表单包含 `title` 和 `detail` 两个字段。如果传入 `formInner`，请使用 `@kne/form-info` 的 `FormInfo` 构建表单字段，组件外层仍然使用 `Form` 处理提交。

```jsx
import FormInfo, { Input, TextArea } from '@kne/form-info';

const formInner = (
  <FormInfo
    column={1}
    list={[
      <Input name="title" label="日程标题" rule="REQ" block />,
      <TextArea name="detail" label="日程说明" block />
    ]}
  />
);

<ScheduleCalendar mode="schedule" formInner={formInner} />;
```

#### 工具函数

| 名称              | 参数                                                                                                    | 返回值                            | 说明                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------- |
| groupEventsByDate | `CalendarEvent[]`                                                                                       | `Record<string, CalendarEvent[]>` | 按 `YYYY-MM-DD` 聚合日程，返回项含规范化后的 `start`/`end` |
| generateTimeSlots | `{ date, events, timeUnit, dayStart, dayEnd, disabledDate, disabledDateTime, availableDateTime, mode }` | `TimeSlot[]`                      | 按天生成时间段，并计算 `free`、`occupied`、`disabled` 状态 |
| normalizeEvent    | `CalendarEvent`                                                                                         | `CalendarEvent`                   | 规范化日程起止时间为 dayjs 对象                            |
| sortEventsByStart | `CalendarEvent[]`                                                                                       | `CalendarEvent[]`                 | 按开始时间升序排列                                         |
| dedupeEventsById  | `CalendarEvent[]`                                                                                       | `CalendarEvent[]`                 | 按 `id` 去重，保留最后一次出现                           |

#### 导出

```js
import ScheduleCalendar, {
  ReactCalendar,
  groupEventsByDate,
  generateTimeSlots,
  normalizeEvent,
  sortEventsByStart,
  dedupeEventsById
} from '@kne/react-calendar';
```

`ReactCalendar` 为 `ScheduleCalendar` 的别名导出。
