# packages-private/app 重设计规格

**日期：** 2026-05-18  
**范围：** `packages-private/app` 全量重做  
**目标：** 视觉质量 + 功能完整性 + wedux-ui 组件覆盖率三向提升

---

## 1. 背景与目标

现有 app 是「门店活动运营」Demo 小程序，用于展示 wedux-ui 组件库。当前问题：
- 界面朴素，卡片投影/层次感不足
- 功能偏简，表单组件覆盖不全，缺少数据报表页
- 部分组件（stepper、upload、tree-select、carousel、marquee、tab-bar、price 等）未得到展示

**重设计策略：** 以真实产品逻辑为骨架，在功能设计时主动选择能充分展示 wedux-ui 的路径。

---

## 2. 导航架构

### Tab Bar（4 个）

| Tab | 路径 | 标题 |
|-----|------|------|
| 首页 | `pages/dashboard/dashboard` | 首页 |
| 活动 | `pages/list/list` | 活动 |
| 数据 | `pages/analytics/analytics` | 数据 |
| 我的 | `pages/settings/settings` | 我的 |

系统原生 tabBar（`app.json` 定义）保持不变，主题色切换时通过 `wx.setTabBarStyle()` 动态更新 `selectedColor`，使 tabBar 跟随主题色变化。

### 子页面

| 路径 | 入口 | 说明 |
|------|------|------|
| `pages/detail/detail` | 活动列表点击 | 活动详情 |
| `pages/form/form` | 新建/编辑活动 | 活动表单 |
| `pages/share/share` | 详情页分享按钮 | 分享二维码（保持现有） |

---

## 3. 视觉规范

**风格：** 清爽商务——白底、卡片投影（`box-shadow: 0 1px 6px rgba(0,0,0,.06)`）、绿色主调。
**卡片圆角：** `12rpx`（当前 `8rpx`，统一升级）  
**间距：** 页面内边距 `24rpx`，卡片间距 `16rpx`，与 `--spacing-md/sm` token 对应  
**投影：** 所有卡片统一使用轻投影，区分层次

---

## 4. 各页面设计

### 4.1 首页（dashboard）

**结构（从上至下）：**
1. `w-navigation-bar` — 标题「运营助手」+ 右侧通知图标（`w-badge` 显示未读数）
2. Hero 卡片 — 头像（`w-avatar`）+ 问候语 + 本月营收（`w-price` + `w-number-animation`）+ 环比涨幅
3. 3 列统计卡片 — 进行中、累计参与、总活动数，各用 `w-number-animation`
4. 快捷操作 4 宫格 — 新建活动、活动列表、数据报表（跳数据 Tab）、主题设置（跳我的 Tab）
5. 「最近活动」区块 — 标题 + 「查看全部」
6. **横向滚动活动卡片**（`scroll-view`）— 每张卡片含 `w-image`（封面）+ 标题 + `w-tag`（状态）+ 进度条

**变化点（对比现版本）：**
- 导航栏增加通知 `w-badge`
- Hero 卡片嵌入营收大字，替代原 2×2 四格之一
- 统计区从 2×2 改为 3 列，减少视觉噪音
- 最近活动从垂直列表改为横向卡片滚动

### 4.2 活动页（list）

**结构：**
1. `w-navigation-bar` — 「活动管理」+ 右侧筛选/排序图标
2. `w-input` 搜索栏（`type="search"`，`placeholder="搜索活动名称"`）
3. 横向筛选 Tabs（全部 / 进行中 / 草稿 / 已结束 / 已暂停）
4. 活动卡片列表 — 封面图全宽（`w-image mode="aspectFill"`）+ 卡片内容区
   - 内容区：标题（`w-ellipsis lineClamp="1"`）+ `w-tag`（状态）
   - 简介（`w-ellipsis lineClamp="2"`）
   - 时间 + 地点 meta
   - 标签行（`w-tag type="info" size="small"`）
   - 进度条 + 人数文字
5. `w-infinite-scroll` 无限滚动
6. `w-back-top` 回顶
7. **`w-float-button`** 右下角新建活动（替代工具栏文字按钮）
8. `w-drawer`（底部）排序方式选择

**搜索逻辑：** 本地 filter，对 `title` + `description` 做包含匹配。

### 4.3 活动详情（detail）

**结构：**
1. `w-image` 封面全宽大图（高度 `360rpx`，`mode="aspectFill"`）
2. 浮层：左上返回按钮、右上「⋯」触发 `w-popover`（编辑 / 复制 / 删除）
3. 状态 `w-tag` 悬浮于封面右下角
4. 白底内容区：
   - 标题 + 活动类型 + 地点
   - 3 列统计卡（参与率、已参与人数、预算）
   - `w-avatar-group`：展示参与者头像（mock 随机）+ 「X 人已参与」
   - 时间信息（`w-list` 行）
   - 标签（`w-tag`）
   - 描述（`w-ellipsis` 可展开）
5. 底部操作栏：编辑 / 分享 / 暂停（或继续）

### 4.4 活动表单（form）

使用 `w-form` + `w-form-item`，完整覆盖以下字段：

| 字段 | 组件 | 说明 |
|------|------|------|
| 活动名称 | `w-input` | 必填，maxlength=30 |
| 活动描述 | `w-textarea` | 选填 |
| 活动类型 | `w-select` | 单选 |
| 开始时间 | `w-date-picker` | 必填 |
| 结束时间 | `w-date-picker` | 必填，> 开始时间 |
| 目标人数 | `w-stepper` | min=1，max=9999 |
| 预算（元） | `w-stepper` | min=0，step=1000 |
| 封面图片 | `w-upload` | 最多 1 张 |
| 活动标签 | `w-checkbox-group` | 多选，来自 tagOptions |
| 适用门店 | `w-tree-select` | 树形门店结构（mock） |
| 直接发布 | `w-switch` | 关闭则存草稿 |

