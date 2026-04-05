# Carousel 组件设计文档

**日期：** 2026-04-06  
**参考：** naive-ui carousel  
**目标平台：** 微信小程序（原生框架）

---

## 概述

添加 `w-carousel`（轮播）组件，采用父子组件模式：`w-carousel` + `w-carousel-item`。支持 slide / fade / card 三种切换效果，水平/垂直方向，触摸手势，自动播放，dots 指示点。

---

## 组件结构

### 文件布局

```
src/components/carousel/carousel.js
src/components/carousel/carousel.wxml
src/components/carousel/carousel.scss
src/components/carousel/carousel.json

src/components/carousel-item/carousel-item.js
src/components/carousel-item/carousel-item.wxml
src/components/carousel-item/carousel-item.scss
src/components/carousel-item/carousel-item.json

packages/docs/carousel/carousel.js
packages/docs/carousel/carousel.wxml
packages/docs/carousel/carousel.scss
packages/docs/carousel/carousel.json
```

### Relations

`w-carousel` ↔ `w-carousel-item`，使用微信 `relations` API 建立父子关系。父组件在 `linked` / `unlinked` 时维护子组件列表，驱动每个子组件的状态。

---

## w-carousel

### Properties

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `current` | Number | `0` | 当前激活 index（受控）|
| `defaultCurrent` | Number | `0` | 初始 index（非受控）|
| `effect` | String | `'slide'` | `'slide'` / `'fade'` / `'card'` |
| `direction` | String | `'horizontal'` | `'horizontal'` / `'vertical'` |
| `loop` | Boolean | `true` | 是否循环 |
| `autoplay` | Boolean | `false` | 是否自动播放 |
| `interval` | Number | `5000` | 自动播放间隔（ms）|
| `duration` | Number | `300` | 切换动画时长（ms）|
| `slidesPerView` | Number | `1` | 每屏可见 slide 数 |
| `spaceBetween` | Number | `0` | slide 间距（px）|
| `showDots` | Boolean | `true` | 是否显示指示点 |
| `dotType` | String | `'dot'` | `'dot'` / `'line'` |
| `dotPlacement` | String | `'bottom'` | `'top'` / `'bottom'` / `'left'` / `'right'` |

### Events

- `bind:change` — payload: `{ current: number, previous: number }`

### Methods（通过 `selectComponent` 调用）

- `to(index: number)` — 跳转到指定 index
- `prev()` — 切换到上一项
- `next()` — 切换到下一项
- `getCurrentIndex()` — 返回当前 index

### WXML 结构

```xml
<view class="w-carousel w-carousel--{{effect}} w-carousel--{{direction}} w-carousel--dot-{{dotPlacement}}">
  <!-- slide 效果：track 容器 -->
  <view wx:if="{{effect === 'slide'}}"
        class="w-carousel__track"
        style="{{_trackStyle}}"
        bindtouchstart="onTouchStart"
        bindtouchmove="onTouchMove"
        bindtouchend="onTouchEnd"
        bindtransitionend="onTransitionEnd">
    <slot />
  </view>

  <!-- fade / card 效果：静态容器 -->
  <view wx:else class="w-carousel__slides">
    <slot />
  </view>

  <!-- dots -->
  <view wx:if="{{showDots && _total > 1}}"
        class="w-carousel__dots w-carousel__dots--{{dotPlacement}}">
    <view wx:for="{{_dots}}" wx:key="index"
          class="w-carousel__dot {{item.active ? 'w-carousel__dot--active' : ''}} {{dotType === 'line' ? 'w-carousel__dot--line' : ''}}">
    </view>
  </view>
</view>
```

---

## w-carousel-item

### Properties

无用户 prop。父组件通过 `relations` 下发内部状态。

### 内部 Data

| Key | 说明 |
|---|---|
| `_state` | `'active'` / `'prev'` / `'next'` / `'hidden'`（card 效果用）|
| `_style` | 父组件下发的内联样式字符串（fade/card 用）|

### WXML 结构

```xml
<view class="w-carousel-item w-carousel-item--{{_state}}" style="{{_style}}">
  <slot />
</view>
```

---

## 切换效果实现

### Slide 效果

**布局：**
- `.w-carousel__track` 横向（或纵向）排列所有子项，总尺寸 = `count * slideSize + (count-1) * spaceBetween`
- 每个 slide 宽度 = `(containerWidth - (slidesPerView-1) * spaceBetween) / slidesPerView`
- `ready` 时通过 `createSelectorQuery` 获取容器尺寸，计算 slideSize，写入每个子组件

