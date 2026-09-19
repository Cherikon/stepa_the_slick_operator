import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Global } from '@emotion/react';
import { ArrowLeft, ArrowRight, CircleDollarSign, Gamepad2, Heart, ListOrdered, Menu, Pause, Play, RotateCcw, Shield, Trophy, X } from 'lucide-react';
import heroImage from './images/hero.png';
import faviconUrl from './images/favicon.png';
import fonImage from './images/fon.png';
import fpvImage from './images/fpv.png';
import homelessImage from './images/homeless.png';
import lifeImage from './images/life.png';
import goldMoneyImage from './images/goldMoney.png';
import magnetImage from './images/manget.png';
import money1Image from './images/money1.png';
import money5Image from './images/money5.png';
import money10Image from './images/money10.png';
import penaltyImage from './images/penalty.png';
import ponosImage from './images/ponos.png';
import reviewImage from './images/review.png';
import shieldImage from './images/shield.png';
import taxImage from './images/tax.png';
import voenkomImage from './images/voenkom.png';
import {
  playGameOverSound,
  playLifeSound,
  playMoneySound,
  playProblemSound,
  startBackgroundMusic,
  startMenuMusic,
  stopBackgroundMusic,
  stopMenuMusic
} from './audio';
import { defeatQuotes } from './defeatQuotes';
import {
  getCurrentPlayer,
  isLeaderboardConfigured,
  loadLeaderboard,
  onAuthChange,
  registerPlayer,
  signInPlayer,
  signOutPlayer,
  submitBestScore
} from './leaderboard';
import {
  AuthForm,
  Badge,
  ButtonRow,
  ControlsLine,
  DropImage,
  DropItem,
  DropLayer,
  EdgeFlash,
  GAME_HEIGHT,
  GAME_WIDTH,
  globalStyles,
  HeroPhoto,
  HERO_HEIGHT,
  HERO_WIDTH,
  HeroWrap,
  IntroPanel,
  Lives,
  LeaderboardList,
  LeaderboardPanel,
  MAX_LIVES,
  MobileMenuButton,
  MobileMenuPanel,
  NavButton,
  NavActions,
  NavBar,
  Metric,
  MobileControlButton,
  MobileControls,
  Page,
  PocketPulse,
  PrimaryButton,
  ProgressFill,
  ProgressTrack,
  ResultPanel,
  Shell,
  StatusPill,
  StatusRow,
  Stage,
  StageFrame,
  TopBar
} from './styles';

const HERO_Y = GAME_HEIGHT - HERO_HEIGHT - 20;
const WIN_SCORE = 300;
const MAGNET_DURATION = 7;
const SHIELD_DURATION = 10;
const MONEY_TYPES = [
  { kind: 'money', label: '1', value: 1, image: money1Image, size: 58, color: '#57d68d', weight: 30 },
  { kind: 'money', label: '5', value: 5, image: money5Image, size: 64, color: '#3ec5ff', weight: 18 },
  { kind: 'money', label: '10', value: 10, image: money10Image, size: 70, color: '#f5c94a', weight: 10 },
  { kind: 'money', label: '20', value: 20, image: goldMoneyImage, size: 76, color: '#ffd447', weight: 2, speedMultiplier: 1.2, glow: 'gold' }
];
const PROBLEM_TYPES = [
  { kind: 'problem', label: 'ОТЗЫВ', image: reviewImage, color: '#ff6b6b', size: 64, weight: 5 },
  { kind: 'problem', label: 'ТРУБА', image: homelessImage, color: '#0ea5e9', size: 64, weight: 5 },
  { kind: 'problem', label: 'НАЛОГ', image: taxImage, color: '#f97316', size: 64, weight: 5 },
  { kind: 'problem', label: 'ШТРАФ', image: penaltyImage, color: '#a855f7', size: 64, weight: 5 },
  { kind: 'problem', label: 'ВОЕНКОМ', image: voenkomImage, color: '#64748b', size: 64, weight: 5 },
  { kind: 'problem', label: 'FPV', image: fpvImage, color: '#ef4444', size: 64, weight: 5 },
  { kind: 'problem', label: 'ПОНОС', image: ponosImage, color: '#8b5a2b', size: 64, weight: 5 }
];
const HEART_TYPE = { kind: 'heart', label: 'ЖИЗНЬ', image: lifeImage, color: '#ff5d8f', size: 58, weight: 7 };
const MAGNET_TYPE = { kind: 'magnet', label: 'МАГНИТ', image: magnetImage, color: '#5ee7ff', size: 62, weight: 3 };
const SHIELD_TYPE = { kind: 'shield', label: 'ЩИТ', image: shieldImage, color: '#9aff6b', size: 62, weight: 3 };
const DROP_TYPES = [...MONEY_TYPES, ...PROBLEM_TYPES, HEART_TYPE, MAGNET_TYPE, SHIELD_TYPE];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function weightedRandomItem(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }

  return items[items.length - 1];
}

