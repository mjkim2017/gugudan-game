const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const overlay = document.querySelector("#overlay");
const startButton = document.querySelector("#start");

const width = canvas.width;
const height = canvas.height;
const targetAltitude = 1000;
let running = false;
let score = 0;
let rocket = null;
let meteors = [];
let stars = [];
let booster = false;
let keys = { left: false, right: false };
let frame = 0;
let shieldCharges = 0;
let credits = Number(localStorage.getItem("rocketCredits") || 0);
let upgrades = JSON.parse(localStorage.getItem("rocketUpgrades") || '{"engine":0,"shield":0,"control":0}');

function saveProgress() {
  localStorage.setItem("rocketCredits", String(credits));
  localStorage.setItem("rocketUpgrades", JSON.stringify(upgrades));
}

function reset() {
  score = 0;
  frame = 0;
  rocket = { x: width / 2, y: height - 95, speed: 0 };
  shieldCharges = upgrades.shield;
  meteors = [];
  stars = Array.from({ length: 70 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 1 + Math.random() * 2,
    speed: .5 + Math.random() * 1.5,
    color: Math.random() > .82 ? "#bfd6ff" : Math.random() > .9 ? "#ffe7b0" : "#ffffff",
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

function upgradeCost(type) {
  return { engine: 4 + upgrades.engine * 3, shield: 5 + upgrades.shield * 4, control: 3 + upgrades.control * 3 }[type];
}

function openShop(message = "정비 상점") {
  running = false;
  overlay.classList.remove("hidden");
  overlay.innerHTML = `
    <h2>${message}</h2>
    <p>보유 연료: <strong>${credits}</strong></p>
    <button class="shop-item" data-upgrade="engine">추진력 Lv.${upgrades.engine} · ${upgradeCost("engine")} 연료</button>
    <button class="shop-item" data-upgrade="shield">보호막 Lv.${upgrades.shield} · ${upgradeCost("shield")} 연료</button>
    <button class="shop-item" data-upgrade="control">기동 제어 Lv.${upgrades.control} · ${upgradeCost("control")} 연료</button>
    <button id="launch">다음 임무</button>`;
  document.querySelectorAll("[data-upgrade]").forEach(button => button.addEventListener("click", () => {
    const type = button.dataset.upgrade;
    const cost = upgradeCost(type);
    if (credits >= cost) {
      credits -= cost;
      upgrades[type] += 1;
      saveProgress();
      openShop("업그레이드 완료");
    } else {
      openShop("연료가 부족합니다");
    }
  }));
  document.querySelector("#launch").addEventListener("click", start);
}

function complete() {
  credits += 12;
  saveProgress();
  openShop("임무 완료 · +12 연료");
}

function drawBackground() {
  const space = context.createLinearGradient(0, 0, 0, height);
  space.addColorStop(0, "#02050e");
  space.addColorStop(.55, "#09142c");
  space.addColorStop(1, "#1b3451");
  context.fillStyle = space;
  context.fillRect(0, 0, width, height);
  for (const star of stars) {
    star.y += star.speed + score / 650;
    if (star.y > height) { star.y = -4; star.x = Math.random() * width; }
    context.fillStyle = star.color;
    context.globalAlpha = .55 + Math.sin((frame + star.x) / 23) * .35;
    context.fillRect(star.x, star.y, star.size, star.size);
    context.globalAlpha = 1;
  }

  const earthCenterY = height + 365;
  const earthRadius = 490;
  const atmosphere = context.createRadialGradient(width / 2, earthCenterY - earthRadius, 20, width / 2, earthCenterY, earthRadius);
  atmosphere.addColorStop(.7, "rgba(69, 166, 255, 0)");
  atmosphere.addColorStop(.91, "rgba(71, 179, 255, .15)");
  atmosphere.addColorStop(1, "rgba(145, 222, 255, .7)");
  context.fillStyle = atmosphere;
  context.beginPath();
  context.arc(width / 2, earthCenterY, earthRadius, Math.PI, Math.PI * 2);
  context.fill();

  const earth = context.createRadialGradient(width * .37, height + 105, 20, width / 2, earthCenterY, earthRadius);
  earth.addColorStop(0, "#6ab8e8");
  earth.addColorStop(.45, "#1e6095");
  earth.addColorStop(.82, "#0b2d54");
  earth.addColorStop(1, "#031426");
  context.fillStyle = earth;
  context.beginPath();
  context.arc(width / 2, earthCenterY, earthRadius - 9, Math.PI, Math.PI * 2);
  context.fill();

  context.save();
  context.beginPath();
  context.arc(width / 2, earthCenterY, earthRadius - 9, Math.PI, Math.PI * 2);
  context.clip();
  context.fillStyle = "rgba(236, 249, 255, .35)";
  for (let index = 0; index < 7; index += 1) {
    context.beginPath();
    context.ellipse(45 + index * 78, height - 3 + (index % 2) * 17, 65, 11, -.18, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();

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
  context.save();
  context.translate(x, y);
  if (booster) {
    const flame = context.createLinearGradient(0, 30, 0, 95);
    flame.addColorStop(0, "#fffbd1");
    flame.addColorStop(.25, "#ffd45e");
    flame.addColorStop(.65, "#f46b32");
    flame.addColorStop(1, "rgba(239, 54, 28, 0)");
    context.fillStyle = flame;
    context.beginPath();
    context.moveTo(-12, 30);
    context.lineTo(12, 30);
    context.lineTo(0, 78 + Math.random() * 18);
    context.fill();
  }
  context.fillStyle = "#893336";
  context.beginPath();
  context.moveTo(-19, 18);
  context.lineTo(-44, 43);
  context.lineTo(-18, 34);
  context.closePath();
  context.fill();
  context.beginPath();
  context.moveTo(19, 18);
  context.lineTo(44, 43);
  context.lineTo(18, 34);
  context.closePath();
  context.fill();

  const body = context.createLinearGradient(-20, 0, 20, 0);
  body.addColorStop(0, "#87939c");
  body.addColorStop(.32, "#f4f6f4");
  body.addColorStop(.65, "#bac4ca");
  body.addColorStop(1, "#687780");
  context.fillStyle = body;
  context.beginPath();
  context.moveTo(0, -57);
  context.bezierCurveTo(18, -35, 21, -8, 19, 31);
  context.lineTo(-19, 31);
  context.bezierCurveTo(-21, -8, -18, -35, 0, -57);
  context.closePath();
  context.fill();
  context.strokeStyle = "#46555d";
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = "#344d5f";
  context.beginPath();
  context.ellipse(0, -18, 11, 13, 0, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#a7d5e7";
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = "#1f2930";
  context.fillRect(-14, 28, 28, 9);
  context.fillStyle = "#63737c";
  context.fillRect(-10, 31, 20, 7);
  context.restore();
}

function drawMeteor(meteor) {
  meteor.y += meteor.speed;
  meteor.rotation += meteor.spin;
  context.save();
  context.translate(meteor.x, meteor.y);
  context.rotate(meteor.rotation);
  const stone = context.createRadialGradient(-meteor.radius * .3, -meteor.radius * .35, 2, 0, 0, meteor.radius * 1.2);
  stone.addColorStop(0, "#b1a092");
  stone.addColorStop(.42, "#76665e");
  stone.addColorStop(1, "#342c2c");
  context.fillStyle = stone;
  context.beginPath();
  meteor.vertices.forEach((distance, index) => {
    const angle = (Math.PI * 2 * index) / meteor.vertices.length;
    const x = Math.cos(angle) * meteor.radius * distance;
    const y = Math.sin(angle) * meteor.radius * distance;
    if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
  });
  context.closePath();
  context.fill();
  context.strokeStyle = "#d1b39c";
  context.globalAlpha = .4;
  context.lineWidth = 1;
  context.stroke();
  context.globalAlpha = 1;
  context.fillStyle = "rgba(39, 30, 28, .55)";
  for (const crater of meteor.craters) {
    context.beginPath();
    context.ellipse(crater.x * meteor.radius, crater.y * meteor.radius, crater.size * meteor.radius, crater.size * meteor.radius * .65, 0, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawMeteorTrail(meteor) {
  const trailLength = meteor.radius * (3.5 + meteor.speed * .5);
  const trail = context.createLinearGradient(meteor.x, meteor.y - meteor.radius, meteor.x, meteor.y - trailLength);
  trail.addColorStop(0, "rgba(255, 234, 180, .95)");
  trail.addColorStop(.22, "rgba(255, 144, 65, .72)");
  trail.addColorStop(1, "rgba(255, 65, 28, 0)");
  context.strokeStyle = trail;
  context.lineWidth = meteor.radius * .9;
  context.beginPath();
  context.moveTo(meteor.x, meteor.y - meteor.radius * .6);
  context.lineTo(meteor.x - meteor.spin * 160, meteor.y - trailLength);
  context.stroke();
}

function addMeteor() {
  const radius = 16 + Math.random() * 20;
  meteors.push({
    x: radius + Math.random() * (width - radius * 2), y: -radius, radius,
    speed: Math.max(1.8, 2.6 + Math.random() * 2 + score / 700 - upgrades.control * .2),
    rotation: Math.random() * Math.PI * 2, spin: (Math.random() - .5) * .07,
    vertices: Array.from({ length: 8 }, () => .78 + Math.random() * .26),
    craters: Array.from({ length: 3 }, () => ({ x: (Math.random() - .5) * 1.15, y: (Math.random() - .5) * 1.15, size: .11 + Math.random() * .11 })),
  });
}

function drawMeteors() {
  for (const meteor of meteors) {
    drawMeteorTrail(meteor);
    drawMeteor(meteor);
  }
  meteors = meteors.filter(meteor => meteor.y < height + meteor.radius);
}

function hitMeteorIndex() {
  const collisionRadius = Math.max(10, 18 - upgrades.control * 2);
  return meteors.findIndex(meteor => Math.hypot(rocket.x - meteor.x, rocket.y - meteor.y) < meteor.radius + collisionRadius);
}

function drawScore() {
  context.fillStyle = "rgba(10, 11, 42, .6)";
  context.fillRect(16, 16, 210, 72);
  context.fillStyle = "#fff";
  context.font = "bold 23px Malgun Gothic, sans-serif";
  context.fillText(`높이 ${Math.floor(score)} / ${targetAltitude}m`, 27, 45);
  context.font = "bold 16px Malgun Gothic, sans-serif";
  context.fillText(`보호막 ${shieldCharges}`, 27, 70);
}

function update() {
  frame += 1;
  if (keys.left) rocket.speed -= .35;
  if (keys.right) rocket.speed += .35;
  rocket.speed *= .88;
  rocket.x = Math.max(38, Math.min(width - 38, rocket.x + rocket.speed));
  score += booster ? 1.5 * (1 + upgrades.engine * .3) : .55;
  if (frame % Math.max(30, 65 - Math.floor(score / 80)) === 0) addMeteor();
}

function loop() {
  if (!running) return;
  update();
  drawBackground();
  drawMeteors();
  drawRocket();
  drawScore();
  const collision = hitMeteorIndex();
  if (collision >= 0) {
    if (shieldCharges > 0) {
      shieldCharges -= 1;
      meteors.splice(collision, 1);
    } else { end(); return; }
  }
  if (score >= targetAltitude) { complete(); return; }
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
