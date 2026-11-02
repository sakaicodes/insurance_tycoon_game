/* data/market.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
const PRICES = [
  {name:"Undercut", p:0.8, mood:0.04, desc:"Cheaper than your rivals. More customers and more claims, thinner margins. Customers love you."},
  {name:"Market rate", p:1, mood:0, desc:"Price like everyone else. The safe middle."},
  {name:"Premium", p:1.25, mood:-0.03, desc:"Fewer, better-paying customers and fewer claims. Customers grumble."},
  {name:"Gouge", p:1.55, mood:-0.1, desc:"Charge whatever you like. Huge margins, few customers, an angry public, and the regulator may call it unfair value."},
];
const CYCLE_MSG = {
  "Hard market":"The market has hardened. After all those losses, everyone is raising prices, so charging more costs you fewer customers.",
  "Soft market":"The market has softened. Rivals are slashing prices to win business, so charge too much and customers walk.",
  "Steady market":"The market has steadied. Prices are back to normal, for now.",
};
const INV = [
  {name:"Low risk", mean:0.025, sd:0.01, crash:0.05, desc:"Government bonds and other very sensible things. Small, steady returns."},
  {name:"Medium risk", mean:0.06, sd:0.08, crash:0.2, desc:"A balanced mix. Usually up, sometimes down."},
  {name:"High risk", mean:0.14, sd:0.3, crash:0.5, desc:"Meme stocks, crypto and a racehorse called Liquidity. Big wins, big losses, and Compliance must cover an extra floor."},
];
