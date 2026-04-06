Component({
  relations: {
    '../carousel-item/carousel-item': {
      type: 'descendant',
      linked: function () {
        this._onChildrenChange();
      },
      unlinked: function () {
        this._onChildrenChange();
      },
    },
  },

  properties: {
    current: {
      type: Number,
      value: -1,
    },
    defaultCurrent: {
      type: Number,
      value: 0,
    },
    effect: {
      type: String,
      value: 'slide',
    },
    direction: {
      type: String,
      value: 'horizontal',
    },
    loop: {
      type: Boolean,
      value: true,
    },
    autoplay: {
      type: Boolean,
      value: false,
    },
    interval: {
      type: Number,
      value: 5000,
    },
    duration: {
      type: Number,
      value: 300,
    },
    slidesPerView: {
      type: Number,
      value: 1,
    },
    spaceBetween: {
      type: Number,
      value: 0,
    },
    showDots: {
      type: Boolean,
      value: true,
    },
    dotType: {
      type: String,
      value: 'dot',
    },
    dotPlacement: {
      type: String,
      value: 'bottom',
    },
  },

  data: {
    _trackStyle: '',
    _dots: [],
    _total: 0,
  },

  observers: {
    current(val) {
      if (val >= 0) {
        this._goTo(val, true);
      }
    },
  },

  lifetimes: {
    ready() {
      this._internalIndex = this.data.defaultCurrent;
      this._containerWidth = 0;
      this._containerHeight = 0;
      this._slideSize = 0;
      this._isDragging = false;
      this._touchStartX = 0;
      this._touchStartY = 0;
      this._touchStartTime = 0;
      this._autoplayTimer = null;

      wx.nextTick(() => {
        this._measure();
      });
    },

    detached() {
      this._stopAutoplay();
    },
  },

  methods: {
    /* ── Relations ── */
    _getItems() {
      return this.getRelationNodes('../carousel-item/carousel-item') || [];
    },

    _onChildrenChange() {
      const items = this._getItems();
      const total = items.length;
      this._internalIndex = Math.min(this._internalIndex || 0, Math.max(0, total - 1));
      this._rebuildDots();
      if (this._slideSize > 0) {
        this._updateChildSizes();
        this._goTo(this._internalIndex, false);
      }
    },

    /* ── Measure ── */
    _measure() {
      const query = this.createSelectorQuery();
      query.select('.w-carousel').boundingClientRect();
      query.exec((res) => {
        if (!res[0]) return;
        const { width, height } = res[0];
        this._containerWidth = width;
        this._containerHeight = height;
        const { slidesPerView, spaceBetween, direction } = this.data;
        const containerSize = direction === 'horizontal' ? width : height;
        this._slideSize = (containerSize - (slidesPerView - 1) * spaceBetween) / slidesPerView;

        this._updateChildSizes();
        this._goTo(this._internalIndex, false);
        this._startAutoplay();
      });
    },

    /* ── Child size dispatch (slide effect only) ── */
    _updateChildSizes() {
      const items = this._getItems();
      const { effect, direction, spaceBetween } = this.data;
      if (effect !== 'slide') return;

      items.forEach((item) => {
        const sizeStyle =
          direction === 'horizontal'
            ? `width: ${this._slideSize}px; height: 100%; margin-right: ${spaceBetween}px;`
            : `width: 100%; height: ${this._slideSize}px; margin-bottom: ${spaceBetween}px;`;
        item._setState('active', sizeStyle);
      });
    },

    /* ── Dots ── */
    _rebuildDots() {
      const items = this._getItems();
      const total = items.length;
      const { slidesPerView } = this.data;
      const dotCount =
        slidesPerView <= 1 ? total : Math.max(0, total - Math.floor(slidesPerView) + 1);
      const displayIndex = this._internalIndex;
      const dots = Array.from({ length: dotCount }, (_, i) => ({
        active: i === displayIndex,
      }));
      this.setData({ _total: total, _dots: dots });
    },

    /* ── Go to index ── */
    _goTo(index, animate) {
      if (animate === undefined) animate = true;
      const items = this._getItems();
      const total = items.length;
      if (!total) return;

      let newIndex = index;
      let shouldAnimate = animate;

      if (this.data.loop) {
        newIndex = ((index % total) + total) % total;
        // loop jump across boundary: skip animation to avoid reverse sweep
        if (Math.abs(newIndex - this._internalIndex) > 1) {
          shouldAnimate = false;
        }
      } else {
        newIndex = Math.max(0, Math.min(index, total - 1));
      }

      const prev = this._internalIndex;
      this._internalIndex = newIndex;

      this._applyEffect(shouldAnimate);
      this._rebuildDots();

      if (prev !== newIndex) {
        this.triggerEvent('change', { current: newIndex, previous: prev });
      }
    },

    /* ── Apply visual effect ── */
    _applyEffect(animate) {
      const { effect, direction, spaceBetween, duration } = this.data;
      const dur = animate ? duration : 0;

      if (effect === 'slide') {
        const offset = this._internalIndex * (this._slideSize + spaceBetween);
        const transform =
          direction === 'horizontal' ? `translateX(${-offset}px)` : `translateY(${-offset}px)`;
        this.setData({
          _trackStyle: `transform: ${transform}; transition-duration: ${dur}ms;`,
        });
        return;
      }

      this._applyNonSlideEffect(dur);
    },

    _applyNonSlideEffect(dur) {
      const items = this._getItems();
      const total = items.length;
      const { effect, loop } = this.data;
      const cur = this._internalIndex;

      items.forEach((item, i) => {
        let state, style;
        const base = `width: 100%; height: 100%; position: absolute; top: 0; left: 0;`;

        if (effect === 'fade') {
          const isActive = i === cur;
          state = isActive ? 'active' : 'hidden';
          style = `${base} opacity: ${isActive ? 1 : 0}; transition: opacity ${dur}ms; z-index: ${isActive ? 1 : 0};`;
        } else {
          // card
          const diff = i - cur;
          const isPrev = diff === -1 || (loop && diff === total - 1);
          const isNext = diff === 1 || (loop && diff === -(total - 1));

          if (diff === 0) {
            state = 'active';
            style = `${base} transform: scale(1) translateX(0); opacity: 1; transition: all ${dur}ms; z-index: 1;`;
          } else if (isPrev) {
            state = 'prev';
            style = `${base} transform: scale(0.85) translateX(-70%); opacity: 0.7; transition: all ${dur}ms; z-index: 0;`;
          } else if (isNext) {
            state = 'next';
            style = `${base} transform: scale(0.85) translateX(70%); opacity: 0.7; transition: all ${dur}ms; z-index: 0;`;
          } else {
            state = 'hidden';
            style = `${base} opacity: 0; pointer-events: none; z-index: 0;`;
          }
        }

        item._setState(state, style);
      });
    },

    /* ── Touch handlers (slide only) ── */
    onTouchStart(e) {
      if (this.data.effect !== 'slide') return;
      this._stopAutoplay();
      this._isDragging = true;
      this._touchStartX = e.touches[0].clientX;
      this._touchStartY = e.touches[0].clientY;
      this._touchStartTime = Date.now();
      this._startTranslate = this._internalIndex * (this._slideSize + this.data.spaceBetween);
    },

    onTouchMove(e) {
      if (!this._isDragging) return;
      const { direction } = this.data;
      const dx = e.touches[0].clientX - this._touchStartX;
      const dy = e.touches[0].clientY - this._touchStartY;
      const delta = direction === 'horizontal' ? dx : dy;
      const offset = this._startTranslate - delta;
      const transform =
        direction === 'horizontal' ? `translateX(${-offset}px)` : `translateY(${-offset}px)`;
      this.setData({
        _trackStyle: `transform: ${transform}; transition-duration: 0ms;`,
      });
    },

    onTouchEnd(e) {
      if (!this._isDragging) return;
      this._isDragging = false;
      const { direction } = this.data;
      const dx = e.changedTouches[0].clientX - this._touchStartX;
      const dy = e.changedTouches[0].clientY - this._touchStartY;
      const delta = direction === 'horizontal' ? dx : dy;
      const containerSize =
        direction === 'horizontal' ? this._containerWidth : this._containerHeight;
      const timeElapsed = Date.now() - this._touchStartTime;
      const velocity = timeElapsed > 0 ? delta / timeElapsed : 0;

      if (delta < -containerSize * 0.3 || velocity < -0.4) {
        this._goTo(this._internalIndex + 1);
      } else if (delta > containerSize * 0.3 || velocity > 0.4) {
        this._goTo(this._internalIndex - 1);
      } else {
        this._goTo(this._internalIndex);
      }
      this._startAutoplay();
    },

    /* ── Card tap ── */
    _onItemTap(item) {
      if (this.data.effect !== 'card') return;
      const items = this._getItems();
      const idx = items.indexOf(item);
      if (idx !== -1 && idx !== this._internalIndex) {
        this._goTo(idx);
      }
    },

    /* ── Autoplay ── */
    _startAutoplay() {
      if (!this.data.autoplay) return;
      this._stopAutoplay();
      const items = this._getItems();
      if (items.length <= 1) return;
      this._autoplayTimer = setInterval(() => {
        this._goTo(this._internalIndex + 1);
      }, this.data.interval);
    },

    _stopAutoplay() {
      if (this._autoplayTimer) {
        clearInterval(this._autoplayTimer);
        this._autoplayTimer = null;
      }
    },

    /* ── Public methods ── */
    to(index) {
      this._goTo(index, true);
    },

    prev() {
      this._goTo(this._internalIndex - 1, true);
    },

    next() {
      this._goTo(this._internalIndex + 1, true);
    },

    getCurrentIndex() {
      return this._internalIndex;
    },
  },
});
