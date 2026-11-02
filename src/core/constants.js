/* core/constants.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* VERSION and BUILD_DATE are filled in by build.js from package.json. */
const VERSION = "__VERSION__", BUILD_DATE = "__BUILD_DATE__";
function intelSpread(n){ return Math.max(0, 36 - 6*n); }
function intelText(n){
  if (n <= 0) return "No claim intel yet";
  if (n === 1) return "Shows how serious each claim is";
  const sp = intelSpread(n);
  if (n === 2) return `Seriousness, plus odds it’s legit (±${sp/2}%)`;
  return sp === 0 ? "Seriousness, legit odds and lawsuit odds, exactly" : `Seriousness, legit odds and lawsuit odds (±${sp/2}%)`;
}
const Q_LEN = 60, MAXL = 5, MAXF = Infinity, KEY = "fineprint-mutual-v1";
