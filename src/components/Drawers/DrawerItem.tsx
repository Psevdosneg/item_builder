import React from 'react';
import { Button } from '../common/Button';
import type { Drawer } from '../../types/drawer.types';
import styles from './DrawerItem.module.css';

interface DrawerItemProps {
  drawer: Drawer;
  color: string;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: () => void;
}

export const DrawerItem: React.FC<DrawerItemProps> = ({
  drawer,
  color,
  onEdit,
  onRemove,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={styles.drawerItem}
      onMouseEnter={() => onMouseEnter?.(drawer.id)}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={styles.colorIndicator}
        style={{ backgroundColor: color }}
      />
      <div className={styles.info}>
        <div className={styles.type}>{drawer.type || '(no type)'}</div>
        <div className={styles.cells}>
          <span className={styles.cellInfo}>
            <span className={styles.cellLabel} style={{ color: '#ff6b6b' }}>T:</span>
            <span className={styles.cellValue}>{drawer.cellTop.x},{drawer.cellTop.y}</span>
          </span>
          <span className={styles.cellInfo}>
            <span className={styles.cellLabel} style={{ color: '#4ecdc4' }}>B:</span>
            <span className={styles.cellValue}>{drawer.cellBot.x},{drawer.cellBot.y}</span>
          </span>
          <span className={styles.cellInfo}>
            <span className={styles.cellLabel} style={{ color: '#ffe66d' }}>L:</span>
            <span className={styles.cellValue}>{drawer.cellLeft.x},{drawer.cellLeft.y}</span>
          </span>
          <span className={styles.cellInfo}>
            <span className={styles.cellLabel} style={{ color: '#a855f7' }}>R:</span>
            <span className={styles.cellValue}>{drawer.cellRight.x},{drawer.cellRight.y}</span>
          </span>
        </div>
      </div>
      <div className={styles.actions}>
        <Button
          size="small"
          variant="secondary"
          onClick={() => onEdit(drawer.id)}
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="danger"
          onClick={() => onRemove(drawer.id)}
        >
          ×
        </Button>
      </div>
    </div>
  );
};
