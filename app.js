const app = document.querySelector("#app");

const map = [
  [1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,1],
  [1,0,1,0,1,0,1,1,0,1],
  [1,0,1,0,0,0,0,1,0,1],
  [1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,1,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1],
  [1,0,0,1,0,0,0,1,0,1],
  [1,0,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1],
];

const state = {
  x: 2.5, y: 8.5, angle: 0,
  keys: {}, flashlight: false, code: false, escaped: false,
  notice: "낡은 집에 갇혔다. 손전등부터 찾아야 한다.",
  lastTime: 0,
};

const objects = [
  { id: "flashlight", x: 1.5, y: 1.5, label: "손전등", color: "#f6d76b" },
  { id: "note", x: 8.5, y: 1.5, label: "찢어진 메모", color: "#db8b72" },
  { id: "door", x: 8.5, y: 8.5, label: "현관문", color: "#70483d" },
];

function setup() {
  app.innerHTML = `
    <section class="game-shell">
      <header><div><p>ESCAPE ROOM · 03:17 AM</p><h1>새벽 3시의 집</h1></div><span class="help">WASD / 방향키 이동 · 마우스로 둘러보기 · E 조사</span></header>
      <div class="viewport"><canvas id="game" aria-label="1인칭 3D 공포 탈출 게임"></canvas><div class="crosshair">+</div><div id="prompt" class="prompt"></div></div>
      <section class="bottom-ui"><div class="mission"><p>MISSION</p><ol><li id="mission-1"><b>01</b> 손전등 찾기</li><li id="mission-2"><b>02</b> 비밀번호 알기</li><li id="mission-3"><b>03</b> 현관문 열기</li></ol></div><div class="notice" id="notice"></div><div class="controls"><button data-key="ArrowLeft">↶</button><button data-key="ArrowUp">▲</button><button data-key="ArrowRight">↷</button><button data-key="KeyE">조사 E</button></div></section>
    </section>`;
  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const prompt = document.querySelector("#prompt");

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(320, Math.floor(rect.width * devicePixelRatio));
    canvas.height = Math.max(240, Math.floor(rect.height * devicePixelRatio));
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  addEventListener("resize", resize); resize();

  addEventListener("keydown", event => {
    state.keys[event.code] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) event.preventDefault();
    if (event.code === "KeyE") interact();
  });
  addEventListener("keyup", event => { state.keys[event.code] = false; });
  document.querySelectorAll("[data-key]").forEach(button => {
    const code = button.dataset.key;
    button.addEventListener("pointerdown", () => { state.keys[code] = true; if (code === "KeyE") interact(); });
    button.addEventListener("pointerup", () => { state.keys[code] = false; });
    button.addEventListener("pointerleave", () => { state.keys[code] = false; });
  });
  canvas.addEventListener("click", () => canvas.requestPointerLock?.());
  addEventListener("mousemove", event => { if (document.pointerLockElement === canvas) state.angle += event.movementX * 0.0028; });

  function cellOpen(x, y) { return map[Math.floor(y)]?.[Math.floor(x)] === 0; }
  function move(distance) {
    const nx = state.x + Math.cos(state.angle) * distance;
    const ny = state.y + Math.sin(state.angle) * distance;
    if (cellOpen(nx, state.y)) state.x = nx;
    if (cellOpen(state.x, ny)) state.y = ny;
  }
  function nearestObject() {
    return objects.find(object => !object.taken && Math.hypot(state.x - object.x, state.y - object.y) < 0.9);
  }
  function interact() {
    const object = nearestObject();
    if (!object) { state.notice = "가까이에서 조사할 물건이 없다."; return; }
    if (object.id === "flashlight") { object.taken = true; state.flashlight = true; state.notice = "손전등을 찾았다. 어둠 속에 메모가 보일 것 같다."; }
    if (object.id === "note") {
      if (!state.flashlight) { state.notice = "메모가 어둠에 젖어 있다. 손전등이 필요하다."; return; }
      object.taken = true; state.code = true; state.notice = "메모에 적힌 비밀번호는 0317. 현관문 잠금장치가 열릴 것이다.";
    }
    if (object.id === "door") {
      if (!state.code) { state.notice = "잠겼다. 현관문을 열 비밀번호가 필요하다."; return; }
      state.escaped = true; state.notice = "문이 열렸다. 비 냄새가 밀려온다.";
    }
    updateUi();
  }
  function updateUi() {
    document.querySelector("#mission-1").classList.toggle("done", state.flashlight);
    document.querySelector("#mission-2").classList.toggle("done", state.code);
    document.querySelector("#mission-3").classList.toggle("done", state.escaped);
    document.querySelector("#notice").textContent = state.notice;
  }
  function cast(angle) {
    const dirX = Math.cos(angle), dirY = Math.sin(angle);
    let mapX = Math.floor(state.x), mapY = Math.floor(state.y);
    const deltaX = Math.abs(1 / (dirX || 0.00001)), deltaY = Math.abs(1 / (dirY || 0.00001));
    let stepX, stepY, sideX, sideY;
    if (dirX < 0) { stepX = -1; sideX = (state.x - mapX) * deltaX; } else { stepX = 1; sideX = (mapX + 1 - state.x) * deltaX; }
    if (dirY < 0) { stepY = -1; sideY = (state.y - mapY) * deltaY; } else { stepY = 1; sideY = (mapY + 1 - state.y) * deltaY; }
    let side = 0;
    while (map[mapY]?.[mapX] !== 1) { if (sideX < sideY) { sideX += deltaX; mapX += stepX; side = 0; } else { sideY += deltaY; mapY += stepY; side = 1; } }
    const distance = side === 0 ? sideX - deltaX : sideY - deltaY;
    return { distance, side };
  }
  function visible(object) {
    const dx = object.x - state.x, dy = object.y - state.y;
    const dist = Math.hypot(dx, dy);
    let diff = Math.atan2(dy, dx) - state.angle;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    return { dist, diff, show: Math.abs(diff) < Math.PI / 3 && cast(state.angle + diff).distance + .18 >= dist };
  }
  function drawSprite(object, width, height) {
    if (object.taken) return;
    const sight = visible(object); if (!sight.show) return;
    const screenX = width / 2 + (sight.diff / (Math.PI / 3)) * width / 2;
    const size = Math.min(height * .67, height / sight.dist * .72);
    const bottom = height / 2 + size / 2;
    ctx.save();
    ctx.globalAlpha = Math.max(.36, 1 - sight.dist / 13);
    ctx.shadowBlur = 25; ctx.shadowColor = object.color; ctx.fillStyle = object.color;
    if (object.id === "door") { ctx.fillRect(screenX - size * .36, bottom - size, size * .72, size); ctx.fillStyle = "#e8bd6c"; ctx.fillRect(screenX + size * .18, bottom - size * .49, size * .06, size * .06); }
    else if (object.id === "flashlight") { ctx.fillRect(screenX - size * .12, bottom - size * .2, size * .24, size * .45); ctx.fillStyle = "#fff4b3"; ctx.fillRect(screenX - size * .18, bottom - size * .31, size * .36, size * .14); }
    else { ctx.fillStyle = "#dfd5bd"; ctx.fillRect(screenX - size * .28, bottom - size * .66, size * .56, size * .72); ctx.fillStyle = "#8b3030"; ctx.fillRect(screenX - size * .18, bottom - size * .48, size * .36, size * .045); }
    ctx.restore();
  }
  function render(time) {
    const elapsed = Math.min(.05, (time - state.lastTime) / 1000 || 0); state.lastTime = time;
    const turn = (state.keys.ArrowLeft || state.keys.KeyA ? -1 : 0) + (state.keys.ArrowRight || state.keys.KeyD ? 1 : 0);
    state.angle += turn * elapsed * 2.1;
    const walk = (state.keys.KeyW || state.keys.ArrowUp ? 1 : 0) + (state.keys.KeyS || state.keys.ArrowDown ? -1 : 0);
    if (walk) move(walk * elapsed * 2.25);
    const width = canvas.clientWidth, height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);
    const sky = ctx.createLinearGradient(0, 0, 0, height / 2); sky.addColorStop(0, "#050609"); sky.addColorStop(1, "#262831"); ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height / 2);
    const floor = ctx.createLinearGradient(0, height / 2, 0, height); floor.addColorStop(0, "#211b1c"); floor.addColorStop(1, "#050506"); ctx.fillStyle = floor; ctx.fillRect(0, height / 2, width, height / 2);
    const fov = Math.PI / 3; const rays = Math.ceil(width / 2);
    for (let ray = 0; ray < rays; ray += 1) {
      const angle = state.angle - fov / 2 + ray / rays * fov;
      const hit = cast(angle); const corrected = hit.distance * Math.cos(angle - state.angle);
      const wallHeight = Math.min(height * 1.8, height / corrected); const shade = Math.max(8, 48 - corrected * 8 - hit.side * 11);
      ctx.fillStyle = `rgb(${shade + 18}, ${shade + 11}, ${shade + 14})`;
      ctx.fillRect(ray * 2, height / 2 - wallHeight / 2, 2.3, wallHeight);
    }
    [...objects].sort((a, b) => Math.hypot(b.x-state.x,b.y-state.y)-Math.hypot(a.x-state.x,a.y-state.y)).forEach(item => drawSprite(item, width, height));
    if (state.flashlight) { const glow = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, Math.max(width,height)*.72); glow.addColorStop(0, "#fff5cf1e"); glow.addColorStop(.36, "#f1db9d08"); glow.addColorStop(1, "#000000bb"); ctx.fillStyle=glow; ctx.fillRect(0,0,width,height); }
    const object = nearestObject(); prompt.textContent = object ? `[ E ] ${object.label} 조사하기` : "";
    if (state.escaped) { ctx.fillStyle = "#000b"; ctx.fillRect(0,0,width,height); ctx.fillStyle="#f1ead6"; ctx.textAlign="center"; ctx.font="800 38px serif"; ctx.fillText("탈출 성공", width/2, height/2); ctx.font="16px sans-serif"; ctx.fillText("새벽이 밝아오기 전에 집을 빠져나왔다.", width/2, height/2+38); }
    requestAnimationFrame(render);
  }
  updateUi(); requestAnimationFrame(render);
}

setup();
