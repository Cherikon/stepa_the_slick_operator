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
  place-items: center;
  padding: 24px;
`;

export const Shell = styled.section`
  width: min(100%, 980px);
`;

export const TopBar = styled.div`
  display: grid;
  grid-template-columns: minmax(82px, auto) 1fr minmax(112px, auto) minmax(92px, auto);
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

export const ProgressTrack = styled.div`
  height: 16px;
  overflow: hidden;
  border-radius: 0;
  border: 3px solid #f8f4d8;
  background: #060914;

  @media (max-width: 680px) {
    grid-column: 1 / -1;
    order: 4;
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
`;

export const Stage = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: ${GAME_WIDTH}px;
  height: ${GAME_HEIGHT}px;
  overflow: hidden;
  background:
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 4px, transparent 4px 8px),
    linear-gradient(180deg, #63b7ff 0%, #aee7ff 52%, #7cad5a 53%, #425f35 100%);
  transform-origin: left top;
  animation: ${({ $shaking }) => ($shaking ? 'hit-shake 210ms ease' : 'none')};

  @keyframes hit-shake {
    0%, 100% { transform: translateX(0); }
    30% { transform: translateX(-5px); }
    65% { transform: translateX(5px); }
  }
`;

export const Skyline = styled.div`
  position: absolute;
  inset: auto 0 0;
  height: 34%;
  background:
    repeating-linear-gradient(90deg, rgba(10, 24, 24, 0.24) 0 20px, transparent 20px 40px),
    linear-gradient(180deg, transparent, rgba(11, 28, 16, 0.62));
  clip-path: polygon(0 58%, 8% 58%, 8% 50%, 16% 50%, 16% 62%, 28% 62%, 28% 46%, 36% 46%, 36% 60%, 48% 60%, 48% 52%, 58% 52%, 58% 64%, 70% 64%, 70% 48%, 82% 48%, 82% 58%, 92% 58%, 92% 44%, 100% 44%, 100% 100%, 0 100%);
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
  filter: drop-shadow(4px 6px 0 rgba(0, 0, 0, 0.34));
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
  position: absolute;
  left: 0;
  top: 0;
  width: ${HERO_WIDTH}px;
  height: ${HERO_HEIGHT}px;
  transform-origin: 50% 88%;
  transition: filter 120ms ease;
  animation: ${({ $catchPulse }) => ($catchPulse ? 'pocket-hop 260ms ease' : 'idle-bob 1500ms ease-in-out infinite')};

  > img {
    transform: rotate(${({ $direction }) => $direction * 5}deg) scaleX(${({ $direction }) => ($direction > 0 ? -1 : 1)});
  }

  @keyframes idle-bob {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -4px; }
  }

  @keyframes pocket-hop {
    0% { scale: 1; }
    38% { scale: 1.06 0.96; }
    100% { scale: 1; }
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
    font-size: clamp(1.6rem, 5.2vw, 3.8rem);
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
`;

export const ResultPanel = styled(IntroPanel)`
  color: #f8f4d8;
  background: ${({ tone }) =>
    tone === 'win'
      ? 'linear-gradient(90deg, rgba(18, 71, 39, 0.96), rgba(44, 87, 36, 0.86), rgba(16, 22, 41, 0.22))'
      : 'linear-gradient(90deg, rgba(92, 28, 42, 0.96), rgba(68, 39, 91, 0.86), rgba(16, 22, 41, 0.22))'};

  h2 {
    max-width: 560px;
    margin: 0;
    font-size: clamp(1.5rem, 5vw, 3.3rem);
    line-height: 1.16;
    letter-spacing: 0;
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
`;
