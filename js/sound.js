/* Sound effects: every sound is synthesised in the browser (Web Audio API), so no audio files are needed. */
const SFX = (() => {
  let ctx = null, master = null, noiseBuf = null, muted = false;
  const vol = () => (typeof CONFIG.volume === "number" ? CONFIG.volume : 0.8);
  const on = () => ctx && CONFIG.sound !== false;

  function init(){
    if(!ctx){
      const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : vol(); master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for(let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if(ctx.state === "suspended") ctx.resume();
  }
  function tone({f = 440, f2, t = .1, type = "sine", g = .2, at = 0, a = .004}){
    const s = ctx.currentTime + at, o = ctx.createOscillator(), v = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, s); if(f2) o.frequency.exponentialRampToValueAtTime(f2, s + t);
    v.gain.setValueAtTime(.0001, s); v.gain.linearRampToValueAtTime(g, s + a); v.gain.exponentialRampToValueAtTime(.0001, s + t);
    o.connect(v); v.connect(master); o.start(s); o.stop(s + t + .02);
  }
  function noise({t = .1, g = .2, at = 0, type = "bandpass", f = 1000, f2, q = 1, a = .003}){
    const s = ctx.currentTime + at, n = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), v = ctx.createGain();
    n.buffer = noiseBuf; n.loop = true; fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, s);
    if(f2) fl.frequency.exponentialRampToValueAtTime(f2, s + t);
    v.gain.setValueAtTime(.0001, s); v.gain.linearRampToValueAtTime(g, s + a); v.gain.exponentialRampToValueAtTime(.0001, s + t);
    n.connect(fl); fl.connect(v); v.connect(master); n.start(s, Math.random()); n.stop(s + t + .02);
  }
  const fx = {
    beep: last => tone({f: last ? 1320 : 880, t: last ? .5 : .14, type: "triangle", g: .28}),
    click: () => { noise({t: .03, g: .35, f: 3500, q: 2}); tone({f: 200, f2: 90, t: .05, g: .25}); },
    door: () => {
      tone({f: 150, f2: 45, t: .5, g: .6}); noise({t: .5, g: .4, type: "lowpass", f: 500});
      noise({t: 1.8, g: .12, f: 350, f2: 900, q: 3, a: .3, at: .15}); tone({f: 95, f2: 60, t: 1.8, type: "sawtooth", g: .07, a: .3, at: .1});
    },
    ting: () => { const f = 2200 + Math.random() * 1800; tone({f, t: .18, g: .07}); tone({f: f * 1.5, t: .12, g: .04}); },
    tick: () => { tone({f: 1500, t: .025, type: "square", g: .05}); noise({t: .015, g: .08, type: "highpass", f: 5000}); },
    reelStop: () => { tone({f: 260, f2: 110, t: .14, g: .35}); noise({t: .04, g: .2, f: 2500, q: 2}); },
    jackpot: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone({f, t: .35, type: "triangle", g: .2, at: i * .09})); tone({f: 1568, t: .8, g: .12, at: .5}); },
    kaching: () => { noise({t: .08, g: .2, type: "highpass", f: 4000}); tone({f: 1568, t: .6, g: .2, at: .05}); tone({f: 2093, t: .8, g: .18, at: .13}); },
    whoosh: () => noise({t: .7, g: .16, f: 300, f2: 2600, q: .8, a: .25}),
    popper: () => {
      noise({t: .12, g: .55, f: 1800, q: .6}); tone({f: 320, f2: 60, t: .16, g: .5});
      for(let i = 0; i < 14; i++) noise({t: .05, g: .05 + Math.random() * .06, type: "highpass", f: 4000 + Math.random() * 3000, at: .1 + Math.random() * .5});
    },
    snip: () => { noise({t: .06, g: .3, type: "highpass", f: 4500}); tone({f: 2400, f2: 1500, t: .05, g: .12, type: "triangle"}); },
    cut: () => { fx.snip(); noise({t: .7, g: .28, f: 3200, f2: 700, q: .7, at: .05}); tone({f: 120, f2: 60, t: .3, g: .3, at: .05}); },
    verified: () => { tone({f: 880, t: .2, type: "triangle", g: .22}); tone({f: 1320, t: .45, type: "triangle", g: .22, at: .12}); },
    applause: dur => {
      const n = Math.round(dur * 55);
      for(let i = 0; i < n; i++){
        const x = Math.random(), env = Math.min(1, x * 6, (1 - x) * 2.5);
        noise({t: .025 + Math.random() * .04, g: (.05 + Math.random() * .12) * env, f: 1200 + Math.random() * 3000, q: .7, at: x * dur});
      }
    }
  };
  function play(name, ...args){
    if(!on() || !fx[name]) return;
    try{ fx[name](...args); }catch(e){ console.warn("SFX " + name + " failed:", e); }
  }
  // rising hum while the fingerprint is held; returns a function that stops it
  function hum(ms){
    if(!on()) return () => {};
    const s = ctx.currentTime, o = ctx.createOscillator(), v = ctx.createGain();
    o.type = "triangle"; o.frequency.setValueAtTime(300, s); o.frequency.linearRampToValueAtTime(900, s + ms / 1000);
    v.gain.setValueAtTime(.0001, s); v.gain.linearRampToValueAtTime(.06, s + .1);
    o.connect(v); v.connect(master); o.start(s);
    return () => { const e = ctx.currentTime; v.gain.cancelScheduledValues(e); v.gain.setValueAtTime(.06, e); v.gain.exponentialRampToValueAtTime(.0001, e + .08); o.stop(e + .1); };
  }
  function setMuted(m){ muted = m; if(master) master.gain.value = m ? 0 : vol(); }
  return {init, play, hum, setMuted, get muted(){ return muted; }};
})();
