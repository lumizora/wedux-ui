Page({
  data: {
    props: [
      { name: 'src', type: 'String', default: "''", desc: '图片地址' },
      { name: 'mode', type: 'String', default: "'aspectFill'", desc: '图片裁剪模式，同原生 image' },
      { name: 'width', type: 'String', default: "''", desc: '宽度，如 200rpx' },
      { name: 'height', type: 'String', default: "''", desc: '高度，如 200rpx' },
      { name: 'radius', type: 'String', default: "''", desc: '圆角，如 12rpx' },
      { name: 'round', type: 'Boolean', default: 'false', desc: '是否显示为圆形' },
      { name: 'showLoading', type: 'Boolean', default: 'true', desc: '是否展示加载中占位' },
      { name: 'showError', type: 'Boolean', default: 'true', desc: '是否展示加载失败占位' },
      { name: 'fade', type: 'Boolean', default: 'true', desc: '加载完成后是否淡入' },
      { name: 'lazyLoad', type: 'Boolean', default: 'false', desc: '是否懒加载' },
      { name: 'fallbackSrc', type: 'String', default: "''", desc: '加载失败时的降级图片地址' },
      {
        name: 'showMenuByLongpress',
        type: 'Boolean',
        default: 'false',
        desc: '长按图片显示识别小程序码、收藏、保存等菜单',
      },
    ],
  },
});
