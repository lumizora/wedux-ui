Component({
  relations: {
    '../checkbox-group/checkbox-group': {
      type: 'ancestor',
    },
  },

  properties: {
    value: { type: null, value: '' },
    disabled: { type: Boolean, value: false },
    label: { type: String, value: '' },
    indeterminate: { type: Boolean, value: false },
  },

  data: {
    _groupSize: '',
    _groupDisabled: false,
    _checked: false,
    _maxReached: false,
  },

  methods: {
    _setGroupContext(ctx) {
      const checked = (ctx.currentValues || []).indexOf(this.data.value) >= 0;
      const maxReached = ctx.max > 0 && (ctx.currentValues || []).length >= ctx.max && !checked;
      this.setData({
        _groupSize: ctx.size || '',
        _groupDisabled: ctx.disabled || false,
        _checked: checked,
        _maxReached: maxReached,
      });
    },

    handleTap() {
      if (this.data.disabled || this.data._groupDisabled) return;
      if (this.data._maxReached && !this.data._checked) return;
      const parent = this.getRelationNodes('../checkbox-group/checkbox-group');
      if (parent && parent.length > 0) {
        parent[0]._handleChildChange(this.data.value, !this.data._checked);
      }
    },
  },
});
