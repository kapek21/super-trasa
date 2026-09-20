import { useCallback, useEffect, useState } from 'react';
import {
  driverEmoji,
  driverSrc,
  loadDriver,
  saveDriver,
  type SavedDriver,
} from './drivers';
import {
  ALL_LEVELS,
  FAIL_FACE,
  hintCommand,
  laidCount,
  stepTrack,
  type CommandId,
  type FailKind,
  type LevelDef,
} from './levels';
import { AssetImg } from './ui/AssetImg';
import { CommandStrip } from './ui/CommandStrip';
import { DriverGallery } from './ui/DriverGallery';
import { RideBoard } from './ui/RideBoard';

type Phase = 'driver' | 'hub' | 'program' | 'run' | 'fail' | 'win';

const STEP_MS = 700;
const MAX_STRIP = 12;

export function App(): JSX.Element {
  const [driver, setDriver] = useState<SavedDriver | null>(() => loadDriver());
  const [phase, setPhase] = useState<Phase>(loadDriver() ? 'hub' : 'driver');
  const [level, setLevel] = useState<LevelDef>(ALL_LEVELS[0]!);
  const [strip, setStrip] = useState<CommandId[]>([]);
  const [cursor, setCursor] = useState(0);
  const [fail, setFail] = useState<FailKind | null>(null);
  const [hint, setHint] = useState<CommandId | null>(null);

  const face = driver ? driverEmoji(driver) : '🚂';
  const faceSrc = driver ? driverSrc(driver) : null;
  const steps = stepTrack(strip, level);
  const now = steps[Math.max(0, cursor - 1)] ?? {
    holes: 0,
    bends: 0,
    bricks: 0,
    gateOpen: false,
    connected: false,
    fail: null,
  };
  const laid = laidCount(now);
  const buildables = level.cells
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c === 'hole' || c === 'bend' || c === 'road');
  const lastBuilt = laid > 0 ? buildables[Math.min(laid, buildables.length) - 1]?.i ?? 0 : 0;
  const destIndex = level.cells.findIndex((c) => c === 'tv' || c === 'station' || c === 'goal');
  const programmed = strip.length ? steps[steps.length - 1]! : now;
  const hand = phase === 'program' ? programmed.bricks : now.bricks;
  const trainAt =
    phase === 'program'
      ? 0
      : now.connected && destIndex >= 0
        ? destIndex
        : lastBuilt;

  const startLevel = (next: LevelDef): void => {
    setLevel(next);
    setStrip([]);
    setCursor(0);
    setFail(null);
    setHint(null);
    setPhase('program');
  };

  const addCmd = (cmd: CommandId): void => {
    if (phase !== 'program') return;
    if (strip.length >= MAX_STRIP) return;
    setHint(null);
    setStrip((s) => [...s, cmd]);
  };

  const play = useCallback((): void => {
    if (strip.length === 0) return;
    setHint(null);
    setFail(null);
    setCursor(0);
    setPhase('run');
  }, [strip.length]);

  useEffect(() => {
    if (phase !== 'run') return;
    const timeline = stepTrack(strip, level);
    const outcome = timeline[timeline.length - 1];
    const failIndex = timeline.findIndex((s) => s.fail);
    const limit = outcome?.fail ? (failIndex === -1 ? strip.length : failIndex + 1) : strip.length;
    const timer = window.setTimeout(() => {
      const next = cursor + 1;
      if (next < limit) {
        setCursor(next);
        return;
      }
      setCursor(limit);
      if (outcome && !outcome.fail && outcome.connected) setPhase('win');
      else {
        setFail(outcome?.fail ?? 'no-connect');
        setPhase('fail');
      }
    }, cursor === 0 ? 280 : STEP_MS);
    return () => window.clearTimeout(timer);
  }, [cursor, level, phase, strip]);

  return (
    <div className="app">
      <header className="top">
        <button type="button" className="tiny" onClick={() => setPhase('driver')} aria-label="kierowca">
          {faceSrc ? <AssetImg src={faceSrc} fallback={face} className="tiny-img" /> : face}
        </button>
        {phase !== 'driver' && phase !== 'hub' && (
          <button type="button" className="tiny" onClick={() => setPhase('hub')} aria-label="baza">
            🏠
          </button>
        )}
      </header>

      {phase === 'driver' && (
        <DriverGallery
          onPick={(next) => {
            saveDriver(next);
            setDriver(next);
            setPhase('hub');
          }}
        />
      )}

      {phase === 'hub' && (
        <div className="hub">
          <p className="goal-tag">Wybierz trasę</p>
          <div className="mission-grid">
            {ALL_LEVELS.map((lvl) => (
              <button key={lvl.id} type="button" className="mission-card" onClick={() => startLevel(lvl)}>
                <AssetImg src={lvl.goalFile} fallback={lvl.goalFallback} className="mission-img" />
                <span className="mission-title">{lvl.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(phase === 'program' || phase === 'run' || phase === 'fail' || phase === 'win') && (
        <>
          <div className="mission">
            <span className="mission-go">jedź do</span>
            <AssetImg src={level.goalFile} fallback={level.goalFallback} className="mission-goal" />
            {hand > 0 ? <span className="hand">📦×{hand}</span> : null}
          </div>
          <RideBoard
            cells={level.cells}
            holes={phase === 'program' ? 0 : now.holes}
            bends={phase === 'program' ? 0 : now.bends}
            trainAt={trainAt}
            crashed={phase === 'fail'}
            paused={Boolean(now.gateOpen && phase === 'run')}
            vehicle={level.vehicle}
            goalFile={level.goalFile}
            goalFallback={level.goalFallback}
            driverEmoji={face}
            driverSrc={faceSrc}
          />
          {phase === 'fail' && fail ? <p className="fail-banner">{FAIL_FACE[fail]}</p> : null}

          {(phase === 'program' || phase === 'run') && (
            <CommandStrip
              bank={level.bank}
              strip={strip}
              hint={hint}
              cursor={cursor}
              running={phase === 'run'}
              playEnabled={phase === 'program' && strip.length > 0}
              connectFile={level.goalFile}
              onAdd={addCmd}
              onUndo={() => {
                if (phase !== 'program') return;
                setHint(null);
                setStrip((s) => s.slice(0, -1));
              }}
              onPlay={play}
            />
          )}

          {phase === 'fail' && (
            <div className="bank">
              <button
                type="button"
                className="cmd"
                onClick={() => {
                  setPhase('program');
                  setCursor(0);
                  setFail(null);
                }}
                aria-label="popraw program"
              >
                🔧
              </button>
              <button
                type="button"
                className="cmd play"
                onClick={() => {
                  const timeline = stepTrack(strip, level);
                  const outcome = timeline[timeline.length - 1];
                  const idx = timeline.findIndex((s) => s.fail);
                  const prefix =
                    outcome?.fail === 'no-connect' ? strip : strip.slice(0, Math.max(0, idx));
                  setHint(hintCommand(prefix, level));
                  setPhase('program');
                  setCursor(0);
                  setFail(null);
                }}
                aria-label="podpowiedź"
              >
                🚜
              </button>
            </div>
          )}

          {phase === 'win' && (
            <div className="win">
              <p>🎉</p>
              <button type="button" className="go-btn" onClick={() => setPhase('hub')}>
                🏠
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
