// Import stats from preset file
import statsData from '../../presets/stats.json';

/**
 * Available stat names for items, loaded from stats.json preset file
 */
export const STAT_NAMES = statsData as readonly string[];

/**
 * Get all available stat names
 */
export function getAllStatNames(): readonly string[] {
  return STAT_NAMES;
}
