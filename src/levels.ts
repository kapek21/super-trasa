export type CommandId = 'pick' | 'place' | 'turn' | 'connect' | 'crane' | 'gate';

export interface CommandDef {
  id: CommandId;
  emoji: string;
  file: string;
  label: string;
}

export const COMMANDS: Record<CommandId, CommandDef> = {
  pick: { id: 'pick', emoji: '📦', file: '/assets/commands/cmd_pick.png', label: 'WEŹ' },
  place: { id: 'place', emoji: '➖', file: '/assets/commands/cmd_place.png', label: 'TOR' },
  turn: { id: 'turn', emoji: '↩️', file: '/assets/commands/cmd_turn.png', label: 'ŁUK' },
  connect: { id: 'connect', emoji: '📺', file: '/assets/commands/cmd_connect.png', label: 'CEL' },
  crane: { id: 'crane', emoji: '🏗️', file: '/assets/commands/cmd_crane_up.png', label: 'DŹWIG' },
  gate: { id: 'gate', emoji: '🚧', file: '/assets/commands/cmd_wait_gate.png', label: 'SZLABAN' },
};

export type BoardCell = 'start' | 'laid' | 'hole' | 'bend' | 'station' | 'tv' | 'gate' | 'road' | 'goal';

export type FailKind = 'no-brick' | 'gap' | 'gate' | 'wrong-turn' | 'no-connect' | 'extra';

export const FAIL_FACE: Record<FailKind, string> = {
  'no-brick': '📦❓',
  gap: '🕳️',
  gate: '🚧💥',
  'wrong-turn': '↩️💥',
  'no-connect': '🎯❓',
  extra: '❌',
};

export interface LevelDef {
  id: string;
  title: string;
  titleEmoji: string;
  goalFile: string;
  goalFallback: string;
  vehicle: 'train' | 'kart';
  bank: CommandId[];
  cells: BoardCell[];
  needHoles: number;
  needBends: number;
  needsGate: boolean;
}

export const TRACK_LEVELS: readonly LevelDef[] = [
  {
    id: 'l1-tv',
    title: 'Do TV',
    titleEmoji: '📺',
    goalFile: '/assets/stations/station_tv.png',
    goalFallback: '📺',
    vehicle: 'train',
    bank: ['pick', 'place', 'connect', 'crane'],
    cells: ['start', 'laid', 'hole', 'laid', 'hole', 'tv'],
    needHoles: 2,
    needBends: 0,
    needsGate: false,
  },
  {
    id: 'l2-cave',
    title: 'Do jaskini',
    titleEmoji: '🦇',
    goalFile: '/assets/stations/station_batcave.png',
    goalFallback: '🦇',
    vehicle: 'train',
    bank: ['pick', 'place', 'connect', 'turn'],
    cells: ['start', 'laid', 'hole', 'laid', 'hole', 'station'],
    needHoles: 2,
    needBends: 0,
    needsGate: false,
  },
  {
    id: 'l3-gate',
    title: 'Szlaban',
    titleEmoji: '🚧',
    goalFile: '/assets/stations/station_tv.png',
    goalFallback: '📺',
    vehicle: 'train',
    bank: ['pick', 'place', 'gate', 'connect', 'turn'],
    cells: ['start', 'laid', 'hole', 'gate', 'laid', 'tv'],
    needHoles: 1,
    needBends: 0,
    needsGate: true,
  },
  {
    id: 'l4-hq',
    title: 'Zakręt do bazy',
    titleEmoji: '🕸️',
    goalFile: '/assets/stations/station_spidey_hq.png',
    goalFallback: '🕸️',
    vehicle: 'train',
    bank: ['pick', 'place', 'turn', 'connect', 'crane'],
    cells: ['start', 'laid', 'hole', 'bend', 'station'],
    needHoles: 1,
    needBends: 1,
    needsGate: false,
  },
  {
    id: 'l5-woods',
    title: 'Las',
    titleEmoji: '🌲',
    goalFile: '/assets/stations/station_poke_woods.png',
    goalFallback: '🌲',
    vehicle: 'train',
    bank: ['pick', 'place', 'turn', 'gate', 'connect'],
    cells: ['start', 'laid', 'hole', 'bend', 'gate', 'goal'],
    needHoles: 1,
    needBends: 1,
    needsGate: true,
  },
];

