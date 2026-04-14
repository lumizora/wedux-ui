Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    show: { type: Boolean, value: false },
    placement: { type: String, value: 'bottom' },
    width: { type: String, value: '' },
    height: { type: String, value: '' },
    title: { type: String, value: '' },
    closable: { type: Boolean, value: false },
    showMask: { type: Boolean, value: true },
    maskClosable: { type: Boolean, value: true },
    round: { type: Boolean, value: false },
    zIndex: { type: Number, value: 1000 },
  },

  data: {
    _visible: false,
    _active: false,
    _bodyStyle: '',
  },

  observers: {
    show(val) {
      if (val) {
        this._open();
      } else if (this.data._visible) {
        this._close();
      }
    },
    'placement, width, height'() {
      this._updateBodyStyle();
    },
  },

  lifetimes: {
    attached() {
      this._updateBodyStyle();
    },
    detached() {
      if (this._closeTimer) {
        clearTimeout(this._closeTimer);
        this._closeTimer = null;
      }
    },
  },

  methods: {
    _open() {
      if (this._closeTimer) {
        clearTimeout(this._closeTimer);
        this._closeTimer = null;
      }
      this.setData({ _visible: true });
      setTimeout(() => {
        this.setData({ _active: true });
      }, 30);
    },

    _close() {
      this.setData({ _active: false });
      this._closeTimer = setTimeout(() => {
        this.setData({ _visible: false });
        this.triggerEvent('afterleave');
        this._closeTimer = null;
      }, 300);
    },

    _updateBodyStyle() {
      const { placement, width, height } = this.data;
      const isHorizontal = placement === 'left' || placement === 'right';
      let style = '';
      if (isHorizontal && width) {
        style = `width: ${width};`;
      } else if (!isHorizontal && height) {
        style = `height: ${height};`;
      }
      this.setData({ _bodyStyle: style });
    },

    handleMaskTap() {
      if (this.data.maskClosable) {
        this.triggerEvent('update:show', { show: false });
      }
      this.triggerEvent('maskclick');
    },

    handleClose() {
      this.triggerEvent('update:show', { show: false });
    },

    handlePrevent() {
      // Catch touchmove to prevent background scroll
    },

    handleTransitionEnd() {
      if (this.data._active) {
        this.triggerEvent('afterenter');
      }
    },
  },
});
