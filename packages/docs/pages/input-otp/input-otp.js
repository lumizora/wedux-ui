Page({
  data: {
    props: [
      { name: 'value', type: 'String', default: "''", desc: '值' },
      { name: 'length', type: 'Number', default: '6', desc: '验证码位数' },
      { name: 'mask', type: 'Boolean', default: 'false', desc: '掩码显示' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'readonly', type: 'Boolean', default: 'false', desc: '只读' },
      { name: 'size', type: 'String', default: "'medium'", desc: 'small / medium / large' },
      { name: 'status', type: 'String', default: "''", desc: 'error / warning' },
      { name: 'gap', type: 'Number', default: '0', desc: '自定义间距 (rpx)' },
      { name: 'placeholder', type: 'String', default: "''", desc: '未聚焦时占位符' },
      { name: 'type', type: 'String', default: "'number'", desc: '键盘类型 number / text / digit' },
    ],
    basicVal: '',
    textVal: '',
    maskVal: '',
    fourVal: '',
    finishResult: '',
  },

  onBasicChange(e) {
    this.setData({ basicVal: e.detail.value });
  },

  onTextChange(e) {
    this.setData({ textVal: e.detail.value });
  },

  onMaskChange(e) {
    this.setData({ maskVal: e.detail.value });
  },

  onFourChange(e) {
    this.setData({ fourVal: e.detail.value });
  },

  onFinish(e) {
    this.setData({ finishResult: `验证码: ${e.detail.value}` });
  },
});
