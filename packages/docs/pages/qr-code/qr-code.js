Page({
  data: {
    props: [
      { name: 'value', type: 'String', default: "''", desc: '要编码的文本内容' },
      { name: 'size', type: 'Number', default: '160', desc: '二维码尺寸（px）' },
      { name: 'color', type: 'String', default: "'#000000'", desc: '前景色' },
      { name: 'backgroundColor', type: 'String', default: "'#FFFFFF'", desc: '背景色' },
      {
        name: 'errorCorrectionLevel',
        type: 'String',
        default: "'M'",
        desc: '纠错等级 L / M / Q / H',
      },
      { name: 'padding', type: 'Number', default: '12', desc: '内边距（px）' },
      { name: 'iconSrc', type: 'String', default: "''", desc: '中心图标地址' },
      { name: 'iconSize', type: 'Number', default: '40', desc: '图标尺寸（px）' },
      { name: 'iconBackgroundColor', type: 'String', default: "'#FFFFFF'", desc: '图标背景色' },
      { name: 'iconBorderRadius', type: 'Number', default: '4', desc: '图标背景圆角（px）' },
    ],
  },
});
