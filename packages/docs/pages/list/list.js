Page({
  data: {
    props: [
      { name: 'bordered', type: 'Boolean', default: 'false', desc: '是否显示边框' },
      { name: 'showDivider', type: 'Boolean', default: 'true', desc: '是否显示分割线' },
      {
        name: 'size',
        type: 'String',
        default: "'medium'",
        desc: "尺寸，可选 'small' | 'medium' | 'large'",
      },
    ],
    itemProps: [],
  },
});
