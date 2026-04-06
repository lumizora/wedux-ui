const { createDrag } = require('../../utils/drag');

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
    current: function (val) {
      if (val >= 0) {
        this._goTo(val, true);
      }
    },
  },

  lifetimes: {
    created() {
      this._internalIndex = this.data.defaultCurrent;
      this._drag = createDrag();
    },

    ready() {
      this._containerWidth = 0;
      this._containerHeight = 0;
      this._slideSize = 0;
      this._autoplayTimer = null;
      this._loopResetTimer = null;
      this._boundaryItemIndex = -1;

      wx.nextTick(() => {
        this._measure();
      });
    },

    detached() {
      this._stopAutoplay();
      if (this._loopResetTimer) {
        clearTimeout(this._loopResetTimer);
        this._loopResetTimer = null;
      }
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

      // 清除待执行的 loop 复位，立即复位
      if (this._loopResetTimer) {
        clearTimeout(this._loopResetTimer);
        this._loopResetTimer = null;
        this._updateChildSizes();
      }

      let newIndex = index;

      if (this.data.loop) {
        newIndex = ((index % total) + total) % total;
      } else {
        newIndex = Math.max(0, Math.min(index, total - 1));
      }

      const prev = this._internalIndex;
      this._internalIndex = newIndex;

      // slide + loop 边界过渡：无缝动画而非瞬移
      if (
        this.data.loop &&
        this.data.effect === 'slide' &&
        animate &&
        total > 1 &&
        this.data.slidesPerView <= 1
      ) {
        const isForwardLoop = prev === total - 1 && newIndex === 0;
        const isBackwardLoop = prev === 0 && newIndex === total - 1;

        if (isForwardLoop || isBackwardLoop) {
          this._slideLoopTransition(prev, newIndex, isForwardLoop);
          this._rebuildDots();
          if (prev !== newIndex) {
            this.triggerEvent('change', { current: newIndex, previous: prev });
          }
          return;
        }
      }

      // 非边界过渡，清理拖拽时预置的 boundary item
      if (this._boundaryItemIndex >= 0) {
        this._boundaryItemIndex = -1;
        if (animate) {
          this._loopResetTimer = setTimeout(() => {
            this._loopResetTimer = null;
            this._updateChildSizes();
          }, this.data.duration + 20);
        } else {
          this._updateChildSizes();
        }
      }

      this._applyEffect(animate);
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
          _trackStyle: `transform: ${transform}; transition: transform ${dur}ms ease;`,
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
          const cardBase = `${base} border-radius: var(--w-carousel-card-radius); overflow: hidden;`;
          const diff = i - cur;
          const isPrev = diff === -1 || (loop && diff === total - 1);
          const isNext = diff === 1 || (loop && diff === -(total - 1));

          if (diff === 0) {
            state = 'active';
            style = `${cardBase} transform: scale(1) translateX(0); opacity: 1; transition: transform ${dur}ms ease, opacity ${dur}ms ease; z-index: 1;`;
          } else if (isPrev) {
            state = 'prev';
            style = `${cardBase} transform: scale(0.85) translateX(-70%); opacity: 0.7; transition: transform ${dur}ms ease, opacity ${dur}ms ease; z-index: 0;`;
          } else if (isNext) {
            state = 'next';
            style = `${cardBase} transform: scale(0.85) translateX(70%); opacity: 0.7; transition: transform ${dur}ms ease, opacity ${dur}ms ease; z-index: 0;`;
          } else {
            state = 'hidden';
            style = `${cardBase} opacity: 0; pointer-events: none; z-index: 0;`;
          }
        }

        item._setState(state, style);
      });
    },

    /* ── Slide loop 无缝过渡 ── */
    _getItemSizeStyle() {
      const { direction, spaceBetween } = this.data;
      return direction === 'horizontal'
        ? `width: ${this._slideSize}px; height: 100%; margin-right: ${spaceBetween}px;`
        : `width: 100%; height: ${this._slideSize}px; margin-bottom: ${spaceBetween}px;`;
    },

    _slideLoopTransition(fromIndex, toIndex, isForward) {
      const items = this._getItems();
      const total = items.length;
      const { direction, spaceBetween, duration } = this.data;
      const step = this._slideSize + spaceBetween;
      const isH = direction === 'horizontal';
      const axis = isH ? 'X' : 'Y';
      const sizeStyle = this._getItemSizeStyle();

      this._boundaryItemIndex = -1;

      if (isForward) {
        // 最后→第一：把 item[0] 移到最后一张后面
        items[toIndex]._setState(
          'active',
          `${sizeStyle} transform: translate${axis}(${total * step}px);`,
        );
        // track 向前滑动一格到 item[0] 的临时位置
        const offset = total * step;
        const transform = isH ? `translateX(${-offset}px)` : `translateY(${-offset}px)`;
        this.setData({
          _trackStyle: `transform: ${transform}; transition: transform ${duration}ms ease;`,
        });
      } else {
        // 第一→最后：把 item[last] 移到第一张前面
        items[toIndex]._setState(
          'active',
          `${sizeStyle} transform: translate${axis}(${-total * step}px);`,
        );
        // track 向后滑动一格
        const offset = -step;
        const transform = isH ? `translateX(${-offset}px)` : `translateY(${-offset}px)`;
        this.setData({
          _trackStyle: `transform: ${transform}; transition: transform ${duration}ms ease;`,
        });
      }

      // 动画结束后复位所有 item 和 track
      this._loopResetTimer = setTimeout(() => {
        this._loopResetTimer = null;
        this._updateChildSizes();
        this._applyEffect(false);
      }, duration + 20);
    },

    /**
     * 拖拽前预置边界 item，使跟手拖动时能看到下一张
     */
    _prepareBoundarySlide() {
      const items = this._getItems();
      const total = items.length;
      if (total <= 1) return;

      const cur = this._internalIndex;
      const { direction, spaceBetween } = this.data;
      const step = this._slideSize + spaceBetween;
      const isH = direction === 'horizontal';
      const axis = isH ? 'X' : 'Y';
      const sizeStyle = this._getItemSizeStyle();

      this._boundaryItemIndex = -1;

      if (cur === 0) {
        // 可能向前滑（回到最后）→ 把最后一张移到第一张前面
        items[total - 1]._setState(
          'active',
          `${sizeStyle} transform: translate${axis}(${-total * step}px);`,
        );
        this._boundaryItemIndex = total - 1;
      } else if (cur === total - 1) {
        // 可能向后滑（到第一张）→ 把第一张移到最后一张后面
        items[0]._setState(
          'active',
          `${sizeStyle} transform: translate${axis}(${total * step}px);`,
        );
        this._boundaryItemIndex = 0;
      }
    },

    /* ── Touch handlers ── */
    onTouchStart(e) {
      this._stopAutoplay();
      // 清除待执行的 loop 复位
      if (this._loopResetTimer) {
        clearTimeout(this._loopResetTimer);
        this._loopResetTimer = null;
        this._updateChildSizes();
        this._applyEffect(false);
      }

      this._drag.start(e.touches[0]);
      if (this.data.effect === 'slide') {
        this._startTranslate = this._internalIndex * (this._slideSize + this.data.spaceBetween);
        // loop 模式下预置边界 item，使跟手拖动无缝
        if (this.data.loop && this.data.slidesPerView <= 1) {
          this._prepareBoundarySlide();
        }
      }
    },

    onTouchMove(e) {
      if (!this._drag.isActive()) return;
      const { effect, direction } = this.data;
      const touch = e.touches[0];

      if (effect === 'slide') {
        const delta = this._drag.delta(touch, direction);
        const offset = this._startTranslate - delta;
        const transform =
          direction === 'horizontal' ? `translateX(${-offset}px)` : `translateY(${-offset}px)`;
        this.setData({ _trackStyle: `transform: ${transform}; transition: none;` });
      } else {
        const containerSize =
          direction === 'horizontal' ? this._containerWidth : this._containerHeight;
        const progress = this._drag.progress(touch, direction, containerSize);
        if (effect === 'fade') {
          this._applyFadeDrag(progress);
        } else {
          this._applyCardDrag(progress);
        }
      }
    },

    onTouchEnd(e) {
      const { direction } = this.data;
      const containerSize =
        direction === 'horizontal' ? this._containerWidth : this._containerHeight;
      const result = this._drag.end(e.changedTouches[0], direction, containerSize);
      if (!result) return;

      if (result.swipe === 1) {
        this._goTo(this._internalIndex + 1);
      } else if (result.swipe === -1) {
        this._goTo(this._internalIndex - 1);
      } else {
        this._goTo(this._internalIndex);
      }
      this._startAutoplay();
    },

    /* ── Fade 跟手拖动 ── */
    _applyFadeDrag(progress) {
      const items = this._getItems();
      const total = items.length;
      const cur = this._internalIndex;
      const { loop } = this.data;
      const absP = Math.abs(progress);

      let targetIndex;
      if (progress > 0) {
        targetIndex = loop ? (cur + 1) % total : Math.min(cur + 1, total - 1);
      } else {
        targetIndex = loop ? (cur - 1 + total) % total : Math.max(cur - 1, 0);
      }

      const base = 'width: 100%; height: 100%; position: absolute; top: 0; left: 0;';
      items.forEach((item, i) => {
        let opacity, zIndex;
        if (i === cur) {
          opacity = 1 - absP;
          zIndex = 1;
        } else if (i === targetIndex && targetIndex !== cur) {
          opacity = absP;
          zIndex = 1;
        } else {
          opacity = 0;
          zIndex = 0;
        }
        item._setState(
          i === cur ? 'active' : 'hidden',
          `${base} opacity: ${opacity}; z-index: ${zIndex}; transition: none;`,
        );
      });
    },

    /* ── Card 跟手拖动 ── */
    _applyCardDrag(progress) {
      const items = this._getItems();
      const total = items.length;
      const cur = this._internalIndex;
      const { loop } = this.data;
      const absP = Math.abs(progress);

      const prevIndex = loop ? (cur - 1 + total) % total : cur - 1;
      const nextIndex = loop ? (cur + 1) % total : cur + 1;

      const base =
        'width: 100%; height: 100%; position: absolute; top: 0; left: 0; border-radius: var(--w-carousel-card-radius); overflow: hidden;';
      items.forEach((item, i) => {
        let style;
        if (i === cur) {
          const tx = -progress * 70;
          const scale = 1 - absP * 0.15;
          const opacity = 1 - absP * 0.3;
          style = `${base} transform: scale(${scale}) translateX(${tx}%); opacity: ${opacity}; z-index: 1; transition: none;`;
        } else if (i === prevIndex && prevIndex >= 0) {
          const tx = progress < 0 ? -70 + absP * 70 : -70;
          const scale = progress < 0 ? 0.85 + absP * 0.15 : 0.85;
          const opacity = progress < 0 ? 0.7 + absP * 0.3 : 0.7;
          style = `${base} transform: scale(${scale}) translateX(${tx}%); opacity: ${opacity}; z-index: 0; transition: none;`;
        } else if (i === nextIndex && nextIndex < total) {
          const tx = progress > 0 ? 70 - absP * 70 : 70;
          const scale = progress > 0 ? 0.85 + absP * 0.15 : 0.85;
          const opacity = progress > 0 ? 0.7 + absP * 0.3 : 0.7;
          style = `${base} transform: scale(${scale}) translateX(${tx}%); opacity: ${opacity}; z-index: 0; transition: none;`;
        } else {
          style = `${base} opacity: 0; pointer-events: none; z-index: 0;`;
        }
        item._setState(i === cur ? 'active' : 'other', style);
      });
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
