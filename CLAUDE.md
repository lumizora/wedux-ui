# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# wedux-ui

微信小程序组件库，支持主题切换。

## 技术栈

- 微信小程序原生框架（WebView + glass-easel）
- 样式：SCSS + CSS 变量（微信开发者工具内置 Sass 编译）
- JavaScript：**ES6+**（const/let、箭头函数、方法简写、模板字符串、解构等）
- 包管理器：pnpm
- 无 npm 依赖，无构建工具，微信开发者工具直接预览调试

## 常用命令

- 格式化代码：`pnpm run format`
- 检查格式：`pnpm run format:check`

## 提交规范

使用 Conventional Commits：`feat(scope): 描述`、`fix(scope): 描述`、`docs: 描述`、`refactor: 描述`、`chore: 描述`。scope 通常为组件名（如 `button`、`input`）。

## 项目结构

```plain-text
wedux-ui/
├── app.js / app.json / app.scss     # 全局入口
├── src/
│   ├── behaviors/                   # 公共 Behavior（formField 等）
│   ├── components/                  # 组件源码（w-* 前缀，含 layout/layout-header/layout-content/layout-footer/layout-sider 等布局组件，tree/tree-select 树形组件，list/list-item 列表组件，badge 徽标组件，empty 空状态组件，stepper 步进器组件，marquee 走马灯组件，price 价格组件，carousel/carousel-item 轮播组件，image 增强图片组件）
│   ├── libs/                        # 工具库（tempo 日期库等）
│   ├── utils/                       # 工具函数（relations 工厂等）
│   └── styles/
│       ├── tokens.scss              # 设计 token（CSS 变量，page {} 内）
│       └── theme.scss               # 深色模式覆盖（@media prefers-color-scheme: dark）
├── pages/index/                     # 组件目录导航页
└── packages/docs/                   # 分包：各组件 demo 演示页
    ├── demo.scss                    # demo 公共样式（各 demo 页面按需引入）
    └── {name}/                      # 各组件 demo 页
```

## 命名规范

- 组件前缀：`w-`（如 `w-button`、`w-input`）
- CSS 类名：BEM — `w-{component}__element--modifier`
- 组件目录：`src/components/{name}/{name}.{js,json,wxml,scss}`

## 设计 Token

所有 token 在 `src/styles/tokens.scss` 的 `page {}` 内定义。**不要在组件内硬编码颜色或尺寸，始终引用 token 变量。若所需 token 尚未定义，先在 tokens.scss 中补充，再在组件中引用。**

### 组件级 CSS 变量

核心组件（button、input、switch、tag、card、badge、drawer、list、divider、avatar、price）定义了 `--w-{component}-*` 命名空间的变量，fallback 到全局 token。用户可通过 theme-provider 精准覆盖单个组件样式。

**命名规则**：`--w-{组件名}-{属性}`，如 `--w-btn-height`、`--w-input-radius`。

**新增组件时**：若组件有常见定制需求（颜色、尺寸、圆角），应在 tokens.scss 中定义组件级变量，在组件 SCSS 中引用，fallback 到全局 token。

### theme-provider

theme-provider 接收两个属性：`theme`（完整主题对象）和 `themeOverrides`（覆盖层）。内置 light/dark 预设定义在 `src/components/theme-provider/presets.js`，用户 require 后传入 theme。

## 样式规则

- **禁用 `cursor: pointer`**：会导致元素出现选中背景样式
- **只读状态无额外样式**：`readonly` 仅阻止交互，不加背景色、不降透明度
- **WXSS 选择器限制**：组件中禁止标签名选择器（`button {}`）、`*`、`#id {}`，只用 class 选择器（BEM）。`page {}` 仅限全局样式文件使用

## ES6+ 编码规范

所有 `.js` 文件必须使用 ES6+：`const`/`let`（禁 `var`）、方法简写、模板字符串、对象简写、`.forEach()`/`.map()`/`.filter()`。

