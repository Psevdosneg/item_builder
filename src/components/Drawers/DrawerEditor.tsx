import React from 'react';
import { DrawerGridSimple } from './DrawerGridSimple';
import { Select } from '../common/Select';
import type { SelectOption } from '../common/Select';
import { Button } from '../common/Button';
import type { DrawerEditMode } from '../../types/drawer.types';
import styles from './DrawerEditor.module.css';

const DRAWER_TYPE_OPTIONS: SelectOption[] = [
  'multicast', 'damage', 'heal', 'cooldown', 'collectedTime', 'spawnedCrips',
  'addedHeal', 'givenMadness', 'givenRegeneration', 'givenShield', 'givenMana',
  'givenAmmo', 'givenBurn', 'givenHaste', 'givenBleed', 'givenRage',
  'givenImpulse', 'sellPrice', 'income', 'givenMaxHealth', 'givenPoison',
  'givenGold', 'givenSlow', 'givenFreeze',
].map((t) => ({ value: t, label: t }));

type CellKey = 'cellTop' | 'cellBot' | 'cellLeft' | 'cellRight';

interface DrawerEditorProps {
  gridPoints: string[];
  editMode: DrawerEditMode;
  onTypeChange: (type: string) => void;
  onCellSelect: (cellKey: CellKey, x: number, y: number) => void;
  onClear: () => void;
  onCancel: () => void;
  onSave: () => void;
}

const ORIENTATIONS: { key: CellKey; label: string; rotation: string }[] = [
  { key: 'cellTop', label: 'Top (0°)', rotation: '0deg' },
  { key: 'cellRight', label: 'Right (90°)', rotation: '90deg' },
  { key: 'cellBot', label: 'Bottom (180°)', rotation: '180deg' },
  { key: 'cellLeft', label: 'Left (270°)', rotation: '270deg' },
];

export const DrawerEditor: React.FC<DrawerEditorProps> = ({
  gridPoints,
  editMode,
  onTypeChange,
  onCellSelect,
  onClear,
  onCancel,
  onSave,
}) => {
  const { partialDrawer, drawerId } = editMode;
  const isEditing = drawerId !== null;

  const allCellsSelected =
    partialDrawer.cellTop &&
    partialDrawer.cellBot &&
    partialDrawer.cellLeft &&
    partialDrawer.cellRight;

  const canSave = partialDrawer.type !== undefined && allCellsSelected;

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {isEditing ? 'Edit Drawer' : 'New Drawer'}
        </h3>
        <div className={styles.headerActions}>
          <Button size="small" variant="secondary" onClick={onClear}>
            Clear All
          </Button>
        </div>
      </div>

      <div className={styles.typeRow}>
        <label>Drawer Type</label>
        <Select
          value={partialDrawer.type || 'multicast'}
          options={DRAWER_TYPE_OPTIONS}
          onChange={onTypeChange}
        />
      </div>

      <div className={styles.gridsContainer}>
        {ORIENTATIONS.map(({ key, label, rotation }) => {
          const selectedCell = partialDrawer[key];
          return (
            <div key={key} className={styles.gridWrapper}>
              <div className={styles.gridLabel}>
                <span className={styles.orientationName}>{label}</span>
                {selectedCell && (
                  <span className={styles.selectedCoord}>
                    ({selectedCell.x}, {selectedCell.y})
                  </span>
                )}
              </div>
              <DrawerGridSimple
                gridPoints={gridPoints}
                rotation={rotation}
                selectedCell={selectedCell}
                cellKey={key}
                onCellClick={(x, y) => onCellSelect(key, x, y)}
              />
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!canSave}>
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
};
