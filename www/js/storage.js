'use strict';
/* =====================================================================
   SALVATAGGIO DATI (sul telefono, localStorage)
   ===================================================================== */

const STORE_KEY = 'metodo_diretto_v1';
const DEFAULT_TEACHER = 'luca';

function emptyTeacherStat() { return { sessions: 0, days: [], items: 0, first: 0, errors: 0, skipped: 0, lat: 0, latN: 0, time: 0 }; }
function emptyDB() {
  const t = {};
  Object.keys(TEACHERS).forEach(k => { t[k] = emptyTeacherStat(); });
  return { start: null, teachers: t, lessons: {}, settings: { showText: false, teacher: null, pickedDay: null, demoSeen: false } };
}
function loadDB() {
  const db = emptyDB();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      db.start = typeof d.start === 'string' ? d.start : null;
      db.lessons = d.lessons || {};
      db.settings = Object.assign(db.settings, d.settings || {});
      Object.keys(TEACHERS).forEach(k => { db.teachers[k] = Object.assign(emptyTeacherStat(), (d.teachers || {})[k] || {}); });
    }
  } catch (e) {}
  if (!TEACHERS[db.settings.teacher]) db.settings.teacher = null;
  return db;
}
let DB = loadDB();
function saveDB() { try { localStorage.setItem(STORE_KEY, JSON.stringify(DB)); } catch (e) {} }

function todayKey() { return dayKey(new Date()); }
function trialInfo() { return trialFor(DB.start, todayKey()); }
function selectedTeacherKey() {
  const ti = trialInfo();
  if (!TEST_MODE && ti.today && DB.settings.pickedDay !== todayKey()) return ti.today;
  return DB.settings.teacher || DEFAULT_TEACHER;
}
