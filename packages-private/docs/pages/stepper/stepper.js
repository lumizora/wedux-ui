Page({
  data: {
    props: [
      { name: 'value', type: 'Number', default: '0', desc: '当前值' },
      { name: 'min', type: 'Number', default: '0', desc: '最小值' },
      { name: 'max', type: 'Number', default: 'Infinity', desc: '最大值' },
      { name: 'step', type: 'Number', default: '1', desc: '步长' },
      { name: 'size', type: 'String', default: "''", desc: '尺寸 small / medium' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'decimalLength', type: 'Number', default: '0', desc: '小数位数' },
    ],
    val1: 0,
    val2: 3,
    val3: 1.0,
    val4: 0,
    val5: 0,
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
  onOverlimit(e) {
    wx.showToast({ title: `已达${e.detail.type === 'minus' ? '最小' : '最大'}值`, icon: 'none' });
  },
});
