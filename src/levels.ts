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

export interface LevelDef {
  id: string;
  titleEmoji: string;
  expected: CommandId[];
  bank: CommandId[];
  plan: Array<{ emoji: string; cmd: CommandId }>;
  cells: BoardCell[];
  pauseAt: number[];
}

export const TRACK_LEVELS: readonly LevelDef[] = [
  {
    id: 'l1',
    titleEmoji: '1️⃣',
    expected: ['pick', 'place', 'place', 'connect'],
    bank: ['pick', 'place', 'connect', 'turn'],
    plan: [
      { emoji: '📦', cmd: 'pick' },
      { emoji: '➖', cmd: 'place' },
      { emoji: '➖', cmd: 'place' },
      { emoji: '📺', cmd: 'connect' },
    ],
    cells: ['empty', 'track', 'station', 'tv'],
    pauseAt: [2, 3],
  },
  {
    id: 'l2-gate',
    titleEmoji: '🚧',
    expected: ['pick', 'place', 'gate', 'connect'],
    bank: ['pick', 'place', 'gate', 'connect', 'turn'],
    plan: [
      { emoji: '📦', cmd: 'pick' },
      { emoji: '➖', cmd: 'place' },
      { emoji: '🚧', cmd: 'gate' },
      { emoji: '📺', cmd: 'connect' },
    ],
    cells: ['empty', 'track', 'gate', 'tv'],
    pauseAt: [2, 3],
  },
];

export const GOKART_STEPS: CommandId[] = ['pick', 'place', 'turn', 'connect'];
export const GOKART_PLAN: Array<{ emoji: string; cmd: CommandId }> = [
  { emoji: '📦', cmd: 'pick' },
  { emoji: '🛞', cmd: 'place' },
  { emoji: '🎡', cmd: 'turn' },
  { emoji: '🏁', cmd: 'connect' },
];
