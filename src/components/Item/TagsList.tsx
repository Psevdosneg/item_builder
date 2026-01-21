import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addTag, updateTag, removeTag } from '../../features/item/itemSlice';
import { TagItem } from './TagItem';
import { Button } from '../common/Button';
import { AVAILABLE_TAGS } from '../../utils/tags';
import styles from './TagsList.module.css';

export const TagsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const tags = useAppSelector((state) => state.item.tags);

  const handleAddTag = () => {
    // Find first available tag that's not already in use
    const usedTags = tags.map(t => t.value);
    const availableTag = AVAILABLE_TAGS.find(tag => !usedTags.includes(tag));

    if (availableTag) {
      dispatch(addTag(availableTag));
    }
  };

  const handleUpdateTag = (id: string, value: string) => {
    dispatch(updateTag({ id, value }));
  };

  const handleRemoveTag = (id: string) => {
    dispatch(removeTag(id));
  };

  const canAddMoreTags = tags.length < AVAILABLE_TAGS.length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label className={styles.label}>Item Tags</label>
        <Button
          size="small"
          onClick={handleAddTag}
          disabled={!canAddMoreTags}
        >
          + Add Tag
        </Button>
      </div>

      <div className={styles.tagsList}>
        {tags.length === 0 ? (
          <p className={styles.empty}>No tags. Click "Add Tag" to create one.</p>
        ) : (
          tags.map((tag) => (
            <TagItem
              key={tag.id}
              id={tag.id}
              value={tag.value}
              onValueChange={handleUpdateTag}
              onRemove={handleRemoveTag}
            />
          ))
        )}
      </div>
    </div>
  );
};
