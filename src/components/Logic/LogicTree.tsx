import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleTreeView } from '../../features/logic/logicSlice';
import { selectTreeStats } from '../../features/logic/logicSelectors';
import { TreeNode } from './TreeNode';
import { Button } from '../common/Button';
import styles from './LogicTree.module.css';

export const LogicTree: React.FC = () => {
  const dispatch = useAppDispatch();
  const rootNodeIds = useAppSelector((state) => state.logic.rootNodeIds);
  const isVisible = useAppSelector((state) => state.logic.treeView.visible);
  const treeStats = useAppSelector(selectTreeStats);

  const hasNodes = rootNodeIds.length > 0;

  const handleToggle = () => {
    dispatch(toggleTreeView());
  };

  if (!hasNodes) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>Tree Visualization</h4>
        <Button size="small" variant="secondary" onClick={handleToggle}>
          {isVisible ? 'Hide' : 'Show'} Tree
        </Button>
      </div>

      {isVisible && (
        <>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Nodes:</span>
              <span className={styles.statValue}>{treeStats.total}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Max Depth:</span>
              <span className={styles.statValue}>{treeStats.maxDepth}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Triggers:</span>
              <span className={styles.statValue} style={{ color: '#00ff88' }}>
                {treeStats.triggers}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Checkers:</span>
              <span className={styles.statValue} style={{ color: '#00d4ff' }}>
                {treeStats.checkers}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Activators:</span>
              <span className={styles.statValue} style={{ color: '#ff8800' }}>
                {treeStats.activators}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Auras:</span>
              <span className={styles.statValue} style={{ color: '#ff00ff' }}>
                {treeStats.auras}
              </span>
            </div>
          </div>

          <div className={styles.tree}>
            {rootNodeIds.map((nodeId, index) => (
              <TreeNode
                key={nodeId}
                nodeId={nodeId}
                depth={0}
                isLast={index === rootNodeIds.length - 1}
                prefix=""
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
