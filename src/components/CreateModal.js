(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.components = ns.components || {};

  const { dom, date } = ns.utils;
  const { Modal } = ns.components;

  function segmented({ value, items, onChange }) {
    return dom.h(
      "div",
      { className: "segmented", role: "tablist" },
      items.map((it) =>
        dom.h(
          "button",
          {
            className: `segmented__item ${value === it.value ? "segmented__item--active" : ""}`.trim(),
            disabled: !!it.disabled,
            onClick: () => onChange(it.value),
            attrs: { role: "tab", "aria-selected": value === it.value ? "true" : "false" },
          },
          it.label
        )
      )
    );
  }

  function field(label, input) {
    return dom.h("div", { className: "field" }, dom.h("label", { text: label }), input);
  }

  function buildYearForm({ actions, onDone }) {
    const now = new Date();
    const year = now.getFullYear();
    const defaultStart = `${year}-01-01`;
    const defaultEnd = `${year}-12-31`;

    const title = dom.h("input", { className: "input input--lg", placeholder: "如：一年阅读100篇论文", required: true });
    const description = dom.h("input", { className: "input input--lg", placeholder: "可选：一句话描述" });
    const targetValue = dom.h("input", { className: "input input--sm", type: "number", step: "1", min: "0", value: 100, required: true });
    const startDate = dom.h("input", { className: "input input--sm", type: "date", value: defaultStart });
    const endDate = dom.h("input", { className: "input input--sm", type: "date", value: defaultEnd });

    return dom.h(
      "form",
      {
        className: "form form--modal",
        onSubmit: (e) => {
          e.preventDefault();
          const res = actions.createYearGoal({
            title: title.value,
            description: description.value,
            targetValue: targetValue.value,
            startDate: startDate.value,
            endDate: endDate.value,
          });
          if (!res.ok) return window.alert(res.error || "创建失败");
          onDone();
        },
      },
      field("目标名称（必填）", title),
      field("目标描述", description),
      field("数值目标（必填）", targetValue),
      dom.h("div", { className: "row" }, field("起始时间", startDate), field("结束时间", endDate)),
      dom.h("div", { className: "modalActions" }, dom.h("button", { className: "button button--primary", type: "submit" }, "创建年度目标"))
    );
  }

  function buildMonthForm({ state, actions, onDone }) {
    const yearGoals = state.yearGoals || [];
    const nowMonth = date.toISOMonth(new Date());

    const yearSelect = dom.h(
      "select",
      { className: "input input--lg", required: true, value: state.selectedYearGoalId || "" },
      ...(yearGoals.length ? yearGoals.map((yg) => dom.h("option", { value: yg.id, text: yg.title })) : [dom.h("option", { value: "", text: "暂无年度目标", disabled: true })])
    );

    const month = dom.h("input", { className: "input input--sm", type: "month", value: nowMonth, required: true });
    const title = dom.h("input", { className: "input input--lg", placeholder: "如：本月阅读15篇论文", required: true });
    const targetValue = dom.h("input", { className: "input input--sm", type: "number", step: "1", min: "0", value: 15, required: true });

    return dom.h(
      "form",
      {
        className: "form form--modal",
        onSubmit: (e) => {
          e.preventDefault();
          const res = actions.createMonthGoal({
            yearGoalId: yearSelect.value,
            title: title.value,
            targetValue: targetValue.value,
            month: month.value,
          });
          if (!res.ok) return window.alert(res.error || "创建失败");
          onDone();
        },
      },
      yearGoals.length
        ? field("所属年度目标（必选）", yearSelect)
        : dom.h(
            "div",
            { className: "emptyState" },
            dom.h("div", { className: "emptyState__title", text: "请先创建年度目标" }),
            dom.h("div", { className: "emptyState__desc", text: "月度目标必须归属于一个年度目标。" }),
            dom.h("button", { className: "button button--primary", type: "button", onClick: () => actions.setCreateModalTab("year") }, "去创建年度目标")
          ),
      dom.h("div", { className: "row" }, field("月份", month), field("数值目标", targetValue)),
      field("月度目标名称（必填）", title),
      dom.h("div", { className: "modalActions" }, dom.h("button", { className: "button button--primary", type: "submit", disabled: !yearGoals.length }, "创建月度目标"))
    );
  }

  function buildTodoForm({ state, actions, onDone }) {
    const today = date.todayISO();
    const monthGoals = state.monthGoals || [];
    const yearGoals = state.yearGoals || [];

    const title = dom.h("input", { className: "input input--lg", placeholder: "如：今天阅读1篇论文", required: true });
    const value = dom.h("input", { className: "input input--sm", type: "number", step: "1", min: "0", value: 1, required: true });
    const monthGoalSelect = dom.h(
      "select",
      { className: "input input--lg", required: true },
      ...(monthGoals.length
        ? monthGoals
            .slice()
            .sort((a, b) => String(a.month).localeCompare(String(b.month)))
            .map((mg) => {
              const yg = yearGoals.find((y) => y.id === mg.yearGoalId);
              const label = `${mg.month}｜${mg.title}${yg ? `（${yg.title}）` : ""}`;
              return dom.h("option", { value: mg.id, text: label });
            })
        : [dom.h("option", { value: "", text: "暂无月度目标", disabled: true })])
    );

    const dateISO = dom.h("input", { className: "input input--sm", type: "date", value: today, required: true });

    const infoYear = dom.h("div", { className: "small", text: "-" });
    const infoRemaining = dom.h("div", { className: "small", text: "-" });

    function updateInfo() {
      const mg = monthGoals.find((g) => g.id === monthGoalSelect.value) || null;
      const yg = mg ? yearGoals.find((y) => y.id === mg.yearGoalId) || null : null;
      infoYear.textContent = yg ? `年度目标：${yg.title}` : "年度目标：-";
      if (mg) {
        const remaining = Math.max(Number(mg.targetValue || 0) - Number(mg.currentValue || 0), 0);
        infoRemaining.textContent = `本月剩余量：${dom.formatNumber(remaining)}`;
      } else {
        infoRemaining.textContent = "本月剩余量：-";
      }
    }

    if (state.ui?.pickedMonthGoalId && monthGoals.some((g) => g.id === state.ui.pickedMonthGoalId)) {
      monthGoalSelect.value = state.ui.pickedMonthGoalId;
    }

    updateInfo();

    monthGoalSelect.addEventListener("change", () => {
      actions.pickMonthGoal(monthGoalSelect.value, { silent: true });
      updateInfo();
    });

    return dom.h(
      "form",
      {
        className: "form form--modal",
        onSubmit: (e) => {
          e.preventDefault();
          const res = actions.createTodo({
            title: title.value,
            value: value.value,
            monthGoalId: monthGoalSelect.value,
            dateISO: dateISO.value,
          });
          if (!res.ok) return window.alert(res.error || "创建失败");
          onDone();
        },
      },
      monthGoals.length
        ? dom.h(
            "div",
            { className: "modalInfo" },
            dom.h("div", { className: "modalInfo__row" }, infoYear),
            dom.h("div", { className: "modalInfo__row" }, infoRemaining)
          )
        : dom.h(
            "div",
            { className: "emptyState" },
            dom.h("div", { className: "emptyState__title", text: "请先创建月度目标" }),
            dom.h("div", { className: "emptyState__desc", text: "每日待办必须选择归属的月度目标（必选）。" }),
            dom.h("button", { className: "button button--primary", type: "button", onClick: () => actions.setCreateModalTab("month") }, "去创建月度目标")
          ),
      field("Todo 内容（必填）", title),
      field("数值（默认 1）", value),
      field("所属月度目标（必选）", monthGoalSelect),
      field("日期（默认今天）", dateISO),
      dom.h("div", { className: "modalActions" }, dom.h("button", { className: "button button--primary", type: "submit", disabled: !monthGoals.length }, "添加待办"))
    );
  }

  ns.components.CreateModal = function CreateModal({ state, actions, tab }) {
    const tabs = [
      { value: "todo", label: "每日待办", disabled: false },
      { value: "month", label: "月度目标", disabled: !(state.yearGoals || []).length },
      { value: "year", label: "年度目标", disabled: false },
    ];

    const content =
      tab === "year"
        ? buildYearForm({ actions, onDone: actions.closeModal })
        : tab === "month"
          ? buildMonthForm({ state, actions, onDone: actions.closeModal })
          : buildTodoForm({ state, actions, onDone: actions.closeModal });

    return Modal({
      title: "新建",
      size: "lg",
      onClose: actions.closeModal,
      content: dom.h(
        "div",
        null,
        segmented({
          value: tab || "todo",
          items: tabs,
          onChange: (v) => actions.setCreateModalTab(v),
        }),
        dom.h("div", { className: "divider" }),
        content
      ),
    });
  };
})();
