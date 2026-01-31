(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.views = ns.views || {};

  const { dom, date } = ns.utils;
  const { YearGoalCard, MonthGoalCard, TodoItem, ProgressBar } = ns.components;

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

  ns.views.DashboardView = function DashboardView({ state, actions }) {
    const yearGoals = state.yearGoals || [];
    const monthGoals = state.monthGoals || [];
    const todos = state.todos || [];

    const yearById = new Map(yearGoals.map((g) => [g.id, g]));
    const monthById = new Map(monthGoals.map((g) => [g.id, g]));

    const selectedYearGoal = yearById.get(state.selectedYearGoalId) || null;
    const selectedMonthGoals = selectedYearGoal ? monthGoals.filter((mg) => mg.yearGoalId === selectedYearGoal.id) : [];
    selectedMonthGoals.sort((a, b) => String(a.month).localeCompare(String(b.month)));

    const todayISO = date.todayISO();
    const todayTodos = todos.filter((t) => t.date === todayISO && t.kind !== "dailyLog");
    const todayGroups = groupTodosByMonthGoal({ todos: todayTodos, monthById });

    const yearSection = dom.h(
      "section",
      { className: "pageSection" },
      sectionHeader("年度目标", "我今年在做什么？（点击卡片切换）"),
      yearGoals.length
        ? dom.h(
            "div",
            { className: "grid grid--max3" },
            yearGoals.map((yg) =>
              YearGoalCard({
                yearGoal: yg,
                isSelected: yg.id === state.selectedYearGoalId,
                onSelect: actions.setSelectedYearGoal,
                onEdit: actions.openEditYearGoalModal,
              })
            )
          )
        : emptyState({
            title: "还没有年度目标",
            desc: "先创建一个年度大目标，再把月度目标与每日待办都挂上去。",
            ctaLabel: "创建第一个年度目标",
            onCta: () => actions.openCreateModal("year"),
          })
    );

    const monthSection = dom.h(
      "section",
      { className: "pageSection" },
      sectionHeader(
        "月度目标",
        selectedYearGoal ? `本月进展如何？（当前年度：${selectedYearGoal.title}）` : "请先选择一个年度目标",
        dom.h("button", { className: "button", onClick: () => actions.openCreateModal("month") }, "➕ 新建月度目标")
      ),
      selectedYearGoal && selectedMonthGoals.length
        ? dom.h(
            "div",
            { className: "grid grid--months2" },
            selectedMonthGoals.map((mg) =>
              MonthGoalCard({
                monthGoal: mg,
                yearGoal: selectedYearGoal,
                isActive: mg.id === state.ui?.pickedMonthGoalId,
                onOpen: actions.openMonthFocus,
                onEdit: actions.openEditMonthGoalModal,
              })
            )
          )
        : selectedYearGoal
          ? emptyState({
              title: "这个年度下还没有月度目标",
              desc: "创建月度目标后，才能把每日待办绑定到它。",
              ctaLabel: "创建月度目标",
              onCta: () => actions.openCreateModal("month"),
            })
          : emptyState({
              title: "请选择一个年度目标",
              desc: "年度目标会驱动月度目标与每日行动。",
              ctaLabel: yearGoals.length ? null : "创建年度目标",
              onCta: yearGoals.length ? null : () => actions.openCreateModal("year"),
            })
    );

    const todaySectionRight = dom.h(
      "div",
      { className: "todayHeaderRight" },
      dom.h("button", { className: "button", onClick: () => actions.openCreateModal("todo") }, "➕ 添加待办")
    );

    const todaySection = dom.h(
      "section",
      { className: "pageSection" },
      sectionHeader("今日待办", "今天该做什么？（只显示今日）", todaySectionRight),
      todayGroups.length
        ? dom.h(
            "div",
            { className: "stack" },
            todayGroups.map((g) => {
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
                    dom.h(
                      "button",
                      { className: "button button--ghost", onClick: () => actions.openMonthFocus(mg.id) },
                      "月度详情"
                    )
                  )
                : null;

              const list =
                g.todos.length && mg
                  ? dom.h(
                      "ul",
                      { className: "todoList" },
                      g.todos.map((t) =>
                        TodoItem({
                          todo: t,
                          monthGoal: mg,
                          yearGoal: yg,
                          variant: "today",
                          flash: state.ui?.flashTodoId === t.id,
                          showDelete: false,
                          onToggle: actions.toggleTodo,
                          onDelete: actions.deleteTodo,
                        })
                      )
                    )
                  : dom.h("div", { className: "empty", text: "暂无待办" });

              return todoGroupCard({
                title: mg ? mg.title : "未知月度目标",
                subtitle: mg ? `${mg.month}（${yg ? yg.title : "未绑定年度"}）` : null,
                right,
                children: list,
              });
            })
          )
        : emptyState({
            title: "今天没有待办",
            desc: "把今日行动绑定到一个月度目标上，完成后会自动回写月度/年度进度。",
            ctaLabel: "添加今日待办",
            onCta: () => actions.openCreateModal("todo"),
          })
    );

    return dom.h("div", { className: "page" }, yearSection, monthSection, todaySection);
  };
})();
