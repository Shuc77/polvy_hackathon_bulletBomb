# 观看页皮肤系统开发指南

## 概述

本文档介绍 live-watch-sdk 项目中观看页皮肤系统的架构设计、实现方案及开发规范。皮肤系统支持静态皮肤（如 black、red、blue 等）和动态皮肤（custom-theme），custom-theme 支持 dark/light 双配置方案。

---

## 目录结构

```
app/watch/src/skins/
├── _common/                    # 公共样式目录
│   ├── basic-style.scss        # 基础样式
│   ├── basic-pc-style.scss     # PC 端样式
│   ├── basic-mobile-style.scss # 移动端样式
│   ├── basic-portrait-style.scss # 竖屏样式
│   ├── basic-iar-style.scss    # 互动功能样式
│   ├── functions.scss          # SCSS 函数
│   ├── mixins.scss             # SCSS 混入
│   └── imgs/                   # 公共图片资源
├── black/                      # 黑色皮肤（静态）
├── blue/                       # 蓝色皮肤（静态）
├── freshblue/                  # 浅蓝色皮肤（静态）
├── golden/                     # 金色皮肤（静态）
├── green/                      # 绿色皮肤（静态）
├── red/                        # 红色皮肤（静态）
├── white/                      # 白色皮肤（静态）
├── custom-theme/               # 自定义主题皮肤（动态）
│   ├── config/                 # 配置文件目录
│   │   ├── dark/               # Dark 模式配置
│   │   │   ├── config-common-dark.scss
│   │   │   ├── config-pc-dark.scss
│   │   │   ├── config-mobile-dark.scss
│   │   │   └── config-iar-dark.scss
│   │   └── light/              # Light 模式配置
│   │       ├── config-common-light.scss
│   │       ├── config-pc-light.scss
│   │       ├── config-mobile-light.scss
│   │       └── config-iar-light.scss
│   ├── entry/                  # 入口文件目录
│   │   ├── dark/               # Dark 模式入口
│   │   │   ├── _custom-theme-dark-pc.scss
│   │   │   ├── _custom-theme-dark-mobile.scss
│   │   │   └── _custom-theme-dark-portrait.scss
│   │   └── light/              # Light 模式入口
│   │       ├── _custom-theme-light-pc.scss
│   │       ├── _custom-theme-light-mobile.scss
│   │       └── _custom-theme-light-portrait.scss
│   ├── style/                  # 样式文件目录（custom-theme 专用）
│   │   ├── _custom-theme-basic-style.scss
│   │   ├── _custom-theme-basic-pc-style.scss
│   │   ├── _custom-theme-basic-mobile-style.scss
│   │   ├── _custom-theme-basic-portrait-style.scss
│   │   └── _custom-theme-basic-iar-style.scss
│   └── imgs/                   # 图片资源
├── enum.ts                     # 皮肤枚举定义
├── theme-config-type.ts        # 主题配置类型
└── use-page-skin.ts            # 皮肤加载逻辑
```

---

## 皮肤类型

### 1. 静态皮肤

静态皮肤（如 black、red、blue 等）的特点：

- **编译时确定**：所有颜色值在 SCSS 编译时确定
- **固定配置**：使用固定的颜色值，不支持运行时动态切换

### 2. 动态皮肤（custom-theme）

custom-theme 的特点：

- **双配置方案**：dark 和 light 模式分别有独立的配置文件
- **主题色支持**：支持用户自定义 primaryColor 和 themeColor
- **样式复用**：复用了大部分静态皮肤的样式逻辑

---

## custom-theme 开发

### 目录结构说明

| 目录            | 说明                      |
| --------------- | ------------------------- |
| `config/dark/`  | Dark 模式配置文件         |
| `config/light/` | Light 模式配置文件        |
| `entry/dark/`   | Dark 模式入口文件         |
| `entry/light/`  | Light 模式入口文件        |
| `style/`        | custom-theme 专用样式文件 |

### 配置文件说明

| 文件                                    | 说明                   |
| --------------------------------------- | ---------------------- |
| `config/dark/config-common-dark.scss`   | Dark 模式通用配置      |
| `config/light/config-common-light.scss` | Light 模式通用配置     |
| `config/dark/config-pc-dark.scss`       | Dark 模式 PC 端配置    |
| `config/light/config-pc-light.scss`     | Light 模式 PC 端配置   |
| `config/dark/config-mobile-dark.scss`   | Dark 模式移动端配置    |
| `config/light/config-mobile-light.scss` | Light 模式移动端配置   |
| `config/dark/config-iar-dark.scss`      | Dark 模式互动功能配置  |
| `config/light/config-iar-light.scss`    | Light 模式互动功能配置 |

### 入口文件说明

| 文件                                            | 说明                 |
| ----------------------------------------------- | -------------------- |
| `entry/dark/_custom-theme-dark-pc.scss`         | Dark 模式 PC 端入口  |
| `entry/light/_custom-theme-light-pc.scss`       | Light 模式 PC 端入口 |
| `entry/dark/_custom-theme-dark-mobile.scss`     | Dark 模式移动端入口  |
| `entry/light/_custom-theme-light-mobile.scss`   | Light 模式移动端入口 |
| `entry/dark/_custom-theme-dark-portrait.scss`   | Dark 模式竖屏入口    |
| `entry/light/_custom-theme-light-portrait.scss` | Light 模式竖屏入口   |

