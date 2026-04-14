Component({
  properties: {
    from: {
      type: Number,
      value: 0,
    },
    to: {
      type: Number,
      value: 0,
    },
    duration: {
      type: Number,
      value: 2000,
    },
    precision: {
      type: Number,
      value: 0,
    },
    showSeparator: {
      type: Boolean,
      value: false,
    },
    active: {
      type: Boolean,
      value: true,
    },
    color: {
      type: String,
      value: '',
    },
    fontSize: {
      type: String,
      value: '',
    },
  },

  data: {
    _displayValue: '0',
    _style: '',
  },

  lifetimes: {
    attached() {
      this._initialized = true;
      this._animating = false;
      this._timer = null;
      this._currentValue = this.data.from;
      if (this.data.active) {
        this._animate(this.data.from, this.data.to);
      } else {
        this._updateDisplay(this.data.from);
      }
    },

    detached() {
      this._stopAnimation();
    },
  },

  observers: {
    to(to) {
      if (!this._initialized || !this.data.active) return;
      this._animate(this._currentValue ?? this.data.from, to);
    },
    'color, fontSize'(color, fontSize) {
      const parts = [];
      if (color) parts.push(`color: ${color}`);
      if (fontSize) parts.push(`font-size: ${fontSize}`);
      this.setData({ _style: parts.join('; ') });
    },
  },

  methods: {
    play() {
      this._animate(this.data.from, this.data.to);
    },

    _animate(from, to) {
      this._stopAnimation();
      this._animating = true;

      const { duration } = this.data;
      const startTime = Date.now();

      this._timer = setInterval(() => {
        const elapsed = Math.min(Date.now() - startTime, duration);
        const progress = elapsed / duration;
        // easeOut quintic: 1 - (1 - t)^5
        const eased = 1 - Math.pow(1 - progress, 5);
        const current = from + (to - from) * eased;

        this._updateDisplay(current);

        if (elapsed >= duration) {
          this._stopAnimation();
          this._updateDisplay(to);
          this.triggerEvent('finish');
        }
      }, 16);
    },

    _stopAnimation() {
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
      this._animating = false;
    },

    _updateDisplay(value) {
      this._currentValue = value;
      const { precision, showSeparator } = this.data;
      let str = value.toFixed(precision);

      if (showSeparator) {
        const parts = str.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        str = parts.join('.');
      }

      this.setData({ _displayValue: str });
    },
  },
});
