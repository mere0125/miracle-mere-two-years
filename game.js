const boardEl = document.querySelector('#board');
const rollButton = document.querySelector('#rollButton');
const diceEl = document.querySelector('#dice');
const statusText = document.querySelector('#statusText');
const turnHint = document.querySelector('#turnHint');
const toastEl = document.querySelector('#toast');

function startSnowfall() {
  const canvas = document.querySelector('#snowfall');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let flakes = [];

  const makeFlake = (fromTop = false) => ({
    x: Math.random() * width,
    y: fromTop ? -12 - Math.random() * height * .22 : Math.random() * height,
    radius: 1.8 + Math.random() * 3.2,
    speed: .18 + Math.random() * .34,
    drift: (Math.random() - .5) * .22,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: .006 + Math.random() * .012,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - .5) * .006,
    alpha: .22 + Math.random() * .36
  });

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.max(28, Math.min(76, Math.round((width * height) / 21000)));
    flakes = Array.from({ length: count }, () => makeFlake());
  };

  const drawFlake = flake => {
    ctx.save();
    ctx.translate(flake.x, flake.y);
    ctx.rotate(flake.rotation);
    ctx.strokeStyle = `rgba(255,255,255,${flake.alpha})`;
    ctx.lineWidth = Math.max(.55, flake.radius * .18);
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(255,255,255,.32)';
    ctx.shadowBlur = flake.radius * 1.4;
    for (let arm = 0; arm < 6; arm++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -flake.radius * 2.2);
      ctx.moveTo(0, -flake.radius * 1.25);
      ctx.lineTo(-flake.radius * .48, -flake.radius * 1.72);
      ctx.moveTo(0, -flake.radius * 1.25);
      ctx.lineTo(flake.radius * .48, -flake.radius * 1.72);
      ctx.stroke();
    }
    ctx.restore();
  };

  const frame = () => {
    ctx.clearRect(0, 0, width, height);
    flakes.forEach(flake => {
      if (!reduceMotion) {
        flake.sway += flake.swaySpeed;
        flake.x += flake.drift + Math.sin(flake.sway) * .08;
        flake.y += flake.speed;
        flake.rotation += flake.spin;
        if (flake.y > height + 16 || flake.x < -20 || flake.x > width + 20) Object.assign(flake, makeFlake(true));
      }
      drawFlake(flake);
    });
    if (!reduceMotion) requestAnimationFrame(frame);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  frame();
}

startSnowfall();

const LAST_SPACE = 51;
const giftSpaces = [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 46, 49, 51];
const gifts = [
  { sprite: 1, title: 'A little something warm', copy: 'A pair of warm socks, just for you.' },
  { sprite: 2, title: 'One drink date, on me', copy: 'Choose bubble tea, a smoothie, or whatever tastes like a good afternoon.' },
  { asset: 'assets/gift-eyeliner.png?v=20261009b', title: 'A little something for you', copy: 'You wanted this once, but never got it.' },
  { sprite: 3, title: 'An ice cream break', copy: 'One chocolate scoop, two spoons, and a sweet little break.' },
  { asset: 'assets/gift-matcha.png?v=20261009b', title: 'Something green for your next drink', copy: 'For the days when you want something other than coffee.' },
  { sprite: 4, title: 'To the moon and back', copy: 'A little moon scene with two explorers and one very important heart.' },
  { sprite: 7, title: 'A tiny mystery friend', copy: 'Small, black, collectible, and slightly magical. I am definitely not telling you what it is yet.' },
  { asset: 'assets/gift-pillow.png?v=20261009b', title: 'A softer place to sleep', copy: 'Something comfortable to help you rest a little better, especially when your nose bothers you.' },
  { sprite: 5, title: 'A sealed date in East Williamsburg', copy: 'Back to Montrose Ave, back to the first winter we had together. Only available from November 1.' },
  { sprite: 6, title: 'One hundred tiny proofs', copy: 'A book of ordinary seconds that made loving you feel extraordinary.' },
  { asset: 'assets/gift-matching-jeans.png?v=20261009b', title: 'Something black for both of us', copy: 'One black pair for you and one for me. The two word brand name stays secret for now.' },
  { sprite: 0, title: 'Press play on a little secret', copy: 'A tiny player holding three minutes that belong only to us.' },
  { sprite: 8, title: 'Words meant only for you', copy: 'No screen, no hints. Just a card you can keep.' },
  { sprite: 9, title: 'The big bow', copy: 'This clue is locked. Finish our road to discover what happens next.' }
];

const special = {
  2:  { type: 'choice', icon: '✋', label: 'HIGH 5', action: 'highfive' },
  6:  { type: 'choice', icon: '♫', label: 'DARE', action: 'dare' },
  7:  { type: 'cloud', icon: '↶', label: 'BACK 2', action: 'back', repeat: true },
  8:  { type: 'magic', icon: '☾', label: 'SHIELD', action: 'shield' },
  11: { type: 'choice', icon: '↗', label: 'ROUTE', action: 'route' },
  13: { type: 'gate', icon: '①', label: 'GATE', action: 'chapter1' },
  16: { type: 'choice', icon: '♥', label: 'SAY IT', action: 'compliment' },
  18: { type: 'cloud', icon: '☂', label: 'RAIN', action: 'rain' },
  21: { type: 'choice', icon: '?', label: 'QUICK', action: 'quiz' },
  23: { type: 'choice', icon: '◌', label: 'MEMORY', action: 'memory' },
  25: { type: 'cloud', icon: '☂', label: 'BACK 3', action: 'rain', repeat: true },
  26: { type: 'gate', icon: '②', label: 'GATE', action: 'chapter2' },
  27: { type: 'magic', icon: '☾', label: 'SHIELD', action: 'shield' },
  31: { type: 'choice', icon: '✿', label: 'PET', action: 'pet' },
  33: { type: 'choice', icon: '☁', label: 'FORTUNE', action: 'fortune' },
  36: { type: 'choice', icon: '♥', label: 'TOLL', action: 'kiss' },
  38: { type: 'cloud', icon: '↶', label: 'BACK 2', action: 'back', repeat: true },
  40: { type: 'cloud', icon: '☂', label: 'BACK 3', action: 'rain', repeat: true },
  41: { type: 'choice', icon: '♡', label: 'TRUTH', action: 'truth' },
  43: { type: 'choice', icon: '★', label: 'FORK', action: 'shortcut' },
  46: { type: 'choice', icon: '', label: 'POSE', action: 'pose' },
  47: { type: 'cloud', icon: '⌛', label: 'BACK 1', action: 'pause', repeat: true },
  48: { type: 'gate', icon: '③', label: 'GATE', action: 'chapter3' },
  49: { type: 'choice', icon: '☄', label: 'WISH', action: 'wish' },
  50: { type: 'cloud', icon: '↶', label: 'BACK 2', action: 'back', repeat: true }
};

