const formField = require('../../behaviors/formField');

Component({
  behaviors: ['wx://form-field', formField],

  relations: {
    '../form-item/form-item': {
      type: 'ancestor',
    },
  },

  properties: {
    value: { type: null, value: null },
    options: { type: Array, value: [] },
    multiple: { type: Boolean, value: false },
    maxCount: { type: Number, value: 0 },
    clearable: { type: Boolean, value: false },
    disabled: { type: Boolean, value: false },
    readonly: { type: Boolean, value: false },
    placeholder: { type: String, value: '请选择' },
    size: { type: String, value: '' },
    status: { type: String, value: '' },
    title: { type: String, value: '' },
  },

  data: {
    _visible: false,
    _displayText: '',
    _pickerValue: [0],
    // Multiple mode
    _selectedValues: [],
    _selectedMap: {},
    _selectedTags: [],
  },

  lifetimes: {
    attached() {
      this._syncFromValue();
    },
  },

  observers: {
    'value, options'() {
      this._syncFromValue();
    },
  },

  methods: {
    _findLabel(val) {
      const { options } = this.data;
      for (const opt of options) {
        if (opt.value === val) return opt.label;
      }
      return String(val);
    },

    _findIndex(val) {
      const { options } = this.data;
      const idx = options.findIndex((opt) => opt.value === val);
      return idx >= 0 ? idx : 0;
    },

    _syncFromValue() {
      const { value, options, multiple } = this.data;
      if (!options || options.length === 0) {
        this.setData({
          _displayText: '',
          _pickerValue: [0],
          _selectedValues: [],
          _selectedMap: {},
          _selectedTags: [],
        });
        return;
      }

      if (multiple) {
        const arr = Array.isArray(value) ? value : [];
        const tags = arr
          .map((v) => {
            const opt = options.find((o) => o.value === v);
            return opt ? { label: opt.label, value: opt.value } : null;
          })
          .filter(Boolean);
        const map = {};
        arr.forEach((v) => {
          map[v] = true;
        });
        this.setData({ _selectedValues: arr, _selectedMap: map, _selectedTags: tags });
      } else {
        if (value === null || value === undefined || value === '') {
          this.setData({ _displayText: '', _pickerValue: [0] });
        } else {
          const label = this._findLabel(value);
          const idx = this._findIndex(value);
          this.setData({ _displayText: label, _pickerValue: [idx] });
        }
      }
    },

    handleTap() {
      if (this._isDisabled() || this.data.readonly) return;

      const { value, options, multiple } = this.data;

      if (multiple) {
        const arr = Array.isArray(value) ? [...value] : [];
        const map = {};
        arr.forEach((v) => {
          map[v] = true;
        });
        this.setData({ _visible: true, _selectedValues: arr, _selectedMap: map });
      } else {
        const idx =
          value !== null && value !== undefined && value !== '' ? this._findIndex(value) : 0;
        this.setData({ _visible: true, _pickerValue: [idx] });
      }

      this.triggerEvent('open');
    },

    handlePickerChange(e) {
      this.setData({ _pickerValue: e.detail.value });
    },

    handleOptionTap(e) {
      const val = e.currentTarget.dataset.value;
      const { _selectedValues, maxCount } = this.data;
      const arr = [..._selectedValues];
      const idx = arr.indexOf(val);

      if (idx >= 0) {
        arr.splice(idx, 1);
      } else {
        if (maxCount > 0 && arr.length >= maxCount) return;
        arr.push(val);
      }

      const map = {};
      arr.forEach((v) => {
        map[v] = true;
      });
      this.setData({ _selectedValues: arr, _selectedMap: map });
    },

    handleConfirm() {
      const { multiple, options, _pickerValue, _selectedValues } = this.data;

      this.setData({ _visible: false });

      if (multiple) {
        const tags = _selectedValues
          .map((v) => {
            const opt = options.find((o) => o.value === v);
            return opt ? { label: opt.label, value: opt.value } : null;
          })
          .filter(Boolean);
        this.setData({ _selectedTags: tags });
        this.triggerEvent('update:value', { value: [..._selectedValues] });
      } else {
        const idx = _pickerValue[0] || 0;
        const selected = options[idx];
        if (selected) {
          this.triggerEvent('update:value', { value: selected.value });
        }
      }

      this._notifyChange();
      this.triggerEvent('close');
    },

    handleCancel() {
      this.setData({ _visible: false });
      this.triggerEvent('close');
    },

    handleClear() {
      const { multiple } = this.data;
      const emptyVal = multiple ? [] : '';
      this.triggerEvent('update:value', { value: emptyVal });
      this.triggerEvent('clear');
      this._notifyChange();
    },

    handleTriggerClear() {
      const { multiple } = this.data;
      const emptyVal = multiple ? [] : '';
      this.triggerEvent('update:value', { value: emptyVal });
      this.triggerEvent('clear');
      this._notifyChange();
    },

    handleTagRemove(e) {
      if (this._isDisabled() || this.data.readonly) return;
      const val = e.currentTarget.dataset.value;
      const { value } = this.data;
      const arr = Array.isArray(value) ? value.filter((v) => v !== val) : [];
      this.triggerEvent('update:value', { value: arr });
      this._notifyChange();
    },
  },
});
