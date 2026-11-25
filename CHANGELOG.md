# Changelog

## 0.9.3
- Tutorial: the welcome step always said "a syndicate in the London insurance market"; it now uses the chosen city's market (for example, "Singapore’s Asian insurance hub"). "Pause and help" now also mentions the 🔊 button.

## 0.9.2
- **Gazette button:** the Gazette is no longer a Boardroom tab. A 📰 button in the HUD (beside Pause, ? and 🔊) opens it in its own panel (`openGazette()`), and the unread dot moved from the Boardroom button to it. "Read the Gazette" on the earnings call opens the same panel.
- **Daily tab:** the Boardroom's 📅 Daily tab (in the Gazette's old place) holds the daily challenge card, today's top three and a button for the full Today leaderboard; during a daily it shows the goal, twist and "Leave and return to my company". The daily section was removed from the Company tab.
- The HUD timer reads "Q7 call in 41s" (was "Q7 earnings call in 41s"), so the earnings bar keeps its length with the extra button.
- Tutorial: "Earnings calls" mentions the 📰 button; "The Boardroom" mentions the Daily tab. How to play and the README are updated to match.

## 0.9.1
- **Two-step setup.** Step 1 (Your CEO) has the name, company and look; "Next: choose your city" checks there's a name first. Step 2 (Your city) shows a two-column grid of city tiles, each with a thumbnail of that city's real skyline (`cityThumb()` draws it once in daytime and caches it), currency and market; the selected city's description, risks and home-market lines appear below. Back returns to step 1 and keeps the typed names.
- **Surprise me** picks a random city other than the current one and says so. The grid grows by rows, so adding cities no longer lengthens the page much.

## 0.9.0
- **New city: Singapore** (currency S$). A glass garden tower with green terraces and a rooftop infinity pool with palms (`roofSingapore`); skyline with the strait, ships and port cranes, glassy towers, Supertrees and a three-tower sky park at the edges, and a lion statue for wide screens (`skylineSingapore`); orchid planters and a hawker stall (`singaporeStreet`); an MRT entrance with a "no durians" sign and a red-and-blue-striped train in the tunnel; green buses and blue taxis; a gong for earnings calls. Risks: canal 1.6×, IT meltdown 1.3×, bank 1.2×, hurricane 0.4×, ash 0.5×, solar 0.7×; home bonuses on Marine (1.12×) and Treaty (1.1×). Achievement "Lion City"; Globetrotter now needs all five cities.
- **Singapore-only black swans:** "The Great Haze" (event cancellation cover; Specialty 1.7×) and "Monsoon flash floods" (catastrophe cover; Property 1.8×, Treaty 1.4×), each with a cutscene, portrait, line and achievement.
- **Easter eggs** (`src/ui/eggs.js`): company names containing "Lutine" (the bell rings twice) or "1688" (Lloyd's coffee house), CEOs named "Lloyd" or "Percy"; tap Percy 10 times to crown him; tap the version number 7 times for joke credits; the Konami code (↑↑↓↓←→←→BA) starts a minute of pigeon claims; tiny tappable fine print at the bottom of How to play; date eggs for 1 April (prank claims, an upside-down Gazette headline), 24–26 December (festive claims) and Friday the 13th; playing at 3am. Seven secret achievements in a new Secrets category show as "🔒 ???" until found.
- **Content:** 53 new line-specific claims (193 in total) and 80 more claimant names.
- **Supabase:** `20261124000000_singapore.sql` adds `singapore` to the allowed cities on `scores`, `plays` and `daily_scores`; `submit-score` accepts it. Both are needed before Singapore runs can reach the leaderboards.
- The leaderboard's city filters now sit in two rows of three.

## 0.8.3
- The daily challenge card is no longer shown on the Create your CEO screen; it's only in the Boardroom, now as the first section of the Company tab.
- The tutorial's Boardroom step says the daily challenge lives in the Company tab (the mention in "How it ends" was removed so it's explained once).

## 0.8.2
- Tutorial: "The Boardroom" now mentions the Gazette tab and daily challenges; "How it ends" covers selling, stepping down from quarter 4 and the daily challenge.
- How to play: the black swans entry describes Light, Balanced and Strong protection and exposure-based prices (it still described the old flat cover), and there are new entries for the Gazette, the four cities, the three leaderboards and ending your run on your own terms.
- README: merged the two "Releasing a new version" sections; added the new files to the project structure; new "Features and where they live" section (lines of business, your own insurance, the Gazette, daily challenges, endings, leaderboards); the cities section covers Zurich, the metro and city-only black swans.

