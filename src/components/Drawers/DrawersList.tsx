import React from 'react';
import { DrawerItem } from './DrawerItem';
import { Button } from '../common/Button';
import type { Drawer } from '../../types/drawer.types';
import styles from './DrawersList.module.css';

interface DrawersListProps {
  drawers: Drawer[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onHover?: (id: string | null) => void;
  disabled?: boolean;
}

const DRAWER_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#a855f7'];
const getDrawerColor = (index: number) => DRAWER_COLORS[index % DRAWER_COLORS.length];

export const DrawersList: React.FC<DrawersListProps> = ({
  drawers,
  onAdd,
  onEdit,
  onRemove,
  onHover,
  disabled = false,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Drawers ({drawers.length})</span>
        <Button
          size="small"
          onClick={onAdd}
          disabled={disabled}
        >
          + Add Drawer
        </Button>
      </div>

      {drawers.length === 0 ? (
        <div className={styles.empty}>
          No drawers yet. Click "Add Drawer" to create one.
        </div>
      ) : (
        <div className={styles.list}>
          {drawers.map((drawer, index) => (
            <DrawerItem
              key={drawer.id}
              drawer={drawer}
              color={getDrawerColor(index)}
              onEdit={onEdit}
              onRemove={onRemove}
              onMouseEnter={onHover ? (id) => onHover(id) : undefined}
              onMouseLeave={onHover ? () => onHover(null) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
