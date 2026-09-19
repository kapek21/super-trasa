import { useCallback, useEffect, useState } from 'react';
import {
  driverEmoji,
  driverSrc,
  loadDriver,
  saveDriver,
  type SavedDriver,
} from './drivers';
import {
  FAIL_FACE,
  GOKART_LEVEL,
  TRACK_LEVELS,
  hintCommand,
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
const MAX_STRIP = 8;

export function App(): JSX.Element {
  const [driver, setDriver] = useState<SavedDriver | null>(() => loadDriver());
  const [phase, setPhase] = useState<Phase>(loadDriver() ? 'hub' : 'driver');
  const [level, setLevel] = useState<LevelDef>(TRACK_LEVELS[0]!);
  const [strip, setStrip] = useState<CommandId[]>([]);
  const [cursor, setCursor] = useState(0);
  const [fail, setFail] = useState<FailKind | null>(null);
  const [hint, setHint] = useState<CommandId | null>(null);
  const [kart, setKart] = useState(false);

  const face = driver ? driverEmoji(driver) : '🚂';
  const faceSrc = driver ? driverSrc(driver) : null;
  const steps = stepTrack(strip, level);
  const now = steps[Math.max(0, cursor - 1)] ?? {
    laid: 0,
    bricks: 0,
    turns: 0,
    gateOpen: false,
    connected: false,
    fail: null,
  };
  const trainAt = now.connected ? level.cells.length - 1 : Math.max(-1, now.laid - 1);

  const startLevel = (next: LevelDef, asKart: boolean): void => {
    setLevel(next);
    setKart(asKart);
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
          <AssetImg src="/assets/vehicles/train_engine.png" fallback="🚂" className="hub-hero" />
          <p className="goal-tag">🎯</p>
          {TRACK_LEVELS.map((lvl) => (
            <button key={lvl.id} type="button" className="go-btn" onClick={() => startLevel(lvl, false)}>
              {lvl.titleEmoji}
            </button>
          ))}
          <button type="button" className="go-btn gokart" onClick={() => startLevel(GOKART_LEVEL, true)}>
            <AssetImg src="/assets/vehicles/gokart_red.png" fallback="🏎️" className="tiny-img" />
          </button>
        </div>
      )}

      {(phase === 'program' || phase === 'run' || phase === 'fail' || phase === 'win') && (
        <>
          <p className="goal-tag">🎯 {level.titleEmoji}</p>
          {kart ? (
            <div className={`kart-preview ${phase === 'fail' ? 'is-crash' : ''}`}>
              <AssetImg
                src="/assets/vehicles/gokart_red.png"
                fallback="🏎️"
                className={`kart-build ${now.laid > 0 ? 'is-on' : ''}`}
              />
              <AssetImg
                src="/assets/vehicles/gokart_blue.png"
                fallback="🏎️"
                className={`kart-build ${now.turns > 0 ? 'is-on' : ''}`}
              />
              {phase === 'fail' && fail ? <span className="fail-face">{FAIL_FACE[fail]}</span> : null}
            </div>
          ) : (
            <>
              <RideBoard
                cells={level.cells}
                laid={now.laid}
                trainAt={phase === 'program' ? -1 : trainAt}
                crashed={phase === 'fail'}
                paused={Boolean(now.gateOpen && phase === 'run')}
                driverEmoji={face}
                driverSrc={faceSrc}
              />
              {phase === 'fail' && fail ? <p className="fail-banner">{FAIL_FACE[fail]}</p> : null}
            </>
          )}

          {(phase === 'program' || phase === 'run') && (
            <CommandStrip
              bank={level.bank}
              strip={strip}
              hint={hint}
              cursor={cursor}
              running={phase === 'run'}
              playEnabled={phase === 'program' && strip.length > 0}
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
              {kart ? (
                <div className="kart" style={{ animationDuration: '3.2s' }}>
                  <AssetImg src="/assets/vehicles/gokart_red.png" fallback="🏎️" className="hub-hero" />
                </div>
              ) : (
                <p>🎉📺</p>
              )}
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
