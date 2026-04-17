const formField = require('../../behaviors/formField');

Component({
  behaviors: ['wx://form-field', formField],

  relations: {
    '../form-item/form-item': {
      type: 'ancestor',
    },
    '../radio/radio': {
      type: 'descendant',
      linked() {
        this._updateChildren();
      },
      linkChanged() {
        this._updateChildren();
      },
      unlinked() {
        this._updateChildren();
      },
    },
    '../radio-button/radio-button': {
      type: 'descendant',
      linked() {
        this._updateChildren();
      },
      linkChanged() {
        this._updateChildren();
      },
      unlinked() {
        this._updateChildren();
      },
    },
  },

  properties: {
    value: { type: null, value: null },
    disabled: { type: Boolean, value: false },
    size: { type: String, value: '' },
    vertical: { type: Boolean, value: false },
  },

  data: {},

  observers: {
    'value, disabled, size, _formItemSize, _formItemDisabled'() {
      this._updateChildren();
    },
  },

  methods: {
    _updateChildren() {
      const radios = this.getRelationNodes('../radio/radio') || [];
      const radioButtons = this.getRelationNodes('../radio-button/radio-button') || [];
      const children = [...radios, ...radioButtons];
      if (!children.length) return;
      const ctx = {
        size: this.data.size || this.data._formItemSize,
        disabled: this.data.disabled || this.data._formItemDisabled,
        currentValue: this.data.value,
      };
      children.forEach((child) => {
        child._setGroupContext(ctx);
      });
    },

    _handleChildChange(value) {
      this.triggerEvent('update:value', { value });
      this._notifyChange();
    },
  },
});
