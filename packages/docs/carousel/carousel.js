Page({
  data: {
    props: [
      { name: 'current', type: 'Number', default: '-1', desc: '当前 index（受控，≥0 时生效）' },
      { name: 'default-current', type: 'Number', default: '0', desc: '初始 index（非受控）' },
      { name: 'effect', type: 'String', default: "'slide'", desc: 'slide / fade / card' },
      { name: 'direction', type: 'String', default: "'horizontal'", desc: 'horizontal / vertical' },
      { name: 'loop', type: 'Boolean', default: 'true', desc: '是否循环' },
      { name: 'autoplay', type: 'Boolean', default: 'false', desc: '自动播放' },
      { name: 'interval', type: 'Number', default: '5000', desc: '自动播放间隔 ms' },
      { name: 'duration', type: 'Number', default: '300', desc: '切换动画时长 ms' },
      { name: 'slides-per-view', type: 'Number', default: '1', desc: '每屏可见数' },
      { name: 'space-between', type: 'Number', default: '0', desc: 'slide 间距 px' },
      { name: 'show-dots', type: 'Boolean', default: 'true', desc: '显示指示点' },
      { name: 'dot-type', type: 'String', default: "'dot'", desc: 'dot / line' },
      {
        name: 'dot-placement',
        type: 'String',
        default: "'bottom'",
        desc: 'top / bottom / left / right',
      },
    ],
  },

  goPrev() {
    this.selectComponent('#controlled').prev();
  },

  goNext() {
    this.selectComponent('#controlled').next();
  },

  goSecond() {
    this.selectComponent('#controlled').to(1);
  },
});
