import React from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import styles from './ChargeItem.module.css';

export interface ChargeItemProps {
  id: string;
  name: string;
  value: number;
  onNameChange: (id: string, name: string) => void;
  onValueChange: (id: string, value: number) => void;
  onRemove: (id: string) => void;
}

export const ChargeItem: React.FC<ChargeItemProps> = ({
  id,
  name,
  value,
  onNameChange,
  onValueChange,
  onRemove,
}) => {
  return (
    <div className={styles.chargeItem}>
      <div className={styles.inputs}>
        <Input
          type="text"
          placeholder="Charge name"
          value={name}
          onChange={(e) => onNameChange(id, e.target.value)}
          fullWidth
        />
        <Input
          type="number"
          placeholder="Max charges"
          value={value.toString()}
          onChange={(e) => onValueChange(id, parseInt(e.target.value) || 0)}
          fullWidth
        />
      </div>
      <Button
        size="small"
        variant="danger"
        onClick={() => onRemove(id)}
        aria-label="Remove charge"
      >
        ×
      </Button>
    </div>
  );
};
