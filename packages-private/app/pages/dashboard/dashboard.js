import { activities, stats, statusConfig } from '../../utils/mock';

const DAYS = ['日', '一', '二', '三', '四', '五', '六'];

Page({
  data: {
    theme: {},
    stats,
    today: '',
    activeCount: 0,
    noticeCount: 3,
    recentActivities: [],
    animateStats: false,
  },

  onLoad() {
    this.loadTheme();
    this.loadData();
  },

  onShow() {
    this.loadTheme();
  },

  loadTheme() {
    const app = getApp();
    this.setData({ theme: app.globalData.theme });
  },

  loadData() {
    const now = new Date();
    const today = `${now.getMonth() + 1}月${now.getDate()}日 周${DAYS[now.getDay()]}`;
    const activeCount = activities.filter((a) => a.status === 'active').length;
    const recent = activities.slice(0, 4).map((a) => ({
      ...a,
      statusLabel: statusConfig[a.status]?.label || a.status,
      statusType: statusConfig[a.status]?.type || 'default',
      progressRate: a.targetCount > 0 ? Math.round((a.actualCount / a.targetCount) * 100) : 0,
    }));
    this.setData({ today, activeCount, recentActivities: recent, animateStats: true });
  },

  onNewActivity() {
    wx.navigateTo({ url: '/pages/form/form' });
  },

  onViewAll() {
    wx.switchTab({ url: '/pages/list/list' });
  },

  onGoAnalytics() {
    wx.switchTab({ url: '/pages/analytics/analytics' });
  },

  onGoSettings() {
    wx.switchTab({ url: '/pages/settings/settings' });
  },

  onActivityTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
});
