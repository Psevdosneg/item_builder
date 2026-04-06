import React, { useState, useEffect } from 'react';
import styles from './LevelDataEditor.module.css';

export interface LevelEntry {
  level: number;
  data: unknown;
}

interface LevelDataEditorProps {
  levels: LevelEntry[];
  onChange: (levels: LevelEntry[]) => void;
  /** Optional custom renderer for each level's inner data. Replaces the JSON textarea. */
  renderLevelContent?: (
    data: unknown,
    onDataChange: (newData: unknown) => void
  ) => React.ReactNode;
}

export const LevelDataEditor: React.FC<LevelDataEditorProps> = ({ levels, onChange, renderLevelContent }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [localTexts, setLocalTexts] = useState<string[]>(
    () => levels.map((l) => JSON.stringify(l.data, null, 2))
  );

  // Sync local texts when levels array length changes (add/remove from outside)
  useEffect(() => {
    setLocalTexts(levels.map((l) => JSON.stringify(l.data, null, 2)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels.length]);

  const handleTextChange = (index: number, text: string) => {
    const newTexts = [...localTexts];
    newTexts[index] = text;
    setLocalTexts(newTexts);

    try {
      const parsed: unknown = JSON.parse(text);
      const newLevels = levels.map((l, i) =>
        i === index ? { ...l, data: parsed } : l
      );
      onChange(newLevels);
    } catch {
      // Invalid JSON — don't update parent yet
    }
  };

  const handleLevelNumberChange = (index: number, value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) return;
    const newLevels = levels.map((l, i) => (i === index ? { ...l, level: num } : l));
    onChange(newLevels);
  };


  const handleRemove = (index: number) => {
    const newLevels = levels.filter((_, i) => i !== index);
    const newTexts = localTexts.filter((_, i) => i !== index);
    setLocalTexts(newTexts);
    onChange(newLevels);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.header}
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className={`${styles.toggleArrow} ${isCollapsed ? styles.collapsed : ''}`}>
          &#x25BC;
        </span>
        <span className={styles.title}>Level Data</span>
        <span className={styles.count}>{levels.length} level{levels.length !== 1 ? 's' : ''}</span>
      </button>

      {!isCollapsed && (
        <>
          <div className={styles.list}>
            {levels.length === 0 && (
              <div className={styles.empty}>No levels defined</div>
            )}
            {levels.map((entry, i) => (
              <div key={i} className={styles.entry}>
                <div className={styles.entryHeader}>
                  <span className={styles.levelLabel}>L</span>
                  <input
                    className={styles.levelInput}
                    type="number"
                    value={entry.level}
                    onChange={(e) => handleLevelNumberChange(i, e.target.value)}
                    min={0}
                  />
                  <button
                    className={styles.removeBtn}
                    type="button"
                    onClick={() => handleRemove(i)}
                    title="Remove level"
                  >
                    ✕
                  </button>
                </div>
                {renderLevelContent ? (
                  <div className={styles.customContent}>
                    {renderLevelContent(entry.data, (newData) => {
                      const newLevels = levels.map((l, li) =>
                        li === i ? { ...l, data: newData } : l
                      );
                      const newTexts = [...localTexts];
                      newTexts[i] = JSON.stringify(newData, null, 2);
                      setLocalTexts(newTexts);
                      onChange(newLevels);
                    })}
                  </div>
                ) : (
                  <textarea
                    className={styles.dataTextarea}
                    value={localTexts[i] ?? ''}
                    onChange={(e) => handleTextChange(i, e.target.value)}
                    rows={4}
                    spellCheck={false}
                  />
                )}
              </div>
            ))}
          </div>

        </>
      )}
    </div>
  );
};
