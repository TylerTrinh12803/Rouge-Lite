/* ============================================================
   DARKSPIRE — data.js
   ALL game content lives here: sprites, characters, cards,
   enemies, bosses, relics, events, cutscenes.
   >>> PLACEHOLDER ART: every sprite below is a small pixel map.
   >>> Each string row = one row of pixels; each character is a
   >>> color key from the sprite's "pal" palette ('.' = empty).
   >>> Replace these maps (or swap drawSprite in game.js to use
   >>> your own images) when you remake the assets.
   ============================================================ */

const SPRITES = {
  /* ------------- HEROES (12x12) ------------- */
  alchemist: {
    pal: { b:'#6b4a2a', d:'#4a3220', f:'#e8c9a0', g:'#d8b45a', k:'#22242c', v:'#6bc96b', w:'#c9e8f2' },
    map: [
      "....bbbb....",
      "...bbbbbb...",
      "...bffffb...",
      "...gkggkg...",
      "....ffff....",
      "..bbbbbbbb..",
      ".b.bbggbb.w.",
      ".b.bbbbbb.v.",
      ".f.bbbbbb.vv",
      "...bbbbbb...",
      "...bb..bb...",
      "..kkk..kkk..",
    ]
  },
  gunslinger: {
    pal: { h:'#5c4430', d:'#3d2d20', f:'#e8c9a0', c:'#8a6b4a', k:'#22242c', s:'#a8adb8', r:'#b03a3a' },
    map: [
      "....hhhh....",
      "..hhhhhhhh..",
      "...ffffff...",
      "...fkffkf...",
      "....rrrr....",
      "..cccccccc..",
      ".c.cccccc.ss",
      ".c.cccccc.s.",
      "...kkkkkk...",
      "...cc..cc...",
      "...dd..dd...",
      "..kkk..kkk..",
    ]
  },
  ninja: {
    pal: { n:'#2a2a3a', d:'#1a1a24', f:'#e8c9a0', k:'#0a0a10', r:'#c92432', s:'#a8adb8' },
    map: [
      "..........s.",
      "....nnnn.s..",
      "...nnnnnsn..",
      "...nfkfkfn..",
      "...nnnnnnn..",
      "..rrnnnnnn..",
      ".r.nnnnnn.n.",
      "r..nnrrnn.n.",
      "...nnnnnn...",
      "...nn..nn...",
      "...dd..dd...",
      "..kkk..kkk..",
    ]
  },
  fae: {
    pal: { g:'#5fa84f', d:'#3d6b33', f:'#d8c9a0', e:'#b8f26b', k:'#22242c', w:'#e8a0d8', b:'#8a6b4a' },
    map: [
      ".b........b.",
      "..b.gggg.b..",
      "...gggggg...",
      "...gfefeg...",
      "....ffff....",
      "ww.gggggg.ww",
      "www.gggg.www",
      "ww.gggggg.ww",
      "...gggggg...",
      "....g..g....",
      "....b..b....",
      "...bb..bb...",
    ]
  },
  priest: {
    pal: { w:'#e8e2d0', d:'#b8b0a0', f:'#e8c9a0', g:'#d8b45a', k:'#3a3155' },
    map: [
      "....gggg....",
      "...g.ff.g...",
      "...wffffw...",
      "...wfkfkw...",
      "....ffff....",
      "..wwwwwwww..",
      ".w.wwggww.w.",
      ".g.wwwwww.g.",
      ".g.wwwwww.g.",
      "...wwwwww...",
      "...wwwwww...",
      "..www..www..",
    ]
  },

  /* ------------- ACT 1 ENEMIES ------------- */
  rotling: {
    pal: { g:'#6b8a3d', d:'#465c28', e:'#f2d16b', k:'#22242c' },
    map: [
      "............",
      "............",
      "...gggggg...",
      "..gggggggg..",
      ".ggeggggegg.",
      ".gggggggggg.",
      ".ggkkkkkkgg.",
      "..gggggggg..",
      "..gg.gg.gg..",
      "..g..gg..g..",
      ".gg..gg..gg.",
      "............",
    ]
  },
  wolf: {
    pal: { b:'#5a4a3a', d:'#3d3228', e:'#e64a3d', k:'#22242c', t:'#8a7a6a' },
    map: [
      "............",
      ".b........b.",
      ".bb......bb.",
      ".bbbbbbbbbb.",
      ".bebbbbbbeb.",
      ".bbbbbbbbbb.",
      "..bbkkkkbb..",
      "...bbbbbb...",
      "..bbbbbbbb..",
      "..bb....bb..",
      "..bb....bb..",
      "..kk....kk..",
    ]
  },
  brute: {
    pal: { m:'#8a6b9e', d:'#5c4470', e:'#f2d16b', s:'#c9b8d8', k:'#22242c' },
    map: [
      "...ssssss...",
      "..ssssssss..",
      ".mmssssssmm.",
      ".mmmmmmmmmm.",
      ".memmmmmmem.",
      ".mmmmmmmmmm.",
      ".mmmkkkkmmm.",
      ".mmmmmmmmmm.",
      "..mmm..mmm..",
      "..mm....mm..",
      ".mmm....mmm.",
      "............",
    ]
  },
  /* ------------- ACT 2 ENEMIES ------------- */
  skeleton: {
    pal: { w:'#d8d2c0', d:'#a09a88', k:'#22242c', r:'#b03a3a' },
    map: [
      "....wwww....",
      "...wwwwww...",
      "...wkwwkw...",
      "...wwwwww...",
      "....wkkw....",
      "...wwwwww...",
      ".w.wwwwww.w.",
      ".w..wwww..r.",
      ".w..wwww..r.",
      "....w..w..r.",
      "....w..w....",
      "...ww..ww...",
    ]
  },
  wraith: {
    pal: { c:'#6bc9c9', d:'#3d8585', k:'#0a1416', e:'#e8f2f2' },
    map: [
      "....cccc....",
      "...cccccc...",
      "..cckcckcc..",
      "..cceccecc..",
      "..cccccccc..",
      "...cccccc...",
      "..cccccccc..",
      ".cccccccccc.",
      ".c.cccccc.c.",
      "...c.cc.c...",
      "....c..c....",
      "............",
    ]
  },
  ooze: {
    pal: { o:'#3d8a5c', d:'#28593c', e:'#f2d16b', h:'#7ac99e' },
    map: [
      "............",
      "............",
      "....oooo....",
      "...oohhoo...",
      "..oohoooeo..",
      ".ooooooooo..",
      ".oeooooooeo.",
      ".oooooooooo.",
      "oooooooooooo",
      "oooooooooooo",
      ".o.oo.oo.o..",
      "............",
    ]
  },
  /* ------------- ACT 3 ENEMIES ------------- */
  zealot: {
    pal: { r:'#c94f5c', d:'#8a2432', k:'#151018', y:'#f2d16b', f:'#d8b0a0' },
    map: [
      "....rrrr....",
      "...rrrrrr...",
      "...rkkkkr...",
      "...rkykyr...",
      "...rrkkrr...",
      "..rrrrrrrr..",
      ".yrrrrrrrry.",
      ".y.rrrrrr.y.",
      ".y.rrrrrr.y.",
      "...rrrrrr...",
      "...rr..rr...",
      "..rrr..rrr..",
    ]
  },
  bloodknight: {
    pal: { r:'#8a2432', d:'#5a1620', s:'#4a4f5c', e:'#f26b5c', k:'#22242c' },
    map: [
      "....ssss....",
      "...ssssss...",
      "...sekkes...",
      "...ssssss...",
      "..rrrrrrrr..",
      ".rrrssssrrr.",
      ".r.rrrrrr.s.",
      ".r.rrrrrr.s.",
      "...rrrrrr.s.",
      "...rr..rr...",
      "...rr..rr...",
      "..sss..sss..",
    ]
  },
  gargoyle: {
    pal: { g:'#7d8291', d:'#4a4f5c', e:'#f2a63d', k:'#22242c', w:'#a8adb8' },
    map: [
      ".w........w.",
      ".ww......ww.",
      ".wwwggggwww.",
      "..wggggggww.",
      "...geggeg...",
      "...gggggg...",
      "...ggkkgg...",
      "..gggggggg..",
      "..gg.gg.gg..",
      "..g..gg..g..",
      "..gg.gg.gg..",
      "............",
    ]
  },

  /* ------------- BOSSES (14x14) ------------- */
  treant: {
    pal: { b:'#5c4430', d:'#3d2d20', l:'#4f8a3d', e:'#f2a63d', k:'#22242c', m:'#6b8a3d' },
    map: [
      "..l..llll..l..",
      ".llllllllllll.",
      ".llbbbbbbbbll.",
      "..bbbbbbbbbb..",
      "..bebbbbbbeb..",
      "..bbbbbbbbbb..",
      "..bbbkkkkbbb..",
      "..bbbbbbbbbb..",
      ".bbbbbbbbbbbb.",
      ".b.bbbbbbbb.b.",
      ".b.bbb..bbb.b.",
      "...bbb..bbb...",
      "...bb....bb...",
      "..bbb....bbb..",
    ]
  },
  sovereign: {
    pal: { w:'#d8d2c0', d:'#a09a88', g:'#d8b45a', k:'#22242c', p:'#7a4fc9' },
    map: [
      "...g.gggg.g...",
      "...gggggggg...",
      "...wwwwwwww...",
      "...wkkwwkkw...",
      "...wwwwwwww...",
      "....wwkkww....",
      "..ppwwwwwwpp..",
      ".pppwwwwwwppp.",
      ".p.pwwwwwwp.p.",
      ".w.pppppppp.w.",
      ".w.pppppppp.w.",
      "...pp....pp...",
      "...ww....ww...",
      "..www....www..",
    ]
  },
  crimsongod: {
    pal: { r:'#c92432', d:'#7a1620', k:'#0a0508', y:'#f2d16b', e:'#ffe8a0', s:'#3a0a10' },
    map: [
      ".y....yy....y.",
      ".yy..yyyy..yy.",
      ".ryyrrrrrryyr.",
      ".rrrrrrrrrrrr.",
      ".rreerrrreerr.",
      ".rrrrrrrrrrrr.",
      "..rrrkkkkrrr..",
      "..rrkkkkkkrr..",
      ".rrrrrrrrrrrr.",
      ".r.rrrrrrrr.r.",
      ".r.rrrrrrrr.r.",
      "...rrr..rrr...",
      "...rr....rr...",
      "..rrr....rrr..",
    ]
  },

  /* ------------- MISC ------------- */
  chest: {
    pal: { b:'#8a5c2a', d:'#5c3d1a', g:'#f2d16b', k:'#22242c' },
    map: [
      "............",
      "............",
      "..bbbbbbbb..",
      ".bbbbbbbbbb.",
      ".bddddddddb.",
      ".bbbbggbbbb.",
      ".bbbbggbbbb.",
      ".bddddddddb.",
      ".bbbbbbbbbb.",
      ".bbbbbbbbbb.",
      "..kkkkkkkk..",
      "............",
    ]
  },
  merchant: {
    pal: { c:'#3d6b8a', d:'#28455c', f:'#e8c9a0', g:'#f2d16b', k:'#22242c' },
    map: [
      "....cccc....",
      "...cccccc...",
      "...cffffc...",
      "...cfkfkc...",
      "....ffff....",
      "..cccccccc..",
      ".c.cccccc.g.",
      ".c.cccccc.g.",
      "...cccccc.g.",
      "...cccccc...",
      "...cc..cc...",
      "..ccc..ccc..",
    ]
  },
  campfire: {
    pal: { o:'#f2a63d', y:'#f2d16b', r:'#e64a3d', b:'#5c4430', k:'#22242c' },
    map: [
      "............",
      ".....y......",
      "....yy.y....",
      "....oyyy....",
      "...ooyyo....",
      "...roooor...",
      "..rrooorr...",
      "..rrrrrrr...",
      "...brrrb....",
      ".bbbbbbbbb..",
      "..bb..bb....",
      "............",
    ]
  },
  shrine: {
    pal: { s:'#7d8291', d:'#4a4f5c', g:'#b8f26b', k:'#22242c' },
    map: [
      ".....gg.....",
      "....gggg....",
      ".....gg.....",
      "....ssss....",
      "...ssssss...",
      "....ssss....",
      "....ssss....",
      "....ssss....",
      "...ssssss...",
      "..ssssssss..",
      ".ssssssssss.",
      "............",
    ]
  },
  skull: {
    pal: { w:'#d8d2c0', k:'#22242c' },
    map: [
      "............",
      "...wwwwww...",
      "..wwwwwwww..",
      ".wwwwwwwwww.",
      ".wwkkwwkkww.",
      ".wwkkwwkkww.",
      ".wwwwwwwwww.",
      "..wwwkkwww..",
      "...wwwwww...",
      "...w.ww.w...",
      "...w.ww.w...",
      "............",
    ]
  },
  crown: {
    pal: { g:'#f2d16b', d:'#c9a02a', r:'#e64a3d' },
    map: [
      "............",
      "............",
      "..g..gg..g..",
      "..g..gg..g..",
      "..gggggggg..",
      "..gggggggg..",
      "..ggrggrgg..",
      "..gggggggg..",
      "..dddddddd..",
      "............",
      "............",
      "............",
    ]
  },
};

