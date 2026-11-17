/* Генераторы вопросов для точных предметов и языков.
   Каждый вопрос вычисляется программой, поэтому правильный ответ всегда верен.
   Набор для (предмет, класс, уровень) всегда одинаковый: он строится от постоянного «зерна». */
(function () {
  "use strict";
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const fmt = (x) => { const v = Math.round(x * 100) / 100; return String(v).replace(".", ",").replace("-", "−"); };
  /* r.int(a,b) inclusive; r.pick(list) */
  const tools = (r) => ({ int: (a, b) => a + Math.floor(r() * (b - a + 1)), pick: (l) => l[Math.floor(r() * l.length)], r });
  /* three distinct wrong numeric answers near the right one */
  function near(ans, t, opts) {
    opts = opts || {};
    const out = new Set(), step = opts.step || (Math.abs(ans) >= 100 ? 10 : Math.abs(ans) >= 20 ? 2 : 1);
    const cands = opts.cands || [];
    for (const c of cands) if (out.size < 3 && c !== ans && Number.isFinite(c) && (opts.neg || c >= 0)) out.add(c);
    let k = 0;
    while (out.size < 3 && k++ < 60) {
      const d = (t.int(1, 4)) * step * (t.r() < 0.5 ? -1 : 1);
      const c = Math.round((ans + d) * 100) / 100;
      if (c !== ans && (opts.neg || c >= 0)) out.add(c);
    }
    return [...out].slice(0, 3);
  }
  const Q = (q, a, w, unit) => {
    const u = unit ? " " + unit : "";
    const f = (x) => (typeof x === "number" ? fmt(x) + u : x);
    return [q, f(a), ...w.map(f)];
  };
  const qn = (q, ans, t, unit, opts) => Q(q, ans, near(ans, t, opts), unit);

  /* ================= МАТЕМАТИКА 1–6 ================= */
  const MATH = {
    1: [
      (t) => { const a = t.int(1, 5), b = t.int(1, 5); return qn(`${a} + ${b} = ?`, a + b, t); },
      (t) => { const a = t.int(5, 10), b = t.int(1, a); return qn(`${a} − ${b} = ?`, a - b, t); },
      (t) => { const a = t.int(6, 12), b = t.int(2, 8); return t.r() < 0.5 ? qn(`${a} + ${b} = ?`, a + b, t) : qn(`${a + b} − ${b} = ?`, a, t); },
      (t) => { const a = t.int(2, 9), b = t.int(2, 9); return qn(`Какое число пропущено: ${a} + … = ${a + b}?`, b, t); },
      (t) => { const a = t.int(3, 9), b = t.int(2, 6), it = t.pick(["яблок", "карандашей", "конфет", "тетрадей"]); return qn(`У Азиза было ${a + b} ${it}. Он отдал ${b}. Сколько осталось?`, a, t); },
    ],
    2: [
      (t) => { const a = t.int(11, 60), b = t.int(5, 39); return qn(`${a} + ${b} = ?`, a + b, t); },
      (t) => { const a = t.int(40, 99), b = t.int(11, a - 5); return qn(`${a} − ${b} = ?`, a - b, t); },
      (t) => { const a = t.int(2, 5), b = t.int(2, 9); return qn(`${a} × ${b} = ?`, a * b, t); },
      (t) => { const a = t.int(2, 5), b = t.int(2, 9); return qn(`${a * b} : ${a} = ?`, b, t); },
      (t) => { const a = t.int(2, 5), b = t.int(3, 6); return qn(`В ${a} коробках по ${b} мячей. Сколько всего мячей?`, a * b, t); },
    ],
    3: [
      (t) => { const a = t.int(3, 9), b = t.int(3, 9); return qn(`${a} × ${b} = ?`, a * b, t); },
      (t) => { const a = t.int(3, 9), b = t.int(3, 9); return qn(`${a * b} : ${b} = ?`, a, t); },
      (t) => { const a = t.int(120, 560), b = t.int(110, 430); return qn(`${a} + ${b} = ?`, a + b, t, "", { step: 10 }); },
      (t) => { const a = t.int(3, 12), b = t.int(2, 9); return qn(`Длина прямоугольника ${a} см, ширина ${b} см. Чему равен периметр?`, 2 * (a + b), t, "см", { cands: [a + b, a * b] }); },
      (t) => { const a = t.int(2, 9), b = t.int(2, 9), c = t.int(2, 20); return qn(`Вычисли: ${c} + ${a} × ${b}`, c + a * b, t, "", { cands: [(c + a) * b] }); },
    ],
    4: [
      (t) => { const a = t.int(12, 99), b = t.int(3, 9); return qn(`${a} × ${b} = ?`, a * b, t); },
      (t) => { const b = t.int(3, 9), a = t.int(12, 99); return qn(`${a * b} : ${b} = ?`, a, t); },
      (t) => { const m = t.int(2, 9), c = t.int(5, 95); return qn(`Сколько сантиметров в ${m} м ${c} см?`, m * 100 + c, t, "см", { cands: [m * 10 + c, m + c] }); },
      (t) => { const a = t.int(4, 15), b = t.int(3, 12); return qn(`Чему равна площадь прямоугольника со сторонами ${a} см и ${b} см?`, a * b, t, "см²", { cands: [2 * (a + b)] }); },
      (t) => { const h = t.int(2, 5), m = t.int(5, 55); return qn(`Сколько минут в ${h} ч ${m} мин?`, h * 60 + m, t, "мин", { cands: [h * 100 + m] }); },
    ],
    5: [
      (t) => { const a = t.int(120, 900), b = t.int(12, 60); return qn(`${a} + ${b} × 10 = ?`, a + b * 10, t, "", { cands: [(a + b) * 10] }); },
      (t) => { const a = t.int(2, 40), b = t.int(5, 90); return qn(`Реши уравнение: x + ${a} = ${a + b}`, b, t); },
      (t) => { const d = t.pick([5, 7, 8, 9, 11, 12]), a = t.int(1, d - 2), b = t.int(1, d - a - 1); return Q(`${a}/${d} + ${b}/${d} = ?`, `${a + b}/${d}`, [`${a + b}/${2 * d}`, `${a * b}/${d}`, `${Math.abs(a - b) || 1}/${d}`]); },
      (t) => { const a = t.int(11, 99) / 10, b = t.int(11, 99) / 10; return qn(`${fmt(a)} + ${fmt(b)} = ?`, Math.round((a + b) * 10) / 10, t, "", { step: 0.1 }); },
      (t) => { const p = t.pick([10, 20, 25, 50]), n = t.pick([40, 60, 80, 120, 200, 360]); return qn(`Найди ${p}% от числа ${n}.`, (n * p) / 100, t, "", { cands: [n - (n * p) / 100, p] }); },
    ],
    6: [
      (t) => { const a = t.int(-15, -1), b = t.int(2, 20); return qn(`${fmt(a)} + ${b} = ?`, a + b, t, "", { neg: true, cands: [-(a + b), a - b] }); },
      (t) => { const a = t.int(2, 9), b = t.int(2, 9), x = a * b * t.int(1, 3); return qn(`Наименьшее общее кратное чисел ${a * t.int(1, 1)} и ${b}?`, lcm(a, b), t, "", { cands: [a * b, Math.max(a, b)] }); },
      (t) => { const pair = t.pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [2, 7]]), [a, b] = pair; return Q(`1/${a} + 1/${b} = ?`, `${a + b}/${a * b}`, [`2/${a + b}`, `1/${a * b}`, `2/${a * b}`]); },
      (t) => { const a = t.int(2, 6), b = t.int(3, 9) * a, c = t.int(2, 7); return qn(`Найди x из пропорции: ${a} : ${b} = ${c} : x`, (b * c) / a, t); },
      (t) => { const a = t.int(-9, -2), b = t.int(-9, -2); return qn(`(${fmt(a)}) × (${fmt(b)}) = ?`, a * b, t, "", { neg: true, cands: [-(a * b), a + b] }); },
    ],
  };
  function gcd(a, b) { while (b) [a, b] = [b, a % b]; return Math.abs(a); }
  function lcm(a, b) { return (a * b) / gcd(a, b); }

  /* ================= АЛГЕБРА 7–11 ================= */
  const ALG = {
    7: [
      (t) => { const a = t.int(2, 9), b = t.int(2, 9); return Q(`Приведи подобные: ${a}x + ${b}x`, `${a + b}x`, [`${a * b}x`, `${a + b}x²`, `${a}x²`]); },
      (t) => { const m = t.int(2, 6), n = t.int(2, 6); return Q(`a${sup(m)} · a${sup(n)} = ?`, `a${sup(m + n)}`, [`a${sup(m * n)}`, `${2}a${sup(m + n)}`, `a${sup(Math.abs(m - n) || 1)}`]); },
      (t) => { const a = t.int(2, 6), x = t.int(-5, 9), b = t.int(1, 15); return qn(`Реши уравнение: ${a}x + ${b} = ${a * x + b}`, x, t, "", { neg: true }); },
      (t) => { const k = t.int(-4, 5) || 2, b = t.int(-6, 6), x = t.int(-3, 4); return qn(`Функция y = ${k}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}. Найди y при x = ${x}.`, k * x + b, t, "", { neg: true }); },
      (t) => { const a = t.int(2, 7); return Q(`(x + ${a})² = ?`, `x² + ${2 * a}x + ${a * a}`, [`x² + ${a * a}`, `x² + ${a}x + ${a * a}`, `x² + ${2 * a}x + ${2 * a}`]); },
    ],
    8: [
      (t) => { const a = t.int(2, 15); return qn(`√${a * a} = ?`, a, t); },
      (t) => { const x1 = t.int(-5, 6), x2 = t.int(-5, 6); const b = -(x1 + x2), c = x1 * x2; return qn(`Сумма корней уравнения x² ${sg(b)}x ${sg(c)} = 0 (по теореме Виета)?`, x1 + x2, t, "", { neg: true, cands: [b, c] }); },
      (t) => { const x1 = t.int(-5, 6), x2 = t.int(-5, 6); const b = -(x1 + x2), c = x1 * x2; return qn(`Произведение корней уравнения x² ${sg(b)}x ${sg(c)} = 0?`, c, t, "", { neg: true, cands: [x1 + x2, -c] }); },
      (t) => { const a = t.int(2, 5), b = t.int(1, 12), c = t.int(b + 1, b + 20); return Q(`Реши неравенство: ${a}x + ${b} > ${b + a * (c - b)}`, `x > ${c - b}`, [`x < ${c - b}`, `x > ${c}`, `x > ${b}`]); },
      (t) => { const b = t.int(-8, 8), c = t.int(-10, 10); const D = b * b - 4 * c; return Q(`Сколько корней у уравнения x² ${sg(b)}x ${sg(c)} = 0?`, D > 0 ? "Два" : D === 0 ? "Один" : "Нет корней", ["Два", "Один", "Нет корней", "Бесконечно много"].filter((x) => x !== (D > 0 ? "Два" : D === 0 ? "Один" : "Нет корней")).slice(0, 3)); },
    ],
    9: [
      (t) => { const a1 = t.int(-5, 10), d = t.int(2, 7), n = t.int(5, 15); return qn(`Арифметическая прогрессия: a₁ = ${a1}, d = ${d}. Найди a${sub(n)}.`, a1 + (n - 1) * d, t, "", { neg: true, cands: [a1 + n * d] }); },
      (t) => { const b1 = t.int(1, 5), q = t.int(2, 3), n = t.int(3, 6); return qn(`Геометрическая прогрессия: b₁ = ${b1}, q = ${q}. Найди b${sub(n)}.`, b1 * q ** (n - 1), t, "", { cands: [b1 * q ** n, b1 * q * (n - 1)] }); },
      (t) => { const a1 = t.int(1, 10), d = t.int(1, 5), n = t.int(5, 12); const an = a1 + (n - 1) * d; return qn(`Найди сумму первых ${n} членов арифметической прогрессии: a₁ = ${a1}, d = ${d}.`, ((a1 + an) * n) / 2, t, "", { step: 5 }); },
      (t) => { const h = t.int(-4, 4), k = t.int(-5, 5); return Q(`Координаты вершины параболы y = (x ${sg(-h)})² ${sg(k)}?`, `(${fmt(h)}; ${fmt(k)})`, [`(${fmt(-h)}; ${fmt(k)})`, `(${fmt(h)}; ${fmt(-k)})`, `(${fmt(k)}; ${fmt(h)})`]); },
      (t) => { const a = t.int(1, 6); return Q(`Реши неравенство: x² < ${a * a}`, `−${a} < x < ${a}`, [`x < ${a}`, `x > ${a}`, `x < −${a} или x > ${a}`]); },
    ],
    10: [
      (t) => { const v = t.pick([["sin 30°", "1/2"], ["cos 60°", "1/2"], ["sin 90°", "1"], ["cos 0°", "1"], ["tg 45°", "1"], ["sin 0°", "0"], ["cos 90°", "0"], ["sin 45°", "√2/2"], ["cos 30°", "√3/2"], ["tg 60°", "√3"]]); return Q(`${v[0]} = ?`, v[1], ["1/2", "1", "0", "√2/2", "√3/2", "√3"].filter((x) => x !== v[1]).slice(0, 3)); },
      (t) => { const b = t.pick([2, 3, 5, 10]), n = t.int(1, 4); return qn(`log${sub(b)} ${b ** n} = ?`, n, t, "", { cands: [b * n, b ** n / b] }); },
      (t) => { const a = t.int(2, 6), n = t.int(2, 4); return Q(`Производная функции y = ${a}x${sup(n)}?`, `${a * n}x${n - 1 > 1 ? sup(n - 1) : ""}`, [`${a}x${sup(n - 1)}`, `${a * n}x${sup(n)}`, `${a}x${sup(n + 1)}`]); },
      (t) => { const a = t.int(1, 4), b = t.int(-5, 5), x = t.int(-2, 3); return qn(`f(x) = ${a}x² ${sg(b)}x. Найди f′(${x}).`, 2 * a * x + b, t, "", { neg: true, cands: [a * x * x + b * x] }); },
      (t) => { const b = t.pick([2, 3]), n = t.int(2, 5); return qn(`Реши уравнение: ${b}ˣ = ${b ** n}`, n, t, "", { cands: [b ** n / b] }); },
    ],
    11: [
      (t) => { const n = t.int(2, 5), a = t.int(1, 3); return Q(`Первообразная функции f(x) = ${a * (n + 1)}x${sup(n)}?`, `${a}x${sup(n + 1)} + C`, [`${a * (n + 1) * n}x${sup(n - 1)} + C`, `${a * (n + 1)}x${sup(n + 1)} + C`, `${a}x${sup(n)} + C`]); },
      (t) => { const b = t.int(1, 4); return qn(`Вычисли интеграл ∫₀${sup(b)} 2x dx`, b * b, t, "", { cands: [2 * b, b] }); },
      (t) => { const b = t.pick([2, 3, 5]), n = t.int(2, 4); return qn(`Реши уравнение: log${sub(b)} x = ${n}`, b ** n, t, "", { cands: [b * n, n ** b] }); },
      (t) => { const n = t.int(4, 9), k = t.int(1, n - 1); return Q(`В коробке ${n} шаров, из них ${k} красных. Вероятность вытащить красный шар?`, `${k}/${n}`, [`${n - k}/${n}`, `1/${n}`, `${k}/${n - k}`]); },
      (t) => { const n = t.int(3, 6); return qn(`Сколькими способами можно рассадить ${n} человек на ${n} стульев?`, fact(n), t, "", { cands: [n * n, n * (n - 1), 2 * n] }); },
    ],
  };
  function sup(n) { return String(n).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+c] || c).join(""); }
  function sub(n) { return String(n).split("").map((c) => "₀₁₂₃₄₅₆₇₈₉"[+c] || c).join(""); }
  function sg(v) { return v < 0 ? "− " + Math.abs(v) : "+ " + v; }
  function fact(n) { return n <= 1 ? 1 : n * fact(n - 1); }

  /* ================= ГЕОМЕТРИЯ 7–11 ================= */
  const GEOM = {
    7: [
      (t) => { const a = t.int(20, 160); return qn(`Один из смежных углов равен ${a}°. Чему равен другой?`, 180 - a, t, "°", { cands: [a, 90 - (a % 90)] }); },
      (t) => { const a = t.int(20, 160); return qn(`Один из вертикальных углов равен ${a}°. Чему равен другой?`, a, t, "°", { cands: [180 - a] }); },
      (t) => { const a = t.int(30, 80), b = t.int(20, 90); return qn(`Два угла треугольника равны ${a}° и ${b}°. Найди третий угол.`, 180 - a - b, t, "°", { cands: [a + b] }); },
      (t) => { const a = t.int(30, 80); return qn(`В равнобедренном треугольнике угол при основании равен ${a}°. Найди угол при вершине.`, 180 - 2 * a, t, "°", { cands: [a, 180 - a] }); },
      (t) => { const a = t.int(5, 15), b = t.int(4, a - 1); return qn(`Боковая сторона равнобедренного треугольника ${a} см, основание ${b} см. Найди периметр.`, 2 * a + b, t, "см", { cands: [a + 2 * b, a + b] }); },
    ],
    8: [
      (t) => { const [a, b, c] = t.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]]); return qn(`Катеты прямоугольного треугольника ${a} и ${b}. Найди гипотенузу.`, c, t, "", { cands: [a + b] }); },
      (t) => { const a = t.int(4, 20), h = t.int(3, 15); return qn(`Основание треугольника ${a} см, высота ${h} см. Найди площадь.`, (a * h) / 2, t, "см²", { cands: [a * h] }); },
      (t) => { const a = t.int(4, 14), b = t.int(a + 2, a + 12), h = t.int(3, 10); return qn(`Основания трапеции ${a} и ${b} см, высота ${h} см. Найди площадь.`, ((a + b) * h) / 2, t, "см²", { cands: [(a + b) * h] }); },
      (t) => { const n = t.int(5, 12); return qn(`Сумма внутренних углов выпуклого ${n}-угольника?`, (n - 2) * 180, t, "°", { cands: [n * 180, 360] }); },
      (t) => { const a = t.int(4, 14), h = t.int(3, 10); return qn(`Сторона параллелограмма ${a} см, высота к ней ${h} см. Найди площадь.`, a * h, t, "см²", { cands: [(a * h) / 2, 2 * (a + h)] }); },
    ],
    9: [
      (t) => { const r = t.int(2, 12); return Q(`Длина окружности радиуса ${r}?`, `${2 * r}π`, [`${r}π`, `${r * r}π`, `${4 * r}π`]); },
      (t) => { const r = t.int(2, 12); return Q(`Площадь круга радиуса ${r}?`, `${r * r}π`, [`${2 * r}π`, `${r}π`, `${2 * r * r}π`]); },
      (t) => { const [x, y, l] = t.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [12, 5, 13]]); return qn(`Длина вектора a(${x}; ${y})?`, l, t, "", { cands: [x + y] }); },
      (t) => { const [a, b, c] = t.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]); return Q(`В прямоугольном треугольнике катеты ${a} и ${b}, гипотенуза ${c}. sin угла против катета ${a}?`, `${a}/${c}`, [`${b}/${c}`, `${a}/${b}`, `${c}/${a}`]); },
      (t) => { const x1 = t.int(-5, 5), y1 = t.int(-5, 5), x2 = t.int(-5, 5), y2 = t.int(-5, 5); return Q(`Координаты середины отрезка AB, A(${x1}; ${y1}), B(${x2}; ${y2})?`, `(${fmt((x1 + x2) / 2)}; ${fmt((y1 + y2) / 2)})`, [`(${fmt(x1 + x2)}; ${fmt(y1 + y2)})`, `(${fmt((x2 - x1) / 2)}; ${fmt((y2 - y1) / 2)})`, `(${fmt((y1 + y2) / 2)}; ${fmt((x1 + x2) / 2)})`]); },
    ],
    10: [
      (t) => { const a = t.int(2, 12); return qn(`Объём куба с ребром ${a} см?`, a ** 3, t, "см³", { cands: [6 * a * a, a * a] }); },
      (t) => { const a = t.int(2, 10); return qn(`Площадь полной поверхности куба с ребром ${a} см?`, 6 * a * a, t, "см²", { cands: [a ** 3, 4 * a * a] }); },
      (t) => { const a = t.int(2, 9), b = t.int(2, 9), c = t.int(2, 9); return qn(`Объём прямоугольного параллелепипеда ${a} × ${b} × ${c} см?`, a * b * c, t, "см³", { cands: [2 * (a * b + b * c + a * c)] }); },
      (t) => { const [a, b, c, d] = t.pick([[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9]]); return qn(`Диагональ прямоугольного параллелепипеда с рёбрами ${a}, ${b}, ${c}?`, d, t, "", { cands: [a + b + c] }); },
      (t) => { const S = t.int(4, 30), h = t.int(3, 12); return qn(`Площадь основания призмы ${S} см², высота ${h} см. Найди объём.`, S * h, t, "см³", { cands: [(S * h) / 3] }); },
    ],
    11: [
      (t) => { const r = t.int(2, 6), h = t.int(2, 10); return Q(`Объём цилиндра: r = ${r}, h = ${h}?`, `${r * r * h}π`, [`${2 * r * h}π`, `${r * h}π`, `${(r * r * h) / 3}π`.replace(".", ",")]); },
      (t) => { const r = 3 * t.int(1, 3), h = t.int(2, 8); return Q(`Объём конуса: r = ${r}, h = ${h}?`, `${(r * r * h) / 3}π`, [`${r * r * h}π`, `${(r * h) / 3}π`.replace(".", ","), `${2 * r * h}π`]); },
      (t) => { const r = 3 * t.int(1, 3); return Q(`Объём шара радиуса ${r}?`, `${(4 * r ** 3) / 3}π`, [`${4 * r * r}π`, `${r ** 3}π`, `${(2 * r ** 3) / 3}π`]); },
      (t) => { const r = t.int(2, 9); return Q(`Площадь поверхности шара радиуса ${r}?`, `${4 * r * r}π`, [`${2 * r * r}π`, `${r * r}π`, `${(4 * r ** 3)}π`]); },
      (t) => { const S = t.int(3, 20) * 3, h = t.int(2, 9); return qn(`Площадь основания пирамиды ${S} см², высота ${h} см. Найди объём.`, (S * h) / 3, t, "см³", { cands: [S * h] }); },
    ],
  };

  /* ================= ФИЗИКА 7–11 ================= */
  const PHYS = {
    7: [
      (t) => { const v = t.int(2, 30), tt = t.int(2, 10); return qn(`Тело движется со скоростью ${v} м/с. Какой путь оно пройдёт за ${tt} с?`, v * tt, t, "м", { cands: [v + tt] }); },
      (t) => { const v = t.int(2, 20), tt = t.int(2, 12); return qn(`Путь ${v * tt} м пройден за ${tt} с. Найди скорость.`, v, t, "м/с", { cands: [v * tt * tt] }); },
      (t) => { const rho = t.pick([1000, 2700, 7800, 900, 800]), V = t.pick([0.1, 0.2, 0.5, 2]); return qn(`Плотность вещества ${rho} кг/м³, объём ${fmt(V)} м³. Найди массу.`, rho * V, t, "кг", { cands: [rho / V] }); },
      (t) => { const m = t.int(2, 60); return qn(`Какая сила тяжести действует на тело массой ${m} кг? (g = 10 Н/кг)`, m * 10, t, "Н", { cands: [m] }); },
      (t) => { const F = t.int(2, 50) * 100, S = t.pick([0.5, 1, 2, 4]); return qn(`Сила ${F} Н действует на площадь ${fmt(S)} м². Найди давление.`, F / S, t, "Па", { cands: [F * S] }); },
    ],
    8: [
      (t) => { const c = t.pick([4200, 460, 920, 2100]), m = t.pick([1, 2, 0.5]), d = t.int(2, 20) * 5; return qn(`Сколько теплоты нужно, чтобы нагреть ${fmt(m)} кг вещества (c = ${c} Дж/(кг·°C)) на ${d} °C?`, c * m * d, t, "Дж", { step: c * m * 5 }); },
      (t) => { const R = t.int(2, 20), I = t.int(1, 6); return qn(`Сопротивление ${R} Ом, сила тока ${I} А. Найди напряжение.`, R * I, t, "В", { cands: [R / I] }); },
      (t) => { const R = t.int(2, 12), I = t.int(1, 6); return qn(`Напряжение ${R * I} В, сопротивление ${R} Ом. Найди силу тока.`, I, t, "А", { cands: [R * R * I] }); },
      (t) => { const a = t.int(2, 20), b = t.int(2, 20); return qn(`Резисторы ${a} Ом и ${b} Ом соединены последовательно. Общее сопротивление?`, a + b, t, "Ом", { cands: [Math.abs(a - b)] }); },
      (t) => { const U = t.pick([12, 24, 110, 220]), I = t.int(1, 5); return qn(`Напряжение ${U} В, сила тока ${I} А. Найди мощность.`, U * I, t, "Вт", { cands: [U / I] }); },
    ],
    9: [
      (t) => { const v0 = t.int(0, 10), a = t.int(1, 5), tt = t.int(2, 10); return qn(`v₀ = ${v0} м/с, a = ${a} м/с², t = ${tt} с. Найди скорость v.`, v0 + a * tt, t, "м/с", { cands: [a * tt] }); },
      (t) => { const a = t.int(1, 4) * 2, tt = t.int(2, 8); return qn(`Тело начало движение из покоя с ускорением ${a} м/с². Какой путь за ${tt} с?`, (a * tt * tt) / 2, t, "м", { cands: [a * tt * tt, a * tt] }); },
      (t) => { const m = t.int(2, 20), v = t.int(2, 15); return qn(`Импульс тела массой ${m} кг при скорости ${v} м/с?`, m * v, t, "кг·м/с", { cands: [(m * v * v) / 2] }); },
      (t) => { const m = t.int(1, 10) * 2, v = t.int(2, 10); return qn(`Кинетическая энергия тела массой ${m} кг при скорости ${v} м/с?`, (m * v * v) / 2, t, "Дж", { cands: [m * v, m * v * v] }); },
      (t) => { const m = t.int(2, 20), a = t.int(1, 6); return qn(`Тело массой ${m} кг движется с ускорением ${a} м/с². Найди равнодействующую силу.`, m * a, t, "Н", { cands: [m / a] }); },
    ],
    10: [
      (t) => { const m = t.int(1, 20), h = t.int(2, 30); return qn(`Потенциальная энергия тела массой ${m} кг на высоте ${h} м? (g = 10 м/с²)`, m * 10 * h, t, "Дж", { cands: [m * h] }); },
      (t) => { const F = t.int(5, 50), s = t.int(2, 20); return qn(`Сила ${F} Н переместила тело на ${s} м вдоль направления силы. Найди работу.`, F * s, t, "Дж", { cands: [F / s] }); },
      (t) => { const A = t.int(2, 50) * 100, tt = t.pick([2, 4, 5, 10]); return qn(`Работа ${A} Дж совершена за ${tt} с. Найди мощность.`, A / tt, t, "Вт", { cands: [A * tt] }); },
      (t) => { const k = t.int(1, 10) * 100, x = t.pick([0.01, 0.02, 0.05, 0.1]); return qn(`Жёсткость пружины ${k} Н/м, удлинение ${fmt(x)} м. Найди силу упругости.`, k * x, t, "Н", { cands: [k / x / 100] }); },
      (t) => { const p = t.int(1, 5) * 100000, V = t.pick([0.01, 0.02, 0.05]), Tk = t.pick([300, 400]); return qn(`Газ при давлении ${p / 1000} кПа занимает ${fmt(V)} м³. Объём при том же T и давлении ${(p * 2) / 1000} кПа?`, V / 2, t, "м³", { step: 0.01, cands: [V * 2] }); },
    ],
    11: [
      (t) => { const f = t.pick([2, 4, 5, 10, 20, 25, 50]); return qn(`Частота колебаний ${f} Гц. Найди период.`, 1 / f, t, "с", { step: 0.01, cands: [f] }); },
      (t) => { const v = t.pick([340, 1500]), f = t.pick([170, 340, 500, 680, 1000]); return qn(`Скорость волны ${v} м/с, частота ${f} Гц. Найди длину волны.`, Math.round((v / f) * 100) / 100, t, "м", { step: 0.1, cands: [v * f / 1000] }); },
      (t) => { const F = t.pick([0.1, 0.2, 0.25, 0.5, 2]); return qn(`Фокусное расстояние линзы ${fmt(F)} м. Найди оптическую силу.`, 1 / F, t, "дптр", { cands: [F] }); },
      (t) => { const P = t.int(1, 20) * 100, tt = t.int(1, 5); return qn(`Прибор мощностью ${P} Вт работал ${tt} ч. Сколько энергии он потребил?`, (P * tt) / 1000, t, "кВт·ч", { step: 0.1, cands: [P * tt] }); },
      (t) => { const q1 = t.int(1, 5), q2 = t.int(1, 5); const k = q1 + 1, r = (x) => `${x} раз${x % 10 >= 2 && x % 10 <= 4 && (x < 10 || x > 20) ? "а" : ""}`; return Q(`Как изменится сила взаимодействия двух зарядов, если расстояние между ними увеличить в ${r(k)}?`, `Уменьшится в ${r(k * k)}`, [`Уменьшится в ${r(k)}`, `Увеличится в ${r(k * k)}`, "Не изменится"]); },
    ],
  };

  /* ================= ХИМИЯ 7–11 ================= */
  const EL = { H: ["водород", 1], C: ["углерод", 12], N: ["азот", 14], O: ["кислород", 16], Na: ["натрий", 23], Mg: ["магний", 24], Al: ["алюминий", 27], S: ["сера", 32], Cl: ["хлор", 35.5], K: ["калий", 39], Ca: ["кальций", 40], Fe: ["железо", 56], Cu: ["медь", 64], Zn: ["цинк", 65] };
  const CMP = ["H2O", "CO2", "NaCl", "H2SO4", "HCl", "NaOH", "CaCO3", "Fe2O3", "NH3", "CH4", "MgO", "Al2O3", "KOH", "CuO", "SO2", "HNO3", "CaO", "ZnO", "KCl", "MgCl2"];
  const parse = (f) => [...f.matchAll(/([A-Z][a-z]?)(\d*)/g)].map((m) => [m[1], +(m[2] || 1)]);
  const Mr = (f) => parse(f).reduce((s, [e, n]) => s + EL[e][1] * n, 0);
  const pf = (f) => f.replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]);
  const ALK = ["метан", "этан", "пропан", "бутан", "пентан", "гексан", "гептан", "октан", "нонан", "декан"];
  const CHEM = {
    7: [
      (t) => { const e = t.pick(Object.keys(EL)); return Q(`Какой химический знак у элемента «${EL[e][0]}»?`, e, Object.keys(EL).filter((x) => x !== e).sort(() => t.r() - 0.5).slice(0, 3)); },
      (t) => { const e = t.pick(Object.keys(EL)); return qn(`Относительная атомная масса элемента ${e} (${EL[e][0]})?`, EL[e][1], t, "", { cands: Object.values(EL).map((v) => v[1]).filter((v) => v !== EL[e][1]).slice(0, 2) }); },
      (t) => { const f = t.pick(CMP); return qn(`Сколько всего атомов в формуле ${pf(f)}?`, parse(f).reduce((s, [, n]) => s + n, 0), t); },
      (t) => { const f = t.pick(CMP); const els = parse(f).map(([e]) => EL[e][0]); return Q(`Из каких элементов состоит вещество ${pf(f)}?`, els.join(", "), [["водород", "сера"], ["натрий", "азот"], ["углерод", "хлор"], ["кальций", "кислород"], ["железо", "сера"]].map((x) => x.join(", ")).filter((x) => x !== els.join(", ")).slice(0, 3)); },
      (t) => { const f = t.pick(CMP.slice(0, 12)); return qn(`Относительная молекулярная масса ${pf(f)}?`, Mr(f), t, "", { step: 2 }); },
    ],
    8: [
      (t) => { const f = t.pick(CMP); return qn(`Молярная масса ${pf(f)}?`, Mr(f), t, "г/моль", { step: 2 }); },
      (t) => { const f = t.pick(CMP), n = t.pick([0.5, 1, 2, 3]); return qn(`Количество вещества ${pf(f)} массой ${fmt(Mr(f) * n)} г?`, n, t, "моль", { step: 0.5 }); },
      (t) => { const f = t.pick(["H2O", "CO2", "MgO", "CaO", "SO2", "CuO", "NaOH", "CaCO3"]); const o = parse(f).find(([e]) => e === "O"); return qn(`Массовая доля кислорода в ${pf(f)} (в %, до целого)?`, Math.round((16 * o[1] / Mr(f)) * 100), t, "%", { step: 5 }); },
      (t) => { const n = t.pick([0.5, 1, 2, 3]); return qn(`Какой объём (н. у.) занимают ${fmt(n)} моль газа?`, 22.4 * n, t, "л", { step: 11.2 }); },
      (t) => { const v = t.pick([["Na", 1], ["Mg", 2], ["Al", 3], ["K", 1], ["Ca", 2], ["Zn", 2]]); return qn(`Валентность ${v[0]} в соединениях?`, v[1], t, "", { cands: [1, 2, 3, 4].filter((x) => x !== v[1]) }); },
    ],
    9: [
      (t) => { const f = t.pick(CMP), n = t.pick([0.5, 2, 3, 4]); return qn(`Масса ${fmt(n)} моль ${pf(f)}?`, Mr(f) * n, t, "г", { step: 5 }); },
      (t) => { const m = t.pick([100, 200, 250, 400, 500]), w = t.pick([5, 10, 20, 25]); return qn(`Сколько граммов соли в ${m} г раствора с массовой долей ${w}%?`, (m * w) / 100, t, "г", { cands: [m - (m * w) / 100] }); },
      (t) => { const s = t.int(1, 6) * 10, wt = t.int(2, 8) * 50; return qn(`В ${wt} г воды растворили ${s} г соли. Массовая доля соли (в %, до десятых)?`, Math.round((s / (s + wt)) * 1000) / 10, t, "%", { step: 1.5, cands: [Math.round((s / wt) * 1000) / 10] }); },
      (t) => { const V = t.pick([11.2, 22.4, 44.8, 67.2]); return qn(`Количество вещества газа объёмом ${fmt(V)} л (н. у.)?`, V / 22.4, t, "моль", { step: 0.5 }); },
      (t) => { const p = t.pick([["кислотная", "HCl"], ["основание", "NaOH"], ["соль", "NaCl"], ["оксид", "CO2"], ["основание", "KOH"], ["кислотная", "H2SO4"], ["соль", "CaCO3"], ["оксид", "MgO"]]); const cl = { "кислотная": "Кислота", "основание": "Основание", "соль": "Соль", "оксид": "Оксид" }[p[0]]; return Q(`К какому классу относится ${pf(p[1])}?`, cl, ["Кислота", "Основание", "Соль", "Оксид"].filter((x) => x !== cl)); },
    ],
    10: [
      (t) => { const n = t.int(1, 10); return Q(`Формула алкана «${ALK[n - 1]}»?`, pf(`C${n}H${2 * n + 2}`).replace(/C₁(?=H)/, "C"), [pf(`C${n}H${2 * n}`), pf(`C${n}H${2 * n - 2 > 0 ? 2 * n - 2 : 4}`), pf(`C${n + 1}H${2 * n + 2}`)].map((x) => x.replace(/C₁(?=H)/, "C"))); },
      (t) => { const n = t.int(1, 8); return qn(`Молярная масса алкана «${ALK[n - 1]}»?`, 12 * n + 2 * n + 2, t, "г/моль", { step: 2 }); },
      (t) => { const n = t.int(2, 6); return Q(`Общая формула гомологического ряда алканов?`, "CₙH₂ₙ₊₂", ["CₙH₂ₙ", "CₙH₂ₙ₋₂", "CₙH₂ₙ₋₆"]); },
      (t) => { const n = t.int(1, 6); return qn(`Сколько атомов водорода в молекуле «${ALK[n - 1]}»?`, 2 * n + 2, t, "", { cands: [2 * n] }); },
      (t) => { const n = t.int(1, 4); return qn(`Сколько моль CO₂ образуется при полном сгорании 1 моль «${ALK[n - 1]}»?`, n, t, "моль", { cands: [n + 1, 2 * n] }); },
    ],
    11: [
      (t) => { const f = t.pick(CMP); return qn(`Молярная масса ${pf(f)}?`, Mr(f), t, "г/моль", { step: 2 }); },
      (t) => { const n = t.int(1, 4); return qn(`Сколько моль O₂ нужно для сгорания 1 моль метана CH₄?`, 2, t, "моль", { cands: [1, 3, 4] }); },
      (t) => { const m = t.pick([2, 4, 8, 16]); return qn(`Сколько граммов водорода выделится при реакции ${m * 12} г магния с избытком HCl? (Mg + 2HCl → MgCl₂ + H₂)`, m, t, "г", { cands: [m * 2, m / 2] }); },
      (t) => { const w = t.pick([10, 20, 40]), m = t.pick([100, 200, 300]), add = t.pick([100, 200]); return qn(`К ${m} г ${w}%-го раствора добавили ${add} г воды. Новая массовая доля (в %, до десятых)?`, Math.round((m * w / (m + add)) * 10) / 10, t, "%", { step: 2 }); },
      (t) => { const p = t.pick([["Na", "1"], ["Mg", "2"], ["Al", "3"], ["Cl", "7"], ["S", "6"], ["C", "4"], ["N", "5"]]); return Q(`Номер группы элемента ${p[0]} в периодической системе?`, p[1], ["1", "2", "3", "4", "5", "6", "7"].filter((x) => x !== p[1]).sort(() => t.r() - 0.5).slice(0, 3)); },
    ],
  };

  /* ================= ИНФОРМАТИКА 5–11 ================= */
  const bin = (n) => n.toString(2);
  const INF = {
    5: [
      (t) => { const b = t.int(1, 8); return qn(`Сколько бит в ${b} байт${b === 1 ? "е" : "ах"}?`, b * 8, t, "бит", { cands: [b] }); },
      (t) => { const n = t.int(2, 15); return qn(`Двоичное число ${bin(n)} в десятичной системе?`, n, t); },
      (t) => Q("Какое устройство служит для ввода информации?", t.pick(["Клавиатура", "Мышь", "Сканер", "Микрофон"]), ["Монитор", "Принтер", "Колонки"]),
      (t) => Q("Какое устройство служит для вывода информации?", t.pick(["Монитор", "Принтер", "Колонки"]), ["Клавиатура", "Мышь", "Сканер"]),
      (t) => { const k = t.int(1, 4); return qn(`Сколько байт в ${k} Кбайт?`, k * 1024, t, "байт", { cands: [k * 1000, k * 8] }); },
    ],
    6: [
      (t) => { const n = t.int(5, 31); return Q(`Десятичное число ${n} в двоичной системе?`, bin(n), [bin(n + 1), bin(n - 1), bin(n ^ 2) === bin(n) ? bin(n + 2) : bin(n ^ 2)]); },
      (t) => { const n = t.int(10, 60); return qn(`Двоичное число ${bin(n)} в десятичной системе?`, n, t); },
      (t) => { const k = t.int(1, 8); return qn(`Сколько Кбайт в ${k} Мбайт?`, k * 1024, t, "Кбайт", { cands: [k * 1000] }); },
      (t) => Q(`Расширение файла с текстом «доклад.docx»?`, "docx", ["доклад", "txt", "exe"]),
      (t) => { const c = t.int(10, 60); return qn(`Текст из ${c} символов в кодировке 1 байт на символ. Сколько бит он занимает?`, c * 8, t, "бит", { cands: [c] }); },
    ],
    7: [
      (t) => { const p = t.int(2, 10), l = t.int(20, 60), c = t.int(30, 70); return qn(`Текст: ${p} страниц по ${l} строк по ${c} символов, 1 байт на символ. Объём в байтах?`, p * l * c, t, "байт", { step: 100 }); },
      (t) => { const N = t.pick([2, 4, 8, 16, 32, 64, 128, 256]); return qn(`Сколько бит нужно для кодирования одного из ${N} равновероятных вариантов?`, Math.log2(N), t, "бит", { cands: [N / 2] }); },
      (t) => { const i = t.int(1, 8); return qn(`Сколько разных символов можно закодировать ${i} бит${i === 1 ? "ом" : "ами"}?`, 2 ** i, t, "", { cands: [2 * i, i * i] }); },
      (t) => { const n = t.int(32, 120); return Q(`Число ${n} в двоичной системе?`, bin(n), [bin(n + 2), bin(n - 1), bin(n + 4)]); },
      (t) => { const w = t.int(2, 8) * 10, h = t.int(2, 8) * 10, b = t.pick([1, 8, 24]); return qn(`Растровое изображение ${w}×${h} пикселей, ${b} бит на пиксель. Объём в битах?`, w * h * b, t, "бит", { step: w * h }); },
    ],
    8: [
      (t) => { const a = t.int(0, 1), b = t.int(0, 1); return qn(`Значение выражения ${a} И ${b}?`, a & b, t, "", { cands: [1 - (a & b), 2, -1].filter((x) => x >= 0) }); },
      (t) => { const a = t.int(0, 1), b = t.int(0, 1); return qn(`Значение выражения ${a} ИЛИ ${b}?`, a | b, t, "", { cands: [1 - (a | b), 2] }); },
      (t) => { const a = t.int(3, 30), b = t.int(3, 30); return Q(`Сложи двоичные числа ${bin(a)} + ${bin(b)}`, bin(a + b), [bin(a + b + 1), bin(a + b - 1), bin(a ^ b)]); },
      (t) => { const n = t.int(10, 255); return Q(`Число ${n} в шестнадцатеричной системе?`, n.toString(16).toUpperCase(), [(n + 1).toString(16).toUpperCase(), (n + 16).toString(16).toUpperCase(), n.toString(8)]); },
      (t) => { const n = t.int(8, 63); return qn(`Восьмеричное число ${n.toString(8)} в десятичной системе?`, n, t); },
    ],
    9: [
      (t) => { const n = t.int(3, 9); let s = 0; for (let i = 1; i <= n; i++) s += i; return qn(`s := 0; для i от 1 до ${n}: s := s + i. Чему равно s?`, s, t, "", { cands: [n, s - n] }); },
      (t) => { const n = t.int(2, 6); return qn(`p := 1; повторить ${n} раз: p := p × 2. Чему равно p?`, 2 ** n, t, "", { cands: [2 * n] }); },
      (t) => { const x = t.int(1, 20), y = t.int(1, 20); return qn(`a := ${x}; b := ${y}; если a > b то c := a − b иначе c := b − a. Чему равно c?`, Math.abs(x - y), t, "", { cands: [x + y] }); },
      (t) => { const n = t.int(100, 999); return Q(`Число ${n} в шестнадцатеричной системе?`, n.toString(16).toUpperCase(), [(n + 1).toString(16).toUpperCase(), (n - 16).toString(16).toUpperCase(), n.toString(8)]); },
      (t) => { const v = t.int(2, 8), tt = t.int(2, 10); return qn(`Скорость передачи ${v} Кбайт/с. Сколько Кбайт передастся за ${tt} с?`, v * tt, t, "Кбайт", { cands: [v + tt] }); },
    ],
  };
  INF[10] = [INF[8][2], INF[9][0], (t) => { const a = t.int(0, 1), b = t.int(0, 1); return qn(`Значение выражения НЕ(${a} ИЛИ ${b})?`, 1 - (a | b), t, "", { cands: [a | b, 2] }); }, INF[7][4], (t) => { const n = t.int(256, 2000); return Q(`Число ${n} в двоичной системе?`, bin(n), [bin(n + 1), bin(n - 2), bin(n + 8)]); }];
  INF[11] = [INF[9][1], INF[8][3], (t) => { const a = t.int(0, 1), b = t.int(0, 1), c = t.int(0, 1); return qn(`Значение выражения (${a} И ${b}) ИЛИ ${c}?`, (a & b) | c, t, "", { cands: [1 - ((a & b) | c), 2] }); }, INF[7][0], (t) => { const k = t.int(2, 8), f = t.int(2, 6); return qn(`Звук: частота ${k * 8} кГц, глубина ${f * 8} бит, моно, 1 с. Объём в Кбит?`, k * 8 * f * 8, t, "Кбит", { step: 64 }); }];

  /* ================= АНГЛИЙСКИЙ 1–11 ================= */
  const EN1 = "cat кошка|dog собака|red красный|blue синий|green зелёный|apple яблоко|book книга|pen ручка|sun солнце|mother мама|father папа|sister сестра|brother брат|house дом|school школа|bird птица|fish рыба|milk молоко|bread хлеб|ball мяч|table стол|chair стул|window окно|door дверь|big большой|small маленький|happy весёлый|tree дерево|water вода|white белый|black чёрный|yellow жёлтый|teacher учитель|friend друг|car машина|egg яйцо|hand рука|eye глаз|nose нос|rain дождь".split("|").map((x) => x.split(" "));
  const EN2 = "weather погода|holiday каникулы|library библиотека|kitchen кухня|journey путешествие|river река|mountain гора|village деревня|country страна|city город|summer лето|winter зима|autumn осень|spring весна|breakfast завтрак|dinner ужин|healthy здоровый|dangerous опасный|beautiful красивый|interesting интересный|expensive дорогой|cheap дешёвый|early рано|late поздно|always всегда|never никогда|sometimes иногда|answer ответ|question вопрос|lesson урок|homework домашнее задание|clothes одежда|shop магазин|money деньги|museum музей|desert пустыня|science наука|history история|language язык|neighbour сосед".split("|").map((x) => x.split(/ (.+)/).slice(0, 2));
  const EN3 = "environment окружающая среда|achievement достижение|opportunity возможность|government правительство|knowledge знания|responsibility ответственность|experience опыт|development развитие|society общество|employment занятость|research исследование|advantage преимущество|influence влияние|tradition традиция|independence независимость|career карьера|pollution загрязнение|education образование|competition соревнование|decision решение".split("|").map((x) => x.split(/ (.+)/).slice(0, 2));
  const IRR = "go went gone идти|see saw seen видеть|take took taken брать|write wrote written писать|read read read читать|eat ate eaten есть|drink drank drunk пить|give gave given давать|come came come приходить|buy bought bought покупать|bring brought brought приносить|think thought thought думать|know knew known знать|speak spoke spoken говорить|swim swam swum плавать|begin began begun начинать|break broke broken ломать|choose chose chosen выбирать|forget forgot forgotten забывать|teach taught taught учить|catch caught caught ловить|fly flew flown летать|run ran run бежать|sing sang sung петь|sleep slept slept спать|leave left left уходить|make made made делать|find found found находить|tell told told рассказывать|feel felt felt чувствовать".split("|").map((x) => x.split(" "));
  const NUM_EN = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
  const GRAM_EN = [
    ["I ___ a pupil.", "am", "is", "are", "be"], ["She ___ ten years old.", "is", "am", "are", "be"], ["They ___ my friends.", "are", "is", "am", "be"],
    ["He ___ football every day.", "plays", "play", "playing", "played"], ["We ___ to school yesterday.", "went", "go", "goes", "gone"],
    ["Look! The children ___ in the yard.", "are playing", "play", "plays", "played"], ["I have never ___ to London.", "been", "be", "was", "being"],
    ["If it rains, we ___ at home.", "will stay", "stay", "stayed", "would stayed"], ["This book is ___ than that one.", "more interesting", "interestinger", "most interesting", "more interestinger"],
    ["She is the ___ girl in the class.", "tallest", "taller", "most tall", "tall"], ["There ___ many apples on the table.", "are", "is", "be", "was"],
    ["I ___ my homework already.", "have done", "did", "do", "has done"], ["The letter ___ yesterday.", "was written", "wrote", "is written", "written"],
    ["He said that he ___ tired.", "was", "is", "be", "were"], ["I wish I ___ a car.", "had", "have", "has", "will have"],
    ["By next year she ___ English for five years.", "will have studied", "studies", "studied", "has studied"], ["___ you like some tea?", "Would", "Will", "Do", "Are"],
    ["We are interested ___ history.", "in", "on", "at", "for"], ["I'm good ___ maths.", "at", "in", "on", "with"], ["She was born ___ 2012.", "in", "on", "at", "by"],
    ["My birthday is ___ Monday.", "on", "in", "at", "by"], ["We have lunch ___ 1 o'clock.", "at", "in", "on", "for"], ["___ you speak English?", "Can", "Are", "Is", "Has"],
    ["She ___ TV when I came.", "was watching", "watched", "watches", "is watching"], ["They ___ in Tashkent since 2015.", "have lived", "live", "lived", "are living"],
    ["How ___ apples are there?", "many", "much", "lot", "any"], ["How ___ water do you drink?", "much", "many", "lot", "few"], ["There isn't ___ milk left.", "any", "some", "many", "a"],
    ["He is ___ honest man.", "an", "a", "the", "—"], ["This is ___ best day of my life!", "the", "a", "an", "—"], ["You ___ wear a uniform at school. It's a rule.", "must", "can", "may", "would"],
    ["If I ___ rich, I would travel the world.", "were", "am", "will be", "be"], ["The house ___ built in 1990.", "was", "is", "were", "has"], ["She asked me where I ___.", "lived", "live", "do live", "living"],
    ["I'm looking forward ___ you.", "to seeing", "to see", "see", "seeing to"], ["He stopped ___ when the teacher came in.", "talking", "to talk", "talk", "talked"],
    ["Neither Tom ___ Ann came.", "nor", "or", "and", "but"], ["She has been working here ___ five years.", "for", "since", "during", "ago"],
    ["By the time we arrived, the film ___.", "had started", "started", "has started", "starts"], ["The more you read, the ___ you know.", "more", "most", "much", "many"],
  ];
  const GRAM_KIDS = [
    ["This is ___ apple.", "an", "a", "the", "—"], ["This is ___ cat.", "a", "an", "the", "—"], ["I ___ got a dog.", "have", "has", "am", "is"], ["She ___ got a sister.", "has", "have", "is", "are"],
    ["Two ___ (кошки)", "cats", "cat", "cates", "catts"], ["Three ___ (ящика)", "boxes", "boxs", "box", "boxies"], ["I can ___.", "swim", "swims", "swimming", "to swim"],
    ["What colour ___ the sky?", "is", "are", "am", "be"], ["Where ___ you from?", "are", "is", "am", "be"], ["It's ___ the table. (на)", "on", "in", "under", "at"],
    ["The ball is ___ the box. (в)", "in", "on", "under", "at"], ["___ is your name?", "What", "Who", "Where", "How"], ["___ old are you?", "How", "What", "Who", "Where"],
    ["Monday, Tuesday, ___", "Wednesday", "Sunday", "Friday", "Thursday"], ["January, February, ___", "March", "May", "April", "June"],
  ];
  const ENG = (grade) => {
    const W = grade <= 4 ? EN1 : grade <= 9 ? EN1.concat(EN2) : EN2.concat(EN3);
    const words = grade <= 4 ? EN1 : grade <= 9 ? EN2 : EN3;
    const opts = (list, i, k) => list.filter((_, j) => j !== i).map((x) => x[k]);
    const wq = (list, dir) => (t) => { const i = t.int(0, list.length - 1), w = list[i], others = opts(list, i, dir ? 1 : 0).sort(() => t.r() - 0.5).slice(0, 3); return dir ? Q(`Как переводится слово «${w[0]}»?`, w[1], others) : Q(`Как по-английски «${w[1]}»?`, w[0], others); };
    const gram = (from, to) => (t) => { const g = t.pick(GRAM_EN.slice(from, to)); return Q(`Выбери правильный вариант: ${g[0]}`, g[1], g.slice(2)); };
    const kids = (from, to) => (t) => { const g = t.pick(GRAM_KIDS.slice(from, to)); return Q(`Выбери правильный вариант: ${g[0]}`, g[1], g.slice(2)); };
    if (grade <= 4) return [wq(EN1, false), wq(EN1, true), (t) => { const n = t.int(1, 20); return Q(`Как по-английски число ${n}?`, NUM_EN[n], [NUM_EN[(n + 1) % 21] , NUM_EN[Math.max(0, n - 1)] === NUM_EN[n] ? NUM_EN[n + 2] : NUM_EN[Math.max(0, n - 1)], NUM_EN[(n + 10) % 21]]); }, kids(0, 8), kids(5, 15)];
    const irr = (k) => (t) => { const i = t.int(0, IRR.length - 1), v = IRR[i]; return Q(`${k === 1 ? "Past Simple" : "Past Participle (V3)"} глагола «${v[0]}» (${v[3]})?`, v[k], [v[0].endsWith("e") ? v[0] + "d" : v[0] + "ed", ...opts(IRR, i, k).sort(() => t.r() - 0.5).slice(0, 2)].filter((x) => x !== v[k]).slice(0, 3).concat(["was"]).slice(0, 3)); };
    if (grade <= 6) return [wq(words, false), wq(words, true), irr(1), gram(0, 14), gram(3, 26)];
    if (grade <= 9) return [wq(words, false), wq(words, true), irr(1), irr(2), gram(6, 38)];
    return [wq(W, false), wq(words, true), irr(2), gram(12, 32), gram(20, 41)];
  };

  /* ================= УЗБЕКСКИЙ (ГОСУДАРСТВЕННЫЙ) 1–11 ================= */
  const UZ1 = "мама ona|папа ota|брат aka|сестра opa|книга kitob|школа maktab|дом uy|вода suv|хлеб non|яблоко olma|солнце quyosh|луна oy|день kun|ночь tun|красный qizil|белый oq|чёрный qora|большой katta|маленький kichik|кошка mushuk|собака it|птица qush|дерево daraxt|цветок gul|учитель o'qituvchi|ученик o'quvchi|друг do'st|ручка ruchka|стол stol|глаз ko'z|рука qo'l|голова bosh|молоко sut|мясо go'sht|город shahar|улица ko'cha|дверь eshik|окно deraza|снег qor|дождь yomg'ir".split("|").map((x) => x.split(" "));
  const UZ2 = "родина vatan|знание bilim|труд mehnat|здоровье sog'liq|семья oila|время vaqt|работа ish|язык til|народ xalq|страна mamlakat|столица poytaxt|праздник bayram|урок dars|задача masala|ответ javob|вопрос savol|красивый chiroyli|умный aqlli|быстрый tez|медленный sekin|новый yangi|старый eski|сегодня bugun|завтра ertaga|вчера kecha|утро ertalab|вечер kechqurun|весна bahor|лето yoz|осень kuz|зима qish|дружба do'stlik|мир tinchlik|независимость mustaqillik|наука fan|библиотека kutubxona|больница shifoxona|рынок bozor|поле dala|гора tog'".split("|").map((x) => x.split(" "));
  const UZN = [[1, "bir"], [2, "ikki"], [3, "uch"], [4, "to'rt"], [5, "besh"], [6, "olti"], [7, "yetti"], [8, "sakkiz"], [9, "to'qqiz"], [10, "o'n"], [20, "yigirma"], [30, "o'ttiz"], [40, "qirq"], [50, "ellik"], [60, "oltmish"], [70, "yetmish"], [80, "sakson"], [90, "to'qson"], [100, "yuz"], [1000, "ming"]];
  const UZP = [["Здравствуйте!", "Assalomu alaykum!"], ["Спасибо!", "Rahmat!"], ["До свидания!", "Xayr!"], ["Как дела?", "Ishlaringiz qalay?"], ["Как вас зовут?", "Ismingiz nima?"], ["Меня зовут Азиз.", "Mening ismim Aziz."], ["Сколько тебе лет?", "Necha yoshdasan?"], ["Я ученик.", "Men o'quvchiman."], ["Где школа?", "Maktab qayerda?"], ["Сколько стоит?", "Qancha turadi?"], ["Добро пожаловать!", "Xush kelibsiz!"], ["Я живу в Ташкенте.", "Men Toshkentda yashayman."]];
  const UZG = [
    ["Множественное число слова «kitob»?", "kitoblar", "kitobler", "kitoblari", "kitobim"], ["Множественное число слова «daftar»?", "daftarlar", "daftarler", "daftari", "daftarim"],
    ["«Моя книга» по-узбекски?", "mening kitobim", "sening kitobing", "uning kitobi", "kitoblar"], ["«В школе» по-узбекски?", "maktabda", "maktabga", "maktabdan", "maktabning"],
    ["«В школу» по-узбекски?", "maktabga", "maktabda", "maktabdan", "maktabni"], ["«Из дома» по-узбекски?", "uydan", "uyda", "uyga", "uyni"],
    ["«Я читаю» по-узбекски?", "men o'qiyman", "sen o'qiysan", "u o'qiydi", "biz o'qiymiz"], ["«Мы пишем» по-узбекски?", "biz yozamiz", "men yozaman", "ular yozadi", "siz yozasiz"],
    ["«Он пришёл» по-узбекски?", "u keldi", "u keladi", "men keldim", "u kelyapti"], ["Какой суффикс обозначает место (где?)", "-da", "-ga", "-dan", "-ni"],
    ["Какой суффикс обозначает направление (куда?)", "-ga", "-da", "-dan", "-ning"], ["Какой суффикс обозначает принадлежность (чей?)", "-ning", "-ni", "-ga", "-da"],
  ];
  const UZB = (grade) => {
    const L = grade <= 4 ? UZ1 : UZ1.concat(UZ2), H = grade <= 4 ? UZ1 : UZ2;
    const wq = (list, dir) => (t) => { const i = t.int(0, list.length - 1), w = list[i], o = list.filter((_, j) => j !== i).sort(() => t.r() - 0.5).slice(0, 3); return dir ? Q(`Как переводится «${w[1]}»?`, w[0], o.map((x) => x[0])) : Q(`Как по-узбекски «${w[0]}»?`, w[1], o.map((x) => x[1])); };
    const num = (t) => { const i = t.int(0, grade <= 4 ? 10 : UZN.length - 1), w = UZN[i], o = UZN.filter((_, j) => j !== i).sort(() => t.r() - 0.5).slice(0, 3); return Q(`Как по-узбекски число ${w[0]}?`, w[1], o.map((x) => x[1])); };
    const phr = (t) => { const i = t.int(0, UZP.length - 1), w = UZP[i], o = UZP.filter((_, j) => j !== i).sort(() => t.r() - 0.5).slice(0, 3); return Q(`Как по-узбекски «${w[0]}»?`, w[1], o.map((x) => x[1])); };
    const gr = (a, b) => (t) => { const g = t.pick(UZG.slice(a, b)); return Q(g[0], g[1], g.slice(2)); };
    if (grade <= 4) return [wq(UZ1, false), wq(UZ1, true), num, phr, gr(0, 3)];
    return [wq(L, false), wq(H, true), grade <= 6 ? num : phr, gr(0, 6), gr(3, 12)];
  };

  const SUBJ = {
    math: (g) => MATH[g], alg: (g) => ALG[g], geom: (g) => GEOM[g], phys: (g) => PHYS[g], chem: (g) => CHEM[g], inf: (g) => INF[g],
    eng: ENG, uzb: UZB,
  };
  /* Each level mixes several question types (the 5 types of a grade go from easier to harder),
     with review types from the previous grade where there is one:
     L1 — the two easiest types + all types of the previous grade, L2 — types 1–3 + previous 3–4,
     L3 — all 5 types, L4 — types 3–5 + previous 4–5, L5 — types 3–5 + the hardest previous type. */
  const PREV = { alg: { 7: ["math", 6] }, geom: { 7: ["math", 6] } };
  function pools(subj, grade) {
    const own = SUBJ[subj](grade);
    const pv = (PREV[subj] && PREV[subj][grade]) || (SUBJ[subj](grade - 1) ? [subj, grade - 1] : null);
    const prev = pv ? SUBJ[pv[0]](pv[1]) : null;
    const tag = (list, key) => list.map((fn, i) => ({ fn, key: key + ":" + i }));
    const o = tag(own, subj + grade);
    const p = prev ? tag(prev, pv[0] + pv[1]) : null;
    const mix = (own, pre) => { const out = []; for (let i = 0; i < Math.max(own.length, pre.length); i++) { if (own[i]) out.push(own[i]); if (pre[i]) out.push(pre[i]); } return out; };
    const pp = (a, b) => (p ? p.slice(a, b) : []);
    if (!p) return [o.slice(0, 3), o.slice(0, 4), o.slice(0, 5), o.slice(1, 5), [o[3], o[4], o[2]]];
    return [
      mix(o.slice(0, 2), p),
      mix(o.slice(0, 3), pp(2, 4)),
      o.slice(0, 5),
      mix(o.slice(2, 5), pp(3, 5)),
      mix([o[3], o[4], o[2]], pp(4, 5)),
    ];
  }
  /* Returns n questions [q, correct, wrong, wrong, wrong] for subject/grade/level (1–5). */
  function generate(subj, grade, level, n) {
    const fns = SUBJ[subj] && SUBJ[subj](grade);
    if (!fns) return null;
    const P = pools(subj, grade);
    /* the level's own mix first; if those types run out of distinct questions, borrow from neighbouring levels */
    const order = [level, level - 1, level + 1, level - 2, level + 2].filter((l) => l >= 1 && l <= 5);
    const out = [], seen = new Set();
    for (const lv of order) {
      const types = P[lv - 1];
      const tries = types.map(() => 0);
      let dead = 0, k = 0;
      while (out.length < n && dead < types.length) {
        const ti = k++ % types.length;
        if (tries[ti] < 0) continue;
        let got = false;
        for (let a = 0; a < 40 && !got; a++) {
          const t = tools(rng(hash(`${subj}|${grade}|${types[ti].key}|${tries[ti]++}`)));
          let q;
          try { q = types[ti].fn(t); } catch (e) { continue; }
          if (!q || q.length < 5) continue;
          const opts = q.slice(1, 5).map(String);
          if (new Set(opts).size < opts.length || seen.has(q[0])) continue;
          seen.add(q[0]);
          out.push(q.slice(0, 5).map(String).join("|"));
          got = true;
        }
        if (!got) { tries[ti] = -1; dead++; }
      }
      if (out.length >= n) break;
    }
    return out;
  }
  window.GEN = { generate, has: (s, g) => !!(SUBJ[s] && SUBJ[s](g)) };
})();
