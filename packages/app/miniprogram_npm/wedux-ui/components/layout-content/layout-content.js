Component({
  options: {
    virtualHost: true,
  },

  properties: {
    scrollY: {
      type: Boolean,
      value: true,
    },
    scrollX: {
      type: Boolean,
      value: false,
    },
    scrollTop: {
      type: Number,
    },
    scrollIntoView: {
      type: String,
      value: '',
    },
    scrollWithAnimation: {
      type: Boolean,
      value: false,
    },
  },

  relations: {
    '../layout/layout': {
      type: 'ancestor',
    },
  },

  methods: {
    _onScroll(e) {
      this.triggerEvent('scroll', e.detail);
    },

    _onScrollToLower(e) {
      this.triggerEvent('scrolltolower', e.detail);
    },

    _onScrollToUpper(e) {
      this.triggerEvent('scrolltoupper', e.detail);
    },
  },
});
