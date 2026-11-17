/* «Итог месяца» — живая игра для всего класса.
   Доска (экран учителя) показывает вопрос и варианты, ученики отвечают с телефонов.
   Очки как в Kahoot: верный ответ = round(1000 × (1 − (время ответа ÷ время на вопрос) ÷ 2)), то есть от 500 до 1000;
   неверный ответ или нет ответа = 0. Ники живут только во время игры; в результатах класса остаются только «верно / всего». */
"use strict";
const SHAPES = [
  { c: "#E21B3C", n: "Красный", svg: '<path d="M12 3l10 18H2z"/>' },
  { c: "#1368CE", n: "Синий", svg: '<path d="M12 2l10 10-10 10L2 12z"/>' },
  { c: "#D89E00", n: "Жёлтый", svg: '<circle cx="12" cy="12" r="10"/>' },
  { c: "#26890C", n: "Зелёный", svg: '<rect x="3" y="3" width="18" height="18" rx="2"/>' },
];
const shape = (i, size) =>
  `<svg viewBox="0 0 24 24" width="${size || 28}" height="${size || 28}" fill="#fff" aria-hidden="true">${SHAPES[i % 4].svg}</svg>`;
const kahootPoints = (ok, ms, secs) => (ok ? Math.round(1000 * (1 - Math.min(1, Math.max(0, ms / (secs * 1000))) / 2)) : 0);
const studentURL = (code) => {
  const base = (window.KL_CONFIG || {}).studentUrl;
  const u = new URL(base || "index.html", location.href);
  u.hash = "";
  u.search = "?code=" + code;
  return u.href.replace("/index.html?", "/?");
};
const MONTHS = ["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"];

let GM = ls("kl-game"); // running game (teacher side), survives a page reload
let GU = { offP: null, offA: null, tick: null, busy: false };
const saveGM = () => ls("kl-game", GM);
const MS = { sectionId: "", subj: "", src: "mix", count: 15, secs: 20 }; // setup form

