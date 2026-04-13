Page({
  data: {
    props: [
      { name: 'vertical', type: 'Boolean', default: 'false', desc: '是否为垂直分割线' },
      { name: 'dashed', type: 'Boolean', default: 'false', desc: '是否为虚线' },
      { name: 'title', type: 'String', default: "''", desc: '分割线标题文字' },
      {
        name: 'titlePlacement',
        type: 'String',
        default: "'center'",
        desc: '标题位置：left / center / right',
      },
      {
        name: 'customTitle',
        type: 'Boolean',
        default: 'false',
        desc: '使用默认插槽作为标题时需设为 true',
      },
    ],
  },
});
