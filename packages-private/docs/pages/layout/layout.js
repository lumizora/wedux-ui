Page({
  data: {
    activeCategory: 0,
    categories: [
      { id: 0, name: '推荐' },
      { id: 1, name: '咖啡' },
      { id: 2, name: '茶饮' },
      { id: 3, name: '轻食' },
      { id: 4, name: '甜品' },
      { id: 5, name: '周边' },
    ],
    layoutProps: [
      {
        name: 'has-sider',
        type: 'Boolean',
        default: 'false',
        desc: '是否包含 Sider，为 true 时切换为水平布局',
      },
    ],
    headerProps: [
      { name: 'position', type: 'String', default: "'fixed'", desc: '定位模式：fixed / static' },
      { name: 'bordered', type: 'Boolean', default: 'false', desc: '是否显示底部边框线' },
      { name: 'safe-area', type: 'Boolean', default: 'false', desc: '是否自动添加顶部安全区' },
    ],
    contentProps: [
      { name: 'scroll-y', type: 'Boolean', default: 'true', desc: '是否允许纵向滚动' },
      { name: 'scroll-x', type: 'Boolean', default: 'false', desc: '是否允许横向滚动' },
      { name: 'scroll-top', type: 'Number', default: '-', desc: '设置纵向滚动位置' },
      { name: 'scroll-into-view', type: 'String', default: '-', desc: '滚动到指定子元素' },
      {
        name: 'scroll-with-animation',
        type: 'Boolean',
        default: 'false',
        desc: '设置滚动位置时是否使用动画',
      },
    ],
    footerProps: [
      { name: 'position', type: 'String', default: "'fixed'", desc: '定位模式：fixed / static' },
      { name: 'bordered', type: 'Boolean', default: 'false', desc: '是否显示顶部边框线' },
      { name: 'safe-area', type: 'Boolean', default: 'true', desc: '是否自动添加底部安全区' },
    ],
    siderProps: [
      { name: 'width', type: 'Number', default: '160', desc: '宽度（rpx）' },
      { name: 'bordered', type: 'Boolean', default: 'false', desc: '是否显示右侧边框线' },
      { name: 'scroll-y', type: 'Boolean', default: 'true', desc: '是否允许纵向滚动' },
    ],
  },

  onCategoryTap(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.id });
  },
});
