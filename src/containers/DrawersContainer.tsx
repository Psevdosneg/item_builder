import React, { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  removeDrawer,
  startEditMode,
  setDrawerType,
  setCellForStep,
  clearCellSelections,
  cancelEditMode,
  finishEditMode,
} from '../features/drawers/drawersSlice';
import type { DrawerSelectionStep } from '../types/drawer.types';
import { DrawerGrid } from '../components/Drawers/DrawerGrid';
import { DrawersList } from '../components/Drawers/DrawersList';
import { DrawerEditor } from '../components/Drawers/DrawerEditor';
import styles from './DrawersContainer.module.css';

export const DrawersContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const drawers = useAppSelector((state) => state.drawers.drawers);
  const editMode = useAppSelector((state) => state.drawers.editMode);
  const gridPoints = useAppSelector((state) => state.grid.points);

  const [highlightedDrawerId, setHighlightedDrawerId] = useState<string | null>(null);

  const handleAddDrawer = useCallback(() => {
    dispatch(startEditMode({}));
  }, [dispatch]);

  const handleEditDrawer = useCallback(
    (id: string) => {
      dispatch(startEditMode({ drawerId: id }));
    },
    [dispatch]
  );

  const handleRemoveDrawer = useCallback(
    (id: string) => {
      dispatch(removeDrawer(id));
    },
    [dispatch]
  );

  const handleTypeChange = useCallback(
    (type: string) => {
      dispatch(setDrawerType(type));
    },
    [dispatch]
  );

  const handleCellSelect = useCallback(
    (cellKey: DrawerSelectionStep, x: number, y: number) => {
      if (editMode.isActive && cellKey) {
        dispatch(setCellForStep({ step: cellKey, cell: { x, y } }));
      }
    },
    [dispatch, editMode.isActive]
  );

  const handleClear = useCallback(() => {
    dispatch(clearCellSelections());
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    dispatch(cancelEditMode());
  }, [dispatch]);

  const handleSave = useCallback(() => {
    dispatch(finishEditMode());
  }, [dispatch]);

  const handleHover = useCallback((id: string | null) => {
    setHighlightedDrawerId(id);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Drawers</h2>
      </div>

      <div className={styles.content}>
        {editMode.isActive ? (
          <DrawerEditor
            gridPoints={gridPoints}
            editMode={editMode}
            onTypeChange={handleTypeChange}
            onCellSelect={handleCellSelect}
            onClear={handleClear}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        ) : (
          <div className={styles.gridSection}>
            <div className={styles.gridWrapper}>
              <DrawerGrid
                gridPoints={gridPoints}
                drawers={drawers}
                editMode={editMode}
                onCellClick={() => {}}
                highlightedDrawerId={highlightedDrawerId}
              />
            </div>
            <div className={styles.listWrapper}>
              <DrawersList
                drawers={drawers}
                onAdd={handleAddDrawer}
                onEdit={handleEditDrawer}
                onRemove={handleRemoveDrawer}
                onHover={handleHover}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
