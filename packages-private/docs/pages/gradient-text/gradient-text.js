Page({
  data: {
    props: [
      {
        name: 'type',
        type: 'String',
        default: "'primary'",
        desc: '语义类型：primary / info / success / warning / error',
      },
      { name: 'size', type: 'String', default: "''", desc: '字号：sm / md / lg / xl 或自定义值' },
      {
        name: 'gradient',
        type: 'String',
        default: "''",
        desc: '自定义 CSS 渐变，如 linear-gradient(90deg, red, blue)',
      },
    ],
  },
});
