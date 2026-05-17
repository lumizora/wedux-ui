# App Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重写 `packages-private/app` 全量页面，提升视觉质量、扩展功能、最大化 wedux-ui 组件覆盖率。

**Architecture:** 保持现有 WeChat 原生小程序架构不变，在 mock.js 扩充数据模型，新增 analytics 页面，重写其余所有页面。所有页面通过 `getApp().globalData.theme` 获取主题对象，Tab Bar 颜色通过 `wx.setTabBarStyle()` 动态跟随主题色。

**Tech Stack:** 微信小程序原生（WXML/SCSS/JS）、wedux-ui 组件库（workspace 本地引用）、pnpm workspace

---

## 文件清单

| 操作 | 文件 |
|------|------|
| 修改 | `packages-private/app/utils/mock.js` |
| 修改 | `packages-private/app/app.json` |
| 修改 | `packages-private/app/app.js` |
| 修改 | `packages-private/app/pages/dashboard/dashboard.{js,wxml,scss,json}` |
| 修改 | `packages-private/app/pages/list/list.{js,wxml,scss,json}` |
| 修改 | `packages-private/app/pages/detail/detail.{js,wxml,scss,json}` |
| 修改 | `packages-private/app/pages/form/form.{js,wxml,json}` |
| 新建 | `packages-private/app/pages/analytics/analytics.{js,wxml,scss,json}` |
| 修改 | `packages-private/app/pages/settings/settings.{js,wxml,scss,json}` |

---

## Task 1: 扩充 mock 数据

**Files:**
- Modify: `packages-private/app/utils/mock.js`

- [ ] **Step 1: 在 mock.js 末尾追加 storeTree 和 analyticsData**

在文件末尾（现有导出之后）追加：

```js
export const storeTree = [
  {
    key: 'north',
    label: '华北区',
    children: [
      { key: 'bj', label: '北京' },
      { key: 'tj', label: '天津' },
      { key: 'sjz', label: '石家庄' },
    ],
  },
  {
    key: 'east',
    label: '华东区',
    children: [
      { key: 'sh', label: '上海' },
      { key: 'hz', label: '杭州' },
      { key: 'nj', label: '南京' },
    ],
  },
  {
    key: 'south',
    label: '华南区',
    children: [
      { key: 'gz', label: '广州' },
      { key: 'sz', label: '深圳' },
    ],
  },
];

export const analyticsData = {
  monthRevenue: 128600,
  revenueGrowth: 12.5,
  conversionRate: 73.2,
  conversionDelta: -2.1,
  completionRate: 83.0,
  avgParticipants: 248,
  typeDistribution: [
    { label: '折扣促销', value: 50, color: '#07c160' },
    { label: '会员专享', value: 33, color: '#10aeff' },
    { label: '线下活动', value: 17, color: '#fa9d3b' },
  ],
  monthlyTrend: [
    { month: '1月', revenue: 98000, max: 130000 },
    { month: '2月', revenue: 112000, max: 130000 },
    { month: '3月', revenue: 105000, max: 130000 },
    { month: '4月', revenue: 128600, max: 130000 },
  ],
  ranking: [
    { title: '清明假期满减活动', count: 723 },
    { title: '春节特惠活动', count: 342 },
    { title: '新品上市发布会', count: 198 },
    { title: '会员日专属福利', count: 167 },
    { title: '老客户回馈专场', count: 62 },
  ],
  announcements: '五一大促预算已超 80%，建议及时调整 · 会员日活动明日开始报名 · 华南区新门店本月开业',
};
```

- [ ] **Step 2: 提交**

```bash
git add packages-private/app/utils/mock.js
git commit -m "feat(app): extend mock data with storeTree and analyticsData"
```

---

## Task 2: 更新 app.json 和 app.js

**Files:**
- Modify: `packages-private/app/app.json`
- Modify: `packages-private/app/app.js`

- [ ] **Step 1: 更新 app.json**

将 `packages-private/app/app.json` 替换为：

```json
{
  "pages": [
    "pages/dashboard/dashboard",
    "pages/list/list",
    "pages/analytics/analytics",
    "pages/settings/settings",
    "pages/form/form",
    "pages/detail/detail",
    "pages/share/share"
  ],
  "usingComponents": {},
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#07c160",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/dashboard/dashboard",
        "text": "首页",
        "iconPath": "icons/home.png",
        "selectedIconPath": "icons/home.png"
      },
      {
        "pagePath": "pages/list/list",
        "text": "活动",
        "iconPath": "icons/function.png",
        "selectedIconPath": "icons/function.png"
      },
      {
        "pagePath": "pages/analytics/analytics",
        "text": "数据",
        "iconPath": "icons/function.png",
        "selectedIconPath": "icons/function.png"
      },
      {
        "pagePath": "pages/settings/settings",
        "text": "我的",
        "iconPath": "icons/setting.png",
        "selectedIconPath": "icons/setting.png"
      }
    ]
  },
  "window": {
    "navigationBarTextStyle": "@navigationBarTextStyle",
    "navigationBarBackgroundColor": "@navigationBarBackgroundColor"
  },
  "darkmode": true,
  "themeLocation": "theme.json",
  "style": "v2",
  "sitemapLocation": "sitemap.json",
  "lazyCodeLoading": "requiredComponents"
}
```

注意：数据页图标暂用 `icons/function.png`，如有专属图标可替换。

- [ ] **Step 2: 更新 app.js，在主题变更时同步更新 Tab Bar 颜色**

将 `packages-private/app/app.js` 替换为：

```js
import {
  lightTheme,
  darkTheme,
} from './miniprogram_npm/wedux-ui/components/theme-provider/presets';

App({
  globalData: {
    themeMode: 'light',
    primaryColor: '#07c160',
    theme: {},
  },

  onLaunch() {
    this.buildTheme();
  },

  buildTheme() {
    const { themeMode, primaryColor } = this.globalData;
    const base = themeMode === 'dark' ? { ...darkTheme } : { ...lightTheme };
    const lightOverrides =
      themeMode === 'light'
        ? {
            '--color-bg-page': '#f4f4f5',
            '--color-bg-base': '#fafafa',
            '--color-bg-elevated': '#ffffff',
            '--color-text-primary': '#09090b',
            '--color-text-secondary': '#71717a',
            '--color-separator': '#e4e4e7',
          }
        : {};
    this.globalData.theme = {
      ...base,
      ...lightOverrides,
      '--color-brand': primaryColor,
      '--w-input-border-focus': primaryColor,
      '--w-switch-checked-bg': primaryColor,
    };
    this._syncTabBarColor(primaryColor, themeMode);
  },

  _syncTabBarColor(primaryColor, themeMode) {
    wx.setTabBarStyle({
      color: '#999999',
      selectedColor: primaryColor,
      backgroundColor: themeMode === 'dark' ? '#1c1c1e' : '#ffffff',
      borderStyle: themeMode === 'dark' ? 'white' : 'black',
    });
  },

  setThemeMode(mode) {
    this.globalData.themeMode = mode;
    this.buildTheme();
  },

  setPrimaryColor(color) {
    this.globalData.primaryColor = color;
    this.buildTheme();
  },
});
```

- [ ] **Step 3: 提交**

```bash
git add packages-private/app/app.json packages-private/app/app.js
git commit -m "feat(app): add analytics tab, sync tabBar color with theme"
```

---

## Task 3: 首页重写（Dashboard）

**Files:**
- Modify: `packages-private/app/pages/dashboard/dashboard.json`
- Modify: `packages-private/app/pages/dashboard/dashboard.wxml`
- Modify: `packages-private/app/pages/dashboard/dashboard.js`
- Modify: `packages-private/app/pages/dashboard/dashboard.scss`

- [ ] **Step 1: 更新 dashboard.json**

```json
{
  "usingComponents": {
    "w-theme-provider": "wedux-ui/components/theme-provider/theme-provider",
    "w-layout": "wedux-ui/components/layout/layout",
    "w-layout-header": "wedux-ui/components/layout-header/layout-header",
    "w-layout-content": "wedux-ui/components/layout-content/layout-content",
    "w-navigation-bar": "wedux-ui/components/navigation-bar/navigation-bar",
    "w-badge": "wedux-ui/components/badge/badge",
    "w-avatar": "wedux-ui/components/avatar/avatar",
    "w-price": "wedux-ui/components/price/price",
    "w-number-animation": "wedux-ui/components/number-animation/number-animation",
    "w-card": "wedux-ui/components/card/card",
    "w-button": "wedux-ui/components/button/button",
    "w-tag": "wedux-ui/components/tag/tag",
    "w-image": "wedux-ui/components/image/image",
    "w-ellipsis": "wedux-ui/components/ellipsis/ellipsis"
  },
  "navigationStyle": "custom",
  "disableScroll": true
}
```

- [ ] **Step 2: 重写 dashboard.wxml**

