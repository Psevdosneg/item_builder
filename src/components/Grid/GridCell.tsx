import React from 'react';
import classNames from 'classnames';
import styles from './GridCell.module.css';

interface GridCellProps {
  x: number;
  y: number;
  isActive: boolean;
  onToggle: () => void;
}

export const GridCell: React.FC<GridCellProps> = ({ x, y, isActive, onToggle }) => {
  return (
    <div
      className={classNames(styles.cell, isActive && styles.active)}
      onClick={onToggle}
      data-x={x}
      data-y={y}
    />
  );
};
