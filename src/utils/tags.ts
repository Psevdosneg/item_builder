// Import tags from preset file
import tagsData from '../data/presets/tags.json';

/**
 * Available tags for items, loaded from tags.json preset file
 */
export const AVAILABLE_TAGS = tagsData as readonly string[];

/**
 * Get all available tags
 */
export function getAllTags(): readonly string[] {
  return AVAILABLE_TAGS;
}
