/* ============================================================
   DARKSPIRE — game.js  (engine)
   Screens: menu → select → map ⇄ combat/events → cutscene → results
   ============================================================ */
'use strict';

/* ---------------- utils ---------------- */
const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1600);
}

/* ---------------- tiny synth sfx (safe to delete) ---------------- */
let AC = null;
function sfx(kind) {
  try {
    if (typeof Music !== 'undefined' && Music.muted) return;
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.connect(g); g.connect(AC.destination);
    const now = AC.currentTime;
    const conf = {
      click: [340, 0.06, 'square', 0.05], hit: [130, 0.12, 'sawtooth', 0.09],
      block: [220, 0.08, 'triangle', 0.07], heal: [520, 0.15, 'sine', 0.06],
      gold: [760, 0.09, 'square', 0.05], death: [90, 0.4, 'sawtooth', 0.1],
      win: [660, 0.3, 'triangle', 0.08],
    }[kind] || [300, 0.05, 'sine', 0.04];
    o.type = conf[2]; o.frequency.setValueAtTime(conf[0], now);
    o.frequency.exponentialRampToValueAtTime(Math.max(40, conf[0] * (kind === 'win' ? 1.6 : 0.6)), now + conf[1]);
    g.gain.setValueAtTime(conf[3], now);
    g.gain.exponentialRampToValueAtTime(0.001, now + conf[1]);
    o.start(now); o.stop(now + conf[1] + 0.02);
  } catch (e) { /* audio unavailable — fine */ }
}

/* ---------------- sprite renderer (PLACEHOLDER ART PIPELINE) ----------------
   Swap this out to draw real images: give each unit a .png and drawImage it. */
function drawSprite(canvas, spriteId, opts = {}) {
  const spr = SPRITES[spriteId];
  if (!canvas || !spr) return;
  const ctx = canvas.getContext('2d');
  const rows = spr.map.length, cols = spr.map[0].length;
  const px = Math.floor(Math.min(canvas.width / cols, canvas.height / rows));
  const ox = Math.floor((canvas.width - cols * px) / 2);
  const oy = Math.floor((canvas.height - rows * px) / 2);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const ch = spr.map[y][x];
      const col = spr.pal[ch];
      if (!col) continue;
      ctx.fillStyle = opts.tint || col;
      ctx.fillRect(ox + x * px, oy + y * px, px, px);
    }
  }
}

/* ---------------- screen switching ---------------- */
const SCREEN_MUSIC = {
  'screen-menu':'menu', 'screen-how':'menu', 'screen-select':'menu',
  'screen-results':'menu', 'screen-cutscene':'menu',
  'screen-map':'map', 'screen-event':'map', 'screen-cards':'map',
  'screen-combat':'battle', 'screen-minigame':'battle',
};
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  if (SCREEN_MUSIC[id]) Music.play(SCREEN_MUSIC[id]);
}

/* ============================================================
   RUN STATE
   ============================================================ */
let run = null;

function newStats() {
  return {
    score: 0, enemiesSlain: 0, bossesSlain: 0, dmgDealt: 0, dmgTaken: 0,
    healed: 0, blockGained: 0, goldEarned: 0, goldSpent: 0,
    cardsPlayed: 0, cardsAdded: 0, turnsPlayed: 0, floorsVisited: 0,
  };
}

function startRun(charId) {
  const c = CHARACTERS.find(x => x.id === charId);
  run = {
    charId, char: c,
    hp: c.maxHp, maxHp: c.maxHp, gold: 50,
    deck: c.starterCards.map(k => ({ key: k, up: false, uid: Math.random() })),
    relics: c.relic ? [c.relic] : [], companion: null, potions: ['healpot'],
    act: 0, map: null, nodeId: null, seenCompanionOffer: false, purgeCount: 0,
    stats: newStats(),
  };
  playCutscene('intro', () => { buildAct(0); });
}

/* ============================================================
   SAVE / LOAD — one save slot in localStorage
   ============================================================ */
const SAVE_KEY = 'darkspire_save_v2'; // v2: new hero roster — v1 saves reference removed cards
function saveRun() {
  if (!run) return;
  try {
    const s = Object.assign({}, run, {
      char: undefined,
      companion: run.companion ? run.companion.id : null,
    });
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch (e) { /* storage unavailable — play without saving */ }
}
function loadRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    s.char = CHARACTERS.find(c => c.id === s.charId);
    s.companion = s.companion ? CHARACTERS.find(c => c.id === s.companion) : null;
    if (!s.char || !s.map) return false;
    run = s;
    return true;
  } catch (e) { return false; }
}
function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}
function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}

/* ============================================================
   POTIONS — max 3; tap a chip in the HUD to drink
   ============================================================ */
function gainPotion(key) {
  if (run.potions.length >= MAX_POTIONS) { toast('Potion belt is full!'); return false; }
  run.potions.push(key);
  toast(`${POTIONS[key].icon} ${POTIONS[key].name}!`);
  return true;
}
function randomPotion() { return pick(Object.keys(POTIONS)); }

function usePotion(idx) {
  const key = run.potions[idx];
  if (!key) return;
  const p = POTIONS[key];
  const inCombat = cb && !cb.over && $('screen-combat').classList.contains('active');
  if (p.combatOnly && !inCombat) { toast('Only usable in combat!'); return; }
  run.potions.splice(idx, 1);
  sfx('heal');
  if (p.heal) { const r = healPlayer(p.heal); if (inCombat) floatText($('player-unit'), '+' + r + '❤️', 'healf'); else toast(`+${r} HP`); }
  if (inCombat) {
    if (p.str) { cb.pStr += p.str; floatText($('player-unit'), '+' + p.str + '💪', 'healf'); }
    if (p.block) { cb.pBlock += p.block; run.stats.blockGained += p.block; floatText($('player-unit'), '+' + p.block + '🛡️', 'blockf'); }
    if (p.dmgAll) { for (const e of cb.enemies.filter(x => x.alive)) hitEnemy(e, p.dmgAll, true); }
    if (p.draw) drawCards(p.draw);
    if (p.energy) cb.energy += p.energy;
    updateCombatUI();
    checkCombatEnd();
  } else {
    renderHud('hud');
    saveRun();
  }
}

function grantRelic(key) {
  run.relics.push(key);
  if (key === 'irontalisman') { run.maxHp += 8; run.hp += 8; }
  toast(`${RELICS[key].icon} ${RELICS[key].name}!`);
  sfx('gold');
}
function hasRelic(k) { return run.relics.includes(k); }
// relics that can still be found or bought (hero starting relics never drop)
function unownedRelics() { return Object.keys(RELICS).filter(k => !RELICS[k].starter && !hasRelic(k)); }

function gainGold(n) { run.gold += n; run.stats.goldEarned += n; }
function healPlayer(n) {
  const real = Math.min(n, run.maxHp - run.hp);
  run.hp += real; run.stats.healed += real;
  return real;
}

/* ============================================================
   MAP GENERATION — branching rows, boss on top
   ============================================================ */
const MAP_ROWS = 7; // 6 travel rows + boss row

function buildAct(actIdx) {
  run.act = actIdx;
  run.map = genMap(actIdx);
  run.nodeId = null;
  renderMap();
  showScreen('screen-map');
  toast(`Level ${actIdx + 1}: ${ACTS[actIdx].name}`);
}

function genMap(actIdx) {
  const nodes = [];
  let id = 0;
  const rows = [];
  for (let r = 0; r < MAP_ROWS; r++) {
    const isBoss = r === MAP_ROWS - 1;
    const count = (isBoss || r === 0) ? 1 : randInt(2, 4);
    const row = [];
    for (let i = 0; i < count; i++) {
      const node = {
        id: id++, row: r, col: i, count,
        type: isBoss ? 'boss' : 'enemy',
        next: [], visited: false,
      };
      row.push(node); nodes.push(node);
    }
    rows.push(row);
  }
  // --- assign types ---
  // single start node: a fight on map 1, a boss-reward "gift" on maps 2 & 3
  if (actIdx > 0) rows[0][0].type = 'gift';
  const bag = ['enemy','enemy','enemy','enemy','event','event','chest','merchant','rest','rest'];
  for (let r = 1; r < MAP_ROWS - 1; r++) {
    for (const n of rows[r]) n.type = pick(bag);
  }
  // guarantees: at least one merchant, one rest, one event per act
  const ensure = (type, rowRange) => {
    if (nodes.some(n => n.type === type)) return;
    const candidates = nodes.filter(n => n.row >= rowRange[0] && n.row <= rowRange[1] && n.type === 'enemy');
    if (candidates.length) pick(candidates).type = type;
  };
  ensure('merchant', [2, 4]);
  ensure('event', [1, 4]);
  // rest before boss: make one node in row 5 a rest site
  const preBoss = rows[MAP_ROWS - 2];
  if (!preBoss.some(n => n.type === 'rest')) pick(preBoss).type = 'rest';
  ensure('chest', [1, 5]);

  // --- edges: connect row r -> r+1 ---
  for (let r = 0; r < MAP_ROWS - 1; r++) {
    const cur = rows[r], nxt = rows[r + 1];
    for (const n of cur) {
      // map col position proportionally
      const t = cur.length === 1 ? 0.5 : n.col / (cur.length - 1);
      const target = Math.round(t * (nxt.length - 1));
      n.next.push(nxt[target].id);
      // sometimes branch to a neighbor
      const nb = target + (Math.random() < 0.5 ? -1 : 1);
      if (nxt[nb] && Math.random() < 0.55) n.next.push(nxt[nb].id);
    }
    // every next-row node needs at least one incoming edge
    for (const m of nxt) {
      if (!cur.some(n => n.next.includes(m.id))) {
        const t = nxt.length === 1 ? 0.5 : m.col / (nxt.length - 1);
        const src = cur[Math.round(t * (cur.length - 1))];
        src.next.push(m.id);
      }
    }
    for (const n of cur) n.next = [...new Set(n.next)];
  }
  // --- coordinates (percent) : bottom row = start ---
  for (const n of nodes) {
    const spread = 78 / Math.max(1, n.count - 1);
    n.x = n.count === 1 ? 50 : 11 + n.col * spread + rand(-3, 3);
    n.y = 92 - (n.row * (84 / (MAP_ROWS - 1)));
  }
  return { nodes, rows };
}

const NODE_ICONS = { enemy:'⚔️', chest:'💰', event:'❓', merchant:'🛒', rest:'🔥', boss:'💀', gift:'🎁' };
const NODE_LABELS = { enemy:'FIGHT', chest:'CHEST', event:'???', merchant:'SHOP', rest:'REST', boss:'BOSS', gift:'BOON' };

function reachableNodes() {
  if (run.nodeId === null) return run.map.rows[0].map(n => n.id);
  const cur = run.map.nodes[run.nodeId];
  return cur.next;
}

