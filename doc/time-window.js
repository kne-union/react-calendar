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
  return `${dayjs(value[0]).format('YYYY-MM-DD HH:mm')} ～ ${end.format(end.isSame(value[0], 'day') ? 'HH:mm' : 'MM-DD HH:mm')}`;
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
