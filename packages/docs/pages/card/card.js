Page({
  data: {
    props: [
      { name: 'title', type: 'String', default: "''", desc: '卡片标题，设置后显示头部区域' },
      { name: 'bordered', type: 'Boolean', default: 'true', desc: '是否显示边框' },
      { name: 'hoverable', type: 'Boolean', default: 'false', desc: '是否在按下时显示阴影效果' },
      {
        name: 'size',
        type: 'String',
        default: "'medium'",
        desc: '内距尺寸：small / medium / large',
      },
      { name: 'segmented', type: 'Boolean', default: 'false', desc: '是否在各区块之间显示分隔线' },
      { name: 'bind:tap', type: 'Event', default: '—', desc: '点击卡片时触发' },
    ],
  },

  onCardTap() {
    wx.showToast({ title: '卡片被点击', icon: 'none' });
  },
});