function renderHud(elId) {
  const relicStr = run.relics.map(k => `<span class="relic-chip" data-relic="${k}" title="${RELICS[k].name}: ${RELICS[k].desc}">${RELICS[k].icon}</span>`).join(' ');
  const comp = run.companion ? ` 🤝${run.companion.name.split(' ')[0]}` : '';
  let potStr = '';
  for (let i = 0; i < MAX_POTIONS; i++) {
    const key = run.potions[i];
    potStr += key
      ? `<span class="potion-chip" data-pot="${i}" title="${POTIONS[key].name}: ${POTIONS[key].desc}">${POTIONS[key].icon}</span>`
      : `<span class="potion-chip empty">·</span>`;
  }
  $(elId).innerHTML =
    `<span class="hud-hp">❤️ ${run.hp}/${run.maxHp}</span>` +
    `<span class="hud-gold">🪙 ${run.gold}</span>` +
    `<span class="hud-act">🏔️ Lv.${run.act + 1}: ${ACTS[run.act].name}${comp}</span>` +
    `<span class="hud-pots">${potStr}</span>` +
    `<span class="hud-relic">${relicStr}</span>`;
  $(elId).querySelectorAll('.potion-chip[data-pot]').forEach(chip => {
    chip.onclick = () => { sfx('click'); usePotion(+chip.dataset.pot); };
  });
  $(elId).querySelectorAll('.relic-chip').forEach(chip => {
    chip.onclick = () => { const r = RELICS[chip.dataset.relic]; toast(`${r.icon} ${r.name}: ${r.desc}`); };
  });
}

function renderMap() {
  renderHud('hud');
  saveRun(); // checkpoint: the map is the save point
  const wrap = $('map-nodes'), svg = $('map-edges');
  wrap.innerHTML = ''; svg.innerHTML = '';
  const H = $('map-wrap').offsetHeight || 700;
  const W = $('map-wrap').offsetWidth || 360;
  const reach = reachableNodes();
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  // edges
  for (const n of run.map.nodes) {
    for (const nid of n.next) {
      const m = run.map.nodes[nid];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', n.x / 100 * W); line.setAttribute('y1', n.y / 100 * H);
      line.setAttribute('x2', m.x / 100 * W); line.setAttribute('y2', m.y / 100 * H);
      if (n.id === run.nodeId && reach.includes(nid)) line.classList.add('open');
      svg.appendChild(line);
    }
  }
  // nodes
  for (const n of run.map.nodes) {
    const d = document.createElement('div');
    d.className = 'mnode' + (n.type === 'boss' ? ' boss-node' : '');
    if (n.visited) d.classList.add('visited');
    if (n.id === run.nodeId) d.classList.add('current');
    if (reach.includes(n.id) && !n.visited) d.classList.add('reachable');
    d.style.left = n.x + '%';
    d.style.top = n.y + '%';
    d.innerHTML = `<span>${NODE_ICONS[n.type]}</span><span class="nlabel">${NODE_LABELS[n.type]}</span>`;
    if (reach.includes(n.id) && !n.visited) {
      d.onclick = () => { sfx('click'); enterNode(n.id); };
    }
    wrap.appendChild(d);
  }
  $('map-footer').textContent = 'Choose a glowing node to travel.';
  // scroll to bottom (start) or current node
  const sc = $('map-scroll');
  requestAnimationFrame(() => {
    if (run.nodeId === null) sc.scrollTop = sc.scrollHeight;
    else {
      const cur = run.map.nodes[run.nodeId];
      sc.scrollTop = (cur.y / 100 * H) - sc.clientHeight * 0.6;
    }
  });
}

function enterNode(id) {
  const n = run.map.nodes[id];
  run.nodeId = id;
  n.visited = true;
  run.stats.floorsVisited++;
  switch (n.type) {
    case 'enemy': startCombat(pick(ENCOUNTERS[run.act]), false); break;
    case 'boss': startCombat([ACT_BOSSES[run.act]], true); break;
    case 'chest': openChest(); break;
    case 'event': randomEvent(); break;
    case 'merchant': openMerchant(); break;
    case 'rest': openRest(); break;
    case 'gift': openBossReward(); break;
  }
}
/* ============================================================
   COMBAT
   ============================================================ */
let cb = null; // current combat state

function cardData(inst) {
  const base = CARDS[inst.key];
  const c = Object.assign({}, base, inst.up ? base.up : {});
  c.key = inst.key; c.upgraded = inst.up;
  return c;
}
function cardDesc(c) {
  return c.desc.replace(/\{(\w+)\}/g, (_, k) => `<b>${c[k]}</b>`);
}

function makeEnemy(key, slot) {
  const def = ENEMIES[key];
  const hp = randInt(def.hp[0], def.hp[1]);
  return {
    key, def, slot, uid: 'e' + slot + Math.random(),
    hp, maxHp: hp, block: 0, str: 0, weak: 0, vuln: 0, poison: 0,
    stun: 0, constrict: 0, seed: 0,
    moveIdx: randInt(0, def.moves.length - 1), intent: null, alive: true,
  };
}

function startCombat(encounterKeys, isBoss) {
  cb = {
    enemies: encounterKeys.map((k, i) => makeEnemy(k, i)),
    isBoss,
    drawPile: shuffle(run.deck),
    hand: [], discard: [], exhausted: [],
    energy: 3, maxEnergy: 3,
    pBlock: 0, pStr: hasRelic('emberring') ? 1 : 0, pWeak: 0, pVuln: 0,
    pDex: 0, pFly: 0, energyPerTurn: 0, attackCount: 0, escapeUsed: false,
    turn: 0, selected: null, busy: false, over: false,
  };
  if (hasRelic('stonescale')) { cb.pBlock = 5; run.stats.blockGained += 5; }
  if (hasRelic('bloodvial')) healPlayer(4);
  if (hasRelic('holycross')) cb.pDex += TUNING.crossDex;
  if (hasRelic('feathercharm')) cb.pDex += 1;
  if (hasRelic('butterflywings')) cb.pFly = TUNING.wingsFly;
  if (hasRelic('emptybottle')) {
    for (let i = 0; i < TUNING.bottlePotions && run.potions.length < MAX_POTIONS; i++) gainPotion(randomPotion());
  }
  for (const e of cb.enemies) rollIntent(e);
  buildCombatUI();
  showScreen('screen-combat');
  logLine(isBoss ? `☠️ BOSS: ${cb.enemies[0].def.name}!` : 'Enemies approach...');
  startPlayerTurn();
}

function rollIntent(e) {
  e.moveIdx = (e.moveIdx + 1) % e.def.moves.length;
  e.intent = e.def.moves[e.moveIdx];
}
function intentText(e) {
  if (e.stun > 0) return '💫 Stunned';
  const m = e.intent;
  const parts = [];
  if (m.dmg) {
    let d = Math.max(0, m.dmg + e.str);
    if (e.weak > 0) d = Math.floor(d * 0.75);
    parts.push(`🗡️${d}${m.hits ? '×' + m.hits : ''}`);
  }
  if (m.block) parts.push(`🛡️${m.block}`);
  if (m.str) parts.push('💪');
  if (m.heal) parts.push('💚');
  if (m.poison) parts.push('☠');
  if (m.weak) parts.push('🌀');
  if (m.vuln) parts.push('🎯');
  return `${m.label} ${parts.join(' ')}`;
}

/* ---------- combat UI ---------- */
function buildCombatUI() {
  const es = $('enemy-side');
  es.innerHTML = '';
  cb.enemyEls = {};
  for (const e of cb.enemies) {
    const d = document.createElement('div');
    d.className = 'unit enemy' + (e.def.boss ? ' boss' : '');
    d.innerHTML = `<div class="intent"></div><canvas width="96" height="96"></canvas>
      <div class="uname">${e.def.name}</div>
      <div class="hpbar"><div class="hpfill"></div></div><div class="hptext"></div>
      <div class="status-row"></div><div class="blockchip" style="display:none"></div>`;
    drawSprite(d.querySelector('canvas'), e.def.sprite);
    d.onclick = () => onEnemyTap(e);
    es.appendChild(d);
    cb.enemyEls[e.uid] = d;
  }
  const p = $('player-unit');
  p.innerHTML = `<div class="intent"></div><canvas width="96" height="96"></canvas>
    <div class="uname">${run.char.name}</div>
    <div class="hpbar"><div class="hpfill"></div></div><div class="hptext"></div>
    <div class="status-row"></div><div class="blockchip" style="display:none"></div>`;
  drawSprite(p.querySelector('canvas'), run.char.sprite);
  const cu = $('companion-unit');
  if (run.companion) {
    cu.style.display = 'flex';
    cu.innerHTML = `<canvas width="64" height="64"></canvas><div class="uname">🤝 ${run.companion.name}</div>`;
    cu.querySelector('canvas').style.width = '52px';
    cu.querySelector('canvas').style.height = '52px';
    drawSprite(cu.querySelector('canvas'), run.companion.sprite);
  } else { cu.style.display = 'none'; cu.innerHTML = ''; }
}

function floatText(el, txt, cls) {
  if (!el) return;
  const f = document.createElement('div');
  f.className = 'dmg-float ' + (cls || '');
  f.textContent = txt;
  el.appendChild(f);
  setTimeout(() => f.remove(), 800);
}

function statusStr(u) {
  const bits = [];
  if (u.str > 0 || u.pStr > 0) bits.push('💪' + (u.str ?? u.pStr));
  if ((u.poison ?? 0) > 0) bits.push('☠' + u.poison);
  if ((u.weak ?? u.pWeak ?? 0) > 0) bits.push('🌀' + (u.weak ?? u.pWeak));
  if ((u.vuln ?? u.pVuln ?? 0) > 0) bits.push('🎯' + (u.vuln ?? u.pVuln));
  return bits.join(' ');
}

