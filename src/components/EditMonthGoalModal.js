(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.components = ns.components || {};

  const { dom } = ns.utils;
  const { Modal } = ns.components;

  function field(label, input) {
    return dom.h("div", { className: "field" }, dom.h("label", { text: label }), input);
  }

  ns.components.EditMonthGoalModal = function EditMonthGoalModal({ state, actions, monthGoalId }) {
    const mg = (state.monthGoals || []).find((g) => g.id === monthGoalId) || null;
    if (!mg) return null;

    const yearGoals = state.yearGoals || [];
    const yearSelect = dom.h(
      "select",
      { className: "input input--lg", required: true, value: mg.yearGoalId || "" },
      ...(yearGoals.length ? yearGoals.map((yg) => dom.h("option", { value: yg.id, text: yg.title })) : [dom.h("option", { value: "", text: "暂无年度目标", disabled: true })])
    );

    const month = dom.h("input", { className: "input input--sm", type: "month", required: true, value: mg.month || "" });
    const title = dom.h("input", { className: "input input--lg", required: true, value: mg.title || "" });
    const targetValue = dom.h("input", { className: "input input--sm", type: "number", step: "1", min: "0", required: true, value: mg.targetValue ?? 0 });

    const form = dom.h(
      "form",
      {
        className: "form form--modal",
        onSubmit: (e) => {
          e.preventDefault();
          const res = actions.updateMonthGoal(monthGoalId, {
            yearGoalId: yearSelect.value,
            month: month.value,
            title: title.value,
            targetValue: targetValue.value,
          });
          if (!res.ok) return window.alert(res.error || "保存失败");
          actions.closeModal();
        },
      },
      field("所属年度目标（必选）", yearSelect),
      dom.h("div", { className: "row" }, field("月份", month), field("数值目标", targetValue)),
      field("月度目标名称（必填）", title),
      dom.h(
        "div",
        { className: "modalActions" },
        dom.h(
          "button",
          {
            className: "button button--danger",
            type: "button",
            onClick: () => {
              const ok = window.confirm("删除该月度目标？\n\n将级联删除：该月度目标下所有待办（包含热力图记录）。此操作不可撤销。");
              if (!ok) return;
              const res = actions.deleteMonthGoal(monthGoalId);
              if (!res.ok) return window.alert(res.error || "删除失败");
              actions.closeModal();
            },
          },
          "删除月度目标"
        ),
        dom.h("button", { className: "button button--primary", type: "submit" }, "保存修改")
      )
    );

    return Modal({
      title: "编辑月度目标",
      size: "lg",
      onClose: actions.closeModal,
      content: form,
    });
  };
})();

