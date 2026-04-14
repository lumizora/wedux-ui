import {
  hsv2rgb,
  rgb2hsv,
  rgb2hsl,
  hsl2rgb,
  rgba as parseRgba,
  toHexString,
  toHexaString,
  roundChannel,
} from '../../libs/seemly.min';

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
    placeholder: { type: String, value: '请选择颜色' },
    disabled: { type: Boolean, value: false },
    readonly: { type: Boolean, value: false },
    size: { type: String, value: '' },
    status: { type: String, value: '' },
    clearable: { type: Boolean, value: false },
    showAlpha: { type: Boolean, value: false },
    modes: { type: Array, value: null },
    swatches: { type: Array, value: null },
  },

  data: {
    _visible: false,
    _h: 0,
    _s: 100,
    _v: 100,
    _a: 1,
    _displayText: '',
    _displayColor: '',
    _inputMode: 'hex',
    _paletteHue: 'background-color: hsl(0, 100%, 50%)',
    _handleX: 100,
    _handleY: 0,
    _hueX: 0,
    _alphaX: 100,
    _alphaGradient: '',
    _previewColor: 'rgb(255, 0, 0)',
    _hexVal: '#FF0000',
    _rVal: '255',
    _gVal: '0',
    _bVal: '0',
    _hslH: '0',
    _hslS: '100',
    _hslL: '50',
    _aVal: '100',
    _showModeToggle: true,
    _hasModes: true,
  },

  lifetimes: {
    attached() {
      const modes = this.data.modes || ['hex', 'rgb', 'hsl', 'hsv'];
      this.setData({
        _inputMode: modes[0] || 'hex',
        _showModeToggle: modes.length > 1,
        _hasModes: modes.length > 0,
      });
      this._syncFromValue();
    },
  },

  observers: {
    value() {
      this._syncFromValue();
    },
  },

  methods: {
    _syncFromValue() {
      const { value, showAlpha } = this.data;
      if (!value) {
        this.setData({ _displayText: '', _displayColor: '' });
        return;
      }
      let parsed;
      try {
        parsed = parseRgba(value);
      } catch (e) {
        return;
      }
      const [r, g, b, a] = parsed;
      const [h, s, v] = rgb2hsv(r, g, b);
      const alpha = showAlpha ? a : 1;
      this.setData({
        _h: Math.round(h),
        _s: Math.round(s),
        _v: Math.round(v),
        _a: alpha,
        _displayText: value,
        _displayColor: showAlpha ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`,
      });
      this._updateUI();
      // Overwrite round-tripped display values with exact parsed values
      const [hslH, hslS, hslL] = rgb2hsl(r, g, b).map(Math.round);
      const exactHex =
        showAlpha && alpha < 1 ? toHexaString([r, g, b, alpha]) : toHexString([r, g, b]);
      this.setData({
        _hexVal: exactHex,
        _rVal: String(r),
        _gVal: String(g),
        _bVal: String(b),
        _hslH: String(hslH),
        _hslS: String(hslS),
        _hslL: String(hslL),
        _previewColor: showAlpha ? `rgba(${r},${g},${b},${alpha})` : `rgb(${r},${g},${b})`,
      });
    },

    _updateUI() {
      const { _h, _s, _v, _a, showAlpha } = this.data;
      const [r, g, b] = hsv2rgb(_h, _s, _v).map(roundChannel);
      const [hslH, hslS, hslL] = rgb2hsl(r, g, b).map(Math.round);
      const hex = showAlpha && _a < 1 ? toHexaString([r, g, b, _a]) : toHexString([r, g, b]);

      this.setData({
        _paletteHue: `background-color: hsl(${_h}, 100%, 50%)`,
        _handleX: _s,
        _handleY: 100 - _v,
        _hueX: (_h / 360) * 100,
        _alphaX: _a * 100,
        _alphaGradient: `background: linear-gradient(to right, rgba(${r},${g},${b},0), rgb(${r},${g},${b}))`,
        _previewColor: showAlpha ? `rgba(${r},${g},${b},${_a})` : `rgb(${r},${g},${b})`,
        _hexVal: hex,
        _rVal: String(r),
        _gVal: String(g),
        _bVal: String(b),
        _hslH: String(hslH),
        _hslS: String(hslS),
        _hslL: String(hslL),
        _aVal: String(Math.round(_a * 100)),
      });
    },

    _getOutputValue() {
      const { _h, _s, _v, _a, showAlpha } = this.data;
      const [r, g, b] = hsv2rgb(_h, _s, _v).map(roundChannel);
      return showAlpha && _a < 1 ? toHexaString([r, g, b, _a]) : toHexString([r, g, b]);
    },

    handleTap() {
      if (this._isDisabled() || this.data.readonly) return;
      if (!this.data.value) {
        this.setData({ _h: 0, _s: 100, _v: 100, _a: 1 });
        this._updateUI();
      }
      this.setData({ _visible: true });
    },

    handleConfirm() {
      const val = this._getOutputValue();
      this.setData({ _visible: false, _displayText: val, _displayColor: this.data._previewColor });
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
      this.setData({ _displayText: '', _displayColor: '' });
      this._notifyChange();
    },

    // — Palette touch —
    handlePaletteTouchStart(e) {
      const query = this.createSelectorQuery();
      query.select('.w-color-picker__palette').boundingClientRect();
      query.exec((res) => {
        if (!res[0]) return;
        this._paletteRect = res[0];
        this._updatePaletteFromTouch(e.touches[0]);
      });
    },

    handlePaletteTouchMove(e) {
      if (!this._paletteRect) return;
      this._updatePaletteFromTouch(e.touches[0]);
    },

    _updatePaletteFromTouch(touch) {
      const rect = this._paletteRect;
      let x = (touch.pageX - rect.left) / rect.width;
      let y = (touch.pageY - rect.top) / rect.height;
      x = Math.max(0, Math.min(1, x));
      y = Math.max(0, Math.min(1, y));
      this.setData({
        _s: Math.round(x * 100),
        _v: Math.round((1 - y) * 100),
      });
      this._updateUI();
    },

    // — Hue touch —
    handleHueTouchStart(e) {
      const query = this.createSelectorQuery();
      query.select('.w-color-picker__hue').boundingClientRect();
      query.exec((res) => {
        if (!res[0]) return;
        this._hueRect = res[0];
        this._updateHueFromTouch(e.touches[0]);
      });
    },

    handleHueTouchMove(e) {
      if (!this._hueRect) return;
      this._updateHueFromTouch(e.touches[0]);
    },

    _updateHueFromTouch(touch) {
      const rect = this._hueRect;
      let x = (touch.pageX - rect.left) / rect.width;
      x = Math.max(0, Math.min(1, x));
      this.setData({ _h: Math.round(x * 360) });
      this._updateUI();
    },

    // — Alpha touch —
    handleAlphaTouchStart(e) {
      const query = this.createSelectorQuery();
      query.select('.w-color-picker__alpha').boundingClientRect();
      query.exec((res) => {
        if (!res[0]) return;
        this._alphaRect = res[0];
        this._updateAlphaFromTouch(e.touches[0]);
      });
    },

    handleAlphaTouchMove(e) {
      if (!this._alphaRect) return;
      this._updateAlphaFromTouch(e.touches[0]);
    },

    _updateAlphaFromTouch(touch) {
      const rect = this._alphaRect;
      let x = (touch.pageX - rect.left) / rect.width;
      x = Math.max(0, Math.min(1, x));
      this.setData({ _a: Math.round(x * 100) / 100 });
      this._updateUI();
    },

    // — Input handling —
    handleModeToggle() {
      const modes = this.data.modes || ['hex', 'rgb', 'hsl', 'hsv'];
      if (modes.length <= 1) return;
      const idx = modes.indexOf(this.data._inputMode);
      const next = modes[(idx + 1) % modes.length];
      this.setData({ _inputMode: next });
    },

    handleHexInput(e) {
      let hex = e.detail.value.trim();
      if (!hex.startsWith('#')) hex = `#${hex}`;
      let parsed;
      try {
        parsed = parseRgba(hex);
      } catch (err) {
        return;
      }
      const [r, g, b, a] = parsed;
      const [h, s, v] = rgb2hsv(r, g, b).map(Math.round);
      this.setData({ _h: h, _s: s, _v: v, _a: a });
      this._updateUI();
    },

    handleRgbInput(e) {
      const { channel } = e.currentTarget.dataset;
      const val = parseInt(e.detail.value, 10);
      if (isNaN(val)) return;
      const clamped = Math.max(0, Math.min(255, val));
      const r = channel === 'r' ? clamped : parseInt(this.data._rVal, 10);
      const g = channel === 'g' ? clamped : parseInt(this.data._gVal, 10);
      const b = channel === 'b' ? clamped : parseInt(this.data._bVal, 10);
      const [h, s, v] = rgb2hsv(r, g, b).map(Math.round);
      this.setData({ _h: h, _s: s, _v: v });
      this._updateUI();
    },

    handleHslInput(e) {
      const { channel } = e.currentTarget.dataset;
      const val = parseInt(e.detail.value, 10);
      if (isNaN(val)) return;
      let h = parseInt(this.data._hslH, 10);
      let s = parseInt(this.data._hslS, 10);
      let l = parseInt(this.data._hslL, 10);
      if (channel === 'h') h = Math.max(0, Math.min(360, val));
      if (channel === 's') s = Math.max(0, Math.min(100, val));
      if (channel === 'l') l = Math.max(0, Math.min(100, val));
      const [r, g, b] = hsl2rgb(h, s, l).map(roundChannel);
      const [hh, ss, vv] = rgb2hsv(r, g, b).map(Math.round);
      this.setData({ _h: hh, _s: ss, _v: vv });
      this._updateUI();
    },

    handleHsvInput(e) {
      const { channel } = e.currentTarget.dataset;
      const val = parseInt(e.detail.value, 10);
      if (isNaN(val)) return;
      let h = this.data._h;
      let s = this.data._s;
      let v = this.data._v;
      if (channel === 'h') h = Math.max(0, Math.min(360, val));
      if (channel === 's') s = Math.max(0, Math.min(100, val));
      if (channel === 'v') v = Math.max(0, Math.min(100, val));
      this.setData({ _h: h, _s: s, _v: v });
      this._updateUI();
    },

    handleAlphaInput(e) {
      const val = parseInt(e.detail.value, 10);
      if (isNaN(val)) return;
      this.setData({ _a: Math.max(0, Math.min(100, val)) / 100 });
      this._updateUI();
    },

    handleSwatchTap(e) {
      const color = e.currentTarget.dataset.color;
      let parsed;
      try {
        parsed = parseRgba(color);
      } catch (err) {
        return;
      }
      const [r, g, b, a] = parsed;
      const [h, s, v] = rgb2hsv(r, g, b).map(Math.round);
      this.setData({ _h: h, _s: s, _v: v, _a: a });
      this._updateUI();
    },
  },
});
