/* Государственные предметы школ Узбекистана (классы с русским языком обучения) и классы, в которых они изучаются. */
window.SUBJECTS = [
  { k: "rus", n: "Русский язык", g: [1, 11] },
  { k: "lit", n: "Литература", g: [1, 11] },
  { k: "uzb", n: "Узбекский язык", g: [1, 11] },
  { k: "eng", n: "Английский язык", g: [1, 11] },
  { k: "math", n: "Математика", g: [1, 6] },
  { k: "alg", n: "Алгебра", g: [7, 11] },
  { k: "geom", n: "Геометрия", g: [7, 11] },
  { k: "nat", n: "Естествознание", g: [1, 6] },
  { k: "bio", n: "Биология", g: [7, 11] },
  { k: "phys", n: "Физика", g: [7, 11] },
  { k: "chem", n: "Химия", g: [7, 11] },
  { k: "geo", n: "География", g: [7, 11] },
  { k: "hist", n: "История", g: [5, 11] },
  { k: "inf", n: "Информатика", g: [5, 11] },
  { k: "vos", n: "Воспитание", g: [1, 11] },
  { k: "law", n: "Основы государства и права", g: [8, 9] },
  { k: "tech", n: "Технология", g: [1, 9] },
  { k: "art", n: "Изобразительное искусство", g: [1, 7] },
  { k: "mus", n: "Музыка", g: [1, 7] },
  { k: "pe", n: "Физкультура", g: [1, 11] },
  { k: "draw", n: "Черчение", g: [8, 9] },
  { k: "nvp", n: "Начальная военная подготовка", g: [10, 11] },
];
/* Question lines for one subject, grade and level (1–5): generated, the earlier hand-made sets (bank5–9.js) or BANK2 by grade band. */
window.subjectQuestions = function (k, g, level) {
  if (window.GEN && GEN.has(k, g)) return GEN.generate(k, g, level, 20);
  const old = window.BANK && BANK[g];
  if (old && ((k === "nat" && old.subject === "Естествознание") || (k === "geo" && old.subject === "География"))) return old.levels[level - 1];
  const B = window.BANK2 || {};
  for (const key in B) {
    const [kk, band] = key.split(":"), [a, b] = band.split("-").map(Number);
    if (kk === k && g >= a && g <= b) return B[key][level - 1];
  }
  return null;
};
window.subjectTopic = function (k, g) {
  const old = window.BANK && BANK[g];
  if (old && ((k === "nat" && old.subject === "Естествознание") || (k === "geo" && old.subject === "География"))) return old.topic;
  for (const key in window.BANK2 || {}) {
    const [kk, band] = key.split(":"), [a, b] = band.split("-").map(Number);
    if (kk === k && g >= a && g <= b) return a === b ? `Программа ${a} класса` : `Программа ${a}–${b} классов`;
  }
  return `Программа ${g} класса`;
};
