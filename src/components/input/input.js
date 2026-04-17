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
    type: { type: String, value: 'text' },
    password: { type: Boolean, value: false },
    placeholder: { type: String, value: '' },
    disabled: { type: Boolean, value: false },
    readonly: { type: Boolean, value: false },
    maxlength: { type: Number, value: 140 },
    clearable: { type: Boolean, value: false },
    showWordLimit: { type: Boolean, value: false },
    size: { type: String, value: '' },
    status: { type: String, value: '' },
    round: { type: Boolean, value: false },
  },

  data: {
    _focused: false,
  },

  methods: {
    handleInput(e) {
      const val = e.detail.value;
      this.triggerEvent('update:value', { value: val });
      this._notifyChange();
    },

    handleFocus(e) {
      this.setData({ _focused: true });
      this.triggerEvent('focus', e.detail);
    },

    handleBlur(e) {
      this.setData({ _focused: false });
      this.triggerEvent('blur', e.detail);
      this._notifyBlur();
    },

    handleConfirm(e) {
      this.triggerEvent('confirm', e.detail);
    },

    handleClear() {
      this.triggerEvent('update:value', { value: '' });
      this.triggerEvent('clear');
      this._notifyChange();
    },
  },
});