**切换：**
- 通过更新 `_trackStyle` 中的 `transform: translateX(-offset)` + `transition-duration: {duration}ms` 实现
- `offset = currentIndex * (slideSize + spaceBetween)`

**Loop：**
- `loop=true` 时，逻辑 index 范围为 `[0, total-1]`，track 在头尾各插入一个"虚拟位"（不克隆 DOM）
- 内部维护 `_realIndex`（含虚拟位），切换到虚拟位后 `transitionend` 触发时，无动画跳回对应真实位置
- 实现无缝循环，无闪烁

**触摸：**
- `touchstart`：记录起始坐标，暂停 autoplay
- `touchmove`：实时更新 `transform`（无 transition），拖动跟手
- `touchend`：计算位移和速度
  - 位移 > 30% 容器尺寸 或 速度 > 0.4px/ms → 切换到上/下一项
  - 否则弹回当前项（加 transition）
  - 恢复 autoplay

### Fade 效果

- 所有子项 `position: absolute`，叠放（父容器 `position: relative`，需有明确高度）
- 父组件向每个子项下发 `_style`：
  - 激活：`opacity: 1; transition: opacity {duration}ms; z-index: 1`
  - 其余：`opacity: 0; transition: opacity {duration}ms; z-index: 0`
- 不支持触摸拖拽，仅通过 dots/方法切换

### Card 效果

- 所有子项 `position: absolute`，居中叠放
- 父组件根据与当前 index 的相对位置，向子项下发 `_state` 和 `_style`：
  - `active`：`transform: scale(1) translateX(0); opacity: 1`
  - `prev`：`transform: scale(0.85) translateX(-70%); opacity: 0.7`
  - `next`：`transform: scale(0.85) translateX(70%); opacity: 0.7`
  - `hidden`：`opacity: 0; pointer-events: none`
- 所有变化通过 CSS `transition` 驱动
- 点击 prev/next 项时触发切换（子组件 `bindtap` → 调用父组件方法）
- 不支持触摸拖拽

---

## Dots 指示点

### 渲染逻辑

- Dots 数量：
  - `slidesPerView = 1`：dots = `total`
  - `slidesPerView > 1`：dots = `total - slidesPerView + 1`
- `loop` 的虚拟项不计入 dots 数量

### 样式

**Dot 类型（`dotType="dot"`）：**
- 默认：`width: var(--w-carousel-dot-size); height: var(--w-carousel-dot-size); border-radius: 50%; background: var(--w-carousel-dot-color)`
- 激活：`background: var(--w-carousel-dot-color-active); transform: scale(1.2)`

**Line 类型（`dotType="line"`）：**
- 默认：`width: var(--w-carousel-dot-line-width); height: 4px; border-radius: 2px; background: var(--w-carousel-dot-color)`
- 激活：`width: var(--w-carousel-dot-line-width-active); background: var(--w-carousel-dot-color-active)`
- 宽度变化加 `transition: width {duration}ms`

### 位置

- `dotPlacement="bottom"` / `top`：水平排列，`position: absolute` 于容器底/顶，居中
- `dotPlacement="left"` / `right`：垂直排列，`position: absolute` 于容器左/右侧，居中

---

## CSS 变量（新增到 tokens.scss）

```scss
// carousel
--w-carousel-dot-color: rgba(255, 255, 255, 0.5);
--w-carousel-dot-color-active: #ffffff;
--w-carousel-dot-size: 8px;
--w-carousel-dot-line-width: 8px;
--w-carousel-dot-line-width-active: 24px;
--w-carousel-duration: 300ms;
```

---

## 注册与导航

- `app.json` subPackages 添加 `packages/docs/carousel/carousel`
- `pages/index/index.wxml` 在"展示"分组下添加导航项
- `CLAUDE.md` 项目结构图和组件间关系同步更新

---

## Demo 页面

路径：`packages/docs/carousel/`

演示内容：
1. 基础用法（slide + 图片）
2. Fade 效果
3. Card 效果
4. 垂直方向
5. 自动播放
6. 多 slide（slidesPerView + spaceBetween）
7. Dot / Line 指示点
8. 受控模式（通过按钮调用 prev/next/to）
