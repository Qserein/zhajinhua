let audioContext = null;

const createAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

const loadSound = async (url) => {
  const context = createAudioContext();
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await context.decodeAudioData(arrayBuffer);
};

const playSound = (buffer, loop = false) => {
  const context = createAudioContext();
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.loop = loop;
  source.start();
  return source;
};

let bgMusic = null;

export const initSounds = async () => {
  const sounds = {
    bg1: await loadSound('/sounds/bg1.mp3'),      // 背景音乐1
    bg2: await loadSound('/sounds/bg2.mp3'),      // 背景音乐2
    bg3: await loadSound('/sounds/bg3.mp3'),      // 背景音乐3
    bg4: await loadSound('/sounds/bg4.mp3'),      // 背景音乐4

    deal: await loadSound('/sounds/deal.mp3'),      // 发牌音效
    bet: await loadSound('/sounds/bet.mp3'),        // 下注音效
    compareWin: await loadSound('/sounds/compare_win.mp3'),  // 比牌胜利音效
    compareLose: await loadSound('/sounds/compare_lose.mp3'),  // 比牌失败音效
    reveal: await loadSound('/sounds/reveal.mp3'),  // 看牌音效
    fold: await loadSound('/sounds/fold.mp3'),      // 弃牌音效
    nextRound: await loadSound('/sounds/next_round.mp3'),  // 开始下一轮音效
  };

  return {
    playBg1: (stop = false) => {
      if (bgMusic) bgMusic.stop();
      if (!stop) bgMusic = playSound(sounds.bg1, true);
    },
    playBg2: (stop = false) => {
      if (bgMusic) bgMusic.stop();
      if (!stop) bgMusic = playSound(sounds.bg2, true);
    },
    playBg3: (stop = false) => {
      if (bgMusic) bgMusic.stop();
      if (!stop) bgMusic = playSound(sounds.bg3, true);
    },
    playBg4: (stop = false) => {
      if (bgMusic) bgMusic.stop();
      if (!stop) bgMusic = playSound(sounds.bg4, true);
    },
    playDeal: () => playSound(sounds.deal),
    playBet: () => playSound(sounds.bet),
    playCompareWin: () => playSound(sounds.compareWin),
    playCompareLose: () => playSound(sounds.compareLose),
    playReveal: () => playSound(sounds.reveal),
    playFold: () => playSound(sounds.fold),
    playNextRound: () => playSound(sounds.nextRound),
  };
};

export const resumeAudioContext = () => {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
};