const INTERLUDE_DECK = ['thisorthat','soundtrack','snapshot','objectmemory','tinyplan','softtruth','firstmemory','guessme','threewords','futurewish','petmimic','thankyou','photohunt','detailtest','drawtogether','fivefavorites','humguess','littlepromise','memorymenu','secretcode'];

let state = { position: 0, hearts: 0, shields: 0, found: new Set(), resolved: new Set(), pendingCards: [], finaleQueued: false, finalRevealed: false, busy: false, sound: false, musicTimer: null, guide: null, streak: 0, stamps: 0, turns: 0, interludeIndex: 0, turnHadDetour: false };
let audioCtx;
let crystalBus;

const iconDrawings = {
  start: '<path d="M12 2.8l2.7 5.6 6.1.8-4.4 4.3 1.1 6.1-5.5-2.9-5.5 2.9 1.1-6.1L3.2 9.2l6.1-.8z"/>',
  gift: '<path d="M4 10h16v11H4zM3 7h18v4H3zM12 7v14M12 7c-1.2-4.4-6.4-5.1-6.4-1.8 0 1.8 3 1.8 6.4 1.8zm0 0c1.2-4.4 6.4-5.1 6.4-1.8 0 1.8-3 1.8-6.4 1.8z"/>',
  bow: '<path d="M12 10C8 4 3 4.5 3.5 8.1 3.8 10.5 7 11.2 12 10zm0 0c4-6 9-5.5 8.5-1.9C20.2 10.5 17 11.2 12 10zM12 10v9m0-9-5 8m5-8 5 8"/>',
  heart: '<path d="M12 20S3.5 15.1 3.5 8.8C3.5 4 9.3 3 12 7c2.7-4 8.5-3 8.5 1.8C20.5 15.1 12 20 12 20z"/>',
  sparkle: '<path d="M12 2.5c.8 5.7 2.1 8.1 7.5 9.5-5.4 1.4-6.7 3.8-7.5 9.5-.8-5.7-2.1-8.1-7.5-9.5 5.4-1.4 6.7-3.8 7.5-9.5z"/>',
  music: '<path d="M9 18V6l10-2v12M9 9l10-2M9 18c0 2-5 2.5-5 0s5-3 5 0zm10-2c0 2-5 2.5-5 0s5-3 5 0z"/>',
  arrow: '<path d="M4 17c4-7 8-8 15-8m-4-4 4 4-4 4"/>',
  cloud: '<path d="M6 18h12a4 4 0 0 0 .5-8A6.5 6.5 0 0 0 6 9.5 4.3 4.3 0 0 0 6 18z"/>',
  moon: '<path d="M17.5 18.2A8 8 0 0 1 8.1 5a8.3 8.3 0 1 0 9.4 13.2z"/>',
  paw: '<path d="M8.2 10.2c-1.8.2-2.8-3.4-.8-4.1 1.8-.6 2.5 3.8.8 4.1zm7.6 0c1.8.2 2.8-3.4.8-4.1-1.8-.6-2.5 3.8-.8 4.1zM5.7 14c-1.7.6-3.2-2.5-1.5-3.5 1.5-.9 3.1 2.9 1.5 3.5zm12.6 0c1.7.6 3.2-2.5 1.5-3.5-1.5-.9-3.1 2.9-1.5 3.5zM12 12c-3.3 0-6 4.5-4.3 6.6 1.4 1.7 3-.1 4.3-.1s2.9 1.8 4.3.1C18 16.5 15.3 12 12 12z"/>',
  question: '<path d="M8.4 8.2c.4-5.1 8.3-5.4 8.3-.3 0 3.5-4.7 3.1-4.7 7m0 4.2v.2"/>',
  rain: '<path d="M5 13h14M7 16l-1 3m6-3-1 3m6-3-1 3M5 12a5 5 0 0 1 9.7-1.7A4 4 0 0 1 19 14H5"/>',
  hourglass: '<path d="M7 3h10M7 21h10M8 3c0 5 1.8 6.2 4 9-2.2 2.8-4 4-4 9m8-18c0 5-1.8 6.2-4 9 2.2 2.8 4 4 4 9"/>',
  stamp: '<path d="M12 3v4m-5 5a5 5 0 0 1 10 0c0 2 1.5 3.2 2 5H5c.5-1.8 2-3 2-5zm-3 7h16v2H4z"/>',
  lips: '<path d="M3.5 12c3-1 5-5 8.5-2 3.5-3 5.5 1 8.5 2-3 6-14 6-17 0zm0 0h17"/>',
  smile: '<path d="M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0zm4-2h.1m7.8 0h.1M8 15c2.4 2 5.6 2 8 0"/>'
};

