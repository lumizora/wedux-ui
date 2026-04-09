Component({
  properties: {
    type: {
      type: String,
      value: 'default', // 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error'
    },
    size: {
      type: String,
      value: 'medium', // small | medium | large
    },
    closable: {
      type: Boolean,
      value: false,
    },
    disabled: {
      type: Boolean,
      value: false,
    },
    checkable: {
      type: Boolean,
      value: false,
    },
    checked: {
      type: Boolean,
      value: false,
    },
    round: {
      type: Boolean,
      value: false,
    },
    bordered: {
      type: Boolean,
      value: true,
    },
    strong: {
      type: Boolean,
      value: false,
    },
    color: {
      type: String,
      value: '',
    },
    textColor: {
      type: String,
      value: '',
    },
    borderColor: {
      type: String,
      value: '',
    },
  },

  data: {
    _style: '',
  },

  observers: {
    'color, textColor, borderColor'(color, textColor, borderColor) {
      const parts = [];
      if (color) {
        parts.push(`background-color: ${color}`);
      }
      if (textColor) {
        parts.push(`color: ${textColor}`);
      }
      if (borderColor) {
        parts.push(`border-color: ${borderColor}`);
      }
      this.setData({ _style: parts.join('; ') });
    },
  },

  methods: {
    handleTap() {
      if (this.data.disabled) return;
      if (this.data.checkable) {
        this.triggerEvent('update:checked', { checked: !this.data.checked });
      }
      this.triggerEvent('tap');
    },

    handleClose(e) {
      if (this.data.disabled) return;
      this.triggerEvent('close');
    },
  },
});
