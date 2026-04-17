Page({
  data: {
    props: [
      { name: 'price', type: 'Number | String', default: '0', desc: '主价格，必填' },
      {
        name: 'original-price',
        type: 'Number | String',
        default: "''",
        desc: '原价，有值则显示划线价',
      },
      { name: 'currency', type: 'String', default: "'¥'", desc: '货币符号' },
      { name: 'decimal', type: 'Number', default: '2', desc: '小数位数，0 表示不显示小数' },
      { name: 'size', type: 'String', default: "'md'", desc: '整体尺寸：sm / md / lg' },
      {
        name: 'color',
        type: 'String',
        default: "''",
        desc: '自定义主价格颜色，覆盖 --w-price-color',
      },
    ],
  },
});
