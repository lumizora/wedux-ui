# Carousel 组件实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 `w-carousel` + `w-carousel-item` 轮播组件，支持 slide/fade/card 三种效果、水平/垂直方向、触摸手势、自动播放、loop、dots 指示点。

**Architecture:** 父子组件模式，`w-carousel` 通过 `relations` API 收集 `w-carousel-item` 子组件，由父组件统一驱动所有子项的样式状态。Slide 效果用 CSS `translateX/Y` + track 平移；fade/card 效果用 `position: absolute` 叠层 + 透明度/缩放。

**Tech Stack:** 微信小程序原生框架（WXML/WXSS/JS），SCSS，无外部依赖。

---

## 文件清单

| 操作 | 路径 | 职责 |
|---|---|---|
| Create | `src/components/carousel-item/carousel-item.js` | 子组件逻辑，接收父组件下发的 state/style |
| Create | `src/components/carousel-item/carousel-item.wxml` | 子组件模板，slot 容器 |
| Create | `src/components/carousel-item/carousel-item.scss` | 子组件基础样式 |
| Create | `src/components/carousel-item/carousel-item.json` | 组件声明 + relations |
| Create | `src/components/carousel/carousel.js` | 父组件逻辑：relations、量测、切换、触摸、自动播放 |
| Create | `src/components/carousel/carousel.wxml` | 父组件模板：track / slides / dots |
| Create | `src/components/carousel/carousel.scss` | 父组件样式：布局、dots、效果类 |
| Create | `src/components/carousel/carousel.json` | 组件声明 |
| Modify | `src/styles/tokens.scss` | 新增 carousel CSS 变量 |
| Create | `packages/docs/carousel/carousel.js` | Demo 页 Page |
| Create | `packages/docs/carousel/carousel.wxml` | Demo 页模板（8 个演示区块）|
| Create | `packages/docs/carousel/carousel.scss` | Demo 页样式 |
| Create | `packages/docs/carousel/carousel.json` | Demo 页组件注册 |
| Modify | `app.json` | 添加 demo 路由 |
| Modify | `pages/index/index.wxml` | 添加导航入口 |
| Modify | `CLAUDE.md` | 更新项目结构图和组件间关系 |

---

## Task 1：添加 carousel CSS Token

**Files:**
- Modify: `src/styles/tokens.scss`

- [ ] **Step 1：在 tokens.scss 末尾（`page {}` 闭合括号之前）追加 carousel 变量**

找到文件末尾的最后一个变量块（当前约 200 行附近），在 `}` 前插入：

```scss
  /* Carousel */
  --w-carousel-dot-color: rgba(255, 255, 255, 0.5);
  --w-carousel-dot-color-active: #ffffff;
  --w-carousel-dot-size: 16rpx;
  --w-carousel-dot-line-width: 16rpx;
  --w-carousel-dot-line-width-active: 48rpx;
```

- [ ] **Step 2：格式化**

```bash
pnpm run format
```

- [ ] **Step 3：Commit**

```bash
git add src/styles/tokens.scss
git commit -m "chore(carousel): add carousel CSS tokens"
```

---

## Task 2：创建 w-carousel-item 组件

**Files:**
- Create: `src/components/carousel-item/carousel-item.json`
- Create: `src/components/carousel-item/carousel-item.js`
- Create: `src/components/carousel-item/carousel-item.wxml`
- Create: `src/components/carousel-item/carousel-item.scss`

- [ ] **Step 1：创建 carousel-item.json**

```json
{
  "component": true,
  "styleIsolation": "apply-shared"
}
```

- [ ] **Step 2：创建 carousel-item.js**

```js
Component({
  relations: {
    '../carousel/carousel': {
      type: 'ancestor',
    },
  },

  data: {
    _style: '',
    _state: 'hidden',
  },

  methods: {
    _setState(state, style) {
      this.setData({ _state: state, _style: style });
    },

    onTap() {
      const parents = this.getRelationNodes('../carousel/carousel');
      if (parents && parents.length) {
        parents[0]._onItemTap(this);
      }
    },
  },
});
```

