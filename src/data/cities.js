/* data/cities.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* Where your company is based. Chosen when a run starts. */
const CITIES = {
  london:{name:"London", country:"United Kingdom", flag:"🇬🇧", cur:"£", market:"the London market",
    building:"20 Fenchurch Street, “the Walkie Talkie”", blurb:"The heart of the world’s specialist insurance market, a short walk from Lloyd’s."},
  nyc:{name:"New York", country:"United States", flag:"🇺🇸", cur:"$", market:"New York’s insurance district",
    building:"The Metropolitan Life Insurance Company Tower", blurb:"Built by an insurer in 1909 on Madison Square, and briefly the tallest building in the world."},
  bermuda:{name:"Hamilton", country:"Bermuda", flag:"🇧🇲", cur:"$", market:"Bermuda’s reinsurance market",
    building:"A Front Street office with a white stepped roof", blurb:"The world’s reinsurance capital: pastel offices, hurricane-proof roofs and a lot of very large cheques."},
};
function setCity(id){ CUR = (CITIES[id] || CITIES.london).cur; }