```xml
<view class="page">
  <w-theme-provider theme="{{theme}}" style="height: 100%">
    <w-layout>
      <w-layout-header position="static">
        <w-navigation-bar back="{{false}}" use-content-slot>
          <view slot="content" class="nav-content">
            <view class="nav-content__title">运营助手</view>
            <w-badge value="{{noticeCount}}" max="{{99}}">
              <view class="iconfont icon-notice nav-notice"></view>
            </w-badge>
          </view>
        </w-navigation-bar>
      </w-layout-header>

      <w-layout-content>
        <!-- Hero 卡片 -->
        <view class="hero-card">
          <view class="hero-card__left">
            <view class="hero-greeting">早上好，运营君 👋</view>
            <view class="hero-date">{{today}} · {{activeCount}} 个活动进行中</view>
            <view class="hero-revenue">
              <view class="hero-revenue__label">本月营收</view>
              <view class="hero-revenue__value">
                <w-price price="{{stats.monthRevenue}}" size="lg" />
              </view>
              <view class="hero-revenue__trend trend--up">↑ {{stats.monthGrowth}}%</view>
            </view>
          </view>
          <w-avatar
            src="https://picsum.photos/seed/admin/200/200"
            size="large"
          />
        </view>

        <!-- 统计卡片（3列） -->
        <view class="stats-row">
          <view class="stat-card">
            <view class="stat-card__value stat-card__value--brand">
              <w-number-animation
                to="{{stats.activeActivities}}"
                duration="{{600}}"
                active="{{animateStats}}"
              />
            </view>
            <view class="stat-card__label">进行中</view>
          </view>
          <view class="stat-card stat-card--divider">
            <view class="stat-card__value">
              <w-number-animation
                to="{{stats.totalParticipants}}"
                duration="{{1000}}"
                active="{{animateStats}}"
                show-separator
              />
            </view>
            <view class="stat-card__label">参与人次</view>
          </view>
          <view class="stat-card stat-card--divider">
            <view class="stat-card__value">
              <w-number-animation
                to="{{stats.totalActivities}}"
                duration="{{800}}"
                active="{{animateStats}}"
              />
            </view>
            <view class="stat-card__label">总活动</view>
          </view>
        </view>

        <!-- 快捷操作 -->
        <view class="section-header">
          <view class="section-header__title">快捷操作</view>
        </view>
        <view class="quick-actions">
          <view class="quick-action" bind:tap="onNewActivity">
            <view class="quick-action__icon quick-action__icon--primary">
              <view class="iconfont icon-plus"></view>
            </view>
            <view class="quick-action__label">新建活动</view>
          </view>
          <view class="quick-action" bind:tap="onViewAll">
            <view class="quick-action__icon quick-action__icon--info">
              <view class="iconfont icon-list"></view>
            </view>
            <view class="quick-action__label">活动列表</view>
          </view>
          <view class="quick-action" bind:tap="onGoAnalytics">
            <view class="quick-action__icon quick-action__icon--warning">
              <view class="iconfont icon-data"></view>
            </view>
            <view class="quick-action__label">数据报表</view>
          </view>
          <view class="quick-action" bind:tap="onGoSettings">
            <view class="quick-action__icon quick-action__icon--success">
              <view class="iconfont icon-setting"></view>
            </view>
            <view class="quick-action__label">主题设置</view>
          </view>
        </view>

        <!-- 最近活动（横向滚动） -->
        <view class="section-header">
          <view class="section-header__title">最近活动</view>
          <view class="section-header__action" bind:tap="onViewAll">查看全部 ›</view>
        </view>
        <scroll-view class="activity-scroll" scroll-x show-scrollbar="{{false}}">
          <view class="activity-scroll__inner">
            <view
              wx:for="{{recentActivities}}"
              wx:key="id"
              class="activity-scroll-card"
              data-id="{{item.id}}"
              bind:tap="onActivityTap"
            >
              <view class="activity-scroll-card__cover">
                <w-image
                  src="{{item.coverImage}}"
                  mode="aspectFill"
                  width="220rpx"
                  height="130rpx"
                />
                <w-tag
                  class="activity-scroll-card__status"
                  type="{{item.statusType}}"
                  size="small"
                >{{item.statusLabel}}</w-tag>
              </view>
              <view class="activity-scroll-card__body">
                <w-ellipsis class="activity-scroll-card__title" lineClamp="{{1}}">{{item.title}}</w-ellipsis>
                <view class="activity-scroll-card__progress">
                  <view class="progress-track">
                    <view class="progress-fill" style="width: {{item.progressRate}}%"></view>
                  </view>
                  <text class="progress-text">{{item.actualCount}}/{{item.targetCount}}人</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="bottom-spacer"></view>
      </w-layout-content>
    </w-layout>
  </w-theme-provider>
</view>
```

- [ ] **Step 3: 重写 dashboard.js**

```js
import { activities, stats, statusConfig } from '../../utils/mock';

const DAYS = ['日', '一', '二', '三', '四', '五', '六'];

Page({
  data: {
    theme: {},
    stats,
    today: '',
    activeCount: 0,
    noticeCount: 3,
    recentActivities: [],
    animateStats: false,
  },

  onLoad() {
    this.loadTheme();
    this.loadData();
  },

  onShow() {
    this.loadTheme();
  },

  loadTheme() {
    const app = getApp();
    this.setData({ theme: app.globalData.theme });
  },

  loadData() {
    const now = new Date();
    const today = `${now.getMonth() + 1}月${now.getDate()}日 周${DAYS[now.getDay()]}`;
    const activeCount = activities.filter((a) => a.status === 'active').length;
    const recent = activities.slice(0, 4).map((a) => ({
      ...a,
      statusLabel: statusConfig[a.status]?.label || a.status,
      statusType: statusConfig[a.status]?.type || 'default',
      progressRate: a.targetCount > 0 ? Math.round((a.actualCount / a.targetCount) * 100) : 0,
    }));
    this.setData({ today, activeCount, recentActivities: recent, animateStats: true });
  },

  onNewActivity() {
    wx.navigateTo({ url: '/pages/form/form' });
  },

  onViewAll() {
    wx.switchTab({ url: '/pages/list/list' });
  },

  onGoAnalytics() {
    wx.switchTab({ url: '/pages/analytics/analytics' });
  },

  onGoSettings() {
    wx.switchTab({ url: '/pages/settings/settings' });
  },

  onActivityTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
});
```

- [ ] **Step 4: 重写 dashboard.scss**

```scss
@import '../../miniprogram_npm/wedux-ui/styles/iconfont.scss';

.page {
  height: 100%;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 32rpx;

  &__title {
    font-size: 34rpx;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.nav-notice {
  font-size: 44rpx;
  color: var(--color-text-secondary);
}

// Hero 卡片
.hero-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  background: var(--color-bg-elevated);
  margin: 24rpx 24rpx 0;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.hero-greeting {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--color-text-primary);
}

.hero-date {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  margin-top: 6rpx;
}

.hero-revenue {
  margin-top: 24rpx;
  display: flex;
  align-items: baseline;
  gap: 12rpx;

  &__label {
    font-size: 22rpx;
    color: var(--color-text-secondary);
  }
}

.hero-revenue__trend {
  font-size: 22rpx;
}

.trend--up {
  color: var(--color-success);
}

.trend--down {
  color: var(--color-danger);
}

// 统计行
.stats-row {
  display: flex;
  background: var(--color-bg-elevated);
  margin: 16rpx 24rpx 0;
  border-radius: 24rpx;
  padding: 32rpx 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.stat-card {
  flex: 1;
  text-align: center;

  &--divider {
    border-left: 1rpx solid var(--color-separator);
  }

  &__value {
    font-size: 40rpx;
    font-weight: 700;
    color: var(--color-text-primary);

    &--brand {
      color: var(--color-brand);
    }
  }

  &__label {
    font-size: 22rpx;
    color: var(--color-text-secondary);
    margin-top: 6rpx;
  }
}

// 快捷操作
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 16rpx;

  &__title {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__action {
    font-size: 26rpx;
    color: var(--color-brand);
  }
}

.quick-actions {
  display: flex;
  background: var(--color-bg-elevated);
  margin: 0 24rpx;
  border-radius: 24rpx;
  padding: 32rpx 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.quick-action {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;

  &__icon {
    width: 88rpx;
    height: 88rpx;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;

    &--primary {
      background: rgba(7, 193, 96, 0.12);
      color: var(--color-brand);
    }

    &--info {
      background: rgba(16, 174, 255, 0.12);
      color: var(--color-info);
    }

    &--warning {
      background: rgba(250, 157, 59, 0.12);
      color: var(--color-warning);
    }

    &--success {
      background: rgba(116, 182, 0, 0.12);
      color: var(--color-success);
    }
  }

  &__label {
    font-size: 22rpx;
    color: var(--color-text-secondary);
  }
}

// 最近活动横向滚动
.activity-scroll {
  white-space: nowrap;

  &__inner {
    display: inline-flex;
    gap: 16rpx;
    padding: 0 24rpx 24rpx;
  }
}

.activity-scroll-card {
  display: inline-flex;
  flex-direction: column;
  width: 220rpx;
  background: var(--color-bg-elevated);
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  white-space: normal;

  &__cover {
    position: relative;
  }

  &__status {
    position: absolute !important;
    bottom: 8rpx;
    right: 8rpx;
  }

  &__body {
    padding: 16rpx;
  }

  &__title {
    font-size: 26rpx;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  &__progress {
    margin-top: 12rpx;
  }
}

.progress-track {
  height: 6rpx;
  background: var(--color-separator);
  border-radius: 3rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-brand);
  border-radius: 3rpx;
}

.progress-text {
  font-size: 20rpx;
  color: var(--color-text-secondary);
  margin-top: 6rpx;
  display: block;
}

.bottom-spacer {
  height: 48rpx;
}
```

