(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.components = ns.components || {};

  const { dom } = ns.utils;
  const { Modal } = ns.components;

  function toNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function field(label, input) {
    return dom.h("div", { className: "field" }, dom.h("label", { text: label }), input);
  }

  ns.components.DayValueModal = function DayValueModal({ state, actions, monthGoalId, dateISO }) {
    const monthGoal = (state.monthGoals || []).find((g) => g.id === monthGoalId) || null;
    if (!monthGoal) return null;

    const yearGoal = (state.yearGoals || []).find((g) => g.id === monthGoal.yearGoalId) || null;

    const dayTodos = (state.todos || []).filter((t) => t.monthGoalId === monthGoalId && t.date === dateISO);

    const base = dayTodos
      .filter((t) => t.kind !== "dailyLog" && t.completed)
      .reduce((sum, t) => sum + toNumber(t.value), 0);

    const total = dayTodos.filter((t) => t.completed).reduce((sum, t) => sum + toNumber(t.value), 0);

    const input = dom.h("input", { className: "input input--sm", type: "number", step: "1", min: "0", value: total });

    const hint = dom.h(
      "div",
      { className: "modalInfo" },
      dom.h("div", { className: "modalInfo__row", text: `日期：${dateISO}` }),
      dom.h("div", { className: "modalInfo__row", text: `月度目标：${monthGoal.title}` }),
      dom.h("div", { className: "modalInfo__row", text: `年度目标：${yearGoal ? yearGoal.title : "-"}` }),
      dom.h("div", { className: "modalInfo__row", text: `已由待办贡献：${dom.formatNumber(base)}` }),
      dom.h("div", { className: "modalInfo__row", text: "你输入的是“当天完成总量”，系统会用日历记录补齐差额（不会减少已完成待办贡献）。" })
    );

    const form = dom.h(
      "form",
      {
        className: "form form--modal",
        onSubmit: (e) => {
          e.preventDefault();
          const res = actions.setDayTotalForDate({
            monthGoalId,
            dateISO,
            totalValue: input.value,
          });
          if (!res.ok) return window.alert(res.error || "保存失败");
          actions.closeModal();
        },
      },
      hint,
      field("当天完成总量", input),
      dom.h(
        "div",
        { className: "modalActions" },
        dom.h(
          "button",
          {
            className: "button",
            type: "button",
            onClick: () => {
              const res = actions.setDayTotalForDate({ monthGoalId, dateISO, totalValue: base });
              if (!res.ok) return window.alert(res.error || "操作失败");
              actions.closeModal();
            },
          },
          "清除日历记录"
        ),
        dom.h("button", { className: "button button--primary", type: "submit" }, "保存")
      )
    );

    return Modal({
      title: "编辑热力图（当天完成值）",
      size: "md",
      onClose: actions.closeModal,
      content: form,
    });
  };
})();

