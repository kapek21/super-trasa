import { COMMANDS, type CommandId } from '../levels';
import { AssetImg } from './AssetImg';

interface Props {
  bank: CommandId[];
  strip: CommandId[];
  expected: CommandId;
  shake: boolean;
  onTry(cmd: CommandId): void;
  onUndo(): void;
}

export function CommandStrip({ bank, strip, expected, shake, onTry, onUndo }: Props): JSX.Element {
  return (
    <div className="program">
      <div className={`strip ${shake ? 'is-shake' : ''}`}>
        {strip.map((id, i) => (
          <div key={`${id}-${i}`} className="cmd is-placed">
            <AssetImg src={COMMANDS[id].file} fallback={COMMANDS[id].emoji} className="cmd-img" />
          </div>
        ))}
        <div className="cmd is-slot">
          <AssetImg src={COMMANDS[expected].file} fallback={COMMANDS[expected].emoji} className="cmd-img" />
        </div>
      </div>
      <div className="bank">
        {bank.map((id) => (
          <button key={id} type="button" className="cmd" onClick={() => onTry(id)}>
            <AssetImg src={COMMANDS[id].file} fallback={COMMANDS[id].emoji} className="cmd-img" />
          </button>
        ))}
        <button type="button" className="cmd undo" onClick={onUndo} aria-label="cofnij">
          🔙
        </button>
      </div>
    </div>
  );
}
