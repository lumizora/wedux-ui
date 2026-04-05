Component({
  properties: {
    price: {
      type: null,
      value: 0,
    },
    originalPrice: {
      type: null,
      value: '',
    },
    currency: {
      type: String,
      value: '¥',
    },
    decimal: {
      type: Number,
      value: 2,
    },
    size: {
      type: String,
      value: 'md',
    },
  },

  data: {
    _formattedPrice: '0.00',
    _formattedOriginal: '',
    _hasOriginal: false,
  },

  observers: {
    'price, originalPrice, decimal': function (price, originalPrice, decimal) {
      const decimals = Math.max(0, Math.floor(decimal));
      const formattedPrice = Number(price).toFixed(decimals);
      const hasOriginal =
        originalPrice !== '' && originalPrice !== undefined && originalPrice !== null;
      const formattedOriginal = hasOriginal ? Number(originalPrice).toFixed(decimals) : '';

      this.setData({
        _formattedPrice: formattedPrice,
        _formattedOriginal: formattedOriginal,
        _hasOriginal: hasOriginal,
      });
    },
  },
});
