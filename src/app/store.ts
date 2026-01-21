import { configureStore } from '@reduxjs/toolkit';
import itemReducer from '../features/item/itemSlice';
import gridReducer from '../features/grid/gridSlice';
import statsReducer from '../features/stats/statsSlice';
import logicReducer from '../features/logic/logicSlice';
import templatesReducer from '../features/templates/templatesSlice';
import aiReducer from '../features/ai/aiSlice';
import drawersReducer from '../features/drawers/drawersSlice';

export const store = configureStore({
  reducer: {
    item: itemReducer,
    grid: gridReducer,
    stats: statsReducer,
    logic: logicReducer,
    templates: templatesReducer,
    ai: aiReducer,
    drawers: drawersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['logic/loadLogicTree'],
        // Ignore these field paths in the state
        ignoredPaths: ['logic.collapsedNodes', 'logic.treeView.collapsedTreeNodes'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
