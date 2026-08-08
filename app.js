const app = document.querySelector("#app");
const page = document.body.dataset.page || "home";
const defaults = { name: "나", sex: "female", age: 29, height: 163, weight: 57.4 };
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const format = value => new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 }).format(value);

function nav() {
  const links = [["home", "index.html", "홈"], ["score", "score.html", "건강 점수"], ["recommendations", "recommendations.html", "운동·식단 추천"]];
  return `<header class="site-header"><a class="brand" href="index.html"><span class="brand-mark"><i></i><i></i><i></i></span><span>balance<span>check</span></span></a><nav>${links.map(([id, href, label]) => `<a class="${page === id ? "active" : ""}" href="${href}">${label}</a>`).join("")}</nav><span class="header-note"><i></i> 매일 한 걸음</span></header>`;
}

function home() {
  return `<section class="home-hero"><div><p class="eyebrow">MY DAILY HEALTH COMPANION</p><h1>내 몸을 이해하는<br /><em>작고 건강한</em> 시작.</h1><p class="hero-copy">숫자는 간결하게 확인하고, 오늘 바로 실천할 운동과 식단을 찾아보세요.</p><a class="primary-button" href="score.html">내 건강 점수 확인하기 <b>→</b></a></div><div class="hero-art"><div class="sun-disc"></div><div class="leaf leaf-a">⌁</div><div class="leaf leaf-b">⌁</div><div class="hero-word">BREATHE<br /><span>MOVE</span><br />GROW</div></div></section><section class="page-intro"><p class="eyebrow">THREE SIMPLE STEPS</p><h2>오늘의 몸과 마음을<br />가볍게 돌봐요.</h2></section><section class="journey-grid"><a href="score.html" class="journey-card sage"><span>01</span><div class="card-icon">◌</div><h3>건강 점수</h3><p>키와 체중으로 나의 현재 균형을 확인해요.</p><b>점수 보기 →</b></a><a href="recommendations.html" class="journey-card cream"><span>02</span><div class="card-icon">↗</div><h3>운동 추천</h3><p>지금 할 수 있는 가벼운 움직임부터 시작해요.</p><b>운동 보기 →</b></a><a href="recommendations.html#food" class="journey-card peach"><span>03</span><div class="card-icon">✦</div><h3>식단 추천</h3><p>한 끼를 더 건강하게 만드는 작은 선택이에요.</p><b>식단 보기 →</b></a></section>`;
}

function score() {
  return `<section class="page-title"><p class="eyebrow">BODY PROFILE</p><h1>오늘의 건강 점수</h1><p>키, 체중, 나이, 성별을 입력하면 참고용 균형 점수를 계산해요.</p></section><section class="score-layout"><section class="form-card"><div class="section-heading"><h2>내 정보 입력</h2><span>바로 반영돼요</span></div><form id="profile-form"><label class="wide">이름<input name="name" maxlength="12" value="${defaults.name}" /></label><label>성별<select name="sex"><option value="female">여성</option><option value="male">남성</option></select></label><label>나이<input name="age" type="number" min="2" max="120" value="${defaults.age}" /></label><label>키 <small>cm</small><input name="height" type="number" min="60" max="230" step=".1" value="${defaults.height}" /></label><label>체중 <small>kg</small><input name="weight" type="number" min="8" max="250" step=".1" value="${defaults.weight}" /></label></form><p class="input-help">개인 정보는 저장하지 않으며, 이 기기에서만 계산됩니다.</p></section><section class="score-card"><div id="score-ring"></div><div id="score-copy"></div></section></section><section class="metrics-section"><div class="section-heading"><div><p class="eyebrow">YOUR NUMBERS</p><h2>한눈에 보는 수치</h2></div></div><div class="metric-grid" id="metrics"></div><p class="disclaimer" id="disclaimer"></p></section>`;
}

function recommendations() {
  return `<section class="page-title"><p class="eyebrow">SMALL STEPS, EVERY DAY</p><h1>운동·식단 추천</h1><p>완벽함보다 꾸준함. 오늘의 에너지를 채우는 쉬운 습관을 골라 보세요.</p></section><section class="recommend-hero"><div><span class="recommend-icon">↗</span><p class="eyebrow">MOVE YOUR BODY</p><h2>오늘은 10분만<br />움직여 볼까요?</h2><p>몸을 가볍게 깨우는 걷기와 스트레칭부터 시작해요.</p><a class="text-link" href="#movement">운동 살펴보기 →</a></div><div class="movement-lines"><i></i><i></i><i></i></div></section><section id="movement" class="recommend-section"><div class="section-heading"><div><p class="eyebrow">EASY MOVEMENT</p><h2>운동 추천</h2></div><span>하나만 골라도 충분해요</span></div><div class="recommend-grid"><article><span class="mini-icon walk">↗</span><b>산책</b><strong>10분</strong><p>식사 후 가볍게 걸으며 몸을 깨워요.</p></article><article><span class="mini-icon stretch">⌇</span><b>전신 스트레칭</b><strong>5분</strong><p>목, 어깨, 다리를 천천히 늘려 주세요.</p></article><article><span class="mini-icon strength">◆</span><b>의자 스쿼트</b><strong>8회 × 2</strong><p>무리하지 않는 범위에서 천천히 해요.</p></article></div></section><section id="food" class="food-section"><div class="section-heading"><div><p class="eyebrow">ONE BETTER PLATE</p><h2>식단 추천</h2></div><span>오늘 한 끼부터</span></div><div class="food-grid"><article><span>01</span><h3>채소를 반 접시</h3><p>색이 다른 채소를 곁들이면 한 끼가 더 든든해져요.</p></article><article><span>02</span><h3>단백질 먼저</h3><p>달걀, 두부, 생선, 콩처럼 익숙한 단백질을 챙겨요.</p></article><article><span>03</span><h3>물 한 컵</h3><p>달콤한 음료 대신 식사 전후 물을 마셔 보세요.</p></article></div><p class="disclaimer">개인 알레르기, 질환, 성장 상태에 따라 필요한 식단과 운동은 달라질 수 있어요. 불편함이 있으면 보호자 또는 전문가와 상담하세요.</p></section>`;
}