- [ ] **Step 3：创建 carousel-item.wxml**

```xml
<view class="w-carousel-item w-carousel-item--{{_state}}" style="{{_style}}" bindtap="onTap"><slot /></view>
```

- [ ] **Step 4：创建 carousel-item.scss**

```scss
.w-carousel-item {
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}
```

- [ ] **Step 5：格式化**

```bash
pnpm run format
```

- [ ] **Step 6：Commit**

```bash
git add src/components/carousel-item/
git commit -m "feat(carousel): add w-carousel-item component"
```

---

## Task 3：创建 w-carousel 组件（slide 效果 + dots）

**Files:**
- Create: `src/components/carousel/carousel.json`
- Create: `src/components/carousel/carousel.wxml`
- Create: `src/components/carousel/carousel.scss`
- Create: `src/components/carousel/carousel.js`

- [ ] **Step 1：创建 carousel.json**

```json
{
  "component": true,
  "styleIsolation": "apply-shared"
}
```

- [ ] **Step 2：创建 carousel.wxml**

```xml
<view class="w-carousel w-carousel--{{effect}} w-carousel--{{direction}} w-carousel--dots-{{dotPlacement}}">
  <view
    wx:if="{{effect === 'slide'}}"
    class="w-carousel__track"
    style="{{_trackStyle}}"
    bindtouchstart="onTouchStart"
    bindtouchmove="onTouchMove"
    bindtouchend="onTouchEnd"
  >
    <slot />
  </view>
  <view wx:else class="w-carousel__slides">
    <slot />
  </view>
  <view wx:if="{{showDots && _total > 1}}" class="w-carousel__dots w-carousel__dots--{{dotPlacement}}">
    <view
      wx:for="{{_dots}}"
      wx:key="index"
      class="w-carousel__dot {{item.active ? 'w-carousel__dot--active' : ''}} {{dotType === 'line' ? 'w-carousel__dot--line' : ''}}"
    />
  </view>
</view>
```

- [ ] **Step 3：创建 carousel.scss**

```scss
.w-carousel {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.w-carousel__track {
  display: flex;
  flex-direction: row;
  height: 100%;
  will-change: transform;
}

.w-carousel--vertical .w-carousel__track {
  flex-direction: column;
  width: 100%;
}

.w-carousel__slides {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Dots container */
.w-carousel__dots {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  z-index: 10;
  pointer-events: none;
}

.w-carousel__dots--bottom {
  bottom: 24rpx;
  left: 0;
  right: 0;
  flex-direction: row;
}

.w-carousel__dots--top {
  top: 24rpx;
  left: 0;
  right: 0;
  flex-direction: row;
}

.w-carousel__dots--left {
  left: 24rpx;
  top: 0;
  bottom: 0;
  flex-direction: column;
}

.w-carousel__dots--right {
  right: 24rpx;
  top: 0;
  bottom: 0;
  flex-direction: column;
}

/* Dot 圆点 */
.w-carousel__dot {
  width: var(--w-carousel-dot-size);
  height: var(--w-carousel-dot-size);
  border-radius: 9999rpx;
  background: var(--w-carousel-dot-color);
  transition: transform 300ms, background 300ms;
  flex-shrink: 0;
}

.w-carousel__dot--active {
  background: var(--w-carousel-dot-color-active);
  transform: scale(1.25);
}

/* Line 线条 */
.w-carousel__dot--line {
  width: var(--w-carousel-dot-line-width);
  height: 8rpx;
  border-radius: 4rpx;
  background: var(--w-carousel-dot-color);
  transition: width 300ms, background 300ms;
  transform: none;
}

.w-carousel__dot--line.w-carousel__dot--active {
  width: var(--w-carousel-dot-line-width-active);
  background: var(--w-carousel-dot-color-active);
  transform: none;
}
```

- [ ] **Step 4：创建 carousel.js（核心骨架 + slide 效果）**

