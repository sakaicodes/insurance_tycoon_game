/* data/changelog.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* Newest first. Add an entry here whenever you bump "version" in package.json. */
const CHANGELOG = [
  {v:"0.5.0", notes:[
    "A global leaderboard: your finished runs are sent automatically and you can compare scores with everyone, filtered by city. Your company and CEO names appear there publicly. Idle mode runs aren’t included.",
    "If you finish a run offline, your score is sent the next time you play online.",
    "The penthouse is now locked as the very top floor, right under the roof, with new floors built beneath it.",
    "When you buy the penthouse, your CEO takes the lift up and moves in for good.",
    "Fixed: the game-over screen no longer breaks for runs that switched idle mode on and off.",
  ]},
  {v:"0.4.3", notes:[
    "55 new achievements (70 in all), covering promotions, every black swan, the penthouse, the star shop, lawsuits, rivals, the three cities, selling your company and golden tickets.",
    "Achievements are now grouped into categories in the Boardroom, each with its own progress count.",
    "Fixed: the exit strategy now opens at Thought Leader, as described (it was opening one rank early).",
  ]},
  {v:"0.4.2", notes:[
    "Selling your company is now a true endgame goal: private equity needs £1M cash and a £150 share price, and an IPO needs £2.5M, a £250 share price and 70% board confidence.",
  ]},
  {v:"0.4.1", notes:[
    "The penthouse is now one per company and costs 20 ★, with upgrades at 6 ★. Once built it stays.",
    "Selling your company now takes real scale: private equity needs £150K cash and a £50 share price, and an IPO needs £250K, a £70 share price and 60% board confidence. The Boardroom shows your progress.",
    "Bermuda’s buses now wear the classic pink and blue.",
  ]},
  {v:"0.4.0", notes:[
    "Choose your headquarters: London (the Walkie Talkie), New York (the MetLife Tower) or Hamilton, Bermuda (a Front Street office with a white stepped roof), each with its own skyline, street and currency.",
    "Cutscenes for every promotion, for being fired, going bankrupt or losing your licence, and for selling your company. Your own CEO stars in them.",
    "Sell your company to private equity or float it on the stock exchange. You’ll start your next company with a golden ticket.",
    "Build a penthouse with stars and furnish it. Your CEO splits their time between it and The Room.",
    "A star shop for spending stars once your perks are bought, and unspent stars boost your sale price.",
    "Women’s and men’s style sets on the CEO screen, each with 9 hairstyles, 4 outfits and makeup or facial hair.",
    "Floor numbers on every floor.",
    "You can switch idle mode off again (the run still won’t be scored).",
    "Time away is now simulated properly: premiums, genuine and fraudulent claims, salaries, insurance and black swans.",
  ]},
  {v:"0.3.1", notes:[
    "More ways to create your CEO: 10 hairstyles (including pixie, bob, long, ponytail, bun, curly and braids), 4 outfit styles (suit and tie, blazer and blouse, skirt suit, dress) and extras (lashes, lipstick, earrings, glasses). Every option is open to every CEO.",
    "Your staff and customers now show the same variety of hairstyles, skirts, dresses and earrings.",
  ]},
  {v:"0.3.0", notes:[
    "Eight new black swans based on real reinsurance events, with a satirical twist: a hurricane, a ship wedged in a canal, a global IT meltdown, an unpronounceable volcano, mass event cancellations, a megabank collapse, a rocket failure and a solar superstorm.",
    "All-new cutscenes in the game’s art style, with a new character for each disaster.",
    "Black swans now strike with no warning. Your Risk Dept trims every black swan loss instead.",
    "New cover in the Boardroom: event cancellation.",
    "The tutorial now explains black swans and why buying reinsurance matters.",
  ]},
  {v:"0.2.1", notes:[
    "A new City look: navy and brass instead of brown wood, with cream paper menus, slate-blue carpets, stone desks, a marble lobby and a brass lift.",
  ]},
  {v:"0.2.0", notes:[
    "Create your CEO at the start of every run: your name, your company’s name, skin tone, hairstyle, hair colour and outfit.",
    "Your CEO walks around The Room. Tap them to open the Boardroom.",
    "A cozy new look: warm wood and parchment menus, plank floors, wallpaper, brass lamps, chunkier characters with rosy cheeks, and a sunnier London.",
    "Names are now locked for the whole run. You choose new ones when you start a new company.",
  ]},
  {v:"0.1.0", notes:[
    "Rename your company: open the Boardroom and use Company name at the top.",
    "The game version now shows in the corner of the screen and on the How to play screen.",
    "New black swans: a great white in the Thames, and a rocket launch that goes boom.",
    "Behind the scenes: the game is now built from separate files for data, art and systems.",
  ]},
];
function changesFor(v){ return (CHANGELOG.find(c => c.v === v) || CHANGELOG[0]).notes; }
