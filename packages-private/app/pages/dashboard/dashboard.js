import { activities, stats, statusConfig } from '../../utils/mock';

Page({
  data: {
    theme: {},
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

  onNewActivity() {
    wx.navigateTo({ url: '/pages/form/form' });
  },

  onViewAll() {
    wx.switchTab({ url: '/pages/list/list' });
  },

  onActivityTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
});
