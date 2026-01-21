import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setApiKey, saveApiKeyToStorage, removeApiKeyFromStorage } from '../../features/ai/aiSlice';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import styles from './APIKeySection.module.css';

export const APIKeySection: React.FC = () => {
  const dispatch = useAppDispatch();
  const storedApiKey = useAppSelector((state) => state.ai.apiKey);
  const [inputValue, setInputValue] = useState(storedApiKey || '');
  const [showKey, setShowKey] = useState(false);

  const hasStoredKey = !!storedApiKey;

  const handleSave = () => {
    if (inputValue.trim()) {
      dispatch(setApiKey(inputValue.trim()));
      dispatch(saveApiKeyToStorage(inputValue.trim()));
      alert('API key saved successfully!');
    }
  };

  const handleRemove = () => {
    if (window.confirm('Remove stored API key?')) {
      dispatch(setApiKey(null));
      dispatch(removeApiKeyFromStorage());
      setInputValue('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>OpenAI API Key</h4>
        {hasStoredKey && (
          <span className={styles.status}>
            ✓ Saved
          </span>
        )}
      </div>

      <p className={styles.description}>
        Your API key is stored locally in your browser and never sent anywhere except to OpenAI's API.
      </p>

      <div className={styles.inputGroup}>
        <Input
          type={showKey ? 'text' : 'password'}
          placeholder="sk-..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          fullWidth
        />
        <Button
          size="small"
          variant="secondary"
          onClick={() => setShowKey(!showKey)}
        >
          {showKey ? 'Hide' : 'Show'}
        </Button>
      </div>

      <div className={styles.actions}>
        <Button size="small" onClick={handleSave} disabled={!inputValue.trim()}>
          Save Key
        </Button>
        {hasStoredKey && (
          <Button size="small" variant="danger" onClick={handleRemove}>
            Remove Key
          </Button>
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.infoText}>
          Don't have an API key?{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Get one from OpenAI
          </a>
        </p>
      </div>
    </div>
  );
};
