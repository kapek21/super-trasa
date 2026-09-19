import type { BoardCell } from '../levels';
import { AssetImg } from './AssetImg';

interface Props {
  cells: BoardCell[];
  laid: number;
  trainAt: number;
  crashed: boolean;
  paused: boolean;
  driverEmoji: string;
  driverSrc: string | null;
}

function artFor(cell: BoardCell, filled: boolean): { src: string; fallback: string } {
  if (cell === 'empty') {
    return filled
      ? { src: '/assets/tracks/track_straight.png', fallback: '➖' }
      : { src: '/assets/tracks/track_buffer.png', fallback: '⬜' };
  }
  const map: Record<BoardCell, { src: string; fallback: string }> = {
    empty: { src: '/assets/tracks/track_buffer.png', fallback: '⬜' },
    track: { src: '/assets/tracks/track_straight.png', fallback: '➖' },
    curve: { src: '/assets/tracks/track_curve.png', fallback: '↩️' },
    station: { src: '/assets/stations/station_batcave.png', fallback: '🦇' },
    tv: { src: '/assets/stations/station_tv.png', fallback: '📺' },
    gate: { src: '/assets/tracks/gate_rail.png', fallback: '🚧' },
    road: { src: '/assets/tracks/road_straight.png', fallback: '🛣️' },
  };
  return map[cell];
}

export function RideBoard({
  cells,
  laid,
  trainAt,
  crashed,
  paused,
  driverEmoji,
  driverSrc,
}: Props): JSX.Element {
  let holes = 0;
  return (
    <div className={`ride-host ride-html ${crashed ? 'is-crash' : ''}`}>
      {cells.map((cell, i) => {
        const isHole = cell === 'empty';
        const filled = isHole ? holes < laid : true;
        if (isHole) holes += 1;
        const art = artFor(cell, filled);
        const shown = !isHole || filled;
        return (
          <div key={i} className={`cell ${shown ? 'is-on' : 'is-hole'} ${cell === 'tv' || cell === 'station' || cell === 'gate' ? 'is-goal' : ''}`}>
            {shown && <AssetImg src={art.src} fallback={art.fallback} className="cell-img" />}
            {trainAt === i && (
              <div className={`loco ${paused ? 'is-paused' : ''} ${crashed ? 'is-crash' : ''}`}>
                <AssetImg src="/assets/vehicles/train_engine.png" fallback="🚂" className="loco-img" />
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
