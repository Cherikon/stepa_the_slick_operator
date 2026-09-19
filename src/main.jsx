import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Global } from '@emotion/react';
import { CircleDollarSign, Heart, Play, RotateCcw, Trophy } from 'lucide-react';
import heroImage from './images/hero.png';
import faviconUrl from './images/favicon.png';
import homelessImage from './images/homeless.png';
import lifeImage from './images/life.png';
import money1Image from './images/money1.png';
import money5Image from './images/money5.png';
import money10Image from './images/money10.png';
import penaltyImage from './images/penalty.png';
import reviewImage from './images/review.png';
import taxImage from './images/tax.png';
import voenkomImage from './images/voenkom.png';
import {
  Badge,
  ControlsLine,
  DropImage,
  DropItem,
  DropLayer,
  GAME_HEIGHT,
  GAME_WIDTH,
  globalStyles,
  HeroPhoto,
  HERO_HEIGHT,
  HERO_WIDTH,
  HeroWrap,
  IntroPanel,
  Lives,
  MAX_LIVES,
  Metric,
  Page,
  PocketPulse,
  PrimaryButton,
  ProgressFill,
  ProgressTrack,
  ResultPanel,
  Shell,
  Skyline,
  Stage,
  StageFrame,
  TopBar
} from './styles';

const HERO_Y = GAME_HEIGHT - HERO_HEIGHT - 20;
const WIN_SCORE = 300;
const MONEY_TYPES = [
  { label: '1', value: 1, image: money1Image, size: 58, color: '#57d68d' },
  { label: '5', value: 5, image: money5Image, size: 64, color: '#3ec5ff' },
  { label: '10', value: 10, image: money10Image, size: 70, color: '#f5c94a' }
];
const PROBLEM_TYPES = [
  { label: 'ОТЗЫВ', image: reviewImage, color: '#ff6b6b', size: 64 },
  { label: 'ТРУБА', image: homelessImage, color: '#0ea5e9', size: 64 },
  { label: 'НАЛОГ', image: taxImage, color: '#f97316', size: 64 },
  { label: 'ШТРАФ', image: penaltyImage, color: '#a855f7', size: 64 },
  { label: 'ВОЕНКОМ', image: voenkomImage, color: '#64748b', size: 64 }
];
const HEART_TYPE = { label: 'ЖИЗНЬ', image: lifeImage, color: '#ff5d8f', size: 58 };

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
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

function createDrop(level) {
  const roll = Math.random();
  const kind = roll < 0.08 ? 'heart' : roll < 0.42 ? 'problem' : 'money';
  const type = kind === 'money' ? randomItem(MONEY_TYPES) : kind === 'problem' ? randomItem(PROBLEM_TYPES) : HEART_TYPE;
  const size = type.size || 54;

  return {
    id: crypto.randomUUID(),
    kind,
    type,
    x: Math.random() * (GAME_WIDTH - size - 24) + 12,
    y: -size - Math.random() * 90,
    size,
    speed: 120 + level * 18 + Math.random() * 56,
    rotation: Math.random() * 80 - 40,
    spin: Math.random() > 0.5 ? 1 : -1
  };
}

