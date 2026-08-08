const app = document.querySelector("#app");

const defaults = {
  name: "나",
  sex: "female",
  age: 29,
  height: 163,
  weight: 57.4,
};

const number = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const format = value => new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 }).format(value);

function getData() {
  const form = new FormData(document.querySelector("#profile-form"));
  return {
    name: form.get("name")?.trim() || "나",
    sex: form.get("sex"),
    age: number(form.get("age"), defaults.age),
    height: number(form.get("height"), defaults.height),
    weight: number(form.get("weight"), defaults.weight),
  };
}

function calc(data) {
  const bmi = data.weight / ((data.height / 100) ** 2);
  const fatRange = data.sex === "male" ? [10, 20] : [18, 28];
  // Population formulae are useful for a trend, but are not a body-composition measurement.
  const bodyFat = clamp(1.2 * bmi + .23 * data.age - (data.sex === "male" ? 16.2 : 5.4), 5, 60);
  const fatFreeMass = data.sex === "male"
    ? 9270 * data.weight / (6680 + 216 * bmi)
    : 9270 * data.weight / (8780 + 244 * bmi);
  const muscle = fatFreeMass * (data.sex === "male" ? .58 : .56);
  const muscleRatio = muscle / data.weight * 100;
  const bmiScore = 100 - Math.min(40, Math.abs(bmi - 22) * 8);
  const fatScore = 100 - Math.min(45, Math.max(0, bodyFat - fatRange[1]) * 3) - Math.min(25, Math.max(0, fatRange[0] - bodyFat) * 3);
  const muscleScore = clamp(58 + (muscleRatio - 30) * 2.4, 30, 100);
  const score = Math.round(clamp(bmiScore * .42 + fatScore * .33 + muscleScore * .25, 0, 100));
  const status = score >= 85 ? "아주 좋아요" : score >= 70 ? "균형 잡힌 편이에요" : score >= 55 ? "조금만 더 돌봐요" : "생활 습관을 점검해요";
  const targetWeight = [18.5, 22.9].map(value => value * ((data.height / 100) ** 2));
  return { bmi, bodyFat, muscle, fatRange, muscleRatio, bmiScore, fatScore, muscleScore, score, status, targetWeight };
}

function bmiLabel(bmi) {
  if (bmi < 18.5) return "저체중";
  if (bmi < 23) return "정상";
  if (bmi < 25) return "과체중";
  return "비만 범위";
}

function ring(score) {
  return `<div class="score-ring" style="--score:${score}"><div><strong>${score}</strong><span>HEALTH SCORE</span></div></div>`;
}

function metricCard(title, value, unit, label, score, tone) {
  return `<article class="metric-card ${tone}">
    <div class="metric-top"><span>${title}</span><em>${label}</em></div>
    <strong>${value}<small>${unit}</small></strong>
    <div class="meter"><i style="width:${clamp(score, 7, 100)}%"></i></div>
  </article>`;
}

