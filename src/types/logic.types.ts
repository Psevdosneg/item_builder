import {
  NODE_TYPES,
  TRIGGER_TYPES,
  CHECKER_TYPES,
  ACTIVATOR_TYPES,
  CONDITIONAL_TYPES,
} from '../utils/constants';

// Node type union
export type NodeType = typeof NODE_TYPES[number];

// Trigger types
export type TriggerType = typeof TRIGGER_TYPES[number];
export type CheckerType = typeof CHECKER_TYPES[number];
export type ActivatorType = typeof ACTIVATOR_TYPES[number];
export type ConditionalType = typeof CONDITIONAL_TYPES[number];

// ============================================================================
// GENERIC LEVEL-BASED DATA STRUCTURE
// ============================================================================

/**
 * Generic structure for level-dependent data
 * Used by many node types for scaling values by item level
 */
export interface LevelData<T> {
  level: number;
  data: T;
}

// ============================================================================
// TRIGGER NODE DATA TYPES
// ============================================================================

/**
 * Discriminated union for all trigger node data types
 */
export type TriggerNodeData =
  | { triggerType: 'cooldown'; ignoreActivationTrigger?: boolean }
  | { triggerType: 'itemActivated'; ignoreActivationTrigger?: boolean }
  | { triggerType: 'changeBattleState'; ignoreActivationTrigger?: boolean }
  | { triggerType: 'cripSpawn'; ignoreActivationTrigger?: boolean }
  | { triggerType: 'cripDeath'; ignoreActivationTrigger?: boolean }
  | { triggerType: 'itemChargesChanged'; ignoreActivationTrigger?: boolean };

// ============================================================================
// CHECKER NODE DATA TYPES
// ============================================================================

/**
 * Resource price data for resourcePrice checker
 */
export interface ResourcePriceData {
  resource: string;
  count: number;
}

/**
 * Charge price data for chargePrice checker
 */
export interface ChargePriceData {
  charge: string;
  count: number;
}

/**
 * Ally price data for allyPrice checker
 */
export interface AllyPriceData {
  count: number;
}

/**
 * Battle state data for battleState checker
 */
export interface BattleStateData {
  battleState: string;
}

/**
 * Discriminated union for all checker node data types
 */
export type CheckerNodeData =
  | { checkerType: 'cooldown' }
  | { checkerType: 'chargePrice'; data: LevelData<ChargePriceData>[] }
  | { checkerType: 'allyPrice'; data: LevelData<AllyPriceData>[] }
  | { checkerType: 'resourcePrice'; data: LevelData<ResourcePriceData>[] }
  | { checkerType: 'battleState'; data: BattleStateData }
  | { checkerType: 'itemConditional'; data?: any }
  | { checkerType: 'cripConditional'; data?: any };

// ============================================================================
// ACTIVATOR NODE DATA TYPES
// ============================================================================

/**
 * Change resource data for changeResource activator
 */
export interface ChangeResourceData {
  resource: string;
  value: number;
}

/**
 * Spawner data for spawner activator
 */
export interface SpawnerData {
  characterId: string;
  relative: 'ally' | 'enemy';
}

/**
 * Impulse item data for impulseItem activator
 */
export interface ImpulseItemData {
  value: number;
}

/**
 * Item state tag data for addItemStateTag activator
 */
export interface AddItemStateTagData {
  tags: Array<{
    time: number;
    tag: string;
  }>;
}

/**
 * Change item charge data for changeItemCharge activator
 */
export interface ChangeItemChargeData {
  charge: string;
  count: number;
}

/**
 * Discriminated union for all activator node data types
 */
export type ActivatorNodeData =
  | { activatorType: 'damage' }
  | { activatorType: 'heal' }
  | { activatorType: 'changeResource'; data: LevelData<ChangeResourceData>[] }
  | { activatorType: 'spawner'; data: LevelData<SpawnerData>[] }
  | { activatorType: 'impulseItem'; data: LevelData<ImpulseItemData>[] }
  | { activatorType: 'addItemStateTag'; data: LevelData<AddItemStateTagData>[] }
  | { activatorType: 'changeItemCharge'; data: LevelData<ChangeItemChargeData>[] };

// ============================================================================
// AURA NODE DATA TYPES
// ============================================================================

/**
 * Stat modification for aura
 */
export interface StatModification {
  name: string;
  value: number;
}

