import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addTag, updateTag, removeTag, reorderTags } from '../../features/item/itemSlice';
import { TagItem } from './TagItem';
import { Button } from '../common/Button';
import { AVAILABLE_TAGS } from '../../utils/tags';
import styles from './TagsList.module.css';

export const TagsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const tags = useAppSelector((state) => state.item.tags);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      dispatch(reorderTags({ activeId: active.id as string, overId: over.id as string }));
    }
  };

  const handleAddTag = () => {
    const usedTags = tags.map((t) => t.value);
    const availableTag = AVAILABLE_TAGS.find((tag) => !usedTags.includes(tag));
    if (availableTag) dispatch(addTag(availableTag));
  };

  const canAddMoreTags = tags.length < AVAILABLE_TAGS.length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label className={styles.label}>Item Tags</label>
        <Button size="small" onClick={handleAddTag} disabled={!canAddMoreTags}>
          + Add Tag
        </Button>
      </div>

      <div className={styles.tagsList}>
        {tags.length === 0 ? (
          <p className={styles.empty}>No tags. Click "Add Tag" to create one.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tags.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {tags.map((tag) => (
                <TagItem
                  key={tag.id}
                  id={tag.id}
                  value={tag.value}
                  onValueChange={(id, value) => dispatch(updateTag({ id, value }))}
                  onRemove={(id) => dispatch(removeTag(id))}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};
