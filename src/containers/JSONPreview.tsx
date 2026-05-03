import React, { useMemo, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { generateItemFromState, generateJSONString, copyJSONToClipboard, downloadJSON } from '../utils/json.utils';
import { useNotification } from '../contexts/NotificationContext';
import { Button } from '../components/common/Button';
import styles from './JSONPreview.module.css';

export const JSONPreview: React.FC = () => {
  const state = useAppSelector((state) => state);
  const { showToast } = useNotification();
  const [pushing, setPushing] = useState(false);

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

  const handlePushToDB = async () => {
    const item = generateItemFromState(state);
    const name = item.name?.trim();
    if (!name) { showToast('Item has no name — cannot push', 'error'); return; }
    setPushing(true);
    try {
      const res = await fetch(`/api/itemsV2/${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const data = await res.json();
      showToast(`"${name}" ${data.action} in MongoDB`, 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      showToast(`Push failed: ${msg}`, 'error');
    } finally {
      setPushing(false);
    }
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
          <Button size="small" variant="primary" onClick={handlePushToDB} disabled={pushing}>
            {pushing ? 'Pushing…' : '↑ MongoDB'}
          </Button>
        </div>
      </div>
      <pre className={styles.preview}>{jsonString}</pre>
    </div>
  );
};
