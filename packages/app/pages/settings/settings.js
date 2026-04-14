import {
  lightTheme,
  darkTheme,
} from '../../miniprogram_npm/wedux-ui/components/theme-provider/presets';

const tabs = [
  { key: 'dashboard', label: '首页', icon: 'home' },
  { key: 'list', label: '活动', icon: 'diandan01' },
  { key: 'settings', label: '设置', icon: 'g_my' },
];

const presetColors = [
  { name: '微信绿', value: '#07c160' },
  { name: '活力橙', value: '#fa8c16' },
  { name: '天空蓝', value: '#1890ff' },
  { name: '玫瑰红', value: '#f5222d' },
  { name: '葡萄紫', value: '#722ed1' },
  { name: '极客黑', value: '#262626' },
];

Page({
  data: {
    theme: {},
    tabs,
    activeTab: 'settings',
    themeMode: 'light',
    primaryColor: '#07c160',
    presetColors,
    previewRating: 4,
    previewSwitchChecked: true,
  },

  onLoad() {
    const app = getApp();
    this.setData({
      themeMode: app.globalData.themeMode,
      primaryColor: app.globalData.primaryColor,
      theme: app.globalData.theme,
    });
  },

  onShow() {
    const app = getApp();
    this.setData({
      themeMode: app.globalData.themeMode,
      primaryColor: app.globalData.primaryColor,
      theme: app.globalData.theme,
    });
  },

  onThemeModeChange(e) {
    const isDark = e.detail.value;
    const mode = isDark ? 'dark' : 'light';
    const app = getApp();
    app.setThemeMode(mode);
    this.setData({ themeMode: mode, theme: app.globalData.theme });
  },

  onColorChange(e) {
    const color = e.detail.value;
    const app = getApp();
    app.setPrimaryColor(color);
    this.setData({ primaryColor: color, theme: app.globalData.theme });
  },

  onPresetColorTap(e) {
    const { color } = e.currentTarget.dataset;
    const app = getApp();
    app.setPrimaryColor(color);
    this.setData({ primaryColor: color, theme: app.globalData.theme });
  },

  onPreviewRatingChange(e) {
    this.setData({ previewRating: e.detail.value });
  },

  onPreviewSwitchChange(e) {
    this.setData({ previewSwitchChecked: e.detail.value });
  },

  onTabChange(e) {
    const { key } = e.detail;
    if (key === 'dashboard') {
      wx.redirectTo({ url: '/pages/dashboard/dashboard' });
    } else if (key === 'list') {
      wx.redirectTo({ url: '/pages/list/list' });
    }
  },

  onResetTheme() {
    const app = getApp();
    app.setThemeMode('light');
    app.setPrimaryColor('#07c160');
    this.setData({
      themeMode: 'light',
      primaryColor: '#07c160',
      theme: app.globalData.theme,
    });
    wx.showToast({ title: '已重置主题', icon: 'success' });
  },
});
