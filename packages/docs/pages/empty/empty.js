Page({
  data: {
    props: [
      { name: 'title', type: 'String', default: "'暂无数据'", desc: '标题文字' },
      { name: 'description', type: 'String', default: "''", desc: '描述文字，为空时不渲染' },
      {
        name: 'size',
        type: 'String',
        default: "'medium'",
        desc: '整体尺寸：small / medium / large',
      },
    ],
  },

  handleRetry() {
    wx.showToast({ title: '重新加载', icon: 'none' });
  },
});
