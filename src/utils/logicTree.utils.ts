import type {
  LogicNode,
  LogicNodeState,
  NormalizedLogicState,
  TreeStats,
  NodeType,
} from '../types/logic.types';

/**
 * Generate unique ID for nodes
 */
let nodeCounter = 0;
export const generateNodeId = (): string => {
  return `node-${++nodeCounter}`;
};

/**
 * Reset node counter (useful for testing)
 */
export const resetNodeCounter = (): void => {
  nodeCounter = 0;
};

/**
 * Normalize a recursive tree structure into a flat structure for Redux
 * Converts: LogicNode[] -> { nodes: Record<string, LogicNodeState>, rootNodeIds: string[] }
 */
export const normalizeLogicTree = (
  nodes: LogicNode[]
): NormalizedLogicState => {
  const normalized: Record<string, LogicNodeState> = {};
  const rootNodeIds: string[] = [];

  const normalizeNode = (
    node: LogicNode,
    parentId: string | null = null
  ): string => {
    const nodeId = generateNodeId();

    // Normalize children first
    const childIds: string[] = [];
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const childId = normalizeNode(child, nodeId);
        childIds.push(childId);
      }
    }

    // Create normalized node
    normalized[nodeId] = {
      id: nodeId,
      nodeType: node.nodeType,
      data: node.data,
      childIds,
      parentId,
      isCollapsed: false,
      isValid: true,
      validationError: null,
    } as LogicNodeState;

    return nodeId;
  };

  // Normalize all root nodes
  for (const node of nodes) {
    const nodeId = normalizeNode(node, null);
    rootNodeIds.push(nodeId);
  }

  return { nodes: normalized, rootNodeIds };
};

/**
 * Denormalize flat structure back to recursive tree for JSON export
 * Converts: NormalizedLogicState -> LogicNode[]
 */
export const denormalizeLogicTree = (
  nodes: Record<string, LogicNodeState>,
  rootNodeIds: string[]
): LogicNode[] => {
  const denormalizeNode = (nodeId: string): LogicNode => {
    const node = nodes[nodeId];
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`);
    }

    const logicNode = {
      nodeType: node.nodeType,
      data: node.data,
    } as LogicNode;

    // Recursively denormalize children
    if (node.childIds.length > 0) {
      logicNode.children = node.childIds.map((childId) =>
        denormalizeNode(childId)
      );
    }

    return logicNode;
  };

  return rootNodeIds.map((rootId) => denormalizeNode(rootId));
};

/**
 * Calculate tree statistics (total nodes, max depth, count by type)
 */
export const calculateTreeStats = (
  nodes: Record<string, LogicNodeState>,
  rootNodeIds: string[]
): TreeStats => {
  const stats: TreeStats = {
    total: 0,
    maxDepth: 0,
    triggers: 0,
    checkers: 0,
    activators: 0,
    conditionals: 0,
    auras: 0,
    counters: 0,
  };

  const traverse = (nodeId: string, depth: number = 0): void => {
    const node = nodes[nodeId];
    if (!node) return;

    stats.total++;
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    // Count by type
    switch (node.nodeType) {
      case 'trigger':
        stats.triggers++;
        break;
      case 'checker':
        stats.checkers++;
        break;
      case 'activator':
        stats.activators++;
        break;
      case 'conditional':
        stats.conditionals++;
        break;
      case 'aura':
        stats.auras++;
        break;
      case 'counter':
        stats.counters++;
        break;
    }

    // Recursively traverse children
    for (const childId of node.childIds) {
      traverse(childId, depth + 1);
    }
  };

  // Traverse all root nodes
  for (const rootId of rootNodeIds) {
    traverse(rootId, 0);
  }

  return stats;
};

/**
 * Traverse tree and apply callback to each node
 */
export const traverseTree = (
  nodes: Record<string, LogicNodeState>,
  rootNodeIds: string[],
  callback: (node: LogicNodeState, depth: number) => void
): void => {
  const traverse = (nodeId: string, depth: number = 0): void => {
    const node = nodes[nodeId];
    if (!node) return;

    callback(node, depth);

    // Recursively traverse children
    for (const childId of node.childIds) {
      traverse(childId, depth + 1);
    }
  };

  for (const rootId of rootNodeIds) {
    traverse(rootId, 0);
  }
};

/**
 * Find node by ID
 */
export const findNodeById = (
  nodes: Record<string, LogicNodeState>,
  nodeId: string
): LogicNodeState | null => {
  return nodes[nodeId] || null;
};

/**
 * Get node depth in tree
 */
export const getNodeDepth = (
  nodes: Record<string, LogicNodeState>,
  nodeId: string
): number => {
  let depth = 0;
  let currentId: string | null = nodeId;

  while (currentId) {
    const node = nodes[currentId];
    if (!node) break;

    if (node.parentId) {
      depth++;
      currentId = node.parentId;
    } else {
      break;
    }
  }

  return depth;
};

/**
 * Copy node with all its children (generates new IDs)
 */
export const copyNodeWithChildren = (
  nodes: Record<string, LogicNodeState>,
  nodeId: string
): { newNodes: Record<string, LogicNodeState>; newRootId: string } => {
  const newNodes: Record<string, LogicNodeState> = {};
  const idMapping: Record<string, string> = {};

  const copyNode = (originalId: string, newParentId: string | null): string => {
    const originalNode = nodes[originalId];
    if (!originalNode) {
      throw new Error(`Node with id ${originalId} not found`);
    }

    const newId = generateNodeId();
    idMapping[originalId] = newId;

    // Copy children first
    const newChildIds: string[] = [];
    for (const childId of originalNode.childIds) {
      const newChildId = copyNode(childId, newId);
      newChildIds.push(newChildId);
    }

    // Create copied node
    newNodes[newId] = {
      ...originalNode,
      id: newId,
      parentId: newParentId,
      childIds: newChildIds,
      isCollapsed: false, // Expand by default
    };

    return newId;
  };

  const newRootId = copyNode(nodeId, null);

  return { newNodes, newRootId };
};

/**
 * Get all descendant IDs of a node (including the node itself)
 */
export const getAllDescendantIds = (
  nodes: Record<string, LogicNodeState>,
  nodeId: string
): string[] => {
  const descendants: string[] = [nodeId];

  const traverse = (id: string): void => {
    const node = nodes[id];
    if (!node) return;

    for (const childId of node.childIds) {
      descendants.push(childId);
      traverse(childId);
    }
  };

  traverse(nodeId);

  return descendants;
};

/**
 * Check if a node has any children
 */
export const hasChildren = (
  nodes: Record<string, LogicNodeState>,
  nodeId: string
): boolean => {
  const node = nodes[nodeId];
  return node ? node.childIds.length > 0 : false;
};

/**
 * Get all root nodes
 */
export const getRootNodes = (
  nodes: Record<string, LogicNodeState>,
  rootNodeIds: string[]
): LogicNodeState[] => {
  return rootNodeIds.map((id) => nodes[id]).filter(Boolean);
};

/**
 * Parse grid point string to object
 * "0,1" -> {x: 0, y: 1}
 */
export const parsePoint = (pointStr: string): { x: number; y: number } => {
  const [x, y] = pointStr.split(',').map(Number);
  return { x, y };
};

/**
 * Convert grid point to string
 * {x: 0, y: 1} -> "0,1"
 */
export const stringifyPoint = (point: { x: number; y: number }): string => {
  return `${point.x},${point.y}`;
};