- [ ] **Step 5: 提交**

```bash
git add packages-private/app/pages/dashboard/
git commit -m "feat(app): rewrite dashboard with hero card, 3-col stats, horizontal scroll"
```

---

## Task 4: 活动列表页重写（List）

**Files:**
- Modify: `packages-private/app/pages/list/list.json`
- Modify: `packages-private/app/pages/list/list.wxml`
- Modify: `packages-private/app/pages/list/list.js`
- Modify: `packages-private/app/pages/list/list.scss`

- [ ] **Step 1: 更新 list.json**

```json
{
  "usingComponents": {
    "w-theme-provider": "wedux-ui/components/theme-provider/theme-provider",
    "w-layout": "wedux-ui/components/layout/layout",
    "w-layout-header": "wedux-ui/components/layout-header/layout-header",
    "w-layout-content": "wedux-ui/components/layout-content/layout-content",
    "w-navigation-bar": "wedux-ui/components/navigation-bar/navigation-bar",
    "w-input": "wedux-ui/components/input/input",
    "w-tag": "wedux-ui/components/tag/tag",
    "w-button": "wedux-ui/components/button/button",
    "w-empty": "wedux-ui/components/empty/empty",
    "w-infinite-scroll": "wedux-ui/components/infinite-scroll/infinite-scroll",
    "w-ellipsis": "wedux-ui/components/ellipsis/ellipsis",
    "w-drawer": "wedux-ui/components/drawer/drawer",
    "w-back-top": "wedux-ui/components/back-top/back-top",
    "w-image": "wedux-ui/components/image/image",
    "w-float-button": "wedux-ui/components/float-button/float-button"
  },
  "navigationStyle": "custom",
  "disableScroll": true
}
```

- [ ] **Step 2: 重写 list.wxml**

```xml
<view class="page">
  <w-theme-provider theme="{{theme}}" style="height: 100%">
    <w-layout>
      <w-layout-header position="static">
        <w-navigation-bar back="{{false}}" use-content-slot>
          <view slot="content" class="nav-content">
            <view class="nav-content__title">活动管理</view>
            <view class="nav-btn" bind:tap="onSortTap">
              <view class="iconfont icon-filter"></view>
            </view>
          </view>
        </w-navigation-bar>

        <!-- 搜索栏 -->
        <view class="search-bar">
          <w-input
            value="{{keyword}}"
            placeholder="搜索活动名称..."
            clearable
            bind:change="onSearch"
            bind:clear="onSearchClear"
          />
        </view>

        <!-- 筛选 Tabs -->
        <scroll-view scroll-x class="filter-scroll" show-scrollbar="{{false}}">
          <view class="filter-tabs">
            <view
              wx:for="{{filterTabs}}"
              wx:key="key"
              class="filter-tab {{activeFilter === item.key ? 'filter-tab--active' : ''}}"
              data-key="{{item.key}}"
              bind:tap="onFilterChange"
            ><text>{{item.label}}</text></view>
          </view>
        </scroll-view>
      </w-layout-header>

      <w-layout-content
        scroll-top="{{contentScrollTop}}"
        bind:scroll="onContentScroll"
        bind:scrolltolower="onLoadMore"
      >
        <!-- 计数栏 -->
        <view class="toolbar">
          <view class="toolbar__count">共 {{totalCount}} 条</view>
        </view>

        <!-- 列表 -->
        <view wx:if="{{list.length > 0}}" class="activity-list">
          <view
            wx:for="{{list}}"
            wx:key="id"
            class="activity-card"
            data-id="{{item.id}}"
            bind:tap="onActivityTap"
          >
            <view class="activity-card__cover">
              <w-image
                src="{{item.coverImage}}"
                mode="aspectFill"
                width="702rpx"
                height="240rpx"
                radius="0"
              />
              <w-tag
                class="activity-card__status-tag"
                type="{{item.statusType}}"
                size="small"
              >{{item.statusLabel}}</w-tag>
            </view>
            <view class="activity-card__body">
              <view class="activity-card__header">
                <w-ellipsis class="activity-card__title" lineClamp="{{1}}">{{item.title}}</w-ellipsis>
              </view>
              <view class="activity-card__desc">
                <w-ellipsis lineClamp="{{2}}">{{item.description}}</w-ellipsis>
              </view>
              <view class="activity-card__meta">
                <view class="meta-item">
                  <view class="iconfont icon-time meta-item__icon"></view>
                  <text class="meta-item__text">{{item.startTime}}</text>
                </view>
                <view class="meta-item">
                  <view class="iconfont icon-user meta-item__icon"></view>
                  <text class="meta-item__text">{{item.actualCount}}/{{item.targetCount}}人</text>
                </view>
              </view>
              <view class="activity-card__tags" wx:if="{{item.tags.length > 0}}">
                <w-tag
                  wx:for="{{item.tags}}"
                  wx:key="*this"
                  wx:for-item="tag"
                  size="small"
                  type="info"
                >{{tag}}</w-tag>
              </view>
              <view class="progress-row">
                <view class="progress-track">
                  <view class="progress-fill" style="width: {{item.progressRate}}%"></view>
                </view>
                <text class="progress-label">{{item.progressRate}}%</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view wx:else class="empty-wrap">
          <w-empty description="{{keyword ? '未找到匹配的活动' : '暂无活动数据'}}" />
          <w-button
            wx:if="{{!keyword}}"
            type="primary"
            bind:tap="onNewActivity"
            style="margin-top: 32rpx"
          >创建第一个活动</w-button>
        </view>

        <w-infinite-scroll
          wx:if="{{list.length > 0}}"
          loading="{{loading}}"
          finished="{{!hasMore}}"
          finished-text="没有更多活动了"
        />
      </w-layout-content>

      <w-back-top show="{{showBackTop}}" bind:tap="onBackTop" />
    </w-layout>

    <!-- 新建浮动按钮 -->
    <w-float-button type="primary" bind:tap="onNewActivity">
      <view class="iconfont icon-plus"></view>
    </w-float-button>

    <!-- 排序抽屉 -->
    <w-drawer
      title="排序方式"
      placement="bottom"
      show="{{showSortDrawer}}"
      bind:update:show="onSortDrawerChange"
    >
      <view class="sort-list">
        <view
          wx:for="{{sortOptions}}"
          wx:key="key"
          class="sort-item {{sortBy === item.key ? 'sort-item--active' : ''}}"
          data-key="{{item.key}}"
          bind:tap="onSortSelect"
        >
          <text>{{item.label}}</text>
          <view wx:if="{{sortBy === item.key}}" class="iconfont icon-check sort-item__check"></view>
        </view>
      </view>
    </w-drawer>
  </w-theme-provider>
</view>
```

- [ ] **Step 3: 重写 list.js**

```js
import { activities, statusConfig } from '../../utils/mock';

const PAGE_SIZE = 10;

Page({
  data: {
    theme: {},
    keyword: '',
    activeFilter: 'all',
    sortBy: 'createdAt',
    filterTabs: [
      { key: 'all', label: '全部' },
      { key: 'active', label: '进行中' },
      { key: 'draft', label: '草稿' },
      { key: 'paused', label: '已暂停' },
      { key: 'ended', label: '已结束' },
    ],
    sortOptions: [
      { key: 'createdAt', label: '最新创建' },
      { key: 'startTime', label: '开始时间' },
      { key: 'participants', label: '参与人数' },
    ],
    list: [],
    totalCount: 0,
    loading: false,
    hasMore: false,
    showSortDrawer: false,
    showBackTop: false,
    contentScrollTop: 0,
  },

  onLoad() {
    this.loadTheme();
    this.loadList();
  },

  onShow() {
    this.loadTheme();
  },

  loadTheme() {
    const app = getApp();
    this.setData({ theme: app.globalData.theme });
  },

  loadList() {
    const { keyword, activeFilter } = this.data;
    let filtered = activities.map((a) => ({
      ...a,
      statusLabel: statusConfig[a.status]?.label || a.status,
      statusType: statusConfig[a.status]?.type || 'default',
      progressRate: a.targetCount > 0 ? Math.round((a.actualCount / a.targetCount) * 100) : 0,
    }));

    if (activeFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === activeFilter);
    }

    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(kw) || a.description.toLowerCase().includes(kw),
      );
    }

    this.setData({ list: filtered, totalCount: filtered.length, hasMore: false });
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value }, () => this.loadList());
  },

  onSearchClear() {
    this.setData({ keyword: '' }, () => this.loadList());
  },

  onFilterChange(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ activeFilter: key }, () => this.loadList());
  },

  onSortTap() {
    this.setData({ showSortDrawer: true });
  },

  onSortDrawerChange(e) {
    this.setData({ showSortDrawer: e.detail.value });
  },

  onSortSelect(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ sortBy: key, showSortDrawer: false }, () => this.loadList());
  },

  onLoadMore() {},

  onContentScroll(e) {
    this.setData({ showBackTop: e.detail.scrollTop > 400 });
  },

  onBackTop() {
    this.setData({ contentScrollTop: 0 });
  },

  onNewActivity() {
    wx.navigateTo({ url: '/pages/form/form' });
  },

  onActivityTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
});
```

