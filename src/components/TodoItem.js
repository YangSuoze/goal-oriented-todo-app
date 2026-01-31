(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.components = ns.components || {};

  const { dom } = ns.utils;

  function checkIcon() {
    return dom.h(
      "svg",
      { viewBox: "0 0 16 16", attrs: { "aria-hidden": "true" } },
      dom.h("path", {
        d: "M6.2 11.2 2.9 7.9l1.1-1.1 2.2 2.2 5.8-5.8 1.1 1.1z",
      })
    );
  }

  ns.components.TodoItem = function TodoItem({
    todo,
    monthGoal,
    yearGoal,
    variant,
    flash,
    showDelete = false,
    onToggle,
    onDelete,
  }) {
    const classes = [
      "todoItem",
      todo.completed ? "todoItem--completed" : "",
      flash ? "todoItem--flash" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const valueText = `+${dom.formatNumber(todo.value || 0)}`;
    const valueBadge = dom.h("span", { className: "badge badge--primary", text: valueText });

    const yearTag = yearGoal ? dom.h("span", { className: "badge badge--weak badge--truncate", text: yearGoal.title }) : null;
    const monthTag =
      monthGoal && variant === "today"
        ? dom.h("span", { className: "badge badge--truncate", text: monthGoal.title })
        : monthGoal
          ? dom.h("span", { className: "badge badge--primary", text: monthGoal.month })
          : null;

    return dom.h(
      "li",
      { className: classes },
      dom.h(
        "button",
        {
          className: "checkbox",
          onClick: (e) => {
            e.preventDefault();
            onToggle(todo.id);
          },
          attrs: { title: todo.completed ? "取消完成" : "标记完成", "aria-label": todo.completed ? "取消完成" : "标记完成" },
        },
        checkIcon()
      ),
      dom.h(
        "div",
        { className: "todoItem__body" },
        dom.h(
          "div",
          { className: "todoItem__title" },
          dom.h("span", { className: "todoItem__titleText", text: todo.title }),
          valueBadge,
          monthTag,
          yearTag
        ),
        variant === "today"
          ? null
          : dom.h(
              "div",
              { className: "todoItem__meta" },
              dom.h("span", { className: "mono", text: todo.date }),
              monthGoal ? dom.h("span", { text: `月度：${monthGoal.title}` }) : null,
              yearGoal ? dom.h("span", { text: `年度：${yearGoal.title}` }) : null
            )
      ),
      showDelete
        ? dom.h(
            "div",
            { className: "todoItem__actions" },
            dom.h(
              "button",
              {
                className: "iconButton",
                onClick: (e) => {
                  e.preventDefault();
                  if (!window.confirm("删除该待办？（不会影响其他目标结构）")) return;
                  onDelete(todo.id);
                },
                attrs: { title: "删除" },
              },
              "删除"
            )
          )
        : null
    );
  };
})();
