import { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Player,
  GamePhase,
  MoveLogEntry,
  ToastMessage,
  GameSettings,
} from '../types/game';
import {
  LADDERS,
  SNAKES,
  getTileCoords,
  getPlayerTileOffset,
  getPathSteps,
  isOvershoot,
} from '../utils/boardLogic';
import { soundManager } from '../utils/audio';
import { ParticleBurst } from '../components/3d/ParticleEffects';

const INITIAL_PLAYERS: Player[] = [
  {
    id: 'player-0',
    name: 'Player 1',
    color: '#0284c7', // Sky blue
    accentColor: '#38bdf8',
    shape: 'cylinder',
    type: 'human',
    position: 1,
    previousPosition: 1,
    stats: { turnsTaken: 0, totalRolls: 0, laddersClimbed: 0, snakesHit: 0, sixesRolled: 0 },
  },
  {
    id: 'player-1',
    name: 'Computer',
    color: '#dc2626', // Red
    accentColor: '#f87171',
    shape: 'cone',
    type: 'bot',
    position: 1,
    previousPosition: 1,
    stats: { turnsTaken: 0, totalRolls: 0, laddersClimbed: 0, snakesHit: 0, sixesRolled: 0 },
  },
];

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.6,
  animationSpeed: 1,
  cameraAutoFollow: true,
  theme: 'wood-emerald',
};

function computeInitialPawnPositions(currentPlayers: Player[]): Record<string, [number, number, number]> {
  const posMap: Record<string, [number, number, number]> = {};
  currentPlayers.forEach((p, idx) => {
    const coord = getTileCoords(p.position);
    const [offX, offZ] = getPlayerTileOffset(idx, currentPlayers.length);
    posMap[p.id] = [coord.x + offX, coord.y, coord.z + offZ];
  });
  return posMap;
}

