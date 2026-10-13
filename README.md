# DARKSPIRE — rogue-lite card RPG (functional prototype)

Open **index.html** in any browser (works on mobile too). No server needed.

## Files
- **index.html** — screen layout (menu, character select, map, combat, events, cutscene, results)
- **style.css** — all styling. Dark pixel theme; colors/sizes are easy to retheme.
- **data.js** — ALL game content: placeholder pixel sprites, the 5 heroes, cards, enemies, 3 bosses, relics, events, cutscene text. **This is the file to edit when you remake assets.**
- **game.js** — the engine (map generation, card combat, companion, shops/events, score). You shouldn't need to touch this to swap art.

## Swapping in your own art
Every sprite is a text pixel-map in `SPRITES` (data.js) rendered by `drawSprite()` (top of game.js).
To use real images instead: replace `drawSprite(canvas, id)` with your own function that
`ctx.drawImage()`s a PNG keyed by the same sprite id — nothing else needs to change.

## Game structure
- Start menu → choose 1 of 5 heroes → 3 levels, each a branching map with a **single starting
  node** (fights ⚔️, chests 💰, mystery ❓, merchants 🛒, rest/upgrade 🔥) and a boss 💀 on top.
- After a boss falls, the next map starts with a 🎁 **BOON node**: choose 1 of 3 random rewards.
- Mystery ❓ nodes can be: a **companion** offer (one of the 4 heroes you didn't pick, acts
  automatically every turn), an **ambush** fight, a **minigame** (The Gauntlet — jump/attack
  side-scroller, or Coin Squall — catch coins dodge skulls), or story events.
- **Potions**: carry up to 3, tap them in the top bar (most are combat-only). Drops from
  fights/chests, sold by merchants.
- Combat: 3 energy, draw 5, enemies telegraph intents. Poison / Weak / Vulnerable / Strength.
- Die or beat the Crimson God → short cutscene → score + full run stats.

## Saving
One save slot in localStorage, written automatically every time you're on the map.
CONTINUE resumes it; RESET SAVE (tap twice) wipes it; dying wipes it too (rogue-lite rules).
Quitting mid-fight rewinds to before that node — no fight-skipping.

## Music
All three tracks (menu, very-quiet map, battle) are generated live by a tiny chiptune
sequencer — no audio files. Patterns live in `MUSIC` (data.js): 32 sixteenth-note steps per
loop, MIDI note numbers, 0 = rest. Change `bpm`/`vol` or rewrite the patterns freely.
The 🔊 button (top-right) mutes everything.

## Tuning knobs (data.js)
- Hero HP / starter decks → `CHARACTERS`
- Card numbers & upgrades → `CARDS` (the `up:{}` object is the upgraded version)
- Enemy HP / move patterns → `ENEMIES`, encounter mixes → `ENCOUNTERS`
- Relic effects → `RELICS`, potions → `POTIONS`, boss-kill rewards → `BOSS_REWARDS`
- Story text → `CUTSCENES`, music → `MUSIC`
- Difficulty: enemy stats above, plus post-boss heal % and gold amounts in game.js
