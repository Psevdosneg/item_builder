/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { moveNode } from '../../features/logic/logicSlice';
import { isValidDropTarget } from '../../utils/logicTree.utils';

interface DragState {
  activeId: string | null;
  overId: string | null;
  isValidDrop: boolean;
}

interface LogicDndContextValue {
  dragState: DragState;
  isDragging: boolean;
}

const LogicDndContext = createContext<LogicDndContextValue>({
  dragState: { activeId: null, overId: null, isValidDrop: false },
  isDragging: false,
});

export const useLogicDnd = () => useContext(LogicDndContext);

interface LogicDndProviderProps {
  children: React.ReactNode;
}

export const LogicDndProvider: React.FC<LogicDndProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector((state) => state.logic.nodes);
  const rootNodeIds = useAppSelector((state) => state.logic.rootNodeIds);

  const [dragState, setDragState] = useState<DragState>({
    activeId: null,
    overId: null,
    isValidDrop: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setDragState({
      activeId: active.id as string,
      overId: null,
      isValidDrop: false,
    });
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) {
        setDragState((prev) => ({
          ...prev,
          overId: null,
          isValidDrop: false,
        }));
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      // Check if it's a drop zone (between nodes or at root level)
      const isDropZone = overId.startsWith('dropzone-');

      let targetParentId: string | null = null;

      if (isDropZone) {
        // Parse dropzone ID: "dropzone-{parentId|root}-{index}"
        // parentId can contain dashes (e.g., "node-5"), so we need to parse carefully
        // Format: "dropzone-root-{index}" or "dropzone-{parentId}-{index}"
        const lastDashIndex = overId.lastIndexOf('-');
        const prefix = overId.substring(0, lastDashIndex); // "dropzone-root" or "dropzone-node-5"
        const parentPart = prefix.substring('dropzone-'.length); // "root" or "node-5"
        targetParentId = parentPart === 'root' ? null : parentPart;
      } else {
        // Dropping directly on a node makes it a child of that node
        targetParentId = overId;
      }

      const isValid = isValidDropTarget(nodes, activeId, targetParentId);

      setDragState({
        activeId,
        overId,
        isValidDrop: isValid,
      });
    },
    [nodes]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setDragState({ activeId: null, overId: null, isValidDrop: false });
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      // Check if it's a drop zone
      const isDropZone = overId.startsWith('dropzone-');

      let newParentId: string | null = null;
      let newIndex = 0;

      if (isDropZone) {
        // Parse dropzone ID: "dropzone-{parentId|root}-{index}"
        // parentId can contain dashes (e.g., "node-5"), so we need to parse carefully
        // Format: "dropzone-root-{index}" or "dropzone-{parentId}-{index}"
        const lastDashIndex = overId.lastIndexOf('-');
        const prefix = overId.substring(0, lastDashIndex); // "dropzone-root" or "dropzone-node-5"
        const parentPart = prefix.substring('dropzone-'.length); // "root" or "node-5"
        newParentId = parentPart === 'root' ? null : parentPart;
        newIndex = parseInt(overId.substring(lastDashIndex + 1), 10);
      } else {
        // Dropping directly on a node - add as last child
        newParentId = overId;
        const targetNode = nodes[overId];
        newIndex = targetNode ? targetNode.childIds.length : 0;
      }

      // Check validity before dispatching
      if (isValidDropTarget(nodes, activeId, newParentId)) {
        // Adjust index if moving within same parent
        const node = nodes[activeId];
        if (node) {
          const oldParentId = node.parentId;

          if (oldParentId === newParentId) {
            // Same parent - need to adjust index
            const siblings = newParentId
              ? nodes[newParentId].childIds
              : rootNodeIds;
            const currentIndex = siblings.indexOf(activeId);

            if (currentIndex !== -1 && currentIndex < newIndex) {
              newIndex = Math.max(0, newIndex - 1);
            }
          }
        }

        dispatch(moveNode({ nodeId: activeId, newParentId, newIndex }));
      }

      setDragState({ activeId: null, overId: null, isValidDrop: false });
    },
    [dispatch, nodes, rootNodeIds]
  );

  const handleDragCancel = useCallback(() => {
    setDragState({ activeId: null, overId: null, isValidDrop: false });
  }, []);

  const contextValue: LogicDndContextValue = {
    dragState,
    isDragging: dragState.activeId !== null,
  };

  const activeNode = dragState.activeId ? nodes[dragState.activeId] : null;

  return (
    <LogicDndContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay>
          {activeNode && (
            <div className="drag-preview">
              <span className="drag-preview-type">{activeNode.nodeType}</span>
              <span className="drag-preview-id">{activeNode.id}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </LogicDndContext.Provider>
  );
};
