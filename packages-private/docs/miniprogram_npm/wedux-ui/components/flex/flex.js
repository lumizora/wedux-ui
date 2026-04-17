const SIZE_MAP = {
  small: 'var(--spacing-sm)',
  medium: 'var(--spacing-md)',
  large: 'var(--spacing-lg)',
  none: '0',
};

Component({
  properties: {
    vertical: {
      type: Boolean,
      value: false,
    },
    align: {
      type: String,
      value: '', // flex-start | flex-end | center | baseline | stretch
    },
    justify: {
      type: String,
      value: 'flex-start', // flex-start | flex-end | center | space-between | space-around | space-evenly
    },
    size: {
      type: null,
      value: 'medium', // 'small' | 'medium' | 'large' | 'none' | number(rpx) | [rowGap, colGap]
    },
    wrap: {
      type: Boolean,
      value: true,
    },
    inline: {
      type: Boolean,
      value: false,
    },
  },

  observers: {
    'vertical, align, justify, size, wrap, inline'() {
      this._updateStyle();
    },
  },

  lifetimes: {
    attached() {
      this._updateStyle();
    },
  },

  methods: {
    _resolveGap(val) {
      if (Array.isArray(val)) {
        return [this._resolveOne(val[0]), this._resolveOne(val[1])];
      }
      const g = this._resolveOne(val);
      return [g, g];
    },

    _resolveOne(val) {
      if (typeof val === 'number') return `${val}rpx`;
      return SIZE_MAP[val] || SIZE_MAP.medium;
    },

    _updateStyle() {
      const { vertical, align, justify, size, wrap, inline } = this.data;
      const [rowGap, colGap] = this._resolveGap(size);
      const parts = [
        `display:${inline ? 'inline-flex' : 'flex'}`,
        `flex-direction:${vertical ? 'column' : 'row'}`,
        `flex-wrap:${wrap ? 'wrap' : 'nowrap'}`,
        `justify-content:${justify}`,
        `row-gap:${rowGap}`,
        `column-gap:${colGap}`,
      ];
      if (align) parts.push(`align-items:${align}`);
      this.setData({ _style: parts.join(';') });
    },
  },

  data: {
    _style: '',
  },
});
