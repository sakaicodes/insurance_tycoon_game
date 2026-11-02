/* ui/fx.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- FX and toasts ---------- */
function pop(text, lx, ly, cls){
  if (!scene) return;
  cls = cls || "";
  const stamp = cls.includes("stamp"), bad = cls.includes("bad"), ok = cls.includes("ok");
  const style = {fontFamily:FONT, fontSize:pxL(stamp ? 14 : 16)+"px", fontStyle:"700", color: stamp ? "#FFFFFF" : bad ? "#FF6B6B" : "#4BE39A", resolution:Math.ceil(cz)};
  if (stamp){ style.backgroundColor = ok ? "#2FB879" : "#FF6B6B"; style.padding = {x:pxL(5), y:pxL(1)}; }
  else { style.stroke = "#12133A"; style.strokeThickness = pxL(3); }
  const t = scene.add.text(OX + lx, ly, text, style).setOrigin(0.5, 1).setDepth(30);
  if (stamp){ t.setAngle(-8); t.setScale(1.4); scene.tweens.add({targets:t, scale:1, duration:180, ease:"Back.easeOut"}); }
  scene.tweens.add({targets:t, y:ly - pxL(42), alpha:0, delay:250, duration:1250, ease:"Cubic.easeIn", onComplete:() => t.destroy()});
}
function fxConfetti(){
  sfx("fanfare");
  if (!scene || !confettiEm) return;
  const cam = scene.cameras.main, vh = viewH();
  [0.25, 0.5, 0.75].forEach((fx, k) => setTimeout(() => confettiEm.explode(40, LW*fx, cam.scrollY + vh*0.25), k*140));
}
function fxShake(){ if (scene) scene.cameras.main.shake(320, 0.006); }
function toast(msg, kind){
  const box = $("#toasts");
  const el = document.createElement("div"); el.className = "toast " + (kind || ""); el.textContent = msg;
  box.appendChild(el); while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => el.remove(), 5000);
}
