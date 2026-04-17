Page({
  data: {
    props: [
      { name: 'value', type: 'Any / Array', default: 'null', desc: '选中值，多选时为数组' },
      { name: 'options', type: 'Array', default: '[]', desc: '[{label, value}]' },
      { name: 'multiple', type: 'Boolean', default: 'false', desc: '多选模式' },
      { name: 'maxCount', type: 'Number', default: '0', desc: '最大可选数，0=不限' },
      { name: 'clearable', type: 'Boolean', default: 'false', desc: '是否可清除' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'readonly', type: 'Boolean', default: 'false', desc: '只读' },
      { name: 'placeholder', type: 'String', default: "'请选择'", desc: '占位文字' },
      { name: 'size', type: 'String', default: "''", desc: '尺寸覆盖' },
      { name: 'status', type: 'String', default: "''", desc: 'error / warning' },
      { name: 'title', type: 'String', default: "''", desc: '面板标题' },
    ],

    cityOptions: [
      { label: '北京', value: 'beijing' },
      { label: '上海', value: 'shanghai' },
      { label: '广州', value: 'guangzhou' },
      { label: '深圳', value: 'shenzhen' },
      { label: '杭州', value: 'hangzhou' },
    ],
    val1: '',

    langOptions: [
      { label: 'JavaScript', value: 'js' },
      { label: 'TypeScript', value: 'ts' },
      { label: 'Python', value: 'python' },
      { label: 'Go', value: 'go' },
      { label: 'Rust', value: 'rust' },
      { label: 'Java', value: 'java' },
      { label: 'C++', value: 'cpp' },
      { label: 'Swift', value: 'swift' },
      { label: 'Kotlin', value: 'kotlin' },
      { label: 'Ruby', value: 'ruby' },
    ],
    val2: '',

    // Multiple
    multiVal1: [],
    multiVal2: [],
  },

  onChange1(e) {
    this.setData({ val1: e.detail.value });
  },
  onChange2(e) {
    this.setData({ val2: e.detail.value });
  },
  onMultiChange1(e) {
    this.setData({ multiVal1: e.detail.value });
  },
  onMultiChange2(e) {
    this.setData({ multiVal2: e.detail.value });
  },
});
