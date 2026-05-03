import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Tag {
  id: string;
  value: string;
}

interface ItemState {
  name: string;
  weight: number;
  ico: string;
  description: string;
  tags: Tag[];
}

const initialState: ItemState = {
  name: '',
  weight: 100,
  ico: '',
  description: '',
  tags: [],
};

let tagIdCounter = 0;
const generateTagId = () => `tag-${++tagIdCounter}`;

const itemSlice = createSlice({
  name: 'item',
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setWeight: (state, action: PayloadAction<number>) => {
      state.weight = action.payload;
    },
    setIco: (state, action: PayloadAction<string>) => {
      state.ico = action.payload;
    },
    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },
    addTag: (state, action: PayloadAction<string>) => {
      // Don't add duplicate tags
      if (!state.tags.some(tag => tag.value === action.payload)) {
        state.tags.push({
          id: generateTagId(),
          value: action.payload,
        });
      }
    },
    updateTag: (
      state,
      action: PayloadAction<{ id: string; value: string }>
    ) => {
      const { id, value } = action.payload;
      const tag = state.tags.find((t) => t.id === id);
      if (tag) {
        tag.value = value;
      }
    },
    removeTag: (state, action: PayloadAction<string>) => {
      state.tags = state.tags.filter((t) => t.id !== action.payload);
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      // Convert string array to Tag objects for import compatibility
      state.tags = action.payload.map(value => ({
        id: generateTagId(),
        value,
      }));
    },
    loadItemData: (state, action: PayloadAction<Partial<ItemState>>) => {
      return { ...state, ...action.payload };
    },
    reorderTags: (state, action: PayloadAction<{ activeId: string; overId: string }>) => {
      const { activeId, overId } = action.payload;
      const from = state.tags.findIndex((t) => t.id === activeId);
      const to = state.tags.findIndex((t) => t.id === overId);
      if (from === -1 || to === -1 || from === to) return;
      const [moved] = state.tags.splice(from, 1);
      state.tags.splice(to, 0, moved);
    },
    resetItem: () => initialState,
  },
});

export const {
  setName,
  setWeight,
  setIco,
  setDescription,
  addTag,
  updateTag,
  removeTag,
  reorderTags,
  setTags,
  loadItemData,
  resetItem,
} = itemSlice.actions;

// Export alias for consistency
export const loadItem = loadItemData;

export default itemSlice.reducer;
