import React, { useState } from 'react';
import { LogicBuilder } from '../components/Logic/LogicBuilder';
import { LogicTree } from '../components/Logic/LogicTree';
import styles from './LogicContainer.module.css';

export const LogicContainer: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Logic System</h2>
        <button
          className={styles.collapseButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {!isCollapsed && (
        <div className={styles.content}>
          <LogicBuilder />
          <LogicTree />
        </div>
      )}
    </div>
  );
};
