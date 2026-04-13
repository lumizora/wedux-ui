Component({
  properties: {
    vertical: {
      type: Boolean,
      value: false,
    },
    dashed: {
      type: Boolean,
      value: false,
    },
    titlePlacement: {
      type: String,
      value: 'center', // left | center | right
    },
    title: {
      type: String,
      value: '',
    },
    customTitle: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    _hasTitle: false,
  },

  observers: {
    'title, customTitle'(title, customTitle) {
      this.setData({ _hasTitle: !!title || customTitle });
    },
  },
});
