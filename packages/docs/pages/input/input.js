Page({
  data: {
    inputProps: [
      { name: 'value', type: 'String', default: "''", desc: '输入值' },
      {
        name: 'type',
        type: 'String',
        default: "'text'",
        desc: 'text / number / digit / idcard / nickname',
      },
      { name: 'password', type: 'Boolean', default: 'false', desc: '密码模式' },
      { name: 'placeholder', type: 'String', default: "''", desc: '占位文字' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'readonly', type: 'Boolean', default: 'false', desc: '只读' },
      { name: 'maxlength', type: 'Number', default: '140', desc: '最大长度，-1 无限' },
      { name: 'clearable', type: 'Boolean', default: 'false', desc: '可清除' },
      { name: 'showWordLimit', type: 'Boolean', default: 'false', desc: '字数统计' },
      { name: 'size', type: 'String', default: "''", desc: '覆盖继承尺寸' },
      { name: 'status', type: 'String', default: "''", desc: 'error / warning' },
      { name: 'round', type: 'Boolean', default: 'false', desc: '圆角' },
    ],
    textareaProps: [
      { name: 'value', type: 'String', default: "''", desc: '值' },
      { name: 'placeholder', type: 'String', default: "''", desc: '占位' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'maxlength', type: 'Number', default: '140', desc: '最大长度' },
      { name: 'showWordLimit', type: 'Boolean', default: 'false', desc: '字数统计' },
      { name: 'autoHeight', type: 'Boolean', default: 'false', desc: '自适应高度' },
      { name: 'rows', type: 'Number', default: '3', desc: '默认行数' },
      { name: 'size', type: 'String', default: "''", desc: '覆盖' },
      { name: 'status', type: 'String', default: "''", desc: 'error / warning' },
    ],
    inputVal: '',
    clearVal: 'Hello',
    pwdVal: '',
    limitVal: '',
    textareaVal: '',
    autoVal: '',
    numberVal: null,
  },

  onInputChange(e) {
    this.setData({ inputVal: e.detail.value });
  },
  onInputNumberChange(e) {
    this.setData({ numberVal: e.detail.value });
  },
  onClearChange(e) {
    this.setData({ clearVal: e.detail.value });
  },
  onPwdChange(e) {
    this.setData({ pwdVal: e.detail.value });
  },
  onLimitChange(e) {
    this.setData({ limitVal: e.detail.value });
  },
  onTextareaChange(e) {
    this.setData({ textareaVal: e.detail.value });
  },
  onAutoChange(e) {
    this.setData({ autoVal: e.detail.value });
  },
});
