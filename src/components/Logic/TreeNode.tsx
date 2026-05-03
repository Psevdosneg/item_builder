import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleTreeNodeCollapse } from '../../features/logic/logicSlice';
import type { NodeType } from '../../types/logic.types';
import styles from './TreeNode.module.css';

interface TreeNodeProps {
  nodeId: string;
  depth: number;
  isLast: boolean;
  prefix: string;
}

export const TreeNode: React.FC<TreeNodeProps> = ({ nodeId, depth, isLast, prefix }) => {
  const dispatch = useAppDispatch();
  const node = useAppSelector((state) => state.logic.nodes[nodeId]);
  const collapsedTreeNodes = useAppSelector((state) => state.logic.treeView.collapsedTreeNodes);

  if (!node) return null;

  const hasChildren = node.childIds.length > 0;
  const isCollapsed = collapsedTreeNodes.includes(nodeId);
  const connector = isLast ? '└─' : '├─';
  const childPrefix = prefix + (isLast ? '  ' : '│ ');

  const getNodeTypeColor = (type: NodeType): string => {
    const colors: Record<NodeType, string> = {
      trigger: '#00ff88',
      checker: '#00d4ff',
      activator: '#ff8800',
      aura: '#ff00ff',
      conditional: '#ffff00',
      counter: '#ff4488',
    };
    return colors[type] || '#888';
  };

  const handleToggle = () => {
    if (hasChildren) {
      dispatch(toggleTreeNodeCollapse(nodeId));
    }
  };

  return (
    <div className={styles.treeNode}>
      <div className={styles.nodeLine} onClick={handleToggle} style={{ cursor: hasChildren ? 'pointer' : 'default' }}>
        <span className={styles.prefix}>{prefix}</span>
        <span className={styles.connector}>{connector}</span>
        {hasChildren && (
          <span className={styles.expandIcon}>{isCollapsed ? '▶' : '▼'}</span>
        )}
        <span
          className={styles.nodeType}
          style={{ color: getNodeTypeColor(node.nodeType) }}
        >
          {node.nodeType}
        </span>
        {hasChildren && (
          <span className={styles.childCount}>({node.childIds.length})</span>
        )}
      </div>

      {hasChildren && !isCollapsed && (
        <div className={styles.children}>
          {node.childIds.map((childId, index) => (
            <TreeNode
              key={childId}
              nodeId={childId}
              depth={depth + 1}
              isLast={index === node.childIds.length - 1}
              prefix={childPrefix}
            />
          ))}
        </div>
      )}
    </div>
  );
};