- [ ] **Step 4: 更新 list.scss（替换全文）**

```scss
@import '../../miniprogram_npm/wedux-ui/styles/iconfont.scss';

.page {
  height: 100%;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 32rpx;

  &__title {
    font-size: 34rpx;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.nav-btn {
  font-size: 40rpx;
  color: var(--color-text-secondary);
}

.search-bar {
  padding: 16rpx 24rpx 0;
  background: var(--color-bg-elevated);
}

.filter-scroll {
  background: var(--color-bg-elevated);
  border-bottom: 1rpx solid var(--color-separator);
}

.filter-tabs {
  display: flex;
  padding: 16rpx 24rpx;
  gap: 16rpx;
}

.filter-tab {
  padding: 8rpx 24rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: var(--color-text-secondary);
  white-space: nowrap;
  background: var(--color-bg-base);

  &--active {
    background: var(--color-brand);
    color: #fff;
  }
}

.toolbar {
  padding: 20rpx 32rpx;

  &__count {
    font-size: 24rpx;
    color: var(--color-text-secondary);
  }
}

.activity-list {
  padding: 0 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-bottom: 40rpx;
}

.activity-card {
  background: var(--color-bg-elevated);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  &__cover {
    position: relative;
  }

  &__status-tag {
    position: absolute !important;
    top: 16rpx;
    right: 16rpx;
  }

  &__body {
    padding: 24rpx;
  }

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 8rpx;
  }

  &__desc {
    font-size: 26rpx;
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-bottom: 16rpx;
  }

  &__meta {
    display: flex;
    gap: 24rpx;
    margin-bottom: 16rpx;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-bottom: 16rpx;
  }
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;

  &__icon {
    font-size: 26rpx;
    color: var(--color-text-secondary);
  }

  &__text {
    font-size: 24rpx;
    color: var(--color-text-secondary);
  }
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.progress-track {
  flex: 1;
  height: 6rpx;
  background: var(--color-separator);
  border-radius: 3rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-brand);
  border-radius: 3rpx;
}

.progress-label {
  font-size: 22rpx;
  color: var(--color-text-secondary);
  min-width: 60rpx;
  text-align: right;
}

.empty-wrap {
  padding: 80rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sort-list {
  padding: 16rpx 0 32rpx;
}

.sort-item {
  padding: 28rpx 48rpx;
  font-size: 30rpx;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;

  &--active {
    color: var(--color-brand);
  }

  &__check {
    font-size: 32rpx;
    color: var(--color-brand);
  }
}
```

- [ ] **Step 5: 提交**

```bash
git add packages-private/app/pages/list/
git commit -m "feat(app): rewrite list with search, full-width covers, float button"
```

---

## Task 5: 活动详情页更新（Detail）

**Files:**
- Modify: `packages-private/app/pages/detail/detail.json`
- Modify: `packages-private/app/pages/detail/detail.wxml`
- Modify: `packages-private/app/pages/detail/detail.js`
- Modify: `packages-private/app/pages/detail/detail.scss`

- [ ] **Step 1: 更新 detail.json（用 w-popover 替换 w-drawer 中的更多操作）**

```json
{
  "usingComponents": {
    "w-theme-provider": "wedux-ui/components/theme-provider/theme-provider",
    "w-layout": "wedux-ui/components/layout/layout",
    "w-layout-header": "wedux-ui/components/layout-header/layout-header",
    "w-layout-content": "wedux-ui/components/layout-content/layout-content",
    "w-navigation-bar": "wedux-ui/components/navigation-bar/navigation-bar",
    "w-tag": "wedux-ui/components/tag/tag",
    "w-button": "wedux-ui/components/button/button",
    "w-divider": "wedux-ui/components/divider/divider",
    "w-list": "wedux-ui/components/list/list",
    "w-list-item": "wedux-ui/components/list-item/list-item",
    "w-avatar": "wedux-ui/components/avatar/avatar",
    "w-avatar-group": "wedux-ui/components/avatar-group/avatar-group",
    "w-image": "wedux-ui/components/image/image",
    "w-popover": "wedux-ui/components/popover/popover",
    "w-empty": "wedux-ui/components/empty/empty",
    "w-ellipsis": "wedux-ui/components/ellipsis/ellipsis"
  },
  "navigationStyle": "custom",
  "disableScroll": true
}
```

- [ ] **Step 2: 重写 detail.wxml**

```xml
<view class="page">
  <w-theme-provider theme="{{theme}}" style="height: 100%">
    <w-layout>
      <w-layout-header position="static">
        <w-navigation-bar use-content-slot>
          <view slot="content" class="nav-content">
            <view class="nav-back iconfont icon-left" bind:tap="onBack"></view>
            <view class="nav-content__title">活动详情</view>
            <w-popover placement="bottom-end" bind:select="onPopoverSelect">
              <view class="nav-more iconfont icon-more"></view>
              <view slot="content" class="popover-menu">
                <view class="popover-item" data-key="edit" bind:tap="onEdit">编辑活动</view>
                <view class="popover-item" data-key="copy">复制活动</view>
                <view class="popover-item popover-item--danger" data-key="delete">删除活动</view>
              </view>
            </w-popover>
          </view>
        </w-navigation-bar>
      </w-layout-header>

      <w-layout-content>
        <block wx:if="{{activity}}">
          <!-- 封面图 -->
          <view class="cover-wrap">
            <w-image
              src="{{activity.coverImage}}"
              mode="aspectFill"
              width="750rpx"
              height="360rpx"
            />
            <w-tag class="cover-tag" type="{{activity.statusType}}">{{activity.statusLabel}}</w-tag>
          </view>

          <!-- 标题区 -->
          <view class="title-section">
            <view class="title-text">{{activity.title}}</view>
            <view class="meta-row">
              <view class="iconfont icon-tag meta-icon"></view>
              <text class="meta-text">{{activity.typeName}}</text>
              <view class="meta-dot"></view>
              <view class="iconfont icon-location meta-icon"></view>
              <text class="meta-text">{{activity.location}}</text>
            </view>
            <view class="tags-row" wx:if="{{activity.tags.length > 0}}">
              <w-tag
                wx:for="{{activity.tags}}"
                wx:key="*this"
                wx:for-item="tag"
                size="small"
                type="info"
              >{{tag}}</w-tag>
            </view>
          </view>

          <w-divider />

          <!-- 3列数据统计 -->
          <view class="stats-grid">
            <view class="stats-grid__item">
              <view class="stats-grid__value stats-grid__value--brand">{{activity.progressRate}}%</view>
              <view class="stats-grid__label">参与率</view>
            </view>
            <view class="stats-grid__item stats-grid__item--divider">
              <view class="stats-grid__value">{{activity.actualCount}}</view>
              <view class="stats-grid__label">已参与</view>
            </view>
            <view class="stats-grid__item stats-grid__item--divider">
              <view class="stats-grid__value">¥{{activity.budget}}</view>
              <view class="stats-grid__label">活动预算</view>
            </view>
          </view>

          <!-- 进度条 -->
          <view class="progress-section">
            <view class="progress-track">
              <view class="progress-fill" style="width: {{activity.progressRate}}%"></view>
            </view>
            <text class="progress-hint">{{activity.actualCount}}/{{activity.targetCount}} 人参与目标</text>
          </view>

          <w-divider />

          <!-- 参与者 -->
          <view class="participants-section">
            <view class="participants-header">
              <view class="participants-title">参与者</view>
              <view class="participants-count">{{activity.actualCount}} 人已参与</view>
            </view>
            <w-avatar-group>
              <w-avatar
                wx:for="{{participants}}"
                wx:key="id"
                src="{{item.avatar}}"
                size="medium"
              />
            </w-avatar-group>
          </view>

          <w-divider />

          <!-- 活动信息 -->
          <view class="section-title">活动信息</view>
          <w-list>
            <w-list-item>
              <text>开始时间</text>
              <view slot="suffix" class="list-extra">{{activity.startTime}}</view>
            </w-list-item>
            <w-list-item>
              <text>结束时间</text>
              <view slot="suffix" class="list-extra">{{activity.endTime}}</view>
            </w-list-item>
            <w-list-item>
              <text>活动地点</text>
              <view slot="suffix" class="list-extra">{{activity.location || '未设置'}}</view>
            </w-list-item>
            <w-list-item>
              <text>创建时间</text>
              <view slot="suffix" class="list-extra">{{activity.createdAt}}</view>
            </w-list-item>
          </w-list>

          <w-divider />

          <!-- 活动描述 -->
          <view class="section-title">活动描述</view>
          <view class="desc-content">
            <w-ellipsis expandable lineClamp="{{4}}">{{activity.description}}</w-ellipsis>
          </view>

          <view class="bottom-spacer"></view>
        </block>

        <view wx:else class="empty-wrap">
          <w-empty description="活动不存在或已被删除" />
        </view>
      </w-layout-content>
    </w-layout>

    <!-- 底部操作栏 -->
    <view class="action-bar" wx:if="{{activity}}">
      <w-button bind:tap="onShare" class="action-btn">分享</w-button>
      <w-button wx:if="{{activity.canEdit}}" bind:tap="onEdit" class="action-btn">编辑</w-button>
      <w-button
        wx:if="{{activity.canPause}}"
        bind:tap="onToggleStatus"
        type="warning"
        class="action-btn action-btn--main"
      >暂停活动</w-button>
      <w-button
        wx:elif="{{activity.canResume}}"
        bind:tap="onToggleStatus"
        type="primary"
        class="action-btn action-btn--main"
      >恢复活动</w-button>
      <w-button
        wx:elif="{{activity.canPublish}}"
        bind:tap="onPublish"
        type="primary"
        class="action-btn action-btn--main"
      >发布活动</w-button>
    </view>
  </w-theme-provider>
</view>
```

