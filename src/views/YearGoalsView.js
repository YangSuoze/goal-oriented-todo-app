(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.views = ns.views || {};

  const { dom } = ns.utils;
  const { YearGoalCard } = ns.components;

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

  ns.views.YearGoalsView = function YearGoalsView({ state, actions }) {
    const yearGoals = state.yearGoals || [];

    return dom.h(
      "div",
      { className: "page" },
      sectionHeader(
        "年度目标",
        "目标先行：年度 → 月度 → 每日待办。",
        dom.h("button", { className: "button button--primary", onClick: () => actions.openCreateModal("year") }, "➕ 新建年度目标")
      ),
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
            desc: "先创建一个年度目标，让每日行动有归属感与方向感。",
            ctaLabel: "创建年度目标",
            onCta: () => actions.openCreateModal("year"),
          })
    );
  };
})();
