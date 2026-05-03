// LOCKDOWN CITY — procedural HUD soundtrack
// Web Audio API 합성. 100 BPM / 4-bar 마이너 진행(i-VI-III-v) / 킥+스네어+하이햇+아르페지오+패드+서브베이스
// 래퍼 index.html에 단 한 번 로드되어 iframe 페이지 전환 동안 끊기지 않고 재생.
(() => {
  const MUTE_KEY = 'lockdown-mute';
  const STARTED_KEY = 'lockdown-started';
  const VOLUME = 0.18;

  let ctx, masterGain, dryBus, delayIn;
  let built = false;
  let muted = sessionStorage.getItem(MUTE_KEY) === '1';
  let btn;
  let stepIndex = 0;
  let nextNoteTime = 0;

  const BPM = 100;
  const STEP = 60 / BPM / 4;
  const NOTE = {
    A1: 55, Bb1: 58.27, D2: 73.42, F2: 87.31, A2: 110, Bb2: 116.54,
    D3: 146.83, F3: 174.61, A3: 220, Bb3: 233.08, C4: 261.63,
    D4: 293.66, E4: 329.63, F4: 349.23, A4: 440, C5: 523.25, E5: 659.25
  };
  const PROG = [
    { root: 'D2',  arp: ['D4', 'F4', 'A4', 'F4'] },
    { root: 'Bb1', arp: ['Bb3', 'D4', 'F4', 'D4'] },
    { root: 'F2',  arp: ['F4', 'A4', 'C5', 'A4'] },
    { root: 'A1',  arp: ['A3', 'C4', 'E4', 'C4'] }
  ];

  // ----- Toggle UI -----
  function buildToggle() {
    btn = document.createElement('button');
    btn.id = 'ambient-toggle';
    btn.setAttribute('aria-label', 'Toggle ambient sound');
    btn.style.cssText = [
      'position: fixed', 'bottom: 56px', 'right: 20px', 'z-index: 1000',
      'background: rgba(10,18,16,0.9)',
      "font-family: 'Share Tech Mono', 'Courier New', monospace",
      'font-size: 11px', 'letter-spacing: 2px',
      'padding: 6px 12px', 'cursor: pointer',
      'text-transform: uppercase', 'transition: all 0.15s'
    ].join('; ');
    btn.addEventListener('click', toggle);
    btn.addEventListener('mouseenter', () => {
      if (needsGesture()) {
        btn.style.background = 'rgba(255,176,32,0.18)';
      } else {
        btn.style.background = muted ? 'rgba(0,255,156,0.15)' : 'rgba(90,122,104,0.2)';
      }
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(10,18,16,0.9)';
    });
    updateBtn();
    document.body.appendChild(btn);
  }

  function needsGesture() {
    return !ctx || ctx.state === 'suspended';
  }

  function updateBtn() {
    if (!btn) return;
    // 라벨은 클릭 시 일어날 액션 — 음소거 상태면 "ON" (켤 수 있음), 재생 중이면 "OFF" (끌 수 있음).
    if (needsGesture() && !muted) {
      btn.textContent = '▶ ENABLE SOUND';
      btn.style.color = '#ffb020';
      btn.style.border = '1px solid #ffb020';
    } else if (muted) {
      // 현재 꺼짐 → 클릭 시 켜짐. 켜는 액션은 강조(그린).
      btn.textContent = '◆ SOUND ON';
      btn.style.color = '#00ff9c';
      btn.style.border = '1px solid rgba(0,255,156,0.6)';
    } else {
      // 현재 켜짐 → 클릭 시 꺼짐. 끄는 액션은 디밍(회색).
      btn.textContent = '◇ SOUND OFF';
      btn.style.color = '#5a7a68';
      btn.style.border = '1px solid #5a7a68';
    }
  }

  function toggle(e) {
    e.stopPropagation();
    if (needsGesture()) {
      // 첫 활성화: 무조건 시작 + 무음 해제
      muted = false;
      sessionStorage.setItem(MUTE_KEY, '0');
      startAudioContext();
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
      if (masterGain) masterGain.gain.value = VOLUME;
    } else {
      muted = !muted;
      sessionStorage.setItem(MUTE_KEY, muted ? '1' : '0');
      if (masterGain) {
        const t = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(t);
        masterGain.gain.linearRampToValueAtTime(muted ? 0 : VOLUME, t + 0.25);
      }
    }
    updateBtn();
  }

  // ----- Audio context -----
  function startAudioContext() {
    if (ctx) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      ctx = new Ctx();
      ctx.onstatechange = updateBtn;
      buildAudioGraph();
      sessionStorage.setItem(STARTED_KEY, '1');
    } catch (e) { /* silent */ }
  }

  function tryStart() {
    startAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  function buildAudioGraph() {
    if (!ctx || built) return;
    built = true;

    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : VOLUME;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 8;
    comp.ratio.value = 4;
    comp.attack.value = 0.005;
    comp.release.value = 0.12;
    masterGain.connect(comp).connect(ctx.destination);

    dryBus = ctx.createGain();
    dryBus.gain.value = 1.0;
    dryBus.connect(masterGain);

    delayIn = ctx.createDelay(1.0);
    delayIn.delayTime.value = (60 / BPM) * 0.75;
    const fb = ctx.createGain();
    fb.gain.value = 0.28;
    const wet = ctx.createGain();
    wet.gain.value = 0.32;
    delayIn.connect(fb).connect(delayIn);
    delayIn.connect(wet).connect(masterGain);

    nextNoteTime = ctx.currentTime + 0.05;
    stepIndex = 0;
    scheduler();
  }

  // ----- Voices -----
  function playKick(time, freq) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq * 2.5, time);
    o.frequency.exponentialRampToValueAtTime(freq, time + 0.06);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.5, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    o.connect(g).connect(dryBus);
    o.start(time);
    o.stop(time + 0.3);
  }
  function playSnare(time) {
    const len = 0.15;
    const buf = ctx.createBuffer(1, Math.floor(len * ctx.sampleRate), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1800;
    f.Q.value = 0.7;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.13, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.13);

    const body = ctx.createOscillator();
    body.type = 'triangle';
    body.frequency.value = 220;
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0.0001, time);
    bg.gain.exponentialRampToValueAtTime(0.06, time + 0.003);
    bg.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    body.connect(bg).connect(dryBus);
    body.start(time);
    body.stop(time + 0.1);

    src.connect(f).connect(g).connect(dryBus);
    src.start(time);
    src.stop(time + len);
  }
  function playHat(time, accent) {
    const len = 0.05;
    const buf = ctx.createBuffer(1, Math.floor(len * ctx.sampleRate), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 8500;
    const g = ctx.createGain();
    const peak = accent ? 0.09 : 0.06;
    g.gain.setValueAtTime(peak, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
    src.connect(f).connect(g).connect(dryBus);
    src.start(time);
    src.stop(time + len);
  }
  function playPluck(freq, time, accent) {
    const o = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = freq;
    f.type = 'lowpass';
    f.Q.value = 7;
    f.frequency.setValueAtTime(2600, time);
    f.frequency.exponentialRampToValueAtTime(450, time + 0.28);
    const peak = accent ? 0.1 : 0.075;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(peak, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
    o.connect(f).connect(g);
    g.connect(dryBus);
    g.connect(delayIn);
    o.start(time);
    o.stop(time + 0.45);
  }
  function playPad(time, freq, dur) {
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = 'sawtooth';
    o2.type = 'sawtooth';
    o1.frequency.value = freq * 2;
    o2.frequency.value = freq * 2 * 1.006;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 700;
    f.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(0.04, time + dur * 0.3);
    g.gain.linearRampToValueAtTime(0.03, time + dur * 0.75);
    g.gain.linearRampToValueAtTime(0, time + dur);
    o1.connect(f);
    o2.connect(f);
    f.connect(g).connect(dryBus);
    o1.start(time);
    o2.start(time);
    o1.stop(time + dur + 0.1);
    o2.stop(time + dur + 0.1);
  }
  function playSubBass(time, freq, dur) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.22, time + 0.015);
    g.gain.exponentialRampToValueAtTime(0.07, time + dur * 0.5);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    o.connect(g).connect(dryBus);
    o.start(time);
    o.stop(time + dur + 0.05);
  }

  // ----- Sequencer -----
  function scheduleStep(idx, t) {
    const barIdx = Math.floor(idx / 16) % PROG.length;
    const stepInBar = idx % 16;
    const chord = PROG[barIdx];
    const rootFreq = NOTE[chord.root];

    if (stepInBar === 0) {
      playPad(t, rootFreq, STEP * 16);
      playSubBass(t, rootFreq * 0.5, STEP * 8);
    }
    if (stepInBar % 4 === 0) {
      playKick(t, rootFreq);
    }
    if (stepInBar === 4 || stepInBar === 12) {
      playSnare(t);
    }
    if (stepInBar % 2 === 0) {
      playHat(t, stepInBar % 4 === 0);
      const arpIdx = (stepInBar / 2) % chord.arp.length;
      playPluck(NOTE[chord.arp[arpIdx]], t, stepInBar === 0);
    }
    if (stepInBar === 15) {
      playHat(t, false);
    }
  }

  function scheduler() {
    if (!ctx) return;
    while (nextNoteTime < ctx.currentTime + 0.12) {
      scheduleStep(stepIndex, nextNoteTime);
      nextNoteTime += STEP;
      stepIndex++;
    }
    setTimeout(scheduler, 25);
  }

  // ----- Init -----
  function init() {
    buildToggle();

    const wasStarted = sessionStorage.getItem(STARTED_KEY) === '1';
    if (wasStarted && !muted) tryStart();

    // 부모 자체 클릭/키 입력
    document.addEventListener('click', () => { if (!muted) tryStart(); }, true);
    document.addEventListener('keydown', () => { if (!muted) tryStart(); }, true);

    // iframe 자식이 보낸 인터랙션 알림 (사용자 제스처 propagation)
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'lockdown-interaction') {
        if (!muted) tryStart();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
