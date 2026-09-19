import type { BoardCell } from '../levels';
import { AssetImg } from './AssetImg';

interface Props {
  cells: BoardCell[];
  revealed: number;
  trainAt: number;
  paused: boolean;
  driverEmoji: string;
  driverSrc: string | null;
}

const CELL_SRC: Record<BoardCell, { src: string; fallback: string }> = {
  empty: { src: '/assets/tracks/track_buffer.png', fallback: '⬜' },
  track: { src: '/assets/tracks/track_straight.png', fallback: '➖' },
  curve: { src: '/assets/tracks/track_curve.png', fallback: '↩️' },
  station: { src: '/assets/stations/station_batcave.png', fallback: '🦇' },
  tv: { src: '/assets/stations/station_tv.png', fallback: '📺' },
  gate: { src: '/assets/tracks/gate_rail.png', fallback: '🚧' },
  road: { src: '/assets/tracks/road_straight.png', fallback: '🛣️' },
};

export function RideBoard({ cells, revealed, trainAt, paused, driverEmoji, driverSrc }: Props): JSX.Element {
  return (
    <div className="ride-host ride-html">
      {cells.map((cell, i) => {
        const shown = i < revealed;
        const art = CELL_SRC[cell];
        return (
          <div key={i} className={`cell ${shown ? 'is-on' : ''}`}>
            {shown && <AssetImg src={art.src} fallback={art.fallback} className="cell-img" />}
            {trainAt === i && (
              <div className={`loco ${paused ? 'is-paused' : ''}`}>
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
