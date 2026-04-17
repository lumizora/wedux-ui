const formField = require('../../behaviors/formField');

Component({
  behaviors: ['wx://form-field', formField],

  relations: {
    '../form-item/form-item': {
      type: 'ancestor',
    },
  },

  properties: {
    value: { type: String, value: '' },
    length: { type: Number, value: 6 },
    mask: { type: Boolean, value: false },
    disabled: { type: Boolean, value: false },
    readonly: { type: Boolean, value: false },
    size: { type: String, value: '' },
    status: { type: String, value: '' },
    gap: { type: Number, value: 0 },
    placeholder: { type: String, value: '' },
    type: { type: String, value: 'number' },
  },

  data: {
    _focused: false,
    _slots: [],
    _cursorIndex: 0,
  },

  observers: {
    'value, length': function (value, length) {
      this._syncSlots(value, length);
    },
  },

  lifetimes: {
    attached() {
      this._syncSlots(this.data.value, this.data.length);
    },
  },

  methods: {
    _syncSlots(value, length) {
      const str = (value || '').slice(0, length);
      const slots = [];
      for (let i = 0; i < length; i++) {
        slots.push(str[i] || '');
      }
      this.setData({ _slots: slots });
    },

    _doUpdateValue(newValue) {
      const str = newValue.slice(0, this.data.length);
      this.triggerEvent('update:value', { value: str });

      this._notifyChange();

      if (str.length === this.data.length) {
        this.triggerEvent('finish', { value: str });
      }
    },

    handleTap() {
      if (this._isDisabled() || this.data.readonly) return;
      this.setData({ _focused: true });
    },

    handleInput(e) {
      let val = e.detail.value || '';
      // Filter to allowed length
      val = val.slice(0, this.data.length);
      this._doUpdateValue(val);
      // Update cursor position for visual feedback
      this.setData({ _cursorIndex: val.length });
    },

    handleFocus() {
      const cursorPos = (this.data.value || '').length;
      this.setData({
        _focused: true,
        _cursorIndex: Math.min(cursorPos, this.data.length),
      });
      this.triggerEvent('focus');
    },

    handleBlur() {
      this.setData({ _focused: false });
      this.triggerEvent('blur');
      this._notifyBlur();
    },

    // Public method
    focusOnChar(charIndex) {
      this.setData({
        _focused: true,
        _cursorIndex: charIndex,
      });
    },

    clear() {
      this._doUpdateValue('');
      this.setData({ _focused: true, _cursorIndex: 0 });
    },
  },
});
