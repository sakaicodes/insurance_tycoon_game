# Fine Print Syndicate

A satirical London-market insurance tower game. You write the source as separate files; `build.js` bundles them into **one self-contained HTML file** that runs anywhere.

## Build

Needs Node.js (any recent version). No packages to install.

```
node build.js           # writes dist/fine-print-syndicate.html
node build.js --check   # same, then checks the bundled script parses
```

Open `dist/fine-print-syndicate.html` in a browser to play. Phaser 3.80.1 and the fonts load from a CDN.

## Releasing a new version

1. Change `"version"` in `package.json` (for example `0.1.0` to `0.1.1`).
2. Add an entry at the top of `src/data/changelog.js` with the same version and a few short notes. Players see these under What's new.
3. Run `node build.js --check`.

The version is stamped into the game automatically. Players see it in the corner of the screen and on the How to play screen, and anyone returning from an older version gets an "Updated to vX" notice.

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
    cities.js            London, New York and Bermuda: names, buildings, currency
  art/                   all graphics (drawn in code, so there are no image files to load)
    palette.js           skin, hair, outfit, wood and sky colours
    tower.js             the tower, skyline, street, lobby and characters
    floor-designs.js     the three designs for every floor type
    cutscenes.js         the black swan cutscenes and character portraits
  game/                  game systems: state, economy, claims, simulation, executives, audio, events...
  ui/                    panels, HUD, tutorial, input handling, leaderboard, cutscene player
  render/renderer.js     the Phaser scene and the game boot
```

## The CEO

Every run starts on the Create your CEO screen (`openSetup()` in `src/ui/panels.js`). The choices are stored in `S.ceo` and `S.companyName` and are locked until the player starts a new company. Use `ceoName()` / `companyName()` for plain text, or `ceoN()` / `coName()` when inserting into HTML (they escape the text).

## Cities, exits and the penthouse

`S.city` picks the art in `src/art/tower.js` (`facadeAlt`, `roofNYC`, `roofBermuda`, `skylineNYC`, `skylineBermuda`) and the currency (`setCity()` sets `CUR`, used by `fmt()`). Selling the company lives in `src/game/endings.js` (`exitValue`, `sellCompany`); golden tickets are stored under `fineprint-legacy` so they survive new runs. The penthouse is a normal floor type that `workFloors()` leaves out of every count; `addFloor()` keeps new floors below it.

## Global leaderboard (Supabase)

The game reads and submits scores using the URL and publishable key in `src/data/online.js` (set `enabled:false` to switch it off). The publishable key is meant to be public: Row Level Security only lets it read the `scores` table.

- `supabase/migrations/..._create_scores.sql` creates the table and its read-only policy. Run it with `npx supabase db push --linked`, or paste it into the dashboard's SQL Editor.
- `supabase/functions/submit-score/index.ts` is the only way scores get written. Deploy it with `npx supabase functions deploy submit-score --no-verify-jwt --use-api`. Its `ALLOWED` list must include the site the game is served from.
- The score formula is duplicated in the function so the server can recompute it. If you change `scoreParts()` in `src/game/score.js`, change the function to match and redeploy.

Free Supabase projects pause after about a week without activity. Restore yours from the dashboard if the Global tab stops loading.

## Adding content

- **A new claim:** add a line to `INCIDENTS` in `src/data/claims.js`. For a claim about a specific person, add a `[name, text]` pair to `NAMED`.
- **A new event:** add an object to `EVENTS` in `src/data/events.js`. Each choice has a `label` and a `run()` that returns the result text.
- **A new black swan:** add it to `SWANS` in `src/data/black-swans.js` and to `SWAN_POOL` (the weighted pick list) in the same file, then add a scene to `SCENES2`, a portrait to `PORTRAITS2` and a line to `LINES2` in `src/art/cutscenes.js`, all under the same key.

## Why bundle order matters

All files share one scope once bundled, so a file can use anything defined in another. But a value declared with `const` can't be read before its file runs. `manifest.json` loads utilities first, then data and art, then the game systems in the order they depend on each other. If you add a file, put it in the manifest. Data files should only hold data (or functions that are called later), never code that runs immediately and needs game systems.