function updateCombatUI() {
  renderHud('hud-combat');
  // player
  const p = $('player-unit');
  p.querySelector('.hpfill').style.width = Math.max(0, run.hp / run.maxHp * 100) + '%';
  p.querySelector('.hptext').textContent = `${run.hp}/${run.maxHp}`;
  const pbits = [];
  if (cb.pStr > 0) pbits.push('💪' + cb.pStr);
  if (cb.pDex > 0) pbits.push('💨' + cb.pDex);
  if (cb.pFly > 0) pbits.push('🦋' + cb.pFly);
  if (cb.energyPerTurn > 0) pbits.push('⚡+' + cb.energyPerTurn);
  if (cb.pWeak > 0) pbits.push('🌀' + cb.pWeak);
  if (cb.pVuln > 0) pbits.push('🎯' + cb.pVuln);
  if (hasRelic('ammobelt')) pbits.push(`🔫${cb.attackCount % TUNING.ammoEvery}/${TUNING.ammoEvery}`);
  p.querySelector('.status-row').textContent = pbits.join(' ');
  const pchip = p.querySelector('.blockchip');
  pchip.style.display = cb.pBlock > 0 ? 'flex' : 'none';
  pchip.textContent = cb.pBlock;
  // enemies
  for (const e of cb.enemies) {
    const d = cb.enemyEls[e.uid];
    if (!e.alive) { d.classList.add('dead'); continue; }
    d.querySelector('.hpfill').style.width = Math.max(0, e.hp / e.maxHp * 100) + '%';
    d.querySelector('.hptext').textContent = `${e.hp}/${e.maxHp}`;
    d.querySelector('.intent').textContent = intentText(e);
    const ebits = [];
    if (e.str !== 0) ebits.push('💪' + e.str);
    if (e.poison > 0) ebits.push('☠' + e.poison);
    if (e.constrict > 0) ebits.push('⛓️' + e.constrict);
    if (e.seed > 0) ebits.push('🌱' + e.seed);
    if (e.weak > 0) ebits.push('🌀' + e.weak);
    if (e.vuln > 0) ebits.push('🎯' + e.vuln);
    if (e.stun > 0) ebits.push('💫');
    d.querySelector('.status-row').textContent = ebits.join(' ');
    const chip = d.querySelector('.blockchip');
    chip.style.display = e.block > 0 ? 'flex' : 'none';
    chip.textContent = e.block;
    d.classList.toggle('targetable', !!cb.selected && cardNeedsTarget(cardData(cb.selected)));
  }
  // energy + piles
  $('energy-orb').textContent = `${cb.energy}/${cb.maxEnergy}`;
  $('pile-info').innerHTML = `Draw: ${cb.drawPile.length} · Discard: ${cb.discard.length}`;
  $('btn-escape').style.display = canEscape() ? '' : 'none';
  renderHand();
}

function renderHand() {
  const h = $('hand');
  h.innerHTML = '';
  for (const inst of cb.hand) {
    const c = cardData(inst);
    const d = document.createElement('div');
    d.className = `card ${c.type}` + (c.upgraded ? ' upgraded' : '');
    if (c.cost > cb.energy) d.classList.add('unplayable');
    if (cb.selected === inst) d.classList.add('selected-card');
    // show Block as it will actually land, including Dexterity
    const shown = c.block ? Object.assign({}, c, { block: Math.max(0, c.block + cb.pDex) }) : c;
    d.innerHTML = `<div class="ccost">${c.cost}</div><div class="ctitle">${c.name}${c.upgraded ? '+' : ''}</div>
      <div class="ctype">${{atk:'Attack',skl:'Skill',pow:'Power'}[c.type]}</div>
      <div class="cdesc">${cardDesc(shown)}</div>`;
    d.onclick = (ev) => { ev.stopPropagation(); onCardTap(inst); };
    h.appendChild(d);
  }
}

function logLine(t) { $('combat-log').textContent = t; }

/* ---------- turns ---------- */
function drawCards(n) {
  for (let i = 0; i < n; i++) {
    if (cb.drawPile.length === 0) {
      if (cb.discard.length === 0) break;
      cb.drawPile = shuffle(cb.discard);
      cb.discard = [];
    }
    cb.hand.push(cb.drawPile.pop());
  }
}

// generated cards (Bullets): straight into hand; overflow goes to the discard pile
function addToHand(key, n) {
  for (let i = 0; i < n; i++) {
    const inst = { key, up: false, uid: Math.random() };
    (cb.hand.length < TUNING.handMax ? cb.hand : cb.discard).push(inst);
  }
}

function startPlayerTurn() {
  if (cb.over) return;
  cb.turn++;
  run.stats.turnsPlayed++;
  cb.pBlock = 0;
  const first = cb.turn === 1;
  cb.energy = cb.maxEnergy + cb.energyPerTurn + (first && hasRelic('warhorn') ? 1 : 0);
  cb.selected = null;
  drawCards(5 + (first && hasRelic('hourglass') ? 2 : 0));
  companionAct();
  if (checkCombatEnd()) return;
  cb.busy = false;
  logLine(`Turn ${cb.turn} — your move.`);
  updateCombatUI();
}

function companionAct() {
  if (!run.companion || cb.over) return;
  const alive = cb.enemies.filter(e => e.alive);
  if (!alive.length) return;
  const t = pick(alive);
  const pEl = $('player-unit');
  switch (run.companion.id) {
    case 'alchemist':
      hitEnemy(t, 4, true);
      if (t.alive) t.vuln += 1;
      floatText(pEl, '🤝🧪', 'blockf'); break;
    case 'gunslinger':
      for (let s = 0; s < 2; s++) {
        const live = cb.enemies.filter(e => e.alive);
        if (live.length) hitEnemy(pick(live), 3, true);
      }
      break;
    case 'ninja':
      t.poison += 3; floatText(cb.enemyEls[t.uid], '+3☠', 'healf'); break;
    case 'fae': {
      const r = enemyLoseHp(t, 3);
      floatText(cb.enemyEls[t.uid], '-' + r + '🌱', 'healf');
      const h = healPlayer(r);
      if (h > 0) floatText(pEl, '+' + h + '❤️', 'healf');
      break;
    }
    case 'priest': {
      const r = healPlayer(4);
      if (r > 0) floatText(pEl, '+' + r + '❤️', 'healf');
      break;
    }
  }
}

const ENEMY_FX = ['dmg', 'poison', 'weak', 'vuln', 'strDown', 'stun', 'constrict', 'seed'];
const touchesEnemy = fx => ENEMY_FX.some(k => fx[k]);
function cardNeedsTarget(c) {
  if (c.aoe) return false;
  return touchesEnemy(c) || !!(c.choice && c.choice.some(o => touchesEnemy(o.fx)));
}

function onCardTap(inst) {
  if (cb.busy || cb.over) return;
  const c = cardData(inst);
  if (c.cost > cb.energy) { toast('Not enough energy!'); return; }
  if (cardNeedsTarget(c)) {
    const alive = cb.enemies.filter(e => e.alive);
    if (alive.length === 1) { playCard(inst, alive[0]); return; }
    cb.selected = (cb.selected === inst) ? null : inst;
    logLine(cb.selected ? 'Choose a target...' : `Turn ${cb.turn} — your move.`);
    updateCombatUI();
  } else {
    playCard(inst, null);
  }
}
function onEnemyTap(e) {
  if (cb.busy || cb.over || !e.alive) return;
  if (cb.selected) { const inst = cb.selected; cb.selected = null; playCard(inst, e); }
}

function hitEnemy(e, base, flat) {
  // flat = ignore player str/weak (companion hits)
  let amt = Math.max(0, flat ? base : base + cb.pStr);
  if (!flat && cb.pWeak > 0) amt = Math.floor(amt * 0.75);
  if (e.vuln > 0) amt = Math.floor(amt * 1.5);
  const blocked = Math.min(e.block, amt);
  e.block -= blocked;
  const hpLoss = amt - blocked;
  e.hp -= hpLoss;
  run.stats.dmgDealt += hpLoss;
  const el = cb.enemyEls[e.uid];
  if (el) {
    el.classList.remove('hitanim'); void el.offsetWidth; el.classList.add('hitanim');
    floatText(el, hpLoss > 0 ? '-' + hpLoss : '🛡️', hpLoss > 0 ? '' : 'blockf');
  }
  sfx(hpLoss > 0 ? 'hit' : 'block');
  if (e.hp <= 0) killEnemy(e);
  return hpLoss;
}

function killEnemy(e) {
  if (!e.alive) return;
  e.alive = false; e.hp = 0;
  run.stats.enemiesSlain++;
  if (e.def.boss) run.stats.bossesSlain++;
  sfx('death');
}

// unblockable status damage (poison, constrict, leech seed); returns HP actually lost
function enemyLoseHp(e, n) {
  const real = Math.min(n, e.hp);
  e.hp -= n;
  run.stats.dmgDealt += real;
  if (e.hp <= 0) killEnemy(e);
  return real;
}

function loseHp(n) {
  // unblockable self/companion cost
  run.hp -= n;
  run.stats.dmgTaken += n;
  floatText($('player-unit'), '-' + n, '');
  if (run.hp <= 0) { run.hp = 0; playerDied(); }
}

function playCard(inst, target, opt) {
  if (cb.busy || cb.over) return;
  let c = cardData(inst);
  if (c.cost > cb.energy) return;
  // choice cards (Transmute): pick an effect set first; nothing is spent on cancel
  if (c.choice && !opt) {
    showChoice(c, o => {
      if (o) playCard(inst, target, o);
      else { cb.selected = null; logLine(`Turn ${cb.turn} — your move.`); updateCombatUI(); }
    });
    return;
  }
  if (opt) {
    c = Object.assign({}, c);
    for (const [k, from] of Object.entries(opt.fx)) c[k] = c[from];
  }
  cb.energy -= c.cost;
  run.stats.cardsPlayed++;
  cb.hand.splice(cb.hand.indexOf(inst), 1);
  // powers stay in effect, so they leave the deck for the rest of the fight
  (c.exhaust || c.type === 'pow' ? cb.exhausted : cb.discard).push(inst);

  if (c.selfDmg) loseHp(c.selfDmg);
  if (cb.over) return;

  const pEl = $('player-unit');
  const targets = c.aoe ? cb.enemies.filter(e => e.alive) : (target ? [target] : []);
  let dealt = 0;
  if (c.dmg) {
    const hits = c.hits || 1;
    for (let i = 0; i < hits; i++) for (const t of targets) {
      if (!t.alive) continue;
      const cursed = c.cursedBonus && (t.weak > 0 || t.vuln > 0);
      dealt += hitEnemy(t, cursed ? c.dmg * 2 : c.dmg);
    }
  }
  for (const t of targets) {
    if (!t.alive) continue;
    if (c.poison) { t.poison += c.poison; }
    if (c.weak) { t.weak += c.weak; }
    if (c.vuln) { t.vuln += c.vuln; }
    if (c.strDown) { t.str -= c.strDown; }
    if (c.constrict) { t.constrict += c.constrict; }
    if (c.seed) { t.seed += c.seed; }
    if (c.stun) { t.stun += c.stun; floatText(cb.enemyEls[t.uid], '💫', 'blockf'); }
  }
  if (c.lifesteal && dealt > 0) { const r = healPlayer(dealt); if (r > 0) { floatText(pEl, '+' + r + '❤️', 'healf'); sfx('heal'); } }
  if (c.cleanse && (cb.pWeak > 0 || cb.pVuln > 0)) { cb.pWeak = 0; cb.pVuln = 0; floatText(pEl, '✨', 'healf'); }
  if (c.block) {
    const b = Math.max(0, c.block + cb.pDex);
    cb.pBlock += b; run.stats.blockGained += b;
    floatText(pEl, '+' + b + '🛡️', 'blockf'); sfx('block');
  }
  if (c.heal) { const r = healPlayer(c.heal); if (r > 0) { floatText(pEl, '+' + r + '❤️', 'healf'); sfx('heal'); } }
  if (c.str) { cb.pStr += c.str; floatText(pEl, '+' + c.str + '💪', 'healf'); }
  if (c.dex) { cb.pDex += c.dex; floatText(pEl, '+' + c.dex + '💨', 'healf'); }
  if (c.energy) cb.energy += c.energy;
  if (c.energyPerTurn) cb.energyPerTurn += c.energyPerTurn;
  if (c.draw) drawCards(c.draw);
  if (c.gold) { gainGold(c.gold); sfx('gold'); toast('+' + c.gold + ' 🪙'); }
  if (c.potion) { for (let i = 0; i < c.potion; i++) gainPotion(randomPotion()); }
  if (c.bullets) addToHand('bullet', c.bullets);
  if (c.type === 'atk' && !c.token && hasRelic('ammobelt')) {
    cb.attackCount++;
    if (cb.attackCount % TUNING.ammoEvery === 0) {
      addToHand('bullet', TUNING.ammoBullets);
      floatText(pEl, '+' + TUNING.ammoBullets + '🔫', 'blockf');
    }
  }

  cb.selected = null;
  updateCombatUI();
  checkCombatEnd();
}

