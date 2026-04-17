const pad = (n) => String(n).padStart(2, '0');

const formField = require('../../behaviors/formField');

Component({
  behaviors: ['wx://form-field', formField],

  relations: {
    '../form-item/form-item': {
      type: 'ancestor',
    },
  },

  properties: {
    value: { type: String, value: '' },
    placeholder: { type: String, value: '请选择时间' },
    disabled: { type: Boolean, value: false },
    readonly: { type: Boolean, value: false },
    size: { type: String, value: '' },
    status: { type: String, value: '' },
    clearable: { type: Boolean, value: false },
    format: { type: String, value: 'HH:mm:ss' },
    hourStep: { type: Number, value: 1 },
    minuteStep: { type: Number, value: 1 },
    secondStep: { type: Number, value: 1 },
  },

  data: {
    _visible: false,
    _hours: [],
    _minutes: [],
    _seconds: [],
    _pickerValue: [0, 0, 0],
    _displayText: '',
    _showSeconds: true,
  },

  lifetimes: {
    attached() {
      this._buildColumns();
      this._syncFromValue();
    },
  },

  observers: {
    value() {
      this._syncFromValue();
    },
    format(fmt) {
      this.setData({ _showSeconds: fmt.includes('ss') });
    },
    'hourStep, minuteStep, secondStep'() {
      this._buildColumns();
      this._syncFromValue();
    },
  },

  methods: {
    _buildColumns() {
      const { hourStep, minuteStep, secondStep, format: fmt } = this.data;
      const hours = [];
      const minutes = [];
      const seconds = [];
      for (let i = 0; i < 24; i += hourStep) hours.push(pad(i));
      for (let i = 0; i < 60; i += minuteStep) minutes.push(pad(i));
      for (let i = 0; i < 60; i += secondStep) seconds.push(pad(i));
      this.setData({
        _hours: hours,
        _minutes: minutes,
        _seconds: seconds,
        _showSeconds: fmt.includes('ss'),
      });
    },

    _findIndex(arr, val) {
      const padded = pad(val);
      const idx = arr.indexOf(padded);
      if (idx >= 0) return idx;
      for (let i = 0; i < arr.length; i++) {
        if (parseInt(arr[i], 10) >= val) return i;
      }
      return 0;
    },

    _syncFromValue() {
      const { value, _hours, _minutes, _seconds } = this.data;
      if (!_hours.length) return;
      const parts = (value || '').split(':').map(Number);
      const hours = parts[0] || 0;
      const minutes = parts[1] || 0;
      const seconds = parts[2] || 0;
      this.setData({
        _pickerValue: [
          this._findIndex(_hours, hours),
          this._findIndex(_minutes, minutes),
          this._findIndex(_seconds, seconds),
        ],
        _displayText: value || '',
      });
    },

    handleTap() {
      if (this._isDisabled() || this.data.readonly) return;
      this._syncFromValue();
      this.setData({ _visible: true });
    },

    handlePickerChange(e) {
      this.setData({ _pickerValue: e.detail.value });
    },

    handleConfirm() {
      const { _pickerValue, _hours, _minutes, _seconds, _showSeconds } = this.data;
      const h = _hours[_pickerValue[0]] || '00';
      const m = _minutes[_pickerValue[1]] || '00';
      const s = _seconds[_pickerValue[2]] || '00';
      const val = _showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
      this.setData({ _visible: false, _displayText: val });
      this.triggerEvent('update:value', { value: val });
      this.triggerEvent('confirm', { value: val });
      this._notifyChange();
    },

    handleCancel() {
      this.setData({ _visible: false });
      this._syncFromValue();
    },

    handleClear(e) {
      this.triggerEvent('update:value', { value: '' });
      this.triggerEvent('clear');
      this.setData({ _displayText: '' });
      this._notifyChange();
    },
  },
});
