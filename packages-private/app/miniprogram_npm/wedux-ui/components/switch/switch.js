const formField = require('../../behaviors/formField');

Component({
  behaviors: ['wx://form-field', formField],

  relations: {
    '../form-item/form-item': {
      type: 'ancestor',
    },
  },

  properties: {
    checked: { type: Boolean, value: false },
    disabled: { type: Boolean, value: false },
    size: { type: String, value: '' },
    checkedColor: { type: String, value: '' },
    checkedText: { type: String, value: '' },
    uncheckedText: { type: String, value: '' },
  },

  data: {
    _trackStyle: '',
  },

  observers: {
    'checked, checkedColor'(checked, checkedColor) {
      let style = '';
      if (checked && checkedColor) {
        style = `background-color: ${checkedColor};`;
      }
      this.setData({ _trackStyle: style });
    },
  },

  methods: {
    handleTap() {
      if (this._isDisabled()) return;
      this.triggerEvent('update:checked', { checked: !this.data.checked });
      this._notifyChange();
    },
  },
});
