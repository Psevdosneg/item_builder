import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Item } from '../../types/item.types';

const STORAGE_KEY = 'item_builder_library';

export interface LibraryEntry {
  id: string;
  name: string;
  savedAt: string;
  item: Item;
}

interface LibraryState {
  entries: Record<string, LibraryEntry>;
}

function loadFromStorage(): Record<string, LibraryEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LibraryEntry>) : {};
  } catch {
    return {};
  }
}

function saveToStorage(entries: Record<string, LibraryEntry>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage may be unavailable
  }
}

const initialState: LibraryState = {
  entries: loadFromStorage(),
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    saveEntry: (state, action: PayloadAction<{ name: string; item: Item }>) => {
      const id = `lib_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const entry: LibraryEntry = {
        id,
        name: action.payload.name,
        savedAt: new Date().toISOString(),
        item: action.payload.item,
      };
      state.entries[id] = entry;
      saveToStorage(state.entries);
    },
    removeEntry: (state, action: PayloadAction<string>) => {
      delete state.entries[action.payload];
      saveToStorage(state.entries);
    },
    renameEntry: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const entry = state.entries[action.payload.id];
      if (entry) {
        entry.name = action.payload.name;
        saveToStorage(state.entries);
      }
    },
  },
});

export const { saveEntry, removeEntry, renameEntry } = librarySlice.actions;
export default librarySlice.reducer;
