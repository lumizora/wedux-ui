import { activities, stats, statusConfig } from '../../utils/mock';

const tabs = [
  { key: 'dashboard', label: '首页', icon: 'home' },
  { key: 'list', label: '活动', icon: 'diandan01' },
  { key: 'settings', label: '设置', icon: 'g_my' },
];

Page({
  data: {
    theme: {},
    tabs,
    activeTab: 'dashboard',
    stats,
    recentActivities: [],
    statusConfig,
    animateStats: false,
  },

  onLoad() {
    this.loadTheme();
    this.loadData();
  },

  onShow() {
    this.loadTheme();
    this.loadData();
  },

  loadTheme() {
    const app = getApp();
    this.setData({ theme: app.globalData.theme });
  },

  loadData() {
    const recent = activities.slice(0, 4).map((a) => ({
      ...a,
      statusLabel: statusConfig[a.status]?.label || a.status,
      statusType: statusConfig[a.status]?.type || 'default',
      progressRate: a.targetCount > 0 ? Math.round((a.actualCount / a.targetCount) * 100) : 0,
    }));
    this.setData({ recentActivities: recent, animateStats: true });
  },

  onTabChange(e) {
    const { key } = e.detail;
    if (key === 'list') {
      wx.redirectTo({ url: '/pages/list/list' });
    } else if (key === 'settings') {
      wx.redirectTo({ url: '/pages/settings/settings' });
    }
  },

  onNewActivity() {
    wx.navigateTo({ url: '/pages/form/form' });
  },

  onViewAll() {
    wx.redirectTo({ url: '/pages/list/list' });
  },

  onActivityTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
});
