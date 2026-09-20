import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const GAME_WIDTH = 900;
export const GAME_HEIGHT = 620;
export const HERO_WIDTH = 210;
export const HERO_HEIGHT = 270;
export const MAX_LIVES = 3;

export const globalStyles = css`
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    min-height: 100%;
  }

  html {
    scrollbar-gutter: stable;
  }

  body {
    margin: 0;
    font-family: "Press Start 2P", "Courier New", "Lucida Console", Monaco, monospace;
    color: #f8f4d8;
    background:
      linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(0deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      radial-gradient(circle at 50% 18%, #263a6d 0 12%, transparent 36%),
      linear-gradient(180deg, #101629 0%, #1b1d3d 56%, #080b17 100%);
    background-size: 18px 18px, 18px 18px, 100% 100%, 100% 100%;
    overflow-x: hidden;
  }

  button {
    font: inherit;
  }

  img {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }
`;

export const Page = styled.main`
  min-height: 100vh;
  display: grid;
  justify-items: center;
  align-items: start;
  padding: 24px;

  @media (max-width: 760px) {
    padding: 8px;
  }
`;

export const Shell = styled.section`
  width: min(100%, 980px);
`;

export const NavBar = styled.nav`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;

  @media (max-width: 760px) {
    justify-content: flex-end;
    margin-bottom: 8px;
  }
`;

export const NavActions = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 760px) {
    display: none;
  }
`;

export const NavButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 10px 14px;
  border: 4px solid #f8f4d8;
  border-radius: 0;
  color: ${({ $active }) => ($active ? '#101629' : '#f8f4d8')};
  background: ${({ $active }) => ($active ? '#fff26a' : '#2f3564')};
  box-shadow: 5px 5px 0 #050711;
  cursor: pointer;
  font-size: 0.66rem;

  svg {
    display: block;
  }

  &:active {
    transform: translate(3px, 3px);
    box-shadow: 2px 2px 0 #050711;
  }

  &:disabled {
    opacity: 0.58;
    cursor: default;
    transform: none;
  }

  @media (max-width: 760px) {
    width: 100%;
    padding: 9px 8px;
    border-width: 3px;
    font-size: 0.55rem;
  }
`;

export const MobileMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 42px;
  padding: 0;
  border: 4px solid #f8f4d8;
  border-radius: 0;
  color: #101629;
  background: #fff26a;
  box-shadow: 5px 5px 0 #050711;
  cursor: pointer;

  svg {
    display: block;
  }

  @media (max-width: 760px) {
    display: inline-flex;
    border-width: 3px;
  }
`;

export const MobileMenuPanel = styled.div`
  display: none;

  @media (max-width: 760px) {
    position: absolute;
    z-index: 30;
    top: calc(100% + 8px);
    right: 0;
    display: grid;
    gap: 10px;
    width: min(260px, calc(100vw - 16px));
    padding: 10px;
    border: 4px solid #f8f4d8;
    background: #171b32;
    box-shadow: 6px 6px 0 #050711;
  }
`;

export const TopBar = styled.div`
  display: grid;
  grid-template-columns: minmax(82px, auto) 1fr minmax(112px, auto) minmax(92px, auto) auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
  padding: 12px;
  border: 4px solid #f8f4d8;
  border-radius: 0;
  background: #171b32;
  box-shadow: 8px 8px 0 #050711;

  @media (max-width: 680px) {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 8px;
    padding: 8px;
    border-width: 3px;
    box-shadow: 5px 5px 0 #050711;
  }
`;

export const Metric = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;

  span {
    color: #78d6ff;
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  strong {
    font-size: clamp(1rem, 3vw, 1.34rem);
    line-height: 1.25;
    color: #fff2a8;
    text-shadow: 2px 2px 0 #000;
  }
`;

export const Lives = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  align-items: center;
  color: #ff4d6d;
`;

export const StatusRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  ${({ $floating }) => $floating && `
    position: absolute;
    z-index: 7;
    top: 14px;
    right: 14px;
    justify-content: flex-end;
    max-width: 310px;
    pointer-events: none;
  `}

  @media (max-width: 680px) {
    ${({ $floating }) => $floating && `
      top: 10px;
      right: 10px;
      max-width: 220px;
    `}
  }
`;

