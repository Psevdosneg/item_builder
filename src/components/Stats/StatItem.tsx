import React, { useMemo } from 'react';
import { Input } from '../common/Input';
import { SearchableSelect } from '../common/SearchableSelect';
import type { SearchableSelectOption } from '../common/SearchableSelect';
import { Button } from '../common/Button';
import { STAT_NAMES } from '../../utils/constants';
import styles from './StatItem.module.css';

export interface StatItemProps {
  id: string;
  name: string;
  value: number;
  onNameChange: (id: string, name: string) => void;
  onValueChange: (id: string, value: number) => void;
  onRemove: (id: string) => void;
  isRemovable?: boolean;
}

export const StatItem: React.FC<StatItemProps> = ({
  id,
  name,
  value,
  onNameChange,
  onValueChange,
  onRemove,
  isRemovable = true,
}) => {
  // Create select options from STAT_NAMES
  const statOptions: SearchableSelectOption[] = useMemo(() => {
    return STAT_NAMES.map((statName) => ({
      value: statName,
      label: statName,
    }));
  }, []);

  return (
    <div className={styles.statItem}>
      <div className={styles.inputs}>
        <SearchableSelect
          value={name}
          options={statOptions}
          onChange={(value) => onNameChange(id, value)}
          placeholder="Search stats..."
          fullWidth
        />
        <Input
          type="number"
          placeholder="Value"
          value={value.toString()}
          onChange={(e) => onValueChange(id, parseFloat(e.target.value) || 0)}
          fullWidth
        />
      </div>
      {isRemovable && (
        <Button
          size="small"
          variant="danger"
          onClick={() => onRemove(id)}
          aria-label="Remove stat"
        >
          ×
        </Button>
      )}
    </div>
  );
};