/* ---------- setup page ---------- */
function monthView() {
  const secs = S.sections.slice().sort((a, b) => a.name.localeCompare(b.name, "ru", { numeric: true }));
  if (!MS.sectionId && secs[0]) MS.sectionId = secs[0].id;
  const sec = secById(MS.sectionId),
    g = sec ? gradeById(sec.gradeId) : null;
  const sb = g ? subjForGrade(g.num).find((x) => x.k === MS.subj) || subjForGrade(g.num)[0] : null;
  if (sb) MS.subj = sb.k;
  const tests = g && sb ? allTests().filter((t) => t.gradeNum === g.num && t.subject === sb.n && t.status === "ready" && t.questions.length) : [];
  const games = S.runs.filter((r) => r.mode === "game").sort((a, b) => b.ts - a.ts);
  const live = GM && GM.phase !== "closed";
  const opt = (v, cur, label) => `<option value="${esc(v)}" ${String(v) === String(cur) ? "selected" : ""}>${esc(label)}</option>`;
  return `<div class="hero"><img src="logo.png" alt=""><div style="flex:1;min-width:260px"><div class="sub">DIPLOMAT · ИТОГ МЕСЯЦА</div><h1>Игра для всего класса</h1>
    <div style="color:rgba(255,255,255,.72);margin-top:8px;max-width:620px">Вопросы появляются на доске, ученики отвечают с телефонов. Чем быстрее верный ответ, тем больше очков — до 1000 за вопрос. Неверный ответ — 0.</div></div>
    ${live ? `<button class="btn big" style="background:var(--gold);color:var(--dark)" data-a="g-open">${ic("play")}Вернуться к игре ${esc(GM.code)}</button>` : ""}</div>
  ${secs.length ? `<div class="card" style="display:flex;flex-direction:column;gap:16px"><h2>Новая игра</h2>
    <div class="grid" style="gap:14px;grid-template-columns:repeat(5,minmax(0,1fr))">
      <label class="field">Класс<select class="in" id="msSec">${secs.map((s) => opt(s.id, MS.sectionId, s.name)).join("")}</select></label>
      <label class="field">Предмет<select class="in" id="msSubj">${g ? subjForGrade(g.num).map((x) => opt(x.k, MS.subj, x.n)).join("") : ""}</select></label>
      <label class="field">Вопросы<select class="in" id="msSrc">${opt("mix", MS.src, "Смешанные: все 5 уровней")}${tests.map((t) => opt(t.id, MS.src, (t.builtin ? "Уровень " + t.level + " · " + LV(t.level).name : t.title))).join("")}</select></label>
      <label class="field">Количество вопросов<select class="in" id="msCount">${[5, 10, 15, 20, 25].map((n) => opt(n, MS.count, n)).join("")}</select></label>
      <label class="field">Время на вопрос<select class="in" id="msSecs">${[10, 15, 20, 30, 45, 60].map((n) => opt(n, MS.secs, n + " секунд")).join("")}</select></label>
    </div>
    <div class="row" style="flex-wrap:wrap"><button class="btn pri big" data-a="g-create" ${live || !sb ? 'disabled title="Сначала завершите текущую игру или выберите предмет"' : ""}>${ic("play")}Создать игру</button>
    <span class="muted small">${sb ? esc(sb.n) + ", " + g.num + " класс" : "Для этого класса не выбрано ваших предметов"}${live ? " · сначала завершите текущую игру" : ""}</span></div></div>`
  : empty('Сначала добавьте классы. <button class="btn ghost" data-a="go" data-h="classes">К классам</button>')}
  <div class="card"><h2 style="margin-bottom:8px">Прошедшие игры</h2>${games.length ? `<div class="list">${games.map((r) => {
    const p = runAvg(r);
    return `<div class="row"><div><b>${esc((secById(r.sectionId) || {}).name || "Класс удалён")}</b> · ${esc(r.title)}<div class="tiny muted">${fdt(r.ts)} · ${plural((r.rows || []).length, "участник", "участника", "участников")} · ${plural(r.n || 0, "вопрос", "вопроса", "вопросов")}</div></div><span class="sp"></span>${pctChip(p)}${markBadge(markOf(p))}<button class="btn sq danger" data-a="run-del" data-id="${r.id}" aria-label="Удалить">${ic("trash")}</button></div>`;
  }).join("")}</div>` : empty("Здесь появятся итоги прошедших игр: средний процент верных ответов класса.")}</div>`;
}
document.addEventListener("change", (e) => {
  const id = e.target.id;
  if (id === "msSec") { MS.sectionId = e.target.value; MS.src = "mix"; render(); }
  else if (id === "msSubj") { MS.subj = e.target.value; MS.src = "mix"; render(); }
  else if (id === "msSrc") MS.src = e.target.value;
  else if (id === "msCount") MS.count = +e.target.value;
  else if (id === "msSecs") MS.secs = +e.target.value;
});

function pickQuestions(sec) {
  const g = gradeById(sec.gradeId);
  let pool = [];
  if (MS.src === "mix") {
    const sb = subjForGrade(g.num).find((x) => x.k === MS.subj);
    const ts = allTests().filter((t) => t.gradeNum === g.num && t.status === "ready" && sb && t.subject === sb.n);
    const lv = [1, 2, 3, 4, 5].map((n) => ts.filter((t) => t.level === n).flatMap((t) => t.questions));
    const per = Math.ceil(MS.count / 5);
    lv.forEach((qs) => pool.push(...shuffle(qs).slice(0, per)));
    pool = pool.slice(0, MS.count);
    if (pool.length < MS.count) pool.push(...shuffle(ts.flatMap((t) => t.questions)).filter((q) => !pool.includes(q)).slice(0, MS.count - pool.length));
  } else {
    const t = getTest(MS.src);
    pool = t ? shuffle(t.questions).slice(0, MS.count) : [];
  }
  return pool.map((q) => {
    const order = shuffle(q.o.map((_, i) => i)).slice(0, 4);
    if (!order.includes(q.c)) order[order.length - 1] = q.c;
    const o = order.map((i) => q.o[i]);
    return { q: q.q, o, c: order.indexOf(q.c) };
  });
}
function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