export const StatusPill = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 28px;
  padding: 5px 7px;
  border: 3px solid ${({ $active }) => ($active ? '#fff26a' : '#414765')};
  color: ${({ $active }) => ($active ? '#fff26a' : '#7d849f')};
  background: ${({ $active }) => ($active ? '#101629' : '#171b32')};
  font-size: 0.52rem;
  line-height: 1.2;
  white-space: nowrap;

  svg {
    display: block;
    width: 14px;
    height: 14px;
  }
`;

export const ProgressTrack = styled.div`
  height: 16px;
  overflow: hidden;
  border-radius: 0;
  border: 3px solid #f8f4d8;
  background: #060914;

  @media (max-width: 680px) {
    grid-column: 1 / -1;
    order: 6;
  }
`;

export const ProgressFill = styled.div`
  height: 100%;
  width: 100%;
  transform-origin: left center;
  transition: transform 120ms steps(5, end);
  background:
    repeating-linear-gradient(90deg, transparent 0 12px, rgba(0, 0, 0, 0.28) 12px 16px),
    linear-gradient(90deg, #3cff72, #fff26a, #ff5a5f);
`;

export const StageFrame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: ${GAME_WIDTH} / ${GAME_HEIGHT};
  min-height: 430px;
  max-height: calc(100vh - 130px);
  overflow: hidden;
  border-radius: 0;
  border: 6px solid #f8f4d8;
  box-shadow: 10px 10px 0 #050711, 0 0 0 6px #2f3564;
  touch-action: none;

  &:focus {
    outline: none;
  }

  @media (max-width: 760px) {
    width: 100%;
    min-height: 0;
    max-height: none;
    border-width: 4px;
    box-shadow: 5px 5px 0 #050711, 0 0 0 4px #2f3564;
  }
`;

export const MobileControls = styled.div`
  display: none;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
  width: 100%;

  @media (pointer: coarse), (max-width: 760px) {
    display: grid;
  }

  @media (max-width: 760px) {
    gap: 10px;
    margin-top: 8px;
  }
`;

export const MobileControlButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  padding: 0;
  border: 5px solid #f8f4d8;
  border-radius: 0;
  appearance: none;
  color: #fff26a;
  background: #2f3564;
  box-shadow: 6px 6px 0 #050711;
  font-family: inherit;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
  touch-action: none;
  user-select: none;

  svg {
    display: block;
    width: 34px;
    height: 34px;
    stroke-width: 3;
  }

  @media (max-width: 760px) {
    min-height: 68px;
    border-width: 4px;
    box-shadow: 4px 4px 0 #050711;
    font-size: 1.55rem;

    svg {
      width: 34px;
      height: 34px;
    }
  }

  &:active {
    transform: translate(4px, 4px);
    box-shadow: 2px 2px 0 #050711;
    background: #4650a0;
  }
`;

export const Stage = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: ${GAME_WIDTH}px;
  height: ${GAME_HEIGHT}px;
  overflow: hidden;
  background-image: ${({ $backgroundImage }) => `url(${$backgroundImage})`};
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  transform-origin: center center;
`;

export const DropLayer = styled.div`
  position: absolute;
  inset: 0;
`;

export const DropItem = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  display: grid;
  place-items: center;
  padding: ${({ $hasImage }) => ($hasImage ? '0' : '5px')};
  border-radius: 0;
  border: ${({ $hasImage }) => ($hasImage ? '0' : '3px solid #f8f4d8')};
  color: ${({ $kind }) => ($kind === 'heart' ? '#ffffff' : '#172033')};
  background: ${({ $kind, $color, $hasImage }) =>
    $hasImage
      ? 'transparent'
      : $kind === 'money'
        ? `linear-gradient(135deg, ${$color}, #fff4b7)`
        : $kind === 'heart'
          ? `linear-gradient(135deg, #ffd1dc, ${$color} 64%, #d91e5b)`
        : `linear-gradient(135deg, #ffffff, ${$color})`};
  box-shadow: ${({ $hasImage }) => ($hasImage ? 'none' : '4px 4px 0 rgba(0, 0, 0, 0.42)')};
  user-select: none;

  span {
    font-size: 1.3rem;
    font-weight: 900;
    line-height: 1;
  }

  b {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.55rem;
    line-height: 1;
    letter-spacing: 0;
  }
`;

export const DropImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  filter:
    drop-shadow(2px 0 0 #ffffff)
    drop-shadow(-2px 0 0 #ffffff)
    drop-shadow(0 2px 0 #ffffff)
    drop-shadow(0 -2px 0 #ffffff)
    drop-shadow(4px 6px 0 rgba(0, 0, 0, 0.34));
`;

export const HeroPhoto = styled.img`
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  filter: drop-shadow(6px 8px 0 rgba(0, 0, 0, 0.32));
  transition: transform 120ms ease;
`;

export const HeroWrap = styled.div`
  --hero-glow-color: ${({ $glow }) =>
    $glow === 'gold'
      ? '255, 216, 64'
      : $glow === 'shield'
        ? '67, 255, 245'
        : $glow === 'magnet'
          ? '190, 82, 255'
          : '0, 0, 0'};

  position: absolute;
  left: 0;
  top: 0;
  width: ${HERO_WIDTH}px;
  height: ${HERO_HEIGHT}px;
  transform-origin: 50% 88%;
  transition: filter 120ms ease;
  animation:
    idle-bob 1500ms ease-in-out infinite,
    ${({ $glow }) => ($glow ? 'hero-glow 720ms steps(6, end)' : 'none')};

  > img {
    transform: rotate(${({ $direction }) => $direction * 5}deg) scaleX(${({ $direction }) => ($direction > 0 ? -1 : 1)});
  }

  @keyframes idle-bob {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -4px; }
  }

  @keyframes hero-glow {
    0% {
      filter:
        drop-shadow(0 0 0 rgba(var(--hero-glow-color), 0))
        drop-shadow(0 0 0 rgba(var(--hero-glow-color), 0));
    }
    22% {
      filter:
        drop-shadow(0 0 10px rgba(var(--hero-glow-color), 0.96))
        drop-shadow(0 0 22px rgba(var(--hero-glow-color), 0.78));
    }
    58% {
      filter:
        drop-shadow(0 0 14px rgba(var(--hero-glow-color), 0.82))
        drop-shadow(0 0 34px rgba(var(--hero-glow-color), 0.56));
    }
    100% {
      filter:
        drop-shadow(0 0 0 rgba(var(--hero-glow-color), 0))
        drop-shadow(0 0 0 rgba(var(--hero-glow-color), 0));
    }
  }

`;

export const PocketPulse = styled.div`
  position: absolute;
  z-index: 5;
  left: 44px;
  bottom: 42px;
  padding: 5px 8px;
  border-radius: 0;
  border: 3px solid #101629;
  color: #101629;
  background: #fff26a;
  font-size: 0.72rem;
  font-weight: 900;
  opacity: 0;
  pointer-events: none;
  animation: pocket-text 520ms ease;

  @keyframes pocket-text {
    0% { opacity: 0; transform: translateY(4px) scale(0.8); }
    28% { opacity: 1; transform: translateY(-8px) scale(1); }
    100% { opacity: 0; transform: translateY(-28px) scale(0.94); }
  }
`;

export const EdgeFlash = styled.div`
  --flash-color: ${({ $tone }) => ($tone === 'heal' ? '75, 255, 118' : '255, 50, 70')};

  position: absolute;
  inset: 0;
  z-index: 8;
  pointer-events: none;
  opacity: 0;
  background:
    linear-gradient(90deg, rgba(var(--flash-color), 0.95), rgba(var(--flash-color), 0) 72px),
    linear-gradient(270deg, rgba(var(--flash-color), 0.95), rgba(var(--flash-color), 0) 72px);
  animation: edge-flash 520ms steps(5, end);

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 72px;
  }

  &::before {
    top: 0;
    background: linear-gradient(180deg, rgba(var(--flash-color), 0.95), rgba(var(--flash-color), 0));
  }

  &::after {
    bottom: 0;
    background: linear-gradient(0deg, rgba(var(--flash-color), 0.95), rgba(var(--flash-color), 0));
  }

  @keyframes edge-flash {
    0% { opacity: 1; }
    18% { opacity: 0.86; }
    100% { opacity: 0; }
  }
`;

export const IntroPanel = styled.div`
  position: absolute;
  inset: 0;
  z-index: 10;
  display: grid;
  align-content: center;
  justify-items: start;
  gap: 16px;
  padding: clamp(24px, 7vw, 72px);
  color: #f8f4d8;
  background:
    linear-gradient(90deg, rgba(16, 22, 41, 0.96), rgba(16, 22, 41, 0.82) 58%, rgba(16, 22, 41, 0.22)),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0 3px, transparent 3px 6px);

  h1 {
    max-width: 560px;
    margin: 0;
    font-size: clamp(1.6rem, 5.2vw, 2.5rem);
    line-height: 1.15;
    letter-spacing: 0;
    text-shadow: 4px 4px 0 #000;
  }

  p {
    max-width: 560px;
    margin: 0;
    color: #d7f7ff;
    font-size: clamp(0.68rem, 1.45vw, 0.88rem);
    line-height: 1.9;
  }

  @media (max-width: 760px) {
    align-content: start;
    gap: 12px;
    padding: 16px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    background:
      linear-gradient(90deg, rgba(16, 22, 41, 0.98), rgba(16, 22, 41, 0.92)),
      repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0 3px, transparent 3px 6px);

    h1 {
      font-size: 1.7rem;
      line-height: 1.25;
      text-shadow: 3px 3px 0 #000;
    }

    p {
      font-size: 1.1rem;
      line-height: 1.65;
    }

    > button {
      margin-top: 16px;
    }
  }
`;

export const ResultPanel = styled(IntroPanel)`
  color: #f8f4d8;
  background: ${({ tone }) =>
    tone === 'win'
      ? 'linear-gradient(90deg, rgba(18, 71, 39, 0.96), rgba(44, 87, 36, 0.86), rgba(16, 22, 41, 0.22))'
      : tone === 'pause'
        ? 'linear-gradient(90deg, rgba(28, 44, 92, 0.96), rgba(47, 53, 100, 0.86), rgba(16, 22, 41, 0.22))'
        : 'linear-gradient(90deg, rgba(92, 28, 42, 0.96), rgba(68, 39, 91, 0.86), rgba(16, 22, 41, 0.22))'};

  h2 {
    max-width: 560px;
    margin: 0;
    font-size: clamp(1.5rem, 5vw, 3.3rem);
    line-height: 1.16;
    letter-spacing: 0;
  }

  @media (max-width: 760px) {
    gap: 14px;

    h2 {
      font-size: 1.9rem;
      line-height: 1.22;
    }

    p {
      font-size: 1.24rem;
      line-height: 1.5;
    }
  }

  @media (max-width: 760px) and (max-height: 700px) {
    gap: 10px;

    h2 {
      font-size: 1.55rem;
      line-height: 1.2;
    }

    p {
      font-size: 1rem;
      line-height: 1.45;
    }
  }
`;

export const AuthForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;

  input {
    min-height: 48px;
    width: min(100%, 280px);
    padding: 12px;
    border: 4px solid #f8f4d8;
    border-radius: 0;
    color: #fff26a;
    background: #101629;
    box-shadow: 5px 5px 0 #000;
    font: inherit;
    font-size: 0.72rem;
    outline: none;
  }

  input:focus {
    border-color: #fff26a;
  }

  @media (max-width: 760px) {
    display: grid;
    width: 100%;
    gap: 10px;

    input {
      min-height: 54px;
      width: 100%;
      padding: 13px 12px;
      border-width: 3px;
      box-shadow: 4px 4px 0 #000;
      font-size: 0.88rem;
      line-height: 1.35;
    }
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 760px) {
    display: grid;
    width: 100%;
    gap: 10px;
    margin-top: 12px;
  }
`;

export const LeaderboardPanel = styled.section`
  min-height: min(620px, calc(100vh - 110px));
  display: grid;
  align-content: start;
  gap: 18px;
  padding: clamp(18px, 4vw, 36px);
  border: 6px solid #f8f4d8;
  border-radius: 0;
  color: #f8f4d8;
  background:
    linear-gradient(90deg, rgba(16, 22, 41, 0.96), rgba(28, 33, 67, 0.92)),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0 3px, transparent 3px 6px);
  box-shadow: 10px 10px 0 #050711, 0 0 0 6px #2f3564;

  p {
    margin: 0;
    color: #d7f7ff;
    font-size: clamp(0.62rem, 1.5vw, 0.78rem);
    line-height: 1.9;
  }

  @media (max-width: 760px) {
    min-height: calc(100vh - 88px);
    padding: 14px;
    border-width: 4px;
    box-shadow: 5px 5px 0 #050711, 0 0 0 4px #2f3564;
  }
