Component({
  relations: {
    '../radio-group/radio-group': {
      type: 'ancestor',
    },
  },

  properties: {
    value: { type: null, value: '' },
    disabled: { type: Boolean, value: false },
    label: { type: String, value: '' },
    round: { type: Boolean, value: false },
  },

  data: {
    _groupSize: '',
    _groupDisabled: false,
    _checked: false,
  },

  methods: {
    _setGroupContext(ctx) {
      this.setData({
        _groupSize: ctx.size || '',
        _groupDisabled: ctx.disabled || false,
        _checked: ctx.currentValue === this.data.value,
      });
    },

    handleTap() {
      if (this.data.disabled || this.data._groupDisabled) return;
      if (this.data._checked) return;
      const parent = this.getRelationNodes('../radio-group/radio-group');
      if (parent && parent.length > 0) {
        parent[0]._handleChildChange(this.data.value);
      }
    },
  },
});
