Component({
  properties: {
    text: {
      type: String,
      value: '',
    },
    speed: {
      type: Number,
      value: 48,
    },
    autoFill: {
      type: Boolean,
      value: false,
    },
    pauseOnTap: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    _items: [0],
    _duration: 2,
    _play: 'paused',
    _containerStyle: '',
  },

  observers: {
    'text, speed, autoFill': function () {
      if (!this._ready) return;
      if (!this.data.text) return;
      wx.nextTick(() => {
        this._measure();
      });
    },
    '_duration, _play': function () {
      this._applyStyle();
    },
  },

  lifetimes: {
    ready() {
      this._ready = true;
      if (this.data.text) {
        this._measure();
      }
    },
  },

  methods: {
    _measure() {
      const query = this.createSelectorQuery();
      query.select('.w-marquee').boundingClientRect();
      query.select('.w-marquee__group').boundingClientRect();
      query.exec((res) => {
        if (!res[0] || !res[1]) return;
        const containerWidth = res[0].width;
        const groupWidth = res[1].width;
        if (groupWidth <= 0) return;

        if (this.data.autoFill && containerWidth > 0) {
          const repeatCount = Math.ceil(containerWidth / groupWidth) + 1;
          this.setData({ _items: Array.from({ length: repeatCount }, (_, i) => i) });
          wx.nextTick(() => {
            const q2 = this.createSelectorQuery();
            q2.select('.w-marquee__group').boundingClientRect();
            q2.exec((res2) => {
              if (!res2[0] || res2[0].width <= 0) return;
              this._setDuration(res2[0].width);
            });
          });
        } else {
          this._setDuration(groupWidth);
        }
      });
    },

    _setDuration(groupWidth) {
      const duration = groupWidth / this.data.speed;
      this.setData({ _duration: duration, _play: 'running' });
    },

    _applyStyle() {
      const { _duration, _play } = this.data;
      this.setData({
        _containerStyle: `--w-marquee-duration: ${_duration}s; --w-marquee-play: ${_play}`,
      });
    },

    onTap() {
      if (!this.data.pauseOnTap) return;
      const play = this.data._play === 'running' ? 'paused' : 'running';
      this.setData({ _play: play });
    },
  },
});
