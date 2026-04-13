Page({
  data: {
    props: [
      {
        name: 'vertical',
        type: 'Boolean',
        default: 'false',
        desc: '纵向排列（flex-direction: column）',
      },
      { name: 'align', type: 'String', default: "''", desc: 'align-items，空则不设置' },
      { name: 'justify', type: 'String', default: "'flex-start'", desc: 'justify-content' },
      {
        name: 'size',
        type: 'String/Number/Array',
        default: "'medium'",
        desc: '间距大小：none / small / medium / large，数字单位 rpx，数组 [row-gap, col-gap]',
      },
      { name: 'wrap', type: 'Boolean', default: 'true', desc: '是否自动换行' },
      { name: 'inline', type: 'Boolean', default: 'false', desc: '使用 inline-flex 布局' },
    ],
  },
});
