const app = document.querySelector("#app");
const LEVELS = [2, 3, 4, 5, 6, 7, 8, 9];
const QUESTIONS_PER_ROUND = 5;

let screen = "home";
let level = 2;
let questions = [];
let questionIndex = 0;
let score = 0;
let streak = 0;
let roundStars = 0;
let selectedAnswer = null;
let isCorrect = null;

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem("starlight-multiplication-progress")) || {};
  } catch {
    return {};
  }
}

let progress = loadProgress();

function saveProgress() {
  localStorage.setItem("starlight-multiplication-progress", JSON.stringify(progress));
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function makeQuestion(table, multiplier) {
  const answer = table * multiplier;
  const candidates = new Set([answer]);
  const offsets = shuffle([-3, -2, -1, 1, 2, 3, 4]);
  offsets.forEach(offset => {
    if (candidates.size < 4 && answer + offset * table > 0) {
      candidates.add(answer + offset * table);
    }
  });
  let fallback = 1;
  while (candidates.size < 4) {
    candidates.add(answer + fallback);
    fallback += 1;
  }
  return { multiplier, answer, choices: shuffle([...candidates]) };
}

function startRound(nextLevel) {
  level = nextLevel;
  const multipliers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, QUESTIONS_PER_ROUND);
  questions = multipliers.map(multiplier => makeQuestion(level, multiplier));
  questionIndex = 0;
  score = 0;
  streak = 0;
  roundStars = 0;
  selectedAnswer = null;
  isCorrect = null;
  screen = "quiz";
  render();
}

function finishRound() {
  const previous = progress[level] || { best: 0, cleared: false };
  progress[level] = {
    best: Math.max(previous.best, score),
    cleared: previous.cleared || score >= 3,
  };
  saveProgress();
  screen = "result";
  render();
}

function chooseAnswer(answer) {
  if (selectedAnswer !== null) return;
  const question = questions[questionIndex];
  selectedAnswer = answer;
  isCorrect = answer === question.answer;
  if (isCorrect) {
    score += 1;
    streak += 1;
    roundStars += streak >= 3 ? 2 : 1;
  } else {
    streak = 0;
  }
  render();
}

function nextQuestion() {
  if (questionIndex + 1 === questions.length) {
    finishRound();
    return;
  }
  questionIndex += 1;
  selectedAnswer = null;
  isCorrect = null;
  render();
}

function levelCard(table) {
  const item = progress[table] || { best: 0, cleared: false };
  const state = item.cleared ? "cleared" : "";
  const mark = item.cleared ? "완료" : "도전";
  return `
    <button class="level-card ${state}" data-level="${table}" aria-label="${table}단 ${mark}">
      <span class="level-orbit">${table}</span>
      <strong>${table}단</strong>
      <small>${item.best ? `최고 ${item.best}/${QUESTIONS_PER_ROUND}` : "별을 모아 봐!"}</small>
      <span class="level-status">${item.cleared ? "★ 완료" : "시작하기"}</span>
    </button>`;
}

function header() {
  const cleared = LEVELS.filter(table => progress[table]?.cleared).length;
  return `
    <header class="topbar">
      <a class="brand" href="index.html" aria-label="별빛 곱셈 탐험대 첫 화면">✦ 별빛 탐험대</a>
      <div class="collection" aria-label="완료한 단 ${cleared}개">획득한 별 <b>${cleared}</b> / ${LEVELS.length}</div>
    </header>`;
}

function homeView() {
  const cleared = LEVELS.filter(table => progress[table]?.cleared).length;
  return `
    ${header()}
    <section class="hero" aria-labelledby="game-title">
      <div class="hero-copy">
        <p class="eyebrow">오늘의 수학 모험</p>
        <h1 id="game-title">곱셈 별자리를<br><em>완성해 보자!</em></h1>
        <p class="hero-description">문제를 풀고 별을 모아 2단부터 9단까지 탐험해요. 세 문제 연속 정답이면 보너스 별도 받아요.</p>
        <button class="primary-button" id="quick-start">${cleared === LEVELS.length ? "다시 탐험하기" : "가장 쉬운 곳부터"} <span>→</span></button>
      </div>
      <div class="planet-card" aria-hidden="true">
        <div class="ring"></div><div class="planet">✦</div>
        <span class="float-star star-one">★</span><span class="float-star star-two">✦</span><span class="float-star star-three">✧</span>
        <p>${cleared}개의 별자리를 밝혔어요</p>
      </div>
    </section>
    <section class="map-section" aria-labelledby="map-title">
      <div class="section-heading"><div><p class="eyebrow">별자리 지도</p><h2 id="map-title">어느 단을 연습할까?</h2></div><p>${cleared}/${LEVELS.length} 완료</p></div>
      <div class="level-grid">${LEVELS.map(levelCard).join("")}</div>
    </section>`;
}