/* ============================================================
   CHARACTERS — the 5 playable heroes.
   Any hero you DON'T pick can appear as a recruitable companion.
   companionText / companion(): what they do each turn as an ally.
   relic: the hero's unique starting relic (see RELICS).
   ============================================================ */
const CHARACTERS = [
  {
    id: 'alchemist', name: 'Vesna', role: 'The Alchemist', sprite: 'alchemist',
    maxHp: 66, relic: 'emptybottle', desc: 'Brews potions mid-fight, then tips the odds with buffs and debuffs.',
    companionText: 'Companion: hurls a vial for 4 damage and 1 Vulnerable every turn.',
    starterCards: ['strike','strike','strike','defend','defend','defend','acidflask','acidflask','brew','transmute'],
  },
  {
    id: 'gunslinger', name: 'Calloway', role: 'The Gunslinger', sprite: 'gunslinger',
    maxHp: 70, relic: 'ammobelt', desc: 'A gambler. Every Bullet may crit or ricochet, and Quick Reload rolls for 3-6 Bullets. A chain whip stuns and constricts.',
    companionText: 'Companion: fires 2 shots of 3 damage every turn.',
    starterCards: ['strike','strike','strike','defend','defend','defend','reload','quickreload','quickdraw','whipwrap'],
  },
  {
    id: 'ninja', name: 'Akane', role: 'The Ninja', sprite: 'ninja',
    maxHp: 62, relic: 'cherryblossom', desc: 'Strikes from the smoke. Poison wears foes down while stuns buy time.',
    companionText: 'Companion: applies 3 Poison to a random enemy every turn.',
    starterCards: ['strike','strike','strike','defend','defend','defend','venomshuriken','venomshuriken','shadowstep','smokescreen'],
  },
  {
    id: 'fae', name: 'Thistle', role: 'The Faunus', sprite: 'fae',
    maxHp: 64, relic: 'butterflywings', desc: 'A fae forest spirit that leeches life from its foes and overflows with energy.',
    companionText: 'Companion: drains 3 HP from a random enemy and heals you every turn.',
    starterCards: ['strike','strike','strike','defend','defend','defend','siphon','siphon','dewdrop','leechseed'],
  },
  {
    id: 'priest', name: 'Sister Elara', role: 'The Exorcist', sprite: 'priest',
    maxHp: 72, relic: 'holycross', desc: 'Mends wounds and lays curses on the wicked. Slow, but hard to kill.',
    companionText: 'Companion: heals you for 4 every turn.',
    starterCards: ['strike','strike','strike','defend','defend','defend','smite','smite','curseoffrailty','purify'],
  },
];

