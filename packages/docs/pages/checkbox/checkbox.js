Page({
  data: {
    groupProps: [
      { name: 'value', type: 'Array', default: '[]', desc: '选中值数组' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'size', type: 'String', default: "''", desc: '覆盖尺寸' },
      { name: 'vertical', type: 'Boolean', default: 'false', desc: '纵向排列' },
      { name: 'max', type: 'Number', default: '0', desc: '最大选择数，0 无限' },
    ],
    checkboxProps: [
      { name: 'value', type: 'String/Number', default: "''", desc: '代表值' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'label', type: 'String', default: "''", desc: '标签' },
      { name: 'indeterminate', type: 'Boolean', default: 'false', desc: '不确定状态' },
    ],
    val1: ['apple'],
    val2: [],
    val3: ['A'],
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
});
