# To-Do App

一个基于原生 **HTML + CSS + JavaScript** 构建的待办事项管理应用。

## 功能特性

- 添加 / 删除 / 编辑任务
- 标记完成 / 取消完成
- 优先级管理（高 / 中 / 低）
- 分类管理（学习 / 生活 / 运动 / 工作）
- 截止日期设置
- 创建时间记录
- 状态筛选（全部 / 未完成 / 已完成）
- 分类筛选
- 搜索任务
- 排序功能
- 批量操作（全部完成 / 全部取消完成 / 清空已完成）
- 深色模式
- JSON 导入 / 导出
- 多文件模块化结构

## 项目技术栈

- HTML
- CSS
- JavaScript（ES Module）

## 项目结构

```text
todo-app/
│
├── index.html
├── style.css
├── README.md
└── js/
    ├── state.js
    ├── storage.js
    ├── utils.js
    ├── taskService.js
    ├── ui.js
    ├── events.js
    └── main.js