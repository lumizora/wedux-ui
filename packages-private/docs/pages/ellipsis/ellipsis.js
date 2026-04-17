Page({
  data: {
    props: [
      { name: 'lineClamp', type: 'Number', default: '1', desc: '最大显示行数，1 为单行省略' },
      {
        name: 'expandTrigger',
        type: 'String',
        default: "''",
        desc: "展开触发方式，设为 'click' 可点击展开/收起",
      },
    ],
  },
});
