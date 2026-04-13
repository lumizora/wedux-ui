Component({
  properties: {
    level: {
      type: Number,
      value: 1, // 1–6
    },
    type: {
      type: String,
      value: 'default', // default / primary / info / success / warning / error
    },
    prefix: {
      type: Boolean,
      value: false,
    },
    alignText: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    _class: '',
    _style: '',
  },

  observers: {
    'level, type, prefix, alignText'(level, type, prefix, alignText) {
      const lvl = level < 1 ? 1 : level > 6 ? 6 : level;

      const cls = ['w-h', `w-h--${lvl}`];
      if (type !== 'default') cls.push(`w-h--${type}`);
      if (prefix) {
        cls.push('w-h--prefix');
        if (alignText) cls.push('w-h--align-text');
      }

      const parts = [];
      // type color
      const colorMap = {
        primary: 'var(--color-brand)',
        info: 'var(--color-info)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-danger)',
      };
      if (colorMap[type]) {
        parts.push(`color: ${colorMap[type]}`);
      }
      // prefix bar color follows type
      if (prefix && colorMap[type]) {
        parts.push(`--h-bar-color: ${colorMap[type]}`);
      }

      this.setData({
        _class: cls.join(' '),
        _style: parts.join('; '),
      });
    },
  },
});
