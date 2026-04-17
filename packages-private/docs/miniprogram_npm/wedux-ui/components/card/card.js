Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    title: {
      type: String,
      value: '',
    },
    bordered: {
      type: Boolean,
      value: true,
    },
    hoverable: {
      type: Boolean,
      value: false,
    },
    size: {
      type: String,
      value: 'medium', // small | medium | large
    },
    segmented: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    _hasHeader: false,
  },

  observers: {
    title(title) {
      this.setData({ _hasHeader: !!title });
    },
  },

  methods: {
    handleTap() {
      this.triggerEvent('tap');
    },
  },
});
