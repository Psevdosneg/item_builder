import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AIModel } from '../../types/api.types';

interface AIState {
  isModalOpen: boolean;
  isGenerating: boolean;
  apiKey: string | null;
  selectedModel: AIModel;
  prompt: string;
  error: string | null;
}

const initialState: AIState = {
  isModalOpen: false,
  isGenerating: false,
  apiKey: null,
  selectedModel: 'gpt-4o-mini',
  prompt: '',
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    openModal: (state) => {
      state.isModalOpen = true;
      state.error = null;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.prompt = '';
      state.error = null;
    },
    setApiKey: (state, action: PayloadAction<string | null>) => {
      state.apiKey = action.payload;
      // Save to localStorage
      if (action.payload) {
        localStorage.setItem('openai_api_key', action.payload);
      } else {
        localStorage.removeItem('openai_api_key');
      }
    },
    setModel: (state, action: PayloadAction<AIModel>) => {
      state.selectedModel = action.payload;
    },
    setPrompt: (state, action: PayloadAction<string>) => {
      state.prompt = action.payload;
    },
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    loadApiKeyFromStorage: (state) => {
      const savedKey = localStorage.getItem('openai_api_key');
      if (savedKey) {
        state.apiKey = savedKey;
      }
    },
  },
});

export const {
  openModal,
  closeModal,
  setApiKey,
  setModel,
  setPrompt,
  setGenerating,
  setError,
  clearError,
  loadApiKeyFromStorage,
} = aiSlice.actions;

// Helper action creators for API key management
export const saveApiKeyToStorage = (key: string) => setApiKey(key);
export const removeApiKeyFromStorage = () => setApiKey(null);

export default aiSlice.reducer;
