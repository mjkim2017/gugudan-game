const app = document.querySelector("#app");
const operations = {
  all: { label: "사칙연산", symbol: "＋ − × ÷", color: "all" },
  add: { label: "덧셈", symbol: "＋", color: "add" },
  subtract: { label: "뺄셈", symbol: "−", color: "subtract" },
  multiply: { label: "곱셈", symbol: "×", color: "multiply" },
  divide: { label: "나눗셈", symbol: "÷", color: "divide" }
};

let state = { mode: "all", level: 1, round: 0, score: 0, streak: 0, bestStreak: 0, questions: [], missed: [], answered: false };

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = values => [...values].sort(() => Math.random() - 0.5);

function createQuestion(mode, level) {
  const types = mode === "all" ? ["add", "subtract", "multiply", "divide"] : [mode];
  const type = types[random(0, types.length - 1)];
  const range = level === 1 ? 10 : level === 2 ? 20 : 50;
  let left, right, answer, sign;
  if (type === "add") {
    left = random(1, range); right = random(1, range); answer = left + right; sign = "+";
  } else if (type === "subtract") {
    left = random(2, range); right = random(1, left); answer = left - right; sign = "−";
  } else if (type === "multiply") {
    left = random(2, level === 1 ? 5 : 9); right = random(2, level === 1 ? 5 : 9); answer = left * right; sign = "×";
  } else {
    right = random(2, level === 1 ? 5 : 9); answer = random(1, level === 1 ? 5 : 10); left = right * answer; sign = "÷";
  }
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const offset = random(-8, 8) || 2;
    const candidate = Math.max(0, answer + offset);
    if (candidate !== answer) wrongs.add(candidate);
  }
  return { type, left, right, answer, sign, choices: shuffle([answer, ...wrongs]) };
}

function begin(mode = state.mode, level = state.level) {
  state = { mode, level, round: 0, score: 0, streak: 0, bestStreak: 0, questions: Array.from({ length: 10 }, () => createQuestion(mode, level)), missed: [], answered: false };
  renderGame();
}

function current() { return state.questions[state.round]; }
function best() { try { return Number(localStorage.getItem("math-sprint-best")) || 0; } catch { return 0; } }
function saveBest(value) { try { localStorage.setItem("math-sprint-best", String(Math.max(value, best()))); } catch { /* storage unavailable */ } }

function renderGame() {
  const question = current();
  const progress = Math.round(state.round / state.questions.length * 100);
  app.innerHTML = `
    <div class="shapes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
    <header class="topbar"><a class="logo" href="index.html"><span>M</span> MATH MASTER</a><div class="best">최고 연속 정답 <b>${best()}</b> 🔥</div></header>
    <section class="game-shell">
      <aside class="mission-panel">
        <p class="kicker">NUMBER ADVENTURE</p><h1>오늘의<br><em>계산 미션!</em></h1>
        <p class="mission-copy">문제를 풀어 에너지를 모으고 계산 실력을 키워요.</p>
        <div class="choice-label">연산 선택</div>
        <div class="operation-picker">${Object.entries(operations).map(([key, operation]) => `<button class="${state.mode === key ? "selected " + operation.color : ""}" data-mode="${key}"><b>${operation.symbol}</b>${operation.label}</button>`).join("")}</div>
        <div class="choice-label level-label">난이도</div>
        <div class="level-picker">${[1, 2, 3].map(level => `<button class="${state.level === level ? "selected" : ""}" data-level="${level}">${level === 1 ? "쉬움" : level === 2 ? "보통" : "도전"}</button>`).join("")}</div>
        <div class="score-card"><div class="energy">⚡</div><div><b>${state.score}</b><span>에너지</span></div><div><b>${state.streak}</b><span>연속 정답</span></div></div>
      </aside>
      <section class="quiz-panel" aria-live="polite">
        <div class="quiz-meta"><span>QUESTION ${String(state.round + 1).padStart(2, "0")} / 10</span><span class="operation-tag ${question.type}">${operations[question.type].label}</span></div>
        <div class="progress"><i style="width:${progress}%"></i></div>
        <div class="question-card"><p>빈칸에 들어갈 숫자를 골라요</p><div class="equation"><strong>${question.left}</strong><span>${question.sign}</span><strong>${question.right}</strong><span>=</span><b>?</b></div></div>
        <div class="answers">${question.choices.map((value, index) => `<button data-answer="${value}" ${state.answered ? "disabled" : ""}><span>${["A", "B", "C", "D"][index]}</span>${value}</button>`).join("")}</div>
        <div id="feedback" class="feedback" hidden></div><button id="next" class="next" hidden>다음 문제 <span>→</span></button>
      </section>
    </section><footer>MATH MASTER · 매일 조금씩, 계산력은 쑥쑥</footer>`;
  app.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => begin(button.dataset.mode, state.level)));
  app.querySelectorAll("[data-level]").forEach(button => button.addEventListener("click", () => begin(state.mode, Number(button.dataset.level))));
  app.querySelectorAll("[data-answer]").forEach(button => button.addEventListener("click", () => answer(button)));
}

