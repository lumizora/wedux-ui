Component({
  relations: {
    '../avatar-group/avatar-group': {
      type: 'ancestor',
      unlinked() {
        this.setData({ _groupSize: '', _groupRound: false, _groupOverlap: false });
      },
    },
  },

  properties: {
    size: {
      type: String,
      value: 'medium', // small | medium | large
    },
    src: {
      type: String,
      value: '',
    },
    round: {
      type: Boolean,
      value: false,
    },
    bordered: {
      type: Boolean,
      value: false,
    },
    color: {
      type: String,
      value: '',
    },
    fallbackSrc: {
      type: String,
      value: '',
    },
  },

  data: {
    _currentSrc: '',
    _imgError: false,
    _groupSize: '',
    _groupRound: false,
    _groupOverlap: false,
  },

  observers: {
    src(src) {
      this.setData({ _currentSrc: src, _imgError: false });
    },
  },

  methods: {
    handleImgError() {
      const fallbackSrc = this.data.fallbackSrc;
      if (fallbackSrc && this.data._currentSrc !== fallbackSrc) {
        this.setData({ _currentSrc: fallbackSrc });
      } else {
        this.setData({ _imgError: true });
      }
    },

    _setGroupContext(ctx) {
      this.setData({
        _groupSize: ctx.size || '',
        _groupRound: !!ctx.round,
        _groupOverlap: !!ctx.overlap,
      });
    },
  },
});