### 核心配置差异

**Dark 模式 vs Light 模式：**

| 配置项                      | Dark 模式                       | Light 模式                     |
| --------------------------- | ------------------------------- | ------------------------------ |
| `panel-bg-color`            | `rgba(0, 0, 0, 0.3)`            | `rgba(255, 255, 255, 0.3)`     |
| `disabled-bg-color`         | `#e9ecee`                       | `#9e9e9e`                      |
| `primary-button:text-color` | `#ffffff`                       | `#000000`                      |
| 空菜单图标                  | `pws-icon-empty-menu-light.png` | `pws-icon-empty-menu-dark.png` |
| 聊天关闭图标                | `pws-icon-chat-close-light.png` | `pws-icon-chat-close-dark.png` |

### CSS 变量

custom-theme 使用以下核心 CSS 变量：

| 变量名                         | 用途                                           |
| ------------------------------ | ---------------------------------------------- |
| `--plv-watch-skin-primary-rgb` | 主要色 RGB（用户自定义）                       |
| `--plv-watch-skin-theme-rgb`   | 主题色 RGB（用户自定义）                       |
| `--plv-watch-skin-neutral-rgb` | 中性色 RGB（dark: 255,255,255 / light: 0,0,0） |

### 添加新配置项

在配置文件中添加新配置项时，使用 SCSS 字符串插值语法：

```scss
// ✅ 正确写法
'custom-bg': #{'rgba(var(--plv-watch-skin-theme-rgb), 0.8)'},
'custom-text': #{'rgba(var(--plv-watch-skin-neutral-rgb), 0.9)'},

// ❌ 错误写法
'custom-bg': rgba(0, 0, 0, 0.3),
'custom-text': #ffffff,
```

---

## 皮肤加载逻辑

在 [`use-page-skin.ts`](app/watch/src/skins/use-page-skin.ts) 中根据 `colorMode` 动态加载对应的皮肤文件：

```typescript
async function importWatchThemeSkin() {
  const isDark = themeStore.currentSkinColorMode === SkinColorMode.Dark;

  if (!isMobile) {
    if (isDark) {
      await import(
        /* webpackChunkName: "skin-custom-theme-dark-pc" */ '@/skins/custom-theme/entry/dark/_custom-theme-dark-pc.scss'
      );
    } else {
      await import(
        /* webpackChunkName: "skin-custom-theme-light-pc" */ '@/skins/custom-theme/entry/light/_custom-theme-light-pc.scss'
      );
    }
    return;
  }

  if (layoutStore.mobileWatchLayout === MobileWatchLayout.Portrait) {
    if (isDark) {
      await import(
        /* webpackChunkName: "skin-custom-theme-dark-portrait" */ '@/skins/custom-theme/entry/dark/_custom-theme-dark-portrait.scss'
      );
    } else {
      await import(
        /* webpackChunkName: "skin-custom-theme-light-portrait" */ '@/skins/custom-theme/entry/light/_custom-theme-light-portrait.scss'
      );
    }
  } else {
    if (isDark) {
      await import(
        /* webpackChunkName: "skin-custom-theme-dark-mobile" */ '@/skins/custom-theme/entry/dark/_custom-theme-dark-mobile.scss'
      );
    } else {
      await import(
        /* webpackChunkName: "skin-custom-theme-light-mobile" */ '@/skins/custom-theme/entry/light/_custom-theme-light-mobile.scss'
      );
    }
  }
}
```

---

## 开发最佳实践

### 1. 颜色定义规范

- **静态皮肤**：使用固定颜色值（如 `#FF5252`）
- **动态皮肤**：使用 CSS 变量引用（如 `#{'rgba(var(--plv-watch-skin-primary-rgb), 1)'}`）

### 2. 图片资源

- 图片路径使用相对路径，相对于入口文件
- 支持 PNG、GIF、JPG 格式
- dark/light 模式使用对应的图片资源

### 3. 调试方法

在浏览器控制台测试 CSS 变量：

```javascript
// 测试主题色切换
document.documentElement.style.setProperty('--plv-watch-skin-theme-rgb', '0,128,0');

// 测试 dark/light 切换
document.documentElement.style.setProperty('--plv-watch-skin-neutral-rgb', '0,0,0'); // light 模式
document.documentElement.style.setProperty('--plv-watch-skin-neutral-rgb', '255,255,255'); // dark 模式
```

---

## 相关文件索引

| 文件路径                                                                                   | 说明                       |
| ------------------------------------------------------------------------------------------ | -------------------------- |
| [`app/watch/src/skins/use-page-skin.ts`](app/watch/src/skins/use-page-skin.ts)             | 皮肤加载逻辑、CSS 变量注入 |
| [`app/watch/src/skins/enum.ts`](app/watch/src/skins/enum.ts)                               | 皮肤枚举定义               |
| [`app/watch/src/skins/theme-config-type.ts`](app/watch/src/skins/theme-config-type.ts)     | 主题配置类型               |
| [`app/watch/src/skins/_common/functions.scss`](app/watch/src/skins/_common/functions.scss) | SCSS 函数定义              |