校验规则通过 `form.setRules()` 注入（含自定义 validator 函数）。

### 4.5 数据页（analytics）——全新

**结构：**
1. `w-navigation-bar` — 「数据报表」
2. **`w-tab-bar`（页内）** — 概览 / 活动 / 趋势 三段切换
3. `w-marquee` 滚动公告条（预算预警、活动提醒）
4. **概览 Tab：**
   - 2×2 KPI 卡片：本月营收（`w-price`）、参与转化率、活动完成率、平均参与人数（`w-number-animation`）
   - **`w-carousel`** 图表卡片轮播（3 张）：活动类型分布条形图、本周参与趋势折线图（CSS 模拟）、预算执行情况
   - 参与人数排行榜（`w-list` + `w-list-item`）
5. **活动 Tab：** 所有活动卡片列表（精简版，只读）
6. **趋势 Tab：** 月度营收对比卡片（CSS 条形图 + `w-number-animation`）

**数据来源：** 在 `utils/mock.js` 中补充 `analyticsData` 对象，含月度趋势、类型分布、排行数据。

### 4.6 我的页（settings）

**结构：**
1. `w-navigation-bar` — 「我的」
2. Profile 卡片：
   - `w-avatar`（大号）+ `w-badge`（通知未读数）
   - 姓名 + 角色
   - 底部小统计行：活动数 / 参与人次 / 本月营收
3. 外观区块（`w-list`）：
   - 深色模式 `w-switch`
   - 主题色选择：5 个预设色点 + `w-color-picker`（自定义）
4. 功能区块（`w-list`）：消息通知 / 导出报表 / 帮助与反馈
5. 关于区块：版本 / 组件库版本

**移除：** 原有「主题预览」区块（各页实时体现，不再需要单独预览区）

---

## 5. Mock 数据扩展

在 `utils/mock.js` 中新增：

```js
// 门店树形结构（供 w-tree-select 使用）
export const storeTree = [
  { id: 'north', label: '华北区', children: [
    { id: 'bj', label: '北京' },
    { id: 'tj', label: '天津' },
  ]},
  { id: 'east', label: '华东区', children: [
    { id: 'sh', label: '上海' },
    { id: 'hz', label: '杭州' },
  ]},
  // ...
];

// 数据报表数据
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
    { month: '1月', revenue: 98000 },
    { month: '2月', revenue: 112000 },
    { month: '3月', revenue: 105000 },
    { month: '4月', revenue: 128600 },
  ],
  ranking: [
    { title: '清明假期满减活动', count: 723 },
    { title: '春节特惠活动', count: 342 },
    { title: '新品上市发布会', count: 198 },
    { title: '会员日专属福利', count: 167 },
    { title: '老客户回馈专场', count: 62 },
  ],
};
```

---

## 6. 组件覆盖清单

| 组件 | 使用位置 |
|------|---------|
| `w-navigation-bar` | 所有页面 |
| `w-layout / w-layout-*` | 所有页面 |
| `w-theme-provider` | app.js 全局 |
| `w-tab-bar` | 数据页（页内切换）|
| `w-button` | 表单、详情、首页 |
| `w-float-button` | 活动列表 |
| `w-input` | 表单、列表搜索 |
| `w-textarea` | 表单 |
| `w-select` | 表单 |
| `w-switch` | 表单、我的页 |
| `w-date-picker` | 表单 |
| `w-stepper` | 表单 |
| `w-upload` | 表单 |
| `w-checkbox-group / w-checkbox` | 表单标签 |
| `w-tree-select` | 表单门店选择 |
| `w-form / w-form-item` | 表单页 |
| `w-color-picker` | 我的页 |
| `w-card` | 首页统计 |
| `w-image` | 活动卡片、详情 |
| `w-tag` | 活动状态、标签 |
| `w-badge` | 导航通知、头像 |
| `w-avatar / w-avatar-group` | 首页 Hero、详情 |
| `w-list / w-list-item` | 我的页、数据排行 |
| `w-divider` | 我的页分隔 |
| `w-drawer` | 活动排序 |
| `w-popover` | 详情操作菜单 |
| `w-carousel` | 数据图表轮播 |
| `w-marquee` | 数据页公告 |
| `w-number-animation` | 首页、数据页 |
| `w-price` | 首页 Hero、数据页 |
| `w-ellipsis` | 活动标题、描述 |
| `w-infinite-scroll` | 活动列表 |
| `w-back-top` | 活动列表 |
| `w-empty` | 空状态 |
| `w-qr-code` | 分享页 |
| `w-watermark` | 数据页背景 |

---

## 7. 文件变更清单

**新增：**
- `pages/analytics/analytics.{js,wxml,scss,json}`

**重写：**
- `pages/dashboard/dashboard.*`
- `pages/list/list.*`
- `pages/detail/detail.*`
- `pages/form/form.*`
- `pages/settings/settings.*`
- `utils/mock.js`（补充 storeTree、analyticsData）

**修改：**
- `app.json` — 新增 analytics 路由，更新 tabBar 配置
- `app.js` — 主题逻辑保持不变

**保持不变：**
- `pages/share/share.*`
- `miniprogram_npm/`（不触碰）

---

## 8. 不在范围内

- 网络请求 / 真实后端接口（保持 mock）
- 用户登录 / 权限系统
- 消息通知详情页（列表项为占位，不可点击）
- 数据图表使用真实图表库（用 CSS + HTML 模拟）
