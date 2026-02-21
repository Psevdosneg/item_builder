import React, { useMemo } from 'react';
import { useAppSelector } from '../app/hooks';
import { generateJSONString, copyJSONToClipboard, downloadJSON } from '../utils/json.utils';
import { useNotification } from '../contexts/NotificationContext';
import { Button } from '../components/common/Button';
import styles from './JSONPreview.module.css';

export const JSONPreview: React.FC = () => {
  const state = useAppSelector((state) => state);
  const { showToast } = useNotification();

  const jsonString = useMemo(() => {
    return generateJSONString(state);
  }, [state]);

  const handleCopy = async () => {
    try {
      await copyJSONToClipboard(jsonString);
      showToast('Copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const handleDownload = () => {
    const itemName = state.item.name || 'item';
    downloadJSON(jsonString, `${itemName}.json`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>JSON Preview</h2>
        <div className={styles.actions}>
          <Button size="small" onClick={handleCopy}>
            Copy
          </Button>
          <Button size="small" variant="secondary" onClick={handleDownload}>
            Download
          </Button>
        </div>
      </div>
      <pre className={styles.preview}>{jsonString}</pre>
    </div>
  );
};
