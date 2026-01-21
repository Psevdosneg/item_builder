import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  removeNode,
  addChildNode,
  toggleNodeCollapse,
  copyNode,
} from '../../features/logic/logicSlice';
import { LogicNodeForm } from './LogicNodeForm';
import { Button } from '../common/Button';
import styles from './LogicNode.module.css';

interface LogicNodeProps {
  nodeId: string;
  depth: number;
}

export const LogicNode: React.FC<LogicNodeProps> = ({ nodeId, depth }) => {
  const dispatch = useAppDispatch();
  const node = useAppSelector((state) => state.logic.nodes[nodeId]);

  if (!node) return null;

  const hasChildren = node.childIds.length > 0;
  const isCollapsed = node.isCollapsed;

  const handleRemove = () => {
    if (window.confirm('Remove this node and all its children?')) {
      dispatch(removeNode(nodeId));
    }
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

  return (
    <div className={styles.nodeWrapper} data-depth={depth}>
      <div className={styles.node}>
        <div className={styles.nodeHeader}>
          <div className={styles.leftSection}>
            <span className={styles.depthIndicator}>L{depth}</span>
            {hasChildren && (
              <button
                className={`${styles.collapseButton} ${isCollapsed ? styles.collapsed : ''}`}
                onClick={handleToggleCollapse}
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
              >
                ▼
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

        {!isCollapsed && hasChildren && (
          <div className={styles.childrenContainer}>
            <div className={styles.childrenLabel}>
              Children ({node.childIds.length})
            </div>
            <div className={styles.children}>
              {node.childIds.map((childId) => (
                <LogicNode key={childId} nodeId={childId} depth={depth + 1} />
              ))}
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
  );
};