/**
 * Aura node data - deeply nested structure
 */
export interface AuraNodeData {
  effectType: 'item' | 'character';
  data: {
    isDebuff: boolean;
    modificateStats: LevelData<StatModification[]>[];
  };
}

// ============================================================================
// CONDITIONAL NODE DATA TYPES
// ============================================================================

/**
 * Character relative data for characterRelative conditional
 */
export interface CharacterRelativeData {
  relative: 'ally' | 'enemy';
}

/**
 * Character random data for characterRandom conditional
 */
export interface CharacterRandomData {
  count: number;
}

/**
 * Item random data for itemRandom conditional
 */
export interface ItemRandomData {
  count: number;
}

/**
 * Battle state data for battleState conditional
 */
export interface ConditionalBattleStateData {
  state: string;
}

/**
 * Item tag data for itemTag conditional
 */
export interface ItemTagData {
  tags: string[];
}

/**
 * Character tag data for characterTag conditional
 */
export interface CharacterTagData {
  tags: string[];
}

/**
 * Item position data for itemPosition conditional
 */
export interface ItemPositionData {
  relative: string;
  points: Array<{
    x: number;
    y: number;
  }>;
}

/**
 * Character resources data for characterResources conditional
 */
export interface CharacterResourcesData {
  mode: 'equalGreate' | 'equalLess' | 'equal' | 'notEqual';
  resourceId: string;
  value: number;
}

/**
 * Discriminated union for all conditional node data types
 */
export type ConditionalNodeData =
  | { conditionalType: 'characterRelative'; data: CharacterRelativeData }
  | { conditionalType: 'characterRandom'; data: LevelData<CharacterRandomData>[] }
  | { conditionalType: 'characterSelf' }
  | { conditionalType: 'battleState'; data: ConditionalBattleStateData }
  | { conditionalType: 'itemTag'; data: LevelData<ItemTagData>[] }
  | { conditionalType: 'itemSelf' }
  | { conditionalType: 'itemPosition'; data: LevelData<ItemPositionData>[] }
  | { conditionalType: 'characterTag'; data: LevelData<CharacterTagData>[] }
  | { conditionalType: 'characterResources'; data: LevelData<CharacterResourcesData>[] }
  | { conditionalType: 'itemRandom'; data: LevelData<ItemRandomData>[] };

// ============================================================================
// COUNTER NODE DATA TYPES
// ============================================================================

/**
 * Counter node data
 */
export interface CounterNodeData {
  type: string;
  data?: {
    includeDestroyed?: boolean;
    resourceId?: string;
    [key: string]: any;
  };
}

// ============================================================================
// LEGACY COMPATIBILITY TYPES
// ============================================================================

/**
 * @deprecated Use TriggerNodeData instead
 * Kept for backward compatibility
 */
export interface TriggerData {
  triggerType: TriggerType;
  ignoreActivationTrigger?: boolean;
}

/**
 * @deprecated Use CheckerNodeData instead
 * Kept for backward compatibility
 */
export interface CheckerData {
  checkerType: CheckerType;
  data?: any;
}

/**
 * @deprecated Use ActivatorNodeData instead
 * Kept for backward compatibility
 */
export interface ActivatorData {
  activatorType: ActivatorType;
  data?: any;
}

/**
 * @deprecated Use ConditionalNodeData instead
 * Kept for backward compatibility
 */
export interface ConditionalData {
  conditionalType: ConditionalType;
  data?: any;
}

/**
 * @deprecated Use AuraNodeData instead
 * Kept for backward compatibility
 */
export interface AuraData {
  effectType: 'item' | 'character';
  data: {
    isDebuff: boolean;
    modificateStats: Array<{
      level: number;
      data: Array<{
        name: string;
        value: number;
      }>;
    }>;
  };
}

/**
 * @deprecated Use CounterNodeData instead
 * Kept for backward compatibility
 */
export interface CounterData {
  type: string;
  data?: any;
}

// ============================================================================
// LOGIC NODE TYPES (Union of all node types)
// ============================================================================

/**
 * Strongly-typed Logic Node with discriminated union
 * This is the main node structure for JSON export
 */
