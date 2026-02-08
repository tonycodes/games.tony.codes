/* ═══════════════════════════════════════════
   AUDIO ENGINE - Realistic Diesel Bus + Music
   ═══════════════════════════════════════════ */
export function createBusAudio() {
  var ctx = null;
  var n = {};
  var started = false;
  var muted = false;

  function init() {
    if (ctx) return;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }

    var master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(ctx.destination);
    n.master = master;

    /* ═══ DIESEL ENGINE ═══ */
    var i;

    /* -- Combustion pulse: fundamental firing freq -- */
    var combOsc = ctx.createOscillator();
    combOsc.type = 'sawtooth';
    combOsc.frequency.value = 18;
    var combWS = ctx.createWaveShaper();
    var wsLen = 4096, wsCurve = new Float32Array(wsLen);
    for (i = 0; i < wsLen; i++) {
      var x = i * 2 / wsLen - 1;
      wsCurve[i] = Math.tanh(x * 3) * 0.8 + Math.sin(x * Math.PI * 2) * 0.2;
    }
    combWS.curve = wsCurve;
    var combGain = ctx.createGain();
    combGain.gain.value = 0.12;
    var combFilt = ctx.createBiquadFilter();
    combFilt.type = 'lowpass';
    combFilt.frequency.value = 120;
    combFilt.Q.value = 3;
    combOsc.connect(combWS);
    combWS.connect(combFilt);
    combFilt.connect(combGain);
    combGain.connect(master);
    combOsc.start();
    n.combOsc = combOsc; n.combGain = combGain; n.combFilt = combFilt;

    /* -- 2nd harmonic (diesel knock character) -- */
    var knock = ctx.createOscillator();
    knock.type = 'square';
    knock.frequency.value = 36;
    var knockGain = ctx.createGain();
    knockGain.gain.value = 0.04;
    var knockFilt = ctx.createBiquadFilter();
    knockFilt.type = 'bandpass';
    knockFilt.frequency.value = 80;
    knockFilt.Q.value = 4;
    knock.connect(knockFilt);
    knockFilt.connect(knockGain);
    knockGain.connect(master);
    knock.start();
    n.knock = knock; n.knockGain = knockGain; n.knockFilt = knockFilt;

    /* -- 3rd harmonic (adds body/growl) -- */
    var harm3 = ctx.createOscillator();
    harm3.type = 'triangle';
    harm3.frequency.value = 54;
    var harm3G = ctx.createGain();
    harm3G.gain.value = 0.03;
    var harm3F = ctx.createBiquadFilter();
    harm3F.type = 'lowpass';
    harm3F.frequency.value = 200;
    harm3F.Q.value = 2;
    harm3.connect(harm3F);
    harm3F.connect(harm3G);
    harm3G.connect(master);
    harm3.start();
    n.harm3 = harm3; n.harm3G = harm3G; n.harm3F = harm3F;

    /* -- Exhaust rumble (shaped noise through resonant filter) -- */
    var exhLen = ctx.sampleRate * 3;
    var exhBuf = ctx.createBuffer(1, exhLen, ctx.sampleRate);
    var exhData = exhBuf.getChannelData(0);
    for (i = 0; i < exhLen; i++) {
      var white = Math.random() * 2 - 1;
      exhData[i] = i > 0 ? (exhData[i - 1] * 0.98 + white * 0.02) : white * 0.02;
    }
    var exhMax = 0;
    for (i = 0; i < exhLen; i++) if (Math.abs(exhData[i]) > exhMax) exhMax = Math.abs(exhData[i]);
    if (exhMax > 0) for (i = 0; i < exhLen; i++) exhData[i] /= exhMax;

    var exhSrc = ctx.createBufferSource();
    exhSrc.buffer = exhBuf; exhSrc.loop = true;
    var exhFilt1 = ctx.createBiquadFilter();
    exhFilt1.type = 'bandpass'; exhFilt1.frequency.value = 60; exhFilt1.Q.value = 2.5;
    var exhFilt2 = ctx.createBiquadFilter();
    exhFilt2.type = 'peaking'; exhFilt2.frequency.value = 120; exhFilt2.Q.value = 3; exhFilt2.gain.value = 6;
    var exhGain = ctx.createGain();
    exhGain.gain.value = 0.15;
    exhSrc.connect(exhFilt1); exhFilt1.connect(exhFilt2); exhFilt2.connect(exhGain); exhGain.connect(master);
    exhSrc.start();
    n.exhFilt1 = exhFilt1; n.exhFilt2 = exhFilt2; n.exhGain = exhGain;

    /* -- Turbo whine -- */
    var turbo = ctx.createOscillator();
    turbo.type = 'sine'; turbo.frequency.value = 600;
    var turboGain = ctx.createGain(); turboGain.gain.value = 0;
    var turboFilt = ctx.createBiquadFilter();
    turboFilt.type = 'bandpass'; turboFilt.frequency.value = 1800; turboFilt.Q.value = 6;
    turbo.connect(turboFilt); turboFilt.connect(turboGain); turboGain.connect(master);
    turbo.start();
    n.turbo = turbo; n.turboGain = turboGain; n.turboFilt = turboFilt;

    /* -- Mechanical rattle -- */
    var ratLen = ctx.sampleRate * 2;
    var ratBuf = ctx.createBuffer(1, ratLen, ctx.sampleRate);
    var ratData = ratBuf.getChannelData(0);
    for (i = 0; i < ratLen; i++) ratData[i] = (Math.random() * 2 - 1) * 0.3;
    var ratSrc = ctx.createBufferSource();
    ratSrc.buffer = ratBuf; ratSrc.loop = true;
    var ratFilt = ctx.createBiquadFilter();
    ratFilt.type = 'bandpass'; ratFilt.frequency.value = 2500; ratFilt.Q.value = 1.5;
    var ratGain = ctx.createGain(); ratGain.gain.value = 0.01;
    ratSrc.connect(ratFilt); ratFilt.connect(ratGain); ratGain.connect(master);
    ratSrc.start();
    n.ratGain = ratGain; n.ratFilt = ratFilt;

    /* -- Wind noise -- */
    var windLen = ctx.sampleRate * 2;
    var windBuf = ctx.createBuffer(1, windLen, ctx.sampleRate);
    var windData = windBuf.getChannelData(0);
    for (i = 0; i < windLen; i++) windData[i] = (Math.random() * 2 - 1) * 0.2;
    var windSrc = ctx.createBufferSource();
    windSrc.buffer = windBuf; windSrc.loop = true;
    var windGain = ctx.createGain(); windGain.gain.value = 0;
    var windFilt = ctx.createBiquadFilter();
    windFilt.type = 'bandpass'; windFilt.frequency.value = 800; windFilt.Q.value = 0.4;
    windSrc.connect(windFilt); windFilt.connect(windGain); windGain.connect(master);
    windSrc.start();
    n.windGain = windGain; n.windFilt = windFilt;

    /* -- Tyre/road noise -- */
    var tyreLen = ctx.sampleRate * 2;
    var tyreBuf = ctx.createBuffer(1, tyreLen, ctx.sampleRate);
    var tyreData = tyreBuf.getChannelData(0);
    for (i = 0; i < tyreLen; i++) tyreData[i] = (Math.random() * 2 - 1) * 0.15;
    var tyreSrc = ctx.createBufferSource();
    tyreSrc.buffer = tyreBuf; tyreSrc.loop = true;
    var tyreFilt = ctx.createBiquadFilter();
    tyreFilt.type = 'bandpass'; tyreFilt.frequency.value = 400; tyreFilt.Q.value = 0.6;
    var tyreGain = ctx.createGain(); tyreGain.gain.value = 0;
    tyreSrc.connect(tyreFilt); tyreFilt.connect(tyreGain); tyreGain.connect(master);
    tyreSrc.start();
    n.tyreGain = tyreGain; n.tyreFilt = tyreFilt;

    /* ═══ MUSIC ENGINE - Lo-fi Chill Step Sequencer ═══ */
    var BPM = 75;
    var stepDur = 60 / BPM / 4;
    var barDur = stepDur * 16;
    var musicBus = ctx.createGain();
    musicBus.gain.value = 0.45;
    var lofi = ctx.createBiquadFilter();
    lofi.type = 'lowpass'; lofi.frequency.value = 3500; lofi.Q.value = 0.7;
    var warmth = ctx.createWaveShaper();
    var wLen2 = 2048, wCurve2 = new Float32Array(wLen2);
    for (i = 0; i < wLen2; i++) { var x2 = i * 2 / wLen2 - 1; wCurve2[i] = Math.tanh(x2 * 1.2); }
    warmth.curve = wCurve2;
    musicBus.connect(warmth); warmth.connect(lofi); lofi.connect(master);
    n.musicBus = musicBus;

    /* vinyl crackle */
    var crackleLen = ctx.sampleRate * 4;
    var crackleBuf = ctx.createBuffer(1, crackleLen, ctx.sampleRate);
    var crackleData = crackleBuf.getChannelData(0);
    for (i = 0; i < crackleLen; i++) {
      crackleData[i] = Math.random() > 0.997 ? (Math.random() * 2 - 1) * 0.4 :
        Math.random() > 0.99 ? (Math.random() * 2 - 1) * 0.08 : 0;
    }
    var crackleSrc = ctx.createBufferSource();
    crackleSrc.buffer = crackleBuf; crackleSrc.loop = true;
    var crackleG = ctx.createGain(); crackleG.gain.value = 0.06;
    var crackleF = ctx.createBiquadFilter(); crackleF.type = 'highpass'; crackleF.frequency.value = 1000;
    crackleSrc.connect(crackleF); crackleF.connect(crackleG); crackleG.connect(musicBus);
    crackleSrc.start();

    function noteHz(note, oct) {
      var semis = { C: 0, Cs: 1, D: 2, Ds: 3, E: 4, F: 5, Fs: 6, G: 7, Gs: 8, A: 9, As: 10, B: 11 };
      return 440 * Math.pow(2, (semis[note] + (oct - 4) * 12 - 9) / 12);
    }

    var drumPats = [
      'K--H--SH-K-H--SH',
      'K--H--SH-K-H-OSH',
      'K--H--SH-K-H--SH',
      'K-KH--SH-K-HKOSH',
    ];

    var chordProg = [
      { root: 'C', notes: [noteHz('C', 4), noteHz('E', 4), noteHz('G', 4), noteHz('B', 4)] },
      { root: 'A', notes: [noteHz('A', 3), noteHz('C', 4), noteHz('E', 4), noteHz('G', 4)] },
      { root: 'D', notes: [noteHz('D', 4), noteHz('F', 4), noteHz('A', 4), noteHz('C', 5)] },
      { root: 'G', notes: [noteHz('G', 3), noteHz('B', 3), noteHz('D', 4), noteHz('F', 4)] },
    ];

    var bassPats = [
      [1, 0, 0, 0, 5, 0, 0, 3, 0, 1, 0, 0, 8, 0, 5, 0],
      [1, 0, 0, 5, 0, 0, 3, 0, 1, 0, 0, 0, 5, 0, 0, 3],
      [1, 0, 0, 0, 3, 0, 5, 0, 0, 1, 0, 0, 5, 0, 3, 0],
      [1, 0, 5, 0, 0, 3, 0, 0, 1, 0, 0, 5, 0, 0, 8, 0],
    ];
    var bassRoots = [noteHz('C', 2), noteHz('A', 1), noteHz('D', 2), noteHz('G', 1)];
    var bassIntervals = { 1: 1, 3: 1.1892, 5: 1.4983, 8: 2 };

    var melPats = [
      [0, 0, noteHz('E', 5), 0, noteHz('G', 5), 0, 0, noteHz('B', 5), 0, noteHz('A', 5), 0, 0, noteHz('G', 5), 0, noteHz('E', 5), 0],
      [0, 0, noteHz('C', 5), 0, 0, noteHz('E', 5), 0, 0, noteHz('A', 5), 0, noteHz('G', 5), 0, 0, 0, noteHz('E', 5), 0],
      [0, noteHz('D', 5), 0, 0, noteHz('F', 5), 0, noteHz('A', 5), 0, 0, 0, noteHz('C', 6), 0, noteHz('A', 5), 0, 0, 0],
      [0, 0, noteHz('B', 4), 0, noteHz('D', 5), 0, 0, noteHz('F', 5), 0, noteHz('D', 5), 0, 0, noteHz('B', 4), 0, 0, 0],
    ];

    n.seq = {
      BPM: BPM, stepDur: stepDur, barDur: barDur,
      drumPats: drumPats, chordProg: chordProg,
      bassPats: bassPats, bassRoots: bassRoots, bassIntervals: bassIntervals,
      melPats: melPats,
      currentBar: -1, nextBarTime: 0, playing: false,
    };

    n.playKick = function (time) {
      var o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(150, time);
      o.frequency.exponentialRampToValueAtTime(30, time + 0.12);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.55, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
      var click = ctx.createOscillator(); click.type = 'square';
      click.frequency.setValueAtTime(800, time);
      var cg = ctx.createGain();
      cg.gain.setValueAtTime(0.15, time);
      cg.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
      o.connect(g); g.connect(musicBus);
      click.connect(cg); cg.connect(musicBus);
      o.start(time); o.stop(time + 0.4);
      click.start(time); click.stop(time + 0.02);
    };

    n.playSnare = function (time) {
      var o = ctx.createOscillator(); o.type = 'triangle';
      o.frequency.setValueAtTime(200, time);
      o.frequency.exponentialRampToValueAtTime(120, time + 0.06);
      var og = ctx.createGain();
      og.gain.setValueAtTime(0.25, time);
      og.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      o.connect(og); og.connect(musicBus);
      o.start(time); o.stop(time + 0.15);
      var nLen = Math.floor(ctx.sampleRate * 0.2);
      var nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate);
      var nD = nBuf.getChannelData(0);
      for (var j = 0; j < nLen; j++) nD[j] = (Math.random() * 2 - 1);
      var ns = ctx.createBufferSource(); ns.buffer = nBuf;
      var ng = ctx.createGain();
      ng.gain.setValueAtTime(0.22, time);
      ng.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
      var nf = ctx.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 1200;
      ns.connect(nf); nf.connect(ng); ng.connect(musicBus);
      ns.start(time); ns.stop(time + 0.2);
    };

    n.playHihat = function (time, open) {
      var nLen = Math.floor(ctx.sampleRate * (open ? 0.3 : 0.08));
      var nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate);
      var nD = nBuf.getChannelData(0);
      for (var j = 0; j < nLen; j++) nD[j] = (Math.random() * 2 - 1);
      var ns = ctx.createBufferSource(); ns.buffer = nBuf;
      var ng = ctx.createGain();
      ng.gain.setValueAtTime(open ? 0.1 : 0.08, time);
      ng.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.28 : 0.06));
      var nf = ctx.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 6000;
      var nf2 = ctx.createBiquadFilter(); nf2.type = 'bandpass'; nf2.frequency.value = 10000; nf2.Q.value = 1;
      ns.connect(nf); nf.connect(nf2); nf2.connect(ng); ng.connect(musicBus);
      ns.start(time); ns.stop(time + (open ? 0.35 : 0.1));
    };

    n.playBass = function (time, freq) {
      var o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq, time);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.28, time);
      g.gain.setValueAtTime(0.28, time + stepDur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.001, time + stepDur * 0.95);
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 250; f.Q.value = 3;
      o.connect(f); f.connect(g); g.connect(musicBus);
      o.start(time); o.stop(time + stepDur);
    };

    n.playPad = function (time, freqs, dur) {
      for (var j = 0; j < freqs.length; j++) {
        var o = ctx.createOscillator(); o.type = j % 2 === 0 ? 'triangle' : 'sine';
        o.frequency.setValueAtTime(freqs[j], time);
        o.detune.setValueAtTime((Math.random() - 0.5) * 12, time);
        var g = ctx.createGain();
        g.gain.setValueAtTime(0.001, time);
        g.gain.linearRampToValueAtTime(0.08, time + 0.3);
        g.gain.setValueAtTime(0.08, time + dur - 0.4);
        g.gain.linearRampToValueAtTime(0.001, time + dur);
        var pf = ctx.createBiquadFilter(); pf.type = 'lowpass';
        pf.frequency.setValueAtTime(800, time);
        pf.frequency.linearRampToValueAtTime(1800, time + dur * 0.5);
        pf.frequency.linearRampToValueAtTime(600, time + dur);
        pf.Q.value = 1;
        o.connect(pf); pf.connect(g); g.connect(musicBus);
        o.start(time); o.stop(time + dur + 0.1);
      }
    };

    n.playMelody = function (time, freq) {
      var o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(freq, time);
      var o2 = ctx.createOscillator(); o2.type = 'triangle';
      o2.frequency.setValueAtTime(freq, time);
      o2.detune.setValueAtTime(7, time);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.001, time);
      g.gain.linearRampToValueAtTime(0.09, time + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, time + stepDur * 2);
      var g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.001, time);
      g2.gain.linearRampToValueAtTime(0.04, time + 0.04);
      g2.gain.exponentialRampToValueAtTime(0.001, time + stepDur * 2.5);
      var mf = ctx.createBiquadFilter(); mf.type = 'lowpass'; mf.frequency.value = 2500; mf.Q.value = 0.5;
      o.connect(g); o2.connect(g2); g.connect(mf); g2.connect(mf); mf.connect(musicBus);
      o.start(time); o.stop(time + stepDur * 3);
      o2.start(time); o2.stop(time + stepDur * 3);
    };

    n.scheduleBar = function (barIdx, startTime) {
      var bi = barIdx % 4;
      var dp = drumPats[bi];
      var bp = bassPats[bi];
      var mp = melPats[bi];
      var ch = chordProg[bi];
      var bRoot = bassRoots[bi];

      n.playPad(startTime, ch.notes, barDur);

      for (var s = 0; s < 16; s++) {
        var t = startTime + s * stepDur;
        var dc = dp[s];
        if (dc === 'K') n.playKick(t);
        else if (dc === 'S') n.playSnare(t);
        else if (dc === 'H') n.playHihat(t, false);
        else if (dc === 'O') n.playHihat(t, true);
        if (bp[s] > 0) {
          var bFreq = bRoot * (bassIntervals[bp[s]] || 1);
          n.playBass(t, bFreq);
        }
        if (mp[s] > 0) n.playMelody(t, mp[s]);
      }
    };

    started = true;
  }

  function updateEngine(speed, maxSpeed) {
    if (!started || muted) return;
    var t = Math.abs(speed) / maxSpeed;
    var now = ctx.currentTime;

    var rpm = 18 + t * 37;
    n.combOsc.frequency.setTargetAtTime(rpm, now, 0.08);
    n.combGain.gain.setTargetAtTime(0.08 + t * 0.14, now, 0.05);
    n.combFilt.frequency.setTargetAtTime(80 + t * 250, now, 0.06);

    n.knock.frequency.setTargetAtTime(rpm * 2, now, 0.08);
    n.knockGain.gain.setTargetAtTime(0.03 + t * 0.05, now, 0.05);
    n.knockFilt.frequency.setTargetAtTime(60 + t * 180, now, 0.06);

    n.harm3.frequency.setTargetAtTime(rpm * 3, now, 0.08);
    n.harm3G.gain.setTargetAtTime(0.02 + t * 0.04, now, 0.05);
    n.harm3F.frequency.setTargetAtTime(120 + t * 400, now, 0.06);

    n.exhGain.gain.setTargetAtTime(0.1 + t * 0.2, now, 0.08);
    n.exhFilt1.frequency.setTargetAtTime(40 + t * 100, now, 0.1);
    n.exhFilt2.frequency.setTargetAtTime(80 + t * 200, now, 0.1);

    var turboT = Math.max(t - 0.35, 0) / 0.65;
    n.turbo.frequency.setTargetAtTime(600 + turboT * 2400, now, 0.15);
    n.turboGain.gain.setTargetAtTime(turboT * turboT * 0.025, now, 0.1);
    n.turboFilt.frequency.setTargetAtTime(1200 + turboT * 3000, now, 0.12);

    n.ratGain.gain.setTargetAtTime(0.008 + t * 0.02, now, 0.05);
    n.ratFilt.frequency.setTargetAtTime(1800 + t * 2000, now, 0.08);

    n.windGain.gain.setTargetAtTime(t * t * 0.1, now, 0.1);
    n.windFilt.frequency.setTargetAtTime(400 + t * 2500, now, 0.1);

    n.tyreGain.gain.setTargetAtTime(t * 0.04, now, 0.08);
    n.tyreFilt.frequency.setTargetAtTime(200 + t * 600, now, 0.1);
  }

  function updateMusic() {
    if (!started || muted || !n.seq) return;
    var seq = n.seq;
    var now = ctx.currentTime;
    if (!seq.playing) {
      seq.playing = true;
      seq.nextBarTime = now + 0.1;
      seq.currentBar = 0;
      n.scheduleBar(0, seq.nextBarTime);
    }
    if (now > seq.nextBarTime - 0.5) {
      seq.currentBar++;
      seq.nextBarTime += seq.barDur;
      n.scheduleBar(seq.currentBar, seq.nextBarTime);
    }
  }

  function playCrash(intensity) {
    if (!started || muted) return;
    var now = ctx.currentTime;
    var thud = ctx.createOscillator(); thud.type = 'sine';
    thud.frequency.value = 60;
    thud.frequency.exponentialRampToValueAtTime(25, now + 0.3);
    var thudG = ctx.createGain();
    thudG.gain.value = 0.3 * intensity;
    thudG.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    thud.connect(thudG); thudG.connect(n.master);
    thud.start(now); thud.stop(now + 0.4);

    var dur = 0.25 + intensity * 0.35;
    var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < data.length; i++) {
      var env = Math.pow(1 - i / data.length, 2);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    var src = ctx.createBufferSource(); src.buffer = buf;
    var cg = ctx.createGain(); cg.gain.value = 0.2 + intensity * 0.3;
    var cf = ctx.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 400 + intensity * 300; cf.Q.value = 1;
    src.connect(cf); cf.connect(cg); cg.connect(n.master); src.start();

    var clang = ctx.createOscillator(); clang.type = 'square';
    clang.frequency.value = 120 + Math.random() * 80;
    var clG = ctx.createGain();
    clG.gain.value = 0.1 + intensity * 0.1;
    clG.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    clang.connect(clG); clG.connect(n.master);
    clang.start(now); clang.stop(now + 0.2);

    var glass = ctx.createOscillator(); glass.type = 'sine';
    glass.frequency.value = 3000 + Math.random() * 2000;
    var glG = ctx.createGain();
    glG.gain.value = 0.04 * intensity;
    glG.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    glass.connect(glG); glG.connect(n.master);
    glass.start(now); glass.stop(now + 0.35);
  }

  function playDoor() {
    if (!started || muted) return;
    var now = ctx.currentTime;
    var dur = 0.6;
    var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < data.length; i++) {
      var t2 = i / data.length;
      var env = t2 < 0.08 ? t2 / 0.08 : Math.pow(1 - ((t2 - 0.08) / 0.92), 1.5);
      data[i] = (Math.random() * 2 - 1) * env * 0.6;
    }
    var src = ctx.createBufferSource(); src.buffer = buf;
    var g = ctx.createGain(); g.gain.value = 0.12;
    var f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1500;
    src.connect(f); f.connect(g); g.connect(n.master); src.start();

    var thk = ctx.createOscillator(); thk.type = 'sine';
    thk.frequency.value = 180;
    thk.frequency.exponentialRampToValueAtTime(60, now + 0.1);
    var thkG = ctx.createGain(); thkG.gain.value = 0.1;
    thkG.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    thk.connect(thkG); thkG.connect(n.master);
    thk.start(now); thk.stop(now + 0.16);

    var rail = ctx.createOscillator(); rail.type = 'sawtooth';
    rail.frequency.value = 400;
    rail.frequency.linearRampToValueAtTime(200, now + 0.3);
    var rlG = ctx.createGain(); rlG.gain.value = 0.02;
    rlG.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    var rlF = ctx.createBiquadFilter(); rlF.type = 'bandpass'; rlF.frequency.value = 800; rlF.Q.value = 2;
    rail.connect(rlF); rlF.connect(rlG); rlG.connect(n.master);
    rail.start(now); rail.stop(now + 0.36);
  }

  function playBell() {
    if (!started || muted) return;
    var now = ctx.currentTime;
    var freqs = [880, 1046.50];
    for (var bi = 0; bi < 2; bi++) {
      var osc = ctx.createOscillator(); osc.type = 'sine';
      osc.frequency.value = freqs[bi];
      var g = ctx.createGain();
      g.gain.value = bi === 0 ? 0.1 : 0.06;
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(g); g.connect(n.master);
      osc.start(now + bi * 0.15); osc.stop(now + bi * 0.15 + 0.7);
    }
  }

  function setMute(m) { muted = m; if (n.master) n.master.gain.value = m ? 0 : 0.6; }
  function getMuted() { return muted; }

  function playHorn() {
    if (!started || muted) return;
    var now = ctx.currentTime;
    var h1 = ctx.createOscillator(); h1.type = 'sawtooth'; h1.frequency.value = 310;
    var h2 = ctx.createOscillator(); h2.type = 'sawtooth'; h2.frequency.value = 392;
    var hg = ctx.createGain();
    hg.gain.setValueAtTime(0.001, now);
    hg.gain.linearRampToValueAtTime(0.12, now + 0.05);
    hg.gain.setValueAtTime(0.12, now + 0.4);
    hg.gain.linearRampToValueAtTime(0.001, now + 0.55);
    var hf = ctx.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 1200; hf.Q.value = 1;
    h1.connect(hf); h2.connect(hf); hf.connect(hg); hg.connect(n.master);
    h1.start(now); h1.stop(now + 0.55); h2.start(now); h2.stop(now + 0.55);
  }

  function dispose() { if (ctx) { ctx.close(); ctx = null; started = false; } }

  return {
    init, updateEngine, updateMusic,
    playCrash, playDoor, playBell, playHorn,
    setMute, getMuted, dispose,
  };
}
