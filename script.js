const app = document.getElementById("app");

const settings = document.getElementById("settings");
const countdown = document.getElementById("countdown");
const timerView = document.getElementById("timer");
const finishView = document.getElementById("finish");

const statusEl = document.getElementById("status");
const timeEl = document.getElementById("time");
const pauseBtn = document.getElementById("pauseBtn");

const barWrap = document.getElementById("barWrap");
const bar = document.getElementById("bar");
const circleWrap = document.getElementById("circleWrap");
const circle = document.getElementById("circle");

/* =========================
   SOUNDS
========================= */
const beep = document.getElementById("beep");
const beepFinal = document.getElementById("beepFinal");
const ding = document.getElementById("ding");
const cheer = document.getElementById("cheer");

function playSound(a) {
  a.currentTime = 0;
  a.play().catch(() => {});
}

/* =========================
   STATE
========================= */
let roundTime, restTime, totalRounds;
let currentRound = 1;
let remaining, total;
let isRest = false;
let paused = false;
let timer;
let progressType = "bar";

let pulseEnabled = true;
let pulseStartAt = 5;

/* =========================
   POPULATE SELECTS
========================= */
function fill(id, max) {
  const s = document.getElementById(id);
  for (let i = 0; i <= max; i++) {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = String(i).padStart(2,"0");
    s.appendChild(o);
  }
}
fill("roundMin",10); fill("roundSec",59);
fill("restMin",10); fill("restSec",59);

const roundsSel = document.getElementById("rounds");
for (let i=1;i<=20;i++) roundsSel.append(new Option(i,i));
roundMin.value = 3;	//Default round minutes
roundSec.value = 0;	//default round seconds
restMin.value = 0;	//Default rest mintues
restSec.value = 30;	//Default rest seconds
roundsSel.value = 5;	//Default total rounds

const pulseStartSel = document.getElementById("pulseStart");
for (let i=3;i<=10;i++) pulseStartSel.append(new Option(i+" sec",i));
pulseStartSel.value = 5;

/* =========================
   SESSION START COUNTDOWN
========================= */
function prepareStart() {
  roundTime = +roundMin.value*60 + +roundSec.value;
  restTime = +restMin.value*60 + +restSec.value;
  totalRounds = +rounds.value;
  progressType = document.getElementById("progressType").value;
  pulseEnabled = document.getElementById("pulseEnabled").value === "on";
  pulseStartAt = +document.getElementById("pulseStart").value;

  settings.classList.add("hidden");
  countdown.classList.remove("hidden");

  let c = 5;
  countNum.textContent = c;

  const cd = setInterval(() => {
    c--;
    countNum.textContent = c;

    if (c === 2 || c === 1) playSound(beep);

    if (c === 0) {
      playSound(beepFinal);   // EXACT start moment
      clearInterval(cd);
      countdown.classList.add("hidden");
      startRound();
    }
  },1000);
}

/* =========================
   ROUND / REST
========================= */
function startRound() {
  isRest = false;
  app.className = "app round";
  statusEl.textContent = `ROUND ${currentRound} / ${totalRounds}`;
  startTimer(roundTime);
}

function startRest() {
  playSound(ding); // round end bell
  isRest = true;
  app.className = "app rest";
  statusEl.textContent = "LEPO";
  startTimer(restTime);
}

/* =========================
   TIMER CORE
========================= */
function startTimer(seconds) {
  clearInterval(timer);
  remaining = total = seconds;
  paused = false;
  pauseBtn.textContent = "PAUSE";

  timerView.classList.remove("hidden");
  barWrap.classList.toggle("hidden", progressType !== "bar");
  circleWrap.classList.toggle("hidden", progressType !== "circle");

  updateUI();
  timer = setInterval(tick,1000);
}

function tick() {
  if (paused) return;

  remaining--;

  // 🔊 REST → ROUND SOUND-ONLY COUNTDOWN
  if (isRest) {
    if (remaining === 2 || remaining === 1) playSound(beep);
    if (remaining === 0) playSound(beepFinal);
  }

  updateUI();

  if (remaining <= 0) {
    clearInterval(timer);

    if (!isRest && currentRound < totalRounds) {
      startRest();
    }
    else if (isRest) {
      currentRound++;
      startRound();
    }
    else {
      finish();
    }
  }
}

/* =========================
   UI UPDATE (UNCHANGED)
========================= */
function updateUI() {
  const m = Math.floor(remaining/60);
  const s = remaining%60;
  timeEl.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

  const p = remaining/total;

  barWrap.classList.remove("warning","danger","pulse");
  circleWrap.classList.remove("warning","danger","pulse");
  timeEl.classList.remove("pulse");

  if (remaining <= 3) {
    barWrap.classList.add("danger");
    circleWrap.classList.add("danger");
  } else if (remaining <= 10) {
    barWrap.classList.add("warning");
    circleWrap.classList.add("warning");
  }

  if (pulseEnabled && remaining <= pulseStartAt) {
    timeEl.classList.add("pulse");
    if (progressType==="bar") barWrap.classList.add("pulse");
    if (progressType==="circle") circleWrap.classList.add("pulse");
  }

  bar.style.width = (p*100)+"%";
  circle.style.strokeDashoffset = 565*(1-p);
}

/* =========================
   CONTROLS
========================= */
function togglePause() {
  paused = !paused;
  pauseBtn.textContent = paused ? "RESUME" : "PAUSE";
}

function endSession() {
  clearInterval(timer);
  resetApp();
}

function finish() {
  playSound(cheer);
  timerView.classList.add("hidden");
  finishView.classList.remove("hidden");
  app.className = "app done";
}

function resetApp() {
  clearInterval(timer);
  currentRound = 1;
  settings.classList.remove("hidden");
  finishView.classList.add("hidden");
  timerView.classList.add("hidden");
  app.className = "app round";
}