- [ ] **Step 3: 更新 detail.js（移除 drawer 逻辑，加 popover 及参与者 mock）**

```js
import { getActivityById, statusConfig } from '../../utils/mock';

const MOCK_AVATARS = [
  'https://picsum.photos/seed/u1/100/100',
  'https://picsum.photos/seed/u2/100/100',
  'https://picsum.photos/seed/u3/100/100',
  'https://picsum.photos/seed/u4/100/100',
  'https://picsum.photos/seed/u5/100/100',
];

Page({
  data: {
    theme: {},
    activity: null,
    participants: [],
  },

  onLoad(options) {
    this.loadTheme();
    this.loadActivity(options.id);
  },

  onShow() {
    this.loadTheme();
  },

  loadTheme() {
    const app = getApp();
    this.setData({ theme: app.globalData.theme });
  },

  loadActivity(id) {
    const raw = getActivityById(id);
    if (!raw) return;

    const statusInfo = statusConfig[raw.status] || {};
    const progressRate =
      raw.targetCount > 0 ? Math.round((raw.actualCount / raw.targetCount) * 100) : 0;

    const activity = {
      ...raw,
      statusLabel: statusInfo.label || raw.status,
      statusType: statusInfo.type || 'default',
      progressRate,
      canEdit: raw.status === 'draft' || raw.status === 'paused',
      canPublish: raw.status === 'draft',
      canPause: raw.status === 'active',
      canResume: raw.status === 'paused',
    };

    const count = Math.min(raw.actualCount, 5);
    const participants = MOCK_AVATARS.slice(0, count).map((avatar, i) => ({
      id: i,
      avatar,
    }));

    this.setData({ activity, participants });
  },

  onBack() {
    wx.navigateBack();
  },

  onPopoverSelect(e) {
    const { key } = e.detail;
    if (key === 'edit') this.onEdit();
    if (key === 'delete') {
      wx.showModal({
        title: '确认删除',
        content: '删除后无法恢复，确定要删除该活动吗？',
        confirmColor: '#fa5151',
        success: (res) => {
          if (res.confirm) wx.navigateBack();
        },
      });
    }
  },

  onEdit() {
    const { activity } = this.data;
    wx.navigateTo({ url: `/pages/form/form?id=${activity.id}` });
  },

  onShare() {
    wx.navigateTo({ url: `/pages/share/share?id=${this.data.activity.id}` });
  },

  onPublish() {
    wx.showToast({ title: '活动已发布', icon: 'success' });
  },

  onToggleStatus() {
    const { activity } = this.data;
    const msg = activity.canPause ? '活动已暂停' : '活动已恢复';
    wx.showToast({ title: msg, icon: 'success' });
  },
});
```

- [ ] **Step 4: 更新 detail.scss（替换全文）**

```scss
@import '../../miniprogram_npm/wedux-ui/styles/iconfont.scss';

.page {
  height: 100%;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 32rpx;

  &__title {
    font-size: 34rpx;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.nav-back,
.nav-more {
  font-size: 40rpx;
  color: var(--color-text-secondary);
}

.cover-wrap {
  position: relative;
}

.cover-tag {
  position: absolute !important;
  bottom: 16rpx;
  right: 16rpx;
}

.title-section {
  padding: 32rpx 32rpx 24rpx;
}

.title-text {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 12rpx;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.meta-icon {
  font-size: 26rpx;
  color: var(--color-text-secondary);
}

.meta-text {
  font-size: 26rpx;
  color: var(--color-text-secondary);
}

.meta-dot {
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: var(--color-separator);
  margin: 0 8rpx;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

// 统计网格
.stats-grid {
  display: flex;
  padding: 32rpx 0;

  &__item {
    flex: 1;
    text-align: center;

    &--divider {
      border-left: 1rpx solid var(--color-separator);
    }
  }

  &__value {
    font-size: 40rpx;
    font-weight: 700;
    color: var(--color-text-primary);

    &--brand {
      color: var(--color-brand);
    }
  }

  &__label {
    font-size: 24rpx;
    color: var(--color-text-secondary);
    margin-top: 6rpx;
  }
}

.progress-section {
  padding: 0 32rpx 32rpx;
}

.progress-track {
  height: 8rpx;
  background: var(--color-separator);
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-brand);
  border-radius: 4rpx;
}

.progress-hint {
  font-size: 22rpx;
  color: var(--color-text-secondary);
  margin-top: 8rpx;
  display: block;
}

.participants-section {
  padding: 24rpx 32rpx;
}

.participants-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.participants-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text-primary);
}

.participants-count {
  font-size: 24rpx;
  color: var(--color-text-secondary);
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text-primary);
  padding: 24rpx 32rpx 8rpx;
}

.list-extra {
  font-size: 26rpx;
  color: var(--color-text-secondary);
}

.desc-content {
  padding: 0 32rpx 32rpx;
  font-size: 28rpx;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

// popover 菜单
.popover-menu {
  min-width: 200rpx;
}

.popover-item {
  padding: 20rpx 32rpx;
  font-size: 28rpx;
  color: var(--color-text-primary);

  &--danger {
    color: var(--color-danger);
  }
}

// 底部操作栏
.action-bar {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: var(--color-bg-elevated);
  border-top: 1rpx solid var(--color-separator);
}

.action-btn {
  flex: 1;

  &--main {
    flex: 2;
  }
}

.empty-wrap {
  padding: 120rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bottom-spacer {
  height: 160rpx;
}
```

- [ ] **Step 5: 提交**

```bash
git add packages-private/app/pages/detail/
git commit -m "feat(app): rewrite detail with popover menu, 3-col stats, avatar-group"
```

---

## Task 6: 活动表单页更新（Form）

主要变化：增加 `w-tree-select` 门店选择（替换文字输入的 location 字段），引入 storeTree 数据。

**Files:**
- Modify: `packages-private/app/pages/form/form.json`
- Modify: `packages-private/app/pages/form/form.wxml`（局部修改 location 字段）
- Modify: `packages-private/app/pages/form/form.js`（引入 storeTree）

- [ ] **Step 1: 更新 form.json，添加 w-tree-select**

在现有 `usingComponents` 中追加一条（其余不变）：

```json
"w-tree-select": "wedux-ui/components/tree-select/tree-select"
```

完整 JSON：

