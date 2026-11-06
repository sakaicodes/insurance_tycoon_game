/* data/black-swans.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* Black swans are based on real reinsurance events, with a satirical twist. Each one names the cover that pays for it
   and the floor that softens it. Scenes, portraits and lines live in src/art/cutscenes.js under the same keys. */
const COVERS = {
  cat:{name:"Catastrophe reinsurance", rate:0.06, desc:"Pays 90% of hurricanes, volcanoes, marine disasters, space losses and solar storms."},
  cyber:{name:"Cyber cover", rate:0.03, desc:"Pays 90% of a global IT meltdown."},
  dno:{name:"Directors’ and officers’ cover", rate:0.025, desc:"Pays 90% when a big corporate collapse lands on your D&O book."},
  event:{name:"Event cancellation cover", rate:0.02, desc:"Pays 90% if a global outbreak cancels every event you insure."},
};
const actMit = () => Math.min(0.5, 0.08*lvSpec("actuary", "capital"));
const SWANS = {
  hurricane:{title:"Hurricane Deductible makes landfall", text:"A category 5 hurricane hit a coastline full of beachfront condos you insured. Cat bond investors in Mayfair are discovering what the “cat” stands for.", cover:"cat", mit:actMit, mitName:"Capital Modelling"},
  canal:{title:"Ship wedged in the canal", text:"A 400-metre container ship you insure turned sideways and blocked the canal. Billions of pounds of cargo a day are stuck behind one very long parking mistake.", cover:"cat", mit:actMit, mitName:"Capital Modelling"},
  outage:{title:"The update that broke the world", text:"A routine software update crashed 8.5 million computers at once. Airlines, banks, broadcasters and the office coffee machine are all showing the same sad face.", cover:"cyber", mit:() => Math.min(0.6, 0.15*lv("it")), mitName:"IT"},
  ash:{title:"The volcano nobody can pronounce", text:"An Icelandic volcano closed Europe’s airspace for a week. 100,000 flights were cancelled, and every travel policy you wrote just became a claim.", cover:"cat", mit:actMit, mitName:"Capital Modelling"},
  cancel:{title:"Everything is cancelled", text:"A global outbreak cancelled every event on the calendar. Event cancellation claims are pouring in, led by one tennis club that paid for pandemic cover for 17 years straight.", cover:"event", mit:() => Math.min(0.5, 0.1*lv("legal")), mitName:"Legal"},
  bank:{title:"Megabank goes bust overnight", text:"A giant investment bank collapsed overnight. Its directors have all claimed on the D&O cover you wrote them, and every one of them was apparently on holiday that year.", cover:"dno", mit:() => Math.min(0.6, 0.15*lv("compliance")), mitName:"Compliance"},
  rocket:{title:"Rocket launch goes boom", text:"A rocket carrying satellites you insured exploded 40 seconds after launch. The satellites are now very expensive confetti.", cover:"cat", mit:actMit, mitName:"Capital Modelling"},
  solar:{title:"The solar superstorm", text:"The biggest solar storm since 1859 lit up the sky over London and fried satellites, power grids and every sat-nav in the country.", cover:"cat", mit:actMit, mitName:"Capital Modelling"},
};
const SWAN_POOL = ["hurricane","hurricane","canal","canal","outage","outage","ash","cancel","bank","bank","rocket","rocket","solar"];
