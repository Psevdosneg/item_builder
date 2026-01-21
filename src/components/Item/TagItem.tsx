import React, { useMemo } from 'react';
import { SearchableSelect } from '../common/SearchableSelect';
import type { SearchableSelectOption } from '../common/SearchableSelect';
import { Button } from '../common/Button';
import { AVAILABLE_TAGS } from '../../utils/tags';
import styles from './TagItem.module.css';

export interface TagItemProps {
  id: string;
  value: string;
  onValueChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}

export const TagItem: React.FC<TagItemProps> = ({
  id,
  value,
  onValueChange,
  onRemove,
}) => {
  // Create select options from AVAILABLE_TAGS
  const tagOptions: SearchableSelectOption[] = useMemo(() => {
    return AVAILABLE_TAGS.map((tagName) => ({
      value: tagName,
      label: tagName,
    }));
  }, []);

  return (
    <div className={styles.tagItem}>
      <SearchableSelect
        value={value}
        options={tagOptions}
        onChange={(newValue) => onValueChange(id, newValue)}
        placeholder="Search tags..."
        fullWidth
      />
      <Button
        size="small"
        variant="danger"
        onClick={() => onRemove(id)}
        aria-label="Remove tag"
      >
        ×
      </Button>
    </div>
  );
};
