(() => {
  const ns = (window.GOAL_TODO = window.GOAL_TODO || {});
  ns.utils = ns.utils || {};

  const date = (ns.utils.date = {});

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  date.toISODate = function toISODate(d) {
    const year = d.getFullYear();
    const month = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    return `${year}-${month}-${day}`;
  };

  date.toISOMonth = function toISOMonth(d) {
    const year = d.getFullYear();
    const month = pad2(d.getMonth() + 1);
    return `${year}-${month}`;
  };

  date.todayISO = function todayISO() {
    return date.toISODate(new Date());
  };

  date.yesterdayISO = function yesterdayISO() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return date.toISODate(d);
  };

  date.parseISODate = function parseISODate(isoDate) {
    const [y, m, d] = String(isoDate).split("-").map((v) => Number(v));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  date.daysInMonth = function daysInMonth(year, month1based) {
    return new Date(year, month1based, 0).getDate();
  };

  date.monthFromISODate = function monthFromISODate(isoDate) {
    return String(isoDate).slice(0, 7);
  };

  date.yearFromISODate = function yearFromISODate(isoDate) {
    return String(isoDate).slice(0, 4);
  };

  date.daysRemainingInMonthFrom = function daysRemainingInMonthFrom(isoDate, includeToday = true) {
    const d = date.parseISODate(isoDate);
    if (!d) return null;
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const total = date.daysInMonth(year, month);
    const day = d.getDate();
    return includeToday ? total - day + 1 : total - day;
  };

  date.addMonths = function addMonths(isoMonth, delta) {
    const [yStr, mStr] = String(isoMonth).split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    if (!y || !m) return null;
    const base = new Date(y, m - 1, 1);
    base.setMonth(base.getMonth() + Number(delta || 0));
    return date.toISOMonth(base);
  };

  date.compareISOMonth = function compareISOMonth(a, b) {
    return String(a).localeCompare(String(b));
  };

  date.compareISODate = function compareISODate(a, b) {
    return String(a).localeCompare(String(b));
  };
})();

