Component({
  relations: {
    '../avatar/avatar': {
      type: 'descendant',
      linked() {
        this._syncChildren();
      },
      unlinked() {
        this._syncChildren();
      },
    },
  },

  properties: {
    size: {
      type: String,
      value: '', // 统一覆盖子头像尺寸，空则各自保留
    },
    round: {
      type: Boolean,
      value: false,
    },
  },

  observers: {
    'size, round'() {
      this._syncChildren();
    },
  },

  methods: {
    _syncChildren() {
      const children = this.getRelationNodes('../avatar/avatar');
      const size = this.data.size;
      const round = this.data.round;
      children.forEach((child, index) => {
        child._setGroupContext({
          size,
          round,
          overlap: index > 0,
        });
      });
    },
  },
});
