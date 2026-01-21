import React, { useMemo } from 'react';
import classNames from 'classnames';
import { DrawerCell } from './DrawerCell';
import { DrawerConnections } from './DrawerConnections';
import type { Drawer, DrawerEditMode, CellPosition, DrawerSelectionStep } from '../../types/drawer.types';
import { GRID_SIZE } from '../../utils/constants';
import styles from './DrawerGrid.module.css';

interface DrawerGridProps {
  gridPoints: string[];
  drawers: Drawer[];
  editMode: DrawerEditMode;
  onCellClick: (x: number, y: number) => void;
  highlightedDrawerId?: string | null;
}

const DRAWER_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#a855f7'];
const CELL_SIZE = 40;
const GAP = 4;

type CellKey = 'cellTop' | 'cellBot' | 'cellLeft' | 'cellRight';
const STEP_ORDER: CellKey[] = ['cellTop', 'cellBot', 'cellLeft', 'cellRight'];

const getDrawerColor = (index: number) => DRAWER_COLORS[index % DRAWER_COLORS.length];

const isSameCell = (a: CellPosition | undefined, b: { x: number; y: number }) => {
  if (!a) return false;
  return a.x === b.x && a.y === b.y;
};

export const DrawerGrid: React.FC<DrawerGridProps> = ({
  gridPoints,
  drawers,
  editMode,
  onCellClick,
  highlightedDrawerId,
}) => {
  const getCellRole = useMemo(() => {
    return (x: number, y: number): DrawerSelectionStep => {
      const { partialDrawer } = editMode;
      if (isSameCell(partialDrawer.cellTop, { x, y })) return 'cellTop';
      if (isSameCell(partialDrawer.cellBot, { x, y })) return 'cellBot';
      if (isSameCell(partialDrawer.cellLeft, { x, y })) return 'cellLeft';
      if (isSameCell(partialDrawer.cellRight, { x, y })) return 'cellRight';
      return null;
    };
  }, [editMode.partialDrawer]);

  const gridWidth = GRID_SIZE * CELL_SIZE + (GRID_SIZE - 1) * GAP;
  const gridHeight = gridWidth;

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {Array.from({ length: GRID_SIZE }, (_, y) =>
          Array.from({ length: GRID_SIZE }, (_, x) => {
            const isGridActive = gridPoints.includes(`${x},${y}`);
            const drawerRole = editMode.isActive ? getCellRole(x, y) : null;

            return (
              <DrawerCell
                key={`${x},${y}`}
                x={x}
                y={y}
                isGridActive={isGridActive}
                drawerRole={drawerRole}
                isSelectable={editMode.isActive && editMode.currentStep !== null}
                onClick={() => onCellClick(x, y)}
              />
            );
          })
        )}
      </div>

      <svg
        className={styles.overlay}
        width={gridWidth}
        height={gridHeight}
        viewBox={`0 0 ${gridWidth} ${gridHeight}`}
      >
        {drawers.map((drawer, index) => (
          <DrawerConnections
            key={drawer.id}
            drawer={drawer}
            cellSize={CELL_SIZE}
            gap={GAP}
            color={getDrawerColor(index)}
            isHighlighted={highlightedDrawerId === drawer.id}
          />
        ))}
      </svg>

      {editMode.isActive && editMode.currentStep && (
        <div className={styles.stepIndicator}>
          <span className={styles.stepLabel}>Select:</span>
          <span className={styles.stepValue}>
            {editMode.currentStep.replace('cell', '')}
          </span>
          <div className={styles.steps}>
            {STEP_ORDER.map((step) => {
              const stepIndex = STEP_ORDER.indexOf(step);
              const currentStep = editMode.currentStep;
              const currentIndex = currentStep && STEP_ORDER.includes(currentStep as CellKey)
                ? STEP_ORDER.indexOf(currentStep as CellKey)
                : -1;
              const isCompleted = stepIndex < currentIndex;
              const isCurrent = step === currentStep;

              return (
                <div
                  key={step}
                  className={classNames(
                    styles.stepDot,
                    styles[step],
                    isCompleted && styles.completed,
                    isCurrent && styles.current
                  )}
                  title={step.replace('cell', '')}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
