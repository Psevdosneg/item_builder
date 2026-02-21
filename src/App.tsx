import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { loadItem, setTags } from './features/item/itemSlice';
import { AVAILABLE_TAGS } from './utils/tags';
import { setPoints, setPivot } from './features/grid/gridSlice';
import { loadStatsData } from './features/stats/statsSlice';
import { loadLogicTree } from './features/logic/logicSlice';
import { loadDrawers } from './features/drawers/drawersSlice';
import { BasicInfoPanel } from './containers/BasicInfoPanel';
import { StatsContainer } from './containers/StatsContainer';
import { LogicContainer } from './containers/LogicContainer';
import { DrawersContainer } from './containers/DrawersContainer';
import { JSONPreview } from './containers/JSONPreview';
import { Button } from './components/common/Button';
import { generateJSONString, copyJSONToClipboard } from './utils/json.utils';
import { useNotification } from './contexts/NotificationContext';
import styles from './App.module.css';

function App() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast, showConfirm } = useNotification();

  const importJSONData = useCallback((jsonString: string, source: string) => {
    try {
      const data = JSON.parse(jsonString);

      // Load imported data into Redux
      if (data.name) {
        dispatch(loadItem({
          name: data.name,
          weight: data.weight || 0,
          ico: data.ico || '',
          description: data.description || '',
        }));
      }

      // Load tags separately (converts string[] to Tag[])
      // Normalize tags to match AVAILABLE_TAGS (case-insensitive)
      if (data.tags && Array.isArray(data.tags)) {
        const normalizedTags = data.tags
          .map((tag: unknown) => {
            if (typeof tag !== 'string') return null;
            const lowerTag = tag.toLowerCase();
            return AVAILABLE_TAGS.find(t => t.toLowerCase() === lowerTag) || null;
          })
          .filter((tag: string | null): tag is string => tag !== null);
        dispatch(setTags(normalizedTags));
      }

      if (data.points) {
        // Filter out null/undefined points and ensure they have x,y properties
        const validPoints = data.points
          .filter((p: any) => p && typeof p.x === 'number' && typeof p.y === 'number')
          .map((p: any) => ({ x: p.x, y: p.y }));
        dispatch(setPoints(validPoints));
      }

      if (data.pivot) {
        dispatch(setPivot(data.pivot));
      }

      if (data.stats || data.charges) {
        dispatch(loadStatsData({
          stats: data.stats || [],
          charges: data.charges || [],
        }));
      }

      if (data.logic) {
        dispatch(loadLogicTree(data.logic));
      }

      if (data.drawers && data.drawers.length > 0) {
        dispatch(loadDrawers(data.drawers));
      }

      showToast(`${source} imported successfully!`, 'success');
    } catch (error) {
      console.error('Import error:', error);
      showToast(`Failed to import ${source.toLowerCase()}. Invalid JSON format.`, 'error');
    }
  }, [dispatch, showToast]);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      importJSONData(event.target?.result as string, 'File');
    };

    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handlePasteJSON = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        showToast('Clipboard is empty', 'info');
        return;
      }
      importJSONData(text, 'JSON from clipboard');
    } catch (error) {
      console.error('Paste error:', error);
      showToast('Failed to read clipboard. Please allow clipboard access.', 'error');
    }
  }, [importJSONData, showToast]);

  const handleClearAll = useCallback(() => {
    showConfirm(
      'Clear all data? This cannot be undone.',
      () => window.location.reload(),
      { confirmText: 'Clear', variant: 'danger' }
    );
  }, [showConfirm]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S: Copy JSON to clipboard
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        try {
          const jsonString = generateJSONString(state);
          await copyJSONToClipboard(jsonString);
          showToast('JSON copied to clipboard!', 'success');
        } catch {
          showToast('Failed to copy JSON', 'error');
        }
      }

      // Ctrl+O or Cmd+O: Open file import dialog
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
      }

      // Ctrl+V or Cmd+V: Paste JSON from clipboard (only if not in input/textarea)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement;

        if (!isInputFocused) {
          e.preventDefault();
          handlePasteJSON();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state, showToast, handlePasteJSON]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Game Item Builder</h1>
        <p className={styles.subtitle}>React + TypeScript + Redux Toolkit</p>
      </header>

      <div className={styles.content}>
        <div className={styles.actionsBar}>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Import File (Ctrl+O)
          </Button>
          <Button variant="secondary" onClick={handlePasteJSON}>
            Paste JSON (Ctrl+V)
          </Button>
          <Button variant="secondary">
            Load Template
          </Button>
          <Button variant="danger" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileImport}
          style={{ display: 'none' }}
        />

        <div className={styles.mainGrid}>
          <BasicInfoPanel />
          <JSONPreview />
        </div>

        <StatsContainer />
        <DrawersContainer />
        <LogicContainer />
      </div>
    </div>
  );
}

export default App;
