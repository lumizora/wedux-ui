Component({
  options: {
    virtualHost: true,
  },

  properties: {
    position: {
      type: String,
      value: 'fixed',
    },
    bordered: {
      type: Boolean,
      value: false,
    },
    safeArea: {
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
    _placeholderHeight: 0,
  },

  lifetimes: {
    ready() {
      if (this.data.position === 'fixed') {
        this._measureHeight();
      }
    },
  },

  observers: {
    'position, bordered, safeArea'() {
      if (this.data.position === 'fixed') {
        setTimeout(() => this._measureHeight(), 50);
      }
    },
  },

  methods: {
    _measureHeight() {
      this.createSelectorQuery()
        .select('.w-layout-footer')
        .boundingClientRect((rect) => {
          if (rect) {
            this.setData({ _placeholderHeight: rect.height });
          }
        })
        .exec();
    },
  },
});
