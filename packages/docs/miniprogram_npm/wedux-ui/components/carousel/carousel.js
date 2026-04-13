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
      this._boundaryItemIndices = [];
      this._boundaryPrepared = false;

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
      const maxIndex = Math.max(0, this._getPageCount(total) - 1);
      this._internalIndex = Math.min(this._internalIndex || 0, maxIndex);
      this._rebuildDots();
      if (this._slideSize > 0) {
        this._updateChildSizes();
        this._goTo(this._internalIndex, false);
      }
    },

    _getPageCount(total) {
      const spv = Math.floor(this.data.slidesPerView);
      if (this.data.effect === 'slide' && spv > 1) {
        return Math.max(1, total - spv + 1);
      }
      return total;
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

      const pageCount = this._getPageCount(total);
      let newIndex = index;

      if (this.data.loop) {
        newIndex = ((index % pageCount) + pageCount) % pageCount;
      } else {
        newIndex = Math.max(0, Math.min(index, pageCount - 1));
      }

      const prev = this._internalIndex;
      this._internalIndex = newIndex;

      // slide + loop 边界过渡：无缝动画而非瞬移
      if (this.data.loop && this.data.effect === 'slide' && animate && pageCount > 1) {
        const isForwardLoop = prev === pageCount - 1 && newIndex === 0;
        const isBackwardLoop = prev === 0 && newIndex === pageCount - 1;

        if (isForwardLoop || isBackwardLoop) {
          this._slideLoopTransition(prev, newIndex, isForwardLoop);
          this._rebuildDots();
          if (prev !== newIndex) {
            this.triggerEvent('change', { current: newIndex, previous: prev });
          }
          return;
        }
      }

      // 非边界过渡，清理拖拽时预置的 boundary items
      if (this._boundaryItemIndices && this._boundaryItemIndices.length > 0) {
        this._boundaryItemIndices = [];
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
      const spv = Math.max(1, Math.floor(this.data.slidesPerView));
      const step = this._slideSize + spaceBetween;
      const isH = direction === 'horizontal';
      const axis = isH ? 'X' : 'Y';
      const sizeStyle = this._getItemSizeStyle();
      // 需要克隆的边界 item 数：满足视窗填充，同时避免与当前可见区域重叠
      const cloneCount = Math.max(1, Math.min(spv, total - spv));

      this._boundaryItemIndices = [];

      // 边界 item 的克隆定位（子组件 setData）与 track 过渡启动（父组件 setData）
      // 必须在同一渲染帧落地，否则 track 动画先跑、item 还没就位，
      // 视窗扫过空白区域会表现为"某一页慢慢加载出来"的闪烁。
      // 用 groupSetData 强制跨组件渲染同步。
      this.groupSetData(() => {
        if (isForward) {
          // 最后页→第一页：把 items[0..cloneCount-1] 移到最后一张后面
          for (let i = 0; i < cloneCount; i++) {
            items[i]._setState(
              'active',
              `${sizeStyle} transform: translate${axis}(${total * step}px);`,
            );
            this._boundaryItemIndices.push(i);
          }
          // track 向前滑动 cloneCount 格
          const offset = (fromIndex + cloneCount) * step;
          const transform = isH ? `translateX(${-offset}px)` : `translateY(${-offset}px)`;
          this.setData({
            _trackStyle: `transform: ${transform}; transition: transform ${duration}ms ease;`,
          });
        } else {
          // 第一页→最后页：把 items[total-cloneCount..total-1] 移到第一张前面
          for (let i = 0; i < cloneCount; i++) {
            const idx = total - cloneCount + i;
            items[idx]._setState(
              'active',
              `${sizeStyle} transform: translate${axis}(${-total * step}px);`,
            );
            this._boundaryItemIndices.push(idx);
          }
          // track 向后滑动 cloneCount 格
          const offset = -cloneCount * step;
          const transform = isH ? `translateX(${-offset}px)` : `translateY(${-offset}px)`;
          this.setData({
            _trackStyle: `transform: ${transform}; transition: transform ${duration}ms ease;`,
          });
        }
      });

      // 动画结束后复位所有 item 和 track —— 同样需要跨组件同步，
      // 否则会出现"item 已复位但 track 还停在 cloneCount 偏移"或反之的一帧错位
      this._loopResetTimer = setTimeout(() => {
        this._loopResetTimer = null;
        this.groupSetData(() => {
          this._updateChildSizes();
          this._applyEffect(false);
        });
      }, duration + 20);
    },

    /**
     * 按滑动方向预置边界 item，使跟手拖动时能看到下一张
     * @param {'forward'|'backward'} swipeDir
     *   forward: 向后（下一页，手指左移），backward: 向前（上一页，手指右移）
     */
    _prepareBoundarySlide(swipeDir) {
      const items = this._getItems();
      const total = items.length;
      const spv = Math.max(1, Math.floor(this.data.slidesPerView));
      const pageCount = this._getPageCount(total);
      if (pageCount <= 1) return;

      const cur = this._internalIndex;
      // 只在边界处且方向匹配时才需要预置，否则 item 都在自然位置，直接可见
      if (swipeDir === 'backward' && cur !== 0) return;
      if (swipeDir === 'forward' && cur !== pageCount - 1) return;

      const { direction, spaceBetween } = this.data;
      const step = this._slideSize + spaceBetween;
      const isH = direction === 'horizontal';
      const axis = isH ? 'X' : 'Y';
      const sizeStyle = this._getItemSizeStyle();
      const cloneCount = Math.max(1, Math.min(spv, total - spv));

      this._boundaryItemIndices = [];

      if (swipeDir === 'backward') {
        // 手指右移（回到最后页）→ 把末尾 cloneCount 张移到第一张前面
        for (let i = 0; i < cloneCount; i++) {
          const idx = total - cloneCount + i;
          items[idx]._setState(
            'active',
            `${sizeStyle} transform: translate${axis}(${-total * step}px);`,
          );
          this._boundaryItemIndices.push(idx);
        }
      } else {
        // 手指左移（到第一页）→ 把开头 cloneCount 张移到最后一张后面
        for (let i = 0; i < cloneCount; i++) {
          items[i]._setState(
            'active',
            `${sizeStyle} transform: translate${axis}(${total * step}px);`,
          );
          this._boundaryItemIndices.push(i);
        }
      }
    },

    /* ── Touch handlers ── */
    onTouchStart(e) {
      this._stopAutoplay();
      // 清除待执行的 loop 复位
      if (this._loopResetTimer) {
        clearTimeout(this._loopResetTimer);
        this._loopResetTimer = null;
        // item 复位和 track 复位必须同帧渲染，避免一帧错位
        this.groupSetData(() => {
          this._updateChildSizes();
          this._applyEffect(false);
        });
      }

      this._drag.start(e.touches[0]);
      if (this.data.effect === 'slide') {
        this._startTranslate = this._internalIndex * (this._slideSize + this.data.spaceBetween);
        // 边界预置推迟到 onTouchMove 首帧检测方向后再执行，
        // 避免在用户实际滑动方向未知时提前移动可见 item
        this._boundaryPrepared = false;
      }
    },

    onTouchMove(e) {
      if (!this._drag.isActive()) return;
      const { effect, direction, loop } = this.data;
      const touch = e.touches[0];

      if (effect === 'slide') {
        const delta = this._drag.delta(touch, direction);
        const offset = this._startTranslate - delta;
        const transform =
          direction === 'horizontal' ? `translateX(${-offset}px)` : `translateY(${-offset}px)`;
        const trackStyle = `transform: ${transform}; transition: none;`;

        // 首帧检测滑动方向：仅在边界处按实际方向预置 item，
        // 与当前帧 track offset 在同一渲染帧生效，避免提前错误移动可见 item
        if (loop && !this._boundaryPrepared) {
          this._boundaryPrepared = true;
          // delta > 0: 手指右移 = 向前（上一页），delta < 0: 左移 = 向后（下一页）
          const swipeDir = delta > 0 ? 'backward' : 'forward';
          this.groupSetData(() => {
            this._prepareBoundarySlide(swipeDir);
            this.setData({ _trackStyle: trackStyle });
          });
          return;
        }

        this.setData({ _trackStyle: trackStyle });
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
