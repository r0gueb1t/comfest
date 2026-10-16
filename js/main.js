const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const stage = document.querySelector(".vault"), wrap = $("vaultWrap");

function fillText(){
  const c = CONFIG.cheque;
  $("c-bank").textContent = c.bank; $("c-date").textContent = c.date;
  $("c-payee").textContent = c.payee; $("c-words").textContent = c.words;
  $("c-memo").textContent = c.memo; $("c-sign").textContent = c.signature;
  $("c-amt").textContent = CONFIG.currency + CONFIG.amount;
  const m = $("msg"); m.textContent = "";
  m.append(CONFIG.message + " ", Object.assign(document.createElement("b"), {textContent: CONFIG.currency + CONFIG.amount}), " by " + CONFIG.sender);
}
function reset(){
  ["count"].forEach(i => $(i).classList.remove("off"));
  stage.classList.remove("open","spin"); wrap.classList.remove("show","small");
  $("msg").className = ""; $("cheque").classList.remove("show"); $("replay").classList.remove("show");
  $("pile").style.height = "0"; $("coins").innerHTML = ""; $("confetti").innerHTML = "";
  $("fg").style.transition = "none"; $("fg").style.strokeDashoffset = 0;
}
async function pour(){
  const box = $("coins"), n = 70;
  for(let i=0;i<n;i++){
    const c = document.createElement("span"); c.className = "coin";
    const h = wrap.offsetHeight;
    c.style.left = (32 + Math.random()*36) + "%"; c.style.setProperty("--d", (0.8 + Math.random()*0.4) + "s");
    c.style.setProperty("--from", (-h*0.7) + "px"); c.style.setProperty("--to", (h*(0.5 + Math.random()*0.2)) + "px");
    box.appendChild(c); setTimeout(() => c.remove(), 1600); await sleep(55);
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
  $("pile").style.height = "62%"; await pour();
  if(id !== run) return;
  // 3. message
  $("msg").classList.add("show"); await sleep(2200);
  // 4. cheque rises
  wrap.classList.add("small"); $("msg").classList.add("up"); $("cheque").classList.add("show"); setTimeout(confetti, 700);
  await sleep(1500); $("replay").classList.add("show");
}
$("replay").onclick = play;
play();
