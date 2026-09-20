import type { BoardCell } from '../levels';
import { AssetImg } from './AssetImg';

interface Props {
  cells: BoardCell[];
  holes: number;
  bends: number;
  trainAt: number;
  crashed: boolean;
  paused: boolean;
  vehicle: 'train' | 'kart';
  goalFile: string;
  goalFallback: string;
  driverEmoji: string;
  driverSrc: string | null;
}

function artFor(
  cell: BoardCell,
  filled: boolean,
  goalFile: string,
  goalFallback: string,
): { src: string; fallback: string } {
  if (cell === 'hole') {
    return filled
      ? { src: '/assets/tracks/track_straight.png', fallback: '➖' }
      : { src: '/assets/tracks/track_buffer.png', fallback: '🕳️' };
  }
  if (cell === 'road') {
    return filled
      ? { src: '/assets/tracks/road_straight.png', fallback: '🛣️' }
      : { src: '/assets/tracks/track_buffer.png', fallback: '🕳️' };
  }
  if (cell === 'bend') {
    return { src: '/assets/tracks/track_curve.png', fallback: '↩️' };
  }
  if (cell === 'goal') return { src: goalFile, fallback: goalFallback };
  if (cell === 'station') {
    if (goalFile.includes('spidey')) return { src: '/assets/stations/station_spidey_hq.png', fallback: '🕸️' };
    if (goalFile.includes('poke')) return { src: '/assets/stations/station_poke_woods.png', fallback: '🌲' };
    return { src: '/assets/stations/station_batcave.png', fallback: '🦇' };
  }
  const map: Record<BoardCell, { src: string; fallback: string }> = {
    start: { src: '/assets/tracks/track_buffer.png', fallback: '🏁' },
    hole: { src: '/assets/tracks/track_buffer.png', fallback: '🕳️' },
    bend: { src: '/assets/tracks/track_curve.png', fallback: '↩️' },
    station: { src: '/assets/stations/station_batcave.png', fallback: '🦇' },
    tv: { src: '/assets/stations/station_tv.png', fallback: '📺' },
    gate: { src: '/assets/tracks/gate_rail.png', fallback: '🚧' },
    road: { src: '/assets/tracks/road_straight.png', fallback: '🛣️' },
    goal: { src: goalFile, fallback: goalFallback },
  };
  return map[cell];
}

export function RideBoard({
  cells,
  holes,
  bends,
  trainAt,
  crashed,
  paused,
  vehicle,
  goalFile,
  goalFallback,
  driverEmoji,
  driverSrc,
}: Props): JSX.Element {
  let holeN = 0;
  let bendN = 0;
  return (
    <div className={`ride-host ride-html ${crashed ? 'is-crash' : ''}`}>
      {cells.map((cell, i) => {
        let filled = true;
        if (cell === 'hole' || cell === 'road') {
          filled = holeN < holes;
          holeN += 1;
        } else if (cell === 'bend') {
          filled = bendN < bends;
          bendN += 1;
        }
        const isBuild = cell === 'hole' || cell === 'bend' || cell === 'road';
        const art = artFor(cell, filled, goalFile, goalFallback);
        const shown = !isBuild || filled;
        const isGoal = cell === 'tv' || cell === 'station' || cell === 'goal' || cell === 'gate';
        return (
          <div
            key={i}
            className={`cell ${shown ? 'is-on' : 'is-hole'} ${isGoal ? 'is-goal' : ''} ${cell === 'start' ? 'is-start' : ''} ${cell === 'bend' && !filled ? 'is-bend-ghost' : ''}`}
          >
            {shown || cell === 'bend' ? (
              <AssetImg src={art.src} fallback={art.fallback} className="cell-img" />
            ) : (
              <span className="hole-mark">🕳️</span>
            )}
            {trainAt === i && (
              <div className={`loco ${paused ? 'is-paused' : ''} ${crashed ? 'is-crash' : ''}`}>
                <AssetImg
                  src={vehicle === 'kart' ? '/assets/vehicles/gokart_red.png' : '/assets/vehicles/train_engine.png'}
                  fallback={vehicle === 'kart' ? '🏎️' : '🚂'}
                  className="loco-img"
                />
                {driverSrc ? (
                  <AssetImg src={driverSrc} fallback={driverEmoji} className="loco-face" />
                ) : (
                  <span className="loco-face">{driverEmoji}</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
