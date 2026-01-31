(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.components = ns.components || {};

  const { dom, date } = ns.utils;
  const { ProgressBar } = ns.components;

  function computePerDayNeed(monthGoal) {
    const remaining = Math.max(toNumber(monthGoal.targetValue) - toNumber(monthGoal.currentValue), 0);
    if (remaining <= 0) return 0;

    const nowMonth = date.toISOMonth(new Date());
    if (monthGoal.month === nowMonth) {
      const daysLeft = date.daysRemainingInMonthFrom(date.todayISO(), true);
      if (!daysLeft || daysLeft <= 0) return null;
      return remaining / daysLeft;
    }

    if (date.compareISOMonth(monthGoal.month, nowMonth) > 0) {
      const [yStr, mStr] = String(monthGoal.month).split("-");
      const y = Number(yStr);
      const m = Number(mStr);
      const days = date.daysInMonth(y, m);
      return remaining / days;
    }

    return null;
  }

  function toNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function statusOf(monthGoal) {
    const progress = dom.clamp(monthGoal.progress || 0, 0, 100);
    if (progress >= 100) return { label: "🟢 达成", className: "badge--good" };

    const target = toNumber(monthGoal.targetValue);
    if (target <= 0) return { label: "🟢 正常", className: "badge--good" };

    const now = new Date();
    const nowMonth = date.toISOMonth(now);
    const cmp = date.compareISOMonth(monthGoal.month, nowMonth);
    if (cmp > 0) return { label: "🟢 正常", className: "badge--good" };
    if (cmp < 0) return { label: "🔴 未达标", className: "badge--bad" };

    const [yStr, mStr] = String(monthGoal.month).split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    const daysIn = date.daysInMonth(y, m);
    const elapsed = now.getDate();
    const current = toNumber(monthGoal.currentValue);

    const actualPerDay = elapsed > 0 ? current / elapsed : 0;
    const predictedEnd = actualPerDay * daysIn;

    if (predictedEnd >= target) return { label: "🟢 正常", className: "badge--good" };
    if (predictedEnd >= target * 0.9) return { label: "🟡 偏慢", className: "badge--warn" };
    return { label: "🔴 风险", className: "badge--bad" };
  }

  ns.components.MonthGoalCard = function MonthGoalCard({ monthGoal, yearGoal, isActive, onOpen, onEdit }) {
    const progress = dom.clamp(monthGoal.progress || 0, 0, 100);
    const current = dom.formatNumber(monthGoal.currentValue || 0);
    const target = dom.formatNumber(monthGoal.targetValue || 0);
    const remaining = Math.max(toNumber(monthGoal.targetValue) - toNumber(monthGoal.currentValue), 0);
    const perDay = computePerDayNeed(monthGoal);
    const status = statusOf(monthGoal);

    const hover = [
      "点击进入该月详情",
      `完成：${current} / ${target}`,
      `剩余：${dom.formatNumber(remaining)}`,
      perDay === null ? null : `每天至少：${dom.formatNumber(perDay, { maxFractionDigits: 2 })}`,
    ]
      .filter(Boolean)
      .join("｜");

    const editBtn = onEdit
      ? dom.h(
          "button",
          {
            className: "iconButton iconButton--sm",
            onClick: (e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(monthGoal.id);
            },
            attrs: { title: "编辑月度目标" },
          },
          "编辑"
        )
      : null;

    return dom.h(
      "div",
      {
        className: `card card--clickable monthCard ${isActive ? "card--selected" : ""}`,
        onClick: () => onOpen(monthGoal.id),
        attrs: { title: hover },
      },
      dom.h(
        "div",
        { className: "card__titleRow" },
        dom.h(
          "div",
          { className: "monthCard__headline" },
          dom.h("span", { className: "badge badge--primary mono", text: monthGoal.month }),
          dom.h("span", { className: "monthCard__title", text: monthGoal.title })
        ),
        dom.h("div", { className: "card__actions" }, editBtn, dom.h("span", { className: `badge ${status.className}`, text: status.label }))
      ),
      dom.h(
        "div",
        { className: "card__meta monthCard__meta", style: { marginBottom: "10px" } },
        dom.h("span", { className: "mono", text: `${current} / ${target}` }),
        dom.h("span", { className: "badge", text: `剩余 ${dom.formatNumber(remaining)}` }),
        yearGoal ? dom.h("span", { className: "badge badge--weak badge--truncate", text: yearGoal.title }) : null
      )
      ,
      ProgressBar({ progress })
    );
  };
})();
