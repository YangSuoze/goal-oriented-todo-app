(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.components = ns.components || {};

  const { dom } = ns.utils;
  const { ProgressBar } = ns.components;

  function buildYearOptions(state) {
    const goals = state.yearGoals || [];
    if (!goals.length) return [dom.h("option", { value: "", text: "暂无年度目标", disabled: true })];
    return goals.map((g) => dom.h("option", { value: g.id, text: g.title }));
  }

  ns.components.HeaderBar = function HeaderBar({ state, actions }) {
    const selectedYearGoal = (state.yearGoals || []).find((g) => g.id === state.selectedYearGoalId) || null;
    const progress = dom.clamp(selectedYearGoal?.progress || 0, 0, 100);
    const current = dom.formatNumber(selectedYearGoal?.currentValue || 0);
    const target = dom.formatNumber(selectedYearGoal?.targetValue || 0);

    const yearSelect = dom.h(
      "select",
      {
        className: "input header__select",
        disabled: !(state.yearGoals || []).length,
        value: selectedYearGoal ? selectedYearGoal.id : "",
        onChange: (e) => actions.setSelectedYearGoal(e.target.value),
        attrs: { "aria-label": "选择年度目标" },
      },
      ...buildYearOptions(state)
    );

    const progressHint = selectedYearGoal ? `${dom.formatPercent(progress)} · ${current} / ${target}` : "0% · 0 / 0";

    const createDefaultTab = (state.yearGoals || []).length ? "todo" : "year";

    return dom.h(
      "header",
      { className: "header" },
      dom.h(
        "div",
        { className: "header__inner" },
        dom.h(
          "div",
          { className: "header__left" },
          dom.h("div", { className: "header__label", text: "年度目标" }),
          yearSelect
        ),
        dom.h(
          "div",
          { className: "header__center" },
          dom.h("div", { className: "header__progressText", text: progressHint }),
          ProgressBar({ progress, size: "sm" })
        ),
        dom.h(
          "div",
          { className: "header__right" },
          dom.h(
            "button",
            { className: "button button--primary", onClick: () => actions.openCreateModal(createDefaultTab) },
            "➕ 新建"
          ),
          dom.h(
            "button",
            { className: "button button--ghost", onClick: actions.toggleDarkMode },
            state.ui?.darkMode ? "浅色" : "深色"
          ),
          dom.h("button", { className: "button", onClick: actions.openSettingsModal }, "设置")
        )
      )
    );
  };
})();

