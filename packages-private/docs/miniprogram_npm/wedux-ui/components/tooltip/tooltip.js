Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    content: {
      type: String,
      value: '',
    },
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
      query.select('.w-tooltip__trigger').boundingClientRect();
      query.select('.w-tooltip__body').boundingClientRect();
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
        const safeMargin = 4;

        let [main, align] = this.data.placement.split('-');

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
        const arrowClass = `w-tooltip__arrow--${main}`;

        if (main === 'top' || main === 'bottom') {
          bodyStyle += main === 'top' ? `bottom: ${tH + gap}px;` : `top: ${tH + gap}px;`;

          let bodyLeft = align === 'start' ? 0 : align === 'end' ? tW - bW : (tW - bW) / 2;

          const absLeft = triggerRect.left + bodyLeft;
          const absRight = absLeft + bW;
          if (absLeft < safeMargin) {
            bodyLeft += safeMargin - absLeft;
          } else if (absRight > windowWidth - safeMargin) {
            bodyLeft -= absRight - (windowWidth - safeMargin);
          }

          bodyStyle += `left: ${bodyLeft}px;`;
          arrowStyle = `left: ${tW / 2 - bodyLeft}px;`;
        } else {
          bodyStyle += main === 'left' ? `right: ${tW + gap}px;` : `left: ${tW + gap}px;`;

          let bodyTop = align === 'start' ? 0 : align === 'end' ? tH - bH : (tH - bH) / 2;

          const absTop = triggerRect.top + bodyTop;
          const absBottom = absTop + bH;
          if (absTop < safeMargin) {
            bodyTop += safeMargin - absTop;
          } else if (absBottom > windowHeight - safeMargin) {
            bodyTop -= absBottom - (windowHeight - safeMargin);
          }

          bodyStyle += `top: ${bodyTop}px;`;
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
