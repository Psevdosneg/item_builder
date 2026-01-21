import React from 'react';
import classNames from 'classnames';
import type { CellPosition } from '../../types/drawer.types';
import { GRID_SIZE } from '../../utils/constants';
import styles from './DrawerGridSimple.module.css';

type CellKey = 'cellTop' | 'cellBot' | 'cellLeft' | 'cellRight';

interface DrawerGridSimpleProps {
  gridPoints: string[];
  rotation: string;
  selectedCell: CellPosition | undefined;
  cellKey: CellKey;
  onCellClick: (x: number, y: number) => void;
}

const CELL_COLORS: Record<CellKey, string> = {
  cellTop: '#ff6b6b',
  cellRight: '#a855f7',
  cellBot: '#4ecdc4',
  cellLeft: '#ffe66d',
};

export const DrawerGridSimple: React.FC<DrawerGridSimpleProps> = ({
  gridPoints,
  rotation,
  selectedCell,
  cellKey,
  onCellClick,
}) => {
  const isSelected = (x: number, y: number) => {
    return selectedCell?.x === x && selectedCell?.y === y;
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.grid}
        style={{ transform: `rotate(${rotation})` }}
      >
        {Array.from({ length: GRID_SIZE }, (_, y) =>
          Array.from({ length: GRID_SIZE }, (_, x) => {
            const isGridActive = gridPoints.includes(`${x},${y}`);
            const isCellSelected = isSelected(x, y);

            return (
              <div
                key={`${x},${y}`}
                className={classNames(
                  styles.cell,
                  isGridActive && styles.active,
                  isCellSelected && styles.selected
                )}
                style={isCellSelected ? {
                  backgroundColor: CELL_COLORS[cellKey],
                  borderColor: CELL_COLORS[cellKey],
                } : undefined}
                onClick={() => onCellClick(x, y)}
                data-x={x}
                data-y={y}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
