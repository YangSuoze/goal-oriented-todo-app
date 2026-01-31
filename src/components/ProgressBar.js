(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.components = ns.components || {};

  const { dom } = ns.utils;

  ns.components.ProgressBar = function ProgressBar({ progress, size }) {
    const p = dom.clamp(progress, 0, 100);
    const sizeClass = size ? `progress--${size}` : "";
    return dom.h(
      "div",
      {
        className: `progress ${sizeClass}`.trim(),
        role: "progressbar",
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": Math.round(p),
      },
      dom.h("div", { className: "progress__bar", style: { width: `${p}%` } })
    );
  };
})();
