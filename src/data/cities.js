/* data/cities.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* Where your company is based. Chosen when a run starts. */
const CITIES = {
  london:{name:"London", country:"United Kingdom", flag:"🇬🇧", cur:"£", market:"the London market",
    building:"20 Fenchurch Street, “the Walkie Talkie”", blurb:"The heart of the world’s specialist insurance market, a short walk from Lloyd’s.",
    risk:"Home of marine and specialty insurance. Ash clouds and City collapses hit harder; hurricanes rarely visit.",
    swans:{hurricane:0.7, canal:1.2, outage:1.0, ash:1.4, cancel:1.1, bank:1.3, rocket:0.9, solar:1.0}, lines:{marine:1.12, specialty:1.12}},
  nyc:{name:"New York", country:"United States", flag:"🇺🇸", cur:"$", market:"New York’s insurance district",
    building:"The Metropolitan Life Insurance Company Tower", blurb:"Built by an insurer in 1909 on Madison Square, and briefly the tallest building in the world.",
    risk:"Big on casualty, lawsuits and cyber. IT meltdowns and Wall Street collapses hit harder; ash clouds hardly register.",
    swans:{hurricane:1.1, canal:0.8, outage:1.5, ash:0.6, cancel:1.0, bank:1.5, rocket:1.1, solar:1.1}, lines:{casualty:1.1, excess:1.12, cyber:1.12}},
  bermuda:{name:"Hamilton", country:"Bermuda", flag:"🇧🇲", cur:"$", market:"Bermuda’s reinsurance market",
    building:"A Front Street office with a white stepped roof", blurb:"The world’s reinsurance capital: pastel offices, hurricane-proof roofs and a lot of very large cheques.",
    risk:"The reinsurance capital. Hurricanes and solar storms hit hardest here; City collapses and IT meltdowns less so.",
    swans:{hurricane:1.7, canal:1.0, outage:0.8, ash:0.6, cancel:0.8, bank:0.8, rocket:0.9, solar:1.2}, lines:{treaty:1.15, property:1.08}},
};
function setCity(id){ CUR = (CITIES[id] || CITIES.london).cur; }
function cityRisk(kind){ const c = CITIES[cityId()] || CITIES.london; return (c.swans && c.swans[kind]) || 1; }
function cityLine(line){ const c = CITIES[cityId()] || CITIES.london; return (c.lines && c.lines[line]) || 1; }
