Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    show: {
      type: Boolean,
      value: false,
    },
    trigger: {
      type: String,
      value: 'tap',
    },
    placement: {
      type: String,
      value: 'top',
    },
    showArrow: {
      type: Boolean,
      value: true,
    },
    disabled: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    _visible: false,
    _active: false,
    _bodyStyle: '',
    _arrowStyle: '',
    _arrowClass: '',
  },

  observers: {
    show(val) {
      if (val && !this.data._visible) {
        this._open();
      } else if (!val && this.data._visible) {
        this._close();
      }
    },
  },

  lifetimes: {
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
      // Render body first (opacity 0) so we can measure its size
      this.setData({ _visible: true }, () => {
        this._updatePosition(() => {
          setTimeout(() => this.setData({ _active: true }), 30);
        });
      });
    },

    _close() {
      this.setData({ _active: false });
      this._closeTimer = setTimeout(() => {
        this.setData({ _visible: false });
        this._closeTimer = null;
      }, 200);
    },

    _updatePosition(cb) {
      const query = this.createSelectorQuery();
      query.select('.w-popover__trigger').boundingClientRect();
      query.select('.w-popover__body').boundingClientRect();
      query.exec(([triggerRect, bodyRect]) => {
        if (!triggerRect || !bodyRect) {
          cb && cb();
          return;
        }

        const { windowWidth, windowHeight } = wx.getWindowInfo();
        const tW = triggerRect.width;
        const tH = triggerRect.height;
        const bW = bodyRect.width;
        const bH = bodyRect.height;
        const gap = 8;
        const safeMargin = 4; // minimum distance from viewport edge

        let [main, align] = this.data.placement.split('-');

        // Flip main axis if it would overflow but the opposite side has room
        if (
          main === 'top' &&
          triggerRect.top - bH - gap < safeMargin &&
          triggerRect.bottom + bH + gap + safeMargin <= windowHeight
        ) {
          main = 'bottom';
        } else if (
          main === 'bottom' &&
          triggerRect.bottom + bH + gap + safeMargin > windowHeight &&
          triggerRect.top - bH - gap >= safeMargin
        ) {
          main = 'top';
        } else if (
          main === 'left' &&
          triggerRect.left - bW - gap < safeMargin &&
          triggerRect.right + bW + gap + safeMargin <= windowWidth
        ) {
          main = 'right';
        } else if (
          main === 'right' &&
          triggerRect.right + bW + gap + safeMargin > windowWidth &&
          triggerRect.left - bW - gap >= safeMargin
        ) {
          main = 'left';
        }

        let bodyStyle = '';
        let arrowStyle = '';
        const arrowClass = `w-popover__arrow--${main}`;

        if (main === 'top' || main === 'bottom') {
          bodyStyle += main === 'top' ? `bottom: ${tH + gap}px;` : `top: ${tH + gap}px;`;

          // Calculate horizontal offset relative to trigger left edge
          let bodyLeft = align === 'start' ? 0 : align === 'end' ? tW - bW : (tW - bW) / 2;

          // Shift to keep body within viewport
          const absLeft = triggerRect.left + bodyLeft;
          const absRight = absLeft + bW;
          if (absLeft < safeMargin) {
            bodyLeft += safeMargin - absLeft;
          } else if (absRight > windowWidth - safeMargin) {
            bodyLeft -= absRight - (windowWidth - safeMargin);
          }

          bodyStyle += `left: ${bodyLeft}px;`;
          // Arrow points to trigger center
          arrowStyle = `left: ${tW / 2 - bodyLeft}px;`;
        } else {
          bodyStyle += main === 'left' ? `right: ${tW + gap}px;` : `left: ${tW + gap}px;`;

          // Calculate vertical offset relative to trigger top edge
          let bodyTop = align === 'start' ? 0 : align === 'end' ? tH - bH : (tH - bH) / 2;

          // Shift to keep body within viewport
          const absTop = triggerRect.top + bodyTop;
          const absBottom = absTop + bH;
          if (absTop < safeMargin) {
            bodyTop += safeMargin - absTop;
          } else if (absBottom > windowHeight - safeMargin) {
            bodyTop -= absBottom - (windowHeight - safeMargin);
          }

          bodyStyle += `top: ${bodyTop}px;`;
          // Arrow points to trigger center
          arrowStyle = `top: ${tH / 2 - bodyTop}px;`;
        }

        this.setData({ _bodyStyle: bodyStyle, _arrowStyle: arrowStyle, _arrowClass: arrowClass });
        cb && cb();
      });
    },

    handleTriggerTap() {
      if (this.data.disabled || this.data.trigger !== 'tap') return;
      const willShow = !this.data._visible;
      if (willShow) {
        this._open();
      } else {
        this._close();
      }
      this.triggerEvent('update:show', { show: willShow });
    },
  },
});
