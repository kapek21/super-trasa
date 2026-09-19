export type DriverTab = 'animals' | 'cubes' | 'minifigs' | 'mix';

export interface DriverPreset {
  id: string;
  tab: Exclude<DriverTab, 'mix'>;
  emoji: string;
  tint: string;
  file: string;
}

export interface MixDriver {
  kind: 'mix';
  helm: string;
  face: string;
  body: string;
  tint: string;
}

export interface PresetDriver {
  kind: 'preset';
  id: string;
}

export type SavedDriver = MixDriver | PresetDriver;

export const DRIVER_TABS: ReadonlyArray<{ id: DriverTab; emoji: string; file: string }> = [
  { id: 'animals', emoji: '🐾', file: '/assets/drivers/tabs/tab_animals.png' },
  { id: 'cubes', emoji: '🧊', file: '/assets/drivers/tabs/tab_cubes.png' },
  { id: 'minifigs', emoji: '🧱', file: '/assets/drivers/tabs/tab_minifigs.png' },
  { id: 'mix', emoji: '🎨', file: '/assets/drivers/tabs/tab_mix.png' },
];

export const DRIVERS: readonly DriverPreset[] = [
  { id: 'cat', tab: 'animals', emoji: '🐱', tint: '#f4a261', file: '/assets/drivers/animals/driver_cat.png' },
  { id: 'dog', tab: 'animals', emoji: '🐶', tint: '#e9c46a', file: '/assets/drivers/animals/driver_dog.png' },
  { id: 'fox', tab: 'animals', emoji: '🦊', tint: '#e76f51', file: '/assets/drivers/animals/driver_fox.png' },
  { id: 'panda', tab: 'animals', emoji: '🐼', tint: '#fcfcfc', file: '/assets/drivers/animals/driver_panda.png' },
  { id: 'duck', tab: 'animals', emoji: '🦆', tint: '#fce874', file: '/assets/drivers/animals/driver_duck.png' },
  { id: 'dino', tab: 'animals', emoji: '🦕', tint: '#40e878', file: '/assets/drivers/animals/driver_dino.png' },
  { id: 'unicorn', tab: 'animals', emoji: '🦄', tint: '#ff90c8', file: '/assets/drivers/animals/driver_unicorn.png' },
  { id: 'owl', tab: 'animals', emoji: '🦉', tint: '#b08968', file: '/assets/drivers/animals/driver_owl.png' },
  { id: 'miner-blue', tab: 'cubes', emoji: '⛏️', tint: '#5c94fc', file: '/assets/drivers/cubes/driver_miner_blue.png' },
  { id: 'miner-teal', tab: 'cubes', emoji: '🪓', tint: '#2a9d8f', file: '/assets/drivers/cubes/driver_miner_teal.png' },
  { id: 'cube-critter', tab: 'cubes', emoji: '🟩', tint: '#40e878', file: '/assets/drivers/cubes/driver_cube_critter.png' },
  { id: 'tall-shadow', tab: 'cubes', emoji: '👤', tint: '#181028', file: '/assets/drivers/cubes/driver_tall_shadow.png' },
  { id: 'snow-brick', tab: 'cubes', emoji: '⛄', tint: '#e8f4ff', file: '/assets/drivers/cubes/driver_snow_brick.png' },
  { id: 'bee-brick', tab: 'cubes', emoji: '🐝', tint: '#fce874', file: '/assets/drivers/cubes/driver_bee_brick.png' },
  { id: 'knight', tab: 'minifigs', emoji: '🛡️', tint: '#8899aa', file: '/assets/drivers/minifigs/driver_knight.png' },
  { id: 'pirate', tab: 'minifigs', emoji: '🏴‍☠️', tint: '#e40058', file: '/assets/drivers/minifigs/driver_pirate.png' },
  { id: 'astronaut', tab: 'minifigs', emoji: '🚀', tint: '#fcfcfc', file: '/assets/drivers/minifigs/driver_astronaut.png' },
  { id: 'firefighter', tab: 'minifigs', emoji: '🚒', tint: '#e40058', file: '/assets/drivers/minifigs/driver_firefighter.png' },
  { id: 'ninja', tab: 'minifigs', emoji: '🥷', tint: '#181028', file: '/assets/drivers/minifigs/driver_ninja.png' },
  { id: 'queen', tab: 'minifigs', emoji: '👑', tint: '#fce874', file: '/assets/drivers/minifigs/driver_queen.png' },
  { id: 'mechanic', tab: 'minifigs', emoji: '🔧', tint: '#5c94fc', file: '/assets/drivers/minifigs/driver_mechanic.png' },
  { id: 'wizard', tab: 'minifigs', emoji: '🧙', tint: '#7b2cbf', file: '/assets/drivers/minifigs/driver_wizard.png' },
];

export const MIX_TINTS = ['#5c94fc', '#e40058', '#40e878', '#fce874', '#ff90c8'] as const;

const STORAGE_KEY = 'super-trasa-driver';

export function loadDriver(): SavedDriver | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedDriver;
  } catch {
    return null;
  }
}

export function saveDriver(driver: SavedDriver): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(driver));
}

export function driverEmoji(driver: SavedDriver): string {
  if (driver.kind === 'mix') return '🙂';
  return DRIVERS.find((d) => d.id === driver.id)?.emoji ?? '🚂';
}

export function driverSrc(driver: SavedDriver): string | null {
  if (driver.kind === 'mix') return `/assets/drivers/mix/mix_face_${driver.face}.png`;
  return DRIVERS.find((d) => d.id === driver.id)?.file ?? null;
}

export function driverTint(driver: SavedDriver): string {
  if (driver.kind === 'mix') return driver.tint;
  return DRIVERS.find((d) => d.id === driver.id)?.tint ?? '#5c94fc';
}

export function driverLabel(driver: SavedDriver): string {
  if (driver.kind === 'mix') return `${driver.helm}${driver.face}${driver.body}`;
  return driverEmoji(driver);
}
