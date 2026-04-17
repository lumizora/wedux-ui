Page({
  data: {
    props: [
      { name: 'distance', type: 'Number', default: '50', desc: '触底阈值（px）' },
      { name: 'loading', type: 'Boolean', default: 'false', desc: '是否正在加载' },
      { name: 'finished', type: 'Boolean', default: 'false', desc: '是否已加载全部数据' },
      { name: 'loadingText', type: 'String', default: "'加载中...'", desc: '加载中提示文案' },
      { name: 'finishedText', type: 'String', default: "'没有更多了'", desc: '加载完成提示文案' },
    ],
    list: [],
    loading: false,
    finished: false,
    page: 0,
  },

  onLoad() {
    this._loadMore();
  },

  onLoadMore() {
    this._loadMore();
  },

  _loadMore() {
    if (this.data.loading || this.data.finished) return;

    this.setData({ loading: true });

    setTimeout(() => {
      const { page, list } = this.data;
      const nextPage = page + 1;
      const newItems = Array.from({ length: 20 }, (_, i) => ({
        id: page * 20 + i + 1,
        text: `列表项 ${page * 20 + i + 1}`,
      }));

      this.setData({
        list: [...list, ...newItems],
        loading: false,
        page: nextPage,
        finished: nextPage >= 5,
      });
    }, 1000);
  },

  onReset() {
    this.setData({
      list: [],
      loading: false,
      finished: false,
      page: 0,
    });
    this._loadMore();
  },
});