## 0.8.1
- Fixed: toasts appeared at a fixed position that overlapped the daily challenge progress bar (and the update banner). A new `layoutOverlays()` stacks everything floating under the HUD in order (daily bar, update banner, then toasts), re-run every second, whenever a toast appears, and when the banner is shown or dismissed. Outside dailies, toasts stay in their usual place.

## 0.8.0
- **Daily challenges** (`src/data/daily.js`, `src/ui/daily.js`). Each UTC day's challenge is generated from the date: format (fixed length, race to a profit target of 40K, 55K or 70K, or a daily objective worth a 1.5× bonus), city, one of eight twists (early hurricane, litigation boom, cheap reinsurance, soft market, tight-fisted board, generous backers, customers love you, Treaty only), the objective, and when one or two black swans strike. Every player gets the same challenge; nothing needs publishing.
- Runs last at most 12 quarters (race runs end as soon as the target is hit), idle mode and away-time progress are off, and the run saves to its own slot (`fineprint-daily-run`), so the main company is untouched and its clock is paused. Daily runs never touch the main leaderboard or exit interviews.
- **Where:** a daily card on the setup screen and in the Boardroom's Company tab (with your best today, attempts and the top three), a progress bar under the HUD during the run, a results screen with Try again and Back to my company, and a 📅 Today leaderboard view.
- **Supabase:** `20261122000000_daily.sql` adds `daily_scores` (one row per player per day, holding their best; public reads limited to leaderboard columns). `submit-score` accepts `type: "daily"`, recomputes the score, only accepts today's or yesterday's date, keeps the better attempt, counts attempts, and returns today's rank and number of players.
- How to play has a Daily challenge entry. The main company's clock is paused during dailies, so time spent in one doesn't count as time away.

## 0.7.1
- **The Fine Print Gazette** (`src/ui/gazette.js`): an edition is written at every earnings call and read in a new 📰 Gazette tab in the Boardroom (never as a pop-up). The headline and lead story react to the quarter: a black swan that quarter (covered or not), a loss, a big beat, an in-line or modest beat, or a miss, with the real profit and the City's expectation; regulator warnings get a mention. Also: Markets (your share price with direction, a rival's move, and a city index: Biscuit, Bagel, Rum futures or Franc-o-meter), Rival gossip, Percy's corner and Classifieds, drawn from pools without quick repeats.
- The last 8 editions are kept with the run; arrows flip between them. A red dot on the Boardroom button and the tab marks an unread edition.
- The earnings call has a "📰 Read the Gazette" button beside "Hang up". It closes the call through the usual checks (game over, board patience, promotion), then opens the Gazette tab, unless a promotion or ending screen needs to show first.
- Black swans are now recorded (`S.lastSwanEvent`) so the next edition can lead with them.
- No Supabase changes.

## 0.7.0
- **Update check.** `build.js` now writes `dist/version.json` (`version`, `minVersion` from `package.json`, and the latest three changelog notes). The game fetches it on load, every 10 minutes and when the tab regains focus (skipped on claude.ai and when opened as a local file). A newer version shows a dismissible banner; a current version below `minVersion` shows a blocking "Update required" screen. Both save first and reload with `?v=<version>` to bypass caches. `version.json` must be deployed next to the game.
- **Server-side minimum version.** `submit-score` rejects finished runs older than the `MIN_VERSION` secret (default `0.0.0`) with status 426. The game queues the score, shows the update screen, and sends it after updating (queued scores are re-stamped with the new version).
- **Reinsurance layers.** Each cover is a layer: you pay a retention, the reinsurer pays up to a limit, and anything above comes back to you. Presets: Light (retention 1.5, limit 2.0), Balanced (0.6, 3.0) and Strong (0.25, 4.5), in quarters of premium scaled by your exposure to the disasters that cover pays for. "Customise the layer" offers retention and limit sliders. Existing covers become Balanced.
- **Exposure-based pricing.** Price = base rate × protection factor × exposure (your book and city, averaged over the disasters the cover pays for) × market (+35% after a disaster of that type, easing 30% per quarter) × Capital Modelling discount × reinsurance perk. "Why this price?" shows each factor. Switching level takes effect immediately; the new price applies from the next renewal.
- Damage reports show what the layer paid, when a loss fell within the retention, and anything above the limit. Cover descriptions no longer mention a flat 90%, and D&O cover is now "Financial lines cover".

