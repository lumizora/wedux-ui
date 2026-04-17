Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    src: {
      type: String,
      value: '',
    },
    mode: {
      type: String,
      value: 'aspectFill', // scaleToFill | aspectFit | aspectFill | widthFix | heightFix | ...
    },
    width: {
      type: String,
      value: '',
    },
    height: {
      type: String,
      value: '',
    },
    radius: {
      type: String,
      value: '',
    },
    round: {
      type: Boolean,
      value: false,
    },
    showLoading: {
      type: Boolean,
      value: true,
    },
    showError: {
      type: Boolean,
      value: true,
    },
    fade: {
      type: Boolean,
      value: true,
    },
    lazyLoad: {
      type: Boolean,
      value: false,
    },
    fallbackSrc: {
      type: String,
      value: '',
    },
    showMenuByLongpress: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    _status: 'loading', // loading | loaded | error
    _currentSrc: '',
    _containerStyle: '',
    _srcProp: '', // track last src prop value to avoid resetting on same value
  },

  observers: {
    src(src) {
      if (src === this.data._srcProp) return;
      this.setData({
        _srcProp: src,
        _currentSrc: src,
        _status: src ? 'loading' : 'error',
      });
    },
    'width, height, radius'(width, height, radius) {
      const parts = [];
      if (width) parts.push(`width: ${width}`);
      if (height) parts.push(`height: ${height}`);
      if (radius) parts.push(`border-radius: ${radius}`);
      this.setData({ _containerStyle: parts.join('; ') });
    },
  },

  methods: {
    handleLoad(e) {
      this.setData({ _status: 'loaded' });
      this.triggerEvent('load', e.detail);
    },

    handleError(e) {
      const { fallbackSrc, _currentSrc } = this.data;
      if (fallbackSrc && _currentSrc !== fallbackSrc) {
        this.setData({ _currentSrc: fallbackSrc });
      } else {
        this.setData({ _status: 'error' });
      }
      this.triggerEvent('error', e.detail);
    },
  },
});