/* ---------- choice popup (Transmute) ---------- */
function showChoice(c, done) {
  const ov = $('choice-overlay');
  const fill = s => s.replace(/\{(\w+)\}/g, (_, k) => c[k]);
  ov.innerHTML = `<div class="panel"><h2>${c.name}${c.upgraded ? '+' : ''}</h2>` +
    c.choice.map((o, i) => `<button class="btn" data-opt="${i}">${o.label}<br><small>${fill(o.text)}</small></button>`).join('') +
    `<button class="btn danger" data-opt="-1">CANCEL</button></div>`;
  ov.classList.add('show');
  ov.querySelectorAll('[data-opt]').forEach(b => {
    b.onclick = () => {
      sfx('click');
      ov.classList.remove('show');
      const i = +b.dataset.opt;
      done(i >= 0 ? c.choice[i] : null);
    };
  });
}

/* ---------- Cherry Blossom: flee a non-boss fight ---------- */
function canEscape() {
  return !!cb && hasRelic('cherryblossom') && !cb.isBoss && !cb.escapeUsed && !cb.over;
}
function tryEscape() {
  if (cb.busy || !canEscape()) return;
  cb.escapeUsed = true;
  if (Math.random() < TUNING.escapeChance) {
    cb.over = true; cb.busy = true;
    sfx('win'); toast('🌸 You vanish in a swirl of petals!');
    setTimeout(backToMap, 600);
  } else {
    sfx('block'); toast('🌸 The petals scatter — no escape!');
    logLine('Escape failed! Fight on.');
    updateCombatUI();
  }
}

function checkCombatEnd() {
  if (cb.over) return true;
  if (run.hp <= 0) { playerDied(); return true; }
  if (cb.enemies.every(e => !e.alive)) {
    cb.over = true; cb.busy = true;
    updateCombatUI();
    setTimeout(() => combatVictory(), 700);
    return true;
  }
  return false;
}

function endTurn() {
  if (cb.busy || cb.over) return;
  cb.busy = true;
  cb.selected = null;
  tickEnemyStatuses();
  updateCombatUI();
  if (checkCombatEnd()) return;
  // discard hand
  cb.discard.push(...cb.hand);
  cb.hand = [];
  updateCombatUI();
  // enemies act one by one
  const actors = cb.enemies.filter(e => e.alive);
  let i = 0;
  const step = () => {
    if (cb.over) return;
    if (i >= actors.length) {
      // end of round: tick down debuffs
      if (cb.pWeak > 0) cb.pWeak--;
      if (cb.pVuln > 0) cb.pVuln--;
      if (cb.pFly > 0) cb.pFly--;
      for (const e of cb.enemies) { if (e.weak > 0) e.weak--; if (e.vuln > 0) e.vuln--; }
      startPlayerTurn();
      return;
    }
    const e = actors[i++];
    if (e.alive) enemyAct(e);
    if (run.hp <= 0) return;
    updateCombatUI();
    setTimeout(step, 520);
  };
  setTimeout(step, 420);
}

// end of the player's turn: poison, constrict and leech seed hit every enemy
function tickEnemyStatuses() {
  let drained = 0;
  for (const e of cb.enemies) {
    if (!e.alive) continue;
    const parts = [];
    if (e.poison > 0) {
      enemyLoseHp(e, e.poison);
      parts.push('-' + e.poison + '☠');
      e.poison--;
    }
    if (e.alive && e.constrict > 0) {
      enemyLoseHp(e, TUNING.constrictDmg);
      parts.push('-' + TUNING.constrictDmg + '⛓️');
      e.constrict--;
      if (e.alive && Math.random() < TUNING.constrictStunChance) { e.stun = Math.max(e.stun, 1); parts.push('💫'); }
    }
    if (e.alive && e.seed > 0) {
      const r = enemyLoseHp(e, TUNING.leechSeedDrain);
      drained += r;
      parts.push('-' + r + '🌱');
      e.seed--;
    }
    if (parts.length) floatText(cb.enemyEls[e.uid], parts.join(' '), 'healf');
  }
  if (drained > 0) {
    const h = healPlayer(drained);
    if (h > 0) floatText($('player-unit'), '+' + h + '❤️', 'healf');
  }
}

function enemyAct(e) {
  const m = e.intent;
  e.block = 0; // enemy block resets when it acts
  const pEl = $('player-unit');
  if (e.stun > 0) {
    e.stun--;
    floatText(cb.enemyEls[e.uid], '💫', 'blockf');
    logLine(`${e.def.name} is stunned and loses its turn!`);
    rollIntent(e);
    return;
  }
  if (m.dmg) {
    const hits = m.hits || 1;
    for (let h = 0; h < hits; h++) {
      let amt = Math.max(0, m.dmg + e.str);
      if (e.weak > 0) amt = Math.floor(amt * 0.75);
      if (cb.pVuln > 0) amt = Math.floor(amt * 1.5);
      if (cb.pFly > 0) amt = Math.floor(amt * (1 - TUNING.flyDamageCut));
      const blocked = Math.min(cb.pBlock, amt);
      cb.pBlock -= blocked;
      const hpLoss = amt - blocked;
      run.hp -= hpLoss;
      run.stats.dmgTaken += hpLoss;
      pEl.classList.remove('hitanim'); void pEl.offsetWidth; pEl.classList.add('hitanim');
      floatText(pEl, hpLoss > 0 ? '-' + hpLoss : '🛡️', hpLoss > 0 ? '' : 'blockf');
      sfx(hpLoss > 0 ? 'hit' : 'block');
      if (run.hp <= 0) { run.hp = 0; playerDied(); return; }
    }
  }
  if (m.block) e.block += m.block;
  if (m.str) e.str += m.str;
  if (m.heal) e.hp = Math.min(e.maxHp, e.hp + m.heal);
  if (m.poison) { /* poison the player: model as direct end-turn chip damage */
    run.hp -= m.poison; run.stats.dmgTaken += m.poison;
    floatText(pEl, '-' + m.poison + '☠', '');
    if (run.hp <= 0) { run.hp = 0; playerDied(); return; }
  }
  if (m.weak) cb.pWeak += m.weak;
  if (m.vuln) cb.pVuln += m.vuln;
  logLine(`${e.def.name} uses ${m.label}!`);
  rollIntent(e);
}

function playerDied() {
  if (cb) cb.over = true;
  clearSave(); // death wipes the save — that's the rogue-lite deal
  sfx('death');
  setTimeout(() => playCutscene('defeat', () => showResults(false)), 800);
}

/* ---------- rewards ---------- */
function combatVictory() {
  sfx('win');
  let gold = cb.isBoss ? randInt(60, 85) : randInt(18, 32) + run.act * 6;
  if (hasRelic('thiefpurse')) gold += 15;
  gainGold(gold);
  if (hasRelic('mooncharm')) healPlayer(3);
  if (!cb.isBoss && Math.random() < 0.30 && run.potions.length < MAX_POTIONS) {
    gainPotion(randomPotion());
  }
  const wasBoss = cb.isBoss;
  toast(`Victory! +${gold} 🪙`);
  offerCardReward(() => {
    if (wasBoss) {
      if (run.act >= 2) { clearSave(); playCutscene('victory', () => showResults(true)); }
      else {
        healPlayer(Math.floor(run.maxHp * 0.20));
        toast('You catch your breath... +20% HP');
        buildAct(run.act + 1);
      }
    } else {
      renderMap(); showScreen('screen-map');
    }
  });
}

/* ---- boss reward node (start of maps 2 & 3) ---- */
function openBossReward() {
  const opts = shuffle(BOSS_REWARDS).slice(0, 3);
  let html = `<div class="evt-title">🎁 Spoils of the Fallen Lord</div>
    <div class="evt-body">The dead boss's hoard spills across the path. Choose ONE prize.</div>`;
  opts.forEach((o, i) => {
    html += `<button class="btn" id="gift-${i}">${o.label}<br><small>${o.desc}</small></button>`;
  });
  eventPanel(html);
  opts.forEach((o, i) => {
    $(`gift-${i}`).onclick = () => {
      sfx('gold');
      switch (o.id) {
        case 'gold': gainGold(55); toast('+55 🪙'); backToMap(); break;
        case 'maxhp': run.maxHp += 10; run.hp += 10; toast('+10 Max HP!'); backToMap(); break;
        case 'potions': gainPotion(randomPotion()); gainPotion(randomPotion()); backToMap(); break;
        case 'relic': {
          const unowned = unownedRelics();
          if (unowned.length) grantRelic(pick(unowned)); else { gainGold(50); toast('+50 🪙 (all relics owned)'); }
          backToMap(); break;
        }
        case 'rare': {
          const rares = rewardPool().filter(k => CARDS[k].rar === 2);
          const choices = shuffle(rares).slice(0, 3).map(k => ({ key: k, up: false, uid: Math.random() }));
          pickCardScreen('CHOOSE A RARE CARD', choices, { skippable: true }, (inst) => {
            if (inst) { run.deck.push(inst); run.stats.cardsAdded++; toast(`Added ${cardData(inst).name}!`); }
            backToMap();
          });
          break;
        }
        case 'upgrade': {
          const upgradable = run.deck.filter(x => !x.up);
          if (!upgradable.length) { gainGold(40); toast('+40 🪙 (nothing to upgrade)'); backToMap(); break; }
          pickCardScreen('UPGRADE A CARD', upgradable, { skippable: false }, (inst) => {
            if (inst) { inst.up = true; sfx('win'); toast(`${CARDS[inst.key].name}+ !`); }
            backToMap();
          });
          break;
        }
      }
    };
  });
}

