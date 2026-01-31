(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.components = ns.components || {};

  const { dom } = ns.utils;
  const { ProgressBar } = ns.components;

  function toNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  ns.components.YearGoalCard = function YearGoalCard({ yearGoal, isSelected, onSelect, onEdit }) {
    const progress = dom.clamp(yearGoal.progress || 0, 0, 100);
    const current = dom.formatNumber(yearGoal.currentValue || 0);
    const target = dom.formatNumber(yearGoal.targetValue || 0);
    const remaining = Math.max(toNumber(yearGoal.targetValue) - toNumber(yearGoal.currentValue), 0);

    const badge =
      progress >= 100
        ? dom.h("span", { className: "badge badge--good", text: "达成" })
        : progress >= 60
          ? dom.h("span", { className: "badge badge--primary", text: dom.formatPercent(progress) })
          : dom.h("span", { className: "badge", text: dom.formatPercent(progress) });

    const hover = yearGoal.startDate && yearGoal.endDate ? `周期：${yearGoal.startDate} → ${yearGoal.endDate}｜还差 ${dom.formatNumber(remaining)}` : `还差 ${dom.formatNumber(remaining)}`;

    const editBtn = onEdit
      ? dom.h(
          "button",
          {
            className: "iconButton iconButton--sm",
            onClick: (e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(yearGoal.id);
            },
            attrs: { title: "编辑年度目标" },
          },
          "编辑"
        )
      : null;

    const card = dom.h(
      "div",
      {
        className: `card card--clickable yearCard ${isSelected ? "card--selected" : ""}`,
        onClick: () => onSelect(yearGoal.id),
        attrs: { title: hover },
      },
      dom.h(
        "div",
        { className: "card__titleRow" },
        dom.h("div", { className: "card__title yearCard__title", text: yearGoal.title }),
        dom.h("div", { className: "card__actions" }, editBtn, badge)
      ),
      yearGoal.description ? dom.h("p", { className: "card__desc", text: yearGoal.description }) : null,
      dom.h(
        "div",
        { className: "yearCard__numbers" },
        dom.h("div", { className: "yearCard__fraction", text: `${current} / ${target}` }),
        dom.h("div", { className: "yearCard__remaining", text: `还差 ${dom.formatNumber(remaining)}` })
      ),
      ProgressBar({ progress, size: "lg" })
    );

    return card;
  };
})();