/* ============================================================
   CARDS
   type: atk / skl / pow.  cls: which hero's pool ('any' = neutral)
   Effect keys: dmg, hits, aoe, block, heal, selfDmg, draw, energy,
   poison, weak, vuln, str, gold, exhaust,
   dex (gain Dexterity), strDown (enemy loses Strength),
   stun (enemy skips its next move), constrict (turns of Constrict),
   seed (turns of Leech Seed), lifesteal (heal the HP damage dealt),
   cleanse (remove your Weak/Vulnerable), potion (brew N random potions),
   bullets (add N Bullet cards to hand), energyPerTurn (power: +energy
   every turn), cursedBonus (double damage vs. Weak/Vulnerable foes),
   choice (pick one of several effect sets when played)
   unique: a hero's signature card — starter deck only, never offered.
   token: generated mid-combat (Bullets) — never offered.
   Powers (pow) stay in effect for the rest of the fight once played.
   up: overrides applied when upgraded (name gets a +)
   ============================================================ */
const CARDS = {
  /* basics */
  strike:      { name:'Strike', type:'atk', cost:1, cls:'any', rar:0, dmg:6,  up:{dmg:9},  desc:'Deal {dmg} damage.' },
  defend:      { name:'Defend', type:'skl', cost:1, cls:'any', rar:0, block:5, up:{block:8}, desc:'Gain {block} Block.' },
  /* neutral */
  bandage:     { name:'Bandage', type:'skl', cost:1, cls:'any', rar:1, heal:5, exhaust:true, up:{heal:9}, desc:'Heal {heal}. Exhaust.' },
  adrenaline:  { name:'Adrenaline', type:'skl', cost:0, cls:'any', rar:2, draw:2, exhaust:true, up:{draw:3}, desc:'Draw {draw} cards. Exhaust.' },
  luckycoin:   { name:'Lucky Coin', type:'skl', cost:1, cls:'any', rar:2, gold:15, exhaust:true, up:{gold:25}, desc:'Gain {gold} gold. Exhaust.' },
  /* alchemist — potions, buffs, debuffs */
  transmute:   { name:'Transmute', type:'skl', cost:1, cls:'alchemist', rar:1, unique:true, exhaust:true, buff:2, debuff:2,
                 choice:[
                   { label:'🧪 ELIXIR', text:'Gain {buff} Strength and {buff} Dexterity.', fx:{ str:'buff', dex:'buff' } },
                   { label:'☣️ TOXIN',  text:'Apply {debuff} Weak and {debuff} Vulnerable.', fx:{ weak:'debuff', vuln:'debuff' } },
                 ],
                 up:{buff:3, debuff:3}, desc:'Choose: +{buff} Str & +{buff} Dex, OR {debuff} Weak & {debuff} Vuln. Exhaust.' },
  brew:        { name:'Brew', type:'skl', cost:1, cls:'alchemist', rar:0, potion:1, draw:1, exhaust:true, up:{cost:0}, desc:'Brew a random potion. Draw {draw}. Exhaust.' },
  acidflask:   { name:'Acid Flask', type:'atk', cost:1, cls:'alchemist', rar:0, dmg:5, vuln:2, up:{dmg:7,vuln:3}, desc:'Deal {dmg} damage. Apply {vuln} Vulnerable.' },
  volatilemix: { name:'Volatile Mix', type:'atk', cost:2, cls:'alchemist', rar:1, dmg:8, weak:1, aoe:true, up:{dmg:11,weak:2}, desc:'Deal {dmg} damage and {weak} Weak to ALL enemies.' },
  ironskin:    { name:'Ironskin Tonic', type:'pow', cost:1, cls:'alchemist', rar:1, dex:2, up:{dex:3}, desc:'Gain {dex} Dexterity.' },
  liquidcourage:{ name:'Liquid Courage', type:'pow', cost:1, cls:'alchemist', rar:1, str:2, up:{str:3}, desc:'Gain {str} Strength.' },
  mastery:     { name:'Elixir of Mastery', type:'pow', cost:2, cls:'alchemist', rar:2, str:2, dex:2, up:{cost:1}, desc:'Gain {str} Strength and {dex} Dexterity.' },
  grandbrew:   { name:'Grand Brew', type:'skl', cost:2, cls:'alchemist', rar:2, potion:2, exhaust:true, up:{cost:1}, desc:'Brew {potion} random potions. Exhaust.' },
  /* gunslinger — bullets & the chain whip */
  bullet:      { name:'Bullet', type:'atk', cost:0, cls:'gunslinger', rar:0, token:true, dmg:2, vuln:1, gamble:true, exhaust:true, desc:'Deal {dmg} damage, {vuln} Vulnerable. 🎲 May crit or ricochet. Exhaust.' },
  quickreload: { name:'Quick Reload', type:'skl', cost:0, cls:'gunslinger', rar:1, unique:true, exhaust:true,
                 bullets:3, bulletsMax:6, bulletOdds:[0.65, 0.45, 0.25], // chance of at least +1 / +2 / +3 over the base
                 up:{bullets:4, bulletsMax:7}, desc:'🎲 Gamble: add {bullets}-{bulletsMax} Bullets to your hand. Exhaust.' },
  reload:      { name:'Reload', type:'skl', cost:1, cls:'gunslinger', rar:0, bullets:3, up:{bullets:4}, desc:'Add {bullets} Bullets to your hand.' },
  quickdraw:   { name:'Quick Draw', type:'atk', cost:1, cls:'gunslinger', rar:0, dmg:6, bullets:1, up:{dmg:9}, desc:'Deal {dmg} damage. Add {bullets} Bullet to your hand.' },
  dodgeroll:   { name:'Dodge Roll', type:'skl', cost:1, cls:'gunslinger', rar:0, block:6, bullets:1, up:{block:9}, desc:'Gain {block} Block. Add {bullets} Bullet to your hand.' },
  whipwrap:    { name:'Whip Wrap', type:'atk', cost:1, cls:'gunslinger', rar:0, dmg:3, constrict:3, up:{dmg:5,constrict:4}, desc:'Deal {dmg} damage. Constrict for {constrict} turns.' },
  chainlash:   { name:'Chain Lash', type:'atk', cost:2, cls:'gunslinger', rar:1, dmg:8, stun:1, exhaust:true, up:{dmg:12}, desc:'Deal {dmg} damage. Stun the enemy. Exhaust.' },
  steadyaim:   { name:'Steady Aim', type:'pow', cost:1, cls:'gunslinger', rar:1, str:2, up:{str:3}, desc:'Gain {str} Strength.' },
  hogtie:      { name:'Hogtie', type:'skl', cost:2, cls:'gunslinger', rar:2, constrict:3, aoe:true, up:{constrict:5}, desc:'Constrict ALL enemies for {constrict} turns.' },
  fanthehammer:{ name:'Fan the Hammer', type:'skl', cost:1, cls:'gunslinger', rar:2, bullets:5, exhaust:true, up:{bullets:7}, desc:'Add {bullets} Bullets to your hand. Exhaust.' },
  /* ninja — poison & stuns */
  smokescreen: { name:'Smoke Screen', type:'skl', cost:1, cls:'ninja', rar:1, unique:true, weak:2, strDown:2, dex:2, exhaust:true, up:{weak:3,strDown:3}, desc:'Apply {weak} Weak & -{strDown} Str. Gain {dex} Dex. Exhaust.' },
  venomshuriken:{ name:'Venom Shuriken', type:'atk', cost:1, cls:'ninja', rar:0, dmg:4, poison:3, up:{dmg:6,poison:5}, desc:'Deal {dmg} damage. Apply {poison} Poison.' },
  twinkunai:   { name:'Twin Kunai', type:'atk', cost:1, cls:'ninja', rar:0, dmg:4, hits:2, up:{dmg:6}, desc:'Deal {dmg} damage twice.' },
  shadowstep:  { name:'Shadow Step', type:'skl', cost:1, cls:'ninja', rar:0, block:6, draw:1, up:{block:9}, desc:'Gain {block} Block. Draw {draw} card.' },
  nervestrike: { name:'Nerve Strike', type:'atk', cost:1, cls:'ninja', rar:1, dmg:3, stun:1, exhaust:true, up:{dmg:7}, desc:'Deal {dmg} damage. Stun the enemy. Exhaust.' },
  venomcloud:  { name:'Venom Cloud', type:'skl', cost:2, cls:'ninja', rar:1, poison:5, aoe:true, up:{poison:8}, desc:'Apply {poison} Poison to ALL enemies.' },
  hemlock:     { name:'Hemlock', type:'skl', cost:1, cls:'ninja', rar:2, poison:10, exhaust:true, up:{poison:14}, desc:'Apply {poison} Poison. Exhaust.' },
  thousandcuts:{ name:'Thousand Cuts', type:'atk', cost:2, cls:'ninja', rar:2, dmg:3, hits:5, up:{dmg:4}, desc:'Deal {dmg} damage 5 times.' },
  /* faunus / fae — leech & energy */
  leechseed:   { name:'Leech Seed', type:'skl', cost:0, cls:'fae', rar:1, unique:true, seed:3, up:{seed:4}, desc:'Drain 2 HP from the enemy each turn for {seed} turns.' },
  siphon:      { name:'Siphon', type:'atk', cost:1, cls:'fae', rar:0, dmg:6, heal:2, up:{dmg:9,heal:3}, desc:'Deal {dmg} damage. Heal {heal}.' },
  barkskin:    { name:'Bark Skin', type:'skl', cost:1, cls:'fae', rar:0, block:7, up:{block:10}, desc:'Gain {block} Block.' },
  dewdrop:     { name:'Dewdrop', type:'skl', cost:0, cls:'fae', rar:0, energy:1, exhaust:true, up:{energy:2}, desc:'Gain {energy} Energy. Exhaust.' },
  photosynthesis:{ name:'Photosynthesis', type:'skl', cost:1, cls:'fae', rar:1, energy:2, draw:1, exhaust:true, up:{draw:2}, desc:'Gain {energy} Energy. Draw {draw}. Exhaust.' },
  vinelash:    { name:'Vine Lash', type:'atk', cost:2, cls:'fae', rar:1, dmg:12, heal:4, up:{dmg:16,heal:5}, desc:'Deal {dmg} damage. Heal {heal}.' },
  lifebloom:   { name:'Lifebloom', type:'atk', cost:2, cls:'fae', rar:2, dmg:7, aoe:true, lifesteal:true, exhaust:true, up:{dmg:10}, desc:'Deal {dmg} to ALL enemies. Heal the HP dealt. Exhaust.' },
  overgrowth:  { name:'Overgrowth', type:'pow', cost:2, cls:'fae', rar:2, energyPerTurn:1, up:{cost:1}, desc:'Gain 1 extra Energy every turn.' },
  /* priest / exorcist — healing & curses */
  purify:      { name:'Purify', type:'skl', cost:1, cls:'priest', rar:1, unique:true, cleanse:true, draw:1, up:{cost:0}, desc:'Remove your Weak & Vulnerable. Draw {draw}.' },
  smite:       { name:'Smite', type:'atk', cost:1, cls:'priest', rar:0, dmg:8, heal:2, up:{dmg:11,heal:3}, desc:'Deal {dmg} damage. Heal {heal}.' },
  blessedlight:{ name:'Blessed Light', type:'skl', cost:1, cls:'priest', rar:1, heal:7, up:{heal:11}, desc:'Heal {heal}.' },
  holyshield:  { name:'Holy Shield', type:'skl', cost:1, cls:'priest', rar:0, block:7, up:{block:10}, desc:'Gain {block} Block.' },
  curseoffrailty:{ name:'Curse of Frailty', type:'skl', cost:1, cls:'priest', rar:0, weak:2, strDown:1, up:{weak:3,strDown:2}, desc:'Curse: {weak} Weak and -{strDown} Strength.' },
  markofsin:   { name:'Mark of Sin', type:'skl', cost:1, cls:'priest', rar:1, vuln:3, up:{vuln:5}, desc:'Curse: {vuln} Vulnerable.' },
  judgment:    { name:'Judgment', type:'atk', cost:2, cls:'priest', rar:1, dmg:15, weak:2, up:{dmg:20,weak:3}, desc:'Deal {dmg} damage. Apply {weak} Weak.' },
  anathema:    { name:'Anathema', type:'skl', cost:2, cls:'priest', rar:2, weak:2, vuln:2, aoe:true, exhaust:true, up:{weak:3,vuln:3}, desc:'Curse ALL: {weak} Weak & {vuln} Vulnerable. Exhaust.' },
  exorcism:    { name:'Exorcism', type:'atk', cost:2, cls:'priest', rar:2, dmg:10, cursedBonus:true, up:{dmg:14}, desc:'Deal {dmg} damage. Doubled vs. Weak or Vulnerable foes.' },
  divinegrace: { name:'Divine Grace', type:'skl', cost:2, cls:'priest', rar:2, heal:10, block:6, up:{heal:14,block:9}, desc:'Heal {heal}. Gain {block} Block.' },
};

