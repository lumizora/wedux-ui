Component({
  options: {
    multipleSlots: true,
  },

  relations: {
    '../list-item/list-item': {
      type: 'descendant',
      linked() {
        this._updateChildren();
      },
      unlinked() {
        this._updateChildren();
      },
    },
  },

  properties: {
    bordered: {
      type: Boolean,
      value: false,
    },
    showDivider: {
      type: Boolean,
      value: true,
    },
    size: {
      type: String,
      value: 'medium',
    },
  },

  observers: {
    'showDivider, size': function () {
      this._updateChildren();
    },
  },

  methods: {
    _updateChildren() {
      const items = this.getRelationNodes('../list-item/list-item');
      if (!items || !items.length) return;

      const { showDivider, size } = this.data;
      const lastIndex = items.length - 1;

      items.forEach((item, index) => {
        item.setData({
          _showDivider: showDivider && index < lastIndex,
          _size: size,
        });
      });
    },
  },
});