function rewardPool() {
  const classes = ['any', run.charId];
  if (run.companion) classes.push(run.companion.id);
  // signature (unique) cards and generated tokens (Bullets) are never offered
  return Object.keys(CARDS).filter(k => classes.includes(CARDS[k].cls) && !CARDS[k].unique && !CARDS[k].token
    && !['strike','defend'].includes(k));
}

function rollRewardCards(n) {
  const pool = rewardPool();
  const picks = [];
  let guard = 0;
  while (picks.length < n && guard++ < 200) {
    const roll = Math.random();
    const wantRar = roll < 0.55 ? 0 : roll < 0.88 ? 1 : 2;
    const cands = pool.filter(k => CARDS[k].rar === wantRar && !picks.includes(k));
    const all = pool.filter(k => !picks.includes(k));
    const k = cands.length ? pick(cands) : (all.length ? pick(all) : null);
    if (!k) break;
    picks.push(k);
  }
  return picks.map(k => ({ key: k, up: false, uid: Math.random() }));
}

function offerCardReward(done) {
  const choices = rollRewardCards(3);
  pickCardScreen('CHOOSE A CARD', choices, { skippable: true }, (inst) => {
    if (inst) {
      run.deck.push(inst);
      run.stats.cardsAdded++;
      toast(`Added ${cardData(inst).name}!`);
    }
    done();
  });
}

/* ---------- card picker (rewards / upgrade / remove / buy) ---------- */
function makeCardEl(inst, extraHtml) {
  const c = cardData(inst);
  const d = document.createElement('div');
  d.className = `card ${c.type}` + (c.upgraded ? ' upgraded' : '');
  d.innerHTML = `<div class="ccost">${c.cost}</div><div class="ctitle">${c.name}${c.upgraded ? '+' : ''}</div>
    <div class="ctype">${{atk:'Attack',skl:'Skill',pow:'Power'}[c.type]}</div>
    <div class="cdesc">${cardDesc(c)}</div>` + (extraHtml || '');
  return d;
}

function pickCardScreen(title, insts, opts, cb2) {
  $('cards-title').textContent = title;
  const grid = $('cards-grid');
  grid.innerHTML = '';
  for (const inst of insts) {
    const d = makeCardEl(inst, opts.priceOf ? `<div class="price-tag">🪙${opts.priceOf(inst)}</div>` : '');
    d.onclick = () => { sfx('click'); cb2(inst); };
    grid.appendChild(d);
  }
  const skip = $('btn-cards-skip');
  skip.style.display = opts.skippable ? '' : 'none';
  skip.textContent = opts.skipLabel || 'SKIP';
  skip.onclick = () => { sfx('click'); cb2(null); };
  showScreen('screen-cards');
}

/* ============================================================
   NODES: CHEST / REST / MERCHANT / EVENTS
   ============================================================ */
function eventPanel(html) {
  $('event-panel').innerHTML = html;
  showScreen('screen-event');
}
function evtSprite(id) {
  return `<canvas id="evt-canvas" width="96" height="96"></canvas>`;
}
function drawEvtSprite(id) {
  const c = document.getElementById('evt-canvas');
  if (c) drawSprite(c, id);
}
function backToMap() { renderMap(); showScreen('screen-map'); }

/* ---- chest ---- */
function openChest() {
  const gold = randInt(25, 50) + run.act * 10;
  const unowned = unownedRelics();
  eventPanel(`
    <div class="evt-title">A Forgotten Chest</div>
    ${evtSprite('chest')}
    <div class="evt-body">Half-buried in the dark, its lock long rotted away.</div>
    <button class="btn big" id="evt-open">OPEN IT</button>
  `);
  drawEvtSprite('chest');
  $('evt-open').onclick = () => {
    sfx('gold');
    gainGold(gold);
    let msg = `You found <b>${gold} gold</b>`;
    if (unowned.length) {
      const r = pick(unowned);
      grantRelic(r);
      msg += ` and the <b>${RELICS[r].icon} ${RELICS[r].name}</b>!<br><i>${RELICS[r].desc}</i>`;
    } else msg += '!';
    if (Math.random() < 0.4 && run.potions.length < MAX_POTIONS) {
      const pk = randomPotion();
      run.potions.push(pk);
      msg += `<br>Tucked in the corner: a <b>${POTIONS[pk].icon} ${POTIONS[pk].name}</b>.`;
    }
    eventPanel(`
      <div class="evt-title">Treasure!</div>${evtSprite('chest')}
      <div class="evt-body">${msg}</div>
      <button class="btn" id="evt-done">CONTINUE</button>`);
    drawEvtSprite('chest');
    $('evt-done').onclick = backToMap;
  };
}

/* ---- rest site ---- */
function openRest() {
  const healAmt = Math.floor(run.maxHp * 0.3);
  eventPanel(`
    <div class="evt-title">Rest Site</div>
    ${evtSprite('campfire')}
    <div class="evt-body">The fire crackles. For a moment, the spire feels far away.</div>
    <button class="btn big" id="evt-heal">🔥 REST — heal ${healAmt} HP</button>
    <button class="btn" id="evt-upg">⚒️ TRAIN — upgrade a card</button>
  `);
  drawEvtSprite('campfire');
  $('evt-heal').onclick = () => {
    const r = healPlayer(healAmt);
    sfx('heal'); toast(`+${r} HP`);
    backToMap();
  };
  $('evt-upg').onclick = () => {
    const upgradable = run.deck.filter(i => !i.up);
    if (!upgradable.length) { toast('Nothing left to upgrade!'); return; }
    pickCardScreen('UPGRADE A CARD', upgradable, { skippable: true, skipLabel: 'CANCEL' }, (inst) => {
      if (inst) { inst.up = true; sfx('win'); toast(`${CARDS[inst.key].name}+ !`); backToMap(); }
      else openRest();
    });
  };
}

/* ---- merchant ---- */
function openMerchant() {
  const stock = rollRewardCards(3);
  const priceOf = inst => [45, 65, 90][CARDS[inst.key].rar] || 45;
  const healCost = 40, potCost = 30, relicCost = 90;
  // one purge per visit; every purge this run makes the next one cost 25 more
  const removeCost = 55 + 25 * (run.purgeCount || 0);
  let purged = false;
  const potStock = shuffle(Object.keys(POTIONS)).slice(0, 3);   // 3 different potions
  const relicStock = shuffle(unownedRelics()).slice(0, 3);      // up to 3 different relics
  const sold = new Set();
  const shopItem = (id, icon, name, desc, cost) => sold.has(id)
    ? `<button class="btn" disabled><span class="si-icon">${icon}</span>SOLD</button>`
    : `<button class="btn" id="${id}"><span class="si-icon">${icon}</span>${name}<small>${desc}</small><span class="si-price">🪙${cost}</span></button>`;
  const render = () => {
    eventPanel(`
      <div class="evt-title">The Merchant</div>
      ${evtSprite('merchant')}
      <div class="evt-body">"Brave or stupid, your coin spends the same. <b>🪙${run.gold}</b>"</div>
      <button class="btn" id="m-cards">🃏 BROWSE CARDS (${stock.length})</button>
      <div class="shop-label">POTIONS</div>
      <div class="shop-row">${potStock.map((k, i) => shopItem(`m-pot-${i}`, POTIONS[k].icon, POTIONS[k].name, POTIONS[k].desc, potCost)).join('')}</div>
      <div class="shop-label">RELICS</div>
      <div class="shop-row">${relicStock.length
        ? relicStock.map((k, i) => shopItem(`m-relic-${i}`, RELICS[k].icon, RELICS[k].name, RELICS[k].desc, relicCost)).join('')
        : '<div class="shop-empty">"You\'ve bought me out of trinkets."</div>'}</div>
      <button class="btn" id="m-heal">❤️ MEND WOUNDS — heal 25 (🪙${healCost})</button>
      <button class="btn" id="m-remove" ${purged ? 'disabled' : ''}>${purged ? '🗑️ PURGED — one per visit' : `🗑️ PURGE A CARD (🪙${removeCost})`}</button>
      <button class="btn big" id="m-leave">LEAVE</button>
    `);
    drawEvtSprite('merchant');
    potStock.forEach((k, i) => {
      const b = $(`m-pot-${i}`);
      if (b) b.onclick = () => {
        if (run.gold < potCost) { toast('Not enough gold!'); return; }
        if (run.potions.length >= MAX_POTIONS) { toast('Potion belt is full!'); return; }
        run.gold -= potCost; run.stats.goldSpent += potCost;
        gainPotion(k); sold.add(b.id); sfx('gold'); render();
      };
    });
    relicStock.forEach((k, i) => {
      const b = $(`m-relic-${i}`);
      if (b) b.onclick = () => {
        if (run.gold < relicCost) { toast('Not enough gold!'); return; }
        run.gold -= relicCost; run.stats.goldSpent += relicCost;
        grantRelic(k); sold.add(b.id); render();
      };
    });
    $('m-cards').onclick = () => {
      if (!stock.length) { toast('Sold out!'); return; }
      pickCardScreen('BUY A CARD', stock, { skippable: true, skipLabel: 'BACK', priceOf }, (inst) => {
        if (inst) {
          const cost = priceOf(inst);
          if (run.gold < cost) { toast('Not enough gold!'); render(); return; }
          run.gold -= cost; run.stats.goldSpent += cost;
          run.deck.push(inst); run.stats.cardsAdded++;
          stock.splice(stock.indexOf(inst), 1);
          sfx('gold'); toast(`Bought ${CARDS[inst.key].name}!`);
        }
        render();
      });
    };
    $('m-heal').onclick = () => {
      if (run.gold < healCost) { toast('Not enough gold!'); return; }
      if (run.hp >= run.maxHp) { toast('Already at full health!'); return; }
      run.gold -= healCost; run.stats.goldSpent += healCost;
      healPlayer(25); sfx('heal'); toast('+25 HP'); render();
    };
    $('m-remove').onclick = () => {
      if (purged) return;
      if (run.gold < removeCost) { toast('Not enough gold!'); return; }
      if (run.deck.length <= 5) { toast('Your deck is too thin!'); return; }
      pickCardScreen('REMOVE A CARD', run.deck, { skippable: true, skipLabel: 'BACK' }, (inst) => {
        if (inst) {
          run.gold -= removeCost; run.stats.goldSpent += removeCost;
          run.purgeCount = (run.purgeCount || 0) + 1;
          purged = true;
          run.deck.splice(run.deck.indexOf(inst), 1);
          sfx('click'); toast(`Removed ${CARDS[inst.key].name}.`);
        }
        render();
      });
    };
    $('m-leave').onclick = backToMap;
  };
  render();
}

/* ---- random events (? nodes) ---- */
function randomEvent() {
  // companion slot: strongly favored while you have no companion
  if (!run.companion && (!run.seenCompanionOffer || Math.random() < 0.40)) {
    run.seenCompanionOffer = true;
    return companionEvent();
  }
  const roll = Math.random();
  if (roll < 0.22) return ambushEvent();
  if (roll < 0.48) return minigameEvent();
  pick([shrineEvent, cursedChestEvent, trainingEvent, fountainEvent, peddlerEvent])();
}

