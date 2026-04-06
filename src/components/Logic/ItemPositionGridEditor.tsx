import React, { useState } from 'react';
import classNames from 'classnames';
import { useAppSelector } from '../../app/hooks';
import { GRID_SIZE } from '../../utils/constants';
import styles from './ItemPositionGridEditor.module.css';

interface Point { x: number; y: number }

interface ItemPositionData {
  relative: string;
  points: Point[];
}

interface ItemPositionGridEditorProps {
  data: ItemPositionData;
  onChange: (data: ItemPositionData) => void;
}

const VIEW = GRID_SIZE; // 8×8 viewport

export const ItemPositionGridEditor: React.FC<ItemPositionGridEditorProps> = ({ data, onChange }) => {
  const gridPoints = useAppSelector((state) => state.grid.points);
  const itemShape = new Set(gridPoints);

  // Offset starts at -4 so item shape (0…7) is visible right away
  const [offsetX, setOffsetX] = useState(-Math.floor(VIEW / 2));
  const [offsetY, setOffsetY] = useState(-Math.floor(VIEW / 2));

  const points = data.points ?? [];

  const isSelected = (x: number, y: number) =>
    points.some((p) => p.x === x && p.y === y);

  const handleCellClick = (x: number, y: number) => {
    if (itemShape.has(`${x},${y}`)) return;
    const alreadySelected = isSelected(x, y);
    const newPoints = alreadySelected
      ? points.filter((p) => !(p.x === x && p.y === y))
      : [...points, { x, y }];
    onChange({ ...data, points: newPoints });
  };

  const handleClear = () => onChange({ ...data, points: [] });

  const pan = (dx: number, dy: number) => {
    setOffsetX((v) => v + dx);
    setOffsetY((v) => v + dy);
  };

  const resetView = () => {
    setOffsetX(-Math.floor(VIEW / 2));
    setOffsetY(-Math.floor(VIEW / 2));
  };

  const xMax = offsetX + VIEW - 1;
  const yMax = offsetY + VIEW - 1;

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <label className={styles.label}>relative</label>
        <input
          className={styles.relativeInput}
          type="text"
          value={data.relative ?? ''}
          onChange={(e) => onChange({ ...data, relative: e.target.value })}
          placeholder="e.g. ally, enemy…"
        />
      </div>

      {/* Pan controls */}
      <div className={styles.navRow}>
        <button className={styles.navBtn} type="button" onClick={() => pan(-1, 0)}>◀</button>
        <button className={styles.navBtn} type="button" onClick={() => pan(0, -1)}>▲</button>
        <button className={styles.navBtnCenter} type="button" onClick={resetView} title="Reset view">⌂</button>
        <button className={styles.navBtn} type="button" onClick={() => pan(0, 1)}>▼</button>
        <button className={styles.navBtn} type="button" onClick={() => pan(1, 0)}>▶</button>
        <span className={styles.viewRange}>x:{offsetX}…{xMax} &nbsp; y:{offsetY}…{yMax}</span>
        <button className={styles.clearBtn} type="button" onClick={handleClear} disabled={points.length === 0}>
          Clear
        </button>
      </div>

      {/* Grid */}
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${VIEW}, 1fr)` }}
      >
        {Array.from({ length: VIEW }, (_, row) => {
          const y = offsetY + row;
          return Array.from({ length: VIEW }, (_, col) => {
            const x = offsetX + col;
            const selected = isSelected(x, y);
            const isShape = !selected && itemShape.has(`${x},${y}`);
            const isOrigin = x === 0 && y === 0;
            return (
              <div
                key={`${x},${y}`}
                className={classNames(
                  styles.cell,
                  selected && styles.active,
                  isShape && styles.shape,
                  isOrigin && !selected && !isShape && styles.origin
                )}
                onClick={() => handleCellClick(x, y)}
                title={`x:${x} y:${y}`}
              />
            );
          });
        })}
      </div>

      <div className={styles.info}>
        {points.length === 0
          ? 'No points selected'
          : points.map((p) => `(${p.x},${p.y})`).join('  ')}
      </div>
    </div>
  );
};
