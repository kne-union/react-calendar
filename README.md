<!--START_SECTION:DOC_MD-->

# react-calendar

### 描述

实现一个日程的组件

### 关键词

react, calendar, schedule, scheduler, appointment, antd, dayjs

### 安装

```shell
npm i --save @kne/react-calendar
```

### 概述

#### 项目概述

`@kne/react-calendar` 提供一个左右布局的日程组件，支持日程查看和日程安排两种状态。

左侧日历按日期聚合日程并展示 badge，右侧面板在查看状态展示当天日程列表，在安排状态以日视图时间轴展示当天日程与禁用时段，可点击或拖拽选择任意时间段并在表单内按分钟精调。组件支持受控和非受控模式，内部使用 `@kne/use-control-value` 管理当前选中日期，并使用 `dayjs` 处理时间计算。

组件还支持通过 `disabledDateTime` 和 `availableDateTime` 配置安排规则，用于禁用部分日期时间或仅开放符合条件的日期时间。

#### 主要特性

- 左右布局：左侧月日历，右侧动态面板。
- 查看状态：日期下方展示日程数量 badge，右侧展示当天日程列表。
- 安排状态：日视图时间轴，日程按实际起止绘制色块；选中段可拖动、可拉伸，表单内嵌带开关的 `TimeWindow` 精调；`allowConflict` 控制是否允许与已有日程重叠。
- 规则控制：支持按规则禁用日期时间，也支持仅开放符合条件的日期时间。
- 表单扩展：默认提供标题和详情字段，也可以通过 `formInner` 传入 `FormInfo` 自定义表单内容。
- 移动端：触屏轻点或长按拖动选择时间，手机上创建表单以底部弹出面板展示。
- 渲染扩展：支持自定义日期格、日程 item、时间轴日程色块和右侧面板头部。
- 状态模式：通过 `@kne/use-control-value` 同时支持受控和非受控用法。
- 时间段选择：`TimeWindow` 在给定范围内滑动固定时长，顶部文案可配置格式和分隔符，拖动或滚轮调整起始时间，回调防抖。

