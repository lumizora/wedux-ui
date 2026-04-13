import { darkTheme } from 'wedux-ui/components/theme-provider/presets';

Page({
  data: {
    props: [
      {
        name: 'theme',
        type: 'Object',
        default: '{}',
        desc: '完整主题对象（可传入 light/dark 预设或自定义主题）',
      },
      {
        name: 'themeOverrides',
        type: 'Object',
        default: '{}',
        desc: '覆盖层，在 theme 基础上微调个别 CSS 变量',
      },
    ],
    darkTheme: darkTheme,
    overrides: {
      '--w-btn-radius': '9999rpx',
      '--color-brand': '#3742fa',
    },
    customTheme: {
      '--color-brand': '#ccae62',
      '--color-bg-page': '#FDF8F3',
      '--color-bg-base': '#F9F1E8',
      '--w-switch-checked-bg': '#ccae62',
    },
    btnOverrides: {
      '--w-btn-height-md': '100rpx',
      '--w-btn-radius-md': '9999rpx',
    },
  },
});
