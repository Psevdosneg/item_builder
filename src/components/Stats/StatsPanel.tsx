import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  setDefaultStat,
  addCustomStat,
  updateCustomStat,
  removeCustomStat,
} from '../../features/stats/statsSlice';
import { StatItem } from './StatItem';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import styles from './StatsPanel.module.css';

export const StatsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { defaultStats, customStats } = useAppSelector((state) => state.stats);

  const handleAddCustomStat = () => {
    dispatch(addCustomStat({ name: '', value: 0 }));
  };

  const handleCustomStatNameChange = (id: string, name: string) => {
    dispatch(updateCustomStat({ id, updates: { name } }));
  };

  const handleCustomStatValueChange = (id: string, value: number) => {
    dispatch(updateCustomStat({ id, updates: { value } }));
  };

  const handleRemoveCustomStat = (id: string) => {
    dispatch(removeCustomStat(id));
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Default Stats</h3>
        <div className={styles.defaultStats}>
          <div className={styles.defaultStatItem}>
            <label className={styles.label}>Price</label>
            <Input
              type="number"
              value={defaultStats.price.toString()}
              onChange={(e) =>
                dispatch(setDefaultStat({ key: 'price', value: parseFloat(e.target.value) || 0 }))
              }
              fullWidth
            />
          </div>
          <div className={styles.defaultStatItem}>
            <label className={styles.label}>Level</label>
            <Input
              type="number"
              value={defaultStats.level.toString()}
              onChange={(e) =>
                dispatch(setDefaultStat({ key: 'level', value: parseInt(e.target.value) || 0 }))
              }
              fullWidth
            />
          </div>
          <div className={styles.defaultStatItem}>
            <label className={styles.label}>Max Level</label>
            <Input
              type="number"
              value={defaultStats.maxLevel.toString()}
              onChange={(e) =>
                dispatch(setDefaultStat({ key: 'maxLevel', value: parseInt(e.target.value) || 0 }))
              }
              fullWidth
            />
          </div>
          <div className={styles.defaultStatItem}>
            <label className={styles.label}>Rarity</label>
            <Input
              type="number"
              value={defaultStats.rarity.toString()}
              onChange={(e) =>
                dispatch(setDefaultStat({ key: 'rarity', value: parseInt(e.target.value) || 0 }))
              }
              fullWidth
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Custom Stats</h3>
          <Button size="small" onClick={handleAddCustomStat}>
            + Add Stat
          </Button>
        </div>

        <div className={styles.customStats}>
          {customStats.length === 0 ? (
            <p className={styles.empty}>No custom stats. Click "Add Stat" to create one.</p>
          ) : (
            customStats
              .filter((stat): stat is typeof stat & { id: string } => stat.id !== undefined)
              .map((stat) => (
                <StatItem
                  key={stat.id}
                  id={stat.id}
                  name={stat.name}
                  value={stat.value}
                  onNameChange={handleCustomStatNameChange}
                  onValueChange={handleCustomStatValueChange}
                  onRemove={handleRemoveCustomStat}
                  isRemovable={true}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
};
