"use strict";

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19];
const DIFFICULTY_COOKIE = "divisors-difficulty";
const DIFFICULTY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const screen = document.getElementById("screen");
const state = {
  selected: new Set([3, 7, 11]), count: 20, phase: "setup",
  questions: [], index: 0, score: 0, answers: [], wrong: false,
  hintVisible: false, hintsUsed: 0, startTime: 0, elapsed: 0, timerId: null
};

function loadDifficulty() {
  const prefix = `${DIFFICULTY_COOKIE}=`;
  const cookie = document.cookie.split("; ").find(value => value.startsWith(prefix));
  if (!cookie) return;
  try {
    const difficulty = JSON.parse(decodeURIComponent(cookie.slice(prefix.length)));
    if (Array.isArray(difficulty.selected) && difficulty.selected.every(value => PRIMES.includes(value))) {
      state.selected = new Set(difficulty.selected);
    }
    if ([10, 20, 30].includes(difficulty.count)) state.count = difficulty.count;
  } catch { }
}

function saveDifficulty() {
  const value = encodeURIComponent(JSON.stringify({ selected: [...state.selected], count: state.count }));
  document.cookie = `${DIFFICULTY_COOKIE}=${value}; max-age=${DIFFICULTY_COOKIE_MAX_AGE}; path=/demos/divisors/; SameSite=Lax`;
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function makeGame(pool, count) {
  // Exactly 25% / 50% / 25% probability of count/2 - 1, count/2, count/2 + 1 yes answers.
  const r = Math.random();
  const yesCount = count / 2 + (r < .25 ? -1 : r < .75 ? 0 : 1);
  const flips = shuffle([
    ...Array(yesCount).fill(true), ...Array(count - yesCount).fill(false)
  ]);
  // Every selected divisor appears either floor(count / pool.length) or ceil(...) times.
  const divisors = [];
  while (divisors.length < count) divisors.push(...shuffle(pool));
  const balanced = shuffle(divisors.slice(0, count));
  return balanced.map((p, i) => {
    let n;
    do { n = 100 + Math.floor(Math.random() * 900); }
    while ((n % p === 0) !== flips[i]);
    return { p, n, yes: flips[i] };
  });
}

function explain({ p, n }) {
  const d = String(n).split("").map(Number);
  const a = Math.floor(n / 10), b = n % 10;
  if (p === 2) return { rule: "The last digit must be even.", work: `Last digit: ${b}. ${b % 2 === 0 ? "Even" : "Odd"}.` };
  if (p === 5) return { rule: "The last digit must be 0 or 5.", work: `Last digit: ${b}. ${b === 0 || b === 5 ? "Divisible" : "Not divisible"} by 5.` };
  if (p === 3) {
    const sum = d.reduce((x, y) => x + y, 0);
    return { rule: "Add the digits. Their sum must be divisible by 3.", work: `${d.join(" + ")} = ${sum}. ${sum % 3 === 0 ? "Divisible" : "Not divisible"} by 3.` };
  }
  if (p === 11) {
    const r = d[0] - d[1] + d[2];
    return { rule: "First digit − middle digit + last digit must be a multiple of 11 (including zero).", work: `${d[0]} − ${d[1]} + ${d[2]} = ${r}. ${r % 11 === 0 ? "Divisible" : "Not divisible"} by 11.` };
  }
  const k = { 7: -2, 13: 4, 17: -5, 19: 2 }[p];
  const rule = {
    7: "Subtract twice the last digit from the remaining number.",
    13: "Add four times the last digit to the remaining number.",
    17: "Subtract five times the last digit from the remaining number.",
    19: "Add twice the last digit to the remaining number."
  }[p];
  const op = k > 0 ? "+" : "−";
  let r = a + k * b;
  let work = `${a} ${op} ${Math.abs(k)} × ${b} = ${r}.`;
  // Repeat using the absolute value: divisibility is unaffected by sign.
  for (let steps = 0; Math.abs(r) > p * 2 && steps < 5; steps++) {
    const t = Math.abs(r), left = Math.floor(t / 10), last = t % 10;
    r = left + k * last;
    work += ` Repeat on ${t}: ${left} ${op} ${Math.abs(k)} × ${last} = ${r}.`;
  }
  work += ` ${r % p === 0 ? "Divisible" : "Not divisible"} by ${p}.`;
  return { rule: `${rule} Repeat if needed; the result must be divisible by ${p}.`, work };
}

function formatTime(ms) {
  const s = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function clockIcon() {
  return '<svg class="clock-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l-3 3"/></svg>';
}
function button(label, action, variant = "primary", extra = "") {
  return `<button type="button" class="button button-${variant} button-full" data-action="${action}" ${extra}>${label}</button>`;
}
function progress() {
  return `<section class="panel score-panel" aria-label="Quiz progress">
    <div class="score-line"><span>Score: ${state.score}/${state.count}</span>${state.phase === "playing" ? `<span class="timer">${clockIcon()}<span id="live-clock">${formatTime(state.elapsed)}</span></span>` : ""}</div>
    <div class="progress" aria-label="${state.answers.length} of ${state.count} answered">${Array.from({ length: state.count }, (_, i) => `<span class="progress-step ${i < state.answers.length ? (state.answers[i] ? "correct" : "incorrect") : ""}"></span>`).join("")}</div>
  </section>`;
}
function explanationHtml(q) {
  const e = explain(q);
  return `<div class="panel explanation"><p>${e.rule}</p><p class="worked">${e.work}</p></div>`;
}
function renderSetup() {
  screen.innerHTML = `<section class="panel"><h2 class="section-title">Choose your divisors</h2>
    <div class="choices">${PRIMES.map(p => `<label class="choice"><input type="checkbox" value="${p}" ${state.selected.has(p) ? "checked" : ""}><span>${p}</span></label>`).join("")}</div></section>
    <section class="question-count"><h2 class="section-title">Number of questions</h2><div class="segment" role="group" aria-label="Number of questions">${[10, 20, 30].map(n => `<button type="button" data-count="${n}" class="${state.count === n ? "active" : ""}" aria-pressed="${state.count === n}">${n}</button>`).join("")}</div></section>
    ${button('First question <span class="arrow" aria-hidden="true">→</span>', "begin", "primary", state.selected.size ? "" : "disabled")}`;
}
function renderPlaying() {
  const q = state.questions[state.index];
  screen.innerHTML = progress() + `<section class="panel question-panel"><p class="question-index">Question ${state.index + 1} of ${state.count}</p><h2 class="question-prompt">Is this number divisible by ${q.p}?</h2><p class="question-number">${q.n}</p></section>` +
    (state.wrong ? `<div class="panel explanation"><div class="feedback">⊗ Incorrect - answer: ${q.yes ? "Yes" : "No"}</div><p>${explain(q).rule}</p><p class="worked">${explain(q).work}</p></div>${button(`${state.index === state.count - 1 ? "See Final Score" : "Next question"} <span class="arrow" aria-hidden="true">→</span>`, "next")}` :
    `<div class="button-row"><button class="button button-yes" type="button" data-answer="yes">Yes</button><button class="button button-no" type="button" data-answer="no">No</button></div>${button(`${state.hintVisible ? "Hide hint" : "Show hint"}`, "hint", "outline")}${state.hintVisible ? `<div class="hint-spacer"></div>${explanationHtml(q)}` : ""}`);
  updateClock();
}
function renderFinished() {
  const ratio = state.score / state.count;
  const message = ratio === 1 ? "Perfect score!" : ratio >= .85 ? "Excellent work!" : ratio >= .65 ? "Good progress!" : ratio >= .45 ? "Keep practicing!" : "Review the rules and try again!";
  screen.innerHTML = progress() + `<section class="panel results"><svg class="trophy" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v8a5 5 0 0 1-10 0V3ZM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 4v4m-4 0h8"/></svg><div class="percentage">${Math.round(ratio * 100)}%</div><p class="result-count">${state.score} out of ${state.count} correct</p><div class="result-stats"><div class="stat"><span class="stat-label">${clockIcon()} Total time</span><span class="stat-value">${formatTime(state.elapsed)}</span></div>${state.hintsUsed ? `<div class="stat"><span class="stat-label">♧ Hints used</span><span class="stat-value">${state.hintsUsed}</span></div>` : ""}</div><p class="result-message">${message}</p>${button("↻ &nbsp; Play again", "begin")}${button("☷ &nbsp; Change difficulty", "setup", "outline")}</section>`;
}
function render() {
  if (state.phase === "setup") renderSetup();
  else if (state.phase === "playing") renderPlaying();
  else renderFinished();
}
function updateClock() {
  if (state.phase !== "playing") return;
  const el = document.getElementById("live-clock");
  if (el) el.textContent = formatTime(performance.now() - state.startTime);
}
function stopClock() {
  if (state.timerId !== null) clearInterval(state.timerId);
  state.timerId = null;
}
function begin() {
  if (!state.selected.size) return;
  stopClock();
  state.questions = makeGame([...state.selected], state.count);
  state.phase = "playing";
  state.index = 0;
  state.score = 0;
  state.answers = [];
  state.wrong = false;
  state.hintVisible = false;
  state.hintsUsed = 0;
  state.elapsed = 0;
  state.startTime = performance.now();
  state.timerId = setInterval(updateClock, 250);
  render();
}
function answer(value) {
  if (state.phase !== "playing" || state.wrong || state.answers.length !== state.index) return;
  const correct = value === state.questions[state.index].yes;
  state.answers.push(correct);
  state.elapsed = performance.now() - state.startTime;
  if (correct) state.score++;
  if (state.index === state.count - 1) stopClock();
  if (!correct) state.wrong = true;
  else if (state.index === state.count - 1) state.phase = "finished";
  else { state.index++; state.hintVisible = false; }
  render();
}
function next() {
  if (!state.wrong) return;
  if (state.index === state.count - 1) state.phase = "finished";
  else { state.index++; state.wrong = false; state.hintVisible = false; }
  render();
}

screen.addEventListener("change", event => {
  if (state.phase !== "setup" || !event.target.matches('.choice input[type="checkbox"]')) return;
  const p = Number(event.target.value);
  if (event.target.checked) state.selected.add(p);
  else state.selected.delete(p);
  saveDifficulty();
  const beginButton = screen.querySelector('[data-action="begin"]');
  if (beginButton) beginButton.disabled = state.selected.size === 0;
});
screen.addEventListener("click", event => {
  const countButton = event.target.closest("[data-count]");
  if (countButton && state.phase === "setup") {
    state.count = Number(countButton.dataset.count);
    saveDifficulty();
    render();
    return;
  }
  const answerButton = event.target.closest("[data-answer]");
  if (answerButton) { answer(answerButton.dataset.answer === "yes"); return; }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "begin") begin();
  else if (action === "next") next();
  else if (action === "hint" && !state.wrong && state.phase === "playing") {
    if (!state.hintVisible) state.hintsUsed++;
    state.hintVisible = !state.hintVisible;
    render();
  } else if (action === "setup") {
    stopClock();
    state.phase = "setup";
    render();
  }
});
document.addEventListener("keydown", event => {
  if (state.phase !== "playing" || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  const key = event.key.toLowerCase();
  const isYesKey = key === "y" || key === "arrowleft";
  const isNoKey = key === "n" || key === "arrowright";
  if ((!isYesKey && !isNoKey) || (event.shiftKey && key !== "y" && key !== "n")) return;

  event.preventDefault();
  if (state.wrong) next();
  else answer(isYesKey);
});
loadDifficulty();
render();