export type LogicNode =
  | {
      nodeType: 'trigger';
      data: TriggerNodeData;
      children?: LogicNode[];
    }
  | {
      nodeType: 'checker';
      data: CheckerNodeData;
      children?: LogicNode[];
    }
  | {
      nodeType: 'activator';
      data: ActivatorNodeData;
      children?: LogicNode[];
    }
  | {
      nodeType: 'aura';
      data: AuraNodeData;
      children?: LogicNode[];
    }
  | {
      nodeType: 'conditional';
      data: ConditionalNodeData;
      children?: LogicNode[];
    }
  | {
      nodeType: 'counter';
      data: CounterNodeData;
      children?: LogicNode[];
    };

/**
 * Normalized Logic Node State (for Redux store)
 * Uses discriminated union for type safety
 */
export type LogicNodeState =
  | {
      id: string;
      nodeType: 'trigger';
      data: TriggerNodeData;
      childIds: string[];
      parentId: string | null;
      isCollapsed: boolean;
      isValid: boolean;
      validationError: string | null;
    }
  | {
      id: string;
      nodeType: 'checker';
      data: CheckerNodeData;
      childIds: string[];
      parentId: string | null;
      isCollapsed: boolean;
      isValid: boolean;
      validationError: string | null;
    }
  | {
      id: string;
      nodeType: 'activator';
      data: ActivatorNodeData;
      childIds: string[];
      parentId: string | null;
      isCollapsed: boolean;
      isValid: boolean;
      validationError: string | null;
    }
  | {
      id: string;
      nodeType: 'aura';
      data: AuraNodeData;
      childIds: string[];
      parentId: string | null;
      isCollapsed: boolean;
      isValid: boolean;
      validationError: string | null;
    }
  | {
      id: string;
      nodeType: 'conditional';
      data: ConditionalNodeData;
      childIds: string[];
      parentId: string | null;
      isCollapsed: boolean;
      isValid: boolean;
      validationError: string | null;
    }
  | {
      id: string;
      nodeType: 'counter';
      data: CounterNodeData;
      childIds: string[];
      parentId: string | null;
      isCollapsed: boolean;
      isValid: boolean;
      validationError: string | null;
    };

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for trigger node data
 */
export function isTriggerData(data: any): data is TriggerNodeData {
  return data && typeof data.triggerType === 'string';
}

/**
 * Type guard for checker node data
 */
export function isCheckerData(data: any): data is CheckerNodeData {
  return data && typeof data.checkerType === 'string';
}

/**
 * Type guard for activator node data
 */
export function isActivatorData(data: any): data is ActivatorNodeData {
  return data && typeof data.activatorType === 'string';
}

/**
 * Type guard for aura node data
 */
export function isAuraData(data: any): data is AuraNodeData {
  return (
    data &&
    typeof data.effectType === 'string' &&
    data.data &&
    typeof data.data.isDebuff === 'boolean'
  );
}

/**
 * Type guard for conditional node data
 */
export function isConditionalData(data: any): data is ConditionalNodeData {
  return data && typeof data.conditionalType === 'string';
}

/**
 * Type guard for counter node data
 */
export function isCounterData(data: any): data is CounterNodeData {
  return data && typeof data.type === 'string';
}

// ============================================================================
// DEFAULT DATA FACTORY
// ============================================================================

/**
 * Creates default data for a given node type
 * Used when creating new nodes
 */
export function createDefaultNodeData(nodeType: NodeType):
  | TriggerNodeData
  | CheckerNodeData
  | ActivatorNodeData
  | AuraNodeData
  | ConditionalNodeData
  | CounterNodeData {
  switch (nodeType) {
    case 'trigger':
      return { triggerType: 'cooldown' };
    case 'checker':
      return { checkerType: 'cooldown' };
    case 'activator':
      return { activatorType: 'damage' };
    case 'aura':
      return {
        effectType: 'item',
        data: {
          isDebuff: false,
          modificateStats: [],
        },
      };
    case 'conditional':
      return { conditionalType: 'characterSelf' };
    case 'counter':
      return { type: 'default' };
  }
}

// Tree Statistics
export interface TreeStats {
  total: number;
  maxDepth: number;
  triggers: number;
  checkers: number;
  activators: number;
  conditionals: number;
  auras: number;
  counters: number;
}

// Logic Node Preset (for quick templates)
export interface LogicNodePreset {
  name: string;
  nodeType: NodeType;
  data: Record<string, any>;
  children?: LogicNodePreset[];
}

// Normalized Logic State (for Redux)
export interface NormalizedLogicState {
  nodes: Record<string, LogicNodeState>;
  rootNodeIds: string[];
}