function quizView() {
  const question = questions[questionIndex];
  const answered = selectedAnswer !== null;
  const feedback = isCorrect ? "정답이에요! 별 하나를 얻었어요." : `아쉬워요. ${level} × ${question.multiplier} = ${question.answer}예요.`;
  const choices = question.choices.map((choice, index) => {
    const chosen = choice === selectedAnswer;
    const correct = answered && choice === question.answer;
    const status = correct ? "correct" : chosen ? "wrong" : "";
    return `<button class="answer ${status}" data-answer="${choice}" ${answered ? "disabled" : ""}><span>${index + 1}</span>${choice}</button>`;
  }).join("");
  return `
    ${header()}
    <section class="quiz-shell" aria-labelledby="question-title">
      <div class="quiz-topline"><button class="back-button" id="back-home">← 지도</button><span>${level}단 탐험</span><span>★ ${roundStars}</span></div>
      <div class="progress-track" aria-label="${questionIndex + 1} / ${QUESTIONS_PER_ROUND} 문제"><i style="width:${((questionIndex + 1) / QUESTIONS_PER_ROUND) * 100}%"></i></div>
      <p class="question-count">문제 ${questionIndex + 1} / ${QUESTIONS_PER_ROUND}</p>
      <div class="question-card">
        <p class="eyebrow">정답을 골라 주세요</p>
        <h1 id="question-title">${level} <b>×</b> ${question.multiplier} <b>=</b> <span>?</span></h1>
        <p class="visual-hint">${"●".repeat(Math.min(level, 9))} 가 ${question.multiplier}묶음이에요.</p>
        <div class="answer-grid">${choices}</div>
        ${answered ? `<div class="feedback ${isCorrect ? "good" : "try"}" role="status"><strong>${isCorrect ? "✨" : "💡"}</strong><p>${feedback}</p><button class="primary-button" id="next-question">${questionIndex + 1 === QUESTIONS_PER_ROUND ? "탐험 결과 보기" : "다음 문제"} <span>→</span></button></div>` : `<p class="keyboard-tip">키보드 숫자 1–4로도 답할 수 있어요.</p>`}
      </div>
    </section>`;
}

function resultView() {
  const cleared = score >= 3;
  const title = cleared ? `${level}단 별자리 완성!` : "조금만 더 연습해 볼까?";
  const message = cleared ? `${score}문제를 맞혀 ${roundStars}개의 별을 모았어요.` : `${score}문제를 맞혔어요. 3문제 이상 맞히면 별자리가 완성돼요.`;
  return `
    ${header()}
    <section class="result-shell">
      <div class="result-card ${cleared ? "celebrate" : ""}">
        <div class="result-stars">${cleared ? "★ ★ ★" : "✦ ✧ ✧"}</div>
        <p class="eyebrow">탐험 결과</p><h1>${title}</h1><p>${message}</p>
        <div class="score-badge"><strong>${score}</strong><span>/ ${QUESTIONS_PER_ROUND}<br>정답</span></div>
        <div class="result-actions"><button class="primary-button" id="retry">${cleared ? "한 번 더 풀기" : "다시 도전하기"} <span>↻</span></button><button class="secondary-button" id="open-map">별자리 지도</button></div>
      </div>
    </section>`;
}

function render() {
  app.innerHTML = `<div class="sky">${screen === "home" ? homeView() : screen === "quiz" ? quizView() : resultView()}</div>`;
  document.querySelectorAll("[data-level]").forEach(button => button.addEventListener("click", () => startRound(Number(button.dataset.level))));
  document.querySelector("#quick-start")?.addEventListener("click", () => startRound(LEVELS.find(table => !progress[table]?.cleared) || 2));
  document.querySelectorAll("[data-answer]").forEach(button => button.addEventListener("click", () => chooseAnswer(Number(button.dataset.answer))));
  document.querySelector("#next-question")?.addEventListener("click", nextQuestion);
  document.querySelector("#back-home")?.addEventListener("click", () => { screen = "home"; render(); });
  document.querySelector("#retry")?.addEventListener("click", () => startRound(level));
  document.querySelector("#open-map")?.addEventListener("click", () => { screen = "home"; render(); });
}

window.addEventListener("keydown", event => {
  if (screen === "quiz" && selectedAnswer === null && /^[1-4]$/.test(event.key)) {
    const answer = questions[questionIndex].choices[Number(event.key) - 1];
    chooseAnswer(answer);
  }
  if (event.key === "Escape" && screen !== "home") {
    screen = "home";
    render();
  }
});

render();
