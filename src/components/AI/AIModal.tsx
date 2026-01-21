import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { closeModal, setModel, setPrompt, clearError } from '../../features/ai/aiSlice';
import { generateWithAI } from '../../features/ai/aiThunks';
import { Modal } from '../common/Modal';
import { APIKeySection } from './APIKeySection';
import { Select } from '../common/Select';
import type { SelectOption } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import styles from './AIModal.module.css';

const MODEL_OPTIONS: SelectOption[] = [
  { value: 'gpt-4', label: 'GPT-4 (Best Quality)' },
  { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Faster)' },
];

const EXAMPLE_PROMPTS: SelectOption[] = [
  { value: '', label: 'Choose an example...' },
  { value: 'sword', label: 'Magic Sword' },
  { value: 'staff', label: 'Wizard Staff' },
  { value: 'armor', label: 'Enchanted Armor' },
  { value: 'potion', label: 'Health Potion' },
  { value: 'amulet', label: 'Protection Amulet' },
];

const EXAMPLE_PROMPT_TEXT: Record<string, string> = {
  sword: 'Create a legendary sword that deals fire damage and has a cooldown-based special attack',
  staff: 'Create a powerful wizard staff that grants mana regeneration and can cast lightning bolts',
  armor: 'Create enchanted armor that provides damage reduction and grants a temporary shield',
  potion: 'Create a healing potion that restores health over time',
  amulet: 'Create a protection amulet that grants immunity to status effects for a short duration',
};

export const AIModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isModalOpen, isGenerating, apiKey, selectedModel, prompt, error } = useAppSelector(
    (state) => state.ai
  );
  const [localPrompt, setLocalPrompt] = useState(prompt);

  const handleClose = () => {
    dispatch(closeModal());
    dispatch(clearError());
  };

  const handleModelChange = (model: string) => {
    dispatch(setModel(model as any));
  };

  const handlePromptChange = (value: string) => {
    setLocalPrompt(value);
    dispatch(setPrompt(value));
  };

  const handleExampleChange = (example: string) => {
    if (example && EXAMPLE_PROMPT_TEXT[example]) {
      const exampleText = EXAMPLE_PROMPT_TEXT[example];
      setLocalPrompt(exampleText);
      dispatch(setPrompt(exampleText));
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      alert('Please enter and save your OpenAI API key first');
      return;
    }

    if (!localPrompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    try {
      await dispatch(generateWithAI({ prompt: localPrompt, apiKey, model: selectedModel })).unwrap();
      alert('Item generated successfully!');
      handleClose();
    } catch (error: any) {
      // Error is already in Redux state
      console.error('Generation failed:', error);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleClose}
      title="AI Item Generator"
      size="large"
      closeOnOverlayClick={!isGenerating}
    >
      <div className={styles.content}>
        <APIKeySection />

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Model Selection</h4>
          <Select
            value={selectedModel}
            options={MODEL_OPTIONS}
            onChange={handleModelChange}
            fullWidth
          />
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Prompt</h4>
          <Select
            value=""
            options={EXAMPLE_PROMPTS}
            onChange={handleExampleChange}
            placeholder="Choose an example..."
            fullWidth
          />
          <Textarea
            value={localPrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Describe the item you want to generate..."
            rows={6}
            fullWidth
            disabled={isGenerating}
          />
        </div>

        {error && (
          <div className={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className={styles.actions}>
          <Button onClick={handleClose} variant="secondary" disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !apiKey || !localPrompt.trim()}
          >
            {isGenerating ? 'Generating...' : 'Generate Item'}
          </Button>
        </div>

        {isGenerating && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Generating item with AI...</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