function ambushEvent() {
  eventPanel(`
    <div class="evt-title">⚠️ AMBUSH!</div>
    <div class="evt-body">Shapes burst from the shadows — you've walked into a trap!</div>
    <button class="btn big danger" id="evt-fight">DRAW STEEL</button>
  `);
  $('evt-fight').onclick = () => { sfx('hit'); startCombat(pick(ENCOUNTERS[run.act]), false); };
}

function minigameEvent() {
  const game = pick(['runner', 'coins']);
  const name = game === 'runner' ? '🏃 The Gauntlet' : '🪙 Coin Squall';
  const desc = game === 'runner'
    ? 'A collapsing corridor, spike traps, bats — and gold, if you can survive the sprint. JUMP over spikes, ATTACK the bats.'
    : 'A rift in the wall rains coins... and skulls. Catch the gold, dodge the bones!';
  eventPanel(`
    <div class="evt-title">${name}</div>
    <div class="evt-body">${desc}</div>
    <button class="btn big" id="evt-play">PLAY</button>
    <button class="btn" id="evt-skip">WALK AWAY</button>
  `);
  $('evt-play').onclick = () => { sfx('click'); game === 'runner' ? startRunnerGame() : startCoinGame(); };
  $('evt-skip').onclick = backToMap;
}

function companionEvent() {
  const others = CHARACTERS.filter(c => c.id !== run.charId && (!run.companion || run.companion.id !== c.id));
  const offers = shuffle(others).slice(0, 2);
  let html = `
    <div class="evt-title">A Fellow Climber</div>
    <div class="evt-body">Someone stirs by the path — another hero, half-lost in the dark.<br>"Two blades are better than one. Take me with you?"</div>`;
  offers.forEach((c, i) => {
    html += `<button class="btn" id="evt-comp-${i}">🤝 RECRUIT ${c.name.toUpperCase()} — ${c.role}<br><small>${c.companionText}</small></button>`;
  });
  html += `<button class="btn" id="evt-decline">DECLINE — take their 25 gold instead</button>`;
  eventPanel(html);
  offers.forEach((c, i) => {
    $(`evt-comp-${i}`).onclick = () => {
      run.companion = c;
      sfx('win'); toast(`${c.name} joins you!`);
      backToMap();
    };
  });
  $('evt-decline').onclick = () => { gainGold(25); sfx('gold'); toast('+25 🪙'); backToMap(); };
}

function shrineEvent() {
  eventPanel(`
    <div class="evt-title">A Mossy Shrine</div>
    ${evtSprite('shrine')}
    <div class="evt-body">An old god sleeps here. Faint light pulses beneath the moss.</div>
    <button class="btn" id="evt-pray">🙏 PRAY — heal 12 HP</button>
    <button class="btn danger" id="evt-loot">🪙 DESECRATE — gain 45 gold, lose 7 HP</button>
  `);
  drawEvtSprite('shrine');
  $('evt-pray').onclick = () => { healPlayer(12); sfx('heal'); toast('+12 HP'); backToMap(); };
  $('evt-loot').onclick = () => {
    gainGold(45); run.hp = Math.max(1, run.hp - 7); run.stats.dmgTaken += 7;
    sfx('gold'); toast('+45 🪙, -7 HP'); backToMap();
  };
}

function cursedChestEvent() {
  eventPanel(`
    <div class="evt-title">A Whispering Chest</div>
    ${evtSprite('chest')}
    <div class="evt-body">The chest hums with something hungry. It is very heavy with gold.</div>
    <button class="btn danger" id="evt-open">OPEN — gain 60 gold, lose 8 HP</button>
    <button class="btn" id="evt-leave">WALK AWAY</button>
  `);
  drawEvtSprite('chest');
  $('evt-open').onclick = () => {
    gainGold(60); run.hp = Math.max(1, run.hp - 8); run.stats.dmgTaken += 8;
    sfx('gold'); toast('+60 🪙, -8 HP'); backToMap();
  };
  $('evt-leave').onclick = backToMap;
}

function trainingEvent() {
  eventPanel(`
    <div class="evt-title">The Sparring Ghost</div>
    <div class="evt-body">The spirit of an old master offers one lesson, free of charge.</div>
    <button class="btn" id="evt-train">⚒️ TRAIN — upgrade a card</button>
    <button class="btn" id="evt-skip">DECLINE</button>
  `);
  $('evt-train').onclick = () => {
    const upgradable = run.deck.filter(i => !i.up);
    if (!upgradable.length) { toast('Nothing to upgrade!'); backToMap(); return; }
    pickCardScreen('UPGRADE A CARD', upgradable, { skippable: false }, (inst) => {
      if (inst) { inst.up = true; sfx('win'); toast(`${CARDS[inst.key].name}+ !`); }
      backToMap();
    });
  };
  $('evt-skip').onclick = backToMap;
}

function fountainEvent() {
  eventPanel(`
    <div class="evt-title">A Silver Fountain</div>
    ${evtSprite('shrine')}
    <div class="evt-body">Cold, clean water — impossibly pure, this high in the spire.</div>
    <button class="btn big" id="evt-drink">💧 DRINK — heal 15 HP</button>
  `);
  drawEvtSprite('shrine');
  $('evt-drink').onclick = () => { healPlayer(15); sfx('heal'); toast('+15 HP'); backToMap(); };
}

function peddlerEvent() {
  const unowned = unownedRelics();
  if (!unowned.length) return fountainEvent();
  const r = pick(unowned), cost = 45;
  eventPanel(`
    <div class="evt-title">A Hooded Peddler</div>
    ${evtSprite('merchant')}
    <div class="evt-body">"Pssst. ${RELICS[r].icon} <b>${RELICS[r].name}</b> — ${RELICS[r].desc}<br>Yours for ${cost} gold. No refunds."</div>
    <button class="btn" id="evt-buy">🪙 BUY (${cost})</button>
    <button class="btn" id="evt-no">NO THANKS</button>
  `);
  drawEvtSprite('merchant');
  $('evt-buy').onclick = () => {
    if (run.gold < cost) { toast('Not enough gold!'); return; }
    run.gold -= cost; run.stats.goldSpent += cost;
    grantRelic(r); backToMap();
  };
  $('evt-no').onclick = backToMap;
}

/* ============================================================
   CUTSCENES — tiny canvas vignette + typewriter text
   ============================================================ */
let csState = null;
function playCutscene(key, done) {
  const lines = CUTSCENES[key].map(l => l.replace('{name}', run ? run.char.name : 'The hero'));
  csState = { key, lines, idx: 0, done, typing: null };
  drawCutsceneArt(key);
  showScreen('screen-cutscene');
  showCutsceneLine();
}
function drawCutsceneArt(key) {
  const cv = $('cutscene-canvas'), ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  // sky
  const grad = ctx.createLinearGradient(0, 0, 0, cv.height);
  if (key === 'victory') { grad.addColorStop(0, '#2a3a5c'); grad.addColorStop(1, '#d8944a'); }
  else if (key === 'defeat') { grad.addColorStop(0, '#050409'); grad.addColorStop(1, '#1a0a10'); }
  else { grad.addColorStop(0, '#0b0a16'); grad.addColorStop(1, '#241a3a'); }
  ctx.fillStyle = grad; ctx.fillRect(0, 0, cv.width, cv.height);
  // stars
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  for (let i = 0; i < 40; i++) ctx.fillRect(Math.floor(Math.random() * cv.width), Math.floor(Math.random() * cv.height * 0.6), 1, 1);
  // the spire
  ctx.fillStyle = key === 'victory' ? '#3a2a3a' : '#141020';
  ctx.beginPath();
  ctx.moveTo(cv.width * 0.62, cv.height);
  ctx.lineTo(cv.width * 0.72, cv.height * 0.08);
  ctx.lineTo(cv.width * 0.78, cv.height * 0.08);
  ctx.lineTo(cv.width * 0.92, cv.height);
  ctx.fill();
  // glowing eye at the top of the spire
  ctx.fillStyle = key === 'victory' ? '#f2d16b' : '#e64a3d';
  ctx.fillRect(cv.width * 0.74, cv.height * 0.05, 4, 4);
  // ground
  ctx.fillStyle = '#0a0810';
  ctx.fillRect(0, cv.height - 18, cv.width, 18);
  // hero sprite (or skull on defeat)
  const tmp = document.createElement('canvas');
  tmp.width = 48; tmp.height = 48;
  const sprId = key === 'defeat' ? 'skull' : (run ? run.char.sprite : CHARACTERS[0].sprite);
  drawSprite(tmp, sprId);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tmp, cv.width * 0.18, cv.height - 18 - 48, 48, 48);
  if (key === 'victory') {
    const cr = document.createElement('canvas'); cr.width = 24; cr.height = 24;
    drawSprite(cr, 'crown');
    ctx.drawImage(cr, cv.width * 0.18 + 12, cv.height - 18 - 66, 24, 24);
  }
}
function showCutsceneLine() {
  const el = $('cutscene-text');
  const line = csState.lines[csState.idx];
  el.textContent = '';
  let i = 0;
  clearInterval(csState.typing);
  csState.typing = setInterval(() => {
    el.textContent = line.slice(0, ++i);
    if (i >= line.length) clearInterval(csState.typing);
  }, 24);
}
function advanceCutscene() {
  const el = $('cutscene-text');
  const line = csState.lines[csState.idx];
  if (el.textContent.length < line.length) { // skip typing
    clearInterval(csState.typing);
    el.textContent = line;
    return;
  }
  csState.idx++;
  if (csState.idx >= csState.lines.length) {
    const d = csState.done; csState = null;
    d();
  } else showCutsceneLine();
}

/* ============================================================
   RESULTS / SCORE
   ============================================================ */
function computeScore(victory) {
  const s = run.stats;
  let score = s.enemiesSlain * 15 + s.bossesSlain * 100 + s.floorsVisited * 5
    + run.gold + run.relics.length * 25 + s.cardsAdded * 5 + run.hp * 2;
  if (victory) score += 500;
  return score;
}
function showResults(victory) {
  const s = run.stats;
  const score = computeScore(victory);
  $('results-title').textContent = victory ? '👑 THE SPIRE FALLS' : '💀 YOU HAVE FALLEN';
  $('results-title').style.color = victory ? '#d8b45a' : '#e66';
  $('score-big').textContent = 'SCORE: ' + score;
  const rows = [
    ['Hero', run.char.name],
    ['Companion', run.companion ? run.companion.name : '—'],
    ['Level reached', `${run.act + 1} / 3`],
    ['Enemies slain', s.enemiesSlain],
    ['Bosses slain', s.bossesSlain],
    ['Damage dealt', s.dmgDealt],
    ['Damage taken', s.dmgTaken],
    ['HP healed', s.healed],
    ['Block gained', s.blockGained],
    ['Gold earned', s.goldEarned],
    ['Gold spent', s.goldSpent],
    ['Cards played', s.cardsPlayed],
    ['Cards collected', s.cardsAdded],
    ['Turns taken', s.turnsPlayed],
    ['Rooms explored', s.floorsVisited],
    ['Relics found', run.relics.length],
  ];
  $('stats-grid').innerHTML = rows.map(([k, v]) => `<div class="sk">${k}</div><div class="sv">${v}</div>`).join('');
  showScreen('screen-results');
}

