Page({
  data: {
    props: [
      { name: 'title', type: 'String', default: "''", desc: '导航栏标题' },
      {
        name: 'back',
        type: 'Boolean',
        default: 'true',
        desc: '是否显示返回按钮（页面栈 > 1 时才显示）',
      },
      { name: 'useBackSlot', type: 'Boolean', default: 'false', desc: '是否使用返回区域插槽' },
      { name: 'useTitleSlot', type: 'Boolean', default: 'false', desc: '是否使用标题区域插槽' },
      {
        name: 'useContentSlot',
        type: 'Boolean',
        default: 'false',
        desc: '是否使用自定义内容插槽（占据胶囊左侧全部空间）',
      },
      {
        name: 'preventBack',
        type: 'Boolean',
        default: 'false',
        desc: '阻止内部自动导航，仅触发 back 事件',
      },
    ],
    val: '',
  },

  onInputChange(e) {
    this.setData({ val: e.detail.value });
  },

  onCustomBack() {
    wx.showModal({
      title: '确认返回',
      content: '你确定要离开当前页面吗？',
      success(res) {
        if (res.confirm) wx.navigateBack();
      },
    });
  },
});