/* ============================================================
   TUNING — numbers for the hero mechanics & starting relics
   ============================================================ */
const TUNING = {
  constrictDmg: 3,           // Constrict: HP lost each turn
  constrictStunChance: 0.25, // ...and chance each turn to be stunned
  leechSeedDrain: 2,         // Leech Seed: HP drained each turn
  flyDamageCut: 0.5,         // Fly: share of attack damage removed
  bottlePotions: 1,          // Empty Bottle: potions brewed per combat
  ammoEvery: 3,              // Ammo Belt: every Nth attack (Bullets don't count)...
  ammoBullets: 2,            // ...adds this many Bullets
  escapeChance: 0.5,         // Cherry Blossom: chance an escape works
  critChance: 0.25,          // Gunslinger Bullets: chance of a critical shot (double damage)...
  ricochetChance: 0.15,      // ...or of a ricochet (+1 Bullet to your hand)
  wingsFly: 3,               // Butterfly Wings: turns of Fly...
  wingsRest: 3,              // ...then turns without, repeating all fight
  crossDex: 3,               // Holy Cross: Dexterity per combat
  handMax: 10,               // generated cards past this go to the discard pile
};

/* ============================================================
   ENEMIES — moves cycle (some pick randomly via 'random:true').
   Move keys: dmg, hits, block, str (self), heal (self),
   poison/weak/vuln (on player), label
   ============================================================ */
