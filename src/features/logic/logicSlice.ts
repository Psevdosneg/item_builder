import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  LogicNodeState,
  LogicNode,
  LogicNodePreset,
  TriggerNodeData,
  CheckerNodeData,
  ActivatorNodeData,
  AuraNodeData,
  ConditionalNodeData,
  CounterNodeData,
} from '../../types/logic.types';
import { createDefaultNodeData } from '../../types/logic.types';
import {
  generateNodeId,
  normalizeLogicTree,
  copyNodeWithChildren,
  getAllDescendantIds,
  isValidDropTarget,
} from '../../utils/logicTree.utils';
import { validateNodeData } from '../../services/validation.service';

interface LogicState {
  nodes: Record<string, LogicNodeState>;
  rootNodeIds: string[];
  collapsedNodes: string[];
  treeView: {
    visible: boolean;
    collapsedTreeNodes: string[];
  };
}

const initialState: LogicState = {
  nodes: {},
  rootNodeIds: [],
  collapsedNodes: [],
  treeView: {
    visible: false,
    collapsedTreeNodes: [],
  },
};

const logicSlice = createSlice({
  name: 'logic',
  initialState,
  reducers: {
    // Add a new node
    addNode: (
      state,
      action: PayloadAction<{
        parentId?: string;
        preset?: LogicNodePreset;
      }>
    ) => {
      const { parentId, preset } = action.payload;
      const nodeId = generateNodeId();
      const nodeType = preset?.nodeType || 'trigger';

      const newNode: LogicNodeState = {
        id: nodeId,
        nodeType,
        data: preset?.data || createDefaultNodeData(nodeType),
        childIds: [],
        parentId: parentId || null,
        isCollapsed: false,
        isValid: true,
        validationError: null,
      } as LogicNodeState;

      state.nodes[nodeId] = newNode;

      // If has parent, add to parent's children
      if (parentId && state.nodes[parentId]) {
        state.nodes[parentId].childIds.push(nodeId);
      } else {
        // Otherwise, add to root nodes
        state.rootNodeIds.push(nodeId);
      }

      // If preset has children, recursively add them
      if (preset?.children) {
        const addChildrenRecursive = (
          children: LogicNodePreset[],
          currentParentId: string
        ) => {
          for (const childPreset of children) {
            const childId = generateNodeId();
            const childNode: LogicNodeState = {
              id: childId,
              nodeType: childPreset.nodeType,
              data: childPreset.data,
              childIds: [],
              parentId: currentParentId,
              isCollapsed: false,
              isValid: true,
              validationError: null,
            } as LogicNodeState;

            state.nodes[childId] = childNode;
            state.nodes[currentParentId].childIds.push(childId);

            if (childPreset.children) {
              addChildrenRecursive(childPreset.children, childId);
            }
          }
        };

        addChildrenRecursive(preset.children, nodeId);
      }
    },

    // Remove node and all its descendants
    removeNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      const node = state.nodes[nodeId];

      if (!node) return;

      // Get all descendant IDs (including the node itself)
      const descendantIds = getAllDescendantIds(state.nodes, nodeId);

      // Remove from parent's children or root nodes
      if (node.parentId && state.nodes[node.parentId]) {
        const parent = state.nodes[node.parentId];
        parent.childIds = parent.childIds.filter((id) => id !== nodeId);
      } else {
        state.rootNodeIds = state.rootNodeIds.filter((id) => id !== nodeId);
      }

      // Delete all descendants
      for (const id of descendantIds) {
        delete state.nodes[id];
        // Remove from collapsed lists
        state.collapsedNodes = state.collapsedNodes.filter((cid) => cid !== id);
        state.treeView.collapsedTreeNodes = state.treeView.collapsedTreeNodes.filter(
          (cid) => cid !== id
        );
      }
    },

    // Update node
    updateNode: (
      state,
      action: PayloadAction<{ nodeId: string; updates: Partial<LogicNodeState> }>
    ) => {
      const { nodeId, updates } = action.payload;
      const node = state.nodes[nodeId];

      if (node) {
        Object.assign(node, updates);
      }
    },

    // Update node data
    updateNodeData: (
      state,
      action: PayloadAction<{
        nodeId: string;
        data:
          | TriggerNodeData
          | CheckerNodeData
          | ActivatorNodeData
          | AuraNodeData
          | ConditionalNodeData
          | CounterNodeData;
      }>
    ) => {
      const { nodeId, data } = action.payload;
      const node = state.nodes[nodeId];

      if (node) {
        node.data = data as any;
        // Validate the new data
        const validation = validateNodeData(node.nodeType, data);
        node.isValid = validation.valid;
        node.validationError = validation.error || null;
      }
    },

    // Update node type
    updateNodeType: (
      state,
      action: PayloadAction<{ nodeId: string; nodeType: string }>
    ) => {
      const { nodeId, nodeType } = action.payload;
      const node = state.nodes[nodeId];

      if (node) {
        node.nodeType = nodeType as any;
        // Reset validation when type changes
        node.isValid = true;
        node.validationError = null;
      }
    },

    // Add child node
    addChildNode: (state, action: PayloadAction<string>) => {
      const parentId = action.payload;
      const childId = generateNodeId();

      const newNode: LogicNodeState = {
        id: childId,
        nodeType: 'trigger',
        data: createDefaultNodeData('trigger'),
        childIds: [],
        parentId,
        isCollapsed: false,
        isValid: true,
        validationError: null,
      } as LogicNodeState;

      state.nodes[childId] = newNode;

      if (state.nodes[parentId]) {
        state.nodes[parentId].childIds.push(childId);
      }
    },

    // Copy node with all children
    copyNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      const node = state.nodes[nodeId];

      if (!node) return;

      const { newNodes, newRootId } = copyNodeWithChildren(state.nodes, nodeId);

      // Add new nodes to state
      Object.assign(state.nodes, newNodes);

      // Add to same parent or root
      if (node.parentId && state.nodes[node.parentId]) {
        state.nodes[node.parentId].childIds.push(newRootId);
        newNodes[newRootId].parentId = node.parentId;
      } else {
        state.rootNodeIds.push(newRootId);
      }
    },

    // Toggle node collapse
    toggleNodeCollapse: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      const node = state.nodes[nodeId];

      if (node) {
        node.isCollapsed = !node.isCollapsed;

        const index = state.collapsedNodes.indexOf(nodeId);
        if (node.isCollapsed && index === -1) {
          state.collapsedNodes.push(nodeId);
        } else if (!node.isCollapsed && index > -1) {
          state.collapsedNodes.splice(index, 1);
        }
      }
    },

    // Collapse all nodes
    collapseAllNodes: (state) => {
      Object.keys(state.nodes).forEach((nodeId) => {
        state.nodes[nodeId].isCollapsed = true;
      });
      state.collapsedNodes = Object.keys(state.nodes);
    },

    // Expand all nodes
    expandAllNodes: (state) => {
      Object.keys(state.nodes).forEach((nodeId) => {
        state.nodes[nodeId].isCollapsed = false;
      });
      state.collapsedNodes = [];
    },

    // Validate specific node
    validateNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      const node = state.nodes[nodeId];

      if (node) {
        const validation = validateNodeData(node.nodeType, node.data);
        node.isValid = validation.valid;
        node.validationError = validation.error || null;
      }
    },

    // Load logic tree from JSON (denormalized format)
    loadLogicTree: (state, action: PayloadAction<LogicNode[]>) => {
      const nodes = action.payload;

      if (!nodes || nodes.length === 0) {
        // Reset to empty state
        state.nodes = {};
        state.rootNodeIds = [];
        state.collapsedNodes = [];
        return;
      }

      // Normalize the tree
      const normalized = normalizeLogicTree(nodes);

      state.nodes = normalized.nodes;
      state.rootNodeIds = normalized.rootNodeIds;
      state.collapsedNodes = [];
    },

    // Toggle tree view visibility
    toggleTreeView: (state) => {
      state.treeView.visible = !state.treeView.visible;
    },

    // Toggle tree node collapse in visualization
    toggleTreeNodeCollapse: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      const index = state.treeView.collapsedTreeNodes.indexOf(nodeId);

      if (index > -1) {
        state.treeView.collapsedTreeNodes.splice(index, 1);
      } else {
        state.treeView.collapsedTreeNodes.push(nodeId);
      }
    },

    // Collapse all tree nodes in visualization
    collapseAllTreeNodes: (state) => {
      state.treeView.collapsedTreeNodes = Object.keys(state.nodes);
    },

    // Expand all tree nodes in visualization
    expandAllTreeNodes: (state) => {
      state.treeView.collapsedTreeNodes = [];
    },

    // Reset logic
    resetLogic: () => initialState,

    // Move node to a new parent or reorder within same parent
    moveNode: (
      state,
      action: PayloadAction<{
        nodeId: string;
        newParentId: string | null;
        newIndex: number;
      }>
    ) => {
      const { nodeId, newParentId, newIndex } = action.payload;
      const node = state.nodes[nodeId];

      if (!node) return;

      // Validate the drop target
      if (!isValidDropTarget(state.nodes, nodeId, newParentId)) {
        return;
      }

      const oldParentId = node.parentId;

      // 1. Remove from old parent's childIds or rootNodeIds
      if (oldParentId && state.nodes[oldParentId]) {
        state.nodes[oldParentId].childIds = state.nodes[oldParentId].childIds.filter(
          (id) => id !== nodeId
        );
      } else {
        // Was a root node
        state.rootNodeIds = state.rootNodeIds.filter((id) => id !== nodeId);
      }

      // 2. Update node's parentId
      node.parentId = newParentId;

      // 3. Insert into new parent's childIds or rootNodeIds at the specified index
      if (newParentId && state.nodes[newParentId]) {
        const newParent = state.nodes[newParentId];
        const safeIndex = Math.min(Math.max(0, newIndex), newParent.childIds.length);
        newParent.childIds.splice(safeIndex, 0, nodeId);
      } else {
        // Moving to root level
        const safeIndex = Math.min(Math.max(0, newIndex), state.rootNodeIds.length);
        state.rootNodeIds.splice(safeIndex, 0, nodeId);
      }
    },
  },
});

export const {
  addNode,
  removeNode,
  updateNode,
  updateNodeData,
  updateNodeType,
  addChildNode,
  copyNode,
  toggleNodeCollapse,
  collapseAllNodes,
  expandAllNodes,
  validateNode,
  loadLogicTree,
  toggleTreeView,
  toggleTreeNodeCollapse,
  collapseAllTreeNodes,
  expandAllTreeNodes,
  resetLogic,
  moveNode,
} = logicSlice.actions;

export default logicSlice.reducer;
