import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addCharge, updateCharge, removeCharge } from '../../features/stats/statsSlice';
import { ChargeItem } from './ChargeItem';
import { Button } from '../common/Button';
import styles from './ChargesList.module.css';

export const ChargesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const charges = useAppSelector((state) => state.stats.charges);

  const handleAddCharge = () => {
    dispatch(addCharge({ name: '', value: 1 }));
  };

  const handleNameChange = (id: string, name: string) => {
    dispatch(updateCharge({ id, updates: { name } }));
  };

  const handleValueChange = (id: string, value: number) => {
    dispatch(updateCharge({ id, updates: { value } }));
  };

  const handleRemove = (id: string) => {
    dispatch(removeCharge(id));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Charges</h3>
        <Button size="small" onClick={handleAddCharge}>
          + Add Charge
        </Button>
      </div>

      <div className={styles.list}>
        {charges.length === 0 ? (
          <p className={styles.empty}>No charges defined. Click "Add Charge" to create one.</p>
        ) : (
          charges
            .filter((charge): charge is typeof charge & { id: string } => charge.id !== undefined)
            .map((charge) => (
              <ChargeItem
                key={charge.id}
                id={charge.id}
                name={charge.name}
                value={charge.value}
                onNameChange={handleNameChange}
                onValueChange={handleValueChange}
                onRemove={handleRemove}
              />
            ))
        )}
      </div>
    </div>
  );
};