const ENEMIES = {
  /* act 1 */
  rotling:  { name:'Rotling', sprite:'rotling', hp:[18,22], moves:[
      { label:'Bite', dmg:6 }, { label:'Bite', dmg:6 }, { label:'Lunge', dmg:9 } ] },
  wolf:     { name:'Thorn Wolf', sprite:'wolf', hp:[24,28], moves:[
      { label:'Claw', dmg:8 }, { label:'Howl', str:2 }, { label:'Pounce', dmg:10 } ] },
  brute:    { name:'Fungal Brute', sprite:'brute', hp:[34,38], moves:[
      { label:'Smash', dmg:10 }, { label:'Spores', poison:3, dmg:4 }, { label:'Harden', block:8 } ] },
  /* act 2 */
  skeleton: { name:'Skeleton Soldier', sprite:'skeleton', hp:[30,34], moves:[
      { label:'Slash', dmg:9 }, { label:'Guard', block:7, dmg:5 }, { label:'Heavy Slash', dmg:13 } ] },
  wraith:   { name:'Crypt Wraith', sprite:'wraith', hp:[28,32], moves:[
      { label:'Chill Touch', dmg:7, weak:1 }, { label:'Shriek', dmg:10 }, { label:'Drain', dmg:6, heal:6 } ] },
  ooze:     { name:'Grave Ooze', sprite:'ooze', hp:[40,46], moves:[
      { label:'Slam', dmg:8, vuln:1 }, { label:'Regrow', heal:8, block:5 }, { label:'Crush', dmg:12 } ] },
  /* act 3 */
  zealot:   { name:'Cult Zealot', sprite:'zealot', hp:[36,42], moves:[
      { label:'Fervor', str:3 }, { label:'Ritual Blade', dmg:13 }, { label:'Frenzy', dmg:7, hits:2 } ] },
  bloodknight:{ name:'Blood Knight', sprite:'bloodknight', hp:[48,54], moves:[
      { label:'Greatsword', dmg:15 }, { label:'Bulwark', block:12 }, { label:'Shield Rush', dmg:9, vuln:2 } ] },
  gargoyle: { name:'Gargoyle', sprite:'gargoyle', hp:[38,44], moves:[
      { label:'Dive', dmg:12 }, { label:'Twin Talons', dmg:7, hits:2 }, { label:'Stoneskin', block:10 } ] },
  /* bosses */
  treant:   { name:'The Rotting Treant', sprite:'treant', hp:[105,105], boss:true, moves:[
      { label:'Rotting Grasp', dmg:7, poison:4 }, { label:'Limb Slam', dmg:15 }, { label:'Deep Roots', str:2, block:10 } ] },
  sovereign:{ name:'The Bone Sovereign', sprite:'sovereign', hp:[135,135], boss:true, moves:[
      { label:'Twin Scythes', dmg:10, hits:2 }, { label:'Royal Decree', block:13, weak:2 }, { label:'Reap', dmg:19 } ] },
  crimsongod:{ name:'The Crimson God', sprite:'crimsongod', hp:[175,175], boss:true, moves:[
      { label:'Crimson Lash', dmg:13 }, { label:'Ascend', str:3, heal:9 }, { label:'Obliterate', dmg:23 }, { label:'Blood Nova', dmg:8, hits:2, vuln:1 } ] },
};

