(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.components = ns.components || {};

  const { CreateModal, SettingsModal, DayValueModal, EditYearGoalModal, EditMonthGoalModal } = ns.components;

  ns.components.renderModal = function renderModal({ state, actions }) {
    const modal = state.ui?.modal;
    if (!modal) return null;

    if (modal.type === "create") return CreateModal({ state, actions, tab: modal.tab || "todo" });
    if (modal.type === "settings") return SettingsModal({ state, actions });
    if (modal.type === "dayValue") return DayValueModal({ state, actions, monthGoalId: modal.monthGoalId, dateISO: modal.dateISO });
    if (modal.type === "editYear") return EditYearGoalModal({ state, actions, yearGoalId: modal.yearGoalId });
    if (modal.type === "editMonth") return EditMonthGoalModal({ state, actions, monthGoalId: modal.monthGoalId });

    return null;
  };
})();
