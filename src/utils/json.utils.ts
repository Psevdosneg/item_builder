import type { RootState } from '../app/store';
import type { Item, GridPoint } from '../types/item.types';
import { parsePoint } from './logicTree.utils';

/**
 * Generate complete Item from Redux state
 */
export function generateItemFromState(state: RootState): Item {
  // Parse grid points
  const points: GridPoint[] = state.grid.points.map(parsePoint);

  // Collect only touched default stats + custom stats
  const stats: Array<{ name: string; value: number }> = [];

  if (state.stats.touchedStats.price) {
    stats.push({ name: 'price', value: state.stats.defaultStats.price });
  }
  if (state.stats.touchedStats.level) {
    stats.push({ name: 'level', value: state.stats.defaultStats.level });
  }
  if (state.stats.touchedStats.maxLevel) {
    stats.push({ name: 'maxLevel', value: state.stats.defaultStats.maxLevel });
  }
  if (state.stats.touchedStats.rarity) {
    stats.push({ name: 'rarity', value: state.stats.defaultStats.rarity });
  }

  // Add custom stats
  stats.push(...state.stats.customStats.map((s) => ({ name: s.name, value: s.value })));

  // Get denormalized logic tree
  const logic =
    state.logic.rootNodeIds.length > 0
      ? denormalizeLogicForExport(state)
      : undefined;

  const item: Item = {
    weight: state.item.weight,
    name: state.item.name,
    ico: state.item.ico,
    description: state.item.description,
    points,
    tags: state.item.tags.map(tag => tag.value),
  };

  // Add optional fields
  if (stats.length > 0) {
    item.stats = stats;
  }

  if (state.stats.charges.length > 0) {
    item.charges = state.stats.charges.map((c) => ({ name: c.name, value: c.value }));
  }

  if (state.grid.pivot) {
    item.pivot = state.grid.pivot;
  }

  if (state.drawers.drawers.length > 0) {
    item.drawers = state.drawers.drawers.map((d) => ({
      type: d.type,
      cellTop: d.cellTop,
      cellBot: d.cellBot,
      cellLeft: d.cellLeft,
      cellRight: d.cellRight,
    }));
  }

  if (logic && logic.length > 0) {
    item.logic = logic;
  }

  return item;
}

/**
 * Denormalize logic tree for export
 */
function denormalizeLogicForExport(state: RootState) {
  const { nodes, rootNodeIds } = state.logic;

  const denormalizeNode = (nodeId: string): any => {
    const node = nodes[nodeId];
    if (!node) return null;

    const result: any = {
      nodeType: node.nodeType,
      data: node.data,
    };

    if (node.childIds.length > 0) {
      result.children = node.childIds
        .map(denormalizeNode)
        .filter(Boolean);
    }

    return result;
  };

  return rootNodeIds.map(denormalizeNode).filter(Boolean);
}

/**
 * Generate JSON string from state
 */
export function generateJSONString(state: RootState): string {
  const item = generateItemFromState(state);
  return JSON.stringify(item, null, 2);
}

/**
 * Download JSON file
 */
export function downloadJSON(json: string, filename: string = 'item.json'): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy JSON to clipboard
 */
export async function copyJSONToClipboard(json: string): Promise<void> {
  await navigator.clipboard.writeText(json);
}

/**
 * Import JSON from file
 */
export async function importJSON(file: File): Promise<Item> {
  const text = await file.text();
  return JSON.parse(text);
}