/* encounter pools per act: each entry is a list of enemy ids */
const ENCOUNTERS = [
  [ ['rotling','rotling'], ['wolf'], ['brute'], ['rotling','wolf'], ['brute','rotling'] ],
  [ ['skeleton','skeleton'], ['wraith'], ['ooze'], ['skeleton','wraith'], ['ooze','skeleton'], ['wraith','wraith'] ],
  [ ['zealot','zealot'], ['bloodknight'], ['gargoyle','zealot'], ['gargoyle','gargoyle'], ['bloodknight','zealot'], ['bloodknight','gargoyle'] ],
];
const ACT_BOSSES = ['treant','sovereign','crimsongod'];
const ACTS = [
  { name:'The Blighted Forest', tint:'#1a2414' },
  { name:'The Sunken Crypt',   tint:'#141a24' },
  { name:'The Crimson Citadel',tint:'#24141a' },
];

/* ============================================================
   RELICS — passive trinkets from chests, events & merchants
   starter: a hero's unique starting relic — never found randomly.
   ============================================================ */
const RELICS = {
  /* hero starting relics */
  emptybottle:   { name:'Empty Bottle',    icon:'🍶', starter:'alchemist',  desc:'Brew 1 random potion at the start of every combat.' },
  ammobelt:      { name:'Ammo Belt',       icon:'🔫', starter:'gunslinger', desc:'Every 3rd Attack you play (not Bullets) adds 2 Bullets to your hand.' },
  cherryblossom: { name:'Cherry Blossom',  icon:'🌸', starter:'ninja',      desc:'Once per non-boss fight, try to FLEE: 50% chance to escape (no rewards).' },
  butterflywings:{ name:'Butterfly Wings', icon:'🦋', starter:'fae',        desc:'Fly for 3 turns, then 3 turns without, repeating (Fly: take 50% less attack damage).' },
  holycross:     { name:'Holy Cross',      icon:'✝️', starter:'priest',     desc:'Start each combat with 3 Dexterity.' },
  /* found / bought */
  irontalisman: { name:'Iron Talisman', icon:'🛡️', desc:'+8 Max HP on pickup.' },
  emberring:    { name:'Ember Ring',    icon:'💍', desc:'Start each combat with 1 Strength.' },
  feathercharm: { name:'Feather Charm', icon:'🪶', desc:'Start each combat with 1 Dexterity.' },
  mooncharm:    { name:'Moon Charm',    icon:'🌙', desc:'Heal 3 after every combat.' },
  thiefpurse:   { name:"Thief's Purse", icon:'💰', desc:'+15 gold after every combat.' },
  stonescale:   { name:'Stone Scale',   icon:'🪨', desc:'Start each combat with 5 Block.' },
  bloodvial:    { name:'Blood Vial',    icon:'🧪', desc:'Heal 4 at the start of every combat.' },
  hourglass:    { name:'Hourglass',     icon:'⏳', desc:'Draw 2 extra cards on your first turn.' },
  warhorn:      { name:'War Horn',      icon:'📯', desc:'Gain 1 extra Energy on your first turn.' },
};