```js
Component({
  relations: {
    '../carousel-item/carousel-item': {
      type: 'descendant',
      linked() {
        this._onChildrenChange();
      },
      unlinked() {
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
      this._internalIndex = Math.min(
        this._internalIndex || 0,
        Math.max(0, total - 1)
      );
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
        this._slideSize =
          (containerSize - (slidesPerView - 1) * spaceBetween) / slidesPerView;

        this._updateChildSizes();
        this._goTo(this._internalIndex, false);
        this._startAutoplay();
      });
    },

    /* ── Child size dispatch (slide effect) ── */
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
        slidesPerView <= 1
          ? total
          : Math.max(0, total - Math.floor(slidesPerView) + 1);
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
        const offset =
          this._internalIndex * (this._slideSize + spaceBetween);
        const transform =
          direction === 'horizontal'
            ? `translateX(${-offset}px)`
            : `translateY(${-offset}px)`;
        this.setData({
          _trackStyle: `transform: ${transform}; transition-duration: ${dur}ms;`,
        });
        return;
      }

      // fade / card: handled by _applyNonSlideEffect
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
          const isPrev =
            diff === -1 || (loop && diff === total - 1);
          const isNext =
            diff === 1 || (loop && diff === -(total - 1));

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
      this._startTranslate =
        this._internalIndex * (this._slideSize + this.data.spaceBetween);
    },

    onTouchMove(e) {
      if (!this._isDragging) return;
      const { direction } = this.data;
      const dx = e.touches[0].clientX - this._touchStartX;
      const dy = e.touches[0].clientY - this._touchStartY;
      const delta = direction === 'horizontal' ? dx : dy;
      const offset = this._startTranslate - delta;
      const transform =
        direction === 'horizontal'
          ? `translateX(${-offset}px)`
          : `translateY(${-offset}px)`;
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
        direction === 'horizontal'
          ? this._containerWidth
          : this._containerHeight;
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
```

- [ ] **Step 5：格式化**

```bash
pnpm run format
```

- [ ] **Step 6：Commit**

```bash
git add src/components/carousel/
git commit -m "feat(carousel): add w-carousel component with slide effect and dots"
```

---

## Task 4：创建 Demo 页面

**Files:**
- Create: `packages/docs/carousel/carousel.json`
- Create: `packages/docs/carousel/carousel.js`
- Create: `packages/docs/carousel/carousel.scss`
- Create: `packages/docs/carousel/carousel.wxml`

- [ ] **Step 1：创建 carousel.json**

```json
{
  "usingComponents": {
    "w-carousel": "/src/components/carousel/carousel",
    "w-carousel-item": "/src/components/carousel-item/carousel-item"
  },
  "navigationBarTitleText": "Carousel",
  "disableScroll": true
}
```

- [ ] **Step 2：创建 carousel.js**

```js
Page({
  data: {
    controlledIndex: 0,
    props: [
      { name: 'current', type: 'Number', default: '-1', desc: '当前 index（受控，≥0 时生效）' },
      { name: 'default-current', type: 'Number', default: '0', desc: '初始 index（非受控）' },
      { name: 'effect', type: 'String', default: "'slide'", desc: 'slide / fade / card' },
      { name: 'direction', type: 'String', default: "'horizontal'", desc: 'horizontal / vertical' },
      { name: 'loop', type: 'Boolean', default: 'true', desc: '是否循环' },
      { name: 'autoplay', type: 'Boolean', default: 'false', desc: '自动播放' },
      { name: 'interval', type: 'Number', default: '5000', desc: '自动播放间隔 ms' },
      { name: 'duration', type: 'Number', default: '300', desc: '切换动画时长 ms' },
      { name: 'slides-per-view', type: 'Number', default: '1', desc: '每屏可见数' },
      { name: 'space-between', type: 'Number', default: '0', desc: 'slide 间距 px' },
      { name: 'show-dots', type: 'Boolean', default: 'true', desc: '显示指示点' },
      { name: 'dot-type', type: 'String', default: "'dot'", desc: 'dot / line' },
      { name: 'dot-placement', type: 'String', default: "'bottom'", desc: 'top / bottom / left / right' },
    ],
  },

  goPrev() {
    this.selectComponent('#controlled').prev();
  },

  goNext() {
    this.selectComponent('#controlled').next();
  },

  goSecond() {
    this.selectComponent('#controlled').to(1);
  },
});
```

