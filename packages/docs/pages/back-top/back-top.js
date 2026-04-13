Page({
  data: {
    scrollTop: 0,
    props: [
      {
        name: 'scrollTop',
        type: 'Number',
        default: '0',
        desc: '当前滚动位置，由页面 onPageScroll 传入',
      },
      {
        name: 'visibilityHeight',
        type: 'Number',
        default: '180',
        desc: '滚动超过此高度时显示（px）',
      },
      { name: 'right', type: 'Number', default: '48', desc: '距右侧距离（rpx）' },
      { name: 'bottom', type: 'Number', default: '96', desc: '距底部距离（rpx）' },
      { name: 'duration', type: 'Number', default: '300', desc: '回到顶部滚动动画时长（ms）' },
    ],
  },

  onPageScroll({ scrollTop }) {
    this.setData({ scrollTop });
  },
});
