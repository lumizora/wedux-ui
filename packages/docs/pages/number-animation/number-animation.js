Page({
  data: {
    props: [
      { name: 'from', type: 'Number', default: '0', desc: '起始值' },
      { name: 'to', type: 'Number', default: '0', desc: '目标值' },
      { name: 'duration', type: 'Number', default: '2000', desc: '动画时长（ms）' },
      { name: 'precision', type: 'Number', default: '0', desc: '小数位数' },
      { name: 'showSeparator', type: 'Boolean', default: 'false', desc: '显示千分位逗号' },
      { name: 'active', type: 'Boolean', default: 'true', desc: '是否自动播放' },
      { name: 'color', type: 'String', default: "''", desc: '数字颜色' },
      { name: 'fontSize', type: 'String', default: "''", desc: '字体大小（如 48rpx）' },
    ],
    manualTo: 0,
  },

  onReplay() {
    this.selectComponent('#demo').play();
  },

  onRandomValue() {
    this.setData({ manualTo: Math.floor(Math.random() * 100000) });
  },
});