## 0.6.8
- **Zurich-only black swans.** `SWANS` entries can now carry `city`; such swans are added to the draw (weight 1.5) only in that city, and the Book tab lists only the swans that can happen where you are (`citySwans()`).
  - **The Franc Shock** (financial lines cover, softened by Capital Modelling): the rate board crashes from 1.20 to 0.85 as a cuckoo clock pops, banknotes flee and a chocolatier's bars slide off the tray. Ueli from the treasury desk explains. Exposure: Treaty 1.7×, Marine 1.2×, Specialty 1.1×, Property 0.7×.
  - **The Gotthard gets blocked** (catastrophe cover, softened by Capital Modelling): derailed wagons at the tunnel portal, freight queuing on the approach, a recovery crane, and a goat carrying cheese over the pass. Reto from rail logistics explains. Exposure: Marine 1.9×, Specialty and Treaty 1.3×, Cyber 0.4×.
  - New achievements: "Strong currency, weak knees" and "The long way round". "Seen it all" still covers the original eight swans, so it stays achievable in every city.
- **Cuckoo clock:** in Zurich, each earnings call opens with a two-note cuckoo (new `cuckoo` sound) and a toast.
- No Supabase changes are needed.

## 0.6.7
- **New city: Zurich** (currency CHF). A Mythenquai-style headquarters: sandstone sides with stone string courses, a green copper mansard roof with dormers, a gilded lantern and the Swiss flag. Skyline: the Alps, Lake Zurich with a paddle steamer and swans (one black), old-town houses, the Grossmünster's twin towers, the Fraumünster's green spire and St Peter's clock (showing the real time). Street: blue-and-white trams, dark taxis, a fountain and a bicycle. Wide screens fill out with Alps, lake and old town.
- **Zurich's risk profile:** bank collapse 1.4×, IT meltdown and ash 1.2×, canal 0.8×, hurricane 0.6×; home-market bonuses on Treaty Reinsurance (1.12×) and Property (1.08×).
- **Achievements:** new "Swiss precision" (Thought Leader in Zurich); "Globetrotter" now requires all four cities (players who already earned it keep it).
- **Leaderboard:** Zurich filter and flag.
- **Supabase:** `20261120000000_zurich.sql` adds `zurich` to the allowed cities on `scores` and `plays` (no data changes), and `submit-score` accepts it. Both are needed before Zurich runs can reach the global leaderboard.

## 0.6.6
- **London Tube and New York subway:** a 20-pixel cutaway under the road (`tunnelH()`, London and New York only) showing a tunnel: a round tube bore with wall lamps in London, a cut-and-cover tunnel with blue steel columns in New York. A two-car train (white, red and blue tube stock in London; stainless steel in New York) runs through it periodically, like the street traffic. Each city gets a station entrance on the pavement beside the tower: a "TUBE" sign over the stairs in London, and green globe lamps with a "SUBWAY" sign in New York. Official logos aren't used. Bermuda is unchanged.
- Fixed: bus and cab sprites were painted once at load, so after starting a company in a different city in the same session, the previous city's vehicles (for example, pink Bermuda buses) appeared until the page was reloaded. They are now repainted on every tower rebuild, which happens whenever the city changes.

## 0.6.5
- **Exit interview:** after the ending cutscene and before the ending screen, an optional card asks for a 1–5 star rating, quick tags (Made me laugh, Too easy, Too hard, Confusing, Found a bug, Want more content) and a comment of up to 500 characters. Skip is always available, and the score is recorded either way. Only shown when the global leaderboard is reachable.
- **Opting out:** from a player's second run the card includes "Don't ask me again"; the Boardroom's Company tab has an On/Off toggle to change it at any time.
- **Supabase:** new private `feedback` table (`20261118000000_feedback.sql`) with no run or player ID, only rating, tags, comment, ending, quarters, city and version. `submit-score` accepts `type: "feedback"`, keeps only known tags, strips HTML from comments, ignores empty feedback and rate-limits to 10 per hour per connection.
- Fixed: reloading on the ending screen always showed "Bankrupt"; the ending reason is now saved.

## 0.6.4
- **Paging:** the global leaderboard loads 20 scores per page using range requests with an exact count, showing "Showing 21–40 of 273" and Previous/Next buttons. Ranks continue across pages and the city filters still apply. "Find my best run" works out your best run's rank and opens its page with the row highlighted.
- **Run count:** the leaderboard shows the total number of recorded runs, including those from before this update (`runs` in the `leaderboard_stats` view). A random anonymous player ID (stored in the browser, no personal data) is also sent with each score, and run starts are recorded privately in a new `plays` table (see `play_stats` in the SQL editor) when a CEO is created.
- **Monospaced leaderboards:** all leaderboard tables use VT323, with rank, score and quarters right-aligned in tabular figures.
- **Top-5 celebrations:** the Edge Function returns the new run's world and city rank. A top-5 finish shows a counting rank reveal with a medal (gold, silver, bronze or a rosette) and confetti on the game-over screen, and the row slides in and glows on the leaderboard while the rows below shuffle down. Rank 1 also plays a podium cutscene. Motion is reduced for players who prefer it.
- **Supabase:** new migration `20261116000000_players_and_stats.sql` (player_id column, plays table, stats views, and public reads restricted to the leaderboard columns so `ip_hash`, `run_id` and `player_id` stay private). The `submit-score` function records run starts, returns ranks, and hashes IPs with an optional `IP_SALT` secret.

