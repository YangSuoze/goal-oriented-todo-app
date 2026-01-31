(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.components = ns.components || {};

  const { dom } = ns.utils;
  const { Modal } = ns.components;

  function field(label, input) {
    return dom.h("div", { className: "field" }, dom.h("label", { text: label }), input);
  }

  ns.components.EditYearGoalModal = function EditYearGoalModal({ state, actions, yearGoalId }) {
    const goal = (state.yearGoals || []).find((g) => g.id === yearGoalId) || null;
    if (!goal) return null;

    const title = dom.h("input", { className: "input input--lg", required: true, value: goal.title || "" });
    const description = dom.h("input", { className: "input input--lg", value: goal.description || "" });
    const targetValue = dom.h("input", { className: "input input--sm", type: "number", step: "1", min: "0", required: true, value: goal.targetValue ?? 0 });
    const startDate = dom.h("input", { className: "input input--sm", type: "date", value: goal.startDate || "" });
    const endDate = dom.h("input", { className: "input input--sm", type: "date", value: goal.endDate || "" });

    const form = dom.h(
      "form",
      {
        className: "form form--modal",
        onSubmit: (e) => {
          e.preventDefault();
          const res = actions.updateYearGoal(yearGoalId, {
            title: title.value,
            description: description.value,
            targetValue: targetValue.value,
            startDate: startDate.value,
            endDate: endDate.value,
          });
          if (!res.ok) return window.alert(res.error || "保存失败");
          actions.closeModal();
        },
      },
      field("目标名称（必填）", title),
      field("目标描述", description),
      field("数值目标（必填）", targetValue),
      dom.h("div", { className: "row" }, field("起始时间", startDate), field("结束时间", endDate)),
      dom.h(
        "div",
        { className: "modalActions" },
        dom.h(
          "button",
          {
            className: "button button--danger",
            type: "button",
            onClick: () => {
              const ok = window.confirm("删除该年度目标？\n\n将级联删除：其下所有月度目标、所有待办（包含热力图记录）。此操作不可撤销。");
              if (!ok) return;
              const res = actions.deleteYearGoal(yearGoalId);
              if (!res.ok) return window.alert(res.error || "删除失败");
              actions.closeModal();
            },
          },
          "删除年度目标"
        ),
        dom.h("button", { className: "button button--primary", type: "submit" }, "保存修改")
      )
    );

    return Modal({
      title: "编辑年度目标",
      size: "lg",
      onClose: actions.closeModal,
      content: form,
    });
  };
})();

