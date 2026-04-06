import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { saveEntry, removeEntry, renameEntry } from '../features/library/librarySlice';
import { loadItem, setTags } from '../features/item/itemSlice';
import { setPoints, setPivot } from '../features/grid/gridSlice';
import { loadStatsData } from '../features/stats/statsSlice';
import { loadLogicTree } from '../features/logic/logicSlice';
import { loadDrawers } from '../features/drawers/drawersSlice';
import { LibraryPanel } from '../components/Library/LibraryPanel';
import { generateItemFromState, downloadJSON } from '../utils/json.utils';
import { useNotification } from '../contexts/NotificationContext';
import type { LibraryEntry } from '../features/library/librarySlice';
import type { Item } from '../types/item.types';
import styles from './LibraryContainer.module.css';

interface LibraryContainerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LibraryContainer: React.FC<LibraryContainerProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s);
  const entries = useAppSelector((s) =>
    Object.values(s.library.entries).sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    )
  );
  const { showToast, showConfirm } = useNotification();
  const [loadingExamples, setLoadingExamples] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSaveCurrent = () => {
    const item = generateItemFromState(state);
    const name = item.name?.trim() || 'Unnamed Item';
    dispatch(saveEntry({ name, item }));
    showToast(`"${name}" saved to library`, 'success');
  };

  const handleLoad = (entry: LibraryEntry) => {
    const { item } = entry;
    showConfirm(
      `Load "${entry.name}"? Current work will be replaced.`,
      () => {
        dispatch(loadItem({ name: item.name ?? '', weight: item.weight ?? 0, ico: item.ico ?? '', description: item.description ?? '' }));
        if (item.tags) dispatch(setTags(item.tags));
        if (item.points) dispatch(setPoints(item.points));
        if (item.pivot) dispatch(setPivot(item.pivot));
        if (item.stats || item.charges) dispatch(loadStatsData({ stats: item.stats ?? [], charges: item.charges ?? [] }));
        if (item.logic) dispatch(loadLogicTree(item.logic));
        if (item.drawers) dispatch(loadDrawers(item.drawers));
        showToast(`"${entry.name}" loaded`, 'success');
        onClose();
      },
      { confirmText: 'Load', variant: 'primary' }
    );
  };

  const handleDelete = (id: string) => {
    const entry = state.library.entries[id];
    showConfirm(
      `Delete "${entry?.name ?? 'this item'}" from library?`,
      () => { dispatch(removeEntry(id)); showToast('Deleted from library', 'success'); },
      { confirmText: 'Delete', variant: 'danger' }
    );
  };

  const handleRename = (id: string, name: string) => {
    dispatch(renameEntry({ id, name }));
  };

  const handleExport = (entry: LibraryEntry) => {
    downloadJSON(JSON.stringify(entry.item, null, 2), `${entry.name.replace(/\s+/g, '_')}.json`);
  };

  const handleLoadExamples = async () => {
    setLoadingExamples(true);
    try {
      const indexRes = await fetch('/examples/index.json');
      const index: { name: string; file: string }[] = await indexRes.json();
      for (const { name, file } of index) {
        const res = await fetch(`/examples/items/${file}`);
        const item: Item = await res.json();
        dispatch(saveEntry({ name, item }));
      }
      showToast(`Loaded ${index.length} example items into library`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to load examples', 'error');
    } finally {
      setLoadingExamples(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>
            Library
            <span className={styles.sidebarCount}>{entries.length}</span>
          </span>
          <button className={styles.closeBtn} type="button" onClick={onClose} title="Close">✕</button>
        </div>

        <div className={styles.sidebarContent}>
          <LibraryPanel
            entries={entries}
            onLoad={handleLoad}
            onDelete={handleDelete}
            onRename={handleRename}
            onExport={handleExport}
            onSaveCurrent={handleSaveCurrent}
            onLoadExamples={handleLoadExamples}
            loadingExamples={loadingExamples}
          />
        </div>
      </aside>
    </>
  );
};
