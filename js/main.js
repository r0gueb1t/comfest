const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" rx="20" fill="#1b2e2b"/><circle cx="130" cy="110" r="30" fill="#e0b04a"/><path d="M40 250l110-90 70 55 60-45 80 80z" fill="#3b5a55"/><text x="200" y="285" fill="#f3ecd6" font-family="sans-serif" font-size="18" text-anchor="middle">Your image here</text></svg>');
const stage = document.querySelector(".vault"), wrap = $("vaultWrap");

function fillText(){
  const im = $("inaugImg"); im.onerror = () => { im.onerror = null; im.src = PLACEHOLDER; }; im.src = CONFIG.inaugImage || PLACEHOLDER; $("inaugText").textContent = CONFIG.inaugText;
  const c = CONFIG.cheque;
  $("c-bank").textContent = c.bank; $("c-date").textContent = c.date;
  $("c-payee").textContent = c.payee; $("c-words").textContent = c.words;
  $("c-memo").textContent = c.memo; $("c-sign").textContent = c.signature;
  $("c-amt").textContent = CONFIG.currency + CONFIG.amount;
  const m = $("msg"); m.textContent = "";
  m.append(CONFIG.message + " ", Object.assign(document.createElement("b"), {textContent: CONFIG.currency + CONFIG.amount}), " by " + CONFIG.sender);
}
function reset(){
  wrap.style.transition = "none"; $("finale").style.transition = "none"; $("stage").style.transition = "none";
  if($("scan")._cancel) $("scan")._cancel();
  ["count"].forEach(i => $(i).classList.remove("off"));
  stage.classList.remove("open","spin"); wrap.classList.remove("show","small");
  $("msg").className = ""; $("cheque").classList.remove("show"); $("replay").classList.remove("show");
  $("pile").innerHTML = ""; $("coins").innerHTML = ""; $("confetti").innerHTML = "";
  $("fg").style.transition = "none"; $("fg").style.strokeDashoffset = 0;
  $("slot").classList.remove("show","done"); $("slot").innerHTML = ""; $("scan").classList.remove("show","holding","ok");
  $("stage").classList.remove("gone"); $("finale").classList.remove("show"); $("inaug").classList.remove("show");
  document.querySelectorAll("#finale .half,#scissors,#scissors .bl").forEach(e => e.getAnimations().forEach(a => a.cancel()));
  void wrap.offsetWidth; wrap.style.transition = ""; $("finale").style.transition = ""; $("stage").style.transition = "";
}
function buildPile(){
  const pile = $("pile"); pile.innerHTML = "";
  const W = pile.offsetWidth, rows = 9, cw = 32, ch = 22, step = 13, list = [];
  for(let r = 0; r < rows; r++){
    const cnt = Math.round(10 - r*1.1), span = cnt * (cw - 4);
    for(let k = 0; k < cnt; k++){
      list.push({x: W/2 - span/2 + k*(cw - 4) + (Math.random()-.5)*6 + (r%2 ? 8 : 0), y: r*step - 10 + (Math.random()-.5)*4, r});
    }
  }
  list.forEach((p, i) => {
    const c = document.createElement("span");
    c.style.cssText = `position:absolute;left:${p.x}px;bottom:${p.y}px;width:${cw}px;height:${ch}px;border-radius:50%;border:2px solid #7c5a14;background:radial-gradient(ellipse at 38% 30%,#fff3b8,#e0b04a 55%,#a97d22);box-shadow:inset 0 -3px 0 #9a7220,0 2px 3px #000a;filter:brightness(${0.85 + Math.random()*0.3});opacity:0`;
    pile.appendChild(c);
    c.animate([{opacity:0, transform:"translateY(-14px) scale(.6)"},{opacity:1, transform:"none"}], {duration:260, delay:700 + (i/list.length)*3000, fill:"forwards", easing:"ease-out"});
  });
}
function buildSlot(){
  const slot = $("slot"), H = 56, cycles = 4; slot.innerHTML = ""; slot.classList.remove("done");
  const cur = document.createElement("span"); cur.className = "cur"; cur.textContent = CONFIG.currency; slot.appendChild(cur);
  const txt = Number(CONFIG.slotTotal).toLocaleString("en-US"); let n = 0; const digits = txt.replace(/\D/g, "").length;
  [...txt].forEach(ch => {
    if(!/\d/.test(ch)){ const s = document.createElement("span"); s.className = "sep"; s.textContent = ch; slot.appendChild(s); return; }
    const reel = document.createElement("div"), strip = document.createElement("div"); reel.className = "reel"; strip.className = "strip";
    for(let k = 0; k <= cycles*10 + 9; k++){ const d = document.createElement("div"); d.textContent = k % 10; strip.appendChild(d); }
    reel.appendChild(strip); slot.appendChild(reel);
    strip.animate([{transform:"translateY(0)"},{transform:`translateY(${-(cycles*10 + Number(ch))*H}px)`}],
      {duration: 2800 + n*380, easing:"cubic-bezier(.25,.8,.25,1)", fill:"forwards"});
    n++;
  });
  setTimeout(() => slot.classList.add("done"), 2800 + digits*380);
}
async function pour(){
  const box = $("coins"), n = 80, h = wrap.offsetHeight;
  for(let i=0;i<n;i++){
    const c = document.createElement("span");
    c.style.cssText = "position:absolute;top:0;width:30px;height:30px;margin-left:-15px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3b8,#e0b04a 55%,#9a7220);border:3px solid #7c5a14;box-shadow:0 0 10px #e0b04a88;will-change:transform";
    c.style.left = (34 + Math.random()*32) + "%";
    box.appendChild(c);
    const to = h*(0.5 + Math.random()*0.2), spin = (Math.random() > .5 ? 1 : -1) * (360 + Math.random()*360);
    c.animate([
      {transform:`translateY(${-h*0.32}px) rotate(0deg) scaleX(1)`, opacity:1},
      {transform:`translateY(${to*0.5}px) rotate(${spin/2}deg) scaleX(.5)`, opacity:1, offset:.55},
      {transform:`translateY(${to}px) rotate(${spin}deg) scaleX(1)`, opacity:0}
    ], {duration:900 + Math.random()*400, easing:"ease-in", fill:"forwards"}).onfinish = () => c.remove();
    await sleep(45);
  }
}
function confetti(){
  const box = $("confetti"), W = innerWidth, H = innerHeight, cols = ["#e0b04a","#f3ecd6","#4fd1a5","#ff6b6b","#6ea8ff"];
  for(let side = 0; side < 2; side++){
    const dir = side ? -1 : 1;
    for(let i = 0; i < 55; i++){
      const p = document.createElement("span"); p.className = "conf";
      p.style.background = cols[i % cols.length]; p.style.left = (side ? W : 0) + "px"; p.style.top = H*0.55 + "px";
      box.appendChild(p);
      const dx = dir * (W*0.15 + Math.random()*W*0.4), up = -(H*0.2 + Math.random()*H*0.4), fall = H*0.5 + Math.random()*H*0.2, r = (Math.random()-.5)*1440, dur = 2200 + Math.random()*1400;
      p.animate([
        {transform:"translate(0,0) rotate(0)", opacity:1},
        {transform:`translate(${dx*0.7}px,${up}px) rotate(${r*0.5}deg)`, opacity:1, offset:.35, easing:"ease-in"},
        {transform:`translate(${dx}px,${fall}px) rotate(${r}deg)`, opacity:0}
      ], {duration:dur, delay:Math.random()*250, easing:"cubic-bezier(.1,.7,.4,1)", fill:"forwards"}).onfinish = () => p.remove();
    }
  }
}
function holdScan(){
  return new Promise(res => {
    const scan = $("scan"), lbl = $("scanLbl"), ms = (CONFIG.holdSeconds || 2)*1000; let t = null;
    scan.style.setProperty("--hold", ms/1000 + "s"); scan.classList.remove("ok","holding"); lbl.textContent = CONFIG.scanLabel; scan.classList.add("show");
    function start(){ if(t || scan.classList.contains("ok")) return; scan.classList.add("holding"); lbl.textContent = CONFIG.scanHolding; t = setTimeout(done, ms); }
    function stop(){ if(!t) return; clearTimeout(t); t = null; scan.classList.remove("holding"); lbl.textContent = CONFIG.scanLabel; }
    function done(){ t = null; scan.classList.remove("holding"); scan.classList.add("ok"); lbl.textContent = CONFIG.scanSuccess; unbind(); setTimeout(res, 700); }
    function unbind(){ scan.onpointerdown = scan.onpointerup = scan.onpointercancel = scan.onpointerleave = scan.onkeydown = scan.onkeyup = scan.oncontextmenu = null; }
    scan.onpointerdown = e => { e.preventDefault(); try{ scan.setPointerCapture(e.pointerId); }catch(_){} start(); };
    scan.onpointerup = scan.onpointercancel = scan.onpointerleave = stop;
    scan.onkeydown = e => { if(e.key === " " || e.key === "Enter"){ e.preventDefault(); if(!e.repeat) start(); } };
    scan.onkeyup = stop; scan.oncontextmenu = e => e.preventDefault();
    scan._cancel = () => { stop(); unbind(); };
  });
}
const FLUSH_L = "polygon(0 0,100% 0,100% 50%,100% 100%,0 100%)", NOTCH_L = "polygon(0 0,100% 0,96% 50%,100% 100%,0 100%)";
const FLUSH_R = "polygon(0 0,100% 0,100% 100%,0 100%,0 50%)", NOTCH_R = "polygon(0 0,100% 0,100% 100%,0 100%,4% 50%)";
async function finale(id){
  await sleep((CONFIG.finaleDelaySeconds ?? 5) * 1000); if(id !== run) return;
  $("stage").classList.add("gone"); $("finale").classList.add("show"); await sleep(1900); if(id !== run) return;
  const L = document.querySelector(".half.l"), R = document.querySelector(".half.r"), S = $("scissors"), blades = [...S.querySelectorAll(".bl")], W = innerWidth;
  // ribbon slides in from both sides
  const ent = {duration:1100, easing:"cubic-bezier(.2,.8,.2,1)", fill:"forwards"};
  L.animate([{transform:"translateX(-100%)",opacity:1},{transform:"none",opacity:1}], ent);
  R.animate([{transform:"translateX(100%)",opacity:1},{transform:"none",opacity:1}], ent);
  await sleep(1600); if(id !== run) return;
  // scissors snip their way to the middle
  const snips = blades.map(b => b.animate([{transform:"rotate(0deg)"},{transform:"rotate(-16deg)"}], {duration:240, direction:"alternate", iterations:Infinity}));
  S.animate([{transform:`translateX(${-110}px)`,opacity:1},{transform:`translateX(${W/2 - 54}px)`,opacity:1}], {duration:2200, easing:"ease-in-out", fill:"forwards"});
  await sleep(2250); if(id !== run) return;
  snips.forEach(a => a.cancel());
  blades.forEach(b => b.animate([{transform:"rotate(-18deg)"},{transform:"rotate(0deg)"}], {duration:220, easing:"ease-in"}));
  await sleep(200);
  // the cut: both halves fall away
  const cut = {duration:1400, easing:"cubic-bezier(.5,0,.9,.6)", fill:"forwards"};
  L.animate([{transform:"none",opacity:1,clipPath:FLUSH_L},{transform:"translate(-6vw,6vh) rotate(-6deg)",opacity:1,clipPath:NOTCH_L,offset:.25},{transform:"translate(-40vw,75vh) rotate(-28deg)",opacity:0,clipPath:NOTCH_L}], cut);
  R.animate([{transform:"none",opacity:1,clipPath:FLUSH_R},{transform:"translate(6vw,6vh) rotate(6deg)",opacity:1,clipPath:NOTCH_R,offset:.25},{transform:"translate(40vw,75vh) rotate(28deg)",opacity:0,clipPath:NOTCH_R}], cut);
  S.animate([{opacity:1},{opacity:0}], {duration:600, delay:300, fill:"forwards"});
  await sleep(1100); if(id !== run) return;
  // reveal
  $("inaug").classList.add("show"); await sleep(2800); $("replay").classList.add("show");
}
let run = 0;
async function play(){
  const id = ++run; reset(); fillText(); await sleep(300);
  // 1. countdown
  const total = CONFIG.countdownSeconds, fg = $("fg");
  for(let s = total; s > 0; s--){
    if(id !== run) return;
    const n = $("num"); n.textContent = s; n.classList.remove("pop"); void n.offsetWidth; n.classList.add("pop");
    fg.style.transition = "stroke-dashoffset 1s linear"; fg.style.strokeDashoffset = 691 * (total - s + 1) / total;
    await sleep(1000);
  }
  if(id !== run) return;
  // 2. vault opens, money pours
  $("count").classList.add("off"); wrap.classList.add("show"); await sleep(900);
  stage.classList.add("spin"); await sleep(1500);
  stage.classList.add("open"); await sleep(1500);
  await holdScan(); if(id !== run) return;
  $("scan").classList.remove("show"); await sleep(350); $("slot").classList.add("show");
  buildPile(); buildSlot(); await pour();
  if(id !== run) return;
  // 3. message
  $("msg").classList.add("show"); await sleep(2200);
  // 4. cheque rises
  wrap.classList.add("small"); $("msg").classList.add("up"); $("cheque").classList.add("show"); setTimeout(confetti, 700);
  await sleep(1500); await finale(id);
}
$("replay").onclick = play;
play();