#### 使用场景

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
const { Flex, Select, Switch, Typography, message } = antd;
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
  const [allowConflict, setAllowConflict] = useState(false);

  const appendLog = (label, payload) => {
    setActionLog(log => [&#96;${label}: ${JSON.stringify(payload)}&#96;, ...log].slice(0, 4));
  };

  const handleCreate = async (values, context) => {
    setEvents(list =>
      list.concat({
        id: &#96;iv-${Date.now()}&#96;,
        title: values.title,
        detail: &#96;${values.detail || ''}${values.interviewer ? &#96; · 面试官：${values.interviewer}&#96; : ''}&#96;.trim(),
        start: context.start,
        end: context.end
      })
    );
    message.success(&#96;已创建：${values.title}&#96;);
  };

  return (
    <Flex vertical gap={12}>
      <Flex gap={16} align="center" wrap>
        <Select value={locale} onChange={setLocale} style={{ width: 120 }} options={localeOptions} />
        <Flex gap={8} align="center">
          <Switch size="small" checked={allowConflict} onChange={setAllowConflict} />
          <Text>allowConflict</Text>
        </Flex>
      </Flex>
      <Text type="secondary">
        安排模式
        API：&#96;timeUnit&#96;、&#96;timeStep&#96;、&#96;dayStart&#96;、&#96;dayEnd&#96;、&#96;allowConflict&#96;、&#96;allowMultiSelect&#96;、&#96;formInner&#96;、&#96;formProps&#96;、&#96;defaultFormValues&#96;、&#96;onCreate&#96;、&#96;onFreeSlotClick&#96;、&#96;onSlotRangeChange&#96;。时间轴上点击或拖拽空白处选择时间，拖动选中块可平移，拖动上下边缘可调整时长；表单顶部的
        TimeWindow 打开开关后可按分钟精调。
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
        timeStep={5}
        dayStart="09:00"
        dayEnd="18:00"
        allowConflict={allowConflict}
        allowMultiSelect
        formInner={formInner}
        formProps={{ size: 'small' }}
        defaultFormValues={({ start, end, conflicts }) => ({
          title: '',
          interviewType: 'video',
          interviewer: '',
          detail: &#96;${dayjs(start).format('YYYY-MM-DD HH:mm')} - ${dayjs(end).format('HH:mm')}${conflicts.length ? &#96;（与 ${conflicts.length} 个日程重叠）&#96; : ''}&#96;
        })}
        onFreeSlotClick={slot =>
          appendLog('onFreeSlotClick', {
            range: &#96;${dayjs(slot.start).format('HH:mm')}-${dayjs(slot.end).format('HH:mm')}&#96;
          })
        }
        onSlotRangeChange={(slots, info) =>
          appendLog('onSlotRangeChange', {
            action: info.action,
            range: info.start ? &#96;${dayjs(info.start).format('HH:mm')}-${dayjs(info.end).format('HH:mm')}&#96; : null,
            count: slots.length
          })
        }
        onCreate={handleCreate}
        renderPanelHeader={({ date }) => (
          <Flex vertical gap={2}>
            <Text strong>{dayjs(date).format('M月D日')} 可预约时段</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              点击或拖拽时间轴空白处，再填写表单创建面试
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
      <Text type="secondary">自定义渲染 API：&#96;renderDateCell&#96;、&#96;renderEventBlock&#96;、&#96;renderPanelHeader&#96;，以及根节点 &#96;className&#96; / &#96;style&#96;。</Text>
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
        onCreate={(values, { start, end }) => {
          setEvents(list =>
            list.concat({
              id: &#96;iv-${Date.now()}&#96;,
              title: values.title,
              detail: values.detail,
              start,
              end
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
        renderEventBlock={(event, { start, end }) => (
          <Flex vertical gap={2}>
            <Space size={4}>
              <Tag color="red" style={{ marginInlineEnd: 0 }}>
                已约
              </Tag>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{event.title}</span>
            </Space>
            <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>
              {dayjs(start).format('HH:mm')} - {dayjs(end).format('HH:mm')}
            </span>
          </Flex>
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

- 时间段选择
- 固定时长窗口、自定义范围、format、separator，以及防抖后的 onChange
- _ReactCalendar(@kne/current-lib_react-calendar)[import * as _ReactCalendar from "@kne/react-calendar"],(@kne/current-lib_react-calendar/dist/index.css),antd(antd),dayjs(dayjs)

```jsx
/* global _ReactCalendar, antd, React, dayjs, render */

const { TimeWindow } = _ReactCalendar;
const { Flex, Radio, Typography } = antd;
const { useState } = React;
const { Text } = Typography;

const formatValue = value => {
  if (!value) {
    return '尚未选择';
  }
  const end = dayjs(value[1]);
  return &#96;${dayjs(value[0]).format('YYYY-MM-DD HH:mm')} ～ ${end.format(end.isSame(value[0], 'day') ? 'HH:mm' : 'MM-DD HH:mm')}&#96;;
};

const TimeWindowExample = () => {
  const [interviewWindow, setInterviewWindow] = useState(null);
  const [officeWindow, setOfficeWindow] = useState(null);
  const [mobileWindow, setMobileWindow] = useState(null);
  const [openWindow, setOpenWindow] = useState(null);
  const [inertia, setInertia] = useState(1);
  const [locked, setLocked] = useState(true);

  return (
    <Flex vertical gap={24}>
      <Flex vertical gap={8}>
        <Text strong>面试官可预约时段</Text>
        <Text type="secondary">默认当天全天，窗口 1 小时，滚轮、拖动或点击刻度条调整开始时间；拖动左右把手调整时长（30 分钟至 4 小时）</Text>
        <TimeWindow defaultValue={['2026-07-21 09:00', '2026-07-21 10:00']} minDuration={30} maxDuration={240} onChange={setInterviewWindow} />
        <Text>防抖后的值：{formatValue(interviewWindow)}</Text>
      </Flex>
      <Flex vertical gap={8}>
        <Text strong>工作时间 30 分钟档</Text>
        <Text type="secondary">范围 09:00-18:00，步长 30 分钟，只显示时间并用「至」连接；resizable=false 固定时长，没有边界把手</Text>
        <TimeWindow
          resizable={false}
          duration={30}
          step={30}
          range={['2026-07-21 09:00', '2026-07-21 18:00']}
          defaultValue={['2026-07-21 09:00', '2026-07-21 09:30']}
          format="HH:mm"
          separator=" 至 "
          debounceWait={500}
          onChange={setOfficeWindow}
        />
        <Text>防抖后的值：{formatValue(officeWindow)}</Text>
      </Flex>
      <Flex vertical gap={8}>
        <Text strong>窄容器</Text>
        <Text type="secondary">宽度 320px，刻度标签自动变稀，英文时长标签</Text>
        <div style={{ width: 320, maxWidth: '100%' }}>
          <TimeWindow locale="en-US" duration={90} defaultValue={['2026-07-21 13:30', '2026-07-21 15:00']} onChange={setMobileWindow} />
        </div>
        <Text>防抖后的值：{formatValue(mobileWindow)}</Text>
      </Flex>
      <Flex vertical gap={8}>
        <Text strong>尺寸</Text>
        <Text type="secondary">size 可选 large / default / small</Text>
        <TimeWindow size="large" defaultValue={['2026-07-21 09:00', '2026-07-21 10:00']} />
        <TimeWindow defaultValue={['2026-07-21 09:00', '2026-07-21 10:00']} />
        <TimeWindow size="small" defaultValue={['2026-07-21 09:00', '2026-07-21 10:00']} />
      </Flex>
      <Flex vertical gap={8}>
        <Text strong>编辑开关</Text>
        <Text type="secondary">lockable 开启后显示开关：打开可编辑，锁定后隐藏刻度条</Text>
        <TimeWindow lockable defaultLocked defaultValue={['2026-07-21 09:00', '2026-07-21 10:00']} onLockedChange={setLocked} />
        <Text>{locked ? '已锁定' : '允许编辑'}</Text>
      </Flex>
      <Flex vertical gap={8}>
        <Text strong>立体滚轮效果</Text>
        <Text type="secondary">默认开启，wheelEffect=false 关闭后为平面样式</Text>
        <TimeWindow defaultValue={['2026-07-21 09:00', '2026-07-21 10:00']} />
        <TimeWindow wheelEffect={false} defaultValue={['2026-07-21 09:00', '2026-07-21 10:00']} />
      </Flex>
      <Flex vertical gap={8}>
        <Text strong>惯性</Text>
        <Text type="secondary">快速拖动后松手，或快速连续滚动鼠标滚轮，刻度尺会继续滑行再减速停下</Text>
        <Radio.Group
          optionType="button"
          size="small"
          value={inertia}
          onChange={event => setInertia(event.target.value)}
          options={[
            { label: '关闭', value: false },
            { label: '0.5', value: 0.5 },
            { label: '1（默认）', value: 1 },
            { label: '2', value: 2 }
          ]}
        />
        <TimeWindow range={null} inertia={inertia} defaultValue={['2026-07-21 12:00', '2026-07-21 13:00']} />
      </Flex>
      <Flex vertical gap={8}>
        <Text strong>不限起止时间</Text>
        <Text type="secondary">range 传 null，可跨天连续滚动，步长 15 分钟，鼠标滚轮每格移动 15 分钟</Text>
        <TimeWindow range={null} step={15} defaultValue={['2026-07-21 22:00', '2026-07-21 23:00']} onChange={setOpenWindow} />
        <Text>防抖后的值：{formatValue(openWindow)}</Text>
      </Flex>
    </Flex>
  );
};

render(<TimeWindowExample />);

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

#### ScheduleCalendar API

`ScheduleCalendar` 是一个左右布局的日程查看和日程安排组件。左侧显示月日历，右侧根据 `mode` 展示日程列表或当天时间段安排面板。

安排状态支持移动端：触屏上轻点空白处选择 `timeUnit` 时长，长按后拖动可选择任意时长，普通滑动仍用于滚动；视口宽度小于 768px 时创建表单改为底部弹出面板。组件根节点是 `@kne/responsive-utils` 的容器查询宿主，组件宽度小于 768px 时时间轴使用更大的拖拽手柄。

##### 基础类型

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

##### Props

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
| timeUnit           | `number`                                                               | `30`                  | 时间轴网格线间隔，也是单击空白处时选中的默认时长，单位分钟   |
| timeStep           | `number`                                                               | `5`                   | 时间轴拖拽及表单内 TimeWindow 精调的吸附步长，单位分钟       |
| hourHeight         | `number`                                                               | `56`                  | 时间轴每小时的像素高度                                       |
| allowConflict      | `boolean`                                                              | `false`               | 是否允许选中时间与已有日程重叠；关闭时拖拽与精调都会止于已占用时间，开启时显示冲突提示 |
| dayStart           | `string`                                                               | `'09:00'`             | 安排状态下当天开始时间                                       |
| dayEnd             | `string`                                                               | `'18:00'`             | 安排状态下当天结束时间                                       |
| allowMultiSelect   | `boolean`                                                              | `mode === 'schedule'` | 是否允许拖拽选择任意时长并拖动边缘调整；关闭时只能单击选择 `timeUnit` 时长 |
| renderEventItem    | `(event, ctx) => React.ReactNode`                                      | -                     | 自定义查看状态下的日程列表 item                              |
| renderDateCell     | `(date, ctx) => React.ReactNode`                                       | -                     | 自定义左侧日期单元格                                         |
| renderEventBlock   | `(event, { start, end }) => React.ReactNode`                           | -                     | 自定义时间轴上日程色块的内容                                 |
| renderOccupiedSlot | `(slot, ctx) => React.ReactNode`                                       | -                     | 兼容旧版：未提供 `renderEventBlock` 时用于日程色块内容，`ctx.events` 为该日程 |
| renderPanelHeader  | `(ctx) => React.ReactNode`                                             | -                     | 自定义右侧面板头部                                           |
| formInner          | `React.ReactNode`                                                      | 默认标题和详情        | 自定义创建日程表单内部 JSX 内容                              |
| formProps          | `object`                                                               | -                     | 传给 `@kne/form-info` 的 `Form`                              |
| defaultFormValues  | `object \| (ctx) => object`                                            | -                     | 创建表单默认值                                               |
| onFreeSlotClick    | `(slot) => void`                                                       | -                     | 单击时间轴空白处回调，`slot` 为点击位置所在的 `timeUnit` 时段 |
| onSlotRangeChange  | `(slots: TimeSlot[], info) => void`                                    | -                     | 选中时间变化回调，`slots` 为与选中时间重叠的时段             |
| onCreate           | `(values, ctx) => void \| Promise<void>`                               | -                     | 创建日程提交回调；Promise reject 时保留表单与选中时段         |
| className          | `string`                                                               | -                     | 根节点类名                                                   |
| style              | `React.CSSProperties`                                                  | -                     | 根节点样式                                                   |
| stackAt            | `number`                                                               | `560`                 | 容器宽度 **小于** 该值（px）时左右面板改为上下排列；通过 `ResizeObserver` 监听组件根节点实际宽度 |
| calendarProps      | `object`                                                               | -                     | 透传给 `antd` 的 `Calendar`                                  |
| panelProps         | `object`                                                               | -                     | 透传给右侧面板容器                                           |

##### 回调信息

| 回调              | info/context 结构                                    | 说明                                                 |
| ----------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| onChange          | `{ source: 'date' \| 'today' }`                      | 当前选中日期变化，内部由 `useControlValue` 触发      |
| onDateChange      | `{ source: 'date' \| 'today' }`                      | 与 `onChange` 同步触发，用于更语义化地监听日期变化   |
| onEventClick      | `{ date: Date; mode: 'view' \| 'schedule' }`          | 点击日程项时触发；也可在单条 event 上配置 `onClick`  |
| onCurrentChange   | `{ source: 'prevMonth' \| 'nextMonth' \| 'picker' \| 'today' }` | 浏览年月变化，来源分别为上一月、下一月、年月下拉选择、回到今天 |
| onSlotRangeChange | `{ action: 'select' \| 'clear'; start?: Date; end?: Date }` | 选择、调整或取消选中时间                             |
| onCreate          | `{ date: Date; start: Date; end: Date; slots: TimeSlot[]; conflicts: CalendarEvent[] }` | 创建表单提交时返回当前日期、精确的起止时间、重叠时段与冲突日程 |

##### CSS 变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `--schedule-calendar-side-width` | `50%` | 左右布局时左侧日历宽度，可写 `360px`、`40%` 等；右侧面板自动撑满剩余宽度。上下布局时不生效 |

可通过 `style` / `className` 或任意祖先节点设置，例如 `style={{ '--schedule-calendar-side-width': '360px' }}`。

##### 开放与禁用规则

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

##### 默认表单

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

#### TimeWindow

`TimeWindow` 在一段可选时间范围内滑动固定时长的窗口。顶部展示当前时间段和时长，下方刻度条可通过拖动、点击或悬停滚轮调整起始时间，结束时间随 `duration` 一起移动。`onChange` 在起始时间稳定后触发。

拖动窗口左右边界可调整时长（`resizable`），拖动时刻度尺保持不动，松手后再平滑回到居中。选中窗口固定在刻度条中央，刻度尺像滚动器一样在其下方移动，只渲染 `visibleSpan` 视窗内的刻度；超出 `range` 的部分以斜纹遮罩标出，跨天时在 00:00 处显示日期。滚轮按滚动量累积，每满一个 `step` 移动一格，鼠标滚轮每一格至少移动一个 `step`。

刻度标签的疏密按轨道实际宽度计算，窄容器自动减少标签、宽容器增加副刻度，不依赖视口断点。刻度条获得焦点后支持键盘：方向键按 `step` 移动，`Shift` + 方向键按 1 小时移动，`PageUp` / `PageDown` 按一个窗口时长移动，`Home` / `End` 跳到范围首尾（对应一侧有边界时）。

##### 属性

| 属性 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| value | `[DateLike, DateLike]` | - | 受控时间段，`[start, end]` |
| defaultValue | `[DateLike, DateLike]` | 范围内第一段 | 非受控初始时间段 |
| onChange | `(value: [Date, Date]) => void` | - | 时间段变化回调，默认防抖 300ms |
| duration | `number` | `60` | 窗口时长，单位分钟。有 `value` / `defaultValue` 时以其起止为准；变更该属性会按新时长重设窗口 |
| resizable | `boolean` | `true` | 是否允许拖动窗口左右边界调整时长。可调整时两侧显示拖拽把手、悬停为左右调整光标；`false` 时不显示把手，窗口边框变细 |
| wheelEffect | `boolean` | `true` | 刻度条左右两端的渐变与内阴影，模拟立体滚轮；`false` 时为平面样式 |
| lockable | `boolean` | `false` | 是否显示编辑开关。打开时显示刻度条并可编辑；关闭后隐藏刻度条，时间段锁定 |
| locked | `boolean` | - | 受控锁定状态，需配合 `lockable` |
| defaultLocked | `boolean` | `false` | 非受控时的初始锁定状态 |
| onLockedChange | `(locked: boolean) => void` | - | 锁定状态变化回调 |
| minDuration | `number` | `step` | 拖动边界时的最短时长，单位分钟 |
| maxDuration | `number` | - | 拖动边界时的最长时长，单位分钟；不设则只受 `range` 限制 |
| range | `[DateLike \| null, DateLike \| null] \| null` | 当前值所在日期的 00:00 至次日 00:00，无值时为今天 | 可选边界，窗口整体不会超出该范围。传 `null` 起止都不限制；某一侧为 `null` 时该侧不限制 |
| step | `number` | `1` | 拖动、点击、滚轮与方向键的最小移动单位，单位分钟 |
| visibleSpan | `number` | `max(duration * 6, 360)`，有完整边界时不超过范围长度 | 刻度条可见的时间跨度，单位分钟 |
| debounceWait | `number` | `300` | `onChange` 防抖等待时间，单位毫秒 |
| format | `string \| [string, string] \| (start: Date, end: Date) => ReactNode` | `['YYYY-MM-DD HH:mm', 'HH:mm']` | 顶部文案。字符串时起止使用同一 dayjs 格式；二元组分别格式化；函数返回整段文案 |
| separator | `ReactNode` | 前后带空格的 `～` | 起止文案之间的分隔符。`format` 为函数时不使用 |
| showDuration | `boolean` | `true` | 是否在标题右侧显示时长标签 |
| size | `'large' \| 'default' \| 'small'` | `'default'` | 尺寸，同时调整内边距、标题字号、刻度条高度与刻度文字 |
| inertia | `boolean \| number` | `true` | 快速拖动松手或快速连续滚动鼠标滚轮后的惯性滑行。`true` 为强度 1，数字为强度倍数（越大滑得越远、减速越慢），`false` 或 `0` 关闭。触控板沿用系统自带惯性 |
| locale | `'zh-CN' \| 'en-US' \| string` | `'zh-CN'` | 时长标签语言 |
| className | `string` | - | 根节点类名 |
| style | `CSSProperties` | - | 根节点样式 |

##### 工具函数

| 名称              | 参数                                                                                                    | 返回值                            | 说明                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------- |
| groupEventsByDate | `CalendarEvent[]`                                                                                       | `Record<string, CalendarEvent[]>` | 按 `YYYY-MM-DD` 聚合日程，返回项含规范化后的 `start`/`end` |
| generateTimeSlots | `{ date, events, timeUnit, dayStart, dayEnd, disabledDate, disabledDateTime, availableDateTime, mode }` | `TimeSlot[]`                      | 按天生成时间段，并计算 `free`、`occupied`、`disabled` 状态 |
| normalizeEvent    | `CalendarEvent`                                                                                         | `CalendarEvent`                   | 规范化日程起止时间为 dayjs 对象                            |
| sortEventsByStart | `CalendarEvent[]`                                                                                       | `CalendarEvent[]`                 | 按开始时间升序排列                                         |
| dedupeEventsById  | `CalendarEvent[]`                                                                                       | `CalendarEvent[]`                 | 按 `id` 去重，保留最后一次出现                           |

##### 导出

```js
import ScheduleCalendar, {
  ReactCalendar,
  TimeWindow,
  groupEventsByDate,
  generateTimeSlots,
  normalizeEvent,
  sortEventsByStart,
  dedupeEventsById
} from '@kne/react-calendar';
```

`ReactCalendar` 为 `ScheduleCalendar` 的别名导出。

<!--END_SECTION:DOC_MD-->
