Page({
  data: {
    fabProps: [
      { name: 'type', type: 'String', default: "'default'", desc: '类型：default / primary' },
      { name: 'shape', type: 'String', default: "'circle'", desc: '形状：circle / square' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用状态' },
      {
        name: 'position',
        type: 'String',
        default: "'bottom-right'",
        desc: '预设位置：bottom-right / bottom-left / top-right / top-left',
      },
      { name: 'right', type: 'Number', default: '-1', desc: '距右侧距离（rpx），优先于 position' },
      { name: 'bottom', type: 'Number', default: '-1', desc: '距底部距离（rpx），优先于 position' },
      { name: 'left', type: 'Number', default: '-1', desc: '距左侧距离（rpx），优先于 position' },
      { name: 'top', type: 'Number', default: '-1', desc: '距顶部距离（rpx），优先于 position' },
    ],
  },
});