A["g-create"] = async (d, btn) => {
  const sec = secById(MS.sectionId);
  if (!sec) return toast("Выберите класс", true);
  const qs = pickQuestions(sec);
  if (qs.length < 3) return toast("Для этого класса мало вопросов. Выберите другой набор.", true);
  btn.disabled = true;
  const now = new Date();
  GM = {
    code: genCode(), sectionId: sec.id, secName: sec.name,
    title: "Итог месяца: " + MONTHS[now.getMonth()] + ((SUBJ.find((x) => x.k === MS.subj) || {}).n ? " · " + SUBJ.find((x) => x.k === MS.subj).n : ""),
    secs: MS.secs, subject: (SUBJ.find((x) => x.k === MS.subj) || {}).n || "", qs, qi: -1, phase: "lobby", startAt: 0, localStart: 0,
    scores: {}, nicks: {}, ans: {}, kicked: [], created: Date.now(),
  };
  try {
    await KL.createGame(GM.code, publicState());
    saveGM();
    log(`${sec.name}: создана игра «${GM.title}», код ${GM.code}`);
    go("game");
  } catch (e) {
    GM = null;
    btn.disabled = false;
    toast("Не удалось создать игру. Проверьте интернет и повторите.", true);
  }
};
A["g-open"] = () => go("game");

/* ---------- state shared with phones (never contains the right answer before reveal) ---------- */
function ranked() {
  return Object.entries(GM.scores)
    .filter(([pid]) => GM.nicks[pid] && !GM.kicked.includes(pid))
    .sort((a, b) => b[1].s - a[1].s || a[1].t - b[1].t);
}
function publicState() {
  const st = { phase: GM.phase, qi: GM.qi, n: GM.qs.length, secs: GM.secs, title: GM.title, cls: GM.secName, kicked: GM.kicked };
  const q = GM.qs[GM.qi];
  if (q && (GM.phase === "question" || GM.phase === "reveal")) st.q = { q: q.q, o: q.o };
  if (GM.phase === "reveal" || GM.phase === "board" || GM.phase === "end") {
    const r = ranked();
    st.scores = Object.fromEntries(r.map(([pid, v], i) => [pid, [v.s, i + 1, v.lp, v.lo]]));
    st.top = r.slice(0, GM.phase === "end" ? 5 : 5).map(([pid, v]) => [GM.nicks[pid], v.s]);
    st.total = r.length;
  }
  if (GM.phase === "reveal" && q) st.c = q.c;
  return st;
}
async function pushState(start) {
  const t = await KL.setGameState(GM.code, publicState(), start);
  if (start) {
    GM.startAt = t;
    GM.localStart = Date.now();
  }
  saveGM();
}

