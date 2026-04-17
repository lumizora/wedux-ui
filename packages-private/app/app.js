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
    // shadcn/ui neutral zinc palette for light mode
    const lightOverrides =
      themeMode === 'light'
        ? {
            '--color-bg-page': '#f4f4f5',
            '--color-bg-base': '#fafafa',
            '--color-bg-elevated': '#ffffff',
            '--color-text-primary': '#09090b',
            '--color-text-secondary': '#71717a',
            '--color-separator': '#e4e4e7',
          }
        : {};
    this.globalData.theme = {
      ...base,
      ...lightOverrides,
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
