import { getActivityById, statusConfig } from '../../utils/mock';

const MOCK_AVATARS = [
  'https://picsum.photos/seed/u1/100/100',
  'https://picsum.photos/seed/u2/100/100',
  'https://picsum.photos/seed/u3/100/100',
  'https://picsum.photos/seed/u4/100/100',
  'https://picsum.photos/seed/u5/100/100',
];

Page({
  data: {
    theme: {},
    activity: null,
    participants: [],
  },

  onLoad(options) {
    this.loadTheme();
    this.loadActivity(options.id);
  },

  onShow() {
    this.loadTheme();
  },

  loadTheme() {
    const app = getApp();
    this.setData({ theme: app.globalData.theme });
  },

  loadActivity(id) {
    const raw = getActivityById(id);
    if (!raw) return;

    const statusInfo = statusConfig[raw.status] || {};
    const progressRate =
      raw.targetCount > 0 ? Math.round((raw.actualCount / raw.targetCount) * 100) : 0;

    const activity = {
      ...raw,
      statusLabel: statusInfo.label || raw.status,
      statusType: statusInfo.type || 'default',
      progressRate,
      canEdit: raw.status === 'draft' || raw.status === 'paused',
      canPublish: raw.status === 'draft',
      canPause: raw.status === 'active',
      canResume: raw.status === 'paused',
    };

    const count = Math.min(raw.actualCount, 5);
    const participants = MOCK_AVATARS.slice(0, count).map((avatar, i) => ({ id: i, avatar }));

    this.setData({ activity, participants });
  },

  onBack() {
    wx.navigateBack();
  },

  onPopoverSelect(e) {
    const { key } = e.detail;
    if (key === 'edit') this.onEdit();
    if (key === 'delete') {
      wx.showModal({
        title: '确认删除',
        content: '删除后无法恢复，确定要删除该活动吗？',
        confirmColor: '#fa5151',
        success: (res) => {
          if (res.confirm) wx.navigateBack();
        },
      });
    }
  },

  onEdit() {
    const { activity } = this.data;
    wx.navigateTo({ url: `/pages/form/form?id=${activity.id}` });
  },

  onShare() {
    wx.navigateTo({ url: `/pages/share/share?id=${this.data.activity.id}` });
  },

  onPublish() {
    wx.showToast({ title: '活动已发布', icon: 'success' });
  },

  onToggleStatus() {
    const { activity } = this.data;
    const msg = activity.canPause ? '活动已暂停' : '活动已恢复';
    wx.showToast({ title: msg, icon: 'success' });
  },
});
