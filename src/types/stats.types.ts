// Single stat
export interface Stat {
  id?: string; // for UI tracking only
  name: string;
  value: number;
}

// Single charge
export interface Charge {
  id?: string; // for UI tracking only
  name: string;
  value: number;
}

// Default stats that every item has
export interface DefaultStats {
  price: number;
  level: number;
  maxLevel: number;
  rarity: number;
}