function getLossMessage(score) {
  if (score >= WIN_SCORE) {
    return 'Получилось неплохо, но попробуй еще!';
  }
  if (score < 50) {
    return 'На бизнесе заработать не вышло. Похоже, придется идти на СВО.';
  }
  if (score < 100) {
    return 'Уже лучше, но репетиторство пока бросать рановато.';
  }
  if (score < 200) {
    return 'На борщ с водочкой в питерском кафе хватит, а вот Париж пока подождет.';
  }
  if (score < 250) {
    return 'Пакуй чемоданы: Евро-трип почти оплачен. Еще и на винтажное платье жене останется.';
  }
  return 'Этого хватит на первый взнос за квартиру на Петроградке. Правда, ипотека будет лет на пятьдесят.';
}

function getControlDirection(event) {
  const key = event.key?.toLowerCase();
  if (event.code === 'ArrowLeft' || event.code === 'KeyA' || key === 'arrowleft' || key === 'a' || key === 'ф') {
    return -1;
  }
  if (event.code === 'ArrowRight' || event.code === 'KeyD' || key === 'arrowright' || key === 'd' || key === 'в') {
    return 1;
  }
  return 0;
}

function isTextInputTarget(target) {
  const tagName = target?.tagName?.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target?.isContentEditable
  );
}

function createDrop(level) {
  const type = weightedRandomItem(DROP_TYPES);
  const kind = type.kind;
  const size = type.size || 54;

  return {
    id: crypto.randomUUID(),
    kind,
    type,
    x: Math.random() * (GAME_WIDTH - size - 24) + 12,
    y: -size - Math.random() * 90,
    size,
    speed: (120 + level * 18 + Math.random() * 56) * (type.speedMultiplier || 1),
    rotation: Math.random() * 80 - 40,
    spin: Math.random() > 0.5 ? 1 : -1
  };
}

