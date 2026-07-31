const app = document.querySelector("#app");

const state = {
  room: "hall",
  flashlight: false,
  key: false,
  code: false,
  drawerOpen: false,
  heardWhisper: false,
  message: "비가 창문을 두드린다. 이 집에서 나가야 한다.",
  ending: "",
};

const rooms = {
  hall: { name: "현관", art: "hall", text: "잠긴 현관문과 오래된 신발장. 문 너머에서 누군가 발을 끌고 지나간다." },
  study: { name: "서재", art: "study", text: "먼지 쌓인 책장과 멈춘 벽시계. 시곗바늘은 3시 17분에 멎어 있다." },
  bedroom: { name: "침실", art: "bedroom", text: "침대 아래가 유난히 어둡다. 벽에는 찢어진 가족사진이 걸려 있다." },
  kitchen: { name: "부엌", art: "kitchen", text: "냉장고가 혼자 웅웅거린다. 식탁 위 메모가 젖어 있다." },
};

function reset() {
  Object.assign(state, { room: "hall", flashlight: false, key: false, code: false, drawerOpen: false, heardWhisper: false, message: "비가 창문을 두드린다. 이 집에서 나가야 한다.", ending: "" });
  render();
}

function go(room) {
  state.room = room;
  state.message = rooms[room].text;
  render();
}

function inspect(target) {
  if (target === "clock") {
    state.code = true;
    state.message = "시계 뒷면에 긁힌 숫자: 0317. 이 숫자를 기억해야 할 것 같다.";
  }
  if (target === "books") {
    state.message = state.flashlight ? "책 사이에 오래된 영수증이 있다. ‘열쇠는 가장 가까운 곳에.’" : "너무 어두워서 책등의 글자가 보이지 않는다.";
  }
  if (target === "bed") {
    if (!state.flashlight) state.message = "침대 아래에서 뭔가 움직였다. 불빛 없이는 손을 넣을 수 없다.";
    else if (!state.key) { state.key = true; state.message = "손전등 빛 아래, 침대 밑에서 현관 열쇠를 찾았다. 바로 뒤에서 숨소리가 들린다."; }
    else state.message = "침대 밑에는 이제 먼지와 차가운 어둠만 남았다.";
  }
  if (target === "photo") {
    state.message = "사진 속 가족은 모두 카메라를 보고 있다. 단 한 명만, 당신을 보고 있다.";
  }
  if (target === "note") {
    state.message = state.code ? "메모: ‘3시 17분에 문은 열린다. 하지만 빛을 잊지 마.’" : "젖은 메모에는 숫자 네 자리가 있었던 흔적이 난다.";
  }
  if (target === "fridge") {
    state.message = "냉장고 안은 텅 비어 있다. 가장 안쪽에서 누군가 문을 두드린다.";
  }
  render();
}

function openDrawer() {
  if (!state.drawerOpen) {
    state.drawerOpen = true;
    state.flashlight = true;
    state.message = "신발장 서랍에서 작은 손전등을 찾았다. 배터리는 아직 살아 있다.";
  } else state.message = "서랍은 비어 있다. 손전등은 당신 손안에서 미약하게 떨린다.";
  render();
}

function tryDoor() {
  if (!state.key) { state.message = "문고리가 움직이지 않는다. 어디엔가 열쇠가 있다."; render(); return; }
  if (!state.code) { state.message = "열쇠는 맞지만, 전자 잠금장치가 붉게 깜빡인다. 네 자리 암호가 필요하다."; render(); return; }
  if (!state.flashlight) { state.ending = "lost"; render(); return; }
  state.ending = "escape";
  render();
}

function inventory() {
  return `<div class="inventory"><span>소지품</span><b class="${state.flashlight ? "found" : ""}">🔦 ${state.flashlight ? "손전등" : "???"}</b><b class="${state.key ? "found" : ""}">🗝 ${state.key ? "현관 열쇠" : "???"}</b><b class="${state.code ? "found" : ""}"># ${state.code ? "암호 0317" : "????"}</b></div>`;
}

function roomActions() {
  if (state.room === "hall") return `<button onclick="openDrawer()">신발장 서랍 열기</button><button class="danger" onclick="tryDoor()">현관문 열기</button>`;
  if (state.room === "study") return `<button onclick="inspect('clock')">멈춘 시계 조사</button><button onclick="inspect('books')">책장 살펴보기</button>`;
  if (state.room === "bedroom") return `<button onclick="inspect('bed')">침대 아래 보기</button><button onclick="inspect('photo')">가족사진 보기</button>`;
  return `<button onclick="inspect('note')">젖은 메모 읽기</button><button onclick="inspect('fridge')">냉장고 열기</button>`;
}

function render() {
  if (state.ending) {
    const escaped = state.ending === "escape";
    app.innerHTML = `<section class="ending ${escaped ? "escaped" : "lost"}"><p class="eyebrow">${escaped ? "ESCAPE COMPLETE" : "THE HOUSE REMEMBERS"}</p><div class="ending-icon">${escaped ? "☾" : "◉"}</div><h1>${escaped ? "새벽 공기" : "불이 꺼졌다"}</h1><p>${escaped ? "잠금이 풀리고 차가운 비 냄새가 밀려온다. 뒤돌아보지 않은 채, 당신은 집을 빠져나왔다." : "문은 열렸지만 손전등이 없다. 어둠 속에서 누군가 당신의 이름을 불렀다."}</p><button onclick="reset()">다시 깨어나기</button></section>`;
    return;
  }
  const room = rooms[state.room];
  app.innerHTML = `<div class="game ${state.flashlight ? "lit" : ""}">
    <header><a href="index.html" class="logo">새벽 3시의 집</a><span>공포 탈출 · 소리 켜기 권장</span></header>
    ${inventory()}
    <section class="scene ${room.art}"><div class="moon"></div><div class="room-label">${room.name}</div><div class="shadow"></div></section>
    <section class="panel"><p class="chapter">DAY 1 · 03:17 AM</p><h1>${room.name}</h1><p class="story">${state.message}</p><div class="actions">${roomActions()}</div></section>
    <nav aria-label="방 이동"><button class="${state.room === "hall" ? "active" : ""}" onclick="go('hall')">현관</button><button class="${state.room === "study" ? "active" : ""}" onclick="go('study')">서재</button><button class="${state.room === "bedroom" ? "active" : ""}" onclick="go('bedroom')">침실</button><button class="${state.room === "kitchen" ? "active" : ""}" onclick="go('kitchen')">부엌</button></nav>
  </div>`;
}

window.go = go;
window.inspect = inspect;
window.openDrawer = openDrawer;
window.tryDoor = tryDoor;
window.reset = reset;
render();
