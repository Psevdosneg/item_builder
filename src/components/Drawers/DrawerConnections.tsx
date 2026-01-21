import React from 'react';
import classNames from 'classnames';
import type { Drawer, CellPosition } from '../../types/drawer.types';
import styles from './DrawerConnections.module.css';

interface DrawerConnectionsProps {
  drawer: Drawer;
  cellSize: number;
  gap: number;
  color: string;
  isHighlighted?: boolean;
}

const getCellCenter = (
  pos: CellPosition,
  cellSize: number,
  gap: number
): { cx: number; cy: number } => {
  const cx = pos.x * (cellSize + gap) + cellSize / 2;
  const cy = pos.y * (cellSize + gap) + cellSize / 2;
  return { cx, cy };
};

export const DrawerConnections: React.FC<DrawerConnectionsProps> = ({
  drawer,
  cellSize,
  gap,
  color,
  isHighlighted = false,
}) => {
  const topCenter = getCellCenter(drawer.cellTop, cellSize, gap);
  const botCenter = getCellCenter(drawer.cellBot, cellSize, gap);
  const leftCenter = getCellCenter(drawer.cellLeft, cellSize, gap);
  const rightCenter = getCellCenter(drawer.cellRight, cellSize, gap);

  return (
    <g>
      {/* Top to Bot line */}
      <line
        x1={topCenter.cx}
        y1={topCenter.cy}
        x2={botCenter.cx}
        y2={botCenter.cy}
        stroke={color}
        className={classNames(styles.line, isHighlighted && styles.highlighted)}
      />
      {/* Left to Right line */}
      <line
        x1={leftCenter.cx}
        y1={leftCenter.cy}
        x2={rightCenter.cx}
        y2={rightCenter.cy}
        stroke={color}
        className={classNames(styles.line, isHighlighted && styles.highlighted)}
      />
    </g>
  );
};