function drawnIcon(name) {
  const paths = iconDrawings[name] || iconDrawings.heart;
  return `<svg class="doodle-icon" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
}

function iconNameFor(i, data, isGift) {
  if (i === 0) return 'start';
  if (i === LAST_SPACE) return 'gift';
  if (isGift) return 'bow';
  const map = { highfive:'heart', dare:'music', boost:'sparkle', route:'arrow', chapter1:'stamp', chapter2:'stamp', chapter3:'stamp', compliment:'heart', rain:'rain', quiz:'question', memory:'heart', shield:'moon', pet:'paw', fortune:'cloud', kiss:'lips', back:'arrow', truth:'heart', shortcut:'sparkle', pose:'smile', pause:'hourglass', wish:'sparkle' };
  return data ? map[data.action] || 'heart' : null;
}

function makeBoard() {
  const pathCells = [];
  for (let x = 13; x >= 0; x--) pathCells.push([x, 10]);
  for (let y = 9; y >= 0; y--) pathCells.push([0, y]);
  for (let x = 1; x <= 13; x++) pathCells.push([x, 0]);
  for (let y = 1; y <= 8; y++) pathCells.push([13, y]);
  for (let x = 12; x >= 6; x--) pathCells.push([x, 8]);
  for (let i = 0; i <= LAST_SPACE; i++) {
    const tile = document.createElement('div');
    const isGift = giftSpaces.includes(i);
    const data = special[i];
    tile.className = `tile ${i === 0 ? 'start' : i === LAST_SPACE ? 'finish' : isGift ? 'gift' : data?.type || 'normal'}`;
    tile.dataset.index = i;
    tile.setAttribute('role', 'gridcell');
    const [x, y] = pathCells[i];
    tile.style.gridColumn = String(x + 1);
    tile.style.gridRow = String(y + 1);
    const iconName = iconNameFor(i, data, isGift);
    const icon = iconName ? drawnIcon(iconName) : '';
    const label = i === 0 ? 'START' : i === LAST_SPACE ? 'FINISH' : isGift ? `CLUE ${giftSpaces.indexOf(i) + 1}` : data?.label || '';
    tile.innerHTML = `<span class="tile-number">${String(i + 1).padStart(2,'0')}</span><span class="tile-icon">${icon}</span><span class="tile-label">${label}</span>`;
    boardEl.appendChild(tile);
  }
  renderPawn();
}

function renderPawn() {
  document.querySelectorAll('.tile.current').forEach(t => t.classList.remove('current'));
  document.querySelector('.pawn')?.remove();
  const tile = document.querySelector(`.tile[data-index="${state.position}"]`);
  tile.classList.add('current');
  const pawn = document.createElement('span');
  pawn.className = 'pawn'; pawn.textContent = '♥'; pawn.setAttribute('aria-label', 'Miracle and Mere game piece');
  tile.appendChild(pawn);
  const pct = Math.round(state.position / LAST_SPACE * 100);
  document.querySelector('#progressBar').style.width = `${pct}%`;
  document.querySelector('#progressText').textContent = `${state.position} / ${LAST_SPACE}`;
  const chapter = Math.min(4, Math.floor(state.position / 13) + 1);
  document.querySelector('#chapterNumber').textContent = chapter;
  document.querySelector('#chapterTitle').textContent = ['The little beginning','Everyday magic','Our favorite detours','Still choosing you'][chapter - 1];
  document.querySelector('#heartCount').textContent = state.hearts;
  document.querySelector('#shieldCount').textContent = state.shields;
  document.querySelector('#giftCount').textContent = state.found.size;
  document.querySelector('#drawerCount').textContent = `${state.found.size} / ${gifts.length}`;
  document.querySelector('#streakCount').textContent = `${state.streak} / 3`;
  document.querySelector('#stampCount').textContent = `${state.stamps} / 3`;
  document.querySelector('#guideName').textContent = ({ happy: 'Happy Paw', tie: 'Tie Buddy', cat: 'Boss Cat' })[state.guide] || 'choose';
}

function makeClueDrawer() {
  const drawer = document.querySelector('#miniClues');
  giftSpaces.forEach((_, i) => {
    const item = document.createElement('button');
    item.type = 'button'; item.className = 'mini-clue'; item.textContent = String(i + 1).padStart(2, '0');
    item.title = `Clue ${i + 1}`; item.disabled = true;
    item.setAttribute('aria-label', `Clue ${i + 1}, not collected yet`);
    item.addEventListener('click', () => { if (state.found.has(i)) showGiftCard(i); });
    drawer.appendChild(item);
  });
}

function spritePosition(index) {
  const col = index % 5;
  const row = Math.floor(index / 5);
  return `${col * 25}% ${row * 100}%`;
}

function applyGiftArt(element, gift) {
  if (gift.asset) {
    element.style.backgroundImage = `url("${gift.asset}")`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
    return;
  }
  element.style.backgroundImage = 'url("assets/gift-clues.png?v=20261009b")';
  element.style.backgroundSize = '500% 200%';
  element.style.backgroundPosition = spritePosition(gift.sprite);
}

function initAudio() {
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function tone(freq, start, duration, type='sine', volume=.045) {
  if (!state.sound) return;
  initAudio();
  const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
  osc.type = type; osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, audioCtx.currentTime + start);
  gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + start + .02);
  gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + start + duration);
  osc.connect(gain).connect(audioCtx.destination); osc.start(audioCtx.currentTime + start); osc.stop(audioCtx.currentTime + start + duration + .05);
}

function getCrystalBus() {
  if (crystalBus) return crystalBus;
  initAudio();
  const input = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  const dry = audioCtx.createGain();
  const delay = audioCtx.createDelay(.8);
  const feedback = audioCtx.createGain();
  const echo = audioCtx.createGain();
  filter.type = 'lowpass'; filter.frequency.value = 1800; filter.Q.value = .15;
  dry.gain.value = .58; delay.delayTime.value = .24; feedback.gain.value = .075; echo.gain.value = .065;
  input.connect(filter); filter.connect(dry).connect(audioCtx.destination);
  filter.connect(delay); delay.connect(feedback).connect(delay); delay.connect(echo).connect(audioCtx.destination);
  crystalBus = input;
  return crystalBus;
}

function diceSound() { [210,170,250,190,290].forEach((f,i) => tone(f, i*.055, .09, 'triangle', .06)); tone(640,.34,.18,'sine',.055); }
function stepSound(i) { tone(320 + (i % 5) * 45, 0, .08, 'sine', .028); }
function sparkleSound() { [523,659,784].forEach((f,i) => tone(f, i*.09, .35, 'sine', .05)); }

function musicBoxNote(freq, start, duration=1.02, volume=.0105) {
  if (!state.sound || !freq) return;
  initAudio();
  const when = audioCtx.currentTime + start;
  const bus = getCrystalBus();
  [[1, volume], [2, volume * .038], [.5, volume * .12]].forEach(([ratio, level], index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = index === 1 ? 'triangle' : 'sine';
    osc.frequency.value = freq * ratio;
    gain.gain.setValueAtTime(.0001, when);
    gain.gain.exponentialRampToValueAtTime(level, when + .018 + index * .008);
    gain.gain.exponentialRampToValueAtTime(.0001, when + duration);
    osc.connect(gain).connect(bus); osc.start(when); osc.stop(when + duration + .05);
  });
}

function musicTick() {
  const bars = [
    { melody: [293.7,329.6,392,440,493.9,440,392,329.6], bass: [146.8,220] },
    { melody: [440,493.9,587.3,493.9,440,392,329.6,null], bass: [220,246.9] },
    { melody: [392,440,493.9,587.3,493.9,440,392,329.6], bass: [196,246.9] },
    { melody: [329.6,392,440,493.9,440,392,329.6,293.7], bass: [164.8,220] },
    { melody: [293.7,440,493.9,587.3,440,392,329.6,440], bass: [146.8,220] },
    { melody: [392,493.9,587.3,659.3,587.3,493.9,440,392], bass: [196,246.9] },
    { melody: [440,493.9,587.3,440,392,329.6,293.7,329.6], bass: [220,196] },
    { melody: [293.7,329.6,392,440,392,329.6,293.7,null], bass: [146.8,220] }
  ];
  let bar = 0;
  clearInterval(state.musicTimer);
  const playBar = () => {
    if (!state.sound) return;
    const phrase = bars[bar % bars.length];
    phrase.melody.forEach((note, i) => musicBoxNote(note, i * .30, .98, i === 0 ? .0125 : .0105));
    phrase.bass.forEach((note, i) => musicBoxNote(note, i * 1.20, 1.75, .0041));
    bar++;
  };
  playBar();
  state.musicTimer = setInterval(() => {
    playBar();
  }, 2400);
}

function setDice(value) { diceEl.dataset.value = value; diceEl.setAttribute('aria-label', `Dice showing ${value}`); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

function updateRollButton() {
  if (state.finalRevealed) {
    rollButton.querySelector('span').textContent = 'OUR STORY CONTINUES';
    rollButton.querySelector('small').textContent = 'the rest is waiting in real life';
    rollButton.disabled = true;
    return;
  }
  const hasCard = state.pendingCards.length > 0;
  rollButton.querySelector('span').textContent = hasCard ? 'OPEN NEXT CARD' : 'ROLL THE DICE';
  rollButton.querySelector('small').textContent = hasCard ? 'when you are ready' : 'tap or press space';
  rollButton.disabled = state.busy;
}

async function showNextPendingCard() {
  const card = state.pendingCards.shift();
  if (!card) return;
  if (card.type === 'gift') await showGiftCard(card.index);
  if (card.type === 'space') await resolveSpace(card.position);
  if (card.type === 'interlude') await showInterlude();
  if (card.type === 'finale') {
    document.querySelector('#finaleDialog').showModal(); sparkleSound(); confetti();
  }
}

async function handlePrimaryAction() {
  if (state.busy || state.finalRevealed) return;
  if (!state.pendingCards.length) return roll();
  state.busy = true; updateRollButton();
  await showNextPendingCard();
  if (state.turnHadDetour) { state.streak = 0; state.turnHadDetour = false; renderPawn(); }
  state.busy = false; updateRollButton();
  statusText.textContent = state.pendingCards.length ? 'One more card is waiting. Open it when you are ready.' : 'The path is ready whenever you are.';
}

async function roll() {
  if (state.busy || state.pendingCards.length) return;
  state.busy = true; updateRollButton(); diceEl.classList.add('rolling'); diceSound();
  let value = 1;
  for (let i = 0; i < 8; i++) { value = Math.floor(Math.random() * 6) + 1; setDice(value); await sleep(55); }
  diceEl.classList.remove('rolling');
  statusText.textContent = `You rolled ${value}. Follow the stitched path.`;
  state.turns++;
  const start = state.position;
  const crossedSpecials = [];
  let target = start + value;
  if (target > LAST_SPACE) { target = LAST_SPACE - (target - LAST_SPACE); showToast('Extra steps take you back along the path.'); }
  const queuedInterludes = state.pendingCards.filter(card => card.type === 'interlude').length;
  const storyCardsLeft = INTERLUDE_DECK.length - state.interludeIndex - queuedInterludes;
  if (target === LAST_SPACE && storyCardsLeft > 0) {
    target = LAST_SPACE - 4;
    showToast('The final bow waits until every little card is finished.');
  }
  const direction = target >= start ? 1 : -1;
  for (let p = start + direction; direction > 0 ? p <= target : p >= target; p += direction) {
    state.position = p; renderPawn(); stepSound(p); await sleep(230);
    if (giftSpaces.includes(p)) await collectGift(giftSpaces.indexOf(p));
    if (special[p] && !special[p].repeat && !state.resolved.has(p) && !crossedSpecials.includes(p)) crossedSpecials.push(p);
  }
  state.turnHadDetour = false;
  crossedSpecials.forEach(position => state.pendingCards.push({ type: 'space', position }));
  if (special[state.position]?.repeat) state.pendingCards.push({ type: 'space', position: state.position });
  if (state.position !== LAST_SPACE && state.interludeIndex < INTERLUDE_DECK.length) {
    const cardsThisTurn = state.turns % 3 === 0 ? 2 : 1;
    const alreadyQueued = state.pendingCards.filter(card => card.type === 'interlude').length;
    const remaining = INTERLUDE_DECK.length - state.interludeIndex - alreadyQueued;
    for (let i = 0; i < Math.min(cardsThisTurn, remaining); i++) state.pendingCards.push({ type: 'interlude' });
  }
  if (state.turnHadDetour) state.streak = 0;
  else if (state.position !== LAST_SPACE) {
    state.streak++;
    if (state.streak >= 3) {
      state.streak = 0; state.shields++; renderPawn(); sparkleSound();
      showToast('Three smooth turns: +1 moon shield');
    }
  }
  if (state.position === LAST_SPACE && state.found.size === gifts.length && state.interludeIndex >= INTERLUDE_DECK.length && !state.finaleQueued) {
    state.pendingCards.push({ type: 'finale' }); state.finaleQueued = true;
  }
  if (state.pendingCards.length) await showNextPendingCard();
  if (state.turnHadDetour) { state.streak = 0; state.turnHadDetour = false; renderPawn(); }
  turnHint.textContent = state.hearts >= 3 ? 'You have enough sparks to cancel one detour.' : 'Three heart sparks can cancel a detour.';
  statusText.textContent = state.pendingCards.length ? 'One more card is waiting. Open it when you are ready.' : 'The path is ready whenever you are.';
  state.busy = false; updateRollButton();
}

async function collectGift(index) {
  if (state.found.has(index)) return;
  state.found.add(index);
  const drawerItem = document.querySelectorAll('.mini-clue')[index];
  drawerItem.classList.add('found'); drawerItem.disabled = false;
  applyGiftArt(drawerItem, gifts[index]);
  drawerItem.setAttribute('aria-label', `Open clue ${index + 1}: ${gifts[index].title}`);
  renderPawn(); sparkleSound();
  state.pendingCards.push({ type: 'gift', index });
  showToast('A new clue card is waiting');
}

async function showGiftCard(index) {
  document.querySelector('#giftNumber').textContent = String(index + 1).padStart(2,'0');
  document.querySelector('#giftTitle').textContent = gifts[index].title;
  document.querySelector('#giftCopy').textContent = gifts[index].copy;
  applyGiftArt(document.querySelector('#giftSprite'), gifts[index]);
  const dialog = document.querySelector('#giftDialog'); dialog.showModal();
  await waitDialog(dialog, '#giftKeep', '#giftClose');
}

function waitDialog(dialog, ...selectors) {
  return new Promise(resolve => {
    const close = () => { dialog.close(); selectors.forEach(s => document.querySelector(s).removeEventListener('click', close)); resolve(); };
    selectors.forEach(s => document.querySelector(s).addEventListener('click', close, { once: true }));
  });
}

async function resolveSpace(pos) {
  const data = special[pos]; if (!data) return;
  if (!data.repeat && state.resolved.has(pos)) {
    showToast(data.action === 'kiss' ? 'Toll already paid. Free passage!' : 'This page already has your stamp.');
    return;
  }
  if (!data.repeat) state.resolved.add(pos);
  if (data.action.startsWith('chapter')) return showChapterGate(Number(data.action.at(-1)));
  if (['dare','route','compliment','quiz','memory','pet','fortune','truth','shortcut','kiss','pose','wish'].includes(data.action)) return showChoice(data.action);
  if (data.action === 'highfive') {
    gainHearts(1);
    await showEvent('High five checkpoint', 'One proper high five before the journey continues. No tiny polite ones allowed.', '✋');
    return;
  }
  if (data.action === 'shield') {
    state.shields++; renderPawn();
    await showEvent('Moonlight pass', 'One moon shield is tucked into your pocket. It blocks the next rainy detour.', '☾');
    return;
  }
  if (data.action === 'rain' || data.action === 'back' || data.action === 'pause') {
    if (state.shields > 0) {
      state.shields--; renderPawn();
      await showEvent('Shielded by moonlight', 'The detour tried. The moon said no.', '☾');
      return;
    }
    let steps = data.action === 'back' ? 2 : data.action === 'pause' ? 1 : 3;
    if (state.guide === 'happy') steps = Math.max(1, steps - 1);
    if (state.hearts >= 3 && await offerSparkShield(steps)) return;
    state.turnHadDetour = true;
    await showEvent('A tiny detour', `Not every lovely story takes the straight road. Drift back ${steps} ${steps === 1 ? 'space' : 'spaces'}.`, '☂');
    await moveExtra(-steps);
    return;
  }
  return;
}

async function moveExtra(delta) {
  const target = Math.max(0, Math.min(LAST_SPACE, state.position + delta));
  const dir = Math.sign(delta);
  for (let p = state.position + dir; dir > 0 ? p <= target : p >= target; p += dir) {
    state.position = p; renderPawn(); stepSound(p); await sleep(180);
    if (dir > 0 && giftSpaces.includes(p)) await collectGift(giftSpaces.indexOf(p));
    if (dir > 0 && special[p] && !special[p].repeat && !state.resolved.has(p) && !state.pendingCards.some(card => card.type === 'space' && card.position === p)) {
      state.pendingCards.push({ type: 'space', position: p });
    }
  }
}

function gainHearts(amount) {
  const guideBonus = state.guide === 'cat' ? 1 : 0;
  const total = amount + guideBonus;
  state.hearts += total;
  renderPawn(); sparkleSound();
  return total;
}

function showEvent(title, copy, icon='♥') {
  const dialog = document.querySelector('#eventDialog');
  document.querySelector('#eventTitle').textContent = title;
  document.querySelector('#eventCopy').textContent = copy;
  document.querySelector('#eventIcon').textContent = icon;
  document.querySelector('#eventChoices').innerHTML = '';
  document.querySelector('#eventContinue').hidden = false;
  dialog.showModal();
  return waitDialog(dialog, '#eventContinue', '#eventClose');
}

async function showChapterGate(chapter) {
  const gates = {
    1: { title: 'Chapter one stamp', copy: 'Together, name one tiny detail you both remember from your beginning.', icon: '①' },
    2: { title: 'Same answer checkpoint', copy: 'Count to three and both say what kind of food you want to have next time. Did you say the same thing?', icon: '②' },
    3: { title: 'One thing I noticed', copy: 'Each say one small thing the other person did recently that made you feel loved.', icon: '③' }
  };
  const gate = gates[chapter];
  await showEvent(gate.title, gate.copy, gate.icon);
  state.stamps++;
  if (state.guide === 'tie') state.shields++;
  gainHearts(2);
  renderPawn();
  showToast(state.guide === 'tie' ? 'Stamp added, plus a Tie Buddy shield' : 'Chapter stamp added');
}

function showInterlude() {
  const kind = INTERLUDE_DECK[state.interludeIndex % INTERLUDE_DECK.length];
  state.interludeIndex++;
  return showChoice(kind);
}

function showChoice(kind) {
  const dialog = document.querySelector('#eventDialog'); const row = document.querySelector('#eventChoices');
  const content = {
    dare: { title: 'Five second challenge', copy: 'Pick one before the countdown in your head reaches five.', icon: '♫', options: [
      { label: 'Sing the first song that comes to mind', hearts: 2 },
      { label: 'Dance for ten seconds', hearts: 2 }
    ]},
    route: { title: 'Choose the next little route', copy: 'Safe and sweet, or a shortcut with a surprise?', icon: '↗', options: [
      { label: 'Cozy route: stay here and take 2 sparks', hearts: 2 },
      { label: 'Adventure route: move ahead 1 space', move: 1 }
    ]},
    compliment: { title: 'Lightning round', copy: 'No overthinking. Pick one and do it now.', icon: '♥', options: [
      { label: 'Say one thing you love about us', hearts: 2 },
      { label: 'Give me a ten second hug', hearts: 3 }
    ]},
    quiz: { title: 'A very serious question', copy: 'Who is most likely to steal the blanket?', icon: '?', options: [
      { label: 'Miracle', hearts: 2 }, { label: 'Mere', hearts: 2 }, { label: 'Sai', hearts: 2 }, { label: 'All, obviously', hearts: 3 }
    ]},
    memory: { title: 'Memory flash', copy: 'Choose one tiny story to tell out loud.', icon: '◌', options: [
      { label: 'The first moment you felt at home with me', hearts: 3 },
      { label: 'One ordinary day you would happily relive', hearts: 3 }
    ]},
    pet: { title: 'Pet guide checkpoint', copy: 'Who is secretly running this entire household?', icon: '✿', options: [
      { label: 'The happy paw', hearts: 2 }, { label: 'The one with the tie', hearts: 2 }, { label: 'The unimpressed cat', hearts: 3 }
    ]},
    fortune: { title: 'Choose a pet card', copy: 'Pick one. Each card gives you something different.', icon: '☁', options: [
      { label: 'Paw card', hearts: 2 }, { label: 'Blue card', shield: 1 }, { label: 'Cat card', hearts: 3 }
    ]},
    truth: { title: 'A tiny truth', copy: 'Choose the sentence you want to keep.', icon: '♡', options: [
      { label: 'I would find you again.', hearts: 3 },
      { label: 'Ordinary days are my favorite with you.', hearts: 3 }
    ]},
    shortcut: { title: 'A secret fork in the road', copy: 'Spend a little love, or take the long way?', icon: '★', options: [
      { label: 'Spend 2 sparks and move ahead 2', cost: 2, move: 2 },
      { label: 'Keep every spark and stay on course', hearts: 1 }
    ]},
    kiss: { title: 'Toll booth', copy: 'One payment opens the gate, and the receipt lasts for the whole game.', icon: '♥', options: [
      { label: 'Pay one kiss', hearts: 3 }, { label: 'Pay two forehead kisses', hearts: 4 }
    ]},
    pose: { title: 'Photo booth pose', copy: 'Choose a pose and hold it together for five seconds.', icon: '☺', options: [
      { label: 'Make a heart together', hearts: 4 }, { label: 'Copy one of our old photos', hearts: 4 }
    ]},
    wish: { title: 'A cozy winter plan', copy: 'Winter is coming. Pick one cozy thing for us to do at home.', icon: '☄', options: [
      { label: 'Bake something together', hearts: 3 },
      { label: 'Make something by hand', hearts: 3 },
      { label: 'Cook a new kind of food at home', hearts: 4 },
      { label: 'Try something we have never experienced before', hearts: 4 }
    ]},
    thisorthat: { title: 'This or that', copy: 'Choose quickly. No explaining until after you pick.', icon: '↔', options: [
      { label: 'A bookstore afternoon', hearts: 2 }, { label: 'A slow breakfast outside', hearts: 2 }
    ]},
    soundtrack: { title: 'Our soundtrack', copy: 'Name the first song that reminds you of us.', icon: '♫', options: [
      { label: 'I have one. Play it later.', hearts: 3 }, { label: 'We need to choose one together.', hearts: 2 }
    ]},
    snapshot: { title: 'Invisible camera', copy: 'If you could keep one unphotographed moment of us, which one would it be?', icon: '▣', options: [
      { label: 'Tell the whole story', hearts: 4 }, { label: 'Give only one mysterious clue', hearts: 2 }
    ]},
    objectmemory: { title: 'Find a little memory', copy: 'Pick one thing nearby that reminds you of a moment together.', icon: '✦', options: [
      { label: 'Tell the whole memory', hearts: 4 }, { label: 'Let the other person guess', hearts: 4 }
    ]},
    tinyplan: { title: 'A tiny plan', copy: 'Pick our next simple date.', icon: '○', options: [
      { label: 'Shu Jiao Fu Zhou night', hearts: 3 },
      { label: 'A cozy movie at home', hearts: 2 },
      { label: 'Dealer’s choice', hearts: 3 },
      { label: 'Drinks at a jazz bar', hearts: 3 }
    ]},
    softtruth: { title: 'Soft truth', copy: 'Finish this sentence out loud: I feel most loved when you…', icon: '♡', options: [
      { label: 'Say it in one sentence', hearts: 3 }, { label: 'Whisper it', hearts: 4 }
    ]},
    firstmemory: { title: 'Go back for a moment', copy: 'Choose one memory and tell it from the beginning.', icon: '◌', options: [
      { label: 'The first time I felt safe with you', hearts: 4 },
      { label: 'A normal day I still remember clearly', hearts: 3 }
    ]},
    guessme: { title: 'Guess my answer', copy: 'Choose a question. Answer for the other person, then check if you were right.', icon: '?', options: [
      { label: 'What drink would I order today?', hearts: 3 },
      { label: 'Which pet would I take on a trip?', hearts: 3 },
      { label: 'What snack would make me happy now?', hearts: 3 },
      { label: 'What movie do I want to watch right now?', hearts: 3 }
    ]},
    threewords: { title: 'Only three words', copy: 'Describe the other person using only three words.', icon: '♡', options: [
      { label: 'Sweet three words', hearts: 3 },
      { label: 'Funny three words', hearts: 4 }
    ]},
    futurewish: { title: 'Before our next anniversary', copy: 'Choose one small thing you want us to do together.', icon: '☆', options: [
      { label: 'Go somewhere new', hearts: 3 },
      { label: 'Learn something together', hearts: 3 },
      { label: 'Make a new little tradition', hearts: 4 },
      { label: 'Choose one sport and keep doing it together', hearts: 4 }
    ]},
    petmimic: { title: 'Pet acting game', copy: 'One person acts like one member of our pet family. The other person has to guess.', icon: '✿', options: [
      { label: 'Guessed on the first try', hearts: 4 },
      { label: 'Needed one more clue', hearts: 3 }
    ]},
    thankyou: { title: 'A small thank you', copy: 'Say thank you for one very small thing the other person does.', icon: '♥', options: [
      { label: 'Say it now', hearts: 4 },
      { label: 'Save it for the card later', hearts: 2 }
    ]},
    photohunt: { title: 'Photo hunt', copy: 'Open your photos and find the oldest picture of us you can reach in thirty seconds.', icon: '▣', options: [
      { label: 'Found one', hearts: 4 },
      { label: 'Found something even better', hearts: 5 }
    ]},
    detailtest: { title: 'Little detail test', copy: 'Without checking, both say what the other person ordered on your last food date.', icon: '?', options: [
      { label: 'Our answers matched', hearts: 5 },
      { label: 'We remembered it differently', hearts: 3 }
    ]},
    drawtogether: { title: 'Draw it together', copy: 'Use one finger each and draw a heart in the air at the same time.', icon: '♡', options: [
      { label: 'It looked like a heart', hearts: 4 },
      { label: 'It became something else', hearts: 5 }
    ]},
    fivefavorites: { title: 'Five quick favorites', copy: 'Take turns naming five small things you like doing together.', icon: '⑤', options: [
      { label: 'We named all five', hearts: 5 },
      { label: 'We kept going after five', hearts: 6 }
    ]},
    humguess: { title: 'Guess the song', copy: 'Sing a few words from a song that reminds you of us. The other person gets one guess.', icon: '♫', options: [
      { label: 'Guessed it', hearts: 5 },
      { label: 'Give one more clue', hearts: 4 }
    ]},
    littlepromise: { title: 'One little promise', copy: 'Make one small promise for the week after our anniversary.', icon: '♡', options: [
      { label: 'Say it out loud', hearts: 5 },
      { label: 'Write it in your phone', hearts: 5 }
    ]},
    memorymenu: { title: 'Memory menu', copy: 'Choose one kind of memory and tell the first story that comes to mind.', icon: '◌', options: [
      { label: 'A food memory', hearts: 4 },
      { label: 'A travel memory', hearts: 4 },
      { label: 'A quiet home memory', hearts: 5 },
      { label: 'One of our “fights”', hearts: 5 }
    ]},
    secretcode: { title: 'Make a secret code', copy: 'Choose a normal word that will secretly mean I love you for the rest of tonight.', icon: '✦', options: [
      { label: 'We picked one', hearts: 5 },
      { label: 'We already have one', hearts: 6 }
    ]}
  }[kind];
  document.querySelector('#eventTitle').textContent = content.title; document.querySelector('#eventCopy').textContent = content.copy;
  document.querySelector('#eventIcon').textContent = content.icon; row.innerHTML = '';
  document.querySelector('#eventContinue').hidden = true;
  return new Promise(resolve => {
    content.options.forEach(option => {
      const b = document.createElement('button'); b.textContent = option.label;
      if (option.cost && state.hearts < option.cost) { b.disabled = true; b.title = `You need ${option.cost} heart sparks`; }
      b.onclick = async () => {
        if (option.cost) state.hearts -= option.cost;
        let earned = 0;
        if (option.hearts) earned = gainHearts(option.hearts);
        if (option.shield) { state.shields += option.shield; renderPawn(); sparkleSound(); }
        dialog.close();
        if (earned) showToast(`+${earned} heart sparks`);
        if (option.shield) showToast('+1 moon shield');
        if (option.move) await moveExtra(option.move);
        resolve();
      };
      row.appendChild(b);
    });
    const skip = () => { if (dialog.open) dialog.close(); resolve(); };
    document.querySelector('#eventClose').addEventListener('click', skip, { once: true });
    dialog.showModal();
  });
}

function offerSparkShield(steps) {
  const dialog = document.querySelector('#eventDialog'); const row = document.querySelector('#eventChoices');
  document.querySelector('#eventTitle').textContent = 'A detour is coming';
  document.querySelector('#eventCopy').textContent = `Spend 3 Heart Sparks to stay here, or drift back ${steps} ${steps === 1 ? 'space' : 'spaces'}.`;
  document.querySelector('#eventIcon').textContent = '☂'; document.querySelector('#eventContinue').hidden = true; row.innerHTML = '';
  return new Promise(resolve => {
    [['Spend 3 sparks and block it', true], ['Save my sparks and take the detour', false]].forEach(([label, block]) => {
      const b = document.createElement('button'); b.textContent = label;
      b.onclick = () => { if (block) { state.hearts -= 3; renderPawn(); sparkleSound(); showToast('Detour cancelled'); } dialog.close(); resolve(block); };
      row.appendChild(b);
    });
    const skip = () => { if (dialog.open) dialog.close(); resolve(false); };
    document.querySelector('#eventClose').addEventListener('click', skip, { once: true });
    dialog.showModal();
  });
}

function showToast(message) { toastEl.textContent = message; toastEl.classList.add('show'); clearTimeout(showToast.t); showToast.t = setTimeout(() => toastEl.classList.remove('show'), 1800); }

function confetti() {
  const box = document.querySelector('#confetti'); const colors = ['#ff6f61','#ffc94b','#2aa7a0','#77c5e9','#ffb5bd'];
  for (let i = 0; i < 80; i++) { const bit = document.createElement('i'); bit.style.left = `${Math.random()*100}%`; bit.style.background = colors[i%colors.length]; bit.style.animationDelay = `${Math.random()*.8}s`; bit.style.transform = `rotate(${Math.random()*180}deg)`; box.appendChild(bit); setTimeout(() => bit.remove(), 3400); }
}

document.querySelector('#soundButton').addEventListener('click', () => {
  state.sound = !state.sound; document.querySelector('#soundButton').setAttribute('aria-pressed', String(state.sound));
  document.querySelector('#soundLabel').textContent = state.sound ? 'music on' : 'music off';
  if (state.sound) { initAudio(); musicTick(); sparkleSound(); } else clearInterval(state.musicTimer);
});
rollButton.addEventListener('click', handlePrimaryAction);
window.addEventListener('keydown', e => { if (e.code === 'Space' && !document.querySelector('dialog[open]')) { e.preventDefault(); handlePrimaryAction(); } });
document.querySelector('#rulesButton').onclick = () => document.querySelector('#rulesDialog').showModal();
document.querySelector('#rulesClose').onclick = () => document.querySelector('#rulesDialog').close();
document.querySelectorAll('.guide-picker button').forEach(button => {
  button.onclick = () => {
    document.querySelectorAll('.guide-picker button').forEach(item => item.classList.remove('selected'));
    button.classList.add('selected'); state.guide = button.dataset.guide;
    document.querySelector('#rulesStart').disabled = false;
    document.querySelector('#rulesStart').textContent = 'start the adventure';
  };
});
document.querySelector('#rulesStart').onclick = () => {
  if (!state.guide) return;
  document.querySelector('#rulesDialog').close();
  const names = { happy: 'Happy Paw', tie: 'Tie Buddy', cat: 'Boss Cat' };
  document.querySelector('#guideNote').textContent = `${names[state.guide]} is leading this adventure.`;
  document.querySelector('#selectedGuideTitle').textContent = names[state.guide];
  const portrait = document.querySelector('#selectedGuidePortrait');
  portrait.className = `guide-thumb guide-${state.guide}`;
  document.querySelector('#selectedGuideCard').classList.add('chosen');
  renderPawn();
  showToast(`${names[state.guide]} is leading the way`);
};
document.querySelector('#giftClose').onclick = () => document.querySelector('#giftDialog').close();
document.querySelector('#openFinalButton').onclick = () => {
  const lock = document.querySelector('#finalLock');
  if (!state.finalRevealed) {
    lock.textContent = '✦'; lock.classList.add('open');
    document.querySelector('#openFinalButton').textContent = 'your last surprise is waiting';
    state.finalRevealed = true; sparkleSound(); confetti();
  } else {
    document.querySelector('#finaleDialog').close();
    statusText.textContent = 'The rest is waiting in real life.';
    updateRollButton();
  }
};

makeBoard(); makeClueDrawer(); setDice(1); updateRollButton();
setTimeout(() => document.querySelector('#rulesDialog').showModal(), 450);

if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const snapshot = () => ({ position: state.position, heartSparks: state.hearts, moonShields: state.shields, cluesFound: state.found.size, totalClues: gifts.length, guide: state.guide, luckyStreak: state.streak, chapterStamps: state.stamps, cardsCompleted: state.interludeIndex, totalCards: INTERLUDE_DECK.length, finished: state.position === LAST_SPACE && state.found.size === gifts.length && state.interludeIndex >= INTERLUDE_DECK.length && state.finalRevealed });
  Promise.resolve(document.modelContext.registerTool({
    name: 'get_anniversary_game_status',
    title: 'Read anniversary game status',
    description: 'Read the current board position, collected clues, and bonus counters without changing the game.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: async () => snapshot()
  }, { signal: lifecycle.signal })).catch(() => {});
  Promise.resolve(document.modelContext.registerTool({
    name: 'roll_anniversary_dice',
    title: 'Roll the anniversary dice',
    description: 'Start one dice roll on the visible board. Returns after the dice settle or a clue card appears. Fails while a turn or dialog is active.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async () => {
      if (state.busy || document.querySelector('dialog[open]')) throw new Error('Finish the current card before rolling again.');
      void handlePrimaryAction();
      await sleep(900);
      return { ...snapshot(), requiresAttention: Boolean(document.querySelector('dialog[open]')) };
    }
  }, { signal: lifecycle.signal })).catch(() => {});
}
