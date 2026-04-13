Page({
  data: {
    props: [
      { name: 'text', type: 'String', default: "''", desc: '需要高亮的文本' },
      { name: 'patterns', type: 'Array', default: '[]', desc: '高亮关键词数组' },
      { name: 'caseSensitive', type: 'Boolean', default: 'false', desc: '是否区分大小写' },
      { name: 'autoEscape', type: 'Boolean', default: 'true', desc: '是否自动转义正则特殊字符' },
      { name: 'highlightClass', type: 'String', default: "''", desc: '高亮部分自定义类名' },
      { name: 'highlightStyle', type: 'String', default: "''", desc: '高亮部分自定义样式' },
    ],
    basicText: 'The quick brown fox jumps over the lazy dog.',
    basicPatterns: ['quick', 'fox', 'dog'],
    caseText: 'Vue and vue are both popular. VUE is great!',
    caseSensitivePatterns: ['Vue'],
    multiText: '微信小程序组件库，基于 WeUI 设计规范，支持主题切换和深色模式。',
    multiPatterns: ['组件库', '主题切换', '深色模式'],
    customText: 'Highlight supports custom styles for matched keywords.',
    customPatterns: ['custom', 'keywords'],
  },
});
