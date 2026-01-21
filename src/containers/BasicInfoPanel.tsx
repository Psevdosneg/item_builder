import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setName, setWeight, setIco, setDescription } from '../features/item/itemSlice';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { TagsList } from '../components/Item';
import { GridEditor } from '../components/Grid/GridEditor';
import styles from './BasicInfoPanel.module.css';

export const BasicInfoPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { name, weight, ico, description } = useAppSelector((state) => state.item);

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Basic Info</h2>

      <Input
        label="Item Name"
        value={name}
        onChange={(e) => dispatch(setName(e.target.value))}
        placeholder="Enter item name"
      />

      <Input
        label="Weight"
        type="number"
        value={weight}
        onChange={(e) => dispatch(setWeight(Number(e.target.value)))}
        min={1}
      />

      <Input
        label="Icon UID"
        value={ico}
        onChange={(e) => dispatch(setIco(e.target.value))}
        placeholder="uid://..."
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => dispatch(setDescription(e.target.value))}
        placeholder="Enter item description"
        rows={3}
      />

      <TagsList />

      <div className={styles.section}>
        <GridEditor />
      </div>
    </div>
  );
};
