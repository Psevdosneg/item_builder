import { AVAILABLE_TAGS } from '../utils/constants';
import type { Stat, Charge } from './stats.types';
import type { LogicNode } from './logic.types';

// Tag type
export type Tag = typeof AVAILABLE_TAGS[number];

// Grid point (x, y coordinates)
export interface GridPoint {
  x: number;
  y: number;
}

// Pivot point for item rotation
export interface Pivot {
  x: number;
  y: number;
}

// Drawer export format (without id)
export interface DrawerExport {
  type: string;
  cellTop: { x: number; y: number };
  cellBot: { x: number; y: number };
  cellLeft: { x: number; y: number };
  cellRight: { x: number; y: number };
}

// Complete item structure
export interface Item {
  weight: number;
  name: string;
  ico: string;
  description: string;
  points: GridPoint[];
  tags: string[];
  stats: Stat[];
  charges?: Charge[];
  logic?: LogicNode[];
  pivot?: Pivot;
  drawers?: DrawerExport[];
}
