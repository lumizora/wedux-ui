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
    placeholder: { type: String, value: '' },
    disabled: { type: Boolean, value: false },
    maxlength: { type: Number, value: 140 },
    showWordLimit: { type: Boolean, value: false },
    autoHeight: { type: Boolean, value: false },
    rows: { type: Number, value: 3 },
    size: { type: String, value: '' },
    status: { type: String, value: '' },
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
  },
});
