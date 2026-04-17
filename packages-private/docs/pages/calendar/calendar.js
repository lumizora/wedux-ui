Page({
  data: {
    props: [
      { name: 'value', type: 'Number', default: 'null', desc: '选中日期时间戳（ms）' },
      { name: 'default-value', type: 'Number', default: 'null', desc: '默认选中日期时间戳' },
      { name: 'week-starts-on', type: 'Number', default: '1', desc: '周起始日（0=周日, 1=周一）' },
      { name: 'min-date', type: 'Number', default: 'null', desc: '可选范围最小日期时间戳' },
      { name: 'max-date', type: 'Number', default: 'null', desc: '可选范围最大日期时间戳' },
      { name: 'marks', type: 'Array', default: '[]', desc: '日期标记数组 {date, color?, text?}' },
    ],
    val1: null,
    val2: null,
    minDate: null,
    maxDate: null,
    marks: [],
  },

  onLoad() {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();

    // Default value: today
    const todayTs = new Date(y, m, d).getTime();
    this.setData({ val2: todayTs });

    // Min/Max: current month range
    const minDate = new Date(y, m, 1).getTime();
    const maxDate = new Date(y, m + 1, 0).getTime();
    this.setData({ minDate, maxDate });

    // Marks: a few dates in current month
    const marks = [
      { date: new Date(y, m, 5).getTime(), text: '休' },
      { date: new Date(y, m, 12).getTime(), text: '班' },
      { date: new Date(y, m, 18).getTime(), color: '#fa5151' },
      { date: new Date(y, m, 25).getTime(), color: '#10aeff' },
    ];
    this.setData({ marks });
  },

  onChange1(e) {
    this.setData({ val1: e.detail.value });
  },

  onChange2(e) {
    this.setData({ val2: e.detail.value });
  },

  onPanelChange(e) {
    console.log('panel-change', e.detail);
  },
});