```json
{
  "usingComponents": {
    "w-theme-provider": "wedux-ui/components/theme-provider/theme-provider",
    "w-layout": "wedux-ui/components/layout/layout",
    "w-layout-header": "wedux-ui/components/layout-header/layout-header",
    "w-layout-content": "wedux-ui/components/layout-content/layout-content",
    "w-navigation-bar": "wedux-ui/components/navigation-bar/navigation-bar",
    "w-form": "wedux-ui/components/form/form",
    "w-form-item": "wedux-ui/components/form-item/form-item",
    "w-input": "wedux-ui/components/input/input",
    "w-textarea": "wedux-ui/components/textarea/textarea",
    "w-select": "wedux-ui/components/select/select",
    "w-date-picker": "wedux-ui/components/date-picker/date-picker",
    "w-time-picker": "wedux-ui/components/time-picker/time-picker",
    "w-upload": "wedux-ui/components/upload/upload",
    "w-checkbox-group": "wedux-ui/components/checkbox-group/checkbox-group",
    "w-checkbox": "wedux-ui/components/checkbox/checkbox",
    "w-stepper": "wedux-ui/components/stepper/stepper",
    "w-switch": "wedux-ui/components/switch/switch",
    "w-button": "wedux-ui/components/button/button",
    "w-divider": "wedux-ui/components/divider/divider",
    "w-tag": "wedux-ui/components/tag/tag",
    "w-tree-select": "wedux-ui/components/tree-select/tree-select"
  },
  "navigationStyle": "custom",
  "disableScroll": true
}
```

- [ ] **Step 2: 在 form.wxml 中，将「活动地点」w-input 替换为 w-tree-select**

找到以下片段：

```xml
            <w-form-item label="活动地点" path="location">
              <w-input
                value="{{formData.location}}"
                placeholder="请输入活动地点（可选）"
                bind:change="onLocationChange"
              />
            </w-form-item>
```

替换为：

```xml
            <w-form-item label="适用门店" path="location">
              <w-tree-select
                value="{{formData.location}}"
                data="{{storeTree}}"
                placeholder="请选择适用门店"
                multiple
                checkable
                cascade
                bind:change="onLocationChange"
              />
            </w-form-item>
```

- [ ] **Step 3: 更新 form.js，引入 storeTree**

在文件顶部导入行中追加 `storeTree`：

```js
import { activityTypes, tagOptions, storeTree } from '../../utils/mock';
```

在 `data` 对象中追加 `storeTree`：

```js
storeTree,
```

`formData.location` 初始值改为数组（tree-select 多选返回数组）：

```js
formData: {
  // ... 其他字段不变
  location: [],
  // ...
}
```

`onLocationChange` 处理函数保持不变（接收 `e.detail.value` 即可）。

- [ ] **Step 4: 提交**

```bash
git add packages-private/app/pages/form/
git commit -m "feat(app): add tree-select for store selection in activity form"
```

---

## Task 7: 数据报表页（Analytics）— 全新

**Files:**
- Create: `packages-private/app/pages/analytics/analytics.json`
- Create: `packages-private/app/pages/analytics/analytics.wxml`
- Create: `packages-private/app/pages/analytics/analytics.js`
- Create: `packages-private/app/pages/analytics/analytics.scss`

- [ ] **Step 1: 创建 analytics.json**

```json
{
  "usingComponents": {
    "w-theme-provider": "wedux-ui/components/theme-provider/theme-provider",
    "w-layout": "wedux-ui/components/layout/layout",
    "w-layout-header": "wedux-ui/components/layout-header/layout-header",
    "w-layout-content": "wedux-ui/components/layout-content/layout-content",
    "w-navigation-bar": "wedux-ui/components/navigation-bar/navigation-bar",
    "w-tab-bar": "wedux-ui/components/tab-bar/tab-bar",
    "w-marquee": "wedux-ui/components/marquee/marquee",
    "w-carousel": "wedux-ui/components/carousel/carousel",
    "w-carousel-item": "wedux-ui/components/carousel-item/carousel-item",
    "w-price": "wedux-ui/components/price/price",
    "w-number-animation": "wedux-ui/components/number-animation/number-animation",
    "w-list": "wedux-ui/components/list/list",
    "w-list-item": "wedux-ui/components/list-item/list-item",
    "w-tag": "wedux-ui/components/tag/tag",
    "w-watermark": "wedux-ui/components/watermark/watermark",
    "w-image": "wedux-ui/components/image/image",
    "w-ellipsis": "wedux-ui/components/ellipsis/ellipsis"
  },
  "navigationStyle": "custom",
  "disableScroll": true
}
```

- [ ] **Step 2: 创建 analytics.wxml**

```xml
<view class="page">
  <w-theme-provider theme="{{theme}}" style="height: 100%">
    <w-watermark content="wedux-ui" style="height: 100%">
      <w-layout>
        <w-layout-header position="static">
          <w-navigation-bar title="数据报表" back="{{false}}" />
          <view class="tab-wrap">
            <w-tab-bar
              items="{{tabs}}"
              active="{{activeTab}}"
              bind:change="onTabChange"
            />
          </view>
        </w-layout-header>

        <w-layout-content>
          <!-- 滚动公告 -->
          <view class="marquee-wrap">
            <view class="iconfont icon-notice marquee-icon"></view>
            <w-marquee text="{{data.announcements}}" class="marquee-text" />
          </view>

          <!-- 概览 Tab -->
          <block wx:if="{{activeTab === 'overview'}}">
            <!-- KPI 卡片 2×2 -->
            <view class="kpi-grid">
              <view class="kpi-card">
                <view class="kpi-card__label">本月营收</view>
                <w-price price="{{data.monthRevenue}}" size="lg" />
                <view class="kpi-card__trend trend--up">↑ {{data.revenueGrowth}}% 环比</view>
              </view>
              <view class="kpi-card">
                <view class="kpi-card__label">参与转化率</view>
                <view class="kpi-card__value">
                  <w-number-animation
                    to="{{data.conversionRate}}"
                    decimal="{{1}}"
                    duration="{{800}}"
                    active="{{animate}}"
                  />%
                </view>
                <view class="kpi-card__trend trend--down">↓ {{data.conversionDelta}}% 环比</view>
              </view>
              <view class="kpi-card">
                <view class="kpi-card__label">活动完成率</view>
                <view class="kpi-card__value">
                  <w-number-animation
                    to="{{data.completionRate}}"
                    decimal="{{1}}"
                    duration="{{1000}}"
                    active="{{animate}}"
                  />%
                </view>
                <view class="kpi-card__trend">综合统计</view>
              </view>
              <view class="kpi-card">
                <view class="kpi-card__label">平均参与人数</view>
                <view class="kpi-card__value">
                  <w-number-animation
                    to="{{data.avgParticipants}}"
                    duration="{{900}}"
                    active="{{animate}}"
                  />
                </view>
                <view class="kpi-card__trend">人/活动</view>
              </view>
            </view>

            <!-- 图表卡片轮播 -->
            <view class="section-title">数据图表</view>
            <w-carousel autoplay interval="{{4000}}" class="chart-carousel">
              <!-- 第1张：活动类型分布 -->
              <w-carousel-item>
                <view class="chart-card">
                  <view class="chart-card__title">活动类型分布</view>
                  <view class="bar-chart">
                    <view
                      wx:for="{{data.typeDistribution}}"
                      wx:key="label"
                      class="bar-row"
                    >
                      <text class="bar-label">{{item.label}}</text>
                      <view class="bar-track">
                        <view
                          class="bar-fill"
                          style="width: {{item.value}}%; background: {{item.color}}"
                        ></view>
                      </view>
                      <text class="bar-value">{{item.value}}%</text>
                    </view>
                  </view>
                </view>
              </w-carousel-item>

              <!-- 第2张：月度营收趋势 -->
              <w-carousel-item>
                <view class="chart-card">
                  <view class="chart-card__title">月度营收趋势</view>
                  <view class="trend-chart">
                    <view
                      wx:for="{{data.monthlyTrend}}"
                      wx:key="month"
                      class="trend-col"
                    >
                      <view class="trend-col__bar-wrap">
                        <view
                          class="trend-col__bar"
                          style="height: {{item.revenue / item.max * 100}}%"
                        ></view>
                      </view>
                      <text class="trend-col__label">{{item.month}}</text>
                      <text class="trend-col__value">{{item.revenue / 10000}}万</text>
                    </view>
                  </view>
                </view>
              </w-carousel-item>

              <!-- 第3张：目标完成率 -->
              <w-carousel-item>
                <view class="chart-card">
                  <view class="chart-card__title">活动目标完成情况</view>
                  <view class="completion-chart">
                    <view class="completion-ring">
                      <view class="completion-ring__inner">
                        <view class="completion-ring__value">{{data.completionRate}}%</view>
                        <view class="completion-ring__label">已完成</view>
                      </view>
                    </view>
                    <view class="completion-legend">
                      <view class="legend-item">
                        <view class="legend-dot legend-dot--brand"></view>
                        <text>已达标活动</text>
                      </view>
                      <view class="legend-item">
                        <view class="legend-dot legend-dot--muted"></view>
                        <text>未达标活动</text>
                      </view>
                    </view>
                  </view>
                </view>
              </w-carousel-item>
            </w-carousel>

            <!-- 参与人数排行 -->
            <view class="section-title">参与人数排行</view>
            <view class="ranking-list">
              <view
                wx:for="{{data.ranking}}"
                wx:key="title"
                class="ranking-item"
              >
                <view class="ranking-item__rank ranking-item__rank--{{index < 3 ? index + 1 : 'normal'}}">{{index + 1}}</view>
                <w-ellipsis class="ranking-item__title" lineClamp="{{1}}">{{item.title}}</w-ellipsis>
                <view class="ranking-item__count">{{item.count}}人</view>
              </view>
            </view>
          </block>

          <!-- 活动 Tab -->
          <block wx:elif="{{activeTab === 'activities'}}">
            <view class="activity-tab-list">
              <view
                wx:for="{{activityList}}"
                wx:key="id"
                class="activity-mini-card"
              >
                <w-image
                  src="{{item.coverImage}}"
                  mode="aspectFill"
                  width="120rpx"
                  height="80rpx"
                  radius="8rpx"
                />
                <view class="activity-mini-card__body">
                  <w-ellipsis class="activity-mini-card__title" lineClamp="{{1}}">{{item.title}}</w-ellipsis>
                  <view class="activity-mini-card__meta">
                    <w-tag type="{{item.statusType}}" size="small">{{item.statusLabel}}</w-tag>
                    <text class="activity-mini-card__count">{{item.actualCount}}/{{item.targetCount}}人</text>
                  </view>
                </view>
              </view>
            </view>
          </block>

          <!-- 趋势 Tab -->
          <block wx:elif="{{activeTab === 'trend'}}">
            <view class="trend-section">
              <view class="section-title" style="padding-top: 24rpx">月度营收对比</view>
              <view class="month-bars">
                <view
                  wx:for="{{data.monthlyTrend}}"
                  wx:key="month"
                  class="month-bar-item"
                >
                  <view class="month-bar-item__bar-wrap">
                    <view
                      class="month-bar-item__bar"
                      style="height: {{item.revenue / item.max * 100}}%"
                    >
                      <text class="month-bar-item__value">{{item.revenue / 10000}}万</text>
                    </view>
                  </view>
                  <text class="month-bar-item__month">{{item.month}}</text>
                </view>
              </view>
              <view class="section-title">营收 KPI</view>
              <view class="trend-kpi-row">
                <view class="trend-kpi-card">
                  <view class="trend-kpi-card__label">最高单月</view>
                  <w-price price="{{128600}}" size="md" />
                </view>
                <view class="trend-kpi-card">
                  <view class="trend-kpi-card__label">月均营收</view>
                  <w-price price="{{110800}}" size="md" />
                </view>
              </view>
            </view>
          </block>

          <view class="bottom-spacer"></view>
        </w-layout-content>
      </w-layout>
    </w-watermark>
  </w-theme-provider>
</view>
```

