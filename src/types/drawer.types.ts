export interface CellPosition {
  x: number;
  y: number;
}

export interface Drawer {
  id: string;
  type: string;
  cellTop: CellPosition;
  cellBot: CellPosition;
  cellLeft: CellPosition;
  cellRight: CellPosition;
}

export type DrawerSelectionStep = 'cellTop' | 'cellBot' | 'cellLeft' | 'cellRight' | null;

export interface DrawerEditMode {
  isActive: boolean;
  drawerId: string | null;
  currentStep: DrawerSelectionStep;
  partialDrawer: Partial<Omit<Drawer, 'id'>>;
}
