Page({
  data: {
    props: [
      { name: 'text', type: 'String', default: "''", desc: '滚动文本内容' },
      { name: 'speed', type: 'Number', default: '48', desc: '滚动速度（rpx/s）' },
      { name: 'autoFill', type: 'Boolean', default: 'false', desc: '重复内容填满容器宽度' },
      { name: 'pauseOnTap', type: 'Boolean', default: 'false', desc: '点击暂停/恢复动画' },
    ],
  },
});
