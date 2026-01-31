(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.components = ns.components || {};

  const { dom } = ns.utils;

  ns.components.Modal = function Modal({ title, content, footer, size = "md", onClose }) {
    const modal = dom.h(
      "div",
      {
        className: `modal modal--${size}`,
        role: "dialog",
        "aria-modal": "true",
        "aria-label": title || "对话框",
      },
      dom.h(
        "div",
        { className: "modal__header" },
        dom.h("div", { className: "modal__title", text: title || "" }),
        dom.h(
          "button",
          { className: "iconButton", onClick: onClose, attrs: { title: "关闭", "aria-label": "关闭" } },
          "关闭"
        )
      ),
      dom.h("div", { className: "modal__body" }, content || null),
      footer ? dom.h("div", { className: "modal__footer" }, footer) : null
    );

    return dom.h(
      "div",
      {
        className: "modalOverlay",
        onClick: (e) => {
          if (e.target !== e.currentTarget) return;
          onClose();
        },
      },
      modal
    );
  };
})();

