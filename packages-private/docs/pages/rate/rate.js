Page({
  data: {
    props: [
      { name: 'value', type: 'Number', default: '0', desc: '当前评分值' },
      { name: 'count', type: 'Number', default: '5', desc: '星星数量' },
      { name: 'allowHalf', type: 'Boolean', default: 'false', desc: '允许半星' },
      { name: 'readonly', type: 'Boolean', default: 'false', desc: '只读' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用' },
      { name: 'clearable', type: 'Boolean', default: 'false', desc: '再次点击可清除' },
      { name: 'size', type: 'String', default: "''", desc: '尺寸 small / medium' },
      { name: 'color', type: 'String', default: "''", desc: '自定义激活颜色' },
    ],
    val1: 3,
    val2: 3.5,
    val3: 4,
    val4: 3,
    val5: 2,
    val6: 3,
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
  onChange6(e) {
    this.setData({ val6: e.detail.value });
  },
});
