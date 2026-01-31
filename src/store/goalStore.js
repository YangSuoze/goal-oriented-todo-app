(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.store = ns.store || {};

  const { storage, date } = ns.utils;

  const VERSION = 1;
  const listeners = new Set();
  let saveTimer = null;
  let state = null;

  function genId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function toNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
  }

  function progressOf(currentValue, targetValue) {
    const t = toNumber(targetValue, 0);
    if (t <= 0) return 0;
    return clamp((toNumber(currentValue, 0) / t) * 100, 0, 100);
  }

  function ensureString(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
  }

  function nowISODate() {
    return date.todayISO();
  }

  function persistableState() {
    const ui = state.ui || {};
    return {
      version: VERSION,
      yearGoals: state.yearGoals || [],
      monthGoals: state.monthGoals || [],
      todos: state.todos || [],
      selectedYearGoalId: state.selectedYearGoalId || null,
      ui: { darkMode: !!ui.darkMode, pickedMonthGoalId: ui.pickedMonthGoalId || null },
    };
  }

  function scheduleSave() {
    if (!storage) return;
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      try {
        storage.save(persistableState());
      } catch (e) {
        console.warn("Save failed:", e);
      }
    }, 150);
  }

  function notify() {
    for (const fn of listeners) fn(state);
  }

  function notifyOnly() {
    notify();
  }

  function applyTheme() {
    const theme = state?.ui?.darkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
  }

  function recalcAggregates() {
    const yearSum = new Map();
    for (const yg of state.yearGoals) yearSum.set(yg.id, 0);

    const monthSum = new Map();
    for (const mg of state.monthGoals) monthSum.set(mg.id, 0);

    const monthById = new Map();
    for (const mg of state.monthGoals) monthById.set(mg.id, mg);

    for (const t of state.todos) {
      const monthGoal = monthById.get(t.monthGoalId);
      if (monthGoal && t.yearGoalId !== monthGoal.yearGoalId) t.yearGoalId = monthGoal.yearGoalId;

      if (!t.completed) continue;
      const v = toNumber(t.value, 0);
      if (monthSum.has(t.monthGoalId)) monthSum.set(t.monthGoalId, monthSum.get(t.monthGoalId) + v);
      if (yearSum.has(t.yearGoalId)) yearSum.set(t.yearGoalId, yearSum.get(t.yearGoalId) + v);
    }

    for (const mg of state.monthGoals) {
      mg.currentValue = toNumber(monthSum.get(mg.id), 0);
      mg.progress = progressOf(mg.currentValue, mg.targetValue);
    }

    for (const yg of state.yearGoals) {
      yg.currentValue = toNumber(yearSum.get(yg.id), 0);
      yg.progress = progressOf(yg.currentValue, yg.targetValue);
    }
  }

  function commit({ save = true } = {}) {
    recalcAggregates();
    notify();
    if (save) scheduleSave();
  }

  function createExampleState() {
    const today = date.todayISO();
    const yesterday = date.yesterdayISO();

    const now = new Date();
    const year = now.getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const thisMonth = date.toISOMonth(now);
    const nextMonth = date.addMonths(thisMonth, 1);

    const yearGoalReadingId = genId();
    const yearGoalWorkoutId = genId();

    const monthGoalReadingThisId = genId();
    const monthGoalReadingNextId = genId();
    const monthGoalWorkoutThisId = genId();

    const example = {
      version: VERSION,
      yearGoals: [
        {
          id: yearGoalReadingId,
          title: "一年阅读100篇论文",
          description: "把每日行动绑定到大目标：阅读 → 记录 → 复盘。",
          targetValue: 100,
          currentValue: 0,
          startDate,
          endDate,
          progress: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: yearGoalWorkoutId,
          title: "一年运动200次",
          description: "稳定输出：以次数为单位积累运动习惯。",
          targetValue: 200,
          currentValue: 0,
          startDate,
          endDate,
          progress: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      monthGoals: [
        {
          id: monthGoalReadingThisId,
          yearGoalId: yearGoalReadingId,
          title: "本月阅读15篇论文",
          targetValue: 15,
          currentValue: 0,
          month: thisMonth,
          progress: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: monthGoalReadingNextId,
          yearGoalId: yearGoalReadingId,
          title: "下月阅读15篇论文",
          targetValue: 15,
          currentValue: 0,
          month: nextMonth || thisMonth,
          progress: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: monthGoalWorkoutThisId,
          yearGoalId: yearGoalWorkoutId,
          title: "本月运动16次",
          targetValue: 16,
          currentValue: 0,
          month: thisMonth,
          progress: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      todos: [
        {
          id: genId(),
          title: "阅读 1 篇论文（并做笔记）",
          date: today,
          monthGoalId: monthGoalReadingThisId,
          yearGoalId: yearGoalReadingId,
          value: 1,
          completed: false,
          completedAt: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: genId(),
          title: "精读 1 篇论文（复现要点）",
          date: yesterday,
          monthGoalId: monthGoalReadingThisId,
          yearGoalId: yearGoalReadingId,
          value: 1,
          completed: true,
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: genId(),
          title: "跑步 1 次（30 分钟）",
          date: today,
          monthGoalId: monthGoalWorkoutThisId,
          yearGoalId: yearGoalWorkoutId,
          value: 1,
          completed: true,
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: genId(),
          title: "拉伸 1 次（10 分钟）",
          date: today,
          monthGoalId: monthGoalWorkoutThisId,
          yearGoalId: yearGoalWorkoutId,
          value: 1,
          completed: false,
          completedAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      selectedYearGoalId: yearGoalReadingId,
      ui: {
        darkMode: false,
        flashTodoId: null,
        pickedMonthGoalId: monthGoalReadingThisId,
        activeView: "dashboard",
        activeMonthGoalId: null,
        modal: null,
      },
    };

    return example;
  }

  function normalizeLoadedState(loaded) {
    const ui = loaded?.ui || {};
    return {
      version: VERSION,
      yearGoals: Array.isArray(loaded?.yearGoals) ? loaded.yearGoals : [],
      monthGoals: Array.isArray(loaded?.monthGoals) ? loaded.monthGoals : [],
      todos: Array.isArray(loaded?.todos) ? loaded.todos : [],
      selectedYearGoalId: loaded?.selectedYearGoalId || null,
      ui: {
        darkMode: !!ui.darkMode,
        flashTodoId: null,
        pickedMonthGoalId: ui.pickedMonthGoalId || null,
        activeView: "dashboard",
        activeMonthGoalId: null,
        modal: null,
      },
    };
  }

  function init() {
    let loaded = null;
    try {
      loaded = storage.load();
    } catch {
      loaded = null;
    }

    if (loaded && loaded.version === VERSION) state = normalizeLoadedState(loaded);
    else state = createExampleState();

    state.ui = state.ui || {};
    if (!state.ui.activeView) state.ui.activeView = "dashboard";
    if (!("activeMonthGoalId" in state.ui)) state.ui.activeMonthGoalId = null;
    if (!("modal" in state.ui)) state.ui.modal = null;

    if (!state.selectedYearGoalId && state.yearGoals[0]) state.selectedYearGoalId = state.yearGoals[0].id;
    if (!state.ui.pickedMonthGoalId && state.monthGoals[0]) state.ui.pickedMonthGoalId = state.monthGoals[0].id;

    recalcAggregates();
    applyTheme();
    notify();
    scheduleSave();
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function getState() {
    return state;
  }

  function setSelectedYearGoal(yearGoalId) {
    state.selectedYearGoalId = yearGoalId;

    if (state.ui?.activeView === "monthFocus") {
      state.ui.activeView = "monthGoals";
      state.ui.activeMonthGoalId = null;
    }

    const picked = state.ui?.pickedMonthGoalId;
    const pickedMonth = picked ? state.monthGoals.find((g) => g.id === picked) : null;
    if (!pickedMonth || pickedMonth.yearGoalId !== yearGoalId) {
      const list = state.monthGoals.filter((g) => g.yearGoalId === yearGoalId);
      const nowMonth = date.toISOMonth(new Date());
      const preferred = list.find((g) => g.month === nowMonth);
      const fallback = list.slice().sort((a, b) => String(b.month).localeCompare(String(a.month)))[0] || null;
      state.ui.pickedMonthGoalId = (preferred || fallback)?.id || null;
    }

    commit();
  }

  function setView(view) {
    state.ui.activeView = view;
    if (view !== "monthFocus") state.ui.activeMonthGoalId = null;
    notifyOnly();
  }

  function openMonthFocus(monthGoalId) {
    const mgId = ensureString(monthGoalId).trim();
    const mg = state.monthGoals.find((g) => g.id === mgId);
    if (!mg) return;

    state.selectedYearGoalId = mg.yearGoalId;
    state.ui.activeView = "monthFocus";
    state.ui.activeMonthGoalId = mgId;
    state.ui.pickedMonthGoalId = mgId;
    notifyOnly();
    scheduleSave();
  }

  function openModal(modal) {
    state.ui.modal = modal;
    notifyOnly();
  }

  function closeModal() {
    state.ui.modal = null;
    notifyOnly();
  }

  function openCreateModal(tab) {
    state.ui.modal = { type: "create", tab: tab || "todo" };
    notifyOnly();
  }

  function openSettingsModal() {
    state.ui.modal = { type: "settings" };
    notifyOnly();
  }

  function openDayValueModal({ monthGoalId, dateISO }) {
    state.ui.modal = { type: "dayValue", monthGoalId, dateISO };
    notifyOnly();
  }

  function openEditYearGoalModal(yearGoalId) {
    state.ui.modal = { type: "editYear", yearGoalId };
    notifyOnly();
  }

  function openEditMonthGoalModal(monthGoalId) {
    state.ui.modal = { type: "editMonth", monthGoalId };
    notifyOnly();
  }

  function setCreateModalTab(tab) {
    if (!state.ui.modal || state.ui.modal.type !== "create") return;
    state.ui.modal.tab = tab;
    notifyOnly();
  }

  function pickMonthGoal(monthGoalId, { silent = false } = {}) {
    state.ui.pickedMonthGoalId = monthGoalId;
    if (silent) scheduleSave();
    else commit();
  }

  function createYearGoal({ title, description, targetValue, startDate, endDate }) {
    const t = ensureString(title).trim();
    if (!t) return { ok: false, error: "年度目标标题不能为空" };

    const goal = {
      id: genId(),
      title: t,
      description: ensureString(description).trim(),
      targetValue: toNumber(targetValue, 0),
      currentValue: 0,
      startDate: ensureString(startDate, ""),
      endDate: ensureString(endDate, ""),
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    state.yearGoals.unshift(goal);
    state.selectedYearGoalId = goal.id;
    commit();
    return { ok: true, id: goal.id };
  }

  function updateYearGoal(yearGoalId, { title, description, targetValue, startDate, endDate }) {
    const id = ensureString(yearGoalId).trim();
    const goal = state.yearGoals.find((g) => g.id === id);
    if (!goal) return { ok: false, error: "年度目标不存在" };

    const t = ensureString(title).trim();
    if (!t) return { ok: false, error: "年度目标标题不能为空" };

    goal.title = t;
    goal.description = ensureString(description).trim();
    goal.targetValue = toNumber(targetValue, 0);
    goal.startDate = ensureString(startDate, "");
    goal.endDate = ensureString(endDate, "");
    commit();
    return { ok: true };
  }

  function deleteYearGoal(yearGoalId) {
    const id = ensureString(yearGoalId).trim();
    const exists = state.yearGoals.some((g) => g.id === id);
    if (!exists) return { ok: false, error: "年度目标不存在" };

    const monthIds = state.monthGoals.filter((mg) => mg.yearGoalId === id).map((mg) => mg.id);

    state.yearGoals = state.yearGoals.filter((g) => g.id !== id);
    state.monthGoals = state.monthGoals.filter((mg) => mg.yearGoalId !== id);
    state.todos = state.todos.filter((t) => !monthIds.includes(t.monthGoalId) && t.yearGoalId !== id);

    if (state.selectedYearGoalId === id) state.selectedYearGoalId = state.yearGoals[0]?.id || null;

    if (state.ui?.activeView === "monthFocus") {
      const activeMonthId = state.ui.activeMonthGoalId;
      if (activeMonthId && monthIds.includes(activeMonthId)) {
        state.ui.activeView = "monthGoals";
        state.ui.activeMonthGoalId = null;
      }
    }

    const picked = state.ui?.pickedMonthGoalId;
    if (picked && monthIds.includes(picked)) state.ui.pickedMonthGoalId = null;

    const selected = state.selectedYearGoalId;
    if (!selected) {
      state.ui.pickedMonthGoalId = null;
    } else {
      const pickedMonth = state.ui.pickedMonthGoalId ? state.monthGoals.find((g) => g.id === state.ui.pickedMonthGoalId) : null;
      if (!pickedMonth || pickedMonth.yearGoalId !== selected) {
        const list = state.monthGoals.filter((g) => g.yearGoalId === selected);
        const nowMonth = date.toISOMonth(new Date());
        const preferred = list.find((g) => g.month === nowMonth);
        const fallback = list.slice().sort((a, b) => String(b.month).localeCompare(String(a.month)))[0] || null;
        state.ui.pickedMonthGoalId = (preferred || fallback)?.id || null;
      }
    }

    commit();
    return { ok: true };
  }

  function createMonthGoal({ yearGoalId, title, targetValue, month }) {
    const yid = ensureString(yearGoalId).trim();
    if (!state.yearGoals.some((g) => g.id === yid)) return { ok: false, error: "请选择有效的年度目标" };

    const t = ensureString(title).trim();
    if (!t) return { ok: false, error: "月度目标标题不能为空" };

    const m = ensureString(month).trim();
    if (!/^\d{4}-\d{2}$/.test(m)) return { ok: false, error: "月份格式需为 YYYY-MM" };

    const mg = {
      id: genId(),
      yearGoalId: yid,
      title: t,
      targetValue: toNumber(targetValue, 0),
      currentValue: 0,
      month: m,
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    state.monthGoals.unshift(mg);
    state.ui.pickedMonthGoalId = mg.id;
    commit();
    return { ok: true, id: mg.id };
  }

  function updateMonthGoal(monthGoalId, { yearGoalId, title, targetValue, month }) {
    const id = ensureString(monthGoalId).trim();
    const mg = state.monthGoals.find((g) => g.id === id);
    if (!mg) return { ok: false, error: "月度目标不存在" };

    const yid = ensureString(yearGoalId).trim();
    if (!state.yearGoals.some((g) => g.id === yid)) return { ok: false, error: "请选择有效的年度目标" };

    const t = ensureString(title).trim();
    if (!t) return { ok: false, error: "月度目标标题不能为空" };

    const m = ensureString(month).trim();
    if (!/^\d{4}-\d{2}$/.test(m)) return { ok: false, error: "月份格式需为 YYYY-MM" };

    mg.yearGoalId = yid;
    mg.title = t;
    mg.targetValue = toNumber(targetValue, 0);
    mg.month = m;

    if (state.ui?.pickedMonthGoalId === mg.id || (state.ui?.activeView === "monthFocus" && state.ui?.activeMonthGoalId === mg.id)) {
      state.ui.pickedMonthGoalId = mg.id;
      state.selectedYearGoalId = mg.yearGoalId;
    }
    commit();
    return { ok: true };
  }

  function deleteMonthGoal(monthGoalId) {
    const id = ensureString(monthGoalId).trim();
    const mg = state.monthGoals.find((g) => g.id === id);
    if (!mg) return { ok: false, error: "月度目标不存在" };

    state.monthGoals = state.monthGoals.filter((g) => g.id !== id);
    state.todos = state.todos.filter((t) => t.monthGoalId !== id);

    if (state.ui?.activeView === "monthFocus" && state.ui.activeMonthGoalId === id) {
      state.ui.activeView = "monthGoals";
      state.ui.activeMonthGoalId = null;
    }

    if (state.ui?.pickedMonthGoalId === id) {
      const list = state.monthGoals.filter((g) => g.yearGoalId === state.selectedYearGoalId);
      const nowMonth = date.toISOMonth(new Date());
      const preferred = list.find((g) => g.month === nowMonth);
      const fallback = list.slice().sort((a, b) => String(b.month).localeCompare(String(a.month)))[0] || null;
      state.ui.pickedMonthGoalId = (preferred || fallback)?.id || null;
    }

    commit();
    return { ok: true };
  }

  function createTodo({ title, dateISO, monthGoalId, value }) {
    const mgId = ensureString(monthGoalId).trim();
    const monthGoal = state.monthGoals.find((g) => g.id === mgId);
    if (!monthGoal) return { ok: false, error: "请选择有效的月度目标" };

    const t = ensureString(title).trim();
    if (!t) return { ok: false, error: "待办标题不能为空" };

    const d = ensureString(dateISO, "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return { ok: false, error: "日期格式需为 YYYY-MM-DD" };

    const todo = {
      id: genId(),
      title: t,
      date: d,
      monthGoalId: mgId,
      yearGoalId: monthGoal.yearGoalId,
      value: toNumber(value, 1),
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };

    state.todos.unshift(todo);
    state.ui.pickedMonthGoalId = mgId;
    commit();
    return { ok: true, id: todo.id };
  }

  function setDayTotalForDate({ monthGoalId, dateISO, totalValue }) {
    const mgId = ensureString(monthGoalId).trim();
    const d = ensureString(dateISO, "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return { ok: false, error: "日期格式需为 YYYY-MM-DD" };

    const monthGoal = state.monthGoals.find((g) => g.id === mgId);
    if (!monthGoal) return { ok: false, error: "月度目标不存在" };

    const dayTodos = state.todos.filter((t) => t.monthGoalId === mgId && t.date === d);

    const base = dayTodos
      .filter((t) => t.kind !== "dailyLog" && t.completed)
      .reduce((sum, t) => sum + toNumber(t.value, 0), 0);

    const desired = Math.max(toNumber(totalValue, 0), base);
    const needed = desired - base;

    const log = dayTodos.find((t) => t.kind === "dailyLog") || null;
    const now = new Date().toISOString();

    if (needed <= 0) {
      if (log) state.todos = state.todos.filter((t) => t.id !== log.id);
      commit();
      return { ok: true };
    }

    if (log) {
      log.title = "日历记录";
      log.value = needed;
      log.completed = true;
      log.completedAt = now;
      log.yearGoalId = monthGoal.yearGoalId;
      if (!log.createdAt) log.createdAt = now;
      commit();
      return { ok: true };
    }

    state.todos.unshift({
      id: genId(),
      kind: "dailyLog",
      title: "日历记录",
      date: d,
      monthGoalId: mgId,
      yearGoalId: monthGoal.yearGoalId,
      value: needed,
      completed: true,
      completedAt: now,
      createdAt: now,
    });

    commit();
    return { ok: true };
  }

  function toggleTodo(todoId) {
    const t = state.todos.find((x) => x.id === todoId);
    if (!t) return;

    t.completed = !t.completed;
    t.completedAt = t.completed ? new Date().toISOString() : null;

    if (t.completed) {
      state.ui.flashTodoId = t.id;
      window.setTimeout(() => {
        if (!state) return;
        if (state.ui.flashTodoId !== t.id) return;
        state.ui.flashTodoId = null;
        notify();
      }, 450);
    } else if (state.ui.flashTodoId === t.id) {
      state.ui.flashTodoId = null;
    }

    commit();
  }

  function deleteTodo(todoId) {
    state.todos = state.todos.filter((t) => t.id !== todoId);
    commit();
  }

  function toggleDarkMode() {
    state.ui.darkMode = !state.ui.darkMode;
    applyTheme();
    commit();
  }

  function exportJSON() {
    const filename = `goal-todo-export-${nowISODate()}.json`;
    storage.downloadJSON(filename, persistableState());
  }

  function restoreExample() {
    if (storage) storage.clear();
    state = createExampleState();
    applyTheme();
    commit();
  }

  ns.store.init = init;
  ns.store.subscribe = subscribe;
  ns.store.getState = getState;
  ns.store.actions = {
    setSelectedYearGoal,
    setView,
    openMonthFocus,
    openModal,
    closeModal,
    openCreateModal,
    openSettingsModal,
    openDayValueModal,
    openEditYearGoalModal,
    openEditMonthGoalModal,
    setCreateModalTab,
    pickMonthGoal,
    createYearGoal,
    updateYearGoal,
    deleteYearGoal,
    createMonthGoal,
    updateMonthGoal,
    deleteMonthGoal,
    createTodo,
    setDayTotalForDate,
    toggleTodo,
    deleteTodo,
    toggleDarkMode,
    exportJSON,
    restoreExample,
    nowISODate,
  };
})();
