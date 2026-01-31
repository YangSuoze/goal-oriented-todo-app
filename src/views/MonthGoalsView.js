(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.views = ns.views || {};

  const { dom } = ns.utils;
  const { MonthGoalCard } = ns.components;

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

  ns.views.MonthGoalsView = function MonthGoalsView({ state, actions }) {
    const yearGoals = state.yearGoals || [];
    const monthGoals = state.monthGoals || [];

    const selectedYearGoal = yearGoals.find((g) => g.id === state.selectedYearGoalId) || null;
    const list = selectedYearGoal ? monthGoals.filter((mg) => mg.yearGoalId === selectedYearGoal.id) : [];
    list.sort((a, b) => String(a.month).localeCompare(String(b.month)));

    return dom.h(
      "div",
      { className: "page" },
      sectionHeader(
        "月度目标",
        selectedYearGoal ? `当前年度：${selectedYearGoal.title}` : "请先选择一个年度目标",
        dom.h("button", { className: "button button--primary", onClick: () => actions.openCreateModal("month") }, "➕ 新建月度目标")
      ),
      selectedYearGoal && list.length
        ? dom.h(
            "div",
            { className: "grid grid--months2" },
            list.map((mg) =>
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
              title: "暂无月度目标",
              desc: "月度目标是每日待办的唯一归属，请先创建月度目标。",
              ctaLabel: "创建月度目标",
              onCta: () => actions.openCreateModal("month"),
            })
          : emptyState({
              title: "暂无年度目标",
              desc: "先创建年度目标，再创建月度目标。",
              ctaLabel: "创建年度目标",
              onCta: () => actions.openCreateModal("year"),
            })
    );
  };
})();