- [ ] **Step 3: 创建 analytics.js**

```js
import { activities, analyticsData, statusConfig } from '../../utils/mock';

Page({
  data: {
    theme: {},
    tabs: [
      { key: 'overview', label: '概览' },
      { key: 'activities', label: '活动' },
      { key: 'trend', label: '趋势' },
    ],
    activeTab: 'overview',
    data: analyticsData,
    activityList: [],
    animate: false,
  },

  onLoad() {
    this.loadTheme();
    this.loadActivityList();
  },

  onShow() {
    this.loadTheme();
    this.setData({ animate: true });
  },

  loadTheme() {
    const app = getApp();
    this.setData({ theme: app.globalData.theme });
  },

  loadActivityList() {
    const list = activities.map((a) => ({
      ...a,
      statusLabel: statusConfig[a.status]?.label || a.status,
      statusType: statusConfig[a.status]?.type || 'default',
    }));
    this.setData({ activityList: list });
  },

  onTabChange(e) {
    this.setData({ activeTab: e.detail.key });
  },
});
```

- [ ] **Step 4: 创建 analytics.scss**

```scss
@import '../../miniprogram_npm/wedux-ui/styles/iconfont.scss';

.page {
  height: 100%;
}

.tab-wrap {
  background: var(--color-bg-elevated);
  border-bottom: 1rpx solid var(--color-separator);
}

// 公告条
.marquee-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  background: rgba(250, 157, 59, 0.1);
  border-bottom: 1rpx solid rgba(250, 157, 59, 0.2);
}

.marquee-icon {
  font-size: 30rpx;
  color: var(--color-warning);
  flex-shrink: 0;
}

.marquee-text {
  flex: 1;
  font-size: 24rpx;
  color: var(--color-warning);
}

// KPI 网格
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  padding: 24rpx;
}

.kpi-card {
  background: var(--color-bg-elevated);
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  &__label {
    font-size: 24rpx;
    color: var(--color-text-secondary);
    margin-bottom: 10rpx;
  }

  &__value {
    font-size: 40rpx;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  &__trend {
    font-size: 22rpx;
    color: var(--color-text-secondary);
    margin-top: 8rpx;
  }
}

.trend--up {
  color: var(--color-success);
}

.trend--down {
  color: var(--color-danger);
}

// 图表轮播
.chart-carousel {
  margin: 0 24rpx;
  border-radius: 20rpx;
  overflow: hidden;
  height: 320rpx !important;
}

.chart-card {
  background: var(--color-bg-elevated);
  border-radius: 20rpx;
  padding: 32rpx;
  height: 320rpx;
  box-sizing: border-box;

  &__title {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 24rpx;
  }
}

// 条形图
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.bar-label {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  width: 100rpx;
  text-align: right;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 16rpx;
  background: var(--color-separator);
  border-radius: 8rpx;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.5s ease;
}

.bar-value {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  width: 60rpx;
}

// 趋势柱状图（轮播第2张）
.trend-chart {
  display: flex;
  align-items: flex-end;
  gap: 24rpx;
  height: 180rpx;
}

.trend-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__bar-wrap {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
  }

  &__bar {
    width: 100%;
    background: var(--color-brand);
    border-radius: 6rpx 6rpx 0 0;
    min-height: 8rpx;
  }

  &__label {
    font-size: 20rpx;
    color: var(--color-text-secondary);
    margin-top: 8rpx;
  }

  &__value {
    font-size: 20rpx;
    color: var(--color-brand);
    font-weight: 600;
  }
}

// 完成率环形（第3张，CSS 模拟）
.completion-chart {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.completion-ring {
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
  background: conic-gradient(var(--color-brand) 0% 83%, var(--color-separator) 83% 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &__inner {
    width: 110rpx;
    height: 110rpx;
    border-radius: 50%;
    background: var(--color-bg-elevated);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &__value {
    font-size: 28rpx;
    font-weight: 700;
    color: var(--color-brand);
  }

  &__label {
    font-size: 18rpx;
    color: var(--color-text-secondary);
  }
}

.completion-legend {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 24rpx;
  color: var(--color-text-secondary);
}

.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;

  &--brand {
    background: var(--color-brand);
  }

  &--muted {
    background: var(--color-separator);
  }
}

// 排行榜
.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text-primary);
  padding: 24rpx 24rpx 16rpx;
}

.ranking-list {
  background: var(--color-bg-elevated);
  margin: 0 24rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid var(--color-separator);

  &:last-child {
    border-bottom: none;
  }

  &__rank {
    width: 44rpx;
    height: 44rpx;
    border-radius: 50%;
    background: var(--color-separator);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 700;
    color: var(--color-text-secondary);
    flex-shrink: 0;

    &--1 {
      background: #fa9d3b;
      color: #fff;
    }

    &--2 {
      background: var(--color-text-secondary);
      color: #fff;
    }

    &--3 {
      background: #cd7f32;
      color: #fff;
    }
  }

  &__title {
    flex: 1;
    font-size: 28rpx;
    color: var(--color-text-primary);
  }

  &__count {
    font-size: 26rpx;
    font-weight: 600;
    color: var(--color-brand);
  }
}

// 活动 Tab
.activity-tab-list {
  padding: 16rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.activity-mini-card {
  display: flex;
  gap: 20rpx;
  align-items: center;
  background: var(--color-bg-elevated);
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.04);

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 28rpx;
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: 12rpx;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  &__count {
    font-size: 24rpx;
    color: var(--color-text-secondary);
  }
}

// 趋势 Tab
.trend-section {
  padding: 0 24rpx;
}

.month-bars {
  display: flex;
  align-items: flex-end;
  gap: 16rpx;
  height: 280rpx;
  background: var(--color-bg-elevated);
  border-radius: 20rpx;
  padding: 32rpx 24rpx 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.month-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__bar-wrap {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  &__bar {
    width: 100%;
    background: var(--color-brand);
    border-radius: 8rpx 8rpx 0 0;
    min-height: 8rpx;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 6rpx;
  }

  &__value {
    font-size: 18rpx;
    color: var(--color-brand);
    text-align: center;
    transform: translateY(-24rpx);
    display: block;
  }

  &__month {
    font-size: 22rpx;
    color: var(--color-text-secondary);
    margin-top: 8rpx;
  }
}

.trend-kpi-row {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}

.trend-kpi-card {
  flex: 1;
  background: var(--color-bg-elevated);
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.04);

  &__label {
    font-size: 24rpx;
    color: var(--color-text-secondary);
    margin-bottom: 8rpx;
  }
}

.bottom-spacer {
  height: 48rpx;
}
```

