Page({
  data: {
    props: [
      {
        name: 'value',
        type: 'Number/Array',
        default: 'null',
        desc: '时间戳（毫秒），range 类型为数组',
      },
      {
        name: 'type',
        type: 'String',
        default: "'date'",
        desc: 'date / datetime / month / year / daterange / datetimerange / monthrange / yearrange / quarter / quarterrange / week',
      },
      { name: 'placeholder', type: 'String', default: "'请选择日期'", desc: '占位文字' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'readonly', type: 'Boolean', default: 'false', desc: '只读' },
      { name: 'size', type: 'String', default: "''", desc: '尺寸覆盖' },
      { name: 'status', type: 'String', default: "''", desc: 'error / warning' },
      { name: 'clearable', type: 'Boolean', default: 'false', desc: '可清除' },
      { name: 'format', type: 'String', default: "''", desc: '自定义显示格式' },
      {
        name: 'weekStartsOn',
        type: 'Number',
        default: '1',
        desc: '周起始日（0=周日，1=周一），仅 week 类型',
      },
    ],
    val1: null,
    val2: null,
    val3: null,
    val4: null,
    val5: null,
    val6: null,
    val7: null,
    val8: null,
    val9: null,
    val10: null,
    val11: null,
    readonlyVal: Date.now(),
    fmtVal1: null,
    fmtVal2: null,
    fmtVal3: null,
    fmtVal4: null,
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
  onChange5(e) {
    this.setData({ val5: e.detail.value });
  },
  onChange6(e) {
    this.setData({ val6: e.detail.value });
  },
  onChange7(e) {
    this.setData({ val7: e.detail.value });
  },
  onChange8(e) {
    this.setData({ val8: e.detail.value });
  },
  onChange9(e) {
    this.setData({ val9: e.detail.value });
  },
  onChange10(e) {
    this.setData({ val10: e.detail.value });
  },
  onChange11(e) {
    this.setData({ val11: e.detail.value });
  },
  onFmt1(e) {
    this.setData({ fmtVal1: e.detail.value });
  },
  onFmt2(e) {
    this.setData({ fmtVal2: e.detail.value });
  },
  onFmt3(e) {
    this.setData({ fmtVal3: e.detail.value });
  },
  onFmt4(e) {
    this.setData({ fmtVal4: e.detail.value });
  },
});
