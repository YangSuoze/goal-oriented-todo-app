(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.components = ns.components || {};

  const { dom, storage } = ns.utils;
  const { Modal } = ns.components;

  ns.components.SettingsModal = function SettingsModal({ state, actions }) {
    const body = dom.h(
      "div",
      { className: "stack" },
      dom.h(
        "div",
        { className: "card card--flat" },
        dom.h("div", { className: "small", text: "数据与备份" }),
        dom.h("div", { className: "divider" }),
        dom.h(
          "div",
          { className: "row row--between" },
          dom.h("div", null, dom.h("div", { className: "kpi__value", text: "导出 JSON" }), dom.h("div", { className: "small", text: "导出当前本地数据，便于备份/迁移。" })),
          dom.h("button", { className: "button", onClick: actions.exportJSON }, "导出")
        ),
        dom.h("div", { className: "divider" }),
        dom.h(
          "div",
          { className: "row row--between" },
          dom.h("div", null, dom.h("div", { className: "kpi__value", text: "恢复示例" }), dom.h("div", { className: "small", text: "清空本地数据并恢复示例（不可撤销）。" })),
          dom.h(
            "button",
            {
              className: "button button--danger",
              onClick: () => {
                if (!window.confirm("将清空本地数据并恢复示例数据，是否继续？")) return;
                actions.restoreExample();
                actions.closeModal();
              },
            },
            "恢复"
          )
        )
      ),
      dom.h(
        "div",
        { className: "card card--flat" },
        dom.h("div", { className: "small", text: "存储" }),
        dom.h("div", { className: "divider" }),
        dom.h("div", { className: "small", text: `localStorage key：${storage?.KEY || "-"}` })
      )
    );

    return Modal({ title: "设置", size: "md", onClose: actions.closeModal, content: body });
  };
})();
