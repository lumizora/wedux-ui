Page({
  data: {
    props: [
      { name: 'value', type: 'String', default: "''", desc: '时间值，如 "14:30:00"' },
      { name: 'placeholder', type: 'String', default: "'请选择时间'", desc: '占位文字' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'readonly', type: 'Boolean', default: 'false', desc: '只读' },
      { name: 'size', type: 'String', default: "''", desc: '尺寸覆盖' },
      { name: 'status', type: 'String', default: "''", desc: 'error / warning' },
      { name: 'clearable', type: 'Boolean', default: 'false', desc: '可清除' },
      { name: 'format', type: 'String', default: "'HH:mm:ss'", desc: '格式，HH:mm 隐藏秒列' },
      { name: 'hourStep', type: 'Number', default: '1', desc: '小时步进' },
      { name: 'minuteStep', type: 'Number', default: '1', desc: '分钟步进' },
      { name: 'secondStep', type: 'Number', default: '1', desc: '秒步进' },
    ],
    val1: '',
    val2: '09:30',
    val3: '',
    val4: '',
  },

  onChange1(e) {
    this.setData({ val1: e.detail.value });
  },
  onChange2(e) {
    this.setData({ val2: e.detail.value });
  },
  onChange3(e) {
    this.setData({ val3: e.detail.value });
  },
  onChange4(e) {
    this.setData({ val4: e.detail.value });
  },
});