function App() {
  const [phase, setPhase] = useState('intro');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [drops, setDrops] = useState([]);
  const [heroX, setHeroX] = useState((GAME_WIDTH - HERO_WIDTH) / 2);
  const [direction, setDirection] = useState(0);
  const [catchPulse, setCatchPulse] = useState(0);
  const [bonusText, setBonusText] = useState('+ в карман');
  const [hitPulse, setHitPulse] = useState(0);
  const [stageScale, setStageScale] = useState(1);
  const keysRef = useRef(new Set());
  const rafRef = useRef(null);
  const stageFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const heroXRef = useRef((GAME_WIDTH - HERO_WIDTH) / 2);
  const levelRef = useRef(0);

  const level = Math.floor(score / 10);
  const progress = clamp(score / WIN_SCORE, 0, 1);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    const element = stageFrameRef.current;
    if (!element) return undefined;

    const updateScale = () => {
      const rect = element.getBoundingClientRect();
      setStageScale(rect.width / GAME_WIDTH);
    };
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    updateScale();

    return () => observer.disconnect();
  }, []);

  const resetGame = useCallback(() => {
    keysRef.current.clear();
    setScore(0);
    setLives(MAX_LIVES);
    setDrops([]);
    setHeroX((GAME_WIDTH - HERO_WIDTH) / 2);
    heroXRef.current = (GAME_WIDTH - HERO_WIDTH) / 2;
    setDirection(0);
    setCatchPulse(0);
    setBonusText('+ в карман');
    setHitPulse(0);
    spawnTimerRef.current = 0;
    lastTimeRef.current = performance.now();
    setPhase('playing');
    requestAnimationFrame(() => stageFrameRef.current?.focus());
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
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
      if (event.code === 'Space' && phase !== 'playing') {
        event.preventDefault();
        resetGame();
      }
    };
    const onKeyUp = (event) => {
      const moveDirection = getControlDirection(event);
      if (moveDirection !== 0) {
        keysRef.current.delete(moveDirection < 0 ? 'left' : 'right');
      }
    };
    const onBlur = () => {
      keysRef.current.clear();
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
  }, [phase, resetGame]);

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

      setHeroX((current) => {
        const moveDirection = keyboardDirection;
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
        let caughtMoney = false;
        let caughtProblem = false;
        let caughtHeart = false;

        for (const drop of current) {
          const moved = {
            ...drop,
            y: drop.y + drop.speed * delta,
            rotation: drop.rotation + drop.spin * 95 * delta
          };
          const heroCenter = heroXRef.current + HERO_WIDTH / 2;
          const dropCenter = moved.x + moved.size / 2;
          const caught =
            moved.y + moved.size > HERO_Y + 42 &&
            moved.y < HERO_Y + HERO_HEIGHT - 20 &&
            Math.abs(dropCenter - heroCenter) < HERO_WIDTH * 0.54;

          if (caught) {
            if (moved.kind === 'money') {
              gained += moved.type.value;
              caughtMoney = true;
            } else if (moved.kind === 'heart') {
              healed += 1;
              caughtHeart = true;
            } else {
              damage += 1;
              caughtProblem = true;
            }
          } else if (moved.y < GAME_HEIGHT + 80) {
            next.push(moved);
          }
        }

        if (gained > 0) {
          setScore((currentScore) => {
            const updated = Math.min(WIN_SCORE, currentScore + gained);
            if (updated >= WIN_SCORE) setPhase('won');
            return updated;
          });
        }
        if (damage > 0) {
          setLives((currentLives) => {
            const updated = Math.max(0, currentLives - damage);
            if (updated <= 0) setPhase('lost');
            return updated;
          });
        }
        if (healed > 0) {
          setLives((currentLives) => Math.min(MAX_LIVES, currentLives + healed));
        }
        if (caughtMoney || caughtHeart) {
          setBonusText(caughtHeart ? '+ жизнь' : '+ в карман');
          setCatchPulse((value) => value + 1);
        }
        if (caughtProblem) setHitPulse((value) => value + 1);

        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const focusStage = () => {
    stageFrameRef.current?.focus();
  };

  const overlay = useMemo(() => {
    if (phase === 'intro') {
      return (
        <IntroPanel>
          <Badge><CircleDollarSign size={18} /> Цель: 300 очков</Badge>
          <h1>Степа ловит деньги</h1>
          <p>
            Перемещай персонажа влево и вправо, лови деньги разного номинала и обходи проблемы.
            За каждую проблему сгорает жизнь, всего их три. Редкие сердечки восстанавливают жизнь.
            Наберешь 300 очков — получишь приз.
          </p>
          <ControlsLine>Управление: стрелки или A/D.</ControlsLine>
          <PrimaryButton onClick={resetGame}><Play size={20} /> Играть</PrimaryButton>
        </IntroPanel>
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
              ? 'Степа набрал 300 очков и ловко сложил добычу в карман.'
              : `Финальный счет: ${score}. Можно сразу попробовать еще раз.`}
          </p>
          <PrimaryButton onClick={resetGame}><RotateCcw size={20} /> Еще раунд</PrimaryButton>
        </ResultPanel>
      );
    }

    return null;
  }, [phase, resetGame, score]);

  return (
    <>
      <Global styles={globalStyles} />
      <Page>
        <Shell>
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
          </TopBar>

          <StageFrame
            ref={stageFrameRef}
            tabIndex={0}
            aria-label="Игровое поле"
            onPointerDown={focusStage}
          >
            <Stage
              style={{ transform: `scale(${stageScale})` }}
              $shaking={hitPulse}
            >
              <Skyline />
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
                $catchPulse={catchPulse}
              >
                <HeroPhoto src={heroImage} alt="Персонаж Степа" draggable="false" />
                <PocketPulse key={catchPulse}>{bonusText}</PocketPulse>
              </HeroWrap>

              {overlay}
            </Stage>
          </StageFrame>
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
