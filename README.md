# Insurance Tycoon

A satirical London-market insurance tower game. You write the source as separate files; `build.js` bundles them into **one self-contained HTML file** that runs anywhere.

## Build

Needs Node.js (any recent version). No packages to install.

```
node build.js           # writes dist/index.html
node build.js --check   # same, then checks the bundled script parses
```

Open `dist/index.html` in a browser to play. Phaser 3.80.1 and the fonts load from a CDN.

## Project structure

```
build.js                 bundles everything into dist/
package.json             version number lives here
src/
  index.html             page template (HUD, dock, panels); the build fills in styles and scripts
  manifest.json          the order files are bundled in (order matters, see below)
  styles/                CSS, split by area; theme-city.css (loaded last) sets the navy, brass and cream look
  core/                  small utilities and game constants (VERSION lives in constants.js)
  data/                  content you can edit without touching game logic
    claims.js            claimant names, claim stories, named claims (Nathaniel, Gareth, Nick), fraud tells, reviews
    events.js            the random events and their choices
    floors.js            floor types, their upsides, downsides and unlock rules
    black-swans.js       black swan disasters and your own insurance covers
    progression.js       titles, promotion goals, perks, achievements, executives, rivals, endings
    market.js            pricing strategies, market cycle messages, investment strategies
    tutorial.js          tutorial steps
    changelog.js         What's new notes, newest first
    cities.js            London, New York, Bermuda, Zurich and Singapore: names, buildings, currency, risks
    lines.js             lines of business, actuarial specialisms, line-specific claims, extra names
    online.js            global leaderboard URL and publishable key
    daily.js             daily challenge formats, twists, objectives and the date-based generator
  art/                   all graphics (drawn in code, so there are no image files to load)
    palette.js           skin, hair, outfit, wood and sky colours
    tower.js             the tower, skyline, street, lobby and characters
    floor-designs.js     the three designs for every floor type
    cutscenes.js         the black swan cutscenes and character portraits
  game/                  game systems: state, economy, claims, simulation, executives, audio, events...
  ui/                    panels, HUD, tutorial, input handling, cutscene player, plus:
    leaderboard.js       global, daily and on-device leaderboards, and score submission
    gazette.js           the Fine Print Gazette
    daily.js             daily challenge runs (own save slot), card, progress bar and results
    feedback.js          the exit interview
    eggs.js              easter eggs and their secret achievements (spoilers!)
    update.js            the new-version check
  render/renderer.js     the Phaser scene and the game boot
supabase/
  migrations/            SQL for the tables (run in order, or paste into the SQL Editor)
  functions/submit-score the only way anything is written: scores, run starts, daily results, feedback
```

## Features and where they live

