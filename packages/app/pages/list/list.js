import { activities, statusConfig } from '../../utils/mock';

const PAGE_SIZE = 3;
const tabs = [
  { key: 'dashboard', label: '首页', icon: 'home' },
  { key: 'list', label: '活动', icon: 'diandan01' },
  { key: 'settings', label: '设置', icon: 'g_my' },
];
const filterTabs = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '进行中' },
  { key: 'ended', label: '已结束' },
  { key: 'draft', label: '草稿' },
  { key: 'paused', label: '已暂停' },
];

Page({
  data: {
    theme: {},
    tabs,
    activeTab: 'list',
    filterTabs,
    activeFilter: 'all',
    list: [],
    page: 1,
    hasMore: true,
    loading: false,
    showSortDrawer: false,
    sortBy: 'createdAt',
    sortOptions: [
      { key: 'createdAt', label: '创建时间' },
      { key: 'startTime', label: '开始时间' },
      { key: 'actualCount', label: '参与人数' },
    ],
    scrollTop: 0,
    showBackTop: false,
  },

  onLoad() {
    this.loadTheme();
    this.loadList(true);
  },

  onShow() {
    this.loadTheme();
  },

  loadTheme() {
    const app = getApp();
    this.setData({ theme: app.globalData.theme });
  },

  loadList(reset = false) {
    if (this.data.loading) return;
    this.setData({ loading: true });

    const { activeFilter, sortBy, page } = this.data;
    const currentPage = reset ? 1 : page;

    // Filter
    const filtered = activities.filter((a) => {
      if (activeFilter === 'all') return true;
      return a.status === activeFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'actualCount') return b.actualCount - a.actualCount;
      return b[sortBy] > a[sortBy] ? 1 : -1;
    });

    // Paginate
    const start = (currentPage - 1) * PAGE_SIZE;
    const chunk = filtered.slice(start, start + PAGE_SIZE);
    const mapped = chunk.map((a) => ({
      ...a,
      statusLabel: statusConfig[a.status]?.label || a.status,
      statusType: statusConfig[a.status]?.type || 'default',
      progressRate: a.targetCount > 0 ? Math.round((a.actualCount / a.targetCount) * 100) : 0,
    }));

    const hasMore = start + PAGE_SIZE < filtered.length;
    const list = reset ? mapped : [...this.data.list, ...mapped];

    this.setData({
      list,
      page: currentPage + 1,
      hasMore,
      loading: false,
    });
  },

  onFilterChange(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ activeFilter: key, page: 1, list: [], hasMore: true });
    this.loadList(true);
  },

  onLoadMore() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadList(false);
  },

  onScroll(e) {
    const { scrollTop } = e.detail;
    this.setData({ showBackTop: scrollTop > 400 });
  },

  onSortTap() {
    this.setData({ showSortDrawer: true });
  },

  onSortClose() {
    this.setData({ showSortDrawer: false });
  },

  onSortSelect(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ sortBy: key, showSortDrawer: false, page: 1, list: [] });
    this.loadList(true);
  },

  onActivityTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  onNewActivity() {
    wx.navigateTo({ url: '/pages/form/form' });
  },

  onTabChange(e) {
    const { key } = e.detail;
    if (key === 'dashboard') {
      wx.redirectTo({ url: '/pages/dashboard/dashboard' });
    } else if (key === 'settings') {
      wx.redirectTo({ url: '/pages/settings/settings' });
    }
  },
});
