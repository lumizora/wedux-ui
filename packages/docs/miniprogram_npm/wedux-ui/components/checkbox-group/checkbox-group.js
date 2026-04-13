const formField = require('../../behaviors/formField');

Component({
  behaviors: ['wx://form-field', formField],

  relations: {
    '../form-item/form-item': {
      type: 'ancestor',
    },
    '../checkbox/checkbox': {
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
    '../checkbox-button/checkbox-button': {
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
    value: { type: Array, value: [] },
    disabled: { type: Boolean, value: false },
    size: { type: String, value: '' },
    vertical: { type: Boolean, value: false },
    max: { type: Number, value: 0 },
  },

  data: {},

  observers: {
    'value, disabled, size, max, _formItemSize, _formItemDisabled'() {
      this._updateChildren();
    },
  },

  methods: {
    _updateChildren() {
      const checkboxes = this.getRelationNodes('../checkbox/checkbox') || [];
      const checkboxButtons = this.getRelationNodes('../checkbox-button/checkbox-button') || [];
      const children = [...checkboxes, ...checkboxButtons];
      if (!children.length) return;
      const ctx = {
        size: this.data.size || this.data._formItemSize,
        disabled: this.data.disabled || this.data._formItemDisabled,
        currentValues: this.data.value || [],
        max: this.data.max,
      };
      children.forEach((child) => {
        child._setGroupContext(ctx);
      });
    },

    _handleChildChange(childValue, checked) {
      const values = (this.data.value || []).slice();
      if (checked) {
        if (this.data.max > 0 && values.length >= this.data.max) return;
        if (values.indexOf(childValue) === -1) {
          values.push(childValue);
        }
      } else {
        const idx = values.indexOf(childValue);
        if (idx >= 0) values.splice(idx, 1);
      }
      this.triggerEvent('update:value', { value: values });
      this._notifyChange();
    },
  },
});
