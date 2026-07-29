const app = document.querySelector("#app");

let page = 1;
let selectedLevel = 2;
let multiplier = 3;
let answers = [];
let feedback = null;
let feedbackIndex = null;
const completedLevels = new Set();

function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function makeAnswers() {
  answers = shuffle([
    selectedLevel * multiplier,
    selectedLevel * (multiplier - 1),
    selectedLevel * (multiplier + 1),
    selectedLevel * (multiplier + 2),
  ]);
  feedback = null;
  feedbackIndex = null;
}

function background() {
  return `
    <div class="cloud one"></div><div class="cloud two"></div>
    <i class="sparkle s1"></i><i class="sparkle s2"></i><i class="sparkle s3"></i>
    <div class="hill left"></div><div class="hill right"></div><div class="grass"></div>
    <span class="flower f1">🌼</span><span class="flower f2">🌷</span><span class="flower f3">🌼</span><span class="flower f4">🌷</span>
  `;
}

function addTapListener(element, handler) {
  element.addEventListener("click", handler);
  element.addEventListener("touchend", event => {
    event.preventDefault();
    handler(event);
  }, { passive: false });
}

function render() {
  let view = "";
  if (page === 1) {
    view = `<section class="panel start-panel" id="start-panel"><h1>1~2학년 구구단!</h1><p>Space를 누르거나 이 카드를 눌러요</p><button class="next">시작하기</button></section><strong class="count">단 하나에 5문제!</strong>`;
  } else if (page === 2) {
    const levels = Array.from({ length: 8 }, (_, index) => index + 2)
      .map(level => `<button class="level ${completedLevels.has(level) ? "done" : ""}" data-level="${level}">${level}단</button>`).join("");
    view = `<section class="panel blue"><h1>몇 단을 연습할까요?</h1><p class="hint">원하는 숫자를 골라 보세요!</p><div class="level-grid">${levels}</div><p class="hint">Esc를 누르면 처음 화면으로 돌아가요</p></section>`;
  } else if (page === 8) {
    view = `<section class="panel yellow"><div class="stars">★ ★ ★</div><h1>구구단 완료!</h1><p>2단부터 9단까지 모두 풀었어요!</p><p>정말 잘했어요!</p></section>`;
  } else {
    const answerButtons = answers.map((answer, index) => {
      const mark = feedbackIndex === index ? `<span class="mark ${feedback}">${feedback === "correct" ? "O" : "X"}</span>` : "";
      return `<button class="answer" data-answer-index="${index}">${answer}${mark}</button>`;
    }).join("");
    const next = feedback === "correct" ? `<button class="next" id="next">${multiplier < 7 ? "다음 문제 ▶" : "완료하기"}</button>` : "";
    view = `<section class="panel yellow"><span class="question-number">${multiplier - 2}문제</span><h1>${selectedLevel} × ${multiplier} = ?</h1><p class="hint">알맞은 답을 눌러 보세요!</p><div class="answer-grid">${answerButtons}</div>${next}</section>`;
  }

  app.innerHTML = `<div class="game">${background()}<div class="content">${view}</div></div>`;
  bindEvents();
}

function bindEvents() {
  const startPanel = document.querySelector("#start-panel");
  if (startPanel) addTapListener(startPanel, () => {
    page = 2;
    render();
  });

  document.querySelectorAll("[data-level]").forEach(button => addTapListener(button, () => {
    selectedLevel = Number(button.dataset.level);
    multiplier = 3;
    makeAnswers();
    page = 3;
    render();
  }));

  document.querySelectorAll("[data-answer-index]").forEach(button => addTapListener(button, () => {
    const index = Number(button.dataset.answerIndex);
    feedbackIndex = index;
    feedback = answers[index] === selectedLevel * multiplier ? "correct" : "wrong";
    render();
  }));

  const nextButton = document.querySelector("#next");
  if (nextButton) addTapListener(nextButton, () => {
    if (multiplier < 7) {
      multiplier += 1;
      makeAnswers();
    } else {
      completedLevels.add(selectedLevel);
      page = completedLevels.size === 8 ? 8 : 2;
      feedback = null;
    }
    render();
  });
}

window.addEventListener("keydown", event => {
  if (event.code === "Space" && page === 1) {
    event.preventDefault();
    page = 2;
    render();
  }
  if (event.key === "Escape") {
    page = 1;
    render();
  }
});

render();
