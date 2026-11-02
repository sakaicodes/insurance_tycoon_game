/* game/audio.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- Sound ---------- */
const SND = {ctx:null, master:null, muted:false, last:{}, rain:null, rainWanted:false, buf:null};
try { SND.muted = localStorage.getItem("fineprint-muted") === "1"; } catch(e){}
function audioInit(){
  if (SND.ctx){ if (SND.ctx.state === "suspended") SND.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  SND.ctx = new AC(); SND.master = SND.ctx.createGain(); SND.master.gain.value = SND.muted ? 0 : 0.5; SND.master.connect(SND.ctx.destination);
  const c = SND.ctx, b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random()*2 - 1;
  SND.buf = b; setRainSound(SND.rainWanted);
}
window.addEventListener("pointerdown", audioInit, {capture:true});
window.addEventListener("keydown", audioInit, {capture:true});
function tone(f, t0, dur, type, vol, slide){
  const c = SND.ctx, o = c.createOscillator(), g = c.createGain();
  o.type = type || "square"; o.frequency.setValueAtTime(f, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f*slide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.1, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(SND.master); o.start(t0); o.stop(t0 + dur + 0.03);
}
function noise(t0, dur, vol, freq, type){
  const c = SND.ctx, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  src.buffer = SND.buf; f.type = type || "lowpass"; f.frequency.value = freq || 800;
  g.gain.setValueAtTime(vol || 0.2, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f); f.connect(g); g.connect(SND.master); src.start(t0); src.stop(t0 + dur + 0.05);
}
function buzz(p){ try { if (!SND.muted && navigator.vibrate) navigator.vibrate(p); } catch(e){} }
function sfx(name, n){
  const BZ = {gavel:40, swan:[80,60,140], lose:[60,40,200], build:15, warn:25};
  if (BZ[name] && !(SND.last["bz" + name] && performance.now() - SND.last["bz" + name] < 400)){ SND.last["bz" + name] = performance.now(); buzz(BZ[name]); }
  if (!SND.ctx || SND.muted || SND.ctx.state !== "running") return;
  const now = SND.ctx.currentTime, gap = {coin:1.4, tick:0.05, pay:0.12, stamp:0.12}[name] || 0.08;
  if (SND.last[name] && now - SND.last[name] < gap) return;
  SND.last[name] = now; const t = now + 0.01;
  switch (name){
    case "coin": tone(1320,t,0.07,"square",0.03); tone(1760,t+0.06,0.09,"square",0.03); break;
    case "pay": tone(880,t,0.07,"square",0.07); tone(1320,t+0.07,0.12,"square",0.07); noise(t+0.02,0.05,0.04,6000,"highpass"); break;
    case "stamp": noise(t,0.12,0.35,420); tone(110,t,0.12,"sine",0.25,0.5); break;
    case "paper": noise(t,0.2,0.12,3000,"bandpass"); break;
    case "gavel": noise(t,0.07,0.4,500); tone(150,t,0.1,"triangle",0.25,0.6); noise(t+0.22,0.07,0.4,500); tone(150,t+0.22,0.1,"triangle",0.25,0.6); break;
    case "chime": [784,988,1175].forEach((f,k) => tone(f,t+k*0.08,0.25,"triangle",0.08)); break;
    case "bell": for (let k = 0; k < (n || 1); k++){ const tt = t + k*0.55; tone(660,tt,1.4,"sine",0.16); tone(1650,tt,0.7,"sine",0.05); tone(990,tt,1.0,"triangle",0.04); } break;
    case "build": noise(t,0.25,0.3,300); tone(196,t,0.2,"triangle",0.2,0.7); [523,659,784].forEach((f,k) => tone(f,t+0.3+k*0.07,0.15,"square",0.05)); break;
    case "upgrade": [523,659,784,1047].forEach((f,k) => tone(f,t+k*0.06,0.12,"square",0.05)); break;
    case "fanfare": [523,659,784,1047,784,1047].forEach((f,k) => tone(f,t+k*0.09,0.18,"square",0.05)); break;
    case "swan": tone(70,t,1.6,"sawtooth",0.16,0.5); noise(t,1.5,0.3,200); break;
    case "lose": [392,330,262,196].forEach((f,k) => tone(f,t+k*0.22,0.35,"triangle",0.12)); break;
    case "warn": tone(440,t,0.12,"square",0.06); tone(330,t+0.14,0.16,"square",0.06); break;
    case "tick": tone(1800,t,0.03,"square",0.02); break;
  }
}
function setRainSound(on){
  SND.rainWanted = on;
  if (!SND.ctx) return;
  if (on && !SND.muted && !paused && !SND.rain){
    const c = SND.ctx, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = SND.buf; src.loop = true; f.type = "lowpass"; f.frequency.value = 1400; g.gain.value = 0.0001;
    g.gain.exponentialRampToValueAtTime(0.03, c.currentTime + 1.5);
    src.connect(f); f.connect(g); g.connect(SND.master); src.start(); SND.rain = {src, g};
  } else if ((!on || SND.muted || paused) && SND.rain){
    const r = SND.rain, c = SND.ctx; SND.rain = null;
    r.g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.8); r.src.stop(c.currentTime + 0.9);
  }
}
function setMuted(m){
  SND.muted = m; try { localStorage.setItem("fineprint-muted", m ? "1" : "0"); } catch(e){}
  $("#btnSound").textContent = m ? "🔇" : "🔊"; $("#btnSound").setAttribute("aria-label", m ? "Turn sound on" : "Mute sound");
  if (SND.master) SND.master.gain.value = m ? 0 : 0.5;
  setRainSound(SND.rainWanted);
}
$("#btnSound").addEventListener("click", () => { audioInit(); setMuted(!SND.muted); });
setMuted(SND.muted);
document.addEventListener("click", e => { if (e.target.closest(".btn, .type, .pbtn")) sfx("tick"); });