/* ============================================================
   POTIONS — max 3 held. combatOnly:false = usable on the map too.
   Effect keys mirror cards: heal, str, block, dmgAll, draw, energy
   ============================================================ */
const POTIONS = {
  healpot:   { name:'Health Potion',    icon:'🧪', desc:'Heal 16 HP.', heal:16, combatOnly:false },
  strpot:    { name:'Strength Potion',  icon:'💪', desc:'+2 Strength this combat.', str:2, combatOnly:true },
  ironpot:   { name:'Iron Potion',      icon:'🛡️', desc:'Gain 12 Block.', block:12, combatOnly:true },
  bomb:      { name:'Fire Bomb',        icon:'💣', desc:'Deal 12 damage to ALL enemies.', dmgAll:12, combatOnly:true },
  swiftpot:  { name:'Swiftness Potion', icon:'🌪️', desc:'Draw 3 cards.', draw:3, combatOnly:true },
  energypot: { name:'Energy Elixir',    icon:'⚡', desc:'Gain 2 Energy.', energy:2, combatOnly:true },
};
const MAX_POTIONS = 3;

/* ============================================================
   BOSS REWARDS — the "gift" node at the start of maps 2 & 3
   ============================================================ */
const BOSS_REWARDS = [
  { id:'gold',   label:'💰 A heavy purse', desc:'Gain 55 gold.' },
  { id:'relic',  label:'🔮 An ancient relic', desc:'Gain a random relic.' },
  { id:'potions',label:'🧪 A potion satchel', desc:'Gain 2 random potions.' },
  { id:'maxhp',  label:'❤️ A blood blessing', desc:'+10 Max HP.' },
  { id:'rare',   label:'🃏 A forbidden page', desc:'Choose 1 of 3 RARE cards.' },
  { id:'upgrade',label:'⚒️ A master\'s lesson', desc:'Upgrade a card.' },
];

