Component({
  relations: {
    '../button/button': {
      type: 'descendant',
      linked() {
        this._updateChildren();
      },
      linkChanged() {
        this._updateChildren();
      },
      unlinked() {
        this._updateChildren();
      },
    },
  },

  properties: {
    size: {
      type: String,
      value: '', // '' means use each button's own size
    },
    vertical: {
      type: Boolean,
      value: false,
    },
  },

  observers: {
    'size, vertical'() {
      this._updateChildren();
    },
  },

  methods: {
    _updateChildren() {
      const children = this.getRelationNodes('../button/button');
      const count = children.length;
      const size = this.data.size;
      const vertical = this.data.vertical;

      children.forEach((child, i) => {
        const position = i === 0 ? 'first' : i === count - 1 ? 'last' : 'middle';
        child._setGroupContext({
          position,
          size,
          vertical,
        });
      });
    },
  },
});
