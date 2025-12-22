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

let roundTime, restTime, totalRounds;
let currentRound = 1;
let remaining, total;
let isRest = false;
let paused = false;
let timer;
let progressType = "bar";

let pulseEnabled = true;
let pulseStartAt = 5;

/* Populate selects */
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
for (let i=1;i<=20;i++) {
  roundsSel.append(new Option(i,i));
}
roundMin.value = 3;

// Pulse start selector (3–10 seconds)
const pulseStartSel = document.getElementById("pulseStart");
for (let i = 3; i <= 10; i++) {
  pulseStartSel.append(new Option(i + " sec", i));
}
pulseStartSel.value = 5;

/* START FLOW */
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
    if (c === 0) {
      clearInterval(cd);
      countdown.classList.add("hidden");
      startRound();
    }
  },1000);
}

function startRound() {
  isRest = false;
  app.className = "app round";
  statusEl.textContent = `ROUND ${currentRound} / ${totalRounds}`;
  startTimer(roundTime);
}

function startRest() {
  isRest = true;
  app.className = "app rest";
  statusEl.textContent = "LEPO";
  startTimer(restTime);
}

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
  updateUI();

  if (remaining <= 0) {
    clearInterval(timer);
    if (!isRest && currentRound < totalRounds) startRest();
    else if (isRest) { currentRound++; startRound(); }
    else finish();
  }
}

function updateUI() {
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  timeEl.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

  const p = remaining / total;

  /* Reset states */
  barWrap.classList.remove("warning", "danger", "pulse");
  circleWrap.classList.remove("warning", "danger", "pulse");
  timeEl.classList.remove("pulse");

  /* Color shift thresholds */
  if (remaining <= 3) {
    barWrap.classList.add("danger");
    circleWrap.classList.add("danger");
  } else if (remaining <= 10) {
    barWrap.classList.add("warning");
    circleWrap.classList.add("warning");
  }

  /* Pulse logic */
  if (pulseEnabled && remaining <= pulseStartAt) {
    timeEl.classList.add("pulse");
    if (progressType === "bar") barWrap.classList.add("pulse");
    if (progressType === "circle") circleWrap.classList.add("pulse");
  }

  /* Progress visuals */
  bar.style.width = (p * 100) + "%";
  circle.style.strokeDashoffset = 565 * (1 - p);
}

function togglePause() {
  paused = !paused;
  pauseBtn.textContent = paused ? "RESUME" : "PAUSE";
}

function endSession() {
  clearInterval(timer);
  resetApp();
}

function finish() {
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

