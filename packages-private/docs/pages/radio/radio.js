Page({
  data: {
    groupProps: [
      { name: 'value', type: 'String/Number', default: 'null', desc: '选中值' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'size', type: 'String', default: "''", desc: '覆盖尺寸' },
      { name: 'vertical', type: 'Boolean', default: 'false', desc: '纵向排列' },
    ],
    radioProps: [
      { name: 'value', type: 'String/Number', default: "''", desc: '代表值' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'label', type: 'String', default: "''", desc: '标签文字' },
    ],
    val1: 'apple',
    val2: '',
    val3: 'A',
    radioButtonProps: [
      { name: 'value', type: 'String/Number', default: "''", desc: '代表值' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'label', type: 'String', default: "''", desc: '标签文字' },
    ],
    val4: 'medium',
    val5: 'normal',
    val6: '',
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
});
