export type CommandId = 'pick' | 'place' | 'turn' | 'connect' | 'crane' | 'gate';

export interface CommandDef {
  id: CommandId;
  emoji: string;
  file: string;
}

export const COMMANDS: Record<CommandId, CommandDef> = {
  pick: { id: 'pick', emoji: '📦', file: '/assets/commands/cmd_pick.png' },
  place: { id: 'place', emoji: '➖', file: '/assets/commands/cmd_place.png' },
  turn: { id: 'turn', emoji: '↩️', file: '/assets/commands/cmd_turn.png' },
  connect: { id: 'connect', emoji: '📺', file: '/assets/commands/cmd_connect.png' },
  crane: { id: 'crane', emoji: '🏗️', file: '/assets/commands/cmd_crane_up.png' },
  gate: { id: 'gate', emoji: '🚧', file: '/assets/commands/cmd_wait_gate.png' },
};

export type BoardCell = 'empty' | 'track' | 'curve' | 'station' | 'tv' | 'gate' | 'road';

export type FailKind = 'no-brick' | 'gap' | 'gate' | 'wrong-turn' | 'no-connect' | 'extra';

export const FAIL_FACE: Record<FailKind, string> = {
  'no-brick': '📦❓',
  gap: '🕳️',
  gate: '🚧💥',
  'wrong-turn': '↩️💥',
  'no-connect': '📺❓',
  extra: '❌',
};

export interface LevelDef {
  id: string;
  titleEmoji: string;
  bank: CommandId[];
  cells: BoardCell[];
  /** Ile odcinków toru trzeba położyć (place albo turn). */
  needLaid: number;
  needsGate: boolean;
  needsTurn: boolean;
  pauseAt: number[];
}

export const TRACK_LEVELS: readonly LevelDef[] = [
  {
    id: 'l1-tv',
    titleEmoji: '📺',
    bank: ['pick', 'place', 'connect', 'turn', 'crane'],
    cells: ['empty', 'empty', 'station', 'tv'],
    needLaid: 2,
    needsGate: false,
    needsTurn: false,
    pauseAt: [2, 3],
  },
  {
    id: 'l2-gate',
    titleEmoji: '🚧',
    bank: ['pick', 'place', 'gate', 'connect', 'turn'],
    cells: ['empty', 'gate', 'tv'],
    needLaid: 1,
    needsGate: true,
    needsTurn: false,
    pauseAt: [1, 2],
  },
  {
    id: 'l3-curve',
    titleEmoji: '↩️',
    bank: ['pick', 'place', 'turn', 'connect', 'gate'],
    cells: ['empty', 'empty', 'station', 'tv'],
    needLaid: 2,
    needsGate: false,
    needsTurn: true,
    pauseAt: [2, 3],
  },
];

export const GOKART_LEVEL: LevelDef = {
  id: 'gokart',
  titleEmoji: '🏎️',
  bank: ['pick', 'place', 'turn', 'connect', 'crane'],
  cells: ['empty', 'road', 'road'],
  needLaid: 1,
  needsGate: false,
  needsTurn: true,
  pauseAt: [],
};

export interface StepState {
  laid: number;
  bricks: number;
  turns: number;
  gateOpen: boolean;
  connected: boolean;
  fail: FailKind | null;
}

export function runTrack(program: readonly CommandId[], level: LevelDef): StepState {
  const states = stepTrack(program, level);
  return states[states.length - 1] ?? {
    laid: 0,
    bricks: 0,
    turns: 0,
    gateOpen: false,
    connected: false,
    fail: 'no-connect',
  };
}

/** Stan po każdym poleceniu — do animacji Start. */
export function stepTrack(program: readonly CommandId[], level: LevelDef): StepState[] {
  const out: StepState[] = [];
  let bricks = 0;
  let laid = 0;
  let turns = 0;
  let gateOpen = false;
  let connected = false;
  let fail: FailKind | null = null;

  const snap = (f: FailKind | null): StepState => ({
    laid,
    bricks,
    turns,
    gateOpen,
    connected,
    fail: f,
  });

  if (program.length === 0) return [snap('no-connect')];

  for (const cmd of program) {
    if (fail) {
      out.push(snap(fail));
      continue;
    }
    if (cmd === 'pick') {
      bricks += 1;
    } else if (cmd === 'place') {
      if (bricks <= 0) fail = 'no-brick';
      else {
        bricks -= 1;
        laid += 1;
      }
    } else if (cmd === 'turn') {
      if (!level.needsTurn) fail = 'wrong-turn';
      else if (bricks <= 0) fail = 'no-brick';
      else {
        bricks -= 1;
        laid += 1;
        turns += 1;
      }
    } else if (cmd === 'gate') {
      if (!level.needsGate) fail = 'extra';
      else gateOpen = true;
    } else if (cmd === 'crane') {
      fail = 'extra';
    } else if (cmd === 'connect') {
      if (laid < level.needLaid) fail = 'gap';
      else if (level.needsGate && !gateOpen) fail = 'gate';
      else if (level.needsTurn && turns < 1) fail = 'wrong-turn';
      else connected = true;
    }
    out.push(snap(fail));
  }

  const last = out[out.length - 1];
  if (last && !last.fail && !last.connected) {
    out[out.length - 1] = { ...last, fail: 'no-connect' };
  }
  return out;
}

export function hintCommand(program: readonly CommandId[], level: LevelDef): CommandId | null {
  const now = runTrack(program, level);
  if (now.connected && !now.fail) return null;
  const candidates: CommandId[] = [];
  if (now.bricks === 0 && (now.laid < level.needLaid || (level.needsTurn && now.turns < 1))) {
    candidates.push('pick');
  }
  if (now.bricks > 0 && now.laid < level.needLaid) {
    if (level.needsTurn && now.turns < 1 && now.laid === level.needLaid - 1) candidates.push('turn');
    else candidates.push('place');
  }
  if (level.needsGate && !now.gateOpen && now.laid >= level.needLaid) candidates.push('gate');
  if (
    now.laid >= level.needLaid &&
    (!level.needsGate || now.gateOpen) &&
    (!level.needsTurn || now.turns >= 1)
  ) {
    candidates.push('connect');
  }
  return candidates[0] ?? 'pick';
}
