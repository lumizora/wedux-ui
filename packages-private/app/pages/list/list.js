import { activities, statusConfig } from '../../utils/mock';

Page({
  data: {
    theme: {},
    keyword: '',
    activeFilter: 'all',
    sortBy: 'createdAt',
    filterTabs: [
      { key: 'all', label: '全部' },
      { key: 'active', label: '进行中' },
      { key: 'draft', label: '草稿' },
      { key: 'paused', label: '已暂停' },
      { key: 'ended', label: '已结束' },
    ],
    sortOptions: [
      { key: 'createdAt', label: '最新创建' },
      { key: 'startTime', label: '开始时间' },
      { key: 'participants', label: '参与人数' },
    ],
    list: [],
    totalCount: 0,
    loading: false,
    hasMore: false,
    showSortDrawer: false,
    showBackTop: false,
    contentScrollTop: 0,
  },

  onLoad() {
    this.loadTheme();
    this.loadList();
  },

  onShow() {
    this.loadTheme();
  },

  loadTheme() {
    const app = getApp();
    this.setData({ theme: app.globalData.theme });
  },

  loadList() {
    const { keyword, activeFilter } = this.data;
    let filtered = activities.map((a) => ({
      ...a,
      statusLabel: statusConfig[a.status]?.label || a.status,
      statusType: statusConfig[a.status]?.type || 'default',
      progressRate: a.targetCount > 0 ? Math.round((a.actualCount / a.targetCount) * 100) : 0,
    }));

    if (activeFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === activeFilter);
    }

    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(kw) || a.description.toLowerCase().includes(kw),
      );
    }

    this.setData({ list: filtered, totalCount: filtered.length, hasMore: false });
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value }, () => this.loadList());
  },

  onSearchClear() {
    this.setData({ keyword: '' }, () => this.loadList());
  },

  onFilterChange(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ activeFilter: key }, () => this.loadList());
  },

  onSortTap() {
    this.setData({ showSortDrawer: true });
  },

  onSortDrawerChange(e) {
    this.setData({ showSortDrawer: e.detail.value });
  },

  onSortSelect(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ sortBy: key, showSortDrawer: false }, () => this.loadList());
  },

  onLoadMore() {},

  onContentScroll(e) {
    this.setData({ showBackTop: e.detail.scrollTop > 400 });
  },

  onBackTop() {
    this.setData({ contentScrollTop: 0 });
  },

  onNewActivity() {
    wx.navigateTo({ url: '/pages/form/form' });
  },

  onActivityTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
});