/* ---------- live wiring ---------- */
function wire() {
  if (!GM) return;
  if (!GU.offP) GU.offP = KL.watchPlayers(GM.code, (list) => {
    let changed = false;
    for (const p of list) {
      if (GM.kicked.includes(p.pid)) continue;
      if (!GM.nicks[p.pid]) { GM.nicks[p.pid] = String(p.nick).slice(0, 20); changed = true; }
      if (!GM.scores[p.pid]) GM.scores[p.pid] = { s: 0, c: 0, t: 0, lp: 0, lo: -1 };
    }
    if (changed) { saveGM(); boardSoft(); }
  });
  if (GM.phase === "question" && !GU.offA) {
    const qi = GM.qi;
    GU.offA = KL.watchAnswers(GM.code, qi, (a) => {
      if (!GM || GM.qi !== qi || GM.phase !== "question" || GM.ans[a.pid] || GM.kicked.includes(a.pid)) return;
      GM.ans[a.pid] = { choice: a.choice, at: a.at };
      saveGM();
      boardSoft();
      const active = Object.keys(GM.nicks).filter((p) => !GM.kicked.includes(p)).length;
      if (active && Object.keys(GM.ans).length >= active) reveal();
    });
  }
  if (!GU.tick) GU.tick = setInterval(() => {
    if (!GM || route() !== "game") return;
    if (GM.phase === "question") {
      const left = GM.secs - (Date.now() - GM.localStart) / 1000;
      const el = $("#gTime");
      if (el) el.textContent = Math.max(0, Math.ceil(left));
      if (left <= -0.5) reveal();
    }
  }, 250);
}
function unwire(all) {
  if (GU.offA) { GU.offA(); GU.offA = null; }
  if (all) {
    if (GU.offP) { GU.offP(); GU.offP = null; }
    if (GU.tick) { clearInterval(GU.tick); GU.tick = null; }
  }
}
function boardSoft() { if (route() === "game") render(); }