function updateDashboard() {
  const data = getData();
  const result = calc(data);
  document.querySelector("#greeting-name").textContent = `${data.name}님`;
  document.querySelector("#score-block").innerHTML = ring(result.score);
  document.querySelector("#score-copy").innerHTML = `<p class="eyebrow">오늘의 밸런스</p><h2>${result.status}</h2><p>현재 기록을 바탕으로 계산한 건강 균형 점수예요. 작은 변화도 꾸준히 기록해 보세요.</p>`;
  document.querySelector("#metrics").innerHTML = [
    metricCard("체질량지수", format(result.bmi), "BMI", bmiLabel(result.bmi), result.bmiScore, result.bmi >= 18.5 && result.bmi < 23 ? "good" : "care"),
    metricCard("추정 체지방률", format(result.bodyFat), "%", `${result.fatRange[0]}–${result.fatRange[1]}% 참고`, result.fatScore, result.fatScore >= 75 ? "good" : "care"),
    metricCard("추정 골격근량", format(result.muscle), "kg", `체중의 ${format(result.muscleRatio)}%`, result.muscleScore, result.muscleScore >= 72 ? "good" : "care"),
    metricCard("적정 체중", `${format(result.targetWeight[0])}–${format(result.targetWeight[1])}`, "kg", "BMI 18.5–22.9 기준", result.bmiScore, result.bmi >= 18.5 && result.bmi < 23 ? "good" : "care"),
  ].join("");

  const tips = [];
  if (result.bmi >= 23) tips.push(["식후 10분", "식사 뒤 가볍게 걸어 혈당과 체중 관리에 도움을 주세요.", "walk"]);
  if (result.bodyFat > result.fatRange[1]) tips.push(["단백질 한 끼", "매 끼니 손바닥 크기만큼의 단백질을 먼저 챙겨 보세요.", "meal"]);
  if (result.muscleScore < 72) tips.push(["주 2회 근력", "스쿼트, 푸시업처럼 큰 근육을 쓰는 운동부터 시작해요.", "strong"]);
  if (tips.length < 3) tips.push(["수면 7시간", "규칙적인 취침 시간은 회복과 식욕 조절에 큰 도움이 됩니다.", "sleep"]);
  if (tips.length < 3) tips.push(["물 한 컵", "식사 전 물 한 컵부터. 오늘의 수분 습관을 만들어 보세요.", "water"]);
  document.querySelector("#tips").innerHTML = tips.slice(0, 3).map(([title, copy, icon]) => `<li><span class="tip-icon ${icon}">${icon === "walk" ? "↗" : icon === "meal" ? "✦" : icon === "strong" ? "◆" : icon === "sleep" ? "☾" : "≈"}</span><div><strong>${title}</strong><p>${copy}</p></div></li>`).join("");
  document.querySelector("#updated-time").textContent = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short" }).format(new Date());
}

function setup() {
  app.innerHTML = `
    <div class="page-shell">
      <header class="site-header">
        <a class="brand" href="#top"><span class="brand-mark"><i></i><i></i><i></i></span><span>balance<span>check</span></span></a>
        <div class="header-date"><span class="live-dot"></span><span id="updated-time"></span> 건강 기록</div>
      </header>
      <main id="top">
        <section class="hero">
          <div><p class="eyebrow">MY DAILY HEALTH REPORT</p><h1><span id="greeting-name">나님</span>의 몸이 보내는<br /><em>오늘의 신호</em>를 확인해요.</h1></div>
          <p class="hero-copy">복잡한 숫자는 간결하게, 오늘 할 수 있는 건강 습관은 다정하게. 내 몸의 균형을 기록해 보세요.</p>
        </section>
        <section class="dashboard" aria-live="polite">
          <div class="summary-card"><div id="score-block"></div><div id="score-copy"></div></div>
          <div class="metric-grid" id="metrics"></div>
        </section>
        <section class="lower-grid">
          <section class="form-card"><div class="section-heading"><div><p class="eyebrow">BODY PROFILE</p><h2>내 수치 입력하기</h2></div><span>입력 즉시 반영돼요</span></div>
            <form id="profile-form">
              <label class="wide">이름<input name="name" type="text" maxlength="12" value="${defaults.name}" /></label>
              <label>성별<select name="sex"><option value="female">여성</option><option value="male">남성</option></select></label>
              <label>나이<input name="age" type="number" min="14" max="100" value="${defaults.age}" /></label>
              <label>키 <small>cm</small><input name="height" type="number" min="100" max="230" step=".1" value="${defaults.height}" /></label>
              <label>체중 <small>kg</small><input name="weight" type="number" min="25" max="250" step=".1" value="${defaults.weight}" /></label>
            </form>
          </section>
          <aside class="tips-card"><div class="section-heading"><div><p class="eyebrow">SMALL STEPS</p><h2>오늘의 제안</h2></div><span class="sun">☀</span></div><ul id="tips"></ul><p class="disclaimer">체지방률과 골격근량은 입력 정보로 계산한 참고용 추정치입니다. 실제 측정은 체성분 측정기 또는 의료·운동 전문가와 상담하세요.</p></aside>
        </section>
      </main>
      <footer>balance check · 내 몸을 이해하는 가장 가벼운 시작</footer>
    </div>`;
  document.querySelector("#profile-form").addEventListener("input", updateDashboard);
  document.querySelector("#profile-form").addEventListener("change", updateDashboard);
  updateDashboard();
}

setup();
