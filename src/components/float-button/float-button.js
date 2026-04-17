Component({
  properties: {
    type: {
      type: String,
      value: 'default', // default | primary
    },
    shape: {
      type: String,
      value: 'circle', // circle | square
    },
    disabled: {
      type: Boolean,
      value: false,
    },
    position: {
      type: String,
      value: 'bottom-right', // bottom-right | bottom-left | top-right | top-left
    },
    right: { type: Number, value: -1 },
    bottom: { type: Number, value: -1 },
    left: { type: Number, value: -1 },
    top: { type: Number, value: -1 },
  },

  data: {
    _style: '',
  },

  lifetimes: {
    ready() {
      this._computeStyle();
    },
  },

  observers: {
    'position, right, bottom, left, top'() {
      this._computeStyle();
    },
  },

  methods: {
    _computeStyle() {
      const pos = this.data.position;
      const right = this.data.right;
      const bottom = this.data.bottom;
      const left = this.data.left;
      const top = this.data.top;
      const parts = ['position: fixed', 'z-index: 999'];

      if (right >= 0) {
        parts.push(`right: ${right}rpx`);
      } else if (left >= 0) {
        parts.push(`left: ${left}rpx`);
      } else if (pos === 'bottom-right' || pos === 'top-right') {
        parts.push('right: 48rpx');
      } else {
        parts.push('left: 48rpx');
      }

      if (top >= 0) {
        parts.push(`top: ${top}rpx`);
      } else if (bottom >= 0) {
        parts.push(`bottom: ${bottom}rpx`);
      } else if (pos === 'bottom-right' || pos === 'bottom-left') {
        parts.push('bottom: 96rpx');
      } else {
        parts.push('top: 192rpx');
      }

      this.setData({ _style: parts.join('; ') });
    },

    handleTap() {
      if (this.data.disabled) return;
      this.triggerEvent('tap');
    },
  },
});
