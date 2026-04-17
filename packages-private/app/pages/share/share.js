import { getActivityById, statusConfig } from '../../utils/mock';

Page({
  data: {
    theme: {},
    activity: null,
    qrValue: '',
    saving: false,
    sharing: false,
  },

  onLoad(query) {
    this.loadTheme();
    if (query.id) {
      this.loadActivity(query.id);
    }
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
    const activity = {
      ...raw,
      statusLabel: statusConfig[raw.status]?.label || raw.status,
      statusType: statusConfig[raw.status]?.type || 'default',
    };
    // QR content simulates a deep link
    const qrValue = `https://wedux-ui.app/activity/${id}`;
    this.setData({ activity, qrValue });
  },

  onSave() {
    this.setData({ saving: true });
    wx.showLoading({ title: '保存中...' });
    setTimeout(() => {
      this.setData({ saving: false });
      wx.hideLoading();
      wx.showToast({ title: '已保存到相册', icon: 'success' });
    }, 1200);
  },

  onShare() {
    this.setData({ sharing: true });
    setTimeout(() => {
      this.setData({ sharing: false });
      wx.showToast({ title: '链接已复制', icon: 'success' });
    }, 600);
  },

  onCopyLink() {
    wx.setClipboardData({
      data: this.data.qrValue,
      success: () => wx.showToast({ title: '链接已复制', icon: 'success' }),
    });
  },
});