function App() {
  const [activeView, setActiveView] = useState('play');
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [phase, setPhase] = useState('intro');
  const [player, setPlayer] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [leaders, setLeaders] = useState([]);
  const [leaderboardError, setLeaderboardError] = useState('');
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [drops, setDrops] = useState([]);
  const [heroX, setHeroX] = useState((GAME_WIDTH - HERO_WIDTH) / 2);
  const [direction, setDirection] = useState(0);
  const [catchPulse, setCatchPulse] = useState(0);
  const [bonusText, setBonusText] = useState('+ в карман');
  const [defeatQuote, setDefeatQuote] = useState('');
  const [heroGlow, setHeroGlow] = useState(null);
  const [hitPulse, setHitPulse] = useState(0);
  const [healPulse, setHealPulse] = useState(0);
  const [magnetTime, setMagnetTime] = useState(0);
  const [shieldTime, setShieldTime] = useState(0);
  const [stageScale, setStageScale] = useState(1);
  const keysRef = useRef(new Set());
  const touchDirectionRef = useRef(0);
  const rafRef = useRef(null);
  const stageFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const heroXRef = useRef((GAME_WIDTH - HERO_WIDTH) / 2);
  const levelRef = useRef(0);
  const unlimitedModeRef = useRef(false);
  const lastSubmittedScoreRef = useRef(0);
  const magnetTimeRef = useRef(0);
  const shieldTimeRef = useRef(0);

  const level = Math.floor(score / 10);
  const progress = clamp(score / WIN_SCORE, 0, 1);

  const refreshLeaderboard = useCallback(async () => {
    setIsLoadingLeaders(true);
    setLeaderboardError('');
    try {
      setLeaders(await loadLeaderboard());
    } catch (error) {
      setLeaderboardError(error.message || 'Не получилось загрузить таблицу.');
    } finally {
      setIsLoadingLeaders(false);
    }
  }, []);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    let isMounted = true;

    if (!isLeaderboardConfigured) {
      setIsAuthReady(true);
      return undefined;
    }

    getCurrentPlayer()
      .then((currentPlayer) => {
        if (isMounted) setPlayer(currentPlayer);
      })
      .catch((error) => {
        if (isMounted) setAuthError(error.message || 'Не получилось восстановить вход.');
      })
      .finally(() => {
        if (isMounted) setIsAuthReady(true);
      });

    const unsubscribe = onAuthChange((currentPlayer) => {
      if (isMounted) setPlayer(currentPlayer);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (activeView === 'leaders') {
      refreshLeaderboard();
    }
  }, [activeView, refreshLeaderboard]);

  useEffect(() => {
    if (activeView !== 'play') return undefined;

    const element = stageFrameRef.current;
    if (!element) return undefined;

    const updateScale = () => {
      const nextScale = element.clientWidth / GAME_WIDTH;
      setStageScale((currentScale) => (
        Number.isFinite(nextScale) && nextScale > 0
          ? nextScale
          : currentScale || 1
      ));
    };
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    requestAnimationFrame(updateScale);

    return () => observer.disconnect();
  }, [activeView]);

  const resetGame = useCallback(() => {
    if (!player) {
      setPhase('auth');
      return;
    }
    startBackgroundMusic();
    keysRef.current.clear();
    touchDirectionRef.current = 0;
    setScore(0);
    setLives(MAX_LIVES);
    setDrops([]);
    setHeroX((GAME_WIDTH - HERO_WIDTH) / 2);
    heroXRef.current = (GAME_WIDTH - HERO_WIDTH) / 2;
    setDirection(0);
    setCatchPulse(0);
    setBonusText('+ в карман');
    setDefeatQuote('');
    setHeroGlow(null);
    setHitPulse(0);
    setHealPulse(0);
    setMagnetTime(0);
    setShieldTime(0);
    magnetTimeRef.current = 0;
    shieldTimeRef.current = 0;
    unlimitedModeRef.current = false;
    lastSubmittedScoreRef.current = 0;
    spawnTimerRef.current = 0;
    lastTimeRef.current = performance.now();
    setPhase('playing');
    requestAnimationFrame(() => stageFrameRef.current?.focus());
  }, [player]);

  const continueGame = useCallback(() => {
    unlimitedModeRef.current = true;
    startBackgroundMusic();
    lastTimeRef.current = performance.now();
    setPhase('playing');
    requestAnimationFrame(() => stageFrameRef.current?.focus());
  }, []);

  const togglePause = useCallback(() => {
    setPhase((currentPhase) => {
      if (currentPhase === 'playing') {
        keysRef.current.clear();
        touchDirectionRef.current = 0;
        setDirection(0);
        stopBackgroundMusic();
        return 'paused';
      }
      if (currentPhase === 'paused') {
        startBackgroundMusic();
        lastTimeRef.current = performance.now();
        requestAnimationFrame(() => stageFrameRef.current?.focus());
        return 'playing';
      }
      return currentPhase;
    });
  }, []);

  const handleAuthSubmit = useCallback(async (event) => {
    event.preventDefault();
    setAuthError('');
    setIsAuthSubmitting(true);
    try {
      const nextPlayer = authMode === 'signup'
        ? await registerPlayer({ email, password, nickname })
        : await signInPlayer({ email, password });
      setPlayer(nextPlayer);
      setPassword('');
      setNickname('');
      setPhase('intro');
      if (activeView === 'leaders') refreshLeaderboard();
    } catch (error) {
      setAuthError(error.message || 'Не получилось войти.');
    } finally {
      setIsAuthSubmitting(false);
    }
  }, [activeView, authMode, email, nickname, password, refreshLeaderboard]);

  const handleSignOut = useCallback(async () => {
    setAuthError('');
    try {
      await signOutPlayer();
      setPlayer(null);
      setPhase('intro');
    } catch (error) {
      setAuthError(error.message || 'Не получилось выйти.');
    }
  }, []);

  const submitCurrentBest = useCallback(async (finalScore) => {
    if (!player || finalScore <= lastSubmittedScoreRef.current) return;
    lastSubmittedScoreRef.current = finalScore;
    try {
      const updatedPlayer = await submitBestScore(player, finalScore);
      setPlayer(updatedPlayer);
      if (activeView === 'leaders') refreshLeaderboard();
    } catch (error) {
      setLeaderboardError(error.message || 'Не получилось обновить лучший результат.');
    }
  }, [activeView, player, refreshLeaderboard]);

  useEffect(() => {
    if (activeView === 'leaders' && phase === 'playing') {
      keysRef.current.clear();
      touchDirectionRef.current = 0;
      setDirection(0);
      stopBackgroundMusic();
      setPhase('paused');
    }
  }, [activeView, phase]);

  useEffect(() => {
    return () => {
      stopBackgroundMusic();
      stopMenuMusic();
    };
  }, []);

  useEffect(() => {
    const unlockAudio = () => setAudioUnlocked(true);

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (!audioUnlocked) return;

    const shouldPlayMenuMusic = activeView === 'play' && (phase === 'intro' || phase === 'auth');
    if (shouldPlayMenuMusic) {
      startMenuMusic();
    } else {
      stopMenuMusic();
    }
  }, [activeView, audioUnlocked, phase]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (isTextInputTarget(event.target)) return;

      const moveDirection = getControlDirection(event);
      if (moveDirection !== 0) {
        event.preventDefault();
        keysRef.current.add(moveDirection < 0 ? 'left' : 'right');
        if (!event.repeat && phase === 'playing') {
          setDirection(moveDirection);
          setHeroX((current) => {
            const nextX = clamp(current + moveDirection * 34, 0, GAME_WIDTH - HERO_WIDTH);
            heroXRef.current = nextX;
            return nextX;
          });
        }
      }
      if (event.code === 'Escape' && (phase === 'playing' || phase === 'paused')) {
        event.preventDefault();
        togglePause();
      }
      if (event.code === 'Space' && phase !== 'playing' && phase !== 'paused') {
        event.preventDefault();
        resetGame();
      }
    };
    const onKeyUp = (event) => {
      if (isTextInputTarget(event.target)) return;

      const moveDirection = getControlDirection(event);
      if (moveDirection !== 0) {
        keysRef.current.delete(moveDirection < 0 ? 'left' : 'right');
      }
    };
    const onBlur = () => {
      keysRef.current.clear();
      touchDirectionRef.current = 0;
      setDirection(0);
    };

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
      window.removeEventListener('blur', onBlur);
    };
  }, [phase, resetGame, togglePause]);

  useEffect(() => {
    if (phase !== 'playing') {
      cancelAnimationFrame(rafRef.current);
      return undefined;
    }

    const tick = (time) => {
      const previous = lastTimeRef.current || time;
      const delta = Math.min((time - previous) / 1000, 0.033);
      lastTimeRef.current = time;

      const left = keysRef.current.has('left');
      const right = keysRef.current.has('right');
      const keyboardDirection = right ? 1 : left ? -1 : 0;
      const activeDirection = touchDirectionRef.current || keyboardDirection;
      const hasActiveMagnet = magnetTimeRef.current > 0;
      const hasActiveShield = shieldTimeRef.current > 0;

      if (hasActiveMagnet) {
        const nextMagnetTime = Math.max(0, magnetTimeRef.current - delta);
        magnetTimeRef.current = nextMagnetTime;
        setMagnetTime(nextMagnetTime);
      }
      if (hasActiveShield) {
        const nextShieldTime = Math.max(0, shieldTimeRef.current - delta);
        shieldTimeRef.current = nextShieldTime;
        setShieldTime(nextShieldTime);
      }

      setHeroX((current) => {
        const moveDirection = activeDirection;
        setDirection(moveDirection);
        const nextX = clamp(current + moveDirection * (390 + levelRef.current * 12) * delta, 0, GAME_WIDTH - HERO_WIDTH);
        heroXRef.current = nextX;
        return nextX;
      });

      spawnTimerRef.current -= delta;
      if (spawnTimerRef.current <= 0) {
        setDrops((current) => [...current, createDrop(levelRef.current)]);
        spawnTimerRef.current = Math.max(0.38, 0.95 - levelRef.current * 0.045);
      }

      setDrops((current) => {
        const next = [];
        let gained = 0;
        let damage = 0;
        let healed = 0;
        let magnetBonus = false;
        let shieldBonus = false;
        let caughtMoney = false;
        let caughtGoldMoney = false;
        let caughtProblem = false;
        let caughtHeart = false;

        for (const drop of current) {
          const heroCenter = heroXRef.current + HERO_WIDTH / 2;
          let nextX = drop.x;
          if (hasActiveMagnet && drop.kind === 'money') {
            const dropCenter = drop.x + drop.size / 2;
            const pullDistance = heroCenter - dropCenter;
            if (Math.abs(pullDistance) < 280) {
              nextX = clamp(drop.x + pullDistance * 2.1 * delta, 0, GAME_WIDTH - drop.size);
            }
          }

          const moved = {
            ...drop,
            x: nextX,
            y: drop.y + drop.speed * delta,
            rotation: drop.rotation + drop.spin * 95 * delta
          };
          const dropCenter = moved.x + moved.size / 2;
          const caught =
            moved.y + moved.size > HERO_Y + 42 &&
            moved.y < HERO_Y + HERO_HEIGHT - 20 &&
            Math.abs(dropCenter - heroCenter) < HERO_WIDTH * 0.54;

          if (caught) {
            if (moved.kind === 'money') {
              gained += moved.type.value;
              caughtMoney = true;
              if (moved.type.glow === 'gold') caughtGoldMoney = true;
            } else if (moved.kind === 'heart') {
              healed += 1;
              caughtHeart = true;
            } else if (moved.kind === 'magnet') {
              magnetBonus = true;
            } else if (moved.kind === 'shield') {
              shieldBonus = true;
            } else {
              if (shieldTimeRef.current > 0) {
                shieldTimeRef.current = 0;
                setShieldTime(0);
                setBonusText('щит спас');
                setCatchPulse((value) => value + 1);
              } else {
                damage += 1;
              }
              caughtProblem = true;
            }
          } else if (moved.y < GAME_HEIGHT + 80) {
            next.push(moved);
          }
        }

        if (gained > 0) {
          playMoneySound();
          setScore((currentScore) => {
            const updated = currentScore + gained;
            if (!unlimitedModeRef.current && currentScore < WIN_SCORE && updated >= WIN_SCORE) {
              stopBackgroundMusic();
              setPhase('won');
            }
            return updated;
          });
        }
        if (damage > 0) {
          setLives((currentLives) => {
            const updated = Math.max(0, currentLives - damage);
            if (updated <= 0) {
              stopBackgroundMusic();
              playGameOverSound();
              setPhase('lost');
            } else {
              playProblemSound();
            }
            return updated;
          });
        }
        if (healed > 0) {
          playLifeSound();
          setLives((currentLives) => Math.min(MAX_LIVES, currentLives + healed));
          setHealPulse((value) => value + 1);
        }
        if (magnetBonus) {
          playLifeSound();
          magnetTimeRef.current = MAGNET_DURATION;
          setMagnetTime(MAGNET_DURATION);
          setHeroGlow({ tone: 'magnet', id: crypto.randomUUID() });
        }
        if (shieldBonus) {
          playLifeSound();
          shieldTimeRef.current = SHIELD_DURATION;
          setShieldTime(SHIELD_DURATION);
          setHeroGlow({ tone: 'shield', id: crypto.randomUUID() });
        }
        if (caughtGoldMoney) {
          setHeroGlow({ tone: 'gold', id: crypto.randomUUID() });
        }
        if (caughtMoney || caughtHeart || magnetBonus || shieldBonus) {
          setBonusText(
            magnetBonus
              ? 'магнит'
              : shieldBonus
                ? 'щит'
                : caughtHeart
                  ? '+ жизнь'
                  : '+ в карман'
          );
          setCatchPulse((value) => value + 1);
        }
        if (caughtProblem && damage > 0) setHitPulse((value) => value + 1);

        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase === 'won' || phase === 'lost') {
      submitCurrentBest(score);
    }
  }, [phase, score, submitCurrentBest]);

  useEffect(() => {
    if (phase === 'lost' && score >= WIN_SCORE && !defeatQuote) {
      setDefeatQuote(defeatQuotes[Math.floor(Math.random() * defeatQuotes.length)]);
    }
  }, [defeatQuote, phase, score]);

  const focusStage = () => {
    stageFrameRef.current?.focus();
  };

  const startMobileMove = (moveDirection) => (event) => {
    event.preventDefault();
    if (phase !== 'playing') return;
    touchDirectionRef.current = moveDirection;
    setDirection(moveDirection);
    stageFrameRef.current?.focus();
  };

  const stopMobileMove = (event) => {
    event.preventDefault();
    touchDirectionRef.current = 0;
    setDirection(0);
  };

  const overlay = useMemo(() => {
    if (!isAuthReady) {
      return (
        <IntroPanel>
          <Badge><Gamepad2 size={18} /> Аккаунт</Badge>
          <h1>Загружаем профиль</h1>
          <p>Проверяем, вошел ли игрок в аккаунт.</p>
        </IntroPanel>
      );
    }

    if (!player || phase === 'auth') {
      return (
        <IntroPanel>
          <Badge><Gamepad2 size={18} /> Игрок</Badge>
          <h1>{authMode === 'signup' ? 'Регистрация' : 'Вход'}</h1>
          <p>
            В аккаунте хранится лучший результат, поэтому можно играть с телефона,
            компьютера или любого другого устройства. В таблице виден только ник.
          </p>
          <AuthForm onSubmit={handleAuthSubmit}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="пароль"
              autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
            />
            {authMode === 'signup' && (
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="stepa_300"
                maxLength={16}
                autoComplete="nickname"
              />
            )}
            <ButtonRow>
              <PrimaryButton type="submit" disabled={isAuthSubmitting || !isLeaderboardConfigured}>
                <Play size={20} /> {isAuthSubmitting ? 'Секунду...' : authMode === 'signup' ? 'Создать аккаунт' : 'Войти'}
              </PrimaryButton>
              <PrimaryButton
                type="button"
                onClick={() => {
                  setAuthError('');
                  setAuthMode((mode) => (mode === 'signup' ? 'signin' : 'signup'));
                }}
              >
                {authMode === 'signup' ? 'Уже есть аккаунт' : 'Регистрация'}
              </PrimaryButton>
            </ButtonRow>
          </AuthForm>
          {authError && <ControlsLine>{authError}</ControlsLine>}
          {!isLeaderboardConfigured && (
            <ControlsLine>Добавь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env, чтобы включить аккаунты.</ControlsLine>
          )}
        </IntroPanel>
      );
    }

    if (phase === 'intro') {
      return (
        <IntroPanel>
          <Badge><CircleDollarSign size={18} /> Цель: 300 очков</Badge>
          <h1>Богатый Стёпа, Бедный Стёпа</h1>
          <p>
            Перемещай персонажа влево и вправо, лови деньги разного номинала и обходи проблемы.
            За каждую проблему сгорает жизнь, всего их три. Редкие сердечки восстанавливают жизнь.
            Наберешь 300 очков — получишь приз.
          </p>
          <ControlsLine>Управление: стрелки или A/D.</ControlsLine>
          <PrimaryButton onClick={resetGame}><Play size={20} /> Играть как {player.nickname}</PrimaryButton>
        </IntroPanel>
      );
    }

    if (phase === 'paused') {
      return (
        <ResultPanel tone="pause">
          <Pause size={42} />
          <h2>Пауза</h2>
          <p>Степа замер, деньги зависли, проблемы делают вид, что их тут не было.</p>
          <PrimaryButton onClick={togglePause}><Play size={20} /> Продолжить</PrimaryButton>
        </ResultPanel>
      );
    }

    if (phase === 'won' || phase === 'lost') {
      const won = phase === 'won';
      return (
        <ResultPanel tone={won ? 'win' : 'lose'}>
          {won ? <Trophy size={42} /> : <Heart size={42} />}
          <h2>{won ? 'Приз почти в кармане!' : 'Жизни закончились'}</h2>
          <p>
            {won
              ? 'Квартира напротив Исаакия, дача в Италии и капитал для трех будущих поколений — все это теперь твое!'
              : (
                <>
                  Финальный счет: {score}.<br />
                  {getLossMessage(score)}
                  {score >= WIN_SCORE && defeatQuote ? (
                    <>
                      <br />
                      {defeatQuote}
                    </>
                  ) : null}
                </>
              )}
          </p>
          {won ? (
            <ButtonRow>
              <PrimaryButton onClick={continueGame}><Play size={20} /> Играть дальше</PrimaryButton>
              <PrimaryButton onClick={resetGame}><RotateCcw size={20} /> Новый раунд</PrimaryButton>
            </ButtonRow>
          ) : (
            <PrimaryButton onClick={resetGame}><RotateCcw size={20} /> Еще раунд</PrimaryButton>
          )}
        </ResultPanel>
      );
    }

    return null;
  }, [
    authError,
    authMode,
    continueGame,
    defeatQuote,
    email,
    handleAuthSubmit,
    isAuthReady,
    isAuthSubmitting,
    nickname,
    password,
    phase,
    player,
    resetGame,
    score,
    togglePause
  ]);

  return (
    <>
      <Global styles={globalStyles} />
      <Page>
        <Shell>
          <NavBar>
            <NavActions>
              <NavButton type="button" $active={activeView === 'play'} onClick={() => setActiveView('play')}>
                <Gamepad2 size={18} /> Играть
              </NavButton>
              <NavButton type="button" $active={activeView === 'leaders'} onClick={() => setActiveView('leaders')}>
                <ListOrdered size={18} /> Результаты
              </NavButton>
              {player && (
                <NavButton type="button" onClick={handleSignOut}>
                  Выйти
                </NavButton>
              )}
            </NavActions>

            <MobileMenuButton
              type="button"
              aria-label={isNavMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={isNavMenuOpen}
              onClick={() => setIsNavMenuOpen((open) => !open)}
            >
              {isNavMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </MobileMenuButton>

            {isNavMenuOpen && (
              <MobileMenuPanel>
                <NavButton
                  type="button"
                  $active={activeView === 'play'}
                  onClick={() => {
                    setActiveView('play');
                    setIsNavMenuOpen(false);
                  }}
                >
                  <Gamepad2 size={18} /> Играть
                </NavButton>
                <NavButton
                  type="button"
                  $active={activeView === 'leaders'}
                  onClick={() => {
                    setActiveView('leaders');
                    setIsNavMenuOpen(false);
                  }}
                >
                  <ListOrdered size={18} /> Результаты
                </NavButton>
                {player && (
                  <NavButton
                    type="button"
                    onClick={() => {
                      setIsNavMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    Выйти
                  </NavButton>
                )}
              </MobileMenuPanel>
            )}
          </NavBar>

          {activeView === 'leaders' ? (
            <LeaderboardPanel>
              <Badge><Trophy size={18} /> Лучшие охотники за деньгами</Badge>
              {isLoadingLeaders ? (
                <p>Загружаем таблицу...</p>
              ) : leaderboardError ? (
                <p>{leaderboardError}</p>
              ) : leaders.length === 0 ? (
                <p>Пока пусто. Самое время вписать свое имя в историю.</p>
              ) : (
                <LeaderboardList>
                  {leaders.map((leader, index) => (
                    <li key={leader.nickname}>
                      <span>{index + 1}</span>
                      <strong>{leader.nickname}</strong>
                      <b>{leader.best_score}</b>
                    </li>
                  ))}
                </LeaderboardList>
              )}
              {player && <p>Ты играешь как {player.nickname}. Лучший счет: {player.bestScore || 0}.</p>}
            </LeaderboardPanel>
          ) : (
            <>
          <TopBar>
            <Metric>
              <span>Очки</span>
              <strong>{score}</strong>
            </Metric>
            <ProgressTrack aria-label="Прогресс до приза">
              <ProgressFill style={{ transform: `scaleX(${progress})` }} />
            </ProgressTrack>
            <Lives aria-label={`Жизни: ${lives}`}>
              {Array.from({ length: MAX_LIVES }).map((_, index) => (
                <Heart key={index} size={24} fill={index < lives ? '#ff4d6d' : 'transparent'} />
              ))}
            </Lives>
            <Metric>
              <span>Скорость</span>
              <strong>x{(1 + level * 0.12).toFixed(1)}</strong>
            </Metric>
            <NavButton
              type="button"
              onClick={togglePause}
              disabled={phase !== 'playing' && phase !== 'paused'}
            >
              {phase === 'paused' ? <Play size={18} /> : <Pause size={18} />}
              {phase === 'paused' ? 'Дальше' : 'Пауза'}
            </NavButton>
          </TopBar>

          <StageFrame
            ref={stageFrameRef}
            tabIndex={0}
            aria-label="Игровое поле"
            onPointerDown={focusStage}
          >
            <Stage
              style={{ transform: `scale(${stageScale})` }}
              $backgroundImage={fonImage}
            >
              {(magnetTime > 0 || shieldTime > 0) && (
                <StatusRow $floating>
                  {magnetTime > 0 && (
                    <StatusPill $active>Магнит {Math.ceil(magnetTime)}с</StatusPill>
                  )}
                  {shieldTime > 0 && (
                    <StatusPill $active><Shield size={16} /> Щит {Math.ceil(shieldTime)}с</StatusPill>
                  )}
                </StatusRow>
              )}

              <DropLayer>
                {drops.map((drop) => (
                  <DropItem
                    key={drop.id}
                    $kind={drop.kind}
                    $color={drop.type.color}
                    $hasImage={Boolean(drop.type.image)}
                    style={{
                      width: drop.size,
                      height: drop.size,
                      transform: `translate3d(${drop.x}px, ${drop.y}px, 0) rotate(${drop.rotation}deg)`
                    }}
                  >
                    {drop.type.image ? (
                      <DropImage src={drop.type.image} alt={drop.type.label} draggable="false" />
                    ) : (
                      <>
                        <span>{drop.type.icon || '$'}</span>
                        <b>{drop.kind === 'money' ? `+${drop.type.label}` : drop.type.label}</b>
                      </>
                    )}
                  </DropItem>
                ))}
              </DropLayer>

              <HeroWrap
              style={{ transform: `translate3d(${heroX}px, ${HERO_Y}px, 0)` }}
              $direction={direction}
              $glow={heroGlow?.tone}
              key={heroGlow?.id || 'hero'}
            >
                <HeroPhoto src={heroImage} alt="Персонаж Степа" draggable="false" />
                <PocketPulse key={catchPulse}>{bonusText}</PocketPulse>
              </HeroWrap>

              {hitPulse > 0 && <EdgeFlash key={`hit-${hitPulse}`} $tone="damage" />}
              {healPulse > 0 && <EdgeFlash key={`heal-${healPulse}`} $tone="heal" />}

              {overlay}
            </Stage>
          </StageFrame>

          <MobileControls aria-label="Мобильное управление">
            <MobileControlButton
              type="button"
              aria-label="Влево"
              onPointerDown={startMobileMove(-1)}
              onPointerUp={stopMobileMove}
              onPointerCancel={stopMobileMove}
              onPointerLeave={stopMobileMove}
            >
              <ArrowLeft aria-hidden="true" />
            </MobileControlButton>
            <MobileControlButton
              type="button"
              aria-label="Вправо"
              onPointerDown={startMobileMove(1)}
              onPointerUp={stopMobileMove}
              onPointerCancel={stopMobileMove}
              onPointerLeave={stopMobileMove}
            >
              <ArrowRight aria-hidden="true" />
            </MobileControlButton>
          </MobileControls>
            </>
          )}
        </Shell>
      </Page>
    </>
  );
}

function syncFavicon() {
  const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
  favicon.setAttribute('rel', 'icon');
  favicon.setAttribute('type', 'image/png');
  favicon.setAttribute('href', faviconUrl);
  if (!favicon.parentNode) document.head.appendChild(favicon);
}

syncFavicon();
createRoot(document.getElementById('root')).render(<App />);
