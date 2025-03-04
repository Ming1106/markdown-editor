# Markdown 编辑器

一个基于 TypeScript 和 React 开发的现代化 Markdown 编辑器，支持实时预览、主题切换、导出等功能。

## 主要特性

- 实时预览：编辑 Markdown 文本时可以即时查看渲染效果
- 工具栏快捷操作：支持快速插入常用的 Markdown 语法
- 主题切换：支持浅色/深色主题切换
- 导出功能：支持导出为 PDF 和 HTML 格式
- 撤销功能：支持编辑内容的撤销操作
- 自动序号：有序列表会自动递增序号

## 快速开始

### 环境要求

- Node.js 16.0 或更高版本
- npm 8.0 或更高版本

### 安装步骤

1. 克隆项目到本地：
```bash
git clone [你的仓库地址]
cd markdown-editor
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 在浏览器中访问：
```
http://localhost:3002
```

### 生产环境构建

```bash
npm run build
```

构建后的文件将生成在 `dist` 目录中。

## 使用说明

### 工具栏功能

- 撤销：撤销上一次编辑操作
- 一级标题：插入一级标题 (#)
- 二级标题：插入二级标题 (##)
- 三级标题：插入三级标题 (###)
- 粗体：将选中文本加粗 (**)
- 斜体：将选中文本变为斜体 (*)
- 删除线：给选中文本添加删除线 (~~)
- 无序列表：插入无序列表项 (-)
- 有序列表：插入有序列表项 (1.)
- 引用：插入引用文本 (>)
- 代码段：插入代码块 (```)
- 表格：插入表格模板
- 导出：支持导出为 PDF 或 HTML 格式
- 主题：切换浅色/深色主题

### 快捷操作

1. 选中文本后点击工具栏按钮，将自动为选中文本添加相应的 Markdown 语法
2. 有序列表会自动检测上下文，智能递增序号
3. 导出时会保持当前编辑器的样式和主题

## 技术栈

- React 18
- TypeScript
- Styled Components
- Vite

## 开发

### 项目结构

```
markdown-editor/
├── src/
│   ├── App.tsx           # 主应用组件
│   ├── main.tsx          # 应用入口
│   ├── parser/           # Markdown 解析器
│   └── theme/            # 主题相关
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 测试

运行测试：
```bash
npm test
```

打开 Cypress 测试界面：
```bash
npm run test:open
```

## 许可证

MIT License