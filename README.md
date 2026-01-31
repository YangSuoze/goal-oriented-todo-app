# 目标驱动型待办记录网页（Goal-Oriented Todo App）

纯前端、零后端依赖的「目标 → 任务 → 进展统计」闭环系统：

- 所有每日待办必须归属一个 **月度大目标**
- 每个月度大目标必须归属一个 **年度大目标**
- 勾选/取消待办会自动反向更新月度/年度进度
- 数据持久化：`localStorage`（可导出 JSON）

## 本地运行

### 方式 A：直接打开（推荐先试）

双击打开 `goal-oriented-todo-app/index.html` 即可运行。

> 若你的浏览器对 `file://` 下的 `localStorage` 有限制，使用方式 B。

### 方式 B：本地起静态服务

在 `goal-oriented-todo-app` 目录下执行：

```bash
python -m http.server 5173
```

然后访问 `http://localhost:5173/`。

## 项目结构

```
goal-oriented-todo-app/
  index.html
  style.css
  src/
    main.js
    components/
      AppShell.js
      HeaderBar.js
      SidebarNav.js
      Modal.js
      CreateModal.js
      SettingsModal.js
      ModalRoot.js
      MonthGoalCard.js
      ProgressBar.js
      TodoItem.js
      YearGoalCard.js
    store/
      goalStore.js
    utils/
      date.js
      dom.js
      storage.js
    views/
      DashboardView.js
      YearGoalsView.js
      MonthGoalsView.js
      TodayView.js
      MonthFocusView.js
      ViewRouter.js
```

## 数据模型（显式实现）

- `YearGoal`：年度目标
- `MonthGoal`：月度目标（必须挂在某个年度目标下）
- `Todo`：每日待办（必须选择月度目标，自动继承年度目标）

状态存储 key：`goal-oriented-todo-app:v1`（见 `src/utils/storage.js`）。

## 示例数据

首次打开（本地无存储数据）会自动生成示例：

- 年度目标：一年阅读 100 篇论文
- 以及对应的月度目标与今日待办（也包含部分历史待办，便于查看月度详情页）

你也可以在页面右上角（Header 的「设置」）点击「恢复示例」随时重置。
