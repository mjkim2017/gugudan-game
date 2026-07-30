const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const overlay = document.querySelector("#overlay");
const startButton = document.querySelector("#start");

const width = canvas.width;
const height = canvas.height;
let running = false;
let score = 0;
let rocket = null;
let meteors = [];
let stars = [];
let booster = false;
let keys = { left: false, right: false };
let frame = 0;

function reset() {
  score = 0;
  frame = 0;
  rocket = { x: width / 2, y: height - 95, speed: 0 };
  meteors = [];
  stars = Array.from({ length: 70 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 1 + Math.random() * 2,
    speed: .5 + Math.random() * 1.5,
  }));
}

function start() {
  reset();
  running = true;
  overlay.classList.add("hidden");
  requestAnimationFrame(loop);
}

function end() {
  running = false;
  overlay.classList.remove("hidden");
  overlay.innerHTML = `<h2>충돌 감지</h2><p>비행 기록: ${Math.floor(score)}m</p><button id="start">재시작</button>`;
  document.querySelector("#start").addEventListener("click", start);
}

function drawBackground() {
  context.fillStyle = "#10133a";
  context.fillRect(0, 0, width, height);
  for (const star of stars) {
    star.y += star.speed + score / 650;
    if (star.y > height) { star.y = -4; star.x = Math.random() * width; }
    context.fillStyle = "rgba(255,255,255,.9)";
    context.fillRect(star.x, star.y, star.size, star.size);
  }
  context.fillStyle = "#34455d";
  context.beginPath();
  context.arc(width - 55, 72, 36, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#253448";
  context.beginPath();
  context.arc(width - 68, 60, 8, 0, Math.PI * 2);
  context.arc(width - 45, 91, 5, 0, Math.PI * 2);
  context.fill();
}

function drawRocket() {
  const { x, y } = rocket;
  if (booster) {
    context.fillStyle = "#ff9f43";
    context.beginPath();
    context.moveTo(x - 13, y + 33);
    context.lineTo(x + 13, y + 33);
    context.lineTo(x, y + 63 + Math.random() * 13);
    context.fill();
    context.fillStyle = "#fff067";
    context.beginPath();
    context.moveTo(x - 6, y + 32);
    context.lineTo(x + 6, y + 32);
    context.lineTo(x, y + 52);
    context.fill();
  }
  context.fillStyle = "#c8d0d6";
  context.beginPath();
  context.ellipse(x, y, 20, 34, 0, Math.PI, Math.PI * 2);
  context.lineTo(x + 20, y + 27);
  context.lineTo(x - 20, y + 27);
  context.closePath();
  context.fill();
  context.fillStyle = "#76b9d8";
  context.beginPath();
  context.arc(x, y - 7, 10, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#943f42";
  context.beginPath();
  context.moveTo(x - 19, y + 16);
  context.lineTo(x - 37, y + 36);
  context.lineTo(x - 19, y + 30);
  context.fill();
  context.beginPath();
  context.moveTo(x + 19, y + 16);
  context.lineTo(x + 37, y + 36);
  context.lineTo(x + 19, y + 30);
  context.fill();
}

function addMeteor() {
  const radius = 16 + Math.random() * 20;
  meteors.push({ x: radius + Math.random() * (width - radius * 2), y: -radius, radius, speed: 2.6 + Math.random() * 2 + score / 700 });
}

function drawMeteors() {
  for (const meteor of meteors) {
    meteor.y += meteor.speed;
    context.fillStyle = "#9e6d71";
    context.beginPath();
    context.arc(meteor.x, meteor.y, meteor.radius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#c49184";
    context.beginPath();
    context.arc(meteor.x - meteor.radius * .25, meteor.y - meteor.radius * .2, meteor.radius * .25, 0, Math.PI * 2);
    context.fill();
  }
  meteors = meteors.filter(meteor => meteor.y < height + meteor.radius);
}

function hitMeteor() {
  return meteors.some(meteor => Math.hypot(rocket.x - meteor.x, rocket.y - meteor.y) < meteor.radius + 18);
}

function drawScore() {
  context.fillStyle = "rgba(10, 11, 42, .6)";
  context.fillRect(16, 16, 154, 46);
  context.fillStyle = "#fff";
  context.font = "bold 23px Malgun Gothic, sans-serif";
  context.fillText(`높이 ${Math.floor(score)}m`, 27, 47);
}

function update() {
  frame += 1;
  if (keys.left) rocket.speed -= .35;
  if (keys.right) rocket.speed += .35;
  rocket.speed *= .88;
  rocket.x = Math.max(38, Math.min(width - 38, rocket.x + rocket.speed));
  score += booster ? 1.5 : .55;
  if (frame % Math.max(30, 65 - Math.floor(score / 80)) === 0) addMeteor();
}

function loop() {
  if (!running) return;
  update();
  drawBackground();
  drawMeteors();
  drawRocket();
  drawScore();
  if (hitMeteor()) { end(); return; }
  requestAnimationFrame(loop);
}

function moveRocket(clientX) {
  const bounds = canvas.getBoundingClientRect();
  rocket.x = Math.max(38, Math.min(width - 38, (clientX - bounds.left) * (width / bounds.width)));
}

canvas.addEventListener("pointerdown", event => {
  if (!running) return;
  event.preventDefault();
  booster = true;
  moveRocket(event.clientX);
});
canvas.addEventListener("pointermove", event => {
  if (running && event.buttons) moveRocket(event.clientX);
});
canvas.addEventListener("pointerup", () => { booster = false; });
canvas.addEventListener("pointercancel", () => { booster = false; });

window.addEventListener("keydown", event => {
  if (event.code === "Space") {
    event.preventDefault();
    if (!running) start(); else booster = true;
  }
  if (event.key === "ArrowLeft") keys.left = true;
  if (event.key === "ArrowRight") keys.right = true;
});
window.addEventListener("keyup", event => {
  if (event.code === "Space") booster = false;
  if (event.key === "ArrowLeft") keys.left = false;
  if (event.key === "ArrowRight") keys.right = false;
});

startButton.addEventListener("click", start);
drawBackground();
