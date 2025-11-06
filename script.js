'use strict';

let level = 10;
let answer = null;
let score = 0;
const levelArr = document.getElementsByName('level') || [];
const scoreArr = [];

// timing variables
let roundStart = null;
const timesArr = [];
let fastestTimeMs = null;
let totalTimeMs = 0;
let gamesTimeCount = 0;

// leaderboard (persisted)
let leaderboard = [];
const LEADERBOARD_KEY = 'gg_leaderboard_v1';

// DOM elements
const dateEl = document.getElementById('date');
const playBtn = document.getElementById('playBtn');
const guessBtn = document.getElementById('guessBtn');
const guess = document.getElementById('guess');
const msg = document.getElementById('msg');
const wins = document.getElementById('wins');
const avgScore = document.getElementById('avgScore');
const giveUpBtn = document.getElementById('giveUp');
const nameInput = document.querySelector('input#playerName');
const startBtn = document.getElementById('startBtn');
const playerDisplay = document.getElementById('playerDisplay');


const nameMsgEl = document.getElementById('nameMsg');
const guessHistoryEl = document.getElementById('guessHistory');
const leaderboardEl = document.getElementById('leaderboard');
const clearLeaderboardBtn = document.getElementById('clearLeaderboardBtn');

// elements used to show tries on separate lines
const triesNumberEl = document.getElementById('triesNumber');
const triesLabelEl = document.getElementById('triesLabel');

function safeDisable(el, val = true) { if (!el) return; el.disabled = !!val; }
function pad(n) { return String(n).padStart(2, '0'); }

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) { leaderboard = []; return; }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) leaderboard = parsed;
    else leaderboard = [];
  } catch (e) {
    leaderboard = [];
  }
}

function saveLeaderboard() {
  try { localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard)); } catch (e) {}
}

function formatMsReadable(ms) {
  if (typeof ms !== 'number' || ms <= 0) return '-';
  const totalSec = ms / 1000;
  if (totalSec < 60) return totalSec.toFixed(2) + 's';
  const mins = Math.floor(totalSec / 60);
  const secs = (totalSec % 60).toFixed(2);
  return `${mins}:${String(secs).padStart(5, '0')}m`;
}

function renderLeaderboard() {
  if (!leaderboardEl) return;
  leaderboardEl.innerHTML = '';
  leaderboard.forEach((entry, idx) => {
    const li = document.createElement('li');
    li.textContent = `${idx + 1}. ${entry.player} — ${formatMsReadable(entry.timeMs)} (${entry.tries} ${entry.tries === 1 ? 'try' : 'tries'})`;
    leaderboardEl.appendChild(li);
  });
}

function addToLeaderboard(player, timeMs, tries) {
  if (typeof timeMs !== 'number' || timeMs <= 0) return;
  const name = (player && player.trim()) ? player.trim() : 'Player';
  leaderboard.push({ player: name, timeMs: Number(timeMs), tries: Number(tries) || 0, when: new Date().toISOString() });
  leaderboard.sort((a,b) => {
    if (a.timeMs !== b.timeMs) return a.timeMs - b.timeMs;
    if (a.tries !== b.tries) return a.tries - b.tries;
    return a.when.localeCompare(b.when);
  });
  if (leaderboard.length > 3) leaderboard.length = 3;
  saveLeaderboard();
  renderLeaderboard();
}

if (clearLeaderboardBtn) {
  clearLeaderboardBtn.addEventListener('click', () => {
    leaderboard = [];
    saveLeaderboard();
    renderLeaderboard();
  });
}

// guess history
function addGuessToHistory(g) {
  if (!guessHistoryEl) return;
  const li = document.createElement('li');
  li.textContent = String(g);
  guessHistoryEl.insertBefore(li, guessHistoryEl.firstChild);
}
function clearGuessHistory() { if (!guessHistoryEl) return; guessHistoryEl.innerHTML = ''; }

// time stats UI
function ensureTimeElements() {
  if (document.getElementById('fastestTime') && document.getElementById('avgTime')) return;
  const fastestEl = document.createElement('p'); fastestEl.id = 'fastestTime'; fastestEl.textContent = 'Fastest Time: -';
  const avgTimeEl = document.createElement('p'); avgTimeEl.id = 'avgTime'; avgTimeEl.textContent = 'Average Time: -';
  if (avgScore && avgScore.parentNode) {
    avgScore.parentNode.insertBefore(fastestEl, avgScore.nextSibling);
    avgScore.parentNode.insertBefore(avgTimeEl, fastestEl.nextSibling);
  } else {
    document.body.appendChild(fastestEl);
    document.body.appendChild(avgTimeEl);
  }
}
function updateTimeStats() {
  ensureTimeElements();
  const fastestEl = document.getElementById('fastestTime');
  const avgTimeEl = document.getElementById('avgTime');
  if (fastestEl) fastestEl.textContent = 'Fastest Time: ' + (fastestTimeMs ? formatMsReadable(fastestTimeMs) : '-');
  if (avgTimeEl) {
    const avgMs = gamesTimeCount > 0 ? (totalTimeMs / gamesTimeCount) : null;
    avgTimeEl.textContent = 'Average Time: ' + (avgMs ? formatMsReadable(avgMs) : '-');
  }
}

