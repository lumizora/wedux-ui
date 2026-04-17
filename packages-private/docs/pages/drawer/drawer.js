Page({
  data: {
    props: [
      { name: 'show', type: 'Boolean', default: 'false', desc: '是否显示' },
      {
        name: 'placement',
        type: 'String',
        default: "'bottom'",
        desc: 'top / bottom / left / right',
      },
      { name: 'width', type: 'String', default: "''", desc: '宽度（left/right 时生效）' },
      { name: 'height', type: 'String', default: "''", desc: '高度（top/bottom 时生效）' },
      { name: 'title', type: 'String', default: "''", desc: '标题' },
      { name: 'closable', type: 'Boolean', default: 'false', desc: '显示关闭按钮' },
      { name: 'showMask', type: 'Boolean', default: 'true', desc: '显示遮罩' },
      { name: 'maskClosable', type: 'Boolean', default: 'true', desc: '点击遮罩关闭' },
      { name: 'round', type: 'Boolean', default: 'false', desc: '圆角' },
      { name: 'zIndex', type: 'Number', default: '1000', desc: '层级' },
    ],
    show1: false,
    show2: false,
    show3: false,
    show4: false,
  },

  onToggle1() {
    this.setData({ show1: true });
  },
  onClose1() {
    this.setData({ show1: false });
  },

  onToggle2() {
    this.setData({ show2: true });
  },
  onClose2() {
    this.setData({ show2: false });
  },

  onToggle3() {
    this.setData({ show3: true });
  },
  onClose3() {
    this.setData({ show3: false });
  },

  onToggle4() {
    this.setData({ show4: true });
  },
  onClose4() {
    this.setData({ show4: false });
  },
});
