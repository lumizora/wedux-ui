Component({
  properties: {
    distance: {
      type: Number,
      value: 50,
    },
    loading: {
      type: Boolean,
      value: false,
    },
    finished: {
      type: Boolean,
      value: false,
    },
    loadingText: {
      type: String,
      value: '加载中...',
    },
    finishedText: {
      type: String,
      value: '没有更多了',
    },
  },

  methods: {
    onScrollToLower() {
      if (this.data.loading || this.data.finished) return;
      this.triggerEvent('load');
    },
  },
});
