import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { togglePoint, clearPoints } from '../../features/grid/gridSlice';
import { GridCell } from './GridCell';
import { GRID_SIZE } from '../../utils/constants';
import styles from './GridEditor.module.css';

export const GridEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const points = useAppSelector((state) => state.grid.points);

  const handleClear = () => {
    dispatch(clearPoints());
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Grid Points</h3>
        <button onClick={handleClear} className={styles.clearBtn}>
          Clear
        </button>
      </div>
      <div className={styles.grid}>
        {Array.from({ length: GRID_SIZE }, (_, y) =>
          Array.from({ length: GRID_SIZE }, (_, x) => {
            const isActive = points.includes(`${x},${y}`);
            return (
              <GridCell
                key={`${x},${y}`}
                x={x}
                y={y}
                isActive={isActive}
                onToggle={() => dispatch(togglePoint({ x, y }))}
              />
            );
          })
        )}
      </div>
      <div className={styles.info}>
        Active points: {points.length}
      </div>
    </div>
  );
};