function getData() {
  const form = new FormData(document.querySelector("#profile-form"));
  const value = (key, fallback) => Number.parseFloat(form.get(key)) || fallback;
  return { name: form.get("name")?.trim() || "나", sex: form.get("sex"), age: value("age", defaults.age), height: value("height", defaults.height), weight: value("weight", defaults.weight) };
}

function metric(title, value, unit, label, level, type = "good") {
  return `<article class="metric-card ${type}"><div><span>${title}</span><em>${label}</em></div><strong>${value}<small>${unit}</small></strong><i class="meter"><b style="width:${clamp(level, 8, 100)}%"></b></i></article>`;
}

function updateScore() {
  const data = getData();
  const bmi = data.weight / ((data.height / 100) ** 2);
  const scoreRing = document.querySelector("#score-ring");
  const scoreCopy = document.querySelector("#score-copy");
  const metrics = document.querySelector("#metrics");
  const disclaimer = document.querySelector("#disclaimer");
  if (data.age < 20) {
    scoreRing.innerHTML = `<div class="youth-score"><span>GROWING<br />STRONG</span><strong>성장기<br />모드</strong></div>`;
    scoreCopy.innerHTML = `<p class="eyebrow">GROWTH CHECK</p><h2>${data.name}님, 성장이 먼저예요</h2><p>성장기에는 성인용 체지방률·골격근량 계산식을 사용하지 않아요.</p>`;
    metrics.innerHTML = metric("체질량지수", format(bmi), "BMI", "성장기 참고 수치", 55) + metric("체지방률", "추정하지 않음", "", "성인 공식 미사용", 8, "muted") + metric("골격근량", "추정하지 않음", "", "측정 장비 필요", 8, "muted") + metric("건강 확인", "성장 곡선", "", "BMI 백분위 참고", 55);
    disclaimer.textContent = "어린이·청소년 BMI는 나이와 성별에 따른 성장 곡선 백분위로 확인해야 합니다. 이 화면은 진단을 대신하지 않아요.";
    return;
  }
  const fatRange = data.sex === "male" ? [10, 20] : [18, 28];
  const bodyFat = clamp(1.2 * bmi + .23 * data.age - (data.sex === "male" ? 16.2 : 5.4), 5, 60);
  const fatFreeMass = data.sex === "male" ? 9270 * data.weight / (6680 + 216 * bmi) : 9270 * data.weight / (8780 + 244 * bmi);
  const muscle = fatFreeMass * (data.sex === "male" ? .58 : .56);
  const muscleRatio = muscle / data.weight * 100;
  const bmiScore = 100 - Math.min(40, Math.abs(bmi - 22) * 8);
  const fatScore = 100 - Math.min(45, Math.max(0, bodyFat - fatRange[1]) * 3);
  const muscleScore = clamp(58 + (muscleRatio - 30) * 2.4, 30, 100);
  const score = Math.round(clamp(bmiScore * .42 + fatScore * .33 + muscleScore * .25, 0, 100));
  const status = score >= 85 ? "아주 좋아요" : score >= 70 ? "균형 잡힌 편이에요" : "조금만 더 돌봐요";
  scoreRing.innerHTML = `<div class="score-ring" style="--score:${score}"><div><strong>${score}</strong><span>HEALTH SCORE</span></div></div>`;
  scoreCopy.innerHTML = `<p class="eyebrow">TODAY'S BALANCE</p><h2>${data.name}님, ${status}</h2><p>현재 입력 정보를 바탕으로 계산한 참고용 건강 균형 점수예요.</p>`;
  metrics.innerHTML = metric("체질량지수", format(bmi), "BMI", bmi >= 18.5 && bmi < 23 ? "정상 범위" : "참고 필요", bmiScore, bmi >= 18.5 && bmi < 23 ? "good" : "care") + metric("추정 체지방률", format(bodyFat), "%", `${fatRange[0]}–${fatRange[1]}% 참고`, fatScore, fatScore > 74 ? "good" : "care") + metric("추정 골격근량", format(muscle), "kg", `체중의 ${format(muscleRatio)}%`, muscleScore) + metric("적정 체중", `${format(18.5 * (data.height / 100) ** 2)}–${format(22.9 * (data.height / 100) ** 2)}`, "kg", "BMI 기준", bmiScore);
  disclaimer.textContent = "체지방률과 골격근량은 입력 정보로 계산한 참고용 추정치입니다. 실제 측정은 체성분 측정기 또는 전문가 상담이 필요해요.";
}

function setup() {
  app.innerHTML = `<div class="page-shell">${nav()}<main>${page === "home" ? home() : page === "score" ? score() : recommendations()}</main><footer>balance check · 내 몸을 이해하는 가장 가벼운 시작</footer></div>`;
  if (page === "score") { document.querySelector("#profile-form").addEventListener("input", updateScore); updateScore(); }
}
setup();
