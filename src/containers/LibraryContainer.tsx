import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { saveEntry, renameEntry, clearLibrary } from '../features/library/librarySlice';
import { loadItem, setTags, resetItem } from '../features/item/itemSlice';
import { setPoints, setPivot, resetGrid } from '../features/grid/gridSlice';
import { loadStatsData, resetStats } from '../features/stats/statsSlice';
import { loadLogicTree, resetLogic } from '../features/logic/logicSlice';
import { loadDrawers, resetDrawers } from '../features/drawers/drawersSlice';
import { LibraryPanel } from '../components/Library/LibraryPanel';
import { downloadJSON } from '../utils/json.utils';
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
  const entries = useAppSelector((s) =>
    Object.values(s.library.entries).sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    )
  );
  const { showToast } = useNotification();
  const [syncingMongo, setSyncingMongo] = useState(false);
  const [pushingId, setPushingId] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleLoad = (entry: LibraryEntry) => {
    const { item } = entry;
    // Reset all slices first so no stale data from the previous item remains
    dispatch(resetItem());
    dispatch(resetGrid());
    dispatch(resetStats());
    dispatch(resetLogic());
    dispatch(resetDrawers());
    // Load new item data
    dispatch(loadItem({ name: item.name ?? '', weight: item.weight ?? 0, ico: item.ico ?? '', description: item.description ?? '' }));
    if (item.tags) dispatch(setTags(item.tags));
    if (item.points) dispatch(setPoints(item.points));
    if (item.pivot) dispatch(setPivot(item.pivot));
    if (item.stats || item.charges) dispatch(loadStatsData({ stats: item.stats ?? [], charges: item.charges ?? [] }));
    if (item.logic) dispatch(loadLogicTree(item.logic));
    if (item.drawers) dispatch(loadDrawers(item.drawers));
    showToast(`"${entry.name}" loaded`, 'success');
    onClose();
  };

  const handleRename = (id: string, name: string) => {
    dispatch(renameEntry({ id, name }));
  };

  const handleSyncMongo = async () => {
    setSyncingMongo(true);
    try {
      const res = await fetch('/api/itemsV2');
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const items: Item[] = await res.json();
      // Clear library first so we always have fresh data from MongoDB
      dispatch(clearLibrary());
      for (const item of items) {
        dispatch(saveEntry({ name: item.name || 'unnamed', item }));
      }
      showToast(`Synced ${items.length} items from MongoDB`, 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      showToast(`MongoDB sync failed: ${msg}`, 'error');
    } finally {
      setSyncingMongo(false);
    }
  };

  /** Push a library entry to MongoDB (upsert by name) */
  const handlePushToDB = async (entry: LibraryEntry) => {
    setPushingId(entry.id);
    try {
      const name = entry.item.name || entry.name;
      const res = await fetch(`/api/itemsV2/${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry.item),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const data = await res.json();
      showToast(`"${name}" ${data.action} in MongoDB`, 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      showToast(`Push failed: ${msg}`, 'error');
    } finally {
      setPushingId(null);
    }
  };

  const handleExport = (entry: LibraryEntry) => {
    downloadJSON(JSON.stringify(entry.item, null, 2), `${entry.name.replace(/\s+/g, '_')}.json`);
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
            onRename={handleRename}
            onExport={handleExport}
            onSyncMongo={handleSyncMongo}
            syncingMongo={syncingMongo}
            onPushToDB={handlePushToDB}
            pushingId={pushingId}
          />
        </div>
      </aside>
    </>
  );
};