/* ---------- game steps ---------- */
async function step(fn) {
  if (GU.busy) return;
  GU.busy = true;
  try { await fn(); }
  catch (e) { toast("Нет связи с сервером. Проверьте интернет и нажмите ещё раз.", true); }
  finally { GU.busy = false; render(); }
}
A["g-start"] = () => step(async () => {
  if (!Object.keys(GM.nicks).length) return toast("Пока никто не подключился", true);
  await nextQuestion();
});
async function nextQuestion() {
  unwire();
  GM.qi++;
  GM.ans = {};
  GM.phase = "question";
  await pushState(true);
  wire();
}
async function reveal() {
  if (!GM || GM.phase !== "question" || GU.revealing) return;
  GU.revealing = true;
  unwire();
  const q = GM.qs[GM.qi];
  for (const pid of Object.keys(GM.scores)) {
    const sc = GM.scores[pid], a = GM.ans[pid];
    if (!a) { sc.lp = 0; sc.lo = -1; continue; }
    const ms = Math.max(0, a.at - GM.startAt), ok = a.choice === q.c;
    sc.lp = kahootPoints(ok, ms, GM.secs);
    sc.lo = ok ? 1 : 0;
    sc.s += sc.lp;
    if (ok) { sc.c++; sc.t += ms; }
  }
  GM.phase = "reveal";
  try { await pushState(false); } catch (e) { toast("Нет связи с сервером. Результаты сохранены на этом компьютере.", true); }
  GU.revealing = false;
  render();
}
A["g-reveal"] = () => reveal();
A["g-board"] = () => step(async () => { GM.phase = "board"; await pushState(false); });
A["g-next"] = () => step(async () => {
  if (GM.qi + 1 >= GM.qs.length) await finishGame();
  else await nextQuestion();
});
async function finishGame() {
  GM.phase = "end";
  await pushState(false);
  const sec = secById(GM.sectionId), g = sec ? gradeById(sec.gradeId) : null;
  const rows = ranked().map(([, v]) => ({ correct: v.c, total: GM.qs.length }));
  if (sec && rows.length) {
    put("runs", "g" + GM.code + GM.created.toString(36), {
      sectionId: sec.id, gradeId: sec.gradeId, testId: "game", title: GM.title,
      subject: GM.subject || (g ? subjectFor(g.num) : ""), topic: "Итог месяца", level: 0, ts: Date.now(), mode: "game", n: GM.qs.length, rows,
    }, true);
    log(`${sec.name}: игра «${GM.title}» — ${Math.round(avg(rows.map((r) => (r.correct / r.total) * 100)))}%`);
  }
  saveGM();
}
A["g-end-early"] = () => confirmBox("Завершить игру сейчас? Итоги будут подсчитаны по пройденным вопросам.", () => step(async () => {
  unwire();
  GM.qs = GM.qs.slice(0, Math.max(1, GM.qi + 1));
  if (GM.phase === "question") await reveal();
  await finishGame();
}), "Завершить");
A["g-close"] = () => {
  const done = GM && GM.phase === "end";
  const f = async () => {
    const code = GM.code;
    unwire(true);
    GM = null;
    ls("kl-game", null);
    try { await KL.deleteGame(code); } catch (e) {}
    go("month");
  };
  done ? f() : confirmBox("Отменить игру? Ученики будут отключены, результаты не сохранятся.", f, "Отменить игру");
};
A["g-kick"] = (d) => {
  const nick = GM.nicks[d.p];
  confirmBox(`Убрать «${nick}» из игры?`, () => step(async () => {
    GM.kicked.push(d.p);
    delete GM.scores[d.p];
    await KL.kick(GM.code, d.p).catch(() => {});
    await pushState(false);
  }), "Убрать");
};
A["g-full"] = () => {
  const el = document.documentElement;
  (document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen && el.requestFullscreen()).catch?.(() => {});
};
document.addEventListener("keydown", (e) => {
  if (route() !== "game" || !GM || $("#modal").innerHTML || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  if (e.key !== " " && e.key !== "Enter") return;
  e.preventDefault();
  const b = $(".board [data-key]");
  if (b) b.click();
});

/* ---------- the board (projected screen) ---------- */
function boardView() {
  if (!GM) return `<div class="board"><div class="bcenter"><h1>Игра не запущена</h1><button class="btn big" data-a="go" data-h="month">К разделу «Итог месяца»</button></div></div>`;
  wire();
  const players = Object.keys(GM.nicks).filter((p) => !GM.kicked.includes(p));
  const top = `<div class="btop"><img src="logo.png" alt=""><b>DIPLOMAT</b><span class="cap gold">${esc(GM.secName)}</span><span class="cap">${esc(GM.title)}</span><span class="sp"></span>
    ${GM.phase !== "lobby" && GM.phase !== "end" ? `<span class="cap">Вопрос ${GM.qi + 1} из ${GM.qs.length}</span>` : ""}
    <span class="cap" title="Код игры">КОД ${esc(GM.code)}</span>
    <button class="bbtn ghost" data-a="g-full">Во весь экран</button>
    ${GM.phase === "end" ? "" : `<button class="bbtn ghost" data-a="${GM.phase === "lobby" ? "g-close" : "g-end-early"}">${GM.phase === "lobby" ? "Отменить" : "Завершить"}</button>`}</div>`;
  let body = "";
  if (GM.phase === "lobby") {
    const url = studentURL(GM.code);
    const short = url.replace(/^https?:\/\//, "").replace(/\?code=.*/, "").replace(/\/$/, "");
    let qr = "";
    try { qr = window.qrSVG ? qrSVG(url) : ""; } catch (e) {}
    body = `<div class="lobby"><div class="join"><div class="jl">Наведите камеру телефона на QR-код</div>
      ${qr ? `<div class="qr">${qr}</div>` : ""}
      <div class="jl" style="margin-top:6px">или откройте сайт</div><div class="jurl">${esc(short)}</div>
      <div class="jl" style="margin-top:10px">и введите код игры</div><div class="jcode">${esc(GM.code)}</div></div>
      <div class="plist"><div class="row"><h2 style="color:#fff">Участники</h2><span class="cap gold num">${players.length}</span><span class="sp"></span><button class="bbtn gold big" data-a="g-start" data-key ${players.length ? "" : "disabled"}>Начать игру</button></div>
      <div class="chips">${players.length ? players.map((p) => `<button class="pchip" data-a="g-kick" data-p="${esc(p)}" title="Нажмите, чтобы убрать из игры">${esc(GM.nicks[p])}</button>`).join("") : `<div class="wait">Ждём учеников… Имена появятся здесь. Нажмите на имя, чтобы убрать участника.</div>`}</div></div></div>`;
  } else if (GM.phase === "question" || GM.phase === "reveal") {
    const q = GM.qs[GM.qi], rv = GM.phase === "reveal";
    const dist = q.o.map((_, i) => Object.values(GM.ans).filter((a) => a.choice === i).length);
    const answered = Object.keys(GM.ans).length, maxd = Math.max(1, ...dist);
    const left = Math.max(0, Math.ceil(GM.secs - (Date.now() - GM.localStart) / 1000));
    body = `<div class="qwrap"><div class="qtext">${esc(q.q)}</div>
      <div class="qmid">${rv ? `<div class="dist">${q.o.map((_, i) => `<div class="dcol"><span class="dn num">${dist[i]}</span><i style="height:${(dist[i] / maxd) * 150 + 6}px;background:${SHAPES[i].c};opacity:${i === q.c ? 1 : 0.35}"></i><span class="dsh" style="background:${SHAPES[i].c}">${shape(i, 18)}${i === q.c ? " ✓" : ""}</span></div>`).join("")}</div>`
        : `<div class="timer"><span id="gTime" class="num">${left}</span><small>секунд</small></div><div class="acount"><span class="num">${answered}</span><small>ответили из ${players.length}</small></div>`}</div>
      <div class="opts">${q.o.map((o, i) => `<div class="bopt${rv && i !== q.c ? " dim" : ""}" style="background:${SHAPES[i].c}">${shape(i, 34)}<span>${esc(o)}</span>${rv && i === q.c ? '<b class="ok">✓</b>' : ""}</div>`).join("")}</div>
      <div class="bfoot">${rv ? `<span class="muted2">Верно ответили: ${dist[q.c]} из ${players.length}</span><span class="sp"></span><button class="bbtn gold big" data-a="g-board" data-key>Таблица лидеров</button>`
        : `<span class="muted2">Ученики выбирают ответ на телефоне. Быстрее — больше очков.</span><span class="sp"></span><button class="bbtn" data-a="g-reveal" data-key>Показать ответ</button>`}</div></div>`;
  } else if (GM.phase === "board") {
    const r = ranked().slice(0, 5), last = GM.qi + 1 >= GM.qs.length;
    body = `<div class="lead"><h1>Таблица лидеров</h1><div class="lrows">${r.map(([pid, v], i) => `<div class="lrow${i === 0 ? " first" : ""}"><span class="lp num">${i + 1}</span><b>${esc(GM.nicks[pid])}</b><span class="sp"></span>${v.lp ? `<span class="lplus num">+${v.lp}</span>` : ""}<span class="ls num">${v.s}</span></div>`).join("") || '<div class="wait">Пока нет очков</div>'}</div>
      <div class="bfoot"><span class="sp"></span><button class="bbtn gold big" data-a="g-next" data-key>${last ? "Итоги игры" : "Следующий вопрос"}</button></div></div>`;
  } else if (GM.phase === "end") {
    const r = ranked(), pod = [r[1], r[0], r[2]];
    const cls = r.length ? avg(r.map(([, v]) => (v.c / GM.qs.length) * 100)) : 0;
    body = `<div class="lead"><h1>Итоги игры</h1><div class="podium">${pod.map((x, k) => { const place = [2, 1, 3][k]; return x ? `<div class="pod p${place}"><b>${esc(GM.nicks[x[0]])}</b><span class="num">${x[1].s} очков</span><div class="step">${place}</div></div>` : `<div class="pod p${place} empty"><div class="step">${place}</div></div>`; }).join("")}</div>
      <div class="clsres"><span>Результат класса ${esc(GM.secName)}</span><b class="num">${Math.round(cls)}%</b><span>верных ответов в среднем · оценка ${markOf(cls)}</span></div>
      <div class="bfoot"><span class="muted2">Итог сохранён в класс. Имена учеников не сохраняются.</span><span class="sp"></span><button class="bbtn gold big" data-a="g-close">Закрыть игру</button></div></div>`;
  }
  return `<div class="board">${top}${body}<div class="bcredit">By Mirtemirov Ozodbek</div></div>`;
}
