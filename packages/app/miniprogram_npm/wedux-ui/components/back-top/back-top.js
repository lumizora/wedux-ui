Component({
  properties: {
    scrollTop: {
      type: Number,
      value: 0,
    },
    visibilityHeight: {
      type: Number,
      value: 180,
    },
    right: {
      type: Number,
      value: 48,
    },
    bottom: {
      type: Number,
      value: 96,
    },
    duration: {
      type: Number,
      value: 300,
    },
  },

  data: {
    _visible: false,
    _style: '',
  },

  lifetimes: {
    ready() {
      this._computeStyle();
    },
  },

  observers: {
    'right, bottom'() {
      this._computeStyle();
    },
    scrollTop(val) {
      const visible = val >= this.data.visibilityHeight;
      if (visible !== this.data._visible) {
        this.setData({ _visible: visible });
      }
    },
  },

  methods: {
    _computeStyle() {
      const { right, bottom } = this.data;
      const parts = [
        'position: fixed',
        'z-index: 999',
        `right: ${right}rpx`,
        `bottom: ${bottom}rpx`,
      ];
      this.setData({ _style: parts.join('; ') });
    },

    handleTap() {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: this.data.duration,
      });
      this.triggerEvent('click');
    },
  },
});
