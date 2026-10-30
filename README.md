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
- **Merchant** 🛒: 3 cards, 3 different potions, 3 different relics, healing, and one card
  purge per visit (55 gold, +25 every time you purge).
- Combat: 3 energy, draw 5, enemies telegraph intents. Poison / Weak / Vulnerable / Strength /
  Dexterity / Stun / Constrict / Leech Seed / Fly.
- Die or beat the Crimson God → short cutscene → score + full run stats.

## Heroes
Each hero starts with a unique relic; signature cards are starter-deck only.
| Hero | Plays like | Signature card | Starting relic |
|---|---|---|---|
| Vesna, the Alchemist | brews potions, buffs & debuffs | **Transmute**: choose +2 Str & +2 Dex, or 2 Weak & 2 Vulnerable | **Empty Bottle**: brew 1 potion every combat |
| Calloway, the Gunslinger | a gambler: Reload cards add 0-cost **Bullets** (2 dmg + 1 Vulnerable) that can crit (25%, double damage) or ricochet (15%, +1 Bullet); chain whip stuns & constricts | **Quick Reload** (0 energy): roll for 3-6 Bullets (65% for 4+, 45% for 5+, 25% for 6) | **Ammo Belt**: every 3rd attack (not Bullets) adds 2 Bullets |
| Akane, the Ninja | poison & stuns | **Smoke Screen**: 2 Weak, -2 Str, gain 2 Dex | **Cherry Blossom**: once per non-boss fight, 50% chance to flee |
| Thistle, the Faunus | leech & energy | **Leech Seed** (0 energy): drain 2 HP for 3 turns | **Butterfly Wings**: Fly (50% less damage) for 3 turns, off for 3, repeating |
| Sister Elara, the Exorcist | heals & curses | **Purify** (1 energy): remove your Weak & Vulnerable | **Holy Cross**: 3 Dexterity each combat |

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
- Hero HP / starter decks / starting relic → `CHARACTERS`
- Constrict, Leech Seed, Fly and starting-relic numbers → `TUNING`
- Card numbers & upgrades → `CARDS` (the `up:{}` object is the upgraded version)
- Enemy HP / move patterns → `ENEMIES`, encounter mixes → `ENCOUNTERS`
- Relic effects → `RELICS`, potions → `POTIONS`, boss-kill rewards → `BOSS_REWARDS`
- Story text → `CUTSCENES`, music → `MUSIC`
- Difficulty: enemy stats above, plus post-boss heal % and gold amounts in game.js
