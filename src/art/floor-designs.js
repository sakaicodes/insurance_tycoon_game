/* art/floor-designs.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
const DESIGNS = {
  sales:[
    {name:"Classic Box"},
    {name:"Heritage Box", wall:"#2F5D4A", trim:"#1E3D30",
      pattern:y => { for (let x = 32; x < 174; x += 10) R(x,y+2,1,33,"rgba(0,0,0,.14)"); R(28,y+24,146,1,"#C9A227"); },
      decor:y => {
        R(96,y+9,16,13,"#C9A227"); R(97,y+10,14,11,"#3A2A1E"); R(101,y+12,6,6,"#E0A878"); R(101,y+11,6,2,"#9A9AA8"); R(102,y+16,4,1,"#5A3825"); R(100,y+18,8,3,"#1B1B2F");
        R(118,y+12,22,7,"#C9A227"); T("Est. 1688", 129, y+17.3, 4.5, "#3A2A1E", "center", 700);
        R(146,y+9,24,13,"#C9A227"); R(147,y+10,22,11,"#7FA7C4"); R(147,y+18,22,3,"#2E5A7A"); R(154,y+12,1,6,"#3A2A1E"); R(151,y+14,8,3,"#F6F6F6"); R(150,y+17,11,1,"#6B4A2B");
      }},
    {name:"Trading Floor", wall:"#23345A", trim:"#142140",
      decor:y => {
        R(92,y+10,80,6,"#0B1226");
        const msg = "GBP ▲   RISK ▲   LUNCH ▲   SLIPS ▲   HATS ▼   ";
        ctx.font = `600 4.5px "Chakra Petch","Pixelify Sans","Trebuchet MS",sans-serif`; const w = ctx.measureText(msg).width; const off = (time*12) % w;
        ctx.save(); ctx.beginPath(); ctx.rect(92,y+10,80,6); ctx.clip();
        T(msg, 92 - off, y+14.6, 4.5, "#FFD23F", "left", 600); T(msg, 92 - off + w, y+14.6, 4.5, "#FFD23F", "left", 600);
        ctx.restore();
        for (let k = 0; k < 4; k++){ const x = 96 + k*19; R(x,y+16,16,6,"#0B1226"); for (let b = 0; b < 5; b++){ const h = 1 + Math.floor((Math.sin(time*2 + k*3 + b) + 1)*2); R(x+2+b*3, y+21-h, 2, h, (b+k)%3 ? "#4BE39A" : "#FF6B6B"); } }
      }},
  ],
  claims:[
    {name:"Classic Office"},
    {name:"Paperwork Mountain", wall:"#D9CBA6", trim:"#A8956A",
      pattern:y => { for (let yy = y+4, r = 0; yy < y+34; yy += 10, r++) for (let x = 30 + (r%2)*6; x < 174; x += 12) R(x, yy, 2, 1, "rgba(0,0,0,.1)"); },
      decor:y => {
        R(92,y+9,47,12,"#FFFFFF"); R(92,y+9,47,1,"#E8452C"); T("Days since a claim", 115.5, y+14, 4, "#2B3157", "center", 600); T("was paid: 0", 115.5, y+19, 4, "#E8452C", "center", 700);
        R(146,y+21,26,1,"#6B4A2B");
        for (let k = 0; k < 5; k++){ const c = k%2, r = Math.floor(k/2); R(148 + c*12, y+16 - r*6, 11, 5, k%3 ? "#C49A5A" : "#B5884A"); R(152 + c*12, y+17 - r*6, 3, 1, "#FFFFFF"); }
        R(140,y+12,4,8,"#E8452C"); R(141,y+14,2,1,"#FFFFFF");
      }},
    {name:"Call Centre", wall:"#6E62B6", trim:"#4B418F",
      decor:y => {
        R(94,y+11,50,8,"#FFD23F"); T("Your call matters", 119, y+16.4, 4, "#2B2D52", "center", 700);
        R(148,y+9,22,12,"#0B1226"); T("Waiting", 159, y+13.5, 3.8, "#C9CCF5", "center", 600); T(String(800 + Math.floor(time*3) % 200), 159, y+19.5, 5, "#FF6B6B", "center", 700);
        for (let k = 0; k < 5; k++) R(98 + k*9, y+19, 5, 2, "rgba(255,255,255,.25)");
      }},
  ],
  actuary:[
    {name:"Classic Cave"},
    {name:"Storm Room", wall:"#1C2B4A", trim:"#0F1A30",
      decor:y => {
        R(96,y+8,46,15,"#0E2A3A"); R(96,y+8,46,1,"#4BE39A"); R(96,y+22,46,1,"#4BE39A");
        R(100,y+16,12,5,"#2F7A4A"); R(126,y+11,10,8,"#2F7A4A");
        const cx = 118, cy = y+15, a = time*1.5;
        for (let arm = 0; arm < 3; arm++) for (let r = 1; r < 7; r++){ const t = a + arm*2.09 + r*0.5; R(Math.round(cx + Math.cos(t)*r), Math.round(cy + Math.sin(t)*r*0.7), 1, 1, "#E8EEF6"); }
        R(cx,cy,1,1,"#FF6B6B");
        R(148,y+9,22,12,"#0B1226"); T("Cat 5", 159, y+14.5, 4.5, "#FF6B6B", "center", 700); T("probably", 159, y+19.5, 3.8, "#C9CCF5", "center", 600);
      }},
    {name:"Monte Carlo", wall:"#2A1F45", trim:"#1A1230",
      decor:y => {
        R(94,y+9,44,13,"#F4F6FA"); for (let k = 0; k < 4; k++) R(97, y+11+k*3, 10 + Math.floor(hash(k,4)*20), 1, "#3E5CC4");
        R(126,y+11,8,1,"#E8452C"); R(126,y+14,6,1,"#E8452C");
        R(142,y+22,30,1,"rgba(75,227,154,.5)"); R(142,y+9,1,13,"rgba(75,227,154,.5)");
        for (let k = 0; k < 18; k++){ const blink = (Math.floor(time*2) + k) % 6 === 0; R(144 + Math.floor(hash(k,1)*26), y+9 + Math.floor(hash(k,2)*12), 1, 1, blink ? "#FFFFFF" : (k%4 ? "#4BE39A" : "#FFD23F")); }
      }},
  ],
  marketing:[
    {name:"Classic Lunch"},
    {name:"Members’ Club", wall:"#7A2333", trim:"#4E1520",
      pattern:y => { for (let x = 30; x < 174; x += 6) for (let yy = y+5; yy < y+30; yy += 6) R(x, yy, 1, 1, "rgba(255,210,63,.25)"); },
      decor:y => {
        R(100,y,1,4,"#C9A227"); R(95,y+4,11,1,"#C9A227"); for (let k = 0; k < 4; k++) R(95 + k*3, y+5, 1, 2, "#FFF3C4");
        R(112,y+9,26,13,"#5A2A1A"); for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) R(114 + c*4, y+11 + r*4, 2, 3, (r+c)%3 ? "#2E5A3A" : "#7A2333");
        R(144,y+9,24,14,"#C9A227"); R(145,y+10,22,12,"#3A2A1E"); R(148,y+14,16,6,"#E0A878"); R(150,y+12,4,3,"#9AA3B5"); R(158,y+12,4,3,"#9AA3B5");
      }},
    {name:"Oyster Bar", wall:"#2E7F8C", trim:"#1C5560",
      pattern:y => { for (let x = 28; x < 174; x += 4) R(x, y+24, 2, 11, "rgba(255,255,255,.12)"); },
      decor:y => {
        ctx.globalAlpha = 0.75 + 0.25*Math.sin(time*5); R(96,y+9,44,9,"rgba(255,143,177,.25)"); T("Oysters", 118, y+16, 7, "#FF8FB1", "center", 700); ctx.globalAlpha = 1;
        R(146,y+9,26,13,"#1B1B2F"); T("Lunch:", 159, y+13.5, 3.8, "#FFFFFF", "center", 600); T("all day", 159, y+19, 3.8, "#FFD23F", "center", 600);
        R(100,y+20,8,3,"#E8EEF6"); R(102,y+19,4,1,"#C3CAD8"); R(124,y+20,8,3,"#E8EEF6"); R(126,y+19,4,1,"#C3CAD8");
      }},
  ],
  legal:[
    {name:"Classic Chambers"},
    {name:"Library Vault", wall:"#3B2A20", trim:"#241810",
      decor:y => {
        R(92,y+3,70,20,"#5A3A22"); [y+9,y+15,y+21].forEach(yy => R(92,yy,70,1,"#2E1E12"));
        const pal = ["#8B2E2E","#2E4A8B","#2E7A4A","#C9A227","#5E2E7A","#D8D0B8"];
        for (let x = 94, k = 0; x < 160; x += 3, k++) for (let s = 0; s < 3; s++){ const h = 3 + Math.floor(hash(k,s+5)*2); R(x, y+9+s*6-h, 2, h, pal[Math.floor(hash(k,s+9)*6)]); }
        R(165,y+3,1,32,"#8A6A4A"); R(171,y+3,1,32,"#8A6A4A"); for (let yy = y+6; yy < y+34; yy += 4) R(165,yy,7,1,"#8A6A4A");
        R(98,y+1,1,3,"#1B1B2F"); R(96,y+4,5,2,"#2E7A4A");
      }},
    {name:"Loophole Lab", wall:"#C7CCD6", trim:"#8E95A6",
      decor:y => {
        R(94,y+8,40,15,"#C49A5A"); R(95,y+9,38,13,"#D9B77A");
        const pins = [[99,y+11],[112,y+18],[125,y+12],[118,y+11],[104,y+19]];
        for (let k = 0; k < pins.length-1; k++){ const [x0,y0] = pins[k], [x1,y1] = pins[k+1]; for (let s = 0; s <= 12; s++) R(Math.round(x0+(x1-x0)*s/12), Math.round(y0+(y1-y0)*s/12), 1, 1, "#E8452C"); }
        pins.forEach(([x,yy]) => { R(x-2,yy,5,3,"#FFFFFF"); R(x,yy-1,1,1,"#E8452C"); });
        R(140,y+9,30,13,"#FFFFFF"); T("Clause 14b", 155, y+14, 4.5, "#2B2D52", "center", 700); for (let k = 0; k < 3; k++) R(143, y+16+k*2, 24, 1, "#C3C7D2");
      }},
  ],
  breakroom:[
    {name:"Classic Pub"},
    {name:"Old Boozer", wall:"#5A3A22", trim:"#3A2414",
      pattern:y => { for (let x = 28; x < 174; x += 4) R(x, y+22, 1, 13, "rgba(0,0,0,.2)"); R(28,y+21,146,1,"#8A6A4A"); },
      decor:y => {
        R(34,y+20,16,15,"#3A3550"); R(36,y+22,12,13,"#1B1B2F"); const fl = Math.floor(time*8)%3; R(39,y+30-fl,6,5+fl,"#FF9F1C"); R(41,y+31-fl,2,4,"#FFD23F"); R(32,y+19,20,2,"#8A6A4A");
        const cx = 100, cy = y+14; R(cx-5,cy-5,11,11,"#1B1B2F"); R(cx-4,cy-4,9,9,"#E8452C"); R(cx-3,cy-3,7,7,"#F2E6C8"); R(cx-2,cy-2,5,5,"#3FA05A"); R(cx,cy,1,1,"#E8452C");
        R(122,y+6,1,4,"#1B1B2F"); R(115,y+10,16,9,"#C9A227"); R(116,y+11,14,7,"#2E5A3A"); T("The Duck", 123, y+16, 3.8, "#FFD23F", "center", 700);
        R(140,y+24,30,11,"#6B4A2B"); R(139,y+23,32,2,"#8A6A4A"); [144,150,156,162].forEach(x => { R(x,y+17,1,6,"#FFD23F"); R(x-1,y+16,3,1,"#C9A227"); });
      }},
    {name:"Wellness Room", wall:"#A8E6CF", trim:"#6CC4A1",
      decor:y => {
        R(90,y+8,48,12,"#FFFFFF"); T("Breathe in. Deny.", 114, y+12.8, 3.6, "#2B3157", "center", 600); T("Breathe out.", 114, y+17.8, 3.6, "#2B3157", "center", 600);
        for (let k = 0; k < 6; k++){ R(140 + k*5, y+8 + (k%2)*2, 4, 4, "#3FA05A"); R(141 + k*5, y+12 + (k%2)*2, 2, 2, "#56C46E"); }
        R(58,y+34,20,1,"#FF8FB1"); R(90,y+34,20,1,"#7FD3F7"); R(122,y+34,20,1,"#FFD23F");
        R(36,y+26,6,9,"#E8F0F7"); R(37,y+24,4,2,"#7FD3F7");
      }},
  ],
  risk:[
    {name:"Heat Map",
      decor:y => {
        const cols = ["#3FA05A","#9BD35A","#FFD23F","#FF9F1C","#E8452C"];
        R(95,y+8,32,15,"#FFFFFF");
        for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) R(97 + c*6, y+10 + r*3, 5, 2, cols[clamp(c + (3-r) - 1, 0, 4)]);
        R(138,y+9,32,14,"#2B2D52");
        for (let a = 0; a <= 20; a++){ const t = Math.PI + a/20*Math.PI; R(Math.round(154 + Math.cos(t)*11), Math.round(y+21 + Math.sin(t)*10), 1, 1, a < 7 ? "#4BE39A" : a < 14 ? "#FFD23F" : "#FF6B6B"); }
        const nt = Math.PI*1.75 + Math.sin(time*1.3)*0.5;
        for (let s = 0; s < 9; s++) R(Math.round(154 + Math.cos(nt)*s), Math.round(y+21 + Math.sin(nt)*s), 1, 1, "#FFFFFF");
      }},
    {name:"Fraud Squad", wall:"#2B2B3A", trim:"#1B1B26",
      decor:y => {
        R(96,y+8,22,15,"#F2E6C8"); T("Wanted", 107, y+12.5, 4, "#8B2E2E", "center", 700);
        R(102,y+14,9,6,"#7A7A88"); R(103,y+15,7,2,"#1B1B2F"); R(104,y+15,1,1,"#FFFFFF"); R(108,y+15,1,1,"#FFFFFF"); R(106,y+18,1,1,"#1B1B2F");
        R(128,y+10,7,7,"#C9CCF5"); R(129,y+11,5,5,"#7FD3F7"); R(134,y+16,2,2,"#6B4A2B"); R(136,y+18,2,2,"#6B4A2B");
        const sx = Math.round(158 + Math.sin(time*1.2)*4);
        for (let s = 0; s < 8; s++) R(Math.round(158 + (sx-158)*s/8), y+s, 1, 1, "#9A9AA8");
        R(sx-3,y+8,7,3,"#FFD23F"); ctx.globalAlpha = .15; R(sx-8,y+11,17,24,"#FFF3C4"); ctx.globalAlpha = 1;
      }},
    {name:"War Room", wall:"#4A5A3A", trim:"#2F3A24",
      decor:y => {
        R(94,y+8,52,15,"#2E5A7A");
        [[98,y+10,8,6],[108,y+11,6,9],[118,y+9,12,6],[124,y+15,5,5],[134,y+12,9,5],[138,y+18,5,3]].forEach(([x,yy,w,h]) => R(x,yy,w,h,"#7FB069"));
        [[101,y+12],[121,y+11],[137,y+14],[110,y+16]].forEach(([x,yy],k) => { if ((Math.floor(time*2)+k) % 3) R(x,yy,2,2,"#FF5A5F"); });
        [["L",153],["N",162],["T",171]].forEach(([n,x]) => { R(x-3,y+9,7,7,"#FFFFFF"); R(x,y+10,1,3,"#222"); T(n, x+0.5, y+21, 3.4, "#FFFFFF", "center", 600); });
      }},
  ],
  it:[
    {name:"Server Room",
      decor:y => {
        for (let k = 0; k < 4; k++){ const x = 96 + k*18; R(x,y+7,14,16,"#1B2230"); R(x+1,y+8,12,14,"#26303F");
          for (let r = 0; r < 4; r++){ R(x+2,y+9+r*3,10,2,"#323D4E"); const on = (Math.floor(time*5) + k*3 + r*5) % 4; R(x+3+on*2,y+9+r*3,1,1, (k+r)%3 ? "#4BE39A" : "#FFD23F"); } }
      }},
    {name:"Help Desk", wall:"#7FB3D5", trim:"#4F86AB",
      decor:y => {
        R(94,y+9,52,12,"#FFFFFF"); T("Have you tried", 120, y+14, 4, "#2B3157", "center", 600); T("turning it off and on?", 120, y+19, 4, "#2B3157", "center", 600);
        R(150,y+9,20,12,"#2B3157"); T("Tickets", 160, y+13.5, 3.8, "#C9CCF5", "center", 600); T(String(40 + Math.floor(time*2) % 60), 160, y+19.5, 5, "#FFD23F", "center", 700);
      }},
    {name:"Hacker Den", wall:"#141A24", trim:"#0B0F16",
      decor:y => {
        for (let c = 0; c < 26; c++){ const x = 94 + c*3; const head = Math.floor(time*8 + hash(c,3)*30) % 18;
          for (let r = 0; r < 5; r++){ const yy = y + 4 + ((head - r*2 + 18) % 18); ctx.globalAlpha = 1 - r*0.2; R(x, yy, 1, 1, "#4BE39A"); } }
        ctx.globalAlpha = 1;
      }},
  ],
  compliance:[
    {name:"Checklist Wall",
      decor:y => {
        R(94,y+7,44,16,"#FFFFFF"); R(94,y+7,44,1,"#5A4FA0");
        for (let r = 0; r < 4; r++){ R(97,y+9+r*3,2,2,"#5A4FA0"); R(97,y+10+r*3,1,1,"#4BE39A"); R(101,y+10+r*3,22 + Math.floor(hash(r,8)*10),1,"#C3C7D2"); }
        R(144,y+8,26,14,"#5A4FA0"); T("Rule 1:", 157, y+13.5, 3.8, "#FFFFFF", "center", 600); T("there are rules", 157, y+19, 3.6, "#FFD23F", "center", 600);
      }},
    {name:"Policy Library", wall:"#D9D3EC", trim:"#9A8EC2",
      decor:y => {
        R(92,y+8,80,15,"#8A7AB8"); R(92,y+15,80,1,"#6A5A98");
        const pal = ["#E8452C","#F2A93B","#FFD23F","#4BE39A","#2BB3B1","#5A6FD6","#C04ACB"];
        for (let x = 94, k = 0; x < 170; x += 4, k++){ R(x, y+9, 3, 6, pal[k % 7]); R(x, y+16, 3, 6, pal[(k+3) % 7]); }
      }},
    {name:"Audit Room", wall:"#BFC6D4", trim:"#8892A6",
      decor:y => {
        R(94,y+8,34,14,"#FFFFFF"); for (let k = 0; k < 5; k++) R(97, y+10+k*2, 14 + Math.floor(hash(k,2)*14), 1, "#9AA3B5");
        const ms = Math.floor(time*1.2) % 3; R(132,y+8,38,14,"#2B2D52"); T(["Checking…","Double-checking…","Triple-checking…"][ms], 151, y+16.5, 3.8, "#FFFFFF", "center", 600);
      }},
  ],
  pr:[
    {name:"Press Office",
      decor:y => {
        for (let k = 0; k < 3; k++){ const x = 94 + k*16; R(x,y+8+(k%2),14,13,"#F4F1E8"); R(x+1,y+10+(k%2),12,2,"#E8452C"); for (let r = 0; r < 3; r++) R(x+2,y+14+r*2+(k%2),10 - (r%2)*3,1,"#9AA3B5"); }
        const cx = 158, cy = y+20; ctx.fillStyle = "#2B2D52"; ctx.beginPath(); ctx.arc(cx, cy, 10, Math.PI, 0); ctx.fill();
        ctx.strokeStyle = "#FFD23F"; ctx.lineWidth = 1; ctx.beginPath(); const a = Math.PI*(1.2 + 0.6*(0.5 + 0.5*Math.sin(time*1.6))); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a)*8, cy + Math.sin(a)*8); ctx.stroke();
        T("Spin", cx, cy - 3, 4, "#FFFFFF", "center", 700);
      }},
    {name:"Crisis Room", wall:"#3A2E3E", trim:"#241C27",
      decor:y => {
        R(94,y+8,44,15,"#111"); R(95,y+9,42,10,"#2B3157"); R(95,y+19,42,3,"#E8452C");
        ctx.save(); ctx.beginPath(); ctx.rect(95,y+19,42,3); ctx.clip(); T("Breaking: everything is fine   Breaking: everything is fine", 137 - (time*10 % 120), y+21.6, 2.8, "#FFFFFF", "left", 600); ctx.restore();
        T("Live", 99, y+12.5, 3.2, "#FF6B6B", "left", 700);
        const ring = Math.floor(time*4) % 2; R(154,y+14,12,7,ring ? "#E8452C" : "#B8352A"); R(152,y+12,16,3,"#B8352A"); if (ring) T("Ring!", 160, y+10.5, 3.6, "#FFD23F", "center", 700);
      }},
    {name:"Influencer Studio", wall:"#FCE4EC", trim:"#E8A0BF",
      decor:y => {
        const cx = 118, cy = y+15; for (let a = 0; a < 24; a++){ const t = a/24*Math.PI*2; R(cx + Math.cos(t)*7, cy + Math.sin(t)*7, 1.2, 1.2, "#FFF6C8"); }
        ctx.globalAlpha = .25 + .1*Math.sin(time*3); ctx.fillStyle = "#FFF6C8"; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
        for (let k = 0; k < 6; k++){ R(146 + k*4, y+8 + (k%2)*3, 3, 3, "#3FA05A"); R(147 + k*4, y+12 + (k%2)*3, 2, 2, "#62C977"); }
        T("Like & subscribe", 160, y+22, 3.4, "#E8452C", "center", 700);
      }},
  ],
  hr:[
    {name:"People Team",
      decor:y => {
        R(94,y+8,40,14,"#FFFFFF"); R(110,y+9,8,3,"#5A6FD6"); R(113,y+12,1,2,"#9AA3B5"); R(99,y+14,30,1,"#9AA3B5");
        [97,107,117,127].forEach(x => { R(x+1,y+14,1,2,"#9AA3B5"); R(x-1,y+16,6,3,"#8DBFA4"); });
        R(142,y+8,28,14,"#5A6FD6"); T("Teamwork", 156, y+14, 4, "#FFFFFF", "center", 700); T("makes the", 156, y+18.5, 3.2, "#FFD23F", "center", 600);
      }},
    {name:"Wellbeing Hub", wall:"#E3F2E1", trim:"#A9CFA4",
      decor:y => {
        R(94,y+9,34,12,"#FFFFFF"); T("You are a", 111, y+14, 3.6, "#2B3157", "center", 600); T("valued resource", 111, y+18.5, 3.6, "#3FA05A", "center", 700);
        for (let k = 0; k < 5; k++){ R(138 + k*7, y+16, 5, 5, "#C96A3A"); ctx.fillStyle = "#3FA05A"; ctx.beginPath(); ctx.arc(140.5 + k*7, y+13 - (k%2), 3.2, 0, Math.PI*2); ctx.fill(); }
      }},
    {name:"Recruitment Drive", wall:"#FFF3D6", trim:"#E0C27A",
      decor:y => {
        R(94,y+8,50,9,"#E8452C"); T("We’re hiring!", 119, y+14.2, 5, "#FFFFFF", "center", 700);
        for (let k = 0; k < 6; k++) R(150 + (k%2)*2, y+20 - k*2, 14, 2, k%2 ? "#F4F1E8" : "#FFFFFF");
        T("CVs", 157, y+23.5, 3.4, "#7D5F3E", "center", 700);
      }},
  ],
  invest:[
    {name:"Trading Desk",
      decor:y => {
        for (let k = 0; k < 4; k++){ const x = 94 + k*19; R(x,y+8,16,13,"#0B1226");
          for (let c = 0; c < 6; c++){ const up = Math.sin(time*1.5 + k*2 + c) > 0; const h = 2 + Math.floor((Math.sin(time + c*1.7 + k) + 1)*2.5); R(x+2+c*2.2, y+19-h, 1.4, h, up ? "#4BE39A" : "#FF6B6B"); } }
      }},
    {name:"Crypto Corner", wall:"#141428", trim:"#0B0B1A",
      decor:y => {
        const g = 0.6 + 0.4*Math.sin(time*4); ctx.globalAlpha = g; T("HODL", 112, y+19, 10, "#FF4FD8", "center", 700); ctx.globalAlpha = 1;
        const cx = 156, cy = y+15; ctx.fillStyle = "#C9A227"; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = "#FFD23F"; ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, Math.PI*2); ctx.fill();
        T("£?", cx, cy + 2.3, 6, "#7A5A10", "center", 700);
      }},
    {name:"Gilt Club", wall:"#2F2A40", trim:"#1D1A2A",
      decor:y => {
        R(96,y+8,18,14,"#C9A227"); R(97,y+9,16,12,"#3A2A1E"); R(102,y+11,6,6,"#E0A878"); R(102,y+10,6,2,"#EDEDED"); R(101,y+17,8,4,"#1B1B2F");
        R(124,y+10,22,12,"#5E5A6E"); ctx.fillStyle = "#3A3650"; ctx.beginPath(); ctx.arc(135, y+16, 4, 0, Math.PI*2); ctx.fill(); R(134.5,y+13,1,6,"#C9CCF5");
        T("Since 1694", 160, y+16, 3.8, "#C9A227", "center", 700);
      }},
  ],
  ir:[
    {name:"Classic Briefing"},
    {name:"Gold Vault", wall:"#3D3520", trim:"#2A2414",
      pattern:y => { for (let x = 30; x < 174; x += 8) for (let yy = y+3; yy < y+34; yy += 8) R(x, yy, 2, 2, "rgba(255,210,63,.12)"); },
      decor:y => {
        const cx = 160, cy = y+17;
        R(cx-7,cy-7,15,15,"rgba(154,154,168,.35)");
        for (let a = 0; a < 40; a++){ const t = a/40*Math.PI*2; R(Math.round(cx+Math.cos(t)*9), Math.round(cy+Math.sin(t)*9), 1, 1, "#9A9AA8"); }
        for (let k = 0; k < 3; k++){ const tt = time*0.8 + k*2.09; R(Math.round(cx+Math.cos(tt)*5), Math.round(cy+Math.sin(tt)*5), 1, 1, "#C9CCF5"); }
        R(cx-1,cy-1,3,3,"#C9CCF5");
        for (let r = 0; r < 3; r++) for (let c = 0; c < 4 - r; c++) R(100 + c*9 + r*4, y+20 - r*4, 8, 3, (c+r)%2 ? "#FFD23F" : "#E0B43A");
      }},
    {name:"Press Room", wall:"#E8EDF5", trim:"#9AA6C0",
      pattern:y => { for (let yy = y+11, r = 0; yy < y+30; yy += 10, r++) for (let x = 34 + (r%2)*9; x < 170; x += 18){ R(x, yy, 5, 2, "#FF5A5F"); R(x+2, yy+2, 1, 3, "#4A3C75"); } },
      decor:y => {
        R(156,y+25,12,10,"#1F3A8A"); R(155,y+24,14,2,"#FFD23F"); R(161,y+20,1,4,"#222"); R(160,y+19,3,2,"#444");
        const tick = Math.floor(time*3);
        if (tick % 4 === 0){ ctx.globalAlpha = .75; R(96 + Math.floor(hash(tick,1)*50), y+10 + Math.floor(hash(tick,2)*8), 4, 4, "#FFFFFF"); ctx.globalAlpha = 1; }
      }},
  ],
};
