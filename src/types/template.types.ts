import type { Item } from './item.types';

// Template structure
export interface Template {
  name: string;
  displayName: string;
  description: string;
  item: Item;
}

// Template names
export type TemplateName =
  | 'cleaver'
  | 'ratBox'
  | 'clock'
  | 'drill'
  | 'damageBuster';
