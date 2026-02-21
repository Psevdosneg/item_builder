import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Stat, Charge, DefaultStats } from '../../types/stats.types';

interface StatsState {
  defaultStats: DefaultStats;
  touchedStats: Record<keyof DefaultStats, boolean>;
  customStats: Stat[];
  charges: Charge[];
}

const initialState: StatsState = {
  defaultStats: {
    price: 10,
    level: 0,
    maxLevel: 3,
    rarity: 0,
  },
  touchedStats: {
    price: false,
    level: false,
    maxLevel: false,
    rarity: false,
  },
  customStats: [],
  charges: [],
};

let statIdCounter = 0;
let chargeIdCounter = 0;

const generateStatId = () => `stat-${++statIdCounter}`;
const generateChargeId = () => `charge-${++chargeIdCounter}`;

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    setDefaultStat: (
      state,
      action: PayloadAction<{ key: keyof DefaultStats; value: number }>
    ) => {
      const { key, value } = action.payload;
      state.defaultStats[key] = value;
      state.touchedStats[key] = true;
    },
    addCustomStat: (state, action: PayloadAction<Omit<Stat, 'id'>>) => {
      state.customStats.push({
        ...action.payload,
        id: generateStatId(),
      });
    },
    updateCustomStat: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<Stat, 'id'>> }>
    ) => {
      const { id, updates } = action.payload;
      const stat = state.customStats.find((s) => s.id === id);
      if (stat) {
        Object.assign(stat, updates);
      }
    },
    removeCustomStat: (state, action: PayloadAction<string>) => {
      state.customStats = state.customStats.filter((s) => s.id !== action.payload);
    },
    addCharge: (state, action: PayloadAction<Omit<Charge, 'id'>>) => {
      state.charges.push({
        ...action.payload,
        id: generateChargeId(),
      });
    },
    updateCharge: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<Charge, 'id'>> }>
    ) => {
      const { id, updates } = action.payload;
      const charge = state.charges.find((c) => c.id === id);
      if (charge) {
        Object.assign(charge, updates);
      }
    },
    removeCharge: (state, action: PayloadAction<string>) => {
      state.charges = state.charges.filter((c) => c.id !== action.payload);
    },
    loadStatsData: (
      state,
      action: PayloadAction<{
        stats?: Stat[];
        charges?: Charge[];
      }>
    ) => {
      const { stats, charges } = action.payload;

      // Reset to defaults
      state.defaultStats = { price: 10, level: 0, maxLevel: 3, rarity: 0 };
      state.touchedStats = { price: false, level: false, maxLevel: false, rarity: false };
      state.customStats = [];
      state.charges = [];

      // Load stats
      if (stats) {
        for (const stat of stats) {
          if (stat.name === 'price') {
            state.defaultStats.price = stat.value;
            state.touchedStats.price = true;
          } else if (stat.name === 'level') {
            state.defaultStats.level = stat.value;
            state.touchedStats.level = true;
          } else if (stat.name === 'maxLevel') {
            state.defaultStats.maxLevel = stat.value;
            state.touchedStats.maxLevel = true;
          } else if (stat.name === 'rarity') {
            state.defaultStats.rarity = stat.value;
            state.touchedStats.rarity = true;
          } else {
            state.customStats.push({
              ...stat,
              id: generateStatId(),
            });
          }
        }
      }

      // Load charges
      if (charges) {
        state.charges = charges.map((charge) => ({
          ...charge,
          id: generateChargeId(),
        }));
      }
    },
    resetStats: () => initialState,
  },
});

export const {
  setDefaultStat,
  addCustomStat,
  updateCustomStat,
  removeCustomStat,
  addCharge,
  updateCharge,
  removeCharge,
  loadStatsData,
  resetStats,
} = statsSlice.actions;

export default statsSlice.reducer;
