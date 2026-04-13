Page({
  data: {
    props: [
      {
        name: 'size',
        type: 'String',
        default: "''",
        desc: '统一覆盖子按钮尺寸（default / medium / small），空则各自保留',
      },
      { name: 'vertical', type: 'Boolean', default: 'false', desc: '纵向排列' },
    ],
  },
});