function answer(button) {
  if (state.answered) return;
  state.answered = true;
  const question = current();
  const correct = Number(button.dataset.answer) === question.answer;
  const choices = app.querySelectorAll("[data-answer]");
  choices.forEach(choice => { choice.disabled = true; if (Number(choice.dataset.answer) === question.answer) choice.classList.add("correct"); });
  if (correct) {
    state.streak += 1; state.bestStreak = Math.max(state.bestStreak, state.streak); state.score += 1; saveBest(state.bestStreak);
  } else { state.streak = 0; state.score = Math.max(0, state.score - 1); state.missed.push(question); button.classList.add("wrong"); }
  const feedback = app.querySelector("#feedback");
  feedback.hidden = false; feedback.className = `feedback ${correct ? "yes" : "no"}`;
  feedback.innerHTML = correct ? `<b>정답! 에너지를 얻었어요 ⚡</b><span>${question.left} ${question.sign} ${question.right} = ${question.answer}</span>` : `<b>아쉬워요. 정답은 ${question.answer}이에요. 에너지는 1점만 줄어들어요.</b><span>${question.left} ${question.sign} ${question.right} = ${question.answer}</span>`;
  const next = app.querySelector("#next"); next.hidden = false; next.addEventListener("click", nextQuestion);
}

function nextQuestion() { if (state.round === 9) renderResult(); else { state.round += 1; state.answered = false; renderGame(); } }

function renderResult() {
  const correct = 10 - state.missed.length;
  app.innerHTML = `<div class="shapes" aria-hidden="true"><i></i><i></i><i></i></div><header class="topbar"><a class="logo" href="index.html"><span>M</span> MATH MASTER</a></header><section class="result-card"><div class="trophy">★</div><p class="kicker">MISSION COMPLETE</p><h1>계산 미션 완료!</h1><p>10문제 중 <b>${correct}문제</b>를 맞히고 에너지 <b>${state.score}</b>점을 모았어요.</p><div class="result-stats"><div><b>${correct}/10</b><span>정답 수</span></div><div><b>${state.bestStreak}</b><span>최고 연속 정답</span></div><div><b>${state.score}</b><span>에너지</span></div></div>${state.missed.length ? `<section class="review"><h2>다시 풀어 보면 좋은 문제</h2>${state.missed.map(question => `<article><b>${question.left} ${question.sign} ${question.right}</b><span>= ${question.answer}</span><small>${operations[question.type].label}</small></article>`).join("")}</section>` : `<p class="perfect">모든 문제 정답! 정말 대단해요 🌟</p>`}<button class="next replay" id="replay">다시 도전하기 <span>↻</span></button></section><footer>MATH MASTER · 매일 조금씩, 계산력은 쑥쑥</footer>`;
  app.querySelector("#replay").addEventListener("click", () => begin(state.mode, state.level));
}

begin();
