/* ui/cutscene-player.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
let cutsceneOn = false;
function playCutscene(kind, done){
  if (!scene){ done(); return; }
  cutsceneOn = true;
  const sc = scene, cam = sc.cameras.main, W = LW + 2*padX, H = viewH(), parts = [], timers = [];
  const add = o => { o.setScrollFactor(0).setDepth(200); parts.push(o); return o; };
  const txt = (x, y, str, size, color, extra) => add(sc.add.text(x, y, str, Object.assign({fontFamily:FONT, fontSize:pxL(size)+"px", fontStyle:"700", color, align:"center", resolution:Math.ceil(cz)}, extra || {})).setOrigin(0.5));
  const sw = SWANS[kind], L = CUT.LINES[kind] || {name:"", line:""};
  const mk = (key, w, h) => { if (!sc.textures.exists(key)){ const tx = sc.textures.createCanvas(key, w, h); tx.setFilter(Phaser.Textures.FilterMode.NEAREST); } return sc.textures.get(key); };
  const ftex = mk("cs_frame", CUT.SW, CUT.SH), ptex = mk("cs_face", 48, 48);
  const DUR = 5600, t0 = performance.now();
  const paintAll = () => { const tt = Math.min(1, (performance.now() - t0)/DUR); CUT.drawScene(ftex.getContext(), kind, tt); ftex.refresh(); CUT.drawPortrait(ptex.getContext(), kind, tt); ptex.refresh(); };
  paintAll();
  const k = Math.max(1, Math.min(W*0.96, (H*0.6)*CUT.SW/CUT.SH)/(pxL(360)));
  const bannerH = pxL(56)*Math.min(k, 1.6), gapY = pxL(8), dialogH = Math.max(pxL(100)*Math.min(k, 1.8), 30);
  let fw = W*0.96, fh = fw*CUT.SH/CUT.SW;
  const maxH = H - bannerH - dialogH - gapY*3 - pxL(26);
  if (fh > maxH){ fh = maxH; fw = fh*CUT.SW/CUT.SH; }
  const ts = Math.min(k, 1.8);
  const fx = (W - fw)/2, fy = bannerH + gapY;
  add(sc.add.rectangle(0, 0, W, H, 0x0E1222, 0.95).setOrigin(0));
  add(sc.add.rectangle(0, 0, W, bannerH, 0x1F2A44, 1).setOrigin(0));
  add(sc.add.rectangle(0, bannerH - pxL(3), W, pxL(3), 0xC9A54A, 1).setOrigin(0));
  const tagW = pxL(84)*Math.min(k, 1.6), tagH = bannerH*0.32;
  add(sc.add.rectangle(W/2 - tagW/2, bannerH*0.12, tagW, tagH, 0xB23A3A, 1).setOrigin(0));
  txt(W/2, bannerH*0.12 + tagH/2, "BREAKING", 11*Math.min(k, 1.6), "#FFF6E2");
  txt(W/2, bannerH*0.7, sw.title, 15*Math.min(k, 1.6), "#E3C064", {wordWrap:{width:W*0.94}});
  const frame = add(sc.add.image(fx, fy, "cs_frame").setOrigin(0).setDisplaySize(fw, fh));
  add(sc.add.rectangle(fx, fy, fw, fh).setOrigin(0).setStrokeStyle(pxL(3), 0xC9A54A));
  const dw = Math.min(fw, W*0.96), dx = (W - dw)/2, dy = fy + fh + gapY, ps = dialogH - pxL(14);
  add(sc.add.rectangle(dx, dy, dw, dialogH, 0xF7F2E6, 1).setOrigin(0).setStrokeStyle(pxL(3), 0x1F2A44)); add(sc.add.rectangle(dx + pxL(3), dy + pxL(3), dw - pxL(6), dialogH - pxL(6)).setOrigin(0).setStrokeStyle(pxL(1.5), 0xC9A54A));
  add(sc.add.rectangle(dx + pxL(6), dy + pxL(6), ps + pxL(2), ps + pxL(2), 0x1F2A44, 1).setOrigin(0)); add(sc.add.image(dx + pxL(7), dy + pxL(7), "cs_face").setOrigin(0).setDisplaySize(ps, ps));
  const tx0 = dx + ps + pxL(16), twid = dw - ps - pxL(26);
  add(sc.add.text(tx0, dy + pxL(8)*ts, L.name, {fontFamily:FONT, fontSize:pxL(14*ts)+"px", fontStyle:"700", color:"#23305A", resolution:Math.ceil(cz)}));
  const lineT = add(sc.add.text(tx0, dy + pxL(30)*ts, "", {fontFamily:FONT, fontSize:pxL(13*ts)+"px", color:"#1B2238", wordWrap:{width:twid}, lineSpacing:pxL(2)*ts, resolution:Math.ceil(cz)}));
  const skip = txt(W/2, Math.min(H - pxL(14), dy + dialogH + pxL(16)), "Tap to skip", 11, "#E9E2CF"); skip.setAlpha(.8);
  frame.setScale(frame.scaleX*0.92, frame.scaleY*0.92).setAlpha(0);
  sc.tweens.add({targets:frame, scaleX:fw/CUT.SW, scaleY:fh/CUT.SH, alpha:1, duration:260, ease:"Back.easeOut"});
  sfx("swan"); cam.shake(500, 0.006);
  let finished = false, lastBolt = 0;
  const end = () => { if (finished) return; finished = true; cutsceneOn = false; timers.forEach(t => t.remove(false)); parts.forEach(o => { sc.tweens.killTweensOf(o); o.destroy(); }); sc.input.off("pointerdown", onTap); done(); };
  timers.push(sc.time.addEvent({delay:70, loop:true, callback:() => {
    const el = performance.now() - t0; paintAll();
    const n = Math.min(L.line.length, Math.floor((el - 450)/30)); if (n > 0 && lineT.text.length !== n){ lineT.setText(L.line.slice(0, n)); if (n % 3 === 0) sfx("tick"); }
    if ((kind === "hurricane" || kind === "ash" || kind === "solar") && el - lastBolt > 700 && Math.random() < 0.08){ lastBolt = el; cam.shake(180, 0.004); }
    if (el > DUR + 700) end();
  }}));
  const onTap = () => { if (performance.now() - t0 > 600) end(); };
  sc.input.on("pointerdown", onTap);
}
