import {
  lightTheme,
  darkTheme,
} from './miniprogram_npm/wedux-ui/components/theme-provider/presets';

App({
  globalData: {
    themeMode: 'light',
    primaryColor: '#07c160',
    theme: {},
  },

  onLaunch() {
    this.buildTheme();
  },

  buildTheme() {
    const { themeMode, primaryColor } = this.globalData;
    const base = themeMode === 'dark' ? { ...darkTheme } : { ...lightTheme };
    this.globalData.theme = {
      ...base,
      '--color-brand': primaryColor,
      '--w-input-border-focus': primaryColor,
      '--w-switch-checked-bg': primaryColor,
    };
  },

  setThemeMode(mode) {
    this.globalData.themeMode = mode;
    this.buildTheme();
  },

  setPrimaryColor(color) {
    this.globalData.primaryColor = color;
    this.buildTheme();
  },
});