/* ============================================================
   MUSIC — tiny chiptune step-sequencer patterns (see Music in game.js)
   Each pattern is 32 sixteenth-steps; numbers are MIDI notes, 0 = rest.
   vol is the track's overall loudness (map is intentionally very quiet).
   Tweak freely — this is placeholder "generated" music.
   ============================================================ */
const MUSIC = {
  menu: {
    bpm: 84, vol: 0.14,
    bass: [33,0,0,0, 0,0,0,0, 29,0,0,0, 0,0,0,0, 31,0,0,0, 0,0,0,0, 28,0,0,0, 0,0,0,0],
    lead: [69,0,0,72, 0,0,76,0, 0,72,0,0, 69,0,0,0, 67,0,0,71, 0,0,74,0, 0,71,0,0, 64,0,0,0],
    pad:  [57,0,0,0, 0,0,0,0, 53,0,0,0, 0,0,0,0, 55,0,0,0, 0,0,0,0, 52,0,0,0, 0,0,0,0],
    hat:  [],
  },
  map: {
    bpm: 58, vol: 0.045,
    bass: [33,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 31,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    lead: [0,0,0,0, 76,0,0,0, 0,0,0,0, 0,0,72,0, 0,0,0,0, 74,0,0,0, 0,0,0,0, 0,0,0,0],
    pad:  [57,0,0,0, 0,0,0,0, 60,0,0,0, 0,0,0,0, 55,0,0,0, 0,0,0,0, 59,0,0,0, 0,0,0,0],
    hat:  [],
  },
  battle: {
    bpm: 138, vol: 0.13,
    bass: [33,33,0,33, 33,0,33,0, 36,36,0,36, 36,0,36,0, 31,31,0,31, 31,0,31,0, 28,28,0,28, 35,0,35,0],
    lead: [69,0,72,0, 69,0,67,0, 72,0,74,0, 76,0,72,0, 67,0,71,0, 67,0,64,0, 71,0,69,0, 67,0,64,0],
    pad:  [],
    hat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,1,1,1],
  },
};

/* ============================================================
   CUTSCENE SCRIPTS
   ============================================================ */
const CUTSCENES = {
  intro: [
    'The Darkspire has stood for a thousand years, drinking the light of the world...',
    'Three lords guard its heights: the Treant, the Sovereign, and the Crimson God.',
    '{name} tightens their grip, and steps through the gate.',
  ],
  victory: [
    'The Crimson God crumbles, screaming, into a rain of dying embers...',
    'Sunlight touches the valley for the first time in a thousand years.',
    '{name} descends the spire — a legend now, whispered around every campfire.',
  ],
  defeat: [
    'Darkness closes in. {name} falls to one knee, then to the cold stone...',
    'The spire drinks deep, and the world forgets another hero.',
    'But heroes are stubborn things. Another will rise. Perhaps... you?',
  ],
};

const HOW_TO_PLAY = `
<p><b>GOAL:</b> Climb 3 levels of the Darkspire, defeat the boss at the top of each, and slay the Crimson God.</p>
<p><b>MAP:</b> Pick a glowing node to travel. ⚔️ fight &nbsp;💰 chest &nbsp;❓ mystery &nbsp;🛒 merchant &nbsp;🔥 rest/upgrade &nbsp;💀 boss</p>
<p><b>COMBAT:</b> Each turn you get 3 Energy and draw 5 cards. Tap a card, then tap an enemy if it needs a target. Enemies show their next move above their head. Block soaks damage but resets each turn.</p>
<p><b>COMPANIONS:</b> Mystery nodes may let you recruit one of the other heroes — they act automatically every turn.</p>
<p><b>MYSTERY NODES:</b> ❓ can be a friend, a gift... an ambush, or a minigame challenge with prizes.</p>
<p><b>POTIONS:</b> You can carry up to 3. Tap one in the top bar to drink it (most work only in combat).</p>
<p><b>HEROES:</b> each hero starts with a unique relic (tap relic icons in the top bar to read them) and most have a signature card. 🎲 Gunslinger Bullets have a 25% chance to crit (double damage) and a 15% chance to ricochet (+1 Bullet).</p>
<p><b>STATUSES:</b> ☠ Poison: lose HP each turn, drops by 1. 💪 Strength: +damage (can go negative). 💨 Dexterity: +Block from cards. 🌀 Weak: deal 25% less. 🎯 Vulnerable: take 50% more. 💫 Stun: skips its next move. ⛓️ Constrict: lose 3 HP each turn, 25% chance to be stunned. 🌱 Leech Seed: you drain 2 HP from it each turn. 🦋 Fly: take 50% less attack damage.</p>
<p><b>POWERS</b> last for the rest of the fight once played.</p>
<p><b>MERCHANT:</b> sells cards, 3 potions and 3 relics. You can purge one card per visit, and the price rises by 25 each time.</p>
<p><b>SAVING:</b> Your climb is saved automatically at the map. One save slot — CONTINUE from the menu, or RESET SAVE to wipe it.</p>
`;
