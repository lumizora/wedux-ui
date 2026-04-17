Page({
  data: {
    inputText: '这是一个输入文本',
    props: [
      {
        name: 'type',
        type: 'String',
        default: "'default'",
        desc: '按钮类型：default / tertiary / primary / success / info / warning / error',
      },
      { name: 'size', type: 'String', default: "'medium'", desc: '尺寸：default / medium / small' },
      { name: 'strong', type: 'Boolean', default: 'false', desc: '加粗文字（font-weight: 600）' },
      {
        name: 'secondary',
        type: 'Boolean',
        default: 'false',
        desc: '次要样式：浅色背景 + 类型色文字',
      },
      {
        name: 'tertiary',
        type: 'Boolean',
        default: 'false',
        desc: '次次要样式（更轻量）：极浅背景 + 类型色文字，可叠加任意 type',
      },
      {
        name: 'ghost',
        type: 'Boolean',
        default: 'false',
        desc: '幽灵样式：透明背景 + 实线类型色边框',
      },
      { name: 'dashed', type: 'Boolean', default: 'false', desc: '虚线边框样式' },
      { name: 'quaternary', type: 'Boolean', default: 'false', desc: '次次次要按钮：无背景无边框' },
      {
        name: 'round',
        type: 'Boolean',
        default: 'false',
        desc: '胶囊形圆角（border-radius: 9999rpx）',
      },
      { name: 'circle', type: 'Boolean', default: 'false', desc: '圆形按钮，宽高相等' },
      { name: 'block', type: 'Boolean', default: 'false', desc: '块级按钮，宽度撑满父容器' },
      { name: 'disabled', type: 'Boolean', default: 'false', desc: '禁用状态，禁止点击和事件' },
      { name: 'loading', type: 'Boolean', default: 'false', desc: '加载中状态，显示 loading 图标' },
      {
        name: 'text',
        type: 'Boolean',
        default: 'false',
        desc: '纯文字模式：无背景、无边框、无高度、无内距，视觉等同内联文字',
      },
      { name: 'color', type: 'String', default: "''", desc: '自定义背景色与边框色' },
      { name: 'textColor', type: 'String', default: "''", desc: '自定义文字颜色' },
      {
        name: 'openType',
        type: 'String',
        default: "''",
        desc: '开放能力：contact / share / getPhoneNumber / getRealtimePhoneNumber / getUserInfo / launchApp / openSetting / feedback / chooseAvatar / agreePrivacyAuthorization / liveActivity',
      },
      {
        name: 'formType',
        type: 'String',
        default: "''",
        desc: '用于 form 组件：submit（提交表单）/ reset（重置表单）/ submitToGroup（转发文本到聊天）',
      },
    ],
  },
  getPhoneNumber(e) {
    wx.showModal({ title: 'getPhoneNumber', content: JSON.stringify(e.detail), showCancel: false });
  },
  chooseAvatar(e) {
    wx.showModal({ title: 'chooseAvatar', content: JSON.stringify(e.detail), showCancel: false });
  },
  getUserInfo(e) {
    wx.showModal({ title: 'getUserInfo', content: JSON.stringify(e.detail), showCancel: false });
  },
  getRealtimePhoneNumber(e) {
    wx.showModal({
      title: 'getRealtimePhoneNumber',
      content: JSON.stringify(e.detail),
      showCancel: false,
    });
  },
  handleContact(e) {
    wx.showModal({ title: 'contact', content: JSON.stringify(e.detail), showCancel: false });
  },
  handleLaunchAppError(e) {
    wx.showModal({
      title: 'launchApp Error',
      content: JSON.stringify(e.detail),
      showCancel: false,
    });
  },
  handleOpenSetting(e) {
    wx.showModal({ title: 'openSetting', content: JSON.stringify(e.detail), showCancel: false });
  },
  handleAgreePrivacy(e) {
    wx.showModal({
      title: 'agreePrivacyAuthorization',
      content: JSON.stringify(e.detail),
      showCancel: false,
    });
  },
  handleLiveActivityCreate(e) {
    wx.showModal({
      title: 'liveActivity create',
      content: JSON.stringify(e.detail),
      showCancel: false,
    });
  },
  handleFormSubmit(e) {
    wx.showModal({
      title: 'form submit',
      content: JSON.stringify(e.detail.value),
      showCancel: false,
    });
  },
  handleFormReset(e) {
    wx.showModal({ title: 'form reset', content: JSON.stringify(e.detail), showCancel: false });
  },
  handleFormSubmitToGroup(e) {
    wx.showModal({
      title: 'form submitToGroup',
      content: JSON.stringify(e.detail),
      showCancel: false,
    });
  },
});
