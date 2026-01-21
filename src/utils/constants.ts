// Grid configuration
export const GRID_SIZE = 5;

// Available tags for items (imported from presets for backward compatibility)
export { AVAILABLE_TAGS } from './tags';

// Node types for logic system
export const NODE_TYPES = [
  'trigger',
  'checker',
  'activator',
  'aura',
  'conditional',
  'counter',
] as const;

// Trigger types
export const TRIGGER_TYPES = [
  'cooldown',
  'itemActivated',
  'changeBattleState',
  'cripSpawn',
  'cripDeath',
  'itemChargesChanged',
] as const;

// Checker types
export const CHECKER_TYPES = [
  'cooldown',
  'chargePrice',
  'allyPrice',
  'resourcePrice',
  'battleState',
  'itemConditional',
  'cripConditional',
] as const;

// Activator types
export const ACTIVATOR_TYPES = [
  'damage',
  'heal',
  'changeResource',
  'spawner',
  'impulseItem',
  'addItemStateTag',
  'changeItemCharge',
] as const;

// Conditional types
export const CONDITIONAL_TYPES = [
  'characterRelative',
  'characterRandom',
  'characterSelf',
  'battleState',
  'itemTag',
  'itemSelf',
  'itemPosition',
  'characterTag',
  'characterResources',
  'itemRandom',
] as const;

// AI Models
export const AI_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'] as const;

// Available stat names for dropdown selection
export const STAT_NAMES = [
  'cooldown',
  'collectedTime',
  'damage',
  'heal',
  'multicast',
  'spawnedCrips',
] as const;

// Node type colors for UI
export const NODE_TYPE_COLORS: Record<string, string> = {
  trigger: '#00ff88',
  checker: '#ff9500',
  activator: '#ff006e',
  aura: '#00d4ff',
  conditional: '#a855f7',
  counter: '#fbbf24',
};

// Drawer cell colors
export const DRAWER_CELL_COLORS = {
  cellTop: '#ff6b6b',
  cellBot: '#4ecdc4',
  cellLeft: '#ffe66d',
  cellRight: '#a855f7',
} as const;

// Drawer line colors (for visualization)
export const DRAWER_COLORS = [
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#96ceb4',
  '#feca57',
  '#a855f7',
] as const;
