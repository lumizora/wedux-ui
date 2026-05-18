import { analyticsData } from '../../utils/mock';

const TYPE_COLORS = ['#07c160', '#1677ff', '#ff9500', '#ff4d4f', '#722ed1'];

Page({
  data: {
    theme: {},
    activeTab: 'overview',
    tabs: [
      { key: 'overview', label: '概览' },
      { key: 'trend', label: '趋势' },
      { key: 'ranking', label: '排行' },
    ],
    announcement: '',
    kpi: {},
    typeDistribution: [],
    monthlyTrend: [],
    ranking: [],
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
    const d = analyticsData;

    const maxCount = Math.max(...d.monthlyTrend.map((m) => m.count));
    const monthlyTrend = d.monthlyTrend.map((m) => ({
      ...m,
      heightPct: maxCount > 0 ? Math.round((m.count / maxCount) * 100) : 0,
    }));

    const totalDist = d.typeDistribution.reduce((s, t) => s + t.count, 0);
    const typeDistribution = d.typeDistribution.map((t, i) => ({
      ...t,
      pct: totalDist > 0 ? Math.round((t.count / totalDist) * 100) : 0,
      color: TYPE_COLORS[i % TYPE_COLORS.length],
    }));

    const maxRankCount = Math.max(...d.ranking.map((r) => r.actualCount));
    const ranking = d.ranking.map((r) => ({
      ...r,
      pct: maxRankCount > 0 ? Math.round((r.actualCount / maxRankCount) * 100) : 0,
    }));

    this.setData({
      announcement: d.announcements,
      kpi: {
        monthRevenue: d.monthRevenue,
        revenueGrowth: d.revenueGrowth,
        conversionRate: d.conversionRate,
        totalParticipants: d.totalParticipants,
        newParticipants: d.newParticipants,
      },
      typeDistribution,
      monthlyTrend,
      ranking,
    });
  },

  onTabChange(e) {
    this.setData({ activeTab: e.detail.key });
  },
});
