import React from 'react';
import { StatsPanel } from '../components/Stats/StatsPanel';
import { ChargesList } from '../components/Stats/ChargesList';
import styles from './StatsContainer.module.css';

export const StatsContainer: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Stats & Charges</h2>
      </div>

      <div className={styles.content}>
        <StatsPanel />
        <ChargesList />
      </div>
    </div>
  );
};