`;

export const LeaderboardList = styled.ol`
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: 44px 1fr auto;
    gap: 12px;
    align-items: center;
    min-height: 48px;
    padding: 10px 12px;
    border: 3px solid #f8f4d8;
    background: #171b32;
    box-shadow: 4px 4px 0 #050711;
  }

  li[data-current="true"] {
    border-color: #fff26a;
    background:
      linear-gradient(90deg, rgba(255, 242, 106, 0.2), rgba(23, 27, 50, 0.96)),
      #171b32;
    box-shadow: 4px 4px 0 #050711, inset 0 0 0 2px #fff26a;
  }

  li[data-current="true"] strong {
    color: #ffffff;
  }

  span,
  b {
    color: #fff26a;
  }

  span {
    text-align: center;
  }

  strong {
    min-width: 0;
    overflow: hidden;
    color: #d7f7ff;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 760px) {
    li {
      grid-template-columns: 32px 1fr auto;
      gap: 8px;
      padding: 9px 8px;
      font-size: 0.62rem;
    }
  }
`;

export const HelpPanel = styled(LeaderboardPanel)`
  gap: 16px;

  h1 {
    margin: 0;
    color: #fff26a;
    font-size: clamp(1.3rem, 3.8vw, 2.25rem);
    line-height: 1.2;
    text-shadow: 3px 3px 0 #000;
  }

  h2 {
    margin: 0;
    color: #78d6ff;
    font-size: clamp(0.76rem, 1.8vw, 1rem);
    line-height: 1.45;
  }
