Page({
  data: {
    props: [
      {
        name: 'type',
        type: 'String',
        default: "'default'",
        desc: '类型：default / primary / success / info / warning / error',
      },
      { name: 'size', type: 'String', default: "'medium'", desc: '尺寸：small / medium / large' },
      { name: 'closable', type: 'Boolean', default: 'false', desc: '是否可关闭' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '是否禁用' },
      { name: 'checkable', type: 'Boolean', default: 'false', desc: '是否可选中' },
      { name: 'checked', type: 'Boolean', default: 'false', desc: '是否选中（配合 checkable）' },
      { name: 'round', type: 'Boolean', default: 'false', desc: '是否为圆角标签' },
      { name: 'bordered', type: 'Boolean', default: 'true', desc: '是否显示边框' },
      { name: 'strong', type: 'Boolean', default: 'false', desc: '是否加粗文字' },
      { name: 'color', type: 'String', default: "''", desc: '自定义背景色' },
      { name: 'textColor', type: 'String', default: "''", desc: '自定义文字颜色' },
      { name: 'borderColor', type: 'String', default: "''", desc: '自定义边框颜色' },
    ],
    checkable1: true,
    checkable2: false,
    checkable3: true,
    showTag1: true,
    showTag2: true,
    showTag3: true,
  },

  handleCheck1(e) {
    this.setData({ checkable1: e.detail.checked });
  },

  handleCheck2(e) {
    this.setData({ checkable2: e.detail.checked });
  },

  handleCheck3(e) {
    this.setData({ checkable3: e.detail.checked });
  },

  handleClose1() {
    this.setData({ showTag1: false });
  },

  handleClose2() {
    this.setData({ showTag2: false });
  },

  handleClose3() {
    this.setData({ showTag3: false });
  },

  handleReset() {
    this.setData({ showTag1: true, showTag2: true, showTag3: true });
  },
});