## 0.6.3
- **Step down:** a new ending in the Boardroom's Company tab, available from quarter 4, with a confirmation step. It records the run like any other ending (on the device and, unless idle mode was used, on the global leaderboard) with no sale bonus or golden ticket. The golden parachute perk doesn't intervene.
- **Farewell cutscene:** a leaving do with sagging bunting, a "SO LONG …" banner using the CEO's name, colleagues in party hats (one asleep), the Chair's endless speech, Percy eating the cake, one limp party popper, and the CEO leaving with a carriage clock. The CEO's portrait delivers one of three parting lines.
- New achievement, Quit while ahead (71 in total).
- `submit-score` now accepts up to 150 achievements (was 70), so new achievements can't cause a valid run to be rejected. Redeploy the function to apply this.

## 0.6.2
- **Mood baseline:** premiums are neutral at 50% customer mood, ±1.2% per point (clamped to −60% and +60%), still scaled by each line's mood sensitivity.
- **Slower start:** a business volume factor (applied to both premiums and claims) starts at 70% and reaches 100% at 25 total floor levels. A diversification bonus of +6% per extra line of business (max +30%) applies to premium. In bot tests, premiums by quarter 4 fell from about £35K to about £10K, while quarter 10 and 20 totals stayed similar.
- **City risk:** each city has disaster multipliers that scale both how often each black swan is picked and how much it costs (Bermuda: hurricanes 1.7×; New York: IT meltdown and bank collapse 1.5×; London: ash 1.4×, bank 1.3×, canal 1.2×), plus home-market premium bonuses (London: Marine and Specialty; New York: Casualty, Excess Casualty and Cyber; Bermuda: Treaty and Property). The setup screen describes each city's risks.
- **Actionable exposure:** the Book tab shows a card per disaster with your exposure, whether you hold the cover that pays for it, which floor softens it (and its level), and which line and city make it worse. The damage report also mentions when your city made a disaster worse or better.
- Fixed exposure numbers overflowing their rows and showing beside the Boardroom tabs.

## 0.6.1
- Tutorial: "Build floors" now covers choosing a line of business or actuarial specialism and retraining; "The Boardroom" describes the tabs; "Black swans" points to the Risk tab and notes that your mix of business changes how hard disasters hit.
- How to play has a new entry on lines of business and actuaries, and the Boardroom's first-time pricing intro points to the tabs.
- Boardroom tabs wrap onto extra rows and fill each row evenly, instead of overflowing in a single scrolling line.

## 0.6.0
- **Lines of business.** Underwriting floors pick a line when built: Property, Casualty, Excess Casualty (from Synergy Whisperer), Marine, Cyber, Specialty or Treaty Reinsurance (from Thought Leader). Each has its own premium rate, claim frequency, claim size, lawsuit appetite, sensitivity to customer mood and exposure to each black swan (in `src/data/lines.js`). Claims are drawn from the lines you write, weighted by premium and frequency, with 145 line-specific claim texts.
- **Actuarial specialisms.** Cat Modelling is renamed Actuarial. Pricing: +6% premium per level (max +40%). Reserving: −6% claim costs per level (max 40%) plus a chance of a reserve release (5% of a quarter's premium) at each earnings call. Capital Modelling: −8% black swan losses per level (max 50%), −6% capital requirement per level (max 40%), −5% cover costs per level (max 25%). Existing floors default to Property and Capital Modelling.
- **Retraining.** Any Underwriting or Actuarial floor can switch line or specialism for 40% of the current build cost. Executives building on autopilot pick the least-held line or specialism.
- **Black swan exposure.** Losses scale with how exposed your book is to that disaster (for example, Treaty and Property feel hurricanes hardest, Marine the canal, Cyber the IT meltdown), and the damage report says which line took the worst of it.
- **Customer mood and premiums.** The mood multiplier is now neutral at 65% mood, from −75% at 0% to +56% at 100%, scaled by each line's sensitivity (Treaty clients barely notice). The HUD shows the current effect.
- **Boardroom tabs:** Overview, Book, Risk, Team, Money, Stars and Company. The new Book tab shows the mix of business, mood effect, actuaries and exposure to every black swan.
- **Rooms** show their line or specialism in the name plate (for example, "Marine Underwriting") and with a small prop.
- 130 new claimant names.

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
