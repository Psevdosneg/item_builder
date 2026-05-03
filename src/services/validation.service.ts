import type { NodeType } from '../types/logic.types';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validate and format JSON string
 * Only checks syntax, does not validate against schema
 */
export const validateJSON = (jsonString: string): ValidationResult => {
  if (!jsonString || jsonString.trim() === '') {
    return { valid: true, formatted: '' };
  }

  try {
    const parsed = JSON.parse(jsonString);
    const formatted = JSON.stringify(parsed, null, 2);
    return { valid: true, formatted };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON';
    return {
      valid: false,
      error: `JSON Parse Error: ${message}`,
    };
  }
};

/**
 * Validate and format node data
 * Only checks that data is valid JSON object, does not validate structure
 */
export const validateNodeData = (
  _nodeType: NodeType,
  data: unknown
): ValidationResult => {
  if (data === null || data === undefined) {
    return { valid: true };
  }

  if (typeof data !== 'object') {
    return {
      valid: false,
      error: 'Data must be an object',
    };
  }

  try {
    const formatted = JSON.stringify(data, null, 2);
    return { valid: true, formatted };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid data';
    return {
      valid: false,
      error: message,
    };
  }
};

/**
 * Format JSON string with proper indentation
 */
export const formatJSON = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString;
  }
};
