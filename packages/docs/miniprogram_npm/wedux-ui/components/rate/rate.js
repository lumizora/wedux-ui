const formField = require('../../behaviors/formField');

Component({
  behaviors: ['wx://form-field', formField],

  relations: {
    '../form-item/form-item': {
      type: 'ancestor',
    },
  },

  properties: {
    value: { type: Number, value: 0 },
    count: { type: Number, value: 5 },
    allowHalf: { type: Boolean, value: false },
    readonly: { type: Boolean, value: false },
    disabled: { type: Boolean, value: false },
    clearable: { type: Boolean, value: false },
    size: { type: String, value: '' },
    color: { type: String, value: '' },
  },

  data: {
    _stars: [],
    _activeStyle: '',
  },

  observers: {
    'value, count, allowHalf'(value, count) {
      const stars = [];
      for (let i = 0; i < count; i++) {
        const diff = value - i;
        let state = 'inactive';
        if (diff >= 1) {
          state = 'full';
        } else if (this.data.allowHalf && diff >= 0.5) {
          state = 'half';
        }
        stars.push({ index: i, state });
      }
      this.setData({ _stars: stars });
    },
    color(color) {
      this.setData({
        _activeStyle: color ? `color: ${color};` : '',
      });
    },
  },

  methods: {
    handleTap(e) {
      if (this.data.readonly || this._isDisabled()) return;
      const { index } = e.currentTarget.dataset;
      const { allowHalf, clearable, value } = this.data;

      let newValue;
      if (allowHalf) {
        // Use touch position to determine half or full
        const query = this.createSelectorQuery();
        query.select(`.w-rate__item-${index}`).boundingClientRect();
        query.exec((res) => {
          if (!res || !res[0]) return;
          const rect = res[0];
          const touch = e.detail || {};
          const x = (touch.x || 0) - rect.left;
          const isHalf = x < rect.width / 2;
          newValue = isHalf ? index + 0.5 : index + 1;

          if (clearable && newValue === value) {
            this._doUpdate(null);
          } else {
            this._doUpdate(newValue);
          }
        });
      } else {
        newValue = index + 1;
        if (clearable && newValue === value) {
          this._doUpdate(null);
        } else {
          this._doUpdate(newValue);
        }
      }
    },

    _doUpdate(val) {
      this.triggerEvent('update:value', { value: val });
      this._notifyChange();
    },
  },
});
