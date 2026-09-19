import { useCallback, useEffect, useState } from 'react';
import {
  driverEmoji,
  driverSrc,
  loadDriver,
  saveDriver,
  type SavedDriver,
} from './drivers';
import {
  GOKART_PLAN,
  GOKART_STEPS,
  TRACK_LEVELS,
  type CommandId,
  type LevelDef,
} from './levels';
import { AssetImg } from './ui/AssetImg';
import { CommandStrip } from './ui/CommandStrip';
import { DriverGallery } from './ui/DriverGallery';
import { PlanBoard } from './ui/PlanBoard';
import { RideBoard } from './ui/RideBoard';

type Phase = 'driver' | 'hub' | 'build' | 'ride' | 'win' | 'gokart' | 'race';

export function App(): JSX.Element {
  const [driver, setDriver] = useState<SavedDriver | null>(() => loadDriver());
  const [phase, setPhase] = useState<Phase>(loadDriver() ? 'hub' : 'driver');
  const [level, setLevel] = useState<LevelDef>(TRACK_LEVELS[0]!);
  const [strip, setStrip] = useState<CommandId[]>([]);
  const [shake, setShake] = useState(false);
  const [trainAt, setTrainAt] = useState(-1);
  const [paused, setPaused] = useState(false);

  const step = strip.length;
  const expected = (phase === 'gokart' ? GOKART_STEPS : level.expected)[step];
  const plan = phase === 'gokart' ? GOKART_PLAN : level.plan;
  const bank = phase === 'gokart' ? GOKART_STEPS : level.bank;
  const doneSeq =
    phase === 'gokart'
      ? strip.length === GOKART_STEPS.length
      : strip.length === level.expected.length;

  const pickDriver = (next: SavedDriver): void => {
    saveDriver(next);
    setDriver(next);
    setPhase('hub');
  };

  const startLevel = (next: LevelDef): void => {
    setLevel(next);
    setStrip([]);
    setTrainAt(-1);
    setPhase('build');
  };

  const tryCmd = useCallback(
    (cmd: CommandId): void => {
      const want = (phase === 'gokart' ? GOKART_STEPS : level.expected)[strip.length];
      if (!want) return;
      if (cmd !== want) {
        setShake(true);
        window.setTimeout(() => setShake(false), 420);
        return;
      }
      setStrip((s) => [...s, cmd]);
    },
    [level.expected, phase, strip.length],
  );

  const undo = (): void => {
    setStrip((s) => s.slice(0, -1));
  };

  useEffect(() => {
    if (phase !== 'build' || !doneSeq) return;
    const t = window.setTimeout(() => {
      setTrainAt(0);
      setPhase('ride');
    }, 400);
    return () => window.clearTimeout(t);
  }, [doneSeq, phase]);

  useEffect(() => {
    if (phase !== 'gokart' || strip.length !== GOKART_STEPS.length) return;
    const t = window.setTimeout(() => setPhase('race'), 400);
    return () => window.clearTimeout(t);
  }, [phase, strip.length]);

  useEffect(() => {
    if (phase !== 'ride') return;
    let i = 0;
    let timer = 0;
    const tick = (): void => {
      const pauseHere = level.pauseAt.includes(i);
      setTrainAt(i);
      setPaused(pauseHere);
      const wait = pauseHere ? 900 : 520;
      if (i >= level.cells.length - 1) {
        timer = window.setTimeout(() => setPhase('win'), wait);
        return;
      }
      timer = window.setTimeout(() => {
        i += 1;
        tick();
      }, wait);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [level, phase]);

  const face = driver ? driverEmoji(driver) : '🚂';
  const faceSrc = driver ? driverSrc(driver) : null;
  const revealed = 1 + strip.filter((c) => c === 'place' || c === 'connect' || c === 'gate' || c === 'turn').length;

  return (
    <div className="app">
      <header className="top">
        <button type="button" className="tiny" onClick={() => setPhase('driver')} aria-label="kierowca">
          {faceSrc ? <AssetImg src={faceSrc} fallback={face} className="tiny-img" /> : face}
        </button>
        {phase !== 'driver' && phase !== 'hub' && (
          <button type="button" className="tiny" onClick={() => setPhase('hub')}>
            🏠
          </button>
        )}
      </header>

      {phase === 'driver' && <DriverGallery onPick={pickDriver} />}

      {phase === 'hub' && (
        <div className="hub">
          <AssetImg src="/assets/vehicles/train_engine.png" fallback="🚂" className="hub-hero" />
          {TRACK_LEVELS.map((lvl) => (
            <button key={lvl.id} type="button" className="go-btn" onClick={() => startLevel(lvl)}>
              {lvl.titleEmoji}
            </button>
          ))}
          <button
            type="button"
            className="go-btn gokart"
            onClick={() => {
              setStrip([]);
              setPhase('gokart');
            }}
          >
            <AssetImg src="/assets/vehicles/gokart_red.png" fallback="🏎️" className="tiny-img" />
          </button>
        </div>
      )}

      {(phase === 'build' || phase === 'ride' || phase === 'win') && (
        <>
          <PlanBoard plan={plan} step={Math.min(step, plan.length - 1)} />
          <RideBoard
            cells={level.cells}
            revealed={phase === 'build' ? Math.max(1, revealed) : level.cells.length}
            trainAt={phase === 'ride' || phase === 'win' ? Math.max(0, trainAt) : -1}
            paused={paused && phase === 'ride'}
            driverEmoji={face}
            driverSrc={faceSrc}
          />
          {phase === 'build' && expected && (
            <CommandStrip
              bank={bank}
              strip={strip}
              expected={expected}
              shake={shake}
              onTry={tryCmd}
              onUndo={undo}
            />
          )}
        </>
      )}

      {phase === 'gokart' && expected && (
        <>
          <PlanBoard plan={GOKART_PLAN} step={Math.min(step, GOKART_PLAN.length - 1)} />
          <div className="kart-preview">
            <AssetImg src="/assets/vehicles/gokart_red.png" fallback="🏎️" className={`kart-build ${strip.length > 0 ? 'is-on' : ''}`} />
            <AssetImg src="/assets/vehicles/gokart_blue.png" fallback="🏎️" className={`kart-build ${strip.length > 2 ? 'is-on' : ''}`} />
          </div>
          <CommandStrip
            bank={GOKART_STEPS}
            strip={strip}
            expected={expected}
            shake={shake}
            onTry={tryCmd}
            onUndo={undo}
          />
        </>
      )}

      {phase === 'race' && (
        <div className="race">
          <div className="kart" style={{ animationDuration: '3.2s' }}>
            🏎️{face}
          </div>
          <p>🏁</p>
          <button type="button" className="go-btn" onClick={() => setPhase('hub')}>
            🏠
          </button>
        </div>
      )}

      {phase === 'win' && (
        <div className="win">
          <p>🎉📺</p>
          <button type="button" className="go-btn" onClick={() => setPhase('hub')}>
            🏠
          </button>
        </div>
      )}
    </div>
  );
}
