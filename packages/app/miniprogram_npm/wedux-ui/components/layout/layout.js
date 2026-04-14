Component({
  properties: {
    hasSider: {
      type: Boolean,
      value: false,
    },
  },

  relations: {
    '../layout-header/layout-header': {
      type: 'descendant',
    },
    '../layout-content/layout-content': {
      type: 'descendant',
    },
    '../layout-footer/layout-footer': {
      type: 'descendant',
    },
    '../layout-sider/layout-sider': {
      type: 'descendant',
      linked() {
        this._updateHasSider();
      },
      linkChanged() {
        this._updateHasSider();
      },
      unlinked() {
        this._updateHasSider();
      },
    },
  },

  data: {
    _hasSider: false,
  },

  observers: {
    hasSider(val) {
      this.setData({ _hasSider: val });
    },
  },

  methods: {
    _updateHasSider() {
      const siders = this.getRelationNodes('../layout-sider/layout-sider');
      const hasSider = this.data.hasSider || (siders && siders.length > 0);
      this.setData({ _hasSider: hasSider });
    },
  },
});
