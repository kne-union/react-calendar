### ScheduleCalendar API

`ScheduleCalendar` 是一个左右布局的日程查看和日程安排组件。左侧显示月日历，右侧根据 `mode` 展示日程列表或当天时间段安排面板。

安排状态支持移动端：触屏上轻点空白处选择 `timeUnit` 时长，长按后拖动可选择任意时长，普通滑动仍用于滚动；视口宽度小于 768px 时创建表单改为底部弹出面板。组件根节点是 `@kne/responsive-utils` 的容器查询宿主，组件宽度小于 768px 时时间轴使用更大的拖拽手柄。

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

#### 回调信息

| 回调              | info/context 结构                                    | 说明                                                 |
| ----------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| onChange          | `{ source: 'date' \| 'today' }`                      | 当前选中日期变化，内部由 `useControlValue` 触发      |
| onDateChange      | `{ source: 'date' \| 'today' }`                      | 与 `onChange` 同步触发，用于更语义化地监听日期变化   |
| onEventClick      | `{ date: Date; mode: 'view' \| 'schedule' }`          | 点击日程项时触发；也可在单条 event 上配置 `onClick`  |
| onCurrentChange   | `{ source: 'prevMonth' \| 'nextMonth' \| 'picker' \| 'today' }` | 浏览年月变化，来源分别为上一月、下一月、年月下拉选择、回到今天 |
| onSlotRangeChange | `{ action: 'select' \| 'clear'; start?: Date; end?: Date }` | 选择、调整或取消选中时间                             |
| onCreate          | `{ date: Date; start: Date; end: Date; slots: TimeSlot[]; conflicts: CalendarEvent[] }` | 创建表单提交时返回当前日期、精确的起止时间、重叠时段与冲突日程 |

#### CSS 变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `--schedule-calendar-side-width` | `50%` | 左右布局时左侧日历宽度，可写 `360px`、`40%` 等；右侧面板自动撑满剩余宽度。上下布局时不生效 |

可通过 `style` / `className` 或任意祖先节点设置，例如 `style={{ '--schedule-calendar-side-width': '360px' }}`。

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

### TimeWindow

`TimeWindow` 在一段可选时间范围内滑动固定时长的窗口。顶部展示当前时间段和时长，下方刻度条可通过拖动、点击或悬停滚轮调整起始时间，结束时间随 `duration` 一起移动。`onChange` 在起始时间稳定后触发。

拖动窗口左右边界可调整时长（`resizable`），拖动时刻度尺保持不动，松手后再平滑回到居中。选中窗口固定在刻度条中央，刻度尺像滚动器一样在其下方移动，只渲染 `visibleSpan` 视窗内的刻度；超出 `range` 的部分以斜纹遮罩标出，跨天时在 00:00 处显示日期。滚轮按滚动量累积，每满一个 `step` 移动一格，鼠标滚轮每一格至少移动一个 `step`。

刻度标签的疏密按轨道实际宽度计算，窄容器自动减少标签、宽容器增加副刻度，不依赖视口断点。刻度条获得焦点后支持键盘：方向键按 `step` 移动，`Shift` + 方向键按 1 小时移动，`PageUp` / `PageDown` 按一个窗口时长移动，`Home` / `End` 跳到范围首尾（对应一侧有边界时）。

#### 属性

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
  TimeWindow,
  groupEventsByDate,
  generateTimeSlots,
  normalizeEvent,
  sortEventsByStart,
  dedupeEventsById
} from '@kne/react-calendar';
```

`ReactCalendar` 为 `ScheduleCalendar` 的别名导出。
