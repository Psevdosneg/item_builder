import React from 'react';
import classNames from 'classnames';
import type { DrawerSelectionStep } from '../../types/drawer.types';
import styles from './DrawerCell.module.css';

interface DrawerCellProps {
  x: number;
  y: number;
  isGridActive: boolean;
  drawerRole: DrawerSelectionStep;
  isSelectable: boolean;
  onClick: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  cellTop: 'T',
  cellBot: 'B',
  cellLeft: 'L',
  cellRight: 'R',
};

export const DrawerCell: React.FC<DrawerCellProps> = ({
  x,
  y,
  isGridActive,
  drawerRole,
  isSelectable,
  onClick,
}) => {
  return (
    <div
      className={classNames(
        styles.cell,
        isGridActive && styles.active,
        isSelectable && styles.selectable,
        drawerRole && styles[drawerRole]
      )}
      onClick={onClick}
      data-x={x}
      data-y={y}
    >
      {drawerRole && (
        <span className={styles.roleIndicator}>
          {ROLE_LABELS[drawerRole]}
        </span>
      )}
    </div>
  );
};