- [ ] **Step 3：创建 carousel.scss**

```scss
@import '../demo.scss';

.carousel-demo {
  width: 100%;
  height: 360rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.carousel-demo--tall {
  height: 480rpx;
}

.slide-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
}

.slide-item--1 {
  background: #6366f1;
}

.slide-item--2 {
  background: #8b5cf6;
}

.slide-item--3 {
  background: #ec4899;
}

.slide-item--4 {
  background: #f59e0b;
}

.demo-ctrl {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  margin-top: 16rpx;
}
```

- [ ] **Step 4：创建 carousel.wxml**

```xml
<div class="demo-page">
  <scroll-view scroll-y enhanced="{{true}}" show-scrollbar="{{false}}" class="demo-scroll">
    <view class="demo-content">
      <view class="comp-header">
        <view class="comp-header__tag">carousel</view>
        <view class="comp-header__desc">轮播组件，支持 slide / fade / card 效果。</view>
      </view>

      <view class="section">
        <view class="section__title">Props</view>
        <view class="prop-row" wx:for="{{props}}" wx:key="name">
          <view class="prop-row__meta">
            <text class="prop-row__name">{{item.name}}</text>
            <text class="prop-row__type">{{item.type}}</text>
            <text class="prop-row__default">{{item.default}}</text>
          </view>
          <view class="prop-row__desc">{{item.desc}}</view>
        </view>
      </view>

      <view class="section">
        <view class="section__title">基础用法（slide）</view>
        <w-carousel class="carousel-demo" loop default-current="{{0}}">
          <w-carousel-item><view class="slide-item slide-item--1">1</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--2">2</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--3">3</view></w-carousel-item>
        </w-carousel>
      </view>

      <view class="section">
        <view class="section__title">Fade 淡入淡出</view>
        <w-carousel class="carousel-demo" effect="fade" loop>
          <w-carousel-item><view class="slide-item slide-item--1">1</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--2">2</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--3">3</view></w-carousel-item>
        </w-carousel>
      </view>

      <view class="section">
        <view class="section__title">Card 卡片</view>
        <w-carousel class="carousel-demo" effect="card" loop>
          <w-carousel-item><view class="slide-item slide-item--1">1</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--2">2</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--3">3</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--4">4</view></w-carousel-item>
        </w-carousel>
      </view>

      <view class="section">
        <view class="section__title">垂直方向</view>
        <w-carousel class="carousel-demo" direction="vertical" loop dot-placement="right">
          <w-carousel-item><view class="slide-item slide-item--1">1</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--2">2</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--3">3</view></w-carousel-item>
        </w-carousel>
      </view>

      <view class="section">
        <view class="section__title">自动播放</view>
        <w-carousel class="carousel-demo" autoplay interval="{{2000}}" loop>
          <w-carousel-item><view class="slide-item slide-item--1">1</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--2">2</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--3">3</view></w-carousel-item>
        </w-carousel>
      </view>

      <view class="section">
        <view class="section__title">多 slide（slidesPerView=2, spaceBetween=16）</view>
        <w-carousel class="carousel-demo" slides-per-view="{{2}}" space-between="{{16}}" loop dot-type="line">
          <w-carousel-item><view class="slide-item slide-item--1">1</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--2">2</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--3">3</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--4">4</view></w-carousel-item>
        </w-carousel>
      </view>

      <view class="section">
        <view class="section__title">Line 指示点</view>
        <w-carousel class="carousel-demo" dot-type="line" loop>
          <w-carousel-item><view class="slide-item slide-item--1">1</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--2">2</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--3">3</view></w-carousel-item>
        </w-carousel>
      </view>

      <view class="section">
        <view class="section__title">受控模式</view>
        <w-carousel id="controlled" class="carousel-demo" loop>
          <w-carousel-item><view class="slide-item slide-item--1">1</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--2">2</view></w-carousel-item>
          <w-carousel-item><view class="slide-item slide-item--3">3</view></w-carousel-item>
        </w-carousel>
        <view class="demo-ctrl">
          <w-button bindtap="goPrev">Prev</w-button>
          <w-button bindtap="goNext">Next</w-button>
          <w-button bindtap="goSecond">To 第 2 项</w-button>
        </view>
      </view>

    </view>
  </scroll-view>
</div>
```

