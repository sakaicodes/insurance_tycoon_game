# Changelog

## 0.5.0
- **Global leaderboard (Supabase).** At game over, runs are posted to the `submit-score` Edge Function, which checks plausibility, recomputes the score with the game's formula, rate-limits by hashed IP and rejects duplicates. The leaderboard has Global and This device tabs, with All, London, New York and Bermuda filters. Offline submissions are queued and retried on the next visit. Idle mode runs are never sent. Config lives in `src/data/online.js`; the table and function are in `supabase/`.
- **Penthouse locked to the top:** it sits directly under the roof, with the build slot beneath it, so new floors always appear below it.
- **CEO moves in:** after the penthouse is bought, the CEO walks to the lift, rides it up the shaft and stays in the penthouse.
- Fixed: the game-over screen crashed for runs that had used idle mode and then switched it off.

## 0.4.3
- Achievements: 55 new ones (70 in all) across eight categories: Tower, Career, Money, Claims, Black swans, Strategy, Cities and Exits. New tracking for black swans survived by kind (and with no cover), lawsuits won, poaching attempts fended off, star shop purchases, profitable time away, black swans while away, and the cities you've founded companies in (stored with your golden tickets, so it spans runs).
- The Boardroom shows achievements in collapsible categories with progress counts. When several unlock at once (for example, on loading an older save), they're announced in one message.
- Fixed: the exit strategy opened at Synergy Whisperer instead of Thought Leader.

## 0.4.2
- Raised the exit thresholds: private equity now needs 1,000,000 cash and a share price of 150; an IPO needs 2,500,000 cash, a share price of 250 and 70% board confidence (still from Thought Leader and quarter 8).

## 0.4.1
- Penthouse: one per company (it can no longer be sold and rebought), now 20 stars with 6-star upgrades. Saves with more than one keep a single penthouse at the top.
- Exit strategy thresholds: private equity needs at least 150,000 cash and a share price of 50; an IPO needs 250,000 cash, a share price of 70 and 60% board confidence. Both still need Thought Leader and quarter 8. The Boardroom lists each requirement with a tick and your current figure.
- Bermuda buses use the classic pink-over-blue livery with a white band.

## 0.4.0
- **Cities:** choose London, New York or Hamilton, Bermuda when a run starts. Each has its own building (the Walkie Talkie; the Metropolitan Life Insurance Company Tower with a clock showing the real time; a pastel Front Street office with a white stepped Bermudian roof), skyline, street details, vehicles and currency (£ or $).
- **Career cutscenes** starring the player's CEO: one for each promotion (with a prop per title), for being fired, going bankrupt and losing the licence, and for an IPO or a private equity sale.
- **Exit strategy:** from Thought Leader and quarter 8, sell to private equity (guaranteed) or IPO (0.8x to 1.6x, needs 60% board confidence). Ends the run with a score bonus and a golden ticket (seed cash, +3 stars, +5% income per ticket up to 4) stored across runs.
- **Penthouse:** a 12-star top floor with five star-funded upgrades (piano, aquarium, art, chandelier and telescope). The CEO splits time between it and The Room. It doesn't count towards build costs, salaries, compliance or floor goals.
- **Star shop:** repeatable purchases (board confidence, customer mood, share price, removing a regulator warning). Unspent stars add up to 40% to the sale value.
- **CEO styles:** a women's/men's toggle with balanced sets: 9 hairstyles, 4 outfits and 4 makeup or facial-hair options each, plus glasses, earrings and freckles. Staff and customers gain beards, bald heads, quiffs and headscarves.
- **Floor numbers** on every name plate (PH for the penthouse).
- **Idle mode** can be switched off; a run that used it stays unscored and shows "(unranked)".
- **Away time** now produces a full ledger anchored to recent quarters: premiums, genuine claims, fraud that slipped through, salaries, insurance, and black swans rolled per quarter (with the usual 3-quarter gap). Losses stop at 80% of the overdraft limit.

## 0.3.1
- CEO creation now offers 10 hairstyles (short, pixie, bob, long, ponytail, bun, curly, braids, messy, cap), 4 outfit styles (suit and tie, blazer and blouse, skirt suit, dress) and extras (lashes, lipstick, earrings, glasses). Options aren't tied to a gender; anything can be combined. Portraits and the walking CEO sprite show every choice.
- Office staff and customers get the same variety of hairstyles, skirts, dresses, blouses and earrings.

## 0.3.0
- Replaced all black swans with eight based on real reinsurance events, each with a satirical twist and a new cutscene in the game's art style: Hurricane Deductible makes landfall, Ship wedged in the canal, The update that broke the world, The volcano nobody can pronounce, Everything is cancelled, Megabank goes bust overnight, Rocket launch goes boom, The solar superstorm.
- The cutscene player now uses the City look: navy banner with a red BREAKING tag, brass frame, cream dialogue box.
- Black swans arrive with no warning. The Risk Dept no longer warns; it now trims every black swan loss by 4% per level (up to 20%).
- Added event cancellation cover (2% of quarterly premiums).
- The tutorial has a new Black swans step, and the Boardroom intro and How to play explain that reinsurance pays 90%.
- Saves with a pending black swan from an older version get one of the new ones.

## 0.2.1
- Replaced the brown wood theme with a City look: navy frames, brass trim and cream paper menus; slate-blue office carpets, stone desks with navy legs, navy panelling, a marble lobby with a navy rug, a navy marble lift shaft with a brass lift, grey stone paving, and navy character outlines.

## 0.2.0
- Create your CEO at the start of every run: name, company name, skin tone, hairstyle, hair colour and outfit, with a live portrait preview.
- Your CEO walks around The Room (tap them to open the Boardroom) and appears in the Boardroom, tutorial, earnings calls, promotions, endings and leaderboard.
- Names are locked for the run; the Boardroom rename option is gone. Saves from before 0.2.0 get a one-time setup.
- New cozy look inspired by farming-sim games: wood-and-parchment menus, plank floors, wallpaper and wainscoting, brass pendant lamps, wooden desks with plants, chunkier characters with soft brown outlines, brick lift shaft, brighter sky and a grass verge. Black swan cutscenes are unchanged.

## 0.1.0
- Rename your company from the Boardroom (Company name, at the top). The roof sign, browser tab, tutorial, cutscenes and leaderboard all follow.
- The version number shows in the corner of the screen and on the How to play screen, with a What's new list and an "Updated to vX" notice for returning players.
- New black swans: a great white in the Thames and a rocket launch that goes boom.
- The source is now split into separate files for data, art, game systems, UI and styles, bundled into one HTML file by `build.js`.
