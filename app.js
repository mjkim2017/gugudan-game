const app = document.querySelector("#app");

const state = {
  room: "hall",
  flashlight: false,
  key: false,
  clockSeen: false,
  photoSeen: false,
  noteSeen: false,
  codeSolved: false,
  keypad: false,
  entered: "",
  strikes: 0,
  ghost: false,
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
  Object.assign(state, { room: "hall", flashlight: false, key: false, clockSeen: false, photoSeen: false, noteSeen: false, codeSolved: false, keypad: false, entered: "", strikes: 0, ghost: false, drawerOpen: false, heardWhisper: false, message: "비가 창문을 두드린다. 이 집에서 나가야 한다.", ending: "" });
  render();
}

function go(room) {
  state.room = room;
  state.message = rooms[room].text;
  render();
}

function inspect(target) {
  if (target === "clock") {
    if (!state.flashlight) state.message = "유리 너머가 너무 어둡다. 시곗바늘조차 보이지 않는다.";
    else { state.clockSeen = true; state.message = "손전등 불빛 아래 시곗바늘이 보인다. 시계는 3시 17분에서 멎어 있다. ‘17’이라는 숫자가 유난히 선명하다."; }
  }
  if (target === "books") {
    state.message = state.flashlight ? "책 사이에 오래된 영수증이 있다. ‘열쇠는 가장 가까운 곳에. 하지만 사진을 먼저 보지 말 것.’" : "너무 어두워서 책등의 글자가 보이지 않는다.";
  }
  if (target === "bed") {
    if (!state.flashlight) state.message = "침대 아래에서 뭔가 움직였다. 불빛 없이는 손을 넣을 수 없다.";
    else if (!state.photoSeen) state.message = "침대 아래에서 누군가 속삭인다. ‘사진을 봐.’ 지금은 손을 넣을 수 없다.";
    else if (!state.key) { state.key = true; state.ghost = true; state.message = "사진 속 아이가 가리킨 자리에서 현관 열쇠를 찾았다. 바로 뒤에서 숨소리가 들린다."; }
    else state.message = "침대 밑에는 이제 먼지와 차가운 어둠만 남았다.";
  }
  if (target === "photo") {
    if (!state.flashlight) state.message = "사진 속 얼굴이 어둠에 잠겼다. 누군가가 당신을 보고 있는 것만 같다.";
    else { state.photoSeen = true; state.message = "사진 속 아이가 네 손가락을 접어 0과 3을 만들고 있다. 사진 아래에는 ‘시계보다 먼저’라고 적혀 있다."; }
  }
  if (target === "note") {
    if (!state.flashlight) state.message = "젖은 메모의 잉크가 번져 있다. 불빛이 필요하다.";
    else { state.noteSeen = true; state.message = state.clockSeen && state.photoSeen ? "메모: ‘아이의 손짓을 먼저, 멈춘 시간을 나중에.’ 이제 네 자리 암호를 조합할 수 있다." : "메모: ‘아이의 손짓을 먼저, 멈춘 시간을 나중에.’ 아직 무엇을 뜻하는지 알 수 없다."; }
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
  if (!state.clockSeen || !state.photoSeen || !state.noteSeen) { state.message = "열쇠는 맞지만, 전자 잠금장치가 붉게 깜빡인다. 집 안 어딘가에 남은 단서가 있다."; render(); return; }
  if (!state.codeSolved) { state.keypad = true; state.message = "잠금장치가 켜졌다. 단서의 순서대로 네 자리 암호를 입력해야 한다."; render(); return; }
  if (!state.flashlight) { state.ending = "lost"; render(); return; }
  state.ending = "escape";
  render();
}

function pressDigit(digit) {
  if (!state.keypad || state.entered.length >= 4) return;
  state.entered += String(digit);
  if (state.entered.length === 4) {
    if (state.entered === "0317") {
      state.codeSolved = true;
      state.keypad = false;
      state.message = "초록 불이 켜졌다. 잠금이 풀렸다. 이제 문을 열 수 있다.";
    } else {
      state.strikes += 1;
      state.entered = "";
      if (state.strikes >= 2) { state.ending = "lost"; render(); return; }
      state.message = "붉은 불이 두 번 깜빡였다. 복도 끝에서 발소리가 가까워진다. 한 번 더 틀리면 끝이다.";
    }
  }
  render();
}

function clearCode() { state.entered = ""; render(); }

function dismissGhost() {
  state.ghost = false;
  state.message = "귀신은 다시 침대 밑으로 사라졌다. 하지만 방 안의 공기가 훨씬 차가워졌다.";
  render();
}

function inventory() {
  const pieces = `${state.photoSeen ? "03" : "??"} / ${state.clockSeen ? "17" : "??"}`;
  return `<div class="inventory"><span>소지품</span><b class="${state.flashlight ? "found" : ""}">🔦 ${state.flashlight ? "손전등" : "???"}</b><b class="${state.key ? "found" : ""}">🗝 ${state.key ? "현관 열쇠" : "???"}</b><b class="${state.codeSolved ? "found" : ""}"># ${state.codeSolved ? "암호 해제" : `단서 ${pieces}`}</b></div>`;
}

function objectiveBoard() {
  const cluesReady = state.clockSeen && state.photoSeen && state.noteSeen;
  const steps = [
    [state.flashlight, "빛을 찾아라"],
    [cluesReady, "흩어진 기억을 모아라"],
    [state.key, "가장 가까운 곳을 찾아라"],
    [state.codeSolved, "잠금을 해제하라"],
  ];
  const done = steps.filter(([complete]) => complete).length;
  return `<aside class="objective"><div><span>탈출 진행</span><strong>${done}<i>/ 4</i></strong></div><ol>${steps.map(([complete, label], index) => `<li class="${complete ? "done" : ""}"><b>0${index + 1}</b>${label}</li>`).join("")}</ol></aside>`;
}

function roomActions() {
  if (state.room === "hall") {
    const pad = state.keypad ? `<div class="keypad"><p>암호 <strong>${state.entered.padEnd(4, "·")}</strong></p><div>${[1,2,3,4,5,6,7,8,9,0].map(d => `<button onclick="pressDigit(${d})">${d}</button>`).join("")}<button class="clear" onclick="clearCode()">지움</button></div><small>실패: ${state.strikes} / 2</small></div>` : "";
    return `<button onclick="openDrawer()">신발장 서랍 열기</button><button class="danger" onclick="tryDoor()">현관문 열기</button>${pad}`;
  }
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
    <header><a href="index.html" class="logo">새벽 3시의 집</a><span class="warning">⚠ 돌아보지 마세요 · 소리 켜기 권장</span></header>
    ${inventory()}
    <section class="scene ${room.art}"><div class="moon"></div><p class="haunting">DON'T TURN AROUND</p><div class="room-label">${room.name}</div><div class="shadow"></div></section>
    <section class="panel"><div class="story-side"><p class="chapter">DAY 1 · 03:17 AM</p><h1>${room.name}</h1><p class="story">${state.message}</p><div class="actions">${roomActions()}</div></div>${objectiveBoard()}</section>
    <nav aria-label="방 이동"><button class="${state.room === "hall" ? "active" : ""}" onclick="go('hall')">현관</button><button class="${state.room === "study" ? "active" : ""}" onclick="go('study')">서재</button><button class="${state.room === "bedroom" ? "active" : ""}" onclick="go('bedroom')">침실</button><button class="${state.room === "kitchen" ? "active" : ""}" onclick="go('kitchen')">부엌</button></nav>
    ${state.ghost ? `<button class="ghost-jumpscare" onclick="dismissGhost()" aria-label="공포 장면 닫기"><span class="ghost-image"></span><strong>찾았다.</strong><small>화면을 눌러 도망치기</small></button>` : ""}
  </div>`;
}

window.go = go;
window.inspect = inspect;
window.openDrawer = openDrawer;
window.tryDoor = tryDoor;
window.pressDigit = pressDigit;
window.clearCode = clearCode;
window.dismissGhost = dismissGhost;
window.reset = reset;
render();