// round timer
function startRoundTimer() { roundStart = new Date().getTime(); }
function endRoundTimerAndRecord() {
  if (roundStart === null) return null;
  const now = new Date().getTime();
  const duration = now - roundStart;
  roundStart = null;
  timesArr.push(duration);
  totalTimeMs += duration;
  gamesTimeCount++;
  if (fastestTimeMs === null || duration < fastestTimeMs) fastestTimeMs = duration;
  updateTimeStats();
  return duration;
}

function getSelectedLevel() {
  for (let i = 0; i < levelArr.length; i++) if (levelArr[i].checked) return Number(levelArr[i].value);
  return level || 10;
}

function classifyScore(s) {
  if (s <= 1) return 'great';
  if (s <= 2) return 'good';
  if (s <= 4) return 'ok';
  if (s <= 7) return 'bad';
  return 'terrible';
}

// UI handlers
function onNameInput() {
  if (!nameInput) return;
  const val = nameInput.value.trim();
  const hasName = val !== '';
  if (hasName) {
    if (playerDisplay) playerDisplay.textContent = `Player: ${val}`;
    safeDisable(startBtn, false);
    safeDisable(playBtn, false);
    for (let i = 0; i < levelArr.length; i++) levelArr[i].disabled = false;
    if (nameMsgEl) nameMsgEl.textContent = `Welcome ${val}`;
  } else {
    if (playerDisplay) playerDisplay.textContent = '';
    safeDisable(startBtn, true);
    safeDisable(playBtn, true);
    safeDisable(guessBtn, true);
    if (guess) guess.disabled = true;
    for (let i = 0; i < levelArr.length; i++) levelArr[i].disabled = true;
    if (nameMsgEl) nameMsgEl.textContent = 'Please enter name to start';
  }
}

function handleStart(e) {
  e && e.preventDefault && e.preventDefault();
  if (!nameInput) return;
  const val = nameInput.value.trim();
  if (!val) { if (msg) msg.textContent = 'Please enter name to start'; return; }
  if (playerDisplay) playerDisplay.textContent = `Player: ${val}`;
  safeDisable(nameInput, true);
  safeDisable(startBtn, true);
  safeDisable(playBtn, false);
  for (let i = 0; i < levelArr.length; i++) levelArr[i].disabled = false;
  if (msg) msg.textContent = `Ready, ${val}. Select level or Play.`;
}

function play() {
  score = 0;
  clearGuessHistory();
  level = getSelectedLevel();
  safeDisable(playBtn, true);
  safeDisable(guessBtn, false);
  if (guess) { guess.disabled = false; guess.value = ''; guess.placeholder = 'e.g. ' + (Math.floor(Math.random() * level) + 1); guess.focus(); }
  if (giveUpBtn) giveUpBtn.disabled = false;
  for (let i = 0; i < levelArr.length; i++) levelArr[i].disabled = true;
  answer = Math.floor(Math.random() * level) + 1;
  if (msg) msg.textContent = `Guess a number from 1-${level}`;
  startRoundTimer();

  // reset tries display for new round
  if (triesNumberEl) triesNumberEl.textContent = '0';
  if (triesLabelEl) triesLabelEl.textContent = 'Tries';
}

function makeGuess(e) {
  e && e.preventDefault && e.preventDefault();
  if (!guess || !msg) return;
  const userGuess = parseInt(guess.value, 10);
  if (isNaN(userGuess) || userGuess < 1 || userGuess > level) { msg.textContent = 'Enter a valid number 1-' + level; return; }
  addGuessToHistory(userGuess);
  score++;
  // update tries display live
  if (triesNumberEl) triesNumberEl.textContent = score;
  if (triesLabelEl) triesLabelEl.textContent = (score === 1) ? 'try' : 'tries';

  const diff = Math.abs(userGuess - answer);
  if (diff === 0) {
    const durationMs = endRoundTimerAndRecord();
    const timeText = durationMs ? ` Time: ${formatMsReadable(durationMs)}.` : '';
    const playerName = (nameInput && nameInput.value) ? nameInput.value.trim() : 'Player';
    addToLeaderboard(playerName, durationMs || 0, score);
    if (msg) msg.textContent = `${userGuess} is correct!${timeText}`;
    updateScore();
    resetAfterRound();
    return;
  }
  const hotThreshold = Math.max(1, Math.floor(level * 0.10));
  const warmThreshold = Math.max(2, Math.floor(level * 0.25));
  const coldThreshold = Math.max(5, Math.floor(level * 0.50));
  let temp;
  if (diff <= hotThreshold) temp = 'hot';
  else if (diff <= warmThreshold) temp = 'warm';
  else if (diff <= coldThreshold) temp = 'cold';
  else temp = 'freezing';
  const highLow = userGuess > answer ? 'too high' : 'too low';
  if (msg) msg.textContent = `${userGuess} is ${highLow}! You're ${temp}. Try again.`;
  if (guess) guess.focus();
}

