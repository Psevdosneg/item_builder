import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Item } from '../../types/item.types';

interface TemplatesState {
  templates: Record<string, Item>;
  selectedTemplate: string | null;
}

const initialState: TemplatesState = {
  templates: {},
  selectedTemplate: null,
};

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setTemplates: (state, action: PayloadAction<Record<string, Item>>) => {
      state.templates = action.payload;
    },
    addTemplate: (state, action: PayloadAction<{ name: string; item: Item }>) => {
      const { name, item } = action.payload;
      state.templates[name] = item;
    },
    selectTemplate: (state, action: PayloadAction<string | null>) => {
      state.selectedTemplate = action.payload;
    },
  },
});

export const { setTemplates, addTemplate, selectTemplate } = templatesSlice.actions;

export default templatesSlice.reducer;