/* ============================================================
   MENUS & BOOT
   ============================================================ */
let selectedCharId = null;

function buildCharSelect() {
  const row = $('char-row');
  row.innerHTML = '';
  for (const c of CHARACTERS) {
    const d = document.createElement('div');
    d.className = 'char-card';
    d.id = 'cc-' + c.id;
    d.innerHTML = `<canvas width="72" height="72"></canvas><div class="cname">${c.name}</div><div class="crole">${c.role}</div>`;
    drawSprite(d.querySelector('canvas'), c.sprite);
    d.onclick = () => {
      sfx('click');
      selectedCharId = c.id;
      document.querySelectorAll('.char-card').forEach(x => x.classList.remove('selected'));
      d.classList.add('selected');
      const relic = RELICS[c.relic];
      const sigKey = c.starterCards.find(k => CARDS[k].unique);
      $('char-detail').innerHTML = `
        <h2>${c.name} — ${c.role}</h2>
        <p>${c.desc}</p>
        <div class="stat-line">❤️ ${c.maxHp} Max HP &nbsp;·&nbsp; 🃏 ${c.starterCards.length} starting cards</div>
        ${relic ? `<div class="stat-line">${relic.icon} <b>${relic.name}</b> — ${relic.desc}</div>` : ''}
        ${sigKey ? `<div class="stat-line">🃏 <b>${CARDS[sigKey].name}</b> — ${cardDesc(CARDS[sigKey])}</div>` : ''}
        <div class="stat-line sig">${c.companionText}</div>`;
      $('btn-embark').disabled = false;
    };
    row.appendChild(d);
  }
  $('char-detail').innerHTML = '<p style="color:#9a8fc0">Select a hero to read about them.</p>';
  $('btn-embark').disabled = true;
}

function refreshMenuButtons() {
  const save = hasSave();
  $('btn-continue').style.display = save ? '' : 'none';
  $('btn-reset').style.display = save ? '' : 'none';
  $('btn-reset').textContent = 'RESET SAVE';
  $('btn-reset').dataset.arm = '';
}

function init() {
  drawSprite($('menu-sprite'), 'crimsongod');
  $('how-text').innerHTML = HOW_TO_PLAY;
  refreshMenuButtons();
  $('btn-continue').onclick = () => {
    sfx('win');
    if (loadRun()) { renderMap(); showScreen('screen-map'); toast('The climb continues...'); }
    else { toast('Save file was corrupted — starting fresh.'); clearSave(); refreshMenuButtons(); }
  };
  $('btn-reset').onclick = () => {
    const b = $('btn-reset');
    if (!b.dataset.arm) { b.dataset.arm = '1'; b.textContent = '⚠ SURE? TAP AGAIN'; sfx('click'); return; }
    clearSave(); refreshMenuButtons(); toast('Save wiped.'); sfx('death');
  };
  $('btn-start').onclick = () => {
    sfx('click');
    if (hasSave()) { toast('Starting anew — old save erased.'); clearSave(); refreshMenuButtons(); }
    buildCharSelect(); showScreen('screen-select');
  };
  $('btn-how').onclick = () => { sfx('click'); showScreen('screen-how'); };
  $('btn-how-back').onclick = () => { sfx('click'); showScreen('screen-menu'); };
  $('btn-select-back').onclick = () => { sfx('click'); showScreen('screen-menu'); };
  $('btn-embark').onclick = () => { if (selectedCharId) { sfx('win'); startRun(selectedCharId); } };
  $('btn-end-turn').onclick = () => { sfx('click'); endTurn(); };
  $('btn-escape').onclick = () => { sfx('click'); tryEscape(); };
  $('btn-cutscene-next').onclick = () => { sfx('click'); advanceCutscene(); };
  $('cutscene-text').onclick = () => advanceCutscene();
  $('btn-again').onclick = () => { sfx('click'); buildCharSelect(); showScreen('screen-select'); };
  $('btn-menu').onclick = () => { sfx('click'); refreshMenuButtons(); showScreen('screen-menu'); };
  // audio: mute toggle + mobile-safe unlock on first touch
  $('btn-mute').onclick = () => {
    Music.muted = !Music.muted;
    try { localStorage.setItem('darkspire_muted', Music.muted ? '1' : ''); } catch (e) {}
    $('btn-mute').textContent = Music.muted ? '🔇' : '🔊';
    $('btn-mute').classList.toggle('muted', Music.muted);
    if (Music.muted) Music.stop(); else {
      const scr = document.querySelector('.screen.active');
      if (scr && SCREEN_MUSIC[scr.id]) Music.play(SCREEN_MUSIC[scr.id]);
    }
  };
  try { if (localStorage.getItem('darkspire_muted')) { Music.muted = true; $('btn-mute').textContent = '🔇'; $('btn-mute').classList.add('muted'); } } catch (e) {}
  const unlock = () => {
    Music.ensure();
    const scr = document.querySelector('.screen.active');
    if (scr && SCREEN_MUSIC[scr.id]) Music.play(SCREEN_MUSIC[scr.id]);
    document.removeEventListener('pointerdown', unlock);
  };
  document.addEventListener('pointerdown', unlock);
  initMinigameControls();
  // tap empty battlefield to deselect card
  $('battlefield').onclick = (e) => {
    if (cb && cb.selected && e.target.id === 'battlefield') {
      cb.selected = null; updateCombatUI();
      logLine(`Turn ${cb.turn} — your move.`);
    }
  };
}
document.addEventListener('DOMContentLoaded', init);
/* ============================================================
   MUSIC ENGINE — tiny chiptune step sequencer (patterns in data.js)
   Three tracks: menu (intro), map (very quiet), battle.
   All synthesized live via WebAudio — no audio files needed.
   ============================================================ */
const Music = {
  ctx: null, muted: false, cur: null, timer: null, step: 0, nextTime: 0,
  ensure() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  },
  midiFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); },
  note(type, midi, t, dur, vol) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(this.midiFreq(midi), t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  },
  hat(t, vol) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'square'; o.frequency.setValueAtTime(rand(5200, 6800), t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + 0.05);
  },
  play(name) {
    if (this.cur === name && this.timer) return;
    this.stop();
    this.cur = name;
    if (this.muted || !MUSIC[name]) return;
    this.ensure();
    if (!this.ctx) return;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.06;
    this.timer = setInterval(() => this.schedule(), 90);
  },
  schedule() {
    if (!this.ctx || this.muted || !this.cur) return;
    const trk = MUSIC[this.cur];
    if (!trk) return;
    const stepDur = 60 / trk.bpm / 4;
    while (this.nextTime < this.ctx.currentTime + 0.30) {
      const s = this.step, t = this.nextTime, v = trk.vol;
      if (trk.bass && trk.bass[s]) this.note('triangle', trk.bass[s], t, stepDur * 3.2, v);
      if (trk.lead && trk.lead[s]) this.note('square', trk.lead[s], t, stepDur * 1.5, v * 0.45);
      if (trk.pad && trk.pad[s]) this.note('sine', trk.pad[s], t, stepDur * 7, v * 0.7);
      if (trk.hat && trk.hat[s]) this.hat(t, v * 0.30);
      this.step = (this.step + 1) % 32;
      this.nextTime += stepDur;
    }
  },
  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.cur = null;
  },
};

/* ============================================================
   MINIGAMES — quick canvas challenges from ? nodes
   Both are frame-based (~15s) and end with a prize summary.
   ============================================================ */
let mg = null;

function initMinigameControls() {
  const down = (k, on) => { if (mg && !mg.over) mg[k] = on; };
  const bindBtn = (id, k) => {
    const b = $(id);
    b.onpointerdown = (e) => { e.preventDefault(); down(k, true); if (mg && mg.onPress) mg.onPress(k); };
    b.onpointerup = () => down(k, false);
    b.onpointerleave = () => down(k, false);
  };
  bindBtn('mg-btn-a', 'inA');
  bindBtn('mg-btn-b', 'inB');
  document.addEventListener('keydown', (e) => {
    if (!mg || mg.over) return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowLeft') { down('inA', true); if (mg.onPress) mg.onPress('inA'); }
    if (e.code === 'KeyX' || e.code === 'ArrowRight') { down('inB', true); if (mg.onPress) mg.onPress('inB'); }
  });
  document.addEventListener('keyup', (e) => {
    if (!mg) return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowLeft') down('inA', false);
    if (e.code === 'KeyX' || e.code === 'ArrowRight') down('inB', false);
  });
  // drag to move (coin game)
  const cv = $('mg-canvas');
  const drag = (e) => {
    if (!mg || mg.type !== 'coins' || mg.over) return;
    const r = cv.getBoundingClientRect();
    mg.targetX = (e.clientX - r.left) / r.width * 320;
  };
  cv.onpointerdown = drag;
  cv.onpointermove = (e) => { if (e.buttons) drag(e); };
}

function mgDamage(n) {
  run.hp = Math.max(1, run.hp - n); // minigames hurt but never kill
  run.stats.dmgTaken += n;
}

function spriteToCanvas(id, size) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  drawSprite(c, id);
  return c;
}

function mgFinish(title, lines, goldEarned, potionBonus) {
  mg.over = true;
  setTimeout(() => {
    mg = null;
    gainGold(goldEarned);
    let html = `<div class="evt-title">${title}</div><div class="evt-body">${lines.join('<br>')}</div>`;
    eventPanel(html + `<button class="btn big" id="mg-done">CONTINUE</button>`);
    if (potionBonus && run.potions.length < MAX_POTIONS) gainPotion(randomPotion());
    sfx('win');
    $('mg-done').onclick = backToMap;
  }, 600);
}

