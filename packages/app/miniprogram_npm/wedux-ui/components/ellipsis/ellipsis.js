Component({
  properties: {
    lineClamp: {
      type: Number,
      value: 1,
    },
    expandTrigger: {
      type: String,
      value: '', // '' | 'click'
    },
  },

  data: {
    _expanded: false,
    _style: '',
  },

  observers: {
    'lineClamp, _expanded'(lineClamp, expanded) {
      if (expanded) {
        this.setData({ _style: '' });
        return;
      }
      let style = '';
      if (lineClamp > 1) {
        style = `-webkit-line-clamp: ${lineClamp};`;
      }
      this.setData({ _style: style });
    },
  },

  methods: {
    onTap() {
      if (this.data.expandTrigger !== 'click') return;
      this.setData({ _expanded: !this.data._expanded });
    },
  },
});
