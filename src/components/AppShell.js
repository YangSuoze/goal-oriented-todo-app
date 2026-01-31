(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.components = ns.components || {};

  const { dom } = ns.utils;
  const { HeaderBar, SidebarNav } = ns.components;

  ns.components.AppShell = function AppShell({ state, actions, content, modal }) {
    return dom.h(
      "div",
      { className: "appShell" },
      HeaderBar({ state, actions }),
      dom.h(
        "div",
        { className: "frame" },
        dom.h(
          "div",
          { className: "layout" },
          SidebarNav({ state, actions }),
          dom.h("main", { className: "main" }, content || dom.h("div", { className: "empty", text: "未选择视图" }))
        )
      ),
      modal || null
    );
  };
})();

