(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.views = ns.views || {};

  const { dom, date } = ns.utils;
  const { ProgressBar, TodoItem } = ns.components;

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

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

  function toNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function groupTodosByDate(todos) {
    const map = new Map();
    for (const t of todos) {
      if (!map.has(t.date)) map.set(t.date, []);
      map.get(t.date).push(t);
    }

    const dates = Array.from(map.keys()).sort((a, b) => String(a).localeCompare(String(b)));
    return { map, dates };
  }

  function buildCalendar({ monthISO, monthGoalId, todos, onPickDay }) {
    const [yStr, mStr] = String(monthISO).split("-");
    const year = Number(yStr);
    const month = Number(mStr);
    const daysIn = date.daysInMonth(year, month);

    const first = new Date(year, month - 1, 1);
    const jsDay = first.getDay(); // 0 Sun .. 6 Sat
    const mondayIndex = (jsDay + 6) % 7; // 0 Mon .. 6 Sun

    const todayISO = date.todayISO();

    const statsByDate = new Map();
    for (const t of todos) {
      if (!statsByDate.has(t.date)) statsByDate.set(t.date, { completedValue: 0 });
      const s = statsByDate.get(t.date);
      if (t.completed) s.completedValue += toNumber(t.value);
    }

    function levelOf(value) {
      const v = toNumber(value);
      if (v <= 0) return 0;
      if (v <= 1) return 1;
      if (v <= 2) return 2;
      if (v <= 4) return 3;
      return 4;
    }

    const cells = [];

    for (let i = 0; i < mondayIndex; i += 1) {
      cells.push(dom.h("div", { className: "calCell calCell--blank" }));
    }

    for (let d = 1; d <= daysIn; d += 1) {
      const iso = `${yStr}-${pad2(month)}-${pad2(d)}`;
      const s = statsByDate.get(iso) || { completedValue: 0 };
      const completedValue = s.completedValue;

      const isToday = iso === todayISO;
      const lvl = levelOf(completedValue);
      const classes = [
        "calCell",
        isToday ? "calCell--today" : "",
        lvl ? `calCell--lvl${lvl}` : "",
      ]
        .filter(Boolean)
        .join(" ");

      cells.push(
        dom.h(
          "button",
          {
            className: `${classes} calCell--button`.trim(),
            type: "button",
            onClick: () => onPickDay({ monthGoalId, dateISO: iso }),
            attrs: {
              title: completedValue > 0 ? `${iso}：完成 ${dom.formatNumber(completedValue)}（点击编辑）` : `${iso}：无记录（点击填写）`,
              "aria-label": completedValue > 0 ? `${iso} 完成 ${dom.formatNumber(completedValue)}` : `${iso} 无记录`,
            },
          },
          dom.h("div", { className: "calCell__day", text: String(d) })
        )
      );
    }

    const weekDays = ["一", "二", "三", "四", "五", "六", "日"].map((d) => dom.h("div", { className: "calWeekday", text: d }));

    return dom.h("div", { className: "calendar" }, dom.h("div", { className: "calendar__weekdays" }, weekDays), dom.h("div", { className: "calendar__grid" }, cells));
  }

  ns.views.MonthFocusView = function MonthFocusView({ state, actions }) {
    const monthGoals = state.monthGoals || [];
    const yearGoals = state.yearGoals || [];
    const todos = state.todos || [];

    const monthGoalId = state.ui?.activeMonthGoalId;
    const monthGoal = monthGoals.find((g) => g.id === monthGoalId) || null;
    if (!monthGoal) {
      return dom.h(
        "div",
        { className: "page" },
        sectionHeader("月度目标详情", null, dom.h("button", { className: "button", onClick: () => actions.setView("monthGoals") }, "返回")),
        emptyState({
          title: "未选择月度目标",
          desc: "从月度目标列表点击进入详情。",
          ctaLabel: "查看月度目标",
          onCta: () => actions.setView("monthGoals"),
        })
      );
    }

    const yearGoal = yearGoals.find((g) => g.id === monthGoal.yearGoalId) || null;
    const monthTodos = todos.filter((t) => t.monthGoalId === monthGoal.id && String(t.date).startsWith(`${monthGoal.month}-`));
    const monthTodosForList = monthTodos.filter((t) => t.kind !== "dailyLog");

    const current = toNumber(monthGoal.currentValue);
    const target = toNumber(monthGoal.targetValue);
    const remaining = Math.max(target - current, 0);

    const perDay = (() => {
      if (remaining <= 0) return 0;
      const nowMonth = date.toISOMonth(new Date());
      if (monthGoal.month === nowMonth) {
        const daysLeft = date.daysRemainingInMonthFrom(date.todayISO(), true);
        if (!daysLeft || daysLeft <= 0) return null;
        return remaining / daysLeft;
      }
      const [yStr, mStr] = String(monthGoal.month).split("-");
      const y = Number(yStr);
      const m = Number(mStr);
      const days = date.daysInMonth(y, m);
      return remaining / days;
    })();

    const headerRight = dom.h(
      "div",
      { className: "focusHeaderRight" },
      dom.h("button", { className: "button", onClick: () => actions.setView("monthGoals") }, "← 返回"),
      dom.h("button", { className: "button", onClick: () => actions.openEditMonthGoalModal(monthGoal.id) }, "编辑月度目标"),
      dom.h("button", { className: "button button--primary", onClick: () => actions.openCreateModal("todo") }, "➕ 添加待办")
    );

    const overview = dom.h(
      "div",
      { className: "card focusCard" },
      dom.h(
        "div",
        { className: "focusCard__titleRow" },
        dom.h(
          "div",
          { className: "focusCard__titleWrap" },
          dom.h("div", { className: "focusCard__title", text: monthGoal.title }),
          dom.h(
            "div",
            { className: "card__meta" },
            dom.h("span", { className: "badge badge--primary mono", text: monthGoal.month }),
            yearGoal ? dom.h("span", { className: "badge badge--weak badge--truncate", text: yearGoal.title }) : null
          )
        ),
        dom.h("div", { className: "badge", text: dom.formatPercent(monthGoal.progress || 0) })
      ),
      dom.h("div", { className: "focusCard__bar" }, ProgressBar({ progress: monthGoal.progress || 0, size: "lg" })),
      dom.h(
        "div",
        { className: "kpiRow" },
        dom.h(
          "div",
          { className: "kpi" },
          dom.h("div", { className: "kpi__label", text: "已完成" }),
          dom.h("div", { className: "kpi__value", text: dom.formatNumber(current) })
        ),
        dom.h(
          "div",
          { className: "kpi" },
          dom.h("div", { className: "kpi__label", text: "目标" }),
          dom.h("div", { className: "kpi__value", text: dom.formatNumber(target) })
        ),
        dom.h(
          "div",
          { className: "kpi" },
          dom.h("div", { className: "kpi__label", text: "剩余" }),
          dom.h("div", { className: "kpi__value", text: dom.formatNumber(remaining) })
        ),
        dom.h(
          "div",
          { className: "kpi" },
          dom.h("div", { className: "kpi__label", text: "日均所需" }),
          dom.h("div", { className: "kpi__value", text: perDay === null ? "-" : dom.formatNumber(perDay, { maxFractionDigits: 2 }) })
        )
      )
    );

    const calendar = dom.h(
      "div",
      { className: "card" },
      dom.h("div", { className: "small", text: "热力图（日历）：点击某天输入完成值，空白日也会显示" }),
      dom.h("div", { className: "divider" }),
      buildCalendar({ monthISO: monthGoal.month, monthGoalId: monthGoal.id, todos: monthTodos, onPickDay: actions.openDayValueModal })
    );

    const grouped = groupTodosByDate(monthTodosForList);
    const list = dom.h(
      "div",
      { className: "card" },
      dom.h("div", { className: "small", text: "本月待办（列表）" }),
      dom.h("div", { className: "divider" }),
      grouped.dates.length
        ? dom.h(
            "div",
            { className: "stack" },
            grouped.dates.map((d) => {
              const dayTodos = grouped.map.get(d) || [];
              const ul = dom.h(
                "ul",
                { className: "todoList" },
                dayTodos.map((t) =>
                  TodoItem({
                    todo: t,
                    monthGoal,
                    yearGoal,
                    variant: "list",
                    flash: state.ui?.flashTodoId === t.id,
                    showDelete: true,
                    onToggle: actions.toggleTodo,
                    onDelete: actions.deleteTodo,
                  })
                )
              );

              return dom.h(
                "div",
                { className: "todoGroup" },
                dom.h("div", { className: "todoGroup__title" }, dom.h("h3", { text: d })),
                ul
              );
            })
          )
        : emptyState({
            title: "本月还没有待办",
            desc: "为这个月度目标添加一些待办，并在完成后观察进度回写。",
            ctaLabel: "添加待办",
            onCta: () => actions.openCreateModal("todo"),
          })
    );

    return dom.h(
      "div",
      { className: "page" },
      sectionHeader("月度目标详情", null, headerRight),
      overview,
      dom.h("div", { className: "grid grid--focus2" }, calendar, list)
    );
  };
})();
