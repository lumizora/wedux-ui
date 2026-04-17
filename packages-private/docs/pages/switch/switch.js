Page({
  data: {
    props: [
      { name: 'checked', type: 'Boolean', default: 'false', desc: '是否开启' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'size', type: 'String', default: "''", desc: '覆盖尺寸' },
      { name: 'checkedColor', type: 'String', default: "''", desc: '开启颜色' },
      { name: 'checkedText', type: 'String', default: "''", desc: '开启文字' },
      { name: 'uncheckedText', type: 'String', default: "''", desc: '关闭文字' },
    ],
    val1: false,
    val2: true,
    val3: false,
    val4: true,
  },

  onToggle1(e) {
    this.setData({ val1: e.detail.checked });
  },
  onToggle2(e) {
    this.setData({ val2: e.detail.checked });
  },
  onToggle3(e) {
    this.setData({ val3: e.detail.checked });
  },
  onToggle4(e) {
    this.setData({ val4: e.detail.checked });
  },
});
