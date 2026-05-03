import React from 'react';
import { useAppDispatch } from '../../app/hooks';
import { addNode } from '../../features/logic/logicSlice';
import type { LogicNodePreset } from '../../types/logic.types';
import { Button } from '../common/Button';
import styles from './LogicPresets.module.css';

const PRESETS: LogicNodePreset[] = [
  {
    name: 'Cooldown Weapon',
    nodeType: 'trigger',
    data: {
      type: 'onAttack',
      cooldown: 1.0,
      condition: 'target.isEnemy',
    },
  },
  {
    name: 'Aura Effect',
    nodeType: 'aura',
    data: {
      radius: 5,
      tickRate: 0.5,
      targetType: 'allies',
      effect: 'heal',
    },
  },
  {
    name: 'Spawner',
    nodeType: 'activator',
    data: {
      type: 'spawn',
      entityId: 'minion',
      count: 1,
      offset: { x: 0, y: 0 },
    },
  },
  {
    name: 'Resource Change',
    nodeType: 'activator',
    data: {
      type: 'modifyResource',
      resource: 'health',
      amount: 10,
      target: 'self',
    },
  },
];

export const LogicPresets: React.FC = () => {
  const dispatch = useAppDispatch();

  const handlePresetClick = (preset: LogicNodePreset) => {
    dispatch(addNode({ preset }));
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Quick Presets</h4>
      <div className={styles.presets}>
        {PRESETS.map((preset, index) => (
          <Button
            key={index}
            size="small"
            variant="secondary"
            onClick={() => handlePresetClick(preset)}
          >
            + {preset.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
