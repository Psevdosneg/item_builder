import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { loadItem } from './features/item/itemSlice';
import { setPoints, setPivot } from './features/grid/gridSlice';
import { loadStats } from './features/stats/statsSlice';
import { loadLogicTree } from './features/logic/logicSlice';
import { loadDrawers } from './features/drawers/drawersSlice';
import { BasicInfoPanel } from './containers/BasicInfoPanel';
import { StatsContainer } from './containers/StatsContainer';
import { LogicContainer } from './containers/LogicContainer';
import { DrawersContainer } from './containers/DrawersContainer';
import { JSONPreview } from './containers/JSONPreview';
import { Button } from './components/common/Button';
import { generateJSONString, copyJSONToClipboard } from './utils/json.utils';
import styles from './App.module.css';

function App() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S: Copy JSON to clipboard
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        try {
          const jsonString = generateJSONString(state);
          await copyJSONToClipboard(jsonString);
          alert('JSON copied to clipboard!');
        } catch (error) {
          alert('Failed to copy JSON');
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
          navigator.clipboard.readText().then((text) => {
            if (text.trim()) {
              importJSONData(text, 'JSON from clipboard');
            }
          }).catch(() => {
            // Ignore clipboard errors for paste shortcut
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state, dispatch]);

  const importJSONData = (jsonString: string, source: string) => {
    try {
      const data = JSON.parse(jsonString);

      // Load imported data into Redux
      if (data.name) {
        dispatch(loadItem({
          name: data.name,
          weight: data.weight || 0,
          ico: data.ico || '',
          description: data.description || '',
          tags: data.tags || [],
        }));
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
        const defaultStats = {
          price: data.stats?.find((s: any) => s.name === 'price')?.value || 0,
          level: data.stats?.find((s: any) => s.name === 'level')?.value || 0,
          maxLevel: data.stats?.find((s: any) => s.name === 'maxLevel')?.value || 0,
          rarity: data.stats?.find((s: any) => s.name === 'rarity')?.value || 0,
        };

        const customStats = data.stats?.filter(
          (s: any) => !['price', 'level', 'maxLevel', 'rarity'].includes(s.name)
        ) || [];

        dispatch(loadStats({
          defaultStats,
          customStats,
          charges: data.charges || [],
        }));
      }

      if (data.logic) {
        dispatch(loadLogicTree(data.logic));
      }

      if (data.drawers && data.drawers.length > 0) {
        dispatch(loadDrawers(data.drawers));
      }

      alert(`${source} imported successfully!`);
    } catch (error) {
      console.error('Import error:', error);
      alert(`Failed to import ${source.toLowerCase()}. Invalid JSON format.`);
    }
  };

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

  const handlePasteJSON = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        alert('Clipboard is empty');
        return;
      }
      importJSONData(text, 'JSON from clipboard');
    } catch (error) {
      console.error('Paste error:', error);
      alert('Failed to read clipboard. Please allow clipboard access.');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all data? This cannot be undone.')) {
      window.location.reload();
    }
  };

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
