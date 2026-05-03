import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Drawer,
  CellPosition,
  DrawerEditMode,
  DrawerSelectionStep,
} from '../../types/drawer.types';

interface DrawersState {
  drawers: Drawer[];
  editMode: DrawerEditMode;
}

const initialEditMode: DrawerEditMode = {
  isActive: false,
  drawerId: null,
  currentStep: null,
  partialDrawer: {},
};

const initialState: DrawersState = {
  drawers: [],
  editMode: initialEditMode,
};

let drawerIdCounter = 0;
const generateDrawerId = () => `drawer-${++drawerIdCounter}`;

const STEP_ORDER: DrawerSelectionStep[] = ['cellTop', 'cellBot', 'cellLeft', 'cellRight'];

const getNextStep = (currentStep: DrawerSelectionStep): DrawerSelectionStep => {
  if (!currentStep) return 'cellTop';
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex >= STEP_ORDER.length - 1) return null;
  return STEP_ORDER[currentIndex + 1];
};

const drawersSlice = createSlice({
  name: 'drawers',
  initialState,
  reducers: {
    addDrawer: (state, action: PayloadAction<Omit<Drawer, 'id'>>) => {
      state.drawers.push({
        ...action.payload,
        id: generateDrawerId(),
      });
    },

    updateDrawer: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<Drawer, 'id'>> }>
    ) => {
      const { id, updates } = action.payload;
      const drawer = state.drawers.find((d) => d.id === id);
      if (drawer) {
        Object.assign(drawer, updates);
      }
    },

    removeDrawer: (state, action: PayloadAction<string>) => {
      state.drawers = state.drawers.filter((d) => d.id !== action.payload);
    },

    loadDrawers: (state, action: PayloadAction<Omit<Drawer, 'id'>[]>) => {
      state.drawers = action.payload.map((drawer) => ({
        ...drawer,
        id: generateDrawerId(),
      }));
    },

    resetDrawers: () => initialState,

    startEditMode: (state, action: PayloadAction<{ drawerId?: string; type?: string }>) => {
      const { drawerId, type } = action.payload;

      if (drawerId) {
        const existingDrawer = state.drawers.find((d) => d.id === drawerId);
        if (existingDrawer) {
          state.editMode = {
            isActive: true,
            drawerId,
            currentStep: 'cellTop',
            partialDrawer: {
              type: existingDrawer.type,
              cellTop: existingDrawer.cellTop,
              cellBot: existingDrawer.cellBot,
              cellLeft: existingDrawer.cellLeft,
              cellRight: existingDrawer.cellRight,
            },
          };
        }
      } else {
        state.editMode = {
          isActive: true,
          drawerId: null,
          currentStep: 'cellTop',
          partialDrawer: {
            type: type || 'multicast',
          },
        };
      }
    },

    setDrawerType: (state, action: PayloadAction<string>) => {
      state.editMode.partialDrawer.type = action.payload;
    },

    setCellForStep: (
      state,
      action: PayloadAction<{ step: DrawerSelectionStep; cell: CellPosition }>
    ) => {
      const { step, cell } = action.payload;
      if (step && state.editMode.isActive) {
        state.editMode.partialDrawer[step] = cell;
      }
    },

    nextStep: (state) => {
      if (state.editMode.isActive) {
        state.editMode.currentStep = getNextStep(state.editMode.currentStep);
      }
    },

    setStep: (state, action: PayloadAction<DrawerSelectionStep>) => {
      if (state.editMode.isActive) {
        state.editMode.currentStep = action.payload;
      }
    },

    clearCellSelections: (state) => {
      if (state.editMode.isActive) {
        const currentType = state.editMode.partialDrawer.type;
        state.editMode.partialDrawer = { type: currentType };
        state.editMode.currentStep = 'cellTop';
      }
    },

    cancelEditMode: (state) => {
      state.editMode = initialEditMode;
    },

    finishEditMode: (state) => {
      const { drawerId, partialDrawer } = state.editMode;

      if (
        partialDrawer.type !== undefined &&
        partialDrawer.cellTop &&
        partialDrawer.cellBot &&
        partialDrawer.cellLeft &&
        partialDrawer.cellRight
      ) {
        const completeDrawer: Omit<Drawer, 'id'> = {
          type: partialDrawer.type,
          cellTop: partialDrawer.cellTop,
          cellBot: partialDrawer.cellBot,
          cellLeft: partialDrawer.cellLeft,
          cellRight: partialDrawer.cellRight,
        };

        if (drawerId) {
          const index = state.drawers.findIndex((d) => d.id === drawerId);
          if (index !== -1) {
            state.drawers[index] = { ...completeDrawer, id: drawerId };
          }
        } else {
          state.drawers.push({
            ...completeDrawer,
            id: generateDrawerId(),
          });
        }
      }

      state.editMode = initialEditMode;
    },
  },
});

export const {
  addDrawer,
  updateDrawer,
  removeDrawer,
  loadDrawers,
  resetDrawers,
  startEditMode,
  setDrawerType,
  setCellForStep,
  nextStep,
  setStep,
  clearCellSelections,
  cancelEditMode,
  finishEditMode,
} = drawersSlice.actions;

export default drawersSlice.reducer;
