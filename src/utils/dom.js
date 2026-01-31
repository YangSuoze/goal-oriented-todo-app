(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.utils = ns.utils || {};

  const dom = (ns.utils.dom = {});

  dom.clear = function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  };

  dom.clamp = function clamp(n, min, max) {
    const num = Number(n);
    if (!Number.isFinite(num)) return min;
    return Math.min(Math.max(num, min), max);
  };

  dom.formatNumber = function formatNumber(n, { maxFractionDigits = 2 } = {}) {
    const num = Number(n);
    if (!Number.isFinite(num)) return "0";
    const isInt = Math.abs(num - Math.round(num)) < 1e-9;
    if (isInt) return String(Math.round(num));
    return num.toFixed(maxFractionDigits).replace(/\.?0+$/, "");
  };

  dom.formatPercent = function formatPercent(n) {
    const num = Number(n);
    if (!Number.isFinite(num)) return "0%";
    return `${Math.round(num)}%`;
  };

  dom.h = function h(tag, props, ...children) {
    const el = document.createElement(tag);
    const p = props || {};

    for (const [key, value] of Object.entries(p)) {
      if (value === undefined || value === null) continue;

      if (key === "className" || key === "class") {
        el.className = String(value);
        continue;
      }
      if (key === "text") {
        el.textContent = String(value);
        continue;
      }
      if (key === "html") {
        el.innerHTML = String(value);
        continue;
      }
      if (key === "dataset" && typeof value === "object") {
        for (const [k, v] of Object.entries(value)) el.dataset[k] = String(v);
        continue;
      }
      if (key === "style") {
        if (typeof value === "string") el.setAttribute("style", value);
        else if (typeof value === "object") Object.assign(el.style, value);
        continue;
      }
      if (key === "attrs" && typeof value === "object") {
        for (const [k, v] of Object.entries(value)) el.setAttribute(k, String(v));
        continue;
      }
      if (key.startsWith("on") && typeof value === "function") {
        el.addEventListener(key.slice(2).toLowerCase(), value);
        continue;
      }

      if (key in el) el[key] = value;
      else el.setAttribute(key, String(value));
    }

    function append(child) {
      if (child === undefined || child === null || child === false) return;
      if (Array.isArray(child)) {
        child.forEach(append);
        return;
      }
      if (typeof child === "string" || typeof child === "number") {
        el.appendChild(document.createTextNode(String(child)));
        return;
      }
      el.appendChild(child);
    }

    children.forEach(append);
    return el;
  };
})();

