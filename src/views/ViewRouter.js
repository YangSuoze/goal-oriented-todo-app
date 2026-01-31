(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.views = ns.views || {};

  const { dom } = ns.utils;

  ns.views.renderActiveView = function renderActiveView({ state, actions }) {
    const view = state.ui?.activeView || "dashboard";

    switch (view) {
      case "dashboard":
        return ns.views.DashboardView({ state, actions });
      case "yearGoals":
        return ns.views.YearGoalsView({ state, actions });
      case "monthGoals":
        return ns.views.MonthGoalsView({ state, actions });
      case "today":
        return ns.views.TodayView({ state, actions });
      case "monthFocus":
        return ns.views.MonthFocusView({ state, actions });
      default:
        return dom.h("div", { className: "empty", text: `未知视图：${view}` });
    }
  };
})();

