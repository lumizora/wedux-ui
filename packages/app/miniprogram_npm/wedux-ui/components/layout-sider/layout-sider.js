Component({
  options: {
    virtualHost: true,
  },

  properties: {
    width: {
      type: Number,
      value: 160,
    },
    bordered: {
      type: Boolean,
      value: false,
    },
    scrollY: {
      type: Boolean,
      value: true,
    },
  },

  relations: {
    '../layout/layout': {
      type: 'ancestor',
    },
  },

  data: {
    _style: '',
  },

  observers: {
    width(val) {
      this.setData({ _style: `width: ${val}rpx` });
    },
  },

  lifetimes: {
    attached() {
      this.setData({ _style: `width: ${this.data.width}rpx` });
    },
  },

  methods: {
    _onScroll(e) {
      this.triggerEvent('scroll', e.detail);
    },
  },
});