export const GOKART_LEVEL: LevelDef = {
  id: 'gokart',
  title: 'Pętla',
  titleEmoji: '🏎️',
  goalFile: '/assets/stations/station_rainbow_loop.png',
  goalFallback: '🌈',
  vehicle: 'kart',
  bank: ['pick', 'place', 'turn', 'connect', 'crane'],
  cells: ['start', 'laid', 'road', 'bend', 'goal'],
  needHoles: 1,
  needBends: 1,
  needsGate: false,
};

export const ALL_LEVELS: readonly LevelDef[] = [...TRACK_LEVELS, GOKART_LEVEL];

export interface StepState {
  holes: number;
  bends: number;
  bricks: number;
  gateOpen: boolean;
  connected: boolean;
  fail: FailKind | null;
}

export function runTrack(program: readonly CommandId[], level: LevelDef): StepState {
  const states = stepTrack(program, level);
  return states[states.length - 1] ?? {
    holes: 0,
    bends: 0,
    bricks: 0,
    gateOpen: false,
    connected: false,
    fail: 'no-connect',
  };
}

export function stepTrack(program: readonly CommandId[], level: LevelDef): StepState[] {
  const out: StepState[] = [];
  let bricks = 0;
  let holes = 0;
  let bends = 0;
  let gateOpen = false;
  let connected = false;
  let fail: FailKind | null = null;

  const snap = (f: FailKind | null): StepState => ({
    holes,
    bends,
    bricks,
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
      else if (holes >= level.needHoles) fail = 'extra';
      else {
        bricks -= 1;
        holes += 1;
      }
    } else if (cmd === 'turn') {
      if (level.needBends <= 0) fail = 'wrong-turn';
      else if (bricks <= 0) fail = 'no-brick';
      else if (bends >= level.needBends) fail = 'extra';
      else {
        bricks -= 1;
        bends += 1;
      }
    } else if (cmd === 'gate') {
      if (!level.needsGate) fail = 'extra';
      else gateOpen = true;
    } else if (cmd === 'crane') {
      fail = 'extra';
    } else if (cmd === 'connect') {
      if (holes < level.needHoles || bends < level.needBends) fail = 'gap';
      else if (level.needsGate && !gateOpen) fail = 'gate';
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
  if (now.bricks === 0 && (now.holes < level.needHoles || now.bends < level.needBends)) return 'pick';
  if (now.bricks > 0 && now.holes < level.needHoles) return 'place';
  if (now.bricks > 0 && now.bends < level.needBends) return 'turn';
  if (level.needsGate && !now.gateOpen) return 'gate';
  return 'connect';
}

export function laidCount(state: StepState): number {
  return state.holes + state.bends;
}

/** Indeks, do którego pociąg może dojechać po aktualnie ułożonym torze. */
export function trainCell(
  cells: readonly BoardCell[],
  holes: number,
  bends: number,
  connected: boolean,
): number {
  let h = 0;
  let b = 0;
  let last = 0;
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i]!;
    if (c === 'start' || c === 'laid') {
      last = i;
      continue;
    }
    if (c === 'hole' || c === 'road') {
      if (h < holes) {
        last = i;
        h += 1;
        continue;
      }
      break;
    }
    if (c === 'bend') {
      if (b < bends) {
        last = i;
        b += 1;
        continue;
      }
      break;
    }
    if (c === 'gate') {
      last = i;
      continue;
    }
    if (c === 'tv' || c === 'station' || c === 'goal') {
      if (connected) last = i;
      break;
    }
  }
  return last;
}