- **Lines of business and actuaries** (`src/data/lines.js`): each Underwriting floor writes a line (premium rate, claim frequency and size, lawsuit appetite, mood sensitivity, black swan exposure); Actuarial floors pick Pricing, Reserving or Capital Modelling. Customer mood scales premiums around a 50% baseline, and business volume grows with the tower.
- **Your own insurance** (`COVERS` and `PROTECTION` in `src/data/black-swans.js`, pricing in `src/game/endings.js`): Light, Balanced or Strong layers (retention and limit in quarters of premium, scaled by exposure), or a custom layer. Price = base rate × protection × exposure × market (rises after a disaster, eases each quarter) × Capital Modelling × perks.
- **The Fine Print Gazette** (`src/ui/gazette.js`): one edition per earnings call, headline chosen from the quarter's results, last 8 kept, opened from the 📰 button in the HUD (or "Read the Gazette" on the earnings call). Add gossip, Percy lines or classifieds to the pools at the top of the file.
- **Daily challenges** (`src/data/daily.js`, `src/ui/daily.js`): generated from the UTC date, so every player gets the same one and nothing needs publishing. Started from the Boardroom's 📅 Daily tab. 12 quarters at most, idle mode off, own save slot so the main company is paused and untouched. New twists and objectives join the rotation automatically.
- **Endings**: bankruptcy, being fired, losing the licence, selling (private equity or IPO), and stepping down from quarter 4 (`stepDown()` in `src/game/endings.js`). An optional, anonymous exit interview (`src/ui/feedback.js`) can appear before the score screen; players can turn it off.
- **Easter eggs** (`src/ui/eggs.js`): hidden name reactions, Percy, the credits, the Konami code, the fine print and date-based surprises. Each sets a flag in `S.eggs`, which a secret achievement (`secret:true` in `ACH`) checks; secret achievements show as "???" until unlocked.
- **Leaderboards**: Global (all finished runs), Today (each player's best daily attempt) and This device. Top-5 global finishes get a rank reveal, and number one gets a podium cutscene.

## The CEO

Every run starts with a two-step setup (`openSetup()` in `src/ui/panels.js`): step 1 creates the CEO, step 2 picks the city from a grid of tiles with skyline thumbnails (`cityThumb()`) and a Surprise me option. The choices are stored in `S.ceo` and `S.companyName` and are locked until the player starts a new company. Use `ceoName()` / `companyName()` for plain text, or `ceoN()` / `coName()` when inserting into HTML (they escape the text).

## Cities, exits and the penthouse

`S.city` picks the art in `src/art/tower.js` (`facadeAlt`, `roofNYC`, `roofBermuda`, `skylineNYC`, `skylineBermuda`) and the currency (`setCity()` sets `CUR`, used by `fmt()`). Selling the company lives in `src/game/endings.js` (`exitValue`, `sellCompany`); golden tickets are stored under `fineprint-legacy` so they survive new runs. The penthouse is a normal floor type that `workFloors()` leaves out of every count; `addFloor()` keeps new floors below it.

London, New York and Singapore have a cutaway metro under the street (`drawMetro()` and `drawTrain()` in `src/art/tower.js`, enabled by `tunnelH()`). Zurich (`roofZurich`, `skylineZurich`, `zurichStreet`) has trams, and Singapore (`roofSingapore`, `skylineSingapore`, `singaporeStreet`) a sky-garden tower. Both have two black swans that only happen there: a swan with `city:"zurich"` in `SWANS` is only drawn in that city. Each city's `swans` and `lines` multipliers in `src/data/cities.js` set its disaster risks and home-market bonuses. To add a city: add it to `CITIES`, give it a roof, skyline and street in `tower.js`, and add it to the allowed cities in Supabase (table checks and `CITIES` in the function).

## Releasing a new version

1. Bump `version` in `package.json` (for example `0.8.1` to `0.8.2`).
2. Add an entry at the top of `src/data/changelog.js` with the same version and a few short notes. Players see these under What's new.
3. Run `node build.js --check`. This writes `dist/index.html` and `dist/version.json`.
4. Deploy **both** files to GitHub Pages: the game as `index.html`, with `version.json` beside it.

The version is stamped into the game automatically and shown in the corner of the screen. Players with the game open see a banner offering the new version (`src/ui/update.js` checks `version.json` on load, every 10 minutes and when the tab regains focus).

To make an update compulsory (for example, after a scoring change), also raise `minVersion` in `package.json` before building: anyone on an older version gets a blocking "Update required" screen. To stop outdated versions posting scores, set the same value as a function secret: `npx supabase secrets set MIN_VERSION=0.8.2`.

## Global leaderboard (Supabase)

The game reads and submits scores using the URL and publishable key in `src/data/online.js` (set `enabled:false` to switch it off). The publishable key is meant to be public: Row Level Security only lets it read the `scores` table.

- `supabase/migrations/..._create_scores.sql` creates the table and its read-only policy. Run it with `npx supabase db push --linked`, or paste it into the dashboard's SQL Editor.
- `supabase/functions/submit-score/index.ts` is the only way scores get written. Deploy it with `npx supabase functions deploy submit-score --no-verify-jwt --use-api`. Its `ALLOWED` list must include the site the game is served from.
- `supabase/migrations/20261116000000_players_and_stats.sql` adds the anonymous `player_id`, the private `plays` table (run starts), the public `leaderboard_stats` view (players and runs shown in the game), a private `play_stats` view, and restricts public reads to the leaderboard columns.
- `supabase/migrations/20261118000000_feedback.sql` adds the private `feedback` table for exit interviews. Read it with `select * from feedback order by created_at desc;`.
- `supabase/migrations/20261124000000_singapore.sql` adds Singapore to the allowed cities. Adding a city always needs a migration like this plus the `CITIES` list in the function.
- `supabase/migrations/20261122000000_daily.sql` adds `daily_scores` for daily challenges (one row per player per day, holding their best). Add new twists or objectives in `src/data/daily.js` and they join the rotation automatically.
- Set an `IP_SALT` secret for the function (`npx supabase secrets set IP_SALT=...`) so the stored IP hashes can't be reversed.
- The score formula is duplicated in the function so the server can recompute it. If you change `scoreParts()` in `src/game/score.js`, change the function to match and redeploy.

Free Supabase projects pause after about a week without activity. Restore yours from the dashboard if the Global tab stops loading.

## Adding content

- **A new claim:** add it to the right line in `LINE_INCIDENTS` in `src/data/lines.js` (or to the general `INCIDENTS` list in `src/data/claims.js`).
- **A new line of business:** add it to `LINES` in `src/data/lines.js` with its rate, freq, size, sue, mood and swans multipliers, a blurb, pro and con, plus a pool in `LINE_INCIDENTS` and a prop in `drawSpecProp()` (`src/art/tower.js`). For a claim about a specific person, add a `[name, text]` pair to `NAMED`.
- **A new event:** add an object to `EVENTS` in `src/data/events.js`. Each choice has a `label` and a `run()` that returns the result text.
- **A new black swan:** add it to `SWANS` in `src/data/black-swans.js` (with `city:"..."` to make it local to one city) and, for a global one, to `SWAN_POOL` (the weighted pick list), then add a scene to `SCENES2`, a portrait to `PORTRAITS2` and a line to `LINES2` in `src/art/cutscenes.js`, all under the same key.

## Why bundle order matters

All files share one scope once bundled, so a file can use anything defined in another. But a value declared with `const` can't be read before its file runs. `manifest.json` loads utilities first, then data and art, then the game systems in the order they depend on each other. If you add a file, put it in the manifest. Data files should only hold data (or functions that are called later), never code that runs immediately and needs game systems.
