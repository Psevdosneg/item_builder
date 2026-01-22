import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addNode, collapseAllNodes, expandAllNodes } from '../../features/logic/logicSlice';
import { LogicNode } from './LogicNode';
import { LogicDndProvider, useLogicDnd } from './DndContext';
import { isValidDropTarget } from '../../utils/logicTree.utils';
import { Button } from '../common/Button';
import styles from './LogicBuilder.module.css';

// Drop zone component for adding at the end of root nodes
const DropZoneAtEnd: React.FC = () => {
  const { dragState, isDragging } = useLogicDnd();
  const nodes = useAppSelector((state) => state.logic.nodes);
  const rootNodeIds = useAppSelector((state) => state.logic.rootNodeIds);

  const dropzoneId = `dropzone-root-${rootNodeIds.length}`;

  const { setNodeRef, isOver } = useDroppable({
    id: dropzoneId,
  });

  if (!isDragging) return null;

  const isValid = dragState.activeId
    ? isValidDropTarget(nodes, dragState.activeId, null)
    : false;

  return (
    <div
      ref={setNodeRef}
      className={`${styles.dropZoneEnd} ${isOver ? (isValid ? styles.dropZoneEndValid : styles.dropZoneEndInvalid) : ''}`}
    >
      {isOver && (
        <div className={styles.dropZoneIndicator}>
          {isValid ? 'Drop here' : 'Invalid'}
        </div>
      )}
    </div>
  );
};

// Internal component with the actual logic
const LogicBuilderContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { rootNodeIds, nodes } = useAppSelector((state) => state.logic);

  const handleAddRootNode = () => {
    dispatch(addNode({}));
  };

  const handleCollapseAll = () => {
    dispatch(collapseAllNodes());
  };

  const handleExpandAll = () => {
    dispatch(expandAllNodes());
  };

  const totalNodes = Object.keys(nodes).length;
  const hasNodes = rootNodeIds.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>Logic System</h3>
          {totalNodes > 0 && (
            <span className={styles.badge}>
              {totalNodes} node{totalNodes !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          {hasNodes && (
            <>
              <Button size="small" variant="secondary" onClick={handleCollapseAll}>
                Collapse All
              </Button>
              <Button size="small" variant="secondary" onClick={handleExpandAll}>
                Expand All
              </Button>
            </>
          )}
          <Button size="small" onClick={handleAddRootNode}>
            + Add Root Node
          </Button>
        </div>
      </div>

      <div className={styles.nodesContainer}>
        {!hasNodes ? (
          <div className={styles.empty}>
            <p>No logic nodes yet.</p>
            <p className={styles.hint}>
              Click "Add Root Node" or use a preset to get started.
            </p>
          </div>
        ) : (
          <div className={styles.nodes}>
            {rootNodeIds.map((nodeId, index) => (
              <LogicNode key={nodeId} nodeId={nodeId} depth={0} index={index} />
            ))}
            {/* Drop zone at the end of root nodes */}
            <DropZoneAtEnd />
          </div>
        )}
      </div>
    </div>
  );
};

// Main component wrapped with DndProvider
export const LogicBuilder: React.FC = () => {
  return (
    <LogicDndProvider>
      <LogicBuilderContent />
    </LogicDndProvider>
  );
};
