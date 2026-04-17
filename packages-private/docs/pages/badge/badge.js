Page({
  data: {
    props: [
      { name: 'value', type: 'Number/String', default: "''", desc: '显示的值' },
      { name: 'max', type: 'Number', default: '0', desc: '最大值，超过显示 max+，0 不限制' },
      { name: 'dot', type: 'Boolean', default: 'false', desc: '是否仅显示小圆点' },
      {
        name: 'type',
        type: 'String',
        default: "'default'",
        desc: '类型：default / primary / success / info / warning / error',
      },
      { name: 'show', type: 'Boolean', default: 'true', desc: '是否显示徽标' },
      { name: 'showZero', type: 'Boolean', default: 'false', desc: '值为 0 时是否显示' },
      { name: 'processing', type: 'Boolean', default: 'false', desc: '是否显示波纹动画' },
      { name: 'color', type: 'String', default: "''", desc: '自定义背景色' },
      { name: 'offsetX', type: 'Number', default: '0', desc: '水平偏移 (rpx)' },
      { name: 'offsetY', type: 'Number', default: '0', desc: '垂直偏移 (rpx)' },
    ],
    badgeShow: true,
    badgeValue: 5,
  },

  handleToggleShow() {
    this.setData({ badgeShow: !this.data.badgeShow });
  },

  handleIncrement() {
    this.setData({ badgeValue: this.data.badgeValue + 1 });
  },

  handleDecrement() {
    this.setData({ badgeValue: Math.max(0, this.data.badgeValue - 1) });
  },
});
