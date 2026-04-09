const formField = require('../../behaviors/formField');

Component({
  behaviors: ['wx://form-field', formField],

  relations: {
    '../form-item/form-item': {
      type: 'ancestor',
    },
  },

  properties: {
    value: { type: Number, value: 0 },
    min: { type: Number, value: 0 },
    max: { type: Number, value: Infinity },
    step: { type: Number, value: 1 },
    size: { type: String, value: '' },
    disabled: { type: Boolean, value: false },
    decimalLength: { type: Number, value: 0 },
  },

  data: {
    _displayValue: '0',
    _minusDisabled: false,
    _plusDisabled: false,
    _disabled: false,
  },

  observers: {
    'value, min, max, decimalLength': function (value, min, max, decimalLength) {
      const clamped = Math.min(Math.max(value, min), max);
      this.setData({
        _displayValue: decimalLength > 0 ? clamped.toFixed(decimalLength) : String(clamped),
        _minusDisabled: clamped <= min,
        _plusDisabled: clamped >= max,
      });
    },
    'disabled, _formItemDisabled': function (disabled, formDisabled) {
      this.setData({ _disabled: disabled || formDisabled });
    },
  },

  methods: {
    _add(offset) {
      if (this._isDisabled()) return;
      const { value, min, max, step, decimalLength } = this.data;
      const factor = Math.pow(10, decimalLength);
      const newVal = Math.round(value * factor + offset * step * factor) / factor;
      const clamped = Math.min(Math.max(newVal, min), max);
      if (clamped !== value) {
        this.triggerEvent('update:value', { value: clamped });
        this._notifyChange();
      }
    },

    handleMinus() {
      if (this.data._minusDisabled || this._isDisabled()) {
        this.triggerEvent('overlimit', { type: 'minus' });
        return;
      }
      this._add(-1);
    },

    handlePlus() {
      if (this.data._plusDisabled || this._isDisabled()) {
        this.triggerEvent('overlimit', { type: 'plus' });
        return;
      }
      this._add(1);
    },

    _startLongPress(type) {
      this._longPressTimer = setTimeout(() => {
        this._longPressInterval = setInterval(() => {
          if (type === 'minus') {
            this.handleMinus();
          } else {
            this.handlePlus();
          }
        }, 100);
      }, 350);
    },

    _stopLongPress() {
      clearTimeout(this._longPressTimer);
      clearInterval(this._longPressInterval);
      this._longPressTimer = null;
      this._longPressInterval = null;
    },

    onMinusTouchStart() {
      this.handleMinus();
      if (!this.data._minusDisabled && !this._isDisabled()) {
        this._startLongPress('minus');
      }
    },

    onPlusTouchStart() {
      this.handlePlus();
      if (!this.data._plusDisabled && !this._isDisabled()) {
        this._startLongPress('plus');
      }
    },

    onTouchEnd() {
      this._stopLongPress();
    },
  },

  detached() {
    this._stopLongPress();
  },
});
