import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  removeNode,
  addChildNode,
  toggleNodeCollapse,
  copyNode,
} from '../../features/logic/logicSlice';
import { useNotification } from '../../contexts/NotificationContext';
import { LogicNodeForm } from './LogicNodeForm';
import { Button } from '../common/Button';
import { useLogicDnd } from './DndContext';
import { isValidDropTarget } from '../../utils/logicTree.utils';
import styles from './LogicNode.module.css';

interface DropZoneBetweenProps {
  parentId: string | null;
  index: number;
}

const DropZoneBetween: React.FC<DropZoneBetweenProps> = ({ parentId, index }) => {
  const { dragState, isDragging } = useLogicDnd();
  const nodes = useAppSelector((state) => state.logic.nodes);

  const dropzoneId = `dropzone-${parentId || 'root'}-${index}`;

  const { setNodeRef, isOver } = useDroppable({
    id: dropzoneId,
  });

  // Only show when dragging
  if (!isDragging) return null;

  // Check if this is a valid drop target
  const isValid = dragState.activeId
    ? isValidDropTarget(nodes, dragState.activeId, parentId)
    : false;

  return (
    <div
      ref={setNodeRef}
      className={`${styles.dropZone} ${isOver ? (isValid ? styles.dropZoneValid : styles.dropZoneInvalid) : ''}`}
    >
      {isOver && (
        <div className={styles.dropZoneIndicator}>
          {isValid ? 'Drop here' : 'Invalid'}
        </div>
      )}
    </div>
  );
};

// Drop zone for adding a node as a child of another node
interface DropZoneAsChildProps {
  nodeId: string;
}

const DropZoneAsChild: React.FC<DropZoneAsChildProps> = ({ nodeId }) => {
  const { dragState, isDragging } = useLogicDnd();
  const nodes = useAppSelector((state) => state.logic.nodes);

  const { setNodeRef, isOver } = useDroppable({
    id: nodeId,
    disabled: dragState.activeId === nodeId, // Disable if dragging this node
  });

  // Only show when dragging and not dragging this node
  if (!isDragging || dragState.activeId === nodeId) return null;

  // Check if this is a valid drop target
  const isValid = dragState.activeId
    ? isValidDropTarget(nodes, dragState.activeId, nodeId)
    : false;

  return (
    <div
      ref={setNodeRef}
      className={`${styles.dropZoneChild} ${isOver ? (isValid ? styles.dropZoneChildValid : styles.dropZoneChildInvalid) : ''}`}
    >
      <span className={styles.dropZoneChildText}>
        {isOver ? (isValid ? 'Add as child' : 'Invalid') : 'Drop to add as child'}
      </span>
    </div>
  );
};

interface LogicNodeProps {
  nodeId: string;
  depth: number;
  index: number;
}

export const LogicNode: React.FC<LogicNodeProps> = ({ nodeId, depth, index }) => {
  const dispatch = useAppDispatch();
  const node = useAppSelector((state) => state.logic.nodes[nodeId]);
  const { dragState, isDragging } = useLogicDnd();
  const { showConfirm } = useNotification();

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging: isThisDragging,
  } = useDraggable({
    id: nodeId,
  });

  if (!node) return null;

  const hasChildren = node.childIds.length > 0;
  const isCollapsed = node.isCollapsed;

  const handleRemove = () => {
    showConfirm(
      'Remove this node and all its children?',
      () => dispatch(removeNode(nodeId)),
      { confirmText: 'Remove', variant: 'danger' }
    );
  };

  const handleAddChild = () => {
    dispatch(addChildNode(nodeId));
  };

  const handleToggleCollapse = () => {
    dispatch(toggleNodeCollapse(nodeId));
  };

  const handleCopy = () => {
    dispatch(copyNode(nodeId));
  };

  // Check if we should show drop zone as child
  const showDropAsChild = isDragging && dragState.activeId !== nodeId;

  return (
    <>
      <DropZoneBetween parentId={node.parentId} index={index} />
      <div
        ref={setDraggableRef}
        className={`${styles.nodeWrapper} ${isThisDragging ? styles.dragging : ''}`}
        data-depth={depth}
      >
        <div className={styles.node}>
          <div className={styles.nodeHeader}>
            <div className={styles.leftSection}>
              <button
                className={styles.dragHandle}
                {...attributes}
                {...listeners}
                aria-label="Drag to reorder"
              >
                &#x2807;
              </button>
              <span className={styles.depthIndicator}>L{depth}</span>
              {hasChildren && (
                <button
                  className={`${styles.collapseButton} ${isCollapsed ? styles.collapsed : ''}`}
                  onClick={handleToggleCollapse}
                  aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                >
                  &#x25BC;
                </button>
              )}
            </div>

            <div className={styles.actions}>
              <Button size="small" variant="secondary" onClick={handleCopy}>
                Copy
              </Button>
              <Button size="small" onClick={handleAddChild}>
                + Child
              </Button>
              <Button size="small" variant="danger" onClick={handleRemove}>
                Remove
              </Button>
            </div>
          </div>

          <LogicNodeForm nodeId={nodeId} />

          {/* Drop zone to add as child - shown when dragging */}
          {showDropAsChild && <DropZoneAsChild nodeId={nodeId} />}

          {!isCollapsed && hasChildren && (
            <div className={styles.childrenContainer}>
              <div className={styles.childrenLabel}>
                Children ({node.childIds.length})
              </div>
              <div className={styles.children}>
                {node.childIds.map((childId, childIndex) => (
                  <LogicNode
                    key={childId}
                    nodeId={childId}
                    depth={depth + 1}
                    index={childIndex}
                  />
                ))}
                <DropZoneBetween parentId={nodeId} index={node.childIds.length} />
              </div>
            </div>
          )}

          {isCollapsed && hasChildren && (
            <div className={styles.collapsedIndicator}>
              ... {node.childIds.length} child{node.childIds.length !== 1 ? 'ren' : ''} hidden
            </div>
          )}
        </div>
      </div>
    </>
  );
};
