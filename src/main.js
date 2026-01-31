(() => {
  const ns = window.GOAL_TODO;
  const root = document.getElementById("app");
  if (!ns || !root) return;

  const { dom } = ns.utils;

  function render() {
    const state = ns.store.getState();
    const actions = ns.store.actions;
    const content = ns.views?.renderActiveView ? ns.views.renderActiveView({ state, actions }) : dom.h("div", { className: "empty", text: "视图系统未加载" });
    const modal = ns.components?.renderModal ? ns.components.renderModal({ state, actions }) : null;
    dom.clear(root);
    root.appendChild(ns.components.AppShell({ state, actions, content, modal }));
  }

  ns.store.subscribe(render);

  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const state = ns.store.getState();
    if (!state?.ui?.modal) return;
    ns.store.actions.closeModal();
  });

  ns.store.init();
})();
