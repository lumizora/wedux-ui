Component({
  properties: {
    value: {
      type: null,
      value: '',
    },
    max: {
      type: Number,
      value: 0,
    },
    dot: {
      type: Boolean,
      value: false,
    },
    type: {
      type: String,
      value: 'default',
    },
    show: {
      type: Boolean,
      value: true,
    },
    showZero: {
      type: Boolean,
      value: false,
    },
    processing: {
      type: Boolean,
      value: false,
    },
    color: {
      type: String,
      value: '',
    },
    offsetX: {
      type: Number,
      value: 0,
    },
    offsetY: {
      type: Number,
      value: 0,
    },
  },

  data: {
    _visible: false,
    _displayValue: '',
    _style: '',
  },

  observers: {
    'value, max, dot, show, showZero, color, offsetX, offsetY': function (
      value,
      max,
      dot,
      show,
      showZero,
      color,
      offsetX,
      offsetY,
    ) {
      // Visibility
      let visible = show;
      if (visible && !dot) {
        if (value === '' || value === null || value === undefined) {
          visible = false;
        } else if (!showZero && Number(value) === 0) {
          visible = false;
        }
      }

      // Display value
      let displayValue = '';
      if (!dot && visible) {
        const numVal = Number(value);
        if (max > 0 && !isNaN(numVal) && numVal > max) {
          displayValue = `${max}+`;
        } else {
          displayValue = String(value);
        }
      }

      // Style (custom color + offset)
      const parts = [];
      if (color) {
        parts.push(`--_bg: ${color}`);
        parts.push(`background-color: ${color}`);
      }
      if (offsetX || offsetY) {
        parts.push(`transform: translate(calc(50% + ${offsetX}rpx), calc(-50% + ${offsetY}rpx))`);
      }

      this.setData({
        _visible: visible,
        _displayValue: displayValue,
        _style: parts.join('; '),
      });
    },
  },
});
