(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.utils = ns.utils || {};

  const storage = (ns.utils.storage = {});
  const KEY = "goal-oriented-todo-app:v1";

  storage.KEY = KEY;

  storage.safeParse = function safeParse(raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  storage.load = function load() {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = storage.safeParse(raw);
    return data && typeof data === "object" ? data : null;
  };

  storage.save = function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  };

  storage.clear = function clear() {
    localStorage.removeItem(KEY);
  };

  storage.downloadJSON = function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
})();

