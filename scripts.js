const UNLOCK_NAME = ['lorena', 'estefania']; // expected input, lowercase

// --- Matrix rain background ---
(function () {
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01+-=><{}[]';
  let cols, drops;

  function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / 13);
    drops = Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e05555';
    ctx.font = '13px JetBrains Mono, monospace';
    for (let i = 0; i < drops.length; i++) {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 13, drops[i] * 13);
      if (drops[i] * 13 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  init();
  setInterval(draw, 50);
  window.addEventListener('resize', init);
})();

// --- Page transitions ---
function goTo(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(id);
  target.classList.add('active');
  target.style.animation = 'none';
  void target.offsetWidth; // force reflow to restart animation
  target.style.animation = 'fadeUp 0.5s ease forwards';
  window.scrollTo(0, 0);
}

// --- Name gate ---
function tryEnter() {
  const val = document.getElementById('name-input').value.trim().toLowerCase();
  const errEl = document.getElementById('error-msg');
  const card = document.querySelector('#page-lock .card');

  if (UNLOCK_NAME.includes(val)) {
    errEl.classList.remove('show');
    goTo('page-roulette');
    buildRoulette();
  } else {
    errEl.classList.add('show');
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
  }
}

// --- Roulette ---
const OPTIONS = ['🎬  cine', '🍽  cena', '🏎  go karts', '🎨  pintura', '🏐  volleyball', '☕️ café', '🐾 zoo', '🎭 museo', '🏡 cabaña', '📺 ver series'];

let rouletteResult = null;
let spinning = false;
let currentIndex = 0;

const ITEM_H = 64;
const WIN_H = 192;  // visible height = 3 items
const REPEATS = 8;  // pool size to allow long spins without running out

function buildRoulette() {
  const track = document.getElementById('roulette-track');
  track.innerHTML = '';
  track.style.transition = 'none';

  const pool = [];
  for (let r = 0; r < REPEATS; r++) OPTIONS.forEach(o => pool.push(o));
  pool.forEach(o => {
    const div = document.createElement('div');
    div.className = 'roulette-item';
    div.textContent = o;
    track.appendChild(div);
  });

  currentIndex = OPTIONS.length * 2;
  applyPos(false);
}

function applyPos(animated, duration) {
  const track = document.getElementById('roulette-track');
  const offset = currentIndex * ITEM_H - (WIN_H / 2 - ITEM_H / 2);
  track.style.transition = animated
    ? `transform ${duration || 0.12}s cubic-bezier(0.25,0.46,0.45,0.94)`
    : 'none';
  track.style.transform = `translateY(-${offset}px)`;
  updateClasses();
}

function updateClasses() {
  document.querySelectorAll('.roulette-item').forEach((el, i) => {
    el.classList.remove('selected', 'near');
    if (i === currentIndex) el.classList.add('selected');
    else if (Math.abs(i - currentIndex) === 1) el.classList.add('near');
  });
}

function spinRoulette() {
  if (spinning) return;
  spinning = true;

  document.getElementById('spin-btn').disabled = true;
  document.getElementById('confirm-roulette-btn').style.display = 'none';
  document.getElementById('roulette-result').style.display = 'none';

  buildRoulette();

  const loops = 4 + Math.floor(Math.random() * 2);
  const extra = Math.floor(Math.random() * OPTIONS.length);
  const totalItems = OPTIONS.length * loops + extra;
  const targetIndex = currentIndex + totalItems;
  const spinDuration = 3.0 + Math.random() * 0.8;

  // Two rAF calls ensure transition is applied after the DOM settles
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      currentIndex = targetIndex;
      const offset = currentIndex * ITEM_H - (WIN_H / 2 - ITEM_H / 2);
      const track = document.getElementById('roulette-track');
      track.style.transition = `transform ${spinDuration}s cubic-bezier(0.12, 0.8, 0.3, 1.0)`;
      track.style.transform = `translateY(-${offset}px)`;

      const interval = setInterval(updateClasses, 60);
      setTimeout(() => {
        clearInterval(interval);
        updateClasses();
        endSpin();
      }, spinDuration * 1000 + 50);
    });
  });
}

function endSpin() {
  spinning = false;
  rouletteResult = OPTIONS[currentIndex % OPTIONS.length];
  document.getElementById('spin-btn').disabled = false;
  document.getElementById('confirm-roulette-btn').style.display = 'inline-flex';
}

function confirmRoulette() {
  if (!rouletteResult) return;
  const badge = document.getElementById('result-badge');
  badge.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> ${rouletteResult}`;
  document.getElementById('roulette-result').style.display = 'block';
  document.getElementById('confirm-roulette-btn').style.display = 'none';
  setTimeout(() => { buildTimePicker(); goTo('page-time'); }, 900);
}

// --- Time picker ---
const TIMES = ['3pm', '4pm','5pm', '6pm', '7pm', '8pm', '9pm'];
let selectedTime = null;

function buildTimePicker() {
  const container = document.getElementById('time-options');
  container.innerHTML = '';
  selectedTime = null;
  document.getElementById('confirm-time-btn').disabled = true;

  TIMES.forEach(t => {
    const div = document.createElement('div');
    div.className = 'time-option';
    div.innerHTML = `<div class="radio-dot"></div><span class="time-label">${t}</span>`;
    div.onclick = () => {
      document.querySelectorAll('.time-option').forEach(o => o.classList.remove('selected'));
      div.classList.add('selected');
      selectedTime = t;
      document.getElementById('confirm-time-btn').disabled = false;
    };
    container.appendChild(div);
  });
}

function confirmTime() {
  if (!selectedTime) return;
  document.getElementById('final-time-text').textContent = `${selectedTime}!`;
  goTo('page-final');
}

buildRoulette();