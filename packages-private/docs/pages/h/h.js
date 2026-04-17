Page({
  data: {
    props: [
      { name: 'level', type: 'Number', default: '1', desc: '标题级别：1 / 2 / 3 / 4 / 5 / 6' },
      {
        name: 'type',
        type: 'String',
        default: "'default'",
        desc: '语义类型：default / primary / info / success / warning / error',
      },
      { name: 'prefix', type: 'Boolean', default: 'false', desc: '是否显示左侧装饰条' },
      {
        name: 'alignText',
        type: 'Boolean',
        default: 'false',
        desc: '装饰条不占用文字空间（需配合 prefix）',
      },
    ],
  },
});
