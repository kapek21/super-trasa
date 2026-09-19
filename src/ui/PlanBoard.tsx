import { COMMANDS, type CommandId } from '../levels';
import { AssetImg } from './AssetImg';

interface Props {
  plan: Array<{ emoji: string; cmd: CommandId }>;
  step: number;
}

export function PlanBoard({ plan, step }: Props): JSX.Element {
  return (
    <div className="plan" aria-label="projekt">
      {plan.map((item, i) => (
        <div key={`${item.cmd}-${i}`} className={`plan-step ${i === step ? 'is-next' : i < step ? 'is-done' : ''}`}>
          <AssetImg src={COMMANDS[item.cmd].file} fallback={item.emoji} className="plan-img" />
          {i === step && (
            <span className="bulldozer">
              <AssetImg src="/assets/helper/bulldozer.png" fallback="🚜" className="bull-img" />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
