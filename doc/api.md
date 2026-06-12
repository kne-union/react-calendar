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
