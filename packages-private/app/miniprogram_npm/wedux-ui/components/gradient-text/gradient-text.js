Component({
  properties: {
    type: {
      type: String,
      value: 'primary', // primary | info | success | warning | error
    },
    size: {
      type: String,
      value: '', // sm | md | lg | xl or custom value like '48rpx'
    },
    gradient: {
      type: String,
      value: '', // custom CSS gradient, e.g. 'linear-gradient(90deg, red, blue)'
    },
  },

  data: {
    _style: '',
  },

  observers: {
    'type, size, gradient'(type, size, gradient) {
      const parts = [];

      // gradient or type-based color
      if (gradient) {
        parts.push(`background-image: ${gradient}`);
      } else {
        const colorMap = {
          primary: 'linear-gradient(135deg, var(--color-brand), #05a34e)',
          info: 'linear-gradient(135deg, var(--color-info), #0790d4)',
          success: 'linear-gradient(135deg, var(--color-success), #5a9400)',
          warning: 'linear-gradient(135deg, var(--color-warning), #e08520)',
          error: 'linear-gradient(135deg, var(--color-danger), #d43030)',
        };
        const bg = colorMap[type] || colorMap.primary;
        parts.push(`background-image: ${bg}`);
      }

      // font size
      if (size) {
        const sizeMap = {
          sm: 'var(--font-size-sm)',
          md: 'var(--font-size-md)',
          lg: 'var(--font-size-lg)',
          xl: 'var(--font-size-xl)',
        };
        parts.push(`font-size: ${sizeMap[size] || size}`);
      }

      this.setData({ _style: parts.join('; ') });
    },
  },
});
