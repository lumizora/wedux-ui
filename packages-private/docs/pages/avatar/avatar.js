Page({
  data: {
    props: [
      { name: 'size', type: 'String', default: "'medium'", desc: '尺寸：small / medium / large' },
      { name: 'src', type: 'String', default: "''", desc: '图片地址，为空时显示 slot 内容' },
      { name: 'round', type: 'Boolean', default: 'false', desc: '是否显示为圆形' },
      {
        name: 'bordered',
        type: 'Boolean',
        default: 'false',
        desc: '是否显示白色描边，在堆叠时用于区分边界',
      },
      { name: 'color', type: 'String', default: "''", desc: '自定义背景色，覆盖默认 token' },
      { name: 'fallbackSrc', type: 'String', default: "''", desc: '图片加载失败时的降级图片地址' },
    ],
  },
});
