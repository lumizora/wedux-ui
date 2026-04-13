Page({
  data: {
    props: [
      { name: 'active', type: 'String', default: "''", desc: '当前选中项的 key' },
      {
        name: 'items',
        type: 'Array',
        default: '[]',
        desc: 'tab 配置数组，每项 { key, label, icon?, url? }',
      },
      { name: 'activeColor', type: 'String', default: "''", desc: '选中圆形背景色' },
      { name: 'color', type: 'String', default: "''", desc: '未选中图标/文字颜色' },
    ],
    activeTab: 'home',
    tabs: [
      { key: 'home', label: '首页', icon: 'home' },
      { key: 'order', label: '点单', icon: 'diandan01' },
      { key: 'user', label: '我的', icon: 'g_my' },
    ],
  },

  onTabChange(e) {
    this.setData({ activeTab: e.detail.key });
  },
});
