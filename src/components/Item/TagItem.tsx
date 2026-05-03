import React, { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

export const TagItem: React.FC<TagItemProps> = ({ id, value, onValueChange, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : undefined,
  };

  const tagOptions: SearchableSelectOption[] = useMemo(
    () => AVAILABLE_TAGS.map((tagName) => ({ value: tagName, label: tagName })),
    []
  );

  return (
    <div ref={setNodeRef} style={style} className={styles.tagItem}>
      <div className={styles.dragHandle} {...attributes} {...listeners} title="Drag to reorder">
        ⠿
      </div>
      <SearchableSelect
        value={value}
        options={tagOptions}
        onChange={(newValue) => onValueChange(id, newValue)}
        placeholder="Search tags..."
        fullWidth
      />
      <Button size="small" variant="danger" onClick={() => onRemove(id)} aria-label="Remove tag">
        ×
      </Button>
    </div>
  );
};
