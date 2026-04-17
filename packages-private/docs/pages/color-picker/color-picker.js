Page({
  data: {
    props: [
      { name: 'value', type: 'String', default: "''", desc: '颜色值，如 "#07C160"' },
      { name: 'placeholder', type: 'String', default: "'请选择颜色'", desc: '占位文字' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'readonly', type: 'Boolean', default: 'false', desc: '只读' },
      { name: 'size', type: 'String', default: "''", desc: 'medium / small' },
      { name: 'status', type: 'String', default: "''", desc: 'error / warning' },
      { name: 'clearable', type: 'Boolean', default: 'false', desc: '可清除' },
      { name: 'showAlpha', type: 'Boolean', default: 'false', desc: '显示透明度' },
      { name: 'modes', type: 'Array', default: "['hex','rgb','hsl','hsv']", desc: '输入模式' },
      { name: 'swatches', type: 'Array', default: 'null', desc: '预设色板' },
    ],
    val1: '',
    val2: '#07C160',
    val3: '#00000085',
    val4: '',
    val5: '',
    swatches: [
      '#FF0000',
      '#FF7F00',
      '#FFFF00',
      '#00FF00',
      '#00FFFF',
      '#0000FF',
      '#8B00FF',
      '#FF00FF',
      '#000000',
      '#333333',
      '#666666',
      '#999999',
      '#CCCCCC',
      '#FFFFFF',
      '#07C160',
      '#10AEFF',
    ],
  },

  onChange1(e) {
    this.setData({ val1: e.detail.value });
  },
  onChange2(e) {
    this.setData({ val2: e.detail.value });
  },
  onChange3(e) {
    this.setData({ val3: e.detail.value });
  },
  onChange4(e) {
    this.setData({ val4: e.detail.value });
  },
  onChange5(e) {
    this.setData({ val5: e.detail.value });
  },
});