`;

export const HelpGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

export const HelpBlock = styled.section`
  display: grid;
  align-content: start;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  border: 3px solid #f8f4d8;
  background: #171b32;
  box-shadow: 4px 4px 0 #050711;
`;

export const HelpList = styled.ul`
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    color: #d7f7ff;
    font-size: clamp(0.58rem, 1.25vw, 0.72rem);
    line-height: 1.65;
  }

  strong {
    color: #fff26a;
  }
`;

export const DropGuideList = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: 42px 1fr;
    gap: 8px;
    align-items: center;
    min-width: 0;
    padding: 8px;
    border: 2px solid #414765;
    background: #101629;
  }

  img {
    width: 42px;
    height: 42px;
    object-fit: contain;
    filter:
      drop-shadow(1px 0 0 #ffffff)
      drop-shadow(-1px 0 0 #ffffff)
      drop-shadow(0 1px 0 #ffffff)
      drop-shadow(0 -1px 0 #ffffff);
  }

  strong {
    display: block;
    color: #fff26a;
    font-size: 0.58rem;
    line-height: 1.35;
  }

  span {
    display: block;
    margin-top: 4px;
    color: #d7f7ff;
    font-size: 0.52rem;
    line-height: 1.45;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 0;
  border: 3px solid #f8f4d8;
  background: #101629;
  color: #fff26a;
  font-weight: 800;
  box-shadow: 4px 4px 0 #000;
`;

