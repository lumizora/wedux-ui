Component({
  properties: {
    theme: {
      type: Object,
      value: {},
    },
    themeOverrides: {
      type: Object,
      value: {},
    },
  },

  observers: {
    'theme, themeOverrides': function (theme, themeOverrides) {
      const merged = Object.assign({}, theme || {}, themeOverrides || {});
      const keys = Object.keys(merged);
      if (!keys.length) {
        this.setData({ themeStyle: '' });
        return;
      }
      const themeStyle = keys
        .map((k) => {
          const key = k.startsWith('--') ? k : `--${k}`;
          return `${key}: ${merged[k]}`;
        })
        .join('; ');
      this.setData({ themeStyle });
    },
  },

  data: {
    themeStyle: '',
  },
});