**关键规则：**

- `observers` 和 `relations` 中的回调必须用 `function() {}` 语法（非箭头函数），确保 `this` 指向组件实例
- 普通回调用箭头函数

## WXML 注意事项

- **`<text>` 标签内容必须紧贴标签**：WXML 中 `<text>` 对空白敏感，换行缩进会产生空白文本节点导致撑高。写法：`<text>{{value}}</text>`，禁止在标签与内容间换行。`.prettierrc` 已对 wxml 设置 `htmlWhitespaceSensitivity: "strict"` 以防止自动拆行。

## Slot 注意事项

- **slot 默认内容用 CSS 控制**：小程序不支持 `<slot>` 内的 fallback，在 slot 外层容器上使用 `:empty { display: none; }` 隐藏未传入内容的插槽区域
- **命名 slot 需开启 `multipleSlots`**：JS 中声明 `options: { multipleSlots: true }`

## WXS 注意事项

WXS 严格 ES5：禁 `const`/`let`、箭头函数、模板字符串、展开运算符、解构。正则用 `getRegExp()`，日期用 `getDate()`，对象 Key 加引号。

## Demo 页面规范

路径：`packages/docs/{name}/`，包含 `{name}.{js,wxml,scss,json}` 四个文件。

- `.js`：`data.props` 数组驱动 Props 文档（name/type/default/desc）
- `.wxml`：comp-header → Props 区块 → 功能演示区块
- `.scss`：顶部 `@import '../demo.scss';`，后接页面私有样式
- `.json`：注册组件 + `"disableScroll": true`

## 图标使用

组件需要图标时，先检查 `src/styles/iconfont.scss` 中是否已有所需图标。**若图标不存在，必须先提示用户添加，确认后再继续开发。**

**组件样式隔离**：组件 SCSS 文件中使用图标时，必须在顶部引入 `@import '../../styles/iconfont.scss';`，否则因样式隔离图标字体不生效。

## 新增组件流程

1. 创建 `src/components/{name}/` 四件套
2. 在 `app.json` 的 `subPackages[0].pages` 加路由
3. 创建 `packages/docs/{name}/` demo 页
4. 在 `pages/index/index.wxml` 加导航项
5. 更新本文件项目结构图
6. **表单组件**须使用 `formField` behavior（`src/behaviors/formField.js`），不要重复实现 `_setFormItemContext`、`_getFormItem` 等方法；同时在 `form-item.js` 顶部的 `FIELD_PATHS` 数组中添加路径

## 组件间关系

以下组件通过 `relations` API 建立父子关系：

- `w-button-group` ↔ `w-button`
- `w-avatar-group` ↔ `w-avatar`
- `w-form` → `w-form-item` → `w-input` / `w-textarea` / `w-switch` / `w-radio-group` / `w-checkbox-group` / `w-time-picker` / `w-date-picker` / `w-color-picker` / `w-input-otp` / `w-rate` / `w-select` / `w-upload` / `w-tree-select` / `w-stepper`
- `w-tree-select` ↔ `w-tree`
- `w-radio-group` ↔ `w-radio` / `w-radio-button`
- `w-checkbox-group` ↔ `w-checkbox` / `w-checkbox-button`
- `w-layout` ↔ `w-layout-header` / `w-layout-content` / `w-layout-footer` / `w-layout-sider`
- `w-list` ↔ `w-list-item`
- `w-carousel` ↔ `w-carousel-item`

## 表单校验

`src/components/form/validator.js`：规则中含自定义 `validator` 函数时，不能通过 WXML 属性传递（setData 丢失函数引用），需用 `form.setRules()` 或 `formItem.setRule()` 方法。

## 示例图片

统一使用 picsum.photos 随机图片服务。

## CLAUDE.md 维护规范

新增组件时同步更新本文件的**项目结构图**和**组件间关系**。组件的属性、Slots、Events 等 API 信息从源码读取，不在此文件中重复记录。