注意：demo 中的受控模式用了 `w-button`，需在 `carousel.json` 里注册：

```json
{
  "usingComponents": {
    "w-carousel": "/src/components/carousel/carousel",
    "w-carousel-item": "/src/components/carousel-item/carousel-item",
    "w-button": "/src/components/button/button"
  },
  "navigationBarTitleText": "Carousel",
  "disableScroll": true
}
```

- [ ] **Step 5：格式化**

```bash
pnpm run format
```

- [ ] **Step 6：Commit**

```bash
git add packages/docs/carousel/
git commit -m "feat(carousel): add carousel demo page"
```

---

## Task 5：注册路由、导航入口、更新 CLAUDE.md

**Files:**
- Modify: `app.json`
- Modify: `pages/index/index.wxml`
- Modify: `CLAUDE.md`

- [ ] **Step 1：在 app.json 的 subPackages[0].pages 末尾添加路由**

在 `"price/price"` 之后追加：

```json
"carousel/carousel"
```

- [ ] **Step 2：在 pages/index/index.wxml 的"布局"分组中添加导航项**

找到布局分组的最后一个 navigator（当前为 `tab-bar/tab-bar`），在其后插入：

```xml
          <navigator
            url="/packages/docs/carousel/carousel"
            hover-class="catalog-item--active"
            class="catalog-item"
          >
            <view class="catalog-item__name">Carousel 轮播</view>
            <view class="iconfont icon-right catalog-item__arrow"></view>
          </navigator>
```

- [ ] **Step 3：更新 CLAUDE.md**

3a. 在项目结构图的 `src/components/` 注释中追加 `carousel/carousel-item 轮播组件`。

3b. 在"组件间关系"部分追加：

```
- `w-carousel` ↔ `w-carousel-item`
```

- [ ] **Step 4：格式化**

```bash
pnpm run format
```

- [ ] **Step 5：Commit**

```bash
git add app.json pages/index/index.wxml CLAUDE.md
git commit -m "feat(carousel): register routes, add nav entry, update CLAUDE.md"
```

---

## 自查

**Spec 覆盖检查：**

| Spec 要求 | 覆盖任务 |
|---|---|
| w-carousel + w-carousel-item 父子组件 | Task 2, 3 |
| 全部 13 个 props | Task 3（carousel.js properties） |
| bind:change 事件 | Task 3（_goTo 末尾 triggerEvent） |
| to / prev / next / getCurrentIndex 方法 | Task 3（methods 末尾） |
| slide 效果 + track translate | Task 3 |
| 触摸手势（30% 或速度阈值） | Task 3（onTouchEnd） |
| loop 循环（modulo，boundary 无动画） | Task 3（_goTo 逻辑） |
| fade 效果 | Task 3（_applyNonSlideEffect） |
| card 效果（scale + translate） | Task 3（_applyNonSlideEffect） |
| card 点击前/后项切换 | Task 3（_onItemTap） |
| autoplay + pause on touch | Task 3（_startAutoplay / onTouchStart） |
| current prop 受控 | Task 3（observers.current） |
| dot / line 两种 dots | Task 3（scss + wxml） |
| dotPlacement 四方向 | Task 3（scss） |
| CSS tokens | Task 1 |
| demo 页 8 个演示区块 | Task 4 |
| app.json 路由 | Task 5 |
| index.wxml 导航 | Task 5 |
| CLAUDE.md 更新 | Task 5 |

**占位符扫描：** 无 TBD / TODO。

**类型一致性：** `_setState(state, style)` 在 carousel-item.js 定义，carousel.js 中全部调用均使用此签名。`_onItemTap(item)` 在 carousel.js methods 定义，carousel-item.js 中调用。`_goTo(index, animate)` 内部全部调用一致。
