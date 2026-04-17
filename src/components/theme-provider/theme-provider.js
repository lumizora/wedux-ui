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
    style: {
      type: String,
      value: '',
    },
  },

  observers: {
    'theme, themeOverrides': function (theme, themeOverrides) {
      const merged = Object.assign({}, theme || {}, themeOverrides || {});
      const keys = Object.keys(merged);
      if (!keys.length) {
        this.setData({ mergedStyle: this.data.style });
        return;
      }
      const themeStyle = keys
        .map((k) => {
          const key = k.startsWith('--') ? k : `--${k}`;
          return `${key}: ${merged[k]}`;
        })
        .join('; ');
      this.setData({ mergedStyle: `${this.data.style}; ${themeStyle}` });
    },
  },

  data: {
    mergedStyle: '',
  },
});