function handleGiveUp(e) {
  e && e.preventDefault && e.preventDefault();
  if (!msg) return;
  if (typeof answer === 'undefined' || answer === null) { if (msg) msg.textContent = 'Nothing to give up on right now.'; return; }
  const durationMs = endRoundTimerAndRecord();
  score = level || 0;
  addGuessToHistory(`Gave up — answer ${answer}`);
  const timeText = durationMs ? ` Time: ${formatMsReadable(durationMs)}.` : '';
  if (msg) msg.textContent = `You gave up. The answer was ${answer}. Your score is set to ${score}.${timeText}`;
  updateScore();
  resetAfterRound();
}

function resetAfterRound() {
  safeDisable(guessBtn, true);
  if (guess) { guess.disabled = true; guess.value = ''; guess.placeholder = ''; }
  if (giveUpBtn) giveUpBtn.disabled = true;
  safeDisable(playBtn, false);
  for (let i = 0; i < levelArr.length; i++) levelArr[i].disabled = false;
  answer = null;
  roundStart = null;
  if (nameInput) nameInput.disabled = false;

  if (triesNumberEl) triesNumberEl.textContent = '0';
  if (triesLabelEl) triesLabelEl.textContent = 'tries';
}

function updateScore() {
  scoreArr.push(score);
  if (wins) wins.textContent = 'Total wins: ' + scoreArr.length;
  let sum = 0;
  scoreArr.sort((a,b) => a - b);
  for (let i = 0; i < scoreArr.length; i++) sum += scoreArr[i];
  const avg = scoreArr.length ? (sum / scoreArr.length) : 0;
  if (avgScore) avgScore.textContent = 'Average Score: ' + avg.toFixed(2);
  updateTimeStats();

  // show tries number + label on separate lines
  if (triesNumberEl) triesNumberEl.textContent = score;
  if (triesLabelEl) triesLabelEl.textContent = (score === 1) ? 'try' : 'tries';

  if (msg) {
    const rating = classifyScore(score);
    msg.textContent = `Result: ${rating}.`;
  }
}

// live date/time
function updateTime() {
  const d = new Date();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const month = monthNames[d.getMonth()];
  const day = d.getDate();
  const suffix = (n) => {
    const tens = n % 100;
    if (tens >= 11 && tens <= 13) return 'th';
    switch (n % 10) { case 1: return 'st'; case 2: return 'nd'; case 3: return 'rd'; default: return 'th'; }
  };
  const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const full = `${month} ${day}${suffix(day)}, ${d.getFullYear()} ${timeStr}`;
  if (dateEl) dateEl.textContent = full;
}

// Enter key handling
if (nameInput) {
  nameInput.addEventListener('input', onNameInput);
  nameInput.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); if (startBtn && !startBtn.disabled) startBtn.click(); else handleStart(); }
  });
}
if (guess) {
  guess.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); if (guessBtn && !guessBtn.disabled) guessBtn.click(); else makeGuess(); }
  });
}

// Wire buttons
if (startBtn) startBtn.addEventListener('click', handleStart);
if (playBtn) playBtn.addEventListener('click', play);
if (guessBtn) guessBtn.addEventListener('click', makeGuess);
if (giveUpBtn) giveUpBtn.addEventListener('click', handleGiveUp);

// initial state
function lockUIBeforeName() {
  safeDisable(playBtn, true);
  safeDisable(guessBtn, true);
  if (guess) guess.disabled = true;
  safeDisable(startBtn, true);
  if (giveUpBtn) giveUpBtn.disabled = true;
  for (let i = 0; i < levelArr.length; i++) levelArr[i].disabled = true;
  if (nameMsgEl) nameMsgEl.textContent = 'Please enter name to start';
  if (msg) msg.textContent = ''; // keep main game message area clear
}
lockUIBeforeName();
if (nameInput && nameInput.value.trim() !== '') onNameInput();

// init persisted leaderboard and UI
loadLeaderboard();
renderLeaderboard();
updateTime();
setInterval(updateTime, 1000);

// expose minimal state for debugging
window.__gg_state = {
  times: () => timesArr.slice(),
  fastestMs: () => fastestTimeMs,
  avgMs: () => (gamesTimeCount ? totalTimeMs / gamesTimeCount : null)
};