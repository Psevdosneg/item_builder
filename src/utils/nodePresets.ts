import type { NodeType } from '../types/logic.types';

// Import preset files
import triggerPresets from '../data/presets/trigger.json';
import checkerPresets from '../data/presets/checker.json';
import activatorPresets from '../data/presets/activator.json';
import auraPresets from '../data/presets/aura.json';
import conditionalPresets from '../data/presets/conditional.json';
import counterPresets from '../data/presets/counter.json';

export interface NodePreset {
  name: string;
  description: string;
  data: any;
}

// Map of presets by node type
const presetsByType: Record<NodeType, NodePreset[]> = {
  trigger: triggerPresets as NodePreset[],
  checker: checkerPresets as NodePreset[],
  activator: activatorPresets as NodePreset[],
  aura: auraPresets as NodePreset[],
  conditional: conditionalPresets as NodePreset[],
  counter: counterPresets as NodePreset[],
};

/**
 * Get presets for a specific node type
 */
export function getPresetsForType(nodeType: NodeType): NodePreset[] {
  return presetsByType[nodeType] || [];
}

/**
 * Get all presets
 */
export function getAllPresets(): Record<NodeType, NodePreset[]> {
  return presetsByType;
}
