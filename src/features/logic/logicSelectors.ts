import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { LogicNode } from '../../types/logic.types';
import {
  denormalizeLogicTree,
  calculateTreeStats,
  getNodeDepth,
  getRootNodes,
} from '../../utils/logicTree.utils';

// Select logic state
export const selectLogicState = (state: RootState) => state.logic;

// Select all nodes
export const selectAllNodes = (state: RootState) => state.logic.nodes;

// Select root node IDs
export const selectRootNodeIds = (state: RootState) => state.logic.rootNodeIds;

// Select collapsed nodes
export const selectCollapsedNodes = (state: RootState) => state.logic.collapsedNodes;

// Select tree view state
export const selectTreeViewState = (state: RootState) => state.logic.treeView;

// Select node by ID
export const selectNodeById = (state: RootState, nodeId: string) =>
  state.logic.nodes[nodeId];

// Select root nodes with memoization
export const selectRootNodesArray = createSelector(
  [selectAllNodes, selectRootNodeIds],
  (nodes, rootNodeIds) => getRootNodes(nodes, rootNodeIds)
);

// Select denormalized tree (for JSON export) with memoization
export const selectDenormalizedTree = createSelector(
  [selectAllNodes, selectRootNodeIds],
  (nodes, rootNodeIds) => {
    if (rootNodeIds.length === 0) {
      return [];
    }
    return denormalizeLogicTree(nodes, rootNodeIds);
  }
);

// Select tree statistics with memoization
export const selectTreeStats = createSelector(
  [selectAllNodes, selectRootNodeIds],
  (nodes, rootNodeIds) => calculateTreeStats(nodes, rootNodeIds)
);

// Select if node is collapsed
export const selectIsNodeCollapsed = createSelector(
  [selectCollapsedNodes, (_: RootState, nodeId: string) => nodeId],
  (collapsedNodes, nodeId) => collapsedNodes.includes(nodeId)
);

// Select node depth
export const selectNodeDepth = createSelector(
  [selectAllNodes, (_: RootState, nodeId: string) => nodeId],
  (nodes, nodeId) => getNodeDepth(nodes, nodeId)
);

// Select node children
export const selectNodeChildren = createSelector(
  [selectAllNodes, (_: RootState, nodeId: string) => nodeId],
  (nodes, nodeId) => {
    const node = nodes[nodeId];
    if (!node) return [];

    return node.childIds.map((childId) => nodes[childId]).filter(Boolean);
  }
);

// Select if node has children
export const selectNodeHasChildren = createSelector(
  [selectAllNodes, (_: RootState, nodeId: string) => nodeId],
  (nodes, nodeId) => {
    const node = nodes[nodeId];
    return node ? node.childIds.length > 0 : false;
  }
);

// Select all invalid nodes
export const selectInvalidNodes = createSelector([selectAllNodes], (nodes) =>
  Object.values(nodes).filter((node) => !node.isValid)
);

// Select if tree has any invalid nodes
export const selectHasInvalidNodes = createSelector(
  [selectInvalidNodes],
  (invalidNodes) => invalidNodes.length > 0
);
