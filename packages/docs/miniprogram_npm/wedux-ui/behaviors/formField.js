// src/behaviors/formField.js
module.exports = Behavior({
  data: {
    _formItemSize: '',
    _formItemDisabled: false,
  },

  methods: {
    _setFormItemContext(ctx) {
      this.setData({
        _formItemSize: ctx.size || '',
        _formItemDisabled: ctx.disabled || false,
      });
    },

    _getFormItem() {
      const nodes = this.getRelationNodes('../form-item/form-item');
      return nodes && nodes.length > 0 ? nodes[0] : null;
    },

    _notifyChange() {
      const formItem = this._getFormItem();
      if (formItem) formItem._handleFieldChange();
    },

    _notifyBlur() {
      const formItem = this._getFormItem();
      if (formItem) formItem._handleFieldBlur();
    },

    _isDisabled() {
      return this.data.disabled || this.data._formItemDisabled;
    },
  },
});
