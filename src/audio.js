let audioContext;
let musicTimer;
let musicStep = 0;
let musicGain;
let menuMusicTimer;
let menuMusicStep = 0;
let menuMusicGain;

const melody = [
  220, 277.18, 329.63, 277.18,
  246.94, 293.66, 369.99, 293.66,
  261.63, 329.63, 392, 329.63,
  246.94, 293.66, 349.23, 293.66
];

const menuMelody = [
  261.63, 329.63, 392, 329.63,
  293.66, 349.23, 440, 349.23,
  329.63, 392, 493.88, 392,
  293.66, 349.23, 440, 392
];

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(frequency, startTime, duration, options = {}) {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const volume = options.volume ?? 0.08;
  oscillator.type = options.type || 'square';
  oscillator.frequency.setValueAtTime(frequency, startTime);
  if (options.slideTo) {
    oscillator.frequency.exponentialRampToValueAtTime(options.slideTo, startTime + duration);
  }

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(options.destination || context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function playNoise(startTime, duration, options = {}) {
  const context = getAudioContext();
  const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const volume = options.volume ?? 0.04;

  for (let index = 0; index < bufferSize; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(options.frequency ?? 4200, startTime);
  filter.Q.setValueAtTime(options.q ?? 8, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(options.destination || context.destination);
  source.start(startTime);
  source.stop(startTime + duration + 0.02);
}

export function startBackgroundMusic() {
  const context = getAudioContext();
  if (musicTimer) return;
  stopMenuMusic();

  musicStep = 0;
  musicGain = context.createGain();
  musicGain.gain.value = 0.035;
  musicGain.connect(context.destination);

  musicTimer = window.setInterval(() => {
    const now = context.currentTime;
    const note = melody[musicStep % melody.length];
    const bass = musicStep % 4 === 0 ? note / 2 : note / 4;

    playTone(note, now, 0.105, { destination: musicGain, volume: 0.32 });
    playTone(bass, now, 0.14, { destination: musicGain, volume: 0.22, type: 'triangle' });
    musicStep += 1;
  }, 155);
}

export function startMenuMusic() {
  const context = getAudioContext();
  if (menuMusicTimer || musicTimer) return;

  menuMusicStep = 0;
  menuMusicGain = context.createGain();
  menuMusicGain.gain.value = 0.024;
  menuMusicGain.connect(context.destination);

  menuMusicTimer = window.setInterval(() => {
    const now = context.currentTime;
    const note = menuMelody[menuMusicStep % menuMelody.length];
    const harmony = menuMelody[(menuMusicStep + 2) % menuMelody.length] / 2;
    const isAccent = menuMusicStep % 4 === 0;

    playTone(note, now, isAccent ? 0.18 : 0.12, {
      destination: menuMusicGain,
      volume: isAccent ? 0.2 : 0.14,
      type: 'triangle'
    });
    if (isAccent) {
      playTone(harmony, now + 0.02, 0.2, {
        destination: menuMusicGain,
        volume: 0.12,
        type: 'square'
      });
    }
    menuMusicStep += 1;
  }, 215);
}

export function stopBackgroundMusic() {
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = undefined;
  }
  if (musicGain) {
    const context = getAudioContext();
    musicGain.gain.cancelScheduledValues(context.currentTime);
    musicGain.gain.setTargetAtTime(0.0001, context.currentTime, 0.05);
    window.setTimeout(() => musicGain?.disconnect(), 180);
    musicGain = undefined;
  }
}

export function stopMenuMusic() {
  if (menuMusicTimer) {
    window.clearInterval(menuMusicTimer);
    menuMusicTimer = undefined;
  }
  if (menuMusicGain) {
    const context = getAudioContext();
    menuMusicGain.gain.cancelScheduledValues(context.currentTime);
    menuMusicGain.gain.setTargetAtTime(0.0001, context.currentTime, 0.05);
    window.setTimeout(() => menuMusicGain?.disconnect(), 180);
    menuMusicGain = undefined;
  }
}

export function playMoneySound() {
  const context = getAudioContext();
  const now = context.currentTime;
  playTone(659.25, now, 0.075, { volume: 0.1 });
  playTone(987.77, now + 0.075, 0.095, { volume: 0.1 });
}

export function playLifeSound() {
  const context = getAudioContext();
  const now = context.currentTime;
  playTone(523.25, now, 0.08, { volume: 0.09, type: 'triangle' });
  playTone(783.99, now + 0.08, 0.08, { volume: 0.09, type: 'triangle' });
  playTone(1046.5, now + 0.16, 0.14, { volume: 0.1, type: 'triangle' });
}

export function playBeerSound() {
  const context = getAudioContext();
  const now = context.currentTime;
  playTone(392, now, 0.16, { volume: 0.08, slideTo: 587.33, type: 'triangle' });
  playTone(783.99, now + 0.04, 0.18, { volume: 0.045, slideTo: 987.77, type: 'sine' });
  playTone(659.25, now + 0.18, 0.14, { volume: 0.07, slideTo: 523.25, type: 'triangle' });
  playNoise(now + 0.23, 0.12, { volume: 0.025, frequency: 5200, q: 10 });
}

export function playProblemSound() {
  const context = getAudioContext();
  const now = context.currentTime;
  playTone(220, now, 0.16, { volume: 0.11, slideTo: 82.41, type: 'sawtooth' });
}

export function playGameOverSound() {
  const context = getAudioContext();
  const now = context.currentTime;
  playTone(329.63, now, 0.18, { volume: 0.12, slideTo: 220, type: 'square' });
  playTone(220, now + 0.18, 0.22, { volume: 0.12, slideTo: 146.83, type: 'square' });
  playTone(146.83, now + 0.4, 0.42, { volume: 0.12, slideTo: 73.42, type: 'square' });
}
