(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.components = ns.components || {};

  const { dom, date } = ns.utils;

  function navItem({ label, view, isActive, onClick, hint }) {
    return dom.h(
      "button",
      {
        className: `navItem ${isActive ? "navItem--active" : ""}`,
        onClick,
        attrs: { "aria-current": isActive ? "page" : "false", title: hint || "" },
      },
      dom.h("div", { className: "navItem__label", text: label })
    );
  }

  ns.components.SidebarNav = function SidebarNav({ state, actions }) {
    const activeView = state.ui?.activeView || "dashboard";
    const isMonthArea = activeView === "monthGoals" || activeView === "monthFocus";

    const todayCount = (state.todos || []).filter((t) => t.date === date.todayISO()).length;

    return dom.h(
      "aside",
      { className: "sidebar" },
      dom.h(
        "div",
        { className: "sidebar__panel" },
        dom.h("div", { className: "sidebar__title", text: "导航" }),
        dom.h(
          "div",
          { className: "nav" },
          navItem({
            label: "Dashboard",
            view: "dashboard",
            isActive: activeView === "dashboard",
            onClick: () => actions.setView("dashboard"),
          }),
          navItem({
            label: "年度目标",
            view: "yearGoals",
            isActive: activeView === "yearGoals",
            onClick: () => actions.setView("yearGoals"),
          }),
          navItem({
            label: "月度目标",
            view: "monthGoals",
            isActive: isMonthArea,
            onClick: () => actions.setView("monthGoals"),
          }),
          navItem({
            label: todayCount ? `今日待办 · ${todayCount}` : "今日待办",
            view: "today",
            isActive: activeView === "today",
            onClick: () => actions.setView("today"),
          })
        ),
        dom.h(
          "div",
          { className: "sidebar__hint" },
          dom.h("div", { className: "small", text: "SPA 结构：视图切换不跳页，保持“目标→行动→反馈”的连续感。" })
        )
      )
    );
  };
})();
