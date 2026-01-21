import { createAsyncThunk } from '@reduxjs/toolkit';
import { generateWithOpenAI } from '../../services/openai.service';
import type { Item } from '../../types/item.types';
import { setGenerating, setError, closeModal } from './aiSlice';
import { loadItemData } from '../item/itemSlice';
import { loadGridData } from '../grid/gridSlice';
import { loadStatsData } from '../stats/statsSlice';
import { loadLogicTree } from '../logic/logicSlice';

interface GenerateParams {
  prompt: string;
  apiKey: string;
  model: string;
}

/**
 * Generate item with AI
 */
export const generateItemWithAI = createAsyncThunk<
  Item,
  GenerateParams,
  { rejectValue: string }
>('ai/generateItem', async (params, { dispatch, rejectWithValue }) => {
  const { prompt, apiKey, model } = params;

  try {
    dispatch(setGenerating(true));
    dispatch(setError(null));

    const item = await generateWithOpenAI(prompt, apiKey, model);

    // Validate basic structure
    if (!item || typeof item !== 'object') {
      throw new Error('Invalid response format');
    }

    // Load generated item into store
    dispatch(
      loadItemData({
        name: item.name || '',
        weight: item.weight || 100,
        ico: item.ico || '',
        description: item.description || '',
        tags: item.tags || [],
      })
    );

    dispatch(
      loadGridData({
        points: item.points || [],
        pivot: item.pivot,
      })
    );

    dispatch(
      loadStatsData({
        stats: item.stats || [],
        charges: item.charges,
      })
    );

    if (item.logic && item.logic.length > 0) {
      dispatch(loadLogicTree(item.logic));
    }

    dispatch(closeModal());
    dispatch(setGenerating(false));

    return item;
  } catch (error) {
    dispatch(setGenerating(false));
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate item';
    dispatch(setError(errorMessage));
    return rejectWithValue(errorMessage);
  }
});

// Export alias for consistency
export const generateWithAI = generateItemWithAI;
