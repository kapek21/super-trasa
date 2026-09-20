import type { BoardCell } from '../levels';
import { AssetImg } from './AssetImg';

interface Props {
  cells: BoardCell[];
  holes: number;
  bends: number;
  trainAt: number;
  crashed: boolean;
  paused: boolean;
  gateOpen: boolean;
  vehicle: 'train' | 'kart';
  goalFile: string;
  goalFallback: string;
  driverEmoji: string;
  driverSrc: string | null;
}

function artFor(
  cell: BoardCell,
  filled: boolean,
  vehicle: 'train' | 'kart',
  goalFile: string,
  goalFallback: string,
): { src: string; fallback: string } {
  const straight =
    vehicle === 'kart'
      ? { src: '/assets/tracks/road_straight.png', fallback: '🛣️' }
      : { src: '/assets/tracks/track_straight.png', fallback: '➖' };
  if (cell === 'laid') return straight;
  if (cell === 'hole' || cell === 'road') return filled ? straight : { src: '', fallback: '' };
  if (cell === 'bend') {
    return { src: '/assets/tracks/track_curve.png', fallback: '↩️' };
  }
  if (cell === 'goal') return { src: goalFile, fallback: goalFallback };
  if (cell === 'station') {
    if (goalFile.includes('spidey')) return { src: '/assets/stations/station_spidey_hq.png', fallback: '🕸️' };
    if (goalFile.includes('poke')) return { src: '/assets/stations/station_poke_woods.png', fallback: '🌲' };
    return { src: '/assets/stations/station_batcave.png', fallback: '🦇' };
  }
  if (cell === 'start') return { src: '/assets/tracks/track_buffer.png', fallback: '🏁' };
  if (cell === 'tv') return { src: '/assets/stations/station_tv.png', fallback: '📺' };
  if (cell === 'gate') return { src: '/assets/tracks/gate_rail.png', fallback: '🚧' };
  return straight;
}

export function RideBoard({
  cells,
  holes,
  bends,
  trainAt,
  crashed,
  paused,
  gateOpen,
  vehicle,
  goalFile,
  goalFallback,
  driverEmoji,
  driverSrc,
}: Props): JSX.Element {
  let holeN = 0;
  let bendN = 0;
  return (
    <div className={`ride-world is-${vehicle} ${crashed ? 'is-crash' : ''}`}>
      <div className="sky" aria-hidden>
        <i className="sun" />
        <i className="cloud c1" />
        <i className="cloud c2" />
        <i className="cloud c3" />
      </div>
      <div className="hills" aria-hidden />
      <div className="track-line">
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
          const art = artFor(cell, filled, vehicle, goalFile, goalFallback);
          const shown = !isBuild || filled;
          const isBuilding = cell === 'tv' || cell === 'station' || cell === 'goal';
          return (
            <div
              key={i}
              className={[
                'seg',
                `seg-${cell}`,
                shown ? 'is-on' : 'is-gap',
                isBuilding ? 'is-building' : '',
                cell === 'start' ? 'is-start' : '',
                cell === 'bend' && !filled ? 'is-bend-ghost' : '',
                cell === 'gate' && gateOpen ? 'is-open' : '',
                trainAt === i ? 'has-train' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="seg-bed" aria-hidden />
              {shown || cell === 'bend' ? (
                art.src ? (
                  <AssetImg src={art.src} fallback={art.fallback} className="seg-art" />
                ) : null
              ) : (
                <span className="pit" />
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
      <div className="grass" aria-hidden />
    </div>
  );
}
