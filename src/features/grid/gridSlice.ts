import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GridPoint, Pivot } from '../../types/item.types';
import { stringifyPoint } from '../../utils/logicTree.utils';

interface GridState {
  points: string[]; // Array of "x,y" strings
  pivot: Pivot | null;
}

const initialState: GridState = {
  points: [],
  pivot: null,
};

const gridSlice = createSlice({
  name: 'grid',
  initialState,
  reducers: {
    togglePoint: (state, action: PayloadAction<GridPoint>) => {
      const pointStr = stringifyPoint(action.payload);
      const index = state.points.indexOf(pointStr);

      if (index > -1) {
        state.points.splice(index, 1);
      } else {
        state.points.push(pointStr);
      }
    },
    clearPoints: (state) => {
      state.points = [];
    },
    setPoints: (state, action: PayloadAction<GridPoint[]>) => {
      state.points = action.payload.map(stringifyPoint);
    },
    setPivot: (state, action: PayloadAction<Pivot | null>) => {
      state.pivot = action.payload;
    },
    loadGridData: (state, action: PayloadAction<{ points: GridPoint[]; pivot?: Pivot }>) => {
      state.points = action.payload.points.map(stringifyPoint);
      state.pivot = action.payload.pivot || null;
    },
    resetGrid: () => initialState,
  },
});

export const {
  togglePoint,
  clearPoints,
  setPoints,
  setPivot,
  loadGridData,
  resetGrid,
} = gridSlice.actions;

export default gridSlice.reducer;
