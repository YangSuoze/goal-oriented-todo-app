(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.views = ns.views || {};

  const { dom, date } = ns.utils;
  const { TodoItem, ProgressBar } = ns.components;

  function sectionHeader(title, hint, right) {
    return dom.h(
      "div",
      { className: "sectionHeader" },
      dom.h("h2", { text: title }),
      dom.h("div", { className: "sectionHeader__right" }, hint ? dom.h("div", { className: "hint", text: hint }) : null, right || null)
    );
  }

  function emptyState({ title, desc, ctaLabel, onCta }) {
    return dom.h(
      "div",
      { className: "emptyState" },
      dom.h("div", { className: "emptyState__title", text: title }),
      desc ? dom.h("div", { className: "emptyState__desc", text: desc }) : null,
      ctaLabel ? dom.h("button", { className: "button button--primary", onClick: onCta }, ctaLabel) : null
    );
  }

  function sortTodos(list) {
    return list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });
  }

  function groupTodosByMonthGoal({ todos, monthById }) {
    const map = new Map();
    for (const t of todos) {
      if (!map.has(t.monthGoalId)) map.set(t.monthGoalId, []);
      map.get(t.monthGoalId).push(t);
    }

    const groups = [];
    for (const [monthGoalId, list] of map.entries()) {
      const mg = monthById.get(monthGoalId) || null;
      groups.push({ monthGoal: mg, todos: sortTodos(list) });
    }

    groups.sort((a, b) => {
      const am = a.monthGoal?.month || "";
      const bm = b.monthGoal?.month || "";
      if (am !== bm) return String(am).localeCompare(String(bm));
      return String(a.monthGoal?.title || "").localeCompare(String(b.monthGoal?.title || ""));
    });

    return groups;
  }

  function todoGroupCard({ title, subtitle, right, children }) {
    return dom.h(
      "div",
      { className: "card todoGroupCard" },
      dom.h(
        "div",
        { className: "todoGroupCard__header" },
        dom.h(
          "div",
          { className: "todoGroupCard__titleWrap" },
          dom.h("div", { className: "todoGroupCard__title", text: title }),
          subtitle ? dom.h("div", { className: "small", text: subtitle }) : null
        ),
        right || null
      ),
      children
    );
  }

  ns.views.TodayView = function TodayView({ state, actions }) {
    const yearGoals = state.yearGoals || [];
    const monthGoals = state.monthGoals || [];
    const todos = state.todos || [];

    const yearById = new Map(yearGoals.map((g) => [g.id, g]));
    const monthById = new Map(monthGoals.map((g) => [g.id, g]));

    const todayISO = date.todayISO();
    const todayTodos = todos.filter((t) => t.date === todayISO && t.kind !== "dailyLog");
    const groups = groupTodosByMonthGoal({ todos: todayTodos, monthById });

    const right = dom.h("button", { className: "button button--primary", onClick: () => actions.openCreateModal("todo") }, "➕ 添加待办");

    return dom.h(
      "div",
      { className: "page" },
      sectionHeader("今日待办", todayISO, right),
      groups.length
        ? dom.h(
            "div",
            { className: "stack" },
            groups.map((g) => {
              const mg = g.monthGoal;
              const yg = mg ? yearById.get(mg.yearGoalId) || null : null;

              const progressNode = mg
                ? dom.h(
                    "div",
                    { className: "todoGroupCard__progress" },
                    dom.h("div", { className: "small", text: `${dom.formatNumber(mg.currentValue)} / ${dom.formatNumber(mg.targetValue)}` }),
                    ProgressBar({ progress: mg.progress || 0, size: "sm" })
                  )
                : null;

              const right = mg
                ? dom.h(
                    "div",
                    { className: "todoGroupCard__right" },
                    progressNode,
                    dom.h("button", { className: "button button--ghost", onClick: () => actions.openMonthFocus(mg.id) }, "月度详情")
                )
                : null;

              return todoGroupCard({
                title: mg ? mg.title : "未知月度目标",
                subtitle: mg ? `${mg.month}（${yg ? yg.title : "未绑定年度"}）` : null,
                right,
                children: dom.h(
                  "ul",
                  { className: "todoList" },
                  g.todos.map((t) =>
                    TodoItem({
                      todo: t,
                      monthGoal: mg,
                      yearGoal: yg,
                      variant: "today",
                      flash: state.ui?.flashTodoId === t.id,
                      showDelete: true,
                      onToggle: actions.toggleTodo,
                      onDelete: actions.deleteTodo,
                    })
                  )
                ),
              });
            })
          )
        : emptyState({
            title: "今天没有待办",
            desc: "添加一个待办，并选择归属的月度目标（必选）。",
            ctaLabel: "添加今日待办",
            onCta: () => actions.openCreateModal("todo"),
          })
    );
  };
})();