export function useGameLogic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [diceValue, setDiceValue] = useState(1);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);
  const [winner, setWinner] = useState<Player | null>(null);
  const [moveLogs, setMoveLogs] = useState<MoveLogEntry[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [bursts, setBursts] = useState<ParticleBurst[]>([]);
  const [resetCameraTrigger, setResetCameraTrigger] = useState(0);
  const [nextRollOverride, setNextRollOverride] = useState<number | null>(null);

  // Synchronized state references for zero-staleness access across async timers and loops
  const playersRef = useRef<Player[]>(INITIAL_PLAYERS);
  playersRef.current = players;

  const activePlayerIndexRef = useRef<number>(0);
  activePlayerIndexRef.current = activePlayerIndex;

  const consecutiveSixesRef = useRef<number>(0);
  consecutiveSixesRef.current = consecutiveSixes;

  const phaseRef = useRef<GamePhase>('idle');
  phaseRef.current = phase;

  const nextRollOverrideRef = useRef<number | null>(null);
  nextRollOverrideRef.current = nextRollOverride;

  const hopIntervalRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const sessionIdRef = useRef<number>(0);

  const activeTimersRef = useRef<number[]>([]);
  const clearAllTimers = () => {
    activeTimersRef.current.forEach((t) => clearTimeout(t));
    activeTimersRef.current = [];
    if (hopIntervalRef.current !== null) {
      clearInterval(hopIntervalRef.current);
      hopIntervalRef.current = null;
    }
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  // Pawn visual positions in 3D coordinates: [x, y, z]
  const [pawnPositions, setPawnPositions] = useState<Record<string, [number, number, number]>>(() =>
    computeInitialPawnPositions(INITIAL_PLAYERS)
  );
  const isPawnMoving = phase === 'hopping' || phase === 'climbing' || phase === 'sliding';

  // Helper to push toast notifications
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  // Sync pawn positions onto board only on game start, rematch, or return to menu
  const syncPawnPositions = useCallback((currentPlayers: Player[]) => {
    const posMap = computeInitialPawnPositions(currentPlayers);
    setPawnPositions(posMap);
  }, []);

  // Audio settings sync
  useEffect(() => {
    soundManager.setSoundEnabled(settings.soundEnabled);
    soundManager.setVolume(settings.soundVolume);
  }, [settings.soundEnabled, settings.soundVolume]);

  // In-scene particle burst
  const triggerBurst = (type: 'sparkles' | 'dust', pos: [number, number, number], color: string) => {
    const burst: ParticleBurst = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      position: pos,
      color,
      createdAt: Date.now(),
    };
    setBursts((prev) => [...prev, burst]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burst.id));
    }, 1200);
  };

  // Full-screen celebration confetti
  const triggerCelebration = () => {
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Start new game
  const startGame = (configuredPlayers: Player[]) => {
    clearAllTimers();
    sessionIdRef.current += 1;
    const resetPlayers = configuredPlayers.map((p) => ({
      ...p,
      position: 1,
      previousPosition: 1,
      stats: { turnsTaken: 0, totalRolls: 0, laddersClimbed: 0, snakesHit: 0, sixesRolled: 0 },
    }));

    playersRef.current = resetPlayers;
    activePlayerIndexRef.current = 0;
    consecutiveSixesRef.current = 0;
    phaseRef.current = 'idle';

    setPlayers(resetPlayers);
    setActivePlayerIndex(0);
    setPhase('idle');
    setDiceValue(1);
    setConsecutiveSixes(0);
    setWinner(null);
    setMoveLogs([]);
    setIsPlaying(true);
    syncPawnPositions(resetPlayers);

    addToast({
      type: 'info',
      title: 'Game Started!',
      description: `${resetPlayers[0].name}'s turn. Roll the dice to begin!`,
    });
  };

  // Reset to Start Screen
  const returnToMainMenu = () => {
    clearAllTimers();
    sessionIdRef.current += 1;
    setIsPlaying(false);
    setPhase('idle');
    phaseRef.current = 'idle';
    setWinner(null);
    setConsecutiveSixes(0);
    consecutiveSixesRef.current = 0;
    syncPawnPositions(playersRef.current);
  };

  // Rematch with current players
  const restartCurrentGame = () => {
    startGame(playersRef.current);
  };

  // Roll Dice handler with caller source validation
  const rollDice = useCallback((source: 'human' | 'bot' = 'human') => {
    const curIdx = activePlayerIndexRef.current;
    const curPlayer = playersRef.current[curIdx];

    if (phaseRef.current !== 'idle' || !curPlayer || winner) return;

    // Strict turn protection: human cannot roll during bot's turn, bot cannot roll during human's turn
    if (source === 'human' && curPlayer.type === 'bot') return;
    if (source === 'bot' && curPlayer.type === 'human') return;

    soundManager.playDiceRoll();
    setPhase('rolling');
    phaseRef.current = 'rolling';

    const forced = nextRollOverrideRef.current;
    const roll = forced !== null ? forced : Math.floor(Math.random() * 6) + 1;
    if (forced !== null) {
      nextRollOverrideRef.current = null;
      setNextRollOverride(null);
    }
    setDiceValue(roll);

    const session = sessionIdRef.current;
    const rollDuration = 900 / settings.animationSpeed;

    const timer = window.setTimeout(() => {
      if (sessionIdRef.current === session) {
        handleRollResolved(roll, curIdx, session);
      }
    }, rollDuration);
    activeTimersRef.current.push(timer);
  }, [winner, settings.animationSpeed]);

  // Handle outcome after dice lands
  const handleRollResolved = (roll: number, curIdx: number, session: number) => {
    if (sessionIdRef.current !== session) return;
    const curPlayer = playersRef.current[curIdx];
    if (!curPlayer) return;

    const currentPos = curPlayer.position;
    const currentSixes = consecutiveSixesRef.current;
    const newSixes = roll === 6 ? currentSixes + 1 : 0;

    // Immediately update total rolls and sixes in playersRef and React state
    playersRef.current = playersRef.current.map((p, idx) =>
      idx === curIdx
        ? {
            ...p,
            stats: {
              ...p.stats,
              totalRolls: p.stats.totalRolls + 1,
              sixesRolled: roll === 6 ? p.stats.sixesRolled + 1 : p.stats.sixesRolled,
            },
          }
        : p
    );
    setPlayers(playersRef.current);

    // 1. Triple Six Penalty: rolling three 6s forfeits the turn
    if (newSixes === 3) {
      soundManager.playWarning();
      setConsecutiveSixes(0);
      consecutiveSixesRef.current = 0;
      addToast({
        type: 'warning',
        title: '3rd Six in a Row!',
        description: `${curPlayer.name} rolled three 6s in a row! Turn forfeited.`,
      });

      setMoveLogs((prev) => [
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          turnNumber: curPlayer.stats.turnsTaken + 1,
          playerName: curPlayer.name,
          playerColor: curPlayer.color,
          roll,
          fromTile: currentPos,
          toTile: currentPos,
          eventType: 'triple_six_penalty',
          message: 'Rolled 6 three times in a row! Turn forfeited.',
        },
        ...prev,
      ]);

      advanceToNextPlayer(true);
      return;
    }

    // 2. Overshoot check: must land exactly on 100 (stay in place, no bounce back)
    if (isOvershoot(currentPos, roll)) {
      soundManager.playWarning();
      addToast({
        type: 'warning',
        title: 'Overshot Tile 100!',
        description: `Need exact roll of ${100 - currentPos}. ${curPlayer.name} stays at tile ${currentPos}.`,
      });

      setMoveLogs((prev) => [
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          turnNumber: curPlayer.stats.turnsTaken + 1,
          playerName: curPlayer.name,
          playerColor: curPlayer.color,
          roll,
          fromTile: currentPos,
          toTile: currentPos,
          eventType: 'overshoot',
          message: `Overshot tile 100 (needs ${100 - currentPos})! Stays at ${currentPos}.`,
        },
        ...prev,
      ]);

      if (roll === 6) {
        soundManager.playExtraTurn();
        setConsecutiveSixes(newSixes);
        consecutiveSixesRef.current = newSixes;
        addToast({
          type: 'info',
          title: 'Extra Turn!',
          description: `${curPlayer.name} rolled a 6 and gets another roll!`,
        });
        setPhase('idle');
        phaseRef.current = 'idle';
      } else {
        advanceToNextPlayer(true, curIdx);
      }
      return;
    }

    // 3. Valid move: perform step-by-step tile hopping animation
    const pathSteps = getPathSteps(currentPos, roll);
    animateTileHops(pathSteps, roll, newSixes, curIdx, session);
  };

  // Step-by-step hop animation
  const animateTileHops = (
    steps: number[],
    roll: number,
    nextSixes: number,
    curIdx: number,
    session: number
  ) => {
    if (sessionIdRef.current !== session) return;

    const curPlayer = playersRef.current[curIdx];
    if (!curPlayer) return;

    setPhase('hopping');
    phaseRef.current = 'hopping';

    let currentStepIdx = 0;
    const stepIntervalMs = 240 / settings.animationSpeed;
    const playerId = curPlayer.id;
    const totalPlayers = playersRef.current.length;

    if (hopIntervalRef.current !== null) {
      clearInterval(hopIntervalRef.current);
      hopIntervalRef.current = null;
    }

    const hopInterval = window.setInterval(() => {
      if (sessionIdRef.current !== session) {
        clearInterval(hopInterval);
        hopIntervalRef.current = null;
        return;
      }

      if (currentStepIdx < steps.length) {
        const stepTile = steps[currentStepIdx];
        soundManager.playHop(currentStepIdx);

        // Update visual pawn position
        const coord = getTileCoords(stepTile);
        const [offX, offZ] = getPlayerTileOffset(curIdx, totalPlayers);
        setPawnPositions((prev) => ({
          ...prev,
          [playerId]: [coord.x + offX, coord.y + 0.15, coord.z + offZ],
        }));

        currentStepIdx++;
      } else {
        clearInterval(hopInterval);
        hopIntervalRef.current = null;
        const finalTile = steps[steps.length - 1];

        // Settle pawn on the tile visually
        const coord = getTileCoords(finalTile);
        const [offX, offZ] = getPlayerTileOffset(curIdx, totalPlayers);
        setPawnPositions((prev) => ({
          ...prev,
          [playerId]: [coord.x + offX, coord.y, coord.z + offZ],
        }));

        // Immediately update playersRef.current synchronously!
        playersRef.current = playersRef.current.map((p, idx) =>
          idx === curIdx
            ? {
                ...p,
                previousPosition: p.position,
                position: finalTile,
              }
            : p
        );
        setPlayers(playersRef.current);

        // Check victory or tile effect
        handleTileLanded(finalTile, roll, nextSixes, curIdx, session);
      }
    }, stepIntervalMs);

    hopIntervalRef.current = hopInterval;
  };

  // Check tile events (win, ladder, snake, or normal)
  const handleTileLanded = (
    tile: number,
    roll: number,
    nextSixes: number,
    curIdx: number,
    session: number
  ) => {
    if (sessionIdRef.current !== session) return;
    const curPlayer = playersRef.current[curIdx];
    if (!curPlayer) return;

    const playerId = curPlayer.id;
    const totalPlayers = playersRef.current.length;

    // 1. Victory check
    if (tile === 100) {
      // Increment the winner's stats.turnsTaken before calling setWinner
      playersRef.current = playersRef.current.map((p, idx) =>
        idx === curIdx
          ? { ...p, stats: { ...p.stats, turnsTaken: p.stats.turnsTaken + 1 } }
          : p
      );
      setPlayers(playersRef.current);

      const winningPlayer = playersRef.current[curIdx];

      setPhase('game_over');
      phaseRef.current = 'game_over';
      setWinner(winningPlayer);
      soundManager.playWin();
      triggerCelebration();

      addToast({
        type: 'success',
        title: 'Victory!',
        description: `🎉 ${winningPlayer.name} reached Tile 100 and won the game!`,
      });

      setMoveLogs((prev) => [
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          turnNumber: winningPlayer.stats.turnsTaken,
          playerName: winningPlayer.name,
          playerColor: winningPlayer.color,
          roll,
          fromTile: winningPlayer.previousPosition,
          toTile: 100,
          eventType: 'win',
          message: `Reached Tile 100 and WON!`,
        },
        ...prev,
      ]);
      return;
    }

    // 2. Ladder check
    if (LADDERS[tile]) {
      const destTile = LADDERS[tile];
      setPhase('climbing');
      phaseRef.current = 'climbing';
      soundManager.playLadderClimb();

      addToast({
        type: 'ladder',
        title: 'Ladder Climbed!',
        description: `🚀 ${curPlayer.name} climbed ladder from ${tile} to ${destTile}!`,
      });

      // Spawn sparkle burst at ladder start
      const startCoord = getTileCoords(tile);
      triggerBurst('sparkles', [startCoord.x, 0.4, startCoord.z], '#fde047');

      // Animate climb
      const climbDuration = 800 / settings.animationSpeed;
      const startTime = Date.now();
      const endCoord = getTileCoords(destTile);
      const [offX, offZ] = getPlayerTileOffset(curIdx, totalPlayers);

      const climbAnim = () => {
        if (sessionIdRef.current !== session) {
          animFrameRef.current = null;
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / climbDuration);
        const ease = progress * (2 - progress); // ease out quad

        const curX = startCoord.x + (endCoord.x - startCoord.x) * ease + offX;
        const curY = 0.2 + (endCoord.y - 0.2) * ease + Math.sin(progress * Math.PI) * 0.4;
        const curZ = startCoord.z + (endCoord.z - startCoord.z) * ease + offZ;

        setPawnPositions((prev) => ({
          ...prev,
          [playerId]: [curX, curY, curZ],
        }));

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(climbAnim);
        } else {
          animFrameRef.current = null;
          // Finalize ladder climb visually
          setPawnPositions((prev) => ({
            ...prev,
            [playerId]: [endCoord.x + offX, endCoord.y, endCoord.z + offZ],
          }));

          // Immediately update playersRef synchronously
          playersRef.current = playersRef.current.map((p, idx) =>
            idx === curIdx
              ? {
                  ...p,
                  position: destTile,
                  stats: { ...p.stats, laddersClimbed: p.stats.laddersClimbed + 1 },
                }
              : p
          );
          setPlayers(playersRef.current);

          setMoveLogs((prev) => [
            {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              turnNumber: curPlayer.stats.turnsTaken + 1,
              playerName: curPlayer.name,
              playerColor: curPlayer.color,
              roll,
              fromTile: tile,
              toTile: destTile,
              eventType: 'ladder',
              message: `Climbed ladder: ${tile} → ${destTile}`,
            },
            ...prev,
          ]);

          resolvePostMove(roll, nextSixes, curIdx, session);
        }
      };
      animFrameRef.current = requestAnimationFrame(climbAnim);
      return;
    }

    // 3. Snake check
    if (SNAKES[tile]) {
      const tailTile = SNAKES[tile];
      setPhase('sliding');
      phaseRef.current = 'sliding';
      soundManager.playSnakeSlide();

      addToast({
        type: 'snake',
        title: 'Snake Bite!',
        description: `🐍 ${curPlayer.name} bitten by snake on ${tile}! Slid down to ${tailTile}.`,
      });

      // Spawn dust burst at snake mouth
      const headCoord = getTileCoords(tile);
      triggerBurst('dust', [headCoord.x, 0.4, headCoord.z], '#ef4444');

      // Animate slide
      const slideDuration = 850 / settings.animationSpeed;
      const startTime = Date.now();
      const tailCoord = getTileCoords(tailTile);
      const [offX, offZ] = getPlayerTileOffset(curIdx, totalPlayers);

      const slideAnim = () => {
        if (sessionIdRef.current !== session) {
          animFrameRef.current = null;
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / slideDuration);
        const ease = Math.pow(progress, 2); // ease in acceleration

        const curX = headCoord.x + (tailCoord.x - headCoord.x) * ease + offX;
        const curY = 0.2 + (tailCoord.y - 0.2) * ease + Math.sin(progress * Math.PI) * 0.3;
        const curZ = headCoord.z + (tailCoord.z - headCoord.z) * ease + offZ;

        setPawnPositions((prev) => ({
          ...prev,
          [playerId]: [curX, curY, curZ],
        }));

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(slideAnim);
        } else {
          animFrameRef.current = null;
          // Finalize snake slide visually
          setPawnPositions((prev) => ({
            ...prev,
            [playerId]: [tailCoord.x + offX, tailCoord.y, tailCoord.z + offZ],
          }));

          // Immediately update playersRef synchronously
          playersRef.current = playersRef.current.map((p, idx) =>
            idx === curIdx
              ? {
                  ...p,
                  position: tailTile,
                  stats: { ...p.stats, snakesHit: p.stats.snakesHit + 1 },
                }
              : p
          );
          setPlayers(playersRef.current);

          setMoveLogs((prev) => [
            {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              turnNumber: curPlayer.stats.turnsTaken + 1,
              playerName: curPlayer.name,
              playerColor: curPlayer.color,
              roll,
              fromTile: tile,
              toTile: tailTile,
              eventType: 'snake',
              message: `Bitten by snake: ${tile} → ${tailTile}`,
            },
            ...prev,
          ]);

          resolvePostMove(roll, nextSixes, curIdx, session);
        }
      };
      animFrameRef.current = requestAnimationFrame(slideAnim);
      return;
    }

    // 4. Normal tile landed
    setMoveLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        turnNumber: curPlayer.stats.turnsTaken + 1,
        playerName: curPlayer.name,
        playerColor: curPlayer.color,
        roll,
        fromTile: curPlayer.previousPosition,
        toTile: tile,
        message: `Moved ${roll} spaces to tile ${tile}`,
      },
      ...prev,
    ]);

    resolvePostMove(roll, nextSixes, curIdx, session);
  };

  // Determine extra turn or pass to next player
  const resolvePostMove = (roll: number, nextSixes: number, curIdx: number, session: number) => {
    if (sessionIdRef.current !== session) return;

    if (roll === 6 && nextSixes < 3) {
      soundManager.playExtraTurn();
      setConsecutiveSixes(nextSixes);
      consecutiveSixesRef.current = nextSixes;
      addToast({
        type: 'info',
        title: 'Rolled a 6!',
        description: `🎲 Extra turn awarded! (${nextSixes}/2 sixes rolled)`,
      });
      setPhase('idle');
      phaseRef.current = 'idle';
    } else {
      advanceToNextPlayer(true, curIdx);
    }
  };

  // Advance to next player
  const advanceToNextPlayer = (incrementTurnStat: boolean, currentIdx?: number) => {
    setConsecutiveSixes(0);
    consecutiveSixesRef.current = 0;
    const curIdx = currentIdx !== undefined ? currentIdx : activePlayerIndexRef.current;

    if (incrementTurnStat) {
      playersRef.current = playersRef.current.map((p, idx) =>
        idx === curIdx
          ? { ...p, stats: { ...p.stats, turnsTaken: p.stats.turnsTaken + 1 } }
          : p
      );
      setPlayers(playersRef.current);
    }

    const nextIdx = (curIdx + 1) % playersRef.current.length;
    activePlayerIndexRef.current = nextIdx;
    setActivePlayerIndex(nextIdx);
    setPhase('idle');
    phaseRef.current = 'idle';
  };

  // Automated bot move handling
  useEffect(() => {
    if (!isPlaying || phase !== 'idle' || winner) return;

    const currentP = playersRef.current[activePlayerIndex];
    if (currentP && currentP.type === 'bot') {
      const timer = window.setTimeout(() => {
        rollDice('bot');
      }, 950 / settings.animationSpeed);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, phase, activePlayerIndex, winner, settings.animationSpeed, rollDice]);

  // Spacebar shortcut to roll dice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isPlaying && phaseRef.current === 'idle' && !winner) {
        const curIdx = activePlayerIndexRef.current;
        const curP = playersRef.current[curIdx];
        if (curP && curP.type === 'human') {
          e.preventDefault();
          rollDice('human');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, winner, rollDice]);

  // Reset Camera View action
  const resetCamera = () => {
    setResetCameraTrigger((prev) => prev + 1);
  };

  // Dev debug: set active player's tile position instantly
  const setActivePlayerTile = useCallback((tile: number) => {
    const clamped = Math.max(1, Math.min(100, Math.floor(tile)));
    const curIdx = activePlayerIndexRef.current;
    const curPlayer = playersRef.current[curIdx];
    if (!curPlayer) return;

    const coord = getTileCoords(clamped);
    const [offX, offZ] = getPlayerTileOffset(curIdx, playersRef.current.length);

    setPawnPositions((prev) => ({
      ...prev,
      [curPlayer.id]: [coord.x + offX, coord.y, coord.z + offZ],
    }));

    playersRef.current = playersRef.current.map((p, idx) =>
      idx === curIdx
        ? { ...p, previousPosition: p.position, position: clamped }
        : p
    );
    setPlayers(playersRef.current);
  }, []);

  const activePlayer = players[activePlayerIndex];

  return {
    isPlaying,
    players,
    setPlayers,
    activePlayerIndex,
    activePlayer,
    phase,
    diceValue,
    consecutiveSixes,
    winner,
    moveLogs,
    toasts,
    settings,
    setSettings,
    bursts,
    resetCameraTrigger,
    pawnPositions,
    isPawnMoving,
    nextRollOverride,
    setNextRollOverride,
    setActivePlayerTile,
    startGame,
    returnToMainMenu,
    restartCurrentGame,
    rollDice,
    resetCamera,
  };
}