/* ---------- MINIGAME 1: The Gauntlet (side-scroller: jump & attack) ---------- */
function startRunnerGame() {
  $('mg-title').textContent = '🏃 THE GAUNTLET';
  $('mg-help').textContent = 'JUMP (space/↑) over spikes · ATTACK (X) the bats · grab coins!';
  $('mg-btn-a').textContent = '⬆ JUMP';
  $('mg-btn-b').textContent = '⚔ ATTACK';
  $('mg-btn-b').style.display = '';
  mg = {
    type: 'runner', frame: 0, over: false,
    x: 40, y: 0, vy: 0, ground: 148, jumping: false,
    scroll: 0, speed: 2.6, len: 2400,
    slashT: 0, invuln: 0, hits: 0, coins: 0,
    objs: [], inA: false, inB: false,
    onPress(k) {
      if (k === 'inA' && !this.jumping) { this.jumping = true; this.vy = -7.4; sfx('click'); }
      if (k === 'inB' && this.slashT <= 0) { this.slashT = 14; sfx('hit'); }
    },
  };
  // generate the course
  let d = 340;
  while (d < mg.len - 200) {
    const r = Math.random();
    if (r < 0.38) mg.objs.push({ t: 'spike', x: d, alive: true });
    else if (r < 0.68) mg.objs.push({ t: 'bat', x: d, y: rand(96, 122), alive: true, ph: rand(0, 6) });
    else for (let i = 0; i < 3; i++) mg.objs.push({ t: 'coin', x: d + i * 18, y: 118 - i * 10, alive: true });
    d += randInt(130, 220);
  }
  showScreen('screen-minigame');
  requestAnimationFrame(runnerLoop);
}

function runnerLoop() {
  if (!mg || mg.type !== 'runner' || mg.over) return;
  const cv = $('mg-canvas'), ctx = cv.getContext('2d');
  mg.frame++;
  mg.scroll += mg.speed;
  mg.speed = Math.min(3.4, mg.speed + 0.0004);
  // physics
  if (mg.jumping) {
    mg.vy += 0.38; mg.y += mg.vy;
    if (mg.y >= 0) { mg.y = 0; mg.vy = 0; mg.jumping = false; }
  }
  if (mg.slashT > 0) mg.slashT--;
  if (mg.invuln > 0) mg.invuln--;
  const heroTop = mg.ground - 22 + mg.y, heroBot = mg.ground + mg.y;
  // objects
  for (const o of mg.objs) {
    if (!o.alive) continue;
    const sx = o.x - mg.scroll;
    if (sx < -30 || sx > 340) continue;
    if (o.t === 'spike') {
      if (sx > mg.x - 8 && sx < mg.x + 12 && heroBot > mg.ground - 10 && mg.invuln <= 0) {
        o.alive = false; mg.hits++; mg.invuln = 45; mgDamage(5); sfx('death');
      }
    } else if (o.t === 'bat') {
      const by = o.y + Math.sin(mg.frame / 12 + o.ph) * 7;
      const overl = sx > mg.x - 10 && sx < mg.x + 14 && heroTop < by + 8 && heroBot > by - 8;
      const slashed = mg.slashT > 6 && sx > mg.x && sx < mg.x + 42 && by > heroTop - 16 && by < heroBot + 8;
      if (slashed) { o.alive = false; mg.coins += 2; sfx('gold'); }
      else if (overl && mg.invuln <= 0) { o.alive = false; mg.hits++; mg.invuln = 45; mgDamage(5); sfx('death'); }
    } else if (o.t === 'coin') {
      if (sx > mg.x - 8 && sx < mg.x + 14 && heroTop < o.y + 7 && heroBot > o.y - 7) {
        o.alive = false; mg.coins++; sfx('gold');
      }
    }
  }
  /* ---- draw ---- */
  ctx.fillStyle = '#0b0a12'; ctx.fillRect(0, 0, 320, 180);
  ctx.fillStyle = '#141126';
  for (let i = 0; i < 6; i++) {
    const px = (i * 90 - mg.scroll * 0.3) % 540 - 110;
    ctx.fillRect(px, 40 + (i % 3) * 22, 46, 140);
  }
  ctx.fillStyle = '#241e3a'; ctx.fillRect(0, mg.ground, 320, 32);
  ctx.fillStyle = '#3a3155';
  for (let i = 0; i < 12; i++) ctx.fillRect(((i * 34 - mg.scroll) % 408 + 408) % 408 - 44, mg.ground, 17, 3);
  for (const o of mg.objs) {
    if (!o.alive) continue;
    const sx = o.x - mg.scroll;
    if (sx < -30 || sx > 340) continue;
    if (o.t === 'spike') {
      ctx.fillStyle = '#8a8fa0';
      ctx.beginPath(); ctx.moveTo(sx - 7, mg.ground); ctx.lineTo(sx, mg.ground - 14); ctx.lineTo(sx + 7, mg.ground); ctx.fill();
    } else if (o.t === 'bat') {
      const by = o.y + Math.sin(mg.frame / 12 + o.ph) * 7;
      ctx.drawImage(spriteToCanvasCache('wolf', 18), sx - 9, by - 9);
    } else {
      ctx.fillStyle = '#f2d16b'; ctx.beginPath(); ctx.arc(sx, o.y, 4, 0, 7); ctx.fill();
      ctx.fillStyle = '#c9a02a'; ctx.fillRect(sx - 1, o.y - 2, 2, 4);
    }
  }
  // hero
  if (mg.invuln % 8 < 5) ctx.drawImage(spriteToCanvasCache(run.char.sprite, 24), mg.x - 6, mg.ground - 24 + mg.y);
  if (mg.slashT > 6) {
    ctx.strokeStyle = '#f4e4b8'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(mg.x + 14, mg.ground - 12 + mg.y, 17, -1.2, 0.9); ctx.stroke();
  }
  // hud
  ctx.fillStyle = '#f2d16b'; ctx.font = 'bold 10px monospace';
  ctx.fillText(`💰${mg.coins}  ✖${mg.hits}`, 8, 14);
  ctx.fillStyle = '#3a3155'; ctx.fillRect(80, 8, 160, 5);
  ctx.fillStyle = '#d8b45a'; ctx.fillRect(80, 8, 160 * Math.min(1, mg.scroll / mg.len), 5);
  $('mg-info').textContent = `❤️ ${run.hp}/${run.maxHp}`;
  // end
  if (mg.scroll >= mg.len) {
    const flawless = mg.hits === 0;
    const gold = mg.coins * 4 + (flawless ? 15 : 0);
    mgFinish('🏁 GAUNTLET CLEARED', [
      `Coins & bats: <b>+${gold} gold</b>`,
      `Hits taken: <b>${mg.hits}</b>` + (flawless ? ' — FLAWLESS! Bonus prize!' : ''),
    ], gold, flawless);
    return;
  }
  requestAnimationFrame(runnerLoop);
}

const _sprCache = {};
function spriteToCanvasCache(id, size) {
  const k = id + '_' + size;
  if (!_sprCache[k]) _sprCache[k] = spriteToCanvas(id, size);
  return _sprCache[k];
}

/* ---------- MINIGAME 2: Coin Squall (catch coins, dodge skulls) ---------- */
function startCoinGame() {
  $('mg-title').textContent = '🪙 COIN SQUALL';
  $('mg-help').textContent = 'Move with ◀ ▶ (or drag / arrow keys). Catch coins, dodge skulls!';
  $('mg-btn-a').textContent = '◀';
  $('mg-btn-b').textContent = '▶';
  $('mg-btn-b').style.display = '';
  mg = {
    type: 'coins', frame: 0, over: false, len: 880,
    cx: 160, targetX: null, inA: false, inB: false,
    coins: 0, hits: 0, objs: [], flash: 0,
  };
  showScreen('screen-minigame');
  requestAnimationFrame(coinLoop);
}

function coinLoop() {
  if (!mg || mg.type !== 'coins' || mg.over) return;
  const cv = $('mg-canvas'), ctx = cv.getContext('2d');
  mg.frame++;
  // spawn
  const rate = Math.max(16, 30 - Math.floor(mg.frame / 90));
  if (mg.frame % rate === 0) {
    mg.objs.push({
      skull: Math.random() < 0.32,
      x: rand(14, 306), y: -10, vy: rand(1.5, 2.6) + mg.frame / 900,
      alive: true,
    });
  }
  // move catcher
  if (mg.inA) { mg.cx -= 3.4; mg.targetX = null; }
  if (mg.inB) { mg.cx += 3.4; mg.targetX = null; }
  if (mg.targetX !== null) mg.cx += (mg.targetX - mg.cx) * 0.25;
  mg.cx = Math.max(20, Math.min(300, mg.cx));
  // objects
  for (const o of mg.objs) {
    if (!o.alive) continue;
    o.y += o.vy;
    if (o.y > 186) { o.alive = false; continue; }
    if (o.y > 150 && o.y < 172 && Math.abs(o.x - mg.cx) < 22) {
      o.alive = false;
      if (o.skull) { mg.hits++; mg.flash = 12; mgDamage(4); sfx('death'); }
      else { mg.coins++; sfx('gold'); }
    }
  }
  if (mg.flash > 0) mg.flash--;
  /* ---- draw ---- */
  ctx.fillStyle = mg.flash > 6 ? '#2a1016' : '#0b0a12';
  ctx.fillRect(0, 0, 320, 180);
  ctx.fillStyle = '#141126';
  ctx.fillRect(0, 0, 320, 26);
  ctx.fillStyle = '#241e3a'; ctx.fillRect(0, 172, 320, 8);
  for (const o of mg.objs) {
    if (!o.alive) continue;
    if (o.skull) ctx.drawImage(spriteToCanvasCache('skull', 16), o.x - 8, o.y - 8);
    else {
      ctx.fillStyle = '#f2d16b'; ctx.beginPath(); ctx.arc(o.x, o.y, 5, 0, 7); ctx.fill();
      ctx.fillStyle = '#c9a02a'; ctx.fillRect(o.x - 1, o.y - 3, 2, 6);
    }
  }
  // catcher: the hero with a sack
  ctx.drawImage(spriteToCanvasCache(run.char.sprite, 24), mg.cx - 12, 148);
  ctx.strokeStyle = '#d8b45a'; ctx.lineWidth = 2;
  ctx.strokeRect(mg.cx - 20, 158, 40, 6);
  // hud
  ctx.fillStyle = '#f2d16b'; ctx.font = 'bold 10px monospace';
  ctx.fillText(`💰${mg.coins}  ✖${mg.hits}`, 8, 16);
  ctx.fillStyle = '#3a3155'; ctx.fillRect(200, 10, 110, 5);
  ctx.fillStyle = '#d8b45a'; ctx.fillRect(200, 10, 110 * (1 - mg.frame / mg.len), 5);
  $('mg-info').textContent = `❤️ ${run.hp}/${run.maxHp}`;
  // end
  if (mg.frame >= mg.len) {
    const flawless = mg.hits === 0;
    const gold = mg.coins * 3 + (flawless ? 12 : 0);
    mgFinish('⛈️ THE SQUALL PASSES', [
      `Coins caught: <b>${mg.coins}</b> → <b>+${gold} gold</b>`,
      `Skulls hit: <b>${mg.hits}</b>` + (flawless ? ' — FLAWLESS! Bonus prize!' : ''),
    ], gold, flawless);
    return;
  }
  requestAnimationFrame(coinLoop);
}
