import { COMMANDS, type CommandId } from '../levels';
import { AssetImg } from './AssetImg';

interface Props {
  bank: CommandId[];
  strip: CommandId[];
  shake?: boolean;
  hint?: CommandId | null;
  cursor?: number;
  running?: boolean;
  playEnabled: boolean;
  connectFile?: string;
  onAdd(cmd: CommandId): void;
  onUndo(): void;
  onPlay(): void;
}

export function CommandStrip({
  bank,
  strip,
  shake,
  hint,
  cursor = 0,
  running,
  playEnabled,
  connectFile,
  onAdd,
  onUndo,
  onPlay,
}: Props): JSX.Element {
  const art = (id: CommandId): string => (id === 'connect' && connectFile ? connectFile : COMMANDS[id].file);

  return (
    <div className="program">
      <div className={`strip ${shake ? 'is-shake' : ''}`} aria-label="program">
        {strip.map((id, i) => (
          <div
            key={`${id}-${i}`}
            className={`cmd is-placed ${i < cursor ? 'is-done' : ''} ${
              running && i === cursor - 1 ? 'is-now' : ''
            }`}
          >
            <AssetImg src={art(id)} fallback={COMMANDS[id].emoji} className="cmd-img" />
            <span className="cmd-label">{COMMANDS[id].label}</span>
          </div>
        ))}
        {!running && strip.length < 12 ? <div className="cmd is-slot" /> : null}
      </div>
      <div className="bank">
        {bank.map((id) => (
          <button
            key={id}
            type="button"
            className={`cmd ${hint === id ? 'is-hint' : ''}`}
            onClick={() => onAdd(id)}
          >
            <AssetImg src={art(id)} fallback={COMMANDS[id].emoji} className="cmd-img" />
            <span className="cmd-label">{COMMANDS[id].label}</span>
          </button>
        ))}
        <button type="button" className="cmd undo" onClick={onUndo} aria-label="cofnij">
          🔙
        </button>
        <button
          type="button"
          className="cmd play"
          onClick={onPlay}
          disabled={!playEnabled}
          aria-label="start"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