export const ControlsLine = styled.div`
  color: #78d6ff;
  font-weight: 700;
  font-size: clamp(0.62rem, 1.35vw, 0.82rem);
  line-height: 1.7;
  max-width: 560px;

  @media (max-width: 760px) {
    display: ${({ $mobileVisible }) => ($mobileVisible ? 'block' : 'none')};
    width: 100%;
    font-size: 0.58rem;
    line-height: 1.55;
    overflow-wrap: anywhere;
  }
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  padding: 12px 18px;
  border: 4px solid #f8f4d8;
  border-radius: 0;
  color: #f8f4d8;
  background: #2f3564;
  cursor: pointer;
  font-weight: 900;
  font-size: 0.76rem;
  line-height: 1.4;
  box-shadow: 6px 6px 0 #000;

  &:hover {
    background: #4650a0;
  }

  &:active {
    transform: translate(4px, 4px);
    box-shadow: 2px 2px 0 #000;
  }

  &:disabled {
    opacity: 0.62;
    cursor: wait;
  }

  @media (max-width: 760px) {
    width: 100%;
    min-height: 64px;
    padding: 15px 14px;
    border-width: 3px;
    box-shadow: 4px 4px 0 #000;
    font-size: ${({ $big }) => ($big ? '1.5rem' : '0.74rem')};

    svg {
      width: ${({ $big }) => ($big ? '32px' : '20px')};
      height: ${({ $big }) => ($big ? '32px' : '20px')};
    }
  }
`;
