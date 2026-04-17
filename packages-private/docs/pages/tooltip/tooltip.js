Page({
  data: {
    props: [
      { name: 'content', type: 'String', default: "''", desc: '提示文本内容' },
      { name: 'show', type: 'Boolean', default: 'false', desc: '是否显示（受控）' },
      { name: 'trigger', type: 'String', default: "'tap'", desc: "触发方式：'tap' | 'manual'" },
      { name: 'placement', type: 'String', default: "'top'", desc: '弹出位置，12 个方向' },
      { name: 'showArrow', type: 'Boolean', default: 'true', desc: '是否显示箭头' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '是否禁用' },
    ],
    showBasic: false,
    showTopStart: false,
    showTop: false,
    showTopEnd: false,
    showBottom: false,
    showBottomStart: false,
    showBottomEnd: false,
    showLeft: false,
    showLeftStart: false,
    showLeftEnd: false,
    showRight: false,
    showRightStart: false,
    showRightEnd: false,
    showNoArrow: false,
    showDisabled: false,
  },

  onToggle(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ [key]: e.detail.show });
  },
});