- [ ] **Step 5: 提交**

```bash
git add packages-private/app/pages/analytics/
git commit -m "feat(app): add analytics page with tab-bar, marquee, carousel charts"
```

---

## Task 8: 我的页重写（Settings）

**Files:**
- Modify: `packages-private/app/pages/settings/settings.wxml`
- Modify: `packages-private/app/pages/settings/settings.js`
- Modify: `packages-private/app/pages/settings/settings.scss`

（settings.json 无需改动：原页面已注册 w-avatar、w-badge、w-switch、w-color-picker、w-list、w-list-item、w-divider、w-button，新 WXML 未引入额外组件。）

- [ ] **Step 1: 重写 settings.wxml**

```xml
<view class="page">
  <w-theme-provider theme="{{theme}}" style="height: 100%">
    <w-layout>
      <w-layout-header position="static">
        <w-navigation-bar title="我的" back="{{false}}" />
      </w-layout-header>
      <w-layout-content>

        <!-- Profile 卡片 -->
        <view class="profile-card">
          <view class="profile-card__avatar-wrap">
            <w-avatar src="https://picsum.photos/seed/admin/200/200" size="large" />
            <w-badge class="profile-badge" value="{{noticeCount}}" max="{{99}}" />
          </view>
          <view class="profile-card__info">
            <view class="profile-card__name">运营管理员</view>
            <view class="profile-card__role">超级管理员 · 全国门店</view>
          </view>
          <view class="profile-card__edit">编辑 ›</view>
        </view>

        <!-- 小统计 -->
        <view class="profile-stats">
          <view class="profile-stat">
            <view class="profile-stat__value">{{totalActivities}}</view>
            <view class="profile-stat__label">活动</view>
          </view>
          <view class="profile-stat profile-stat--divider">
            <view class="profile-stat__value">1,492</view>
            <view class="profile-stat__label">参与人次</view>
          </view>
          <view class="profile-stat profile-stat--divider">
            <view class="profile-stat__value profile-stat__value--brand">¥128k</view>
            <view class="profile-stat__label">本月营收</view>
          </view>
        </view>

        <w-divider />

        <!-- 外观 -->
        <view class="section-title">外观</view>
        <w-list>
          <w-list-item>
            <text>深色模式</text>
            <w-switch
              slot="suffix"
              checked="{{themeMode === 'dark'}}"
              bind:update:checked="onThemeModeChange"
            />
          </w-list-item>
        </w-list>

        <!-- 主题色 -->
        <view class="section-title">主题色</view>
        <view class="color-section">
          <view class="preset-colors">
            <view
              wx:for="{{presetColors}}"
              wx:key="value"
              class="color-dot {{primaryColor === item.value ? 'color-dot--active' : ''}}"
              style="background: {{item.value}};"
              data-color="{{item.value}}"
              bind:tap="onPresetColorTap"
            >
              <view wx:if="{{primaryColor === item.value}}" class="iconfont icon-check color-dot__check"></view>
            </view>
          </view>
          <view class="color-picker-row">
            <view class="color-picker-label">自定义</view>
            <w-color-picker value="{{primaryColor}}" bind:update:value="onColorChange" />
          </view>
          <w-button size="small" class="reset-btn" bind:tap="onResetTheme">恢复默认</w-button>
        </view>

        <w-divider />

        <!-- 功能 -->
        <view class="section-title">功能</view>
        <w-list>
          <w-list-item>
            <text>消息通知</text>
            <view slot="suffix" class="list-arrow">›</view>
          </w-list-item>
          <w-list-item>
            <text>导出报表</text>
            <view slot="suffix" class="list-arrow">›</view>
          </w-list-item>
          <w-list-item>
            <text>帮助与反馈</text>
            <view slot="suffix" class="list-arrow">›</view>
          </w-list-item>
        </w-list>

        <w-divider />

        <!-- 关于 -->
        <view class="section-title">关于</view>
        <w-list>
          <w-list-item>
            <text>版本</text>
            <view slot="suffix" class="list-extra">v2.0.0</view>
          </w-list-item>
          <w-list-item>
            <text>组件库</text>
            <view slot="suffix" class="list-extra">wedux-ui v0.6.1</view>
          </w-list-item>
        </w-list>

        <view class="bottom-spacer"></view>
      </w-layout-content>
    </w-layout>
  </w-theme-provider>
</view>
```

- [ ] **Step 2: 重写 settings.js**

```js
import { activities } from '../../utils/mock';

Page({
  data: {
    theme: {},
    themeMode: 'light',
    primaryColor: '#07c160',
    noticeCount: 3,
    totalActivities: activities.length,
    presetColors: [
      { value: '#07c160', label: '默认绿' },
      { value: '#10aeff', label: '天蓝' },
      { value: '#fa9d3b', label: '橙黄' },
      { value: '#6366f1', label: '靛紫' },
      { value: '#fa5151', label: '朱红' },
    ],
  },

  onLoad() {
    this.loadTheme();
  },

  onShow() {
    this.loadTheme();
  },

  loadTheme() {
    const app = getApp();
    const { themeMode, primaryColor, theme } = app.globalData;
    this.setData({ themeMode, primaryColor, theme });
  },

  onThemeModeChange(e) {
    const mode = e.detail.value ? 'dark' : 'light';
    const app = getApp();
    app.setThemeMode(mode);
    this.setData({ themeMode: mode, theme: app.globalData.theme });
  },

  onPresetColorTap(e) {
    const { color } = e.currentTarget.dataset;
    this.applyColor(color);
  },

  onColorChange(e) {
    this.applyColor(e.detail.value);
  },

  applyColor(color) {
    const app = getApp();
    app.setPrimaryColor(color);
    this.setData({ primaryColor: color, theme: app.globalData.theme });
  },

  onResetTheme() {
    this.applyColor('#07c160');
    const app = getApp();
    app.setThemeMode('light');
    this.setData({ themeMode: 'light', theme: app.globalData.theme });
  },
});
```

- [ ] **Step 3: 重写 settings.scss**

```scss
@import '../../miniprogram_npm/wedux-ui/styles/iconfont.scss';

.page {
  height: 100%;
}

// Profile 卡片
.profile-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx 32rpx 0;

  &__avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
  }

  &__name {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__role {
    font-size: 24rpx;
    color: var(--color-text-secondary);
    margin-top: 6rpx;
  }

  &__edit {
    font-size: 26rpx;
    color: var(--color-brand);
  }
}

.profile-badge {
  position: absolute !important;
  top: -4rpx;
  right: -4rpx;
}

// Profile 小统计
.profile-stats {
  display: flex;
  padding: 24rpx 32rpx 32rpx;
  border-bottom: 1rpx solid var(--color-separator);
}

.profile-stat {
  flex: 1;
  text-align: center;

  &--divider {
    border-left: 1rpx solid var(--color-separator);
  }

  &__value {
    font-size: 32rpx;
    font-weight: 700;
    color: var(--color-text-primary);

    &--brand {
      color: var(--color-brand);
    }
  }

  &__label {
    font-size: 22rpx;
    color: var(--color-text-secondary);
    margin-top: 4rpx;
  }
}

.section-title {
  font-size: 24rpx;
  color: var(--color-text-secondary);
  padding: 24rpx 32rpx 8rpx;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.color-section {
  padding: 16rpx 32rpx;
}

.preset-colors {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.color-dot {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &--active {
    box-shadow: 0 0 0 4rpx rgba(0, 0, 0, 0.15);
  }

  &__check {
    font-size: 24rpx;
    color: #fff;
  }
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.color-picker-label {
  font-size: 26rpx;
  color: var(--color-text-secondary);
}

.reset-btn {
  margin-top: 4rpx;
}

.list-arrow,
.list-extra {
  font-size: 26rpx;
  color: var(--color-text-secondary);
}

.bottom-spacer {
  height: 48rpx;
}
```

- [ ] **Step 4: 提交**

```bash
git add packages-private/app/pages/settings/
git commit -m "feat(app): rewrite settings with profile stats card and clean layout"
```

---

## 完成检查

- [ ] 在微信开发者工具打开 `packages-private/app`，确认 4 个 Tab 均可切换
- [ ] 首页：横向滚动活动卡片、统计数字动画、营收 w-price 正常显示
- [ ] 活动列表：搜索过滤生效、筛选 Tab 切换正常、浮动按钮可见
- [ ] 活动详情：popover 菜单弹出、头像组展示、底部操作栏按钮根据状态显示
- [ ] 活动表单：tree-select 门店选择弹出树形结构
- [ ] 数据页：marquee 滚动、carousel 可手动滑动、三个 Tab 切换正常
- [ ] 我的页：主题色切换同步更新 Tab Bar 颜色、深色模式切换正常
