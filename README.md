# wedux-ui

轻量、可定制的微信小程序原生组件库

![npm version](https://img.shields.io/npm/v/wedux-ui?color=a1b858&label=npm)
![license](https://img.shields.io/npm/l/wedux-ui)
![platform](https://img.shields.io/badge/platform-wechat--miniprogram-07c160)

`零依赖` · `CSS 变量主题` · `深色模式` · `50+ 组件` · `表单驱动`

---

## 安装

```bash
npm install wedux-ui
```

安装后在**微信开发者工具**中点击 **工具 → 构建 npm**，等待构建完成。

> **注意**：本组件库使用 SCSS 编写，**微信开发者工具不会自动编译 SCSS**，需在 `project.config.json` 中添加 `"useCompilerPlugins": ["sass"]`。

在项目全局样式文件 `app.scss` 中引入：

```scss
@import './miniprogram_npm/wedux-ui/styles/index.scss';
```

如需在页面中直接使用图标字体（`iconfont` 类名），额外引入：

```scss
@import './miniprogram_npm/wedux-ui/styles/iconfont.scss';
```

## 快速上手

在页面或组件的 `.json` 中注册：

```json
{
  "usingComponents": {
    "w-button": "wedux-ui/components/button/button"
  }
}
```

在 `.wxml` 中使用：

```html
<w-button type="primary" bind:tap="onTap">提交</w-button>
```

## 组件一览

**通用** — `Button` `ButtonGroup` `FloatButton` `Icon`

**布局** — `Flex` `Layout` `Divider`

**数据展示** — `Avatar` `AvatarGroup` `Badge` `Card` `Ellipsis` `GradientText` `H` `Highlight` `List` `ListItem` `NumberAnimation` `QrCode` `Tag` `Watermark` `Tree`

**数据录入** — `Form` `FormItem` `Input` `Textarea` `InputOtp` `Select` `Switch` `Radio` `RadioGroup` `Checkbox` `CheckboxGroup` `Rate` `Stepper` `DatePicker` `TimePicker` `Calendar` `ColorPicker` `TreeSelect` `Upload`

**导航** — `NavigationBar` `TabBar` `BackTop`

**反馈** — `Drawer` `Popover` `Tooltip` `InfiniteScroll`

**主题** — `ThemeProvider`

## 主题定制

通过 `ThemeProvider` 组件覆盖设计变量：

```html
<w-theme-provider theme="{{theme}}">
  <w-button type="primary">自定义主题</w-button>
</w-theme-provider>
```

```js
const { lightTheme } = require('wedux-ui/components/theme-provider/presets');

Page({
  data: {
    theme: {
      ...lightTheme,
      '--w-primary-color': '#8b5cf6',
    },
  },
});
```

也可以通过组件级 CSS 变量精确控制单个组件：

```css
page {
  --w-btn-height: 44px;
  --w-btn-radius: 12px;
  --w-input-radius: 8px;
}
```

## 开发

```bash
pnpm install   # 安装依赖
pnpm format    # 格式化代码
pnpm build     # 构建 npm 产物
```

使用**微信开发者工具**打开项目根目录即可预览 Demo。

## 协议

[MIT](./LICENSE)
