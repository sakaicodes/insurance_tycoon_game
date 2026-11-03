/* core/util.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
"use strict";
const $ = s => document.querySelector(s);
const rand = (a,b) => a + Math.random()*(b-a);
const pick = a => a[Math.floor(Math.random()*a.length)];
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
let CUR = "£";
function fmt(n){
  const s = n < 0 ? "−" : ""; n = Math.abs(n);
  if (n >= 1e9) return s+CUR+(n/1e9).toFixed(2)+"B";
  if (n >= 1e6) return s+CUR+(n/1e6).toFixed(2)+"M";
  if (n >= 1e4) return s+CUR+(n/1e3).toFixed(1)+"K";
  return s+CUR+Math.round(n).toLocaleString("en-US");
}
const fmtR = n => n < 10 ? (n<0?"−":"")+CUR+Math.abs(n).toFixed(1) : fmt(n);
const fmt2 = n => CUR+n.toFixed(2);
