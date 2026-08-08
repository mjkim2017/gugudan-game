const app = document.querySelector("#app");

const defaults = {
  name: "나",
  sex: "female",
  age: 29,
  height: 163,
  weight: 57.4,
  bodyFat: 27.8,
  muscle: 22.4,
  waist: 72,
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
    bodyFat: number(form.get("bodyFat"), defaults.bodyFat),
    muscle: number(form.get("muscle"), defaults.muscle),
    waist: number(form.get("waist"), defaults.waist),
  };
}

function calc(data) {
  const bmi = data.weight / ((data.height / 100) ** 2);
  const whtr = data.waist / data.height;
  const fatRange = data.sex === "male" ? [10, 20] : [18, 28];
  const muscleRatio = data.muscle / data.weight * 100;
  const bmiScore = 100 - Math.min(40, Math.abs(bmi - 22) * 8);
  const waistScore = 100 - Math.min(40, Math.max(0, whtr - 0.45) * 180);
  const fatScore = 100 - Math.min(45, Math.max(0, data.bodyFat - fatRange[1]) * 3) - Math.min(25, Math.max(0, fatRange[0] - data.bodyFat) * 3);
  const muscleScore = clamp(58 + (muscleRatio - 30) * 2.4, 30, 100);
  const score = Math.round(clamp(bmiScore * .28 + waistScore * .27 + fatScore * .25 + muscleScore * .20, 0, 100));
  const status = score >= 85 ? "아주 좋아요" : score >= 70 ? "균형 잡힌 편이에요" : score >= 55 ? "조금만 더 돌봐요" : "생활 습관을 점검해요";
  return { bmi, whtr, fatRange, muscleRatio, bmiScore, waistScore, fatScore, muscleScore, score, status };
}

function bmiLabel(bmi) {
  if (bmi < 18.5) return "저체중";
  if (bmi < 23) return "정상";
  if (bmi < 25) return "과체중";
  return "비만 범위";
}

function whtrLabel(whtr) {
  if (whtr < .45) return "양호";
  if (whtr < .5) return "주의";
  return "관리 필요";
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
    metricCard("체지방률", format(data.bodyFat), "%", `${result.fatRange[0]}–${result.fatRange[1]}% 권장`, result.fatScore, result.fatScore >= 75 ? "good" : "care"),
    metricCard("골격근량", format(data.muscle), "kg", `${format(result.muscleRatio)}% of body`, result.muscleScore, result.muscleScore >= 72 ? "good" : "care"),
    metricCard("복부 비율", format(result.whtr), "WHtR", whtrLabel(result.whtr), result.waistScore, result.whtr < .5 ? "good" : "care"),
  ].join("");

  const tips = [];
  if (result.bmi >= 23 || result.whtr >= .5) tips.push(["식후 10분", "식사 뒤 가볍게 걸어 혈당과 복부 지방 관리에 도움을 주세요.", "walk"]);
  if (data.bodyFat > result.fatRange[1]) tips.push(["단백질 한 끼", "매 끼니 손바닥 크기만큼의 단백질을 먼저 챙겨 보세요.", "meal"]);
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
              <label>체지방률 <small>%</small><input name="bodyFat" type="number" min="3" max="70" step=".1" value="${defaults.bodyFat}" /></label>
              <label>골격근량 <small>kg</small><input name="muscle" type="number" min="5" max="100" step=".1" value="${defaults.muscle}" /></label>
              <label class="wide">허리둘레 <small>cm</small><input name="waist" type="number" min="35" max="180" step=".1" value="${defaults.waist}" /></label>
            </form>
          </section>
          <aside class="tips-card"><div class="section-heading"><div><p class="eyebrow">SMALL STEPS</p><h2>오늘의 제안</h2></div><span class="sun">☀</span></div><ul id="tips"></ul><p class="disclaimer">이 결과는 건강 습관 관리를 위한 참고용 추정치이며, 의료 진단이나 전문 상담을 대신하지 않습니다.</p></aside>
        </section>
      </main>
      <footer>balance check · 내 몸을 이해하는 가장 가벼운 시작</footer>
    </div>`;
  document.querySelector("#profile-form").addEventListener("input", updateDashboard);
  document.querySelector("#profile-form").addEventListener("change", updateDashboard);
  updateDashboard();
}

setup();
