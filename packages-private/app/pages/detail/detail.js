import { getActivityById, statusConfig, activities } from '../../utils/mock';

const mockParticipants = [
  { id: '1', name: '张三', avatar: 'https://picsum.photos/seed/u1/80/80' },
  { id: '2', name: '李四', avatar: 'https://picsum.photos/seed/u2/80/80' },
  { id: '3', name: '王五', avatar: 'https://picsum.photos/seed/u3/80/80' },
  { id: '4', name: '赵六', avatar: 'https://picsum.photos/seed/u4/80/80' },
  { id: '5', name: '钱七', avatar: 'https://picsum.photos/seed/u5/80/80' },
];

Page({
  data: {
    theme: {},
    activity: null,
    participants: mockParticipants,
    progressRate: 0,
    showMoreDrawer: false,
    moreActions: [
      { key: 'share', label: '生成二维码' },
      { key: 'duplicate', label: '复制活动' },
      { key: 'delete', label: '删除活动' },
    ],
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
      progressRate: raw.targetCount > 0 ? Math.round((raw.actualCount / raw.targetCount) * 100) : 0,
      canEdit: raw.status !== 'ended',
      canPause: raw.status === 'active',
      canResume: raw.status === 'paused',
      canPublish: raw.status === 'draft',
    };
    this.setData({ activity });
  },

  onBack() {
    wx.navigateBack();
  },

  onEdit() {
    wx.navigateTo({ url: `/pages/form/form?id=${this.data.activity.id}` });
  },

  onShare() {
    wx.navigateTo({ url: `/pages/share/share?id=${this.data.activity.id}` });
  },

  onToggleStatus() {
    const { activity } = this.data;
    const newStatus = activity.status === 'active' ? 'paused' : 'active';
    const label = newStatus === 'active' ? '恢复' : '暂停';
    wx.showModal({
      title: `确认${label}`,
      content: `确认要${label}该活动吗？`,
      success: (res) => {
        if (res.confirm) {
          const idx = activities.findIndex((a) => a.id === activity.id);
          if (idx !== -1) activities[idx].status = newStatus;
          this.loadActivity(activity.id);
          wx.showToast({ title: `已${label}`, icon: 'success' });
        }
      },
    });
  },

  onPublish() {
    wx.showModal({
      title: '确认发布',
      content: '发布后活动将对外可见，确认发布？',
      success: (res) => {
        if (res.confirm) {
          const idx = activities.findIndex((a) => a.id === this.data.activity.id);
          if (idx !== -1) activities[idx].status = 'active';
          this.loadActivity(this.data.activity.id);
          wx.showToast({ title: '已发布', icon: 'success' });
        }
      },
    });
  },

  onMoreTap() {
    this.setData({ showMoreDrawer: true });
  },

  onMoreDrawerChange(e) {
    this.setData({ showMoreDrawer: e.detail.show });
  },

  onMoreAction(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ showMoreDrawer: false });
    if (key === 'share') {
      wx.navigateTo({ url: `/pages/share/share?id=${this.data.activity.id}` });
    } else if (key === 'duplicate') {
      wx.showToast({ title: '复制成功', icon: 'success' });
    } else if (key === 'delete') {
      this.onDelete();
    }
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确认删除该活动？',
      confirmColor: '#fa5151',
      success: (res) => {
        if (res.confirm) {
          const idx = activities.findIndex((a) => a.id === this.data.activity.id);
          if (idx !== -1) activities.splice(idx, 1);
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 800);
        }
      },
    });
  },
});
