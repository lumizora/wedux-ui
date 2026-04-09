Component({
  properties: {
    active: {
      type: String,
      value: '',
    },
    items: {
      type: Array,
      value: [],
    },
    activeColor: {
      type: String,
      value: '',
    },
    color: {
      type: String,
      value: '',
    },
  },

  data: {
    _style: '',
  },

  observers: {
    'activeColor, color': function (activeColor, color) {
      let style = '';
      if (activeColor) {
        style += `--tab-bar-active-bg: ${activeColor};`;
      }
      if (color) {
        style += `--tab-bar-color: ${color};`;
      }
      this.setData({ _style: style });
    },
  },

  methods: {
    onTabTap(e) {
      const { key } = e.currentTarget.dataset;
      if (key === this.data.active) return;

      const item = this.data.items.find((i) => i.key === key);
      if (!item) return;

      if (item.url) {
        wx.redirectTo({ url: item.url });
      }

      this.triggerEvent('change', { key, item });
    },
  },
});
