import type {
  NodeType,
  LevelData,
  TriggerNodeData,
  CheckerNodeData,
  ActivatorNodeData,
  AuraNodeData,
  ConditionalNodeData,
  CounterNodeData,
} from '../types/logic.types';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validate level-based data array
 */
function validateLevelDataArray<T>(
  data: any,
  fieldName: string,
  validator: (item: T, level: number) => ValidationResult
): ValidationResult {
  if (!Array.isArray(data)) {
    return {
      valid: false,
      error: `${fieldName} must be an array`,
    };
  }

  if (data.length === 0) {
    return {
      valid: false,
      error: `${fieldName} must have at least one level`,
    };
  }

  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    // Validate level field
    if (typeof item.level !== 'number') {
      return {
        valid: false,
        error: `${fieldName}[${i}].level must be a number`,
      };
    }

    // Validate data field exists
    if (!item.data) {
      return {
        valid: false,
        error: `${fieldName}[${i}].data is required`,
      };
    }

    // Run custom validator on data
    const result = validator(item.data, item.level);
    if (!result.valid) {
      return {
        valid: false,
        error: `${fieldName}[${i}] (level ${item.level}): ${result.error}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate required fields in an object
 */
function validateRequiredFields(
  data: any,
  fields: Array<{ name: string; type: string; optional?: boolean }>
): ValidationResult {
  for (const field of fields) {
    const value = data[field.name];

    // Check if field exists
    if (value === undefined || value === null) {
      if (!field.optional) {
        return {
          valid: false,
          error: `Missing required field: ${field.name}`,
        };
      }
      continue;
    }

    // Check field type
    const actualType = Array.isArray(value) ? 'array' : typeof value;

    if (field.type === 'array' && !Array.isArray(value)) {
      return {
        valid: false,
        error: `Field '${field.name}' must be an array`,
      };
    } else if (field.type !== 'array' && actualType !== field.type) {
      return {
        valid: false,
        error: `Field '${field.name}' must be of type ${field.type}, got ${actualType}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate that a value is one of the allowed values
 */
function validateEnum(
  value: any,
  fieldName: string,
  allowedValues: readonly string[]
): ValidationResult {
  if (!allowedValues.includes(value)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}. Got: ${value}`,
    };
  }
  return { valid: true };
}

/**
 * Validate JSON string
 */
export const validateJSON = (jsonString: string): ValidationResult => {
  if (!jsonString || jsonString.trim() === '') {
    return { valid: true }; // Empty is valid
  }

  try {
    JSON.parse(jsonString);
    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON';
    return {
      valid: false,
      error: `JSON Parse Error: ${message}`,
    };
  }
};

/**
 * Validate node data based on node type
 * This is basic validation - can be extended with more specific rules
 */
export const validateNodeData = (
  nodeType: NodeType,
  data: any
): ValidationResult => {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      error: 'Data must be an object',
    };
  }

  switch (nodeType) {
    case 'trigger':
      return validateTriggerData(data);
    case 'checker':
      return validateCheckerData(data);
    case 'activator':
      return validateActivatorData(data);
    case 'aura':
      return validateAuraData(data);
    case 'conditional':
      return validateConditionalData(data);
    case 'counter':
      return validateCounterData(data);
    default:
      return { valid: true };
  }
};

/**
 * Validate trigger data
 */
const validateTriggerData = (data: any): ValidationResult => {
  if (!data.triggerType) {
    return {
      valid: false,
      error: 'Trigger must have triggerType field',
    };
  }

  const validTriggerTypes = [
    'cooldown',
    'itemActivated',
    'changeBattleState',
    'cripSpawn',
    'cripDeath',
    'itemChargesChanged',
  ];

  if (!validTriggerTypes.includes(data.triggerType)) {
    return {
      valid: false,
      error: `Invalid triggerType: ${data.triggerType}. Valid types: ${validTriggerTypes.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Validate checker data
 */
const validateCheckerData = (data: any): ValidationResult => {
  if (!data.checkerType) {
    return {
      valid: false,
      error: 'Checker must have checkerType field',
    };
  }

  const validCheckerTypes = [
    'cooldown',
    'chargePrice',
    'allyPrice',
    'resourcePrice',
    'battleState',
    'itemConditional',
    'cripConditional',
  ];

  const typeValidation = validateEnum(
    data.checkerType,
    'checkerType',
    validCheckerTypes
  );
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Type-specific validation (only validate if using level-based structure)
  switch (data.checkerType) {
    case 'cooldown':
      // No additional data required
      return { valid: true };

    case 'resourcePrice':
      // Accept both simple preset format and complex level-based format
      if (data.data) {
        // Level-based format
        return validateLevelDataArray(
          data.data,
          'data',
          (item: any) => validateRequiredFields(item, [
            { name: 'resource', type: 'string' },
            { name: 'count', type: 'number' },
          ])
        );
      }
      // Simple preset format - just check for basic fields
      return { valid: true };

    case 'chargePrice':
      if (data.data) {
        return validateLevelDataArray(
          data.data,
          'data',
          (item: any) => validateRequiredFields(item, [
            { name: 'charge', type: 'string' },
            { name: 'count', type: 'number' },
          ])
        );
      }
      return { valid: true };

    case 'allyPrice':
      if (data.data) {
        return validateLevelDataArray(
          data.data,
          'data',
          (item: any) => validateRequiredFields(item, [
            { name: 'count', type: 'number' },
          ])
        );
      }
      return { valid: true };

    case 'battleState':
      // Accept both formats
      if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
        return validateRequiredFields(data.data, [
          { name: 'battleState', type: 'string' },
        ]);
      }
      return { valid: true };

    case 'itemConditional':
    case 'cripConditional':
      // These can have any data structure
      return { valid: true };

    default:
      return { valid: true };
  }
};

/**
 * Validate activator data
 */
const validateActivatorData = (data: any): ValidationResult => {
  if (!data.activatorType) {
    return {
      valid: false,
      error: 'Activator must have activatorType field',
    };
  }

  const validActivatorTypes = [
    'damage',
    'heal',
    'changeResource',
    'spawner',
    'impulseItem',
    'addItemStateTag',
    'chargeItem',
    'changeItemCharge',
  ];

  const typeValidation = validateEnum(
    data.activatorType,
    'activatorType',
    validActivatorTypes
  );
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Type-specific validation (only validate if using level-based structure)
  switch (data.activatorType) {
    case 'damage':
    case 'heal':
      // No additional data required for simple format
      return { valid: true };

    case 'changeResource':
      if (data.data) {
        return validateLevelDataArray(
          data.data,
          'data',
          (item: any) => validateRequiredFields(item, [
            { name: 'resource', type: 'string' },
            { name: 'value', type: 'number' },
          ])
        );
      }
      return { valid: true };

    case 'spawner':
      if (data.data) {
        return validateLevelDataArray(
          data.data,
          'data',
          (item: any) => {
            const fieldsValidation = validateRequiredFields(item, [
              { name: 'characterId', type: 'string' },
              { name: 'relative', type: 'string' },
            ]);
            if (!fieldsValidation.valid) return fieldsValidation;

            // Validate relative field
            if (item.relative !== 'ally' && item.relative !== 'enemy') {
              return {
                valid: false,
                error: `relative must be 'ally' or 'enemy', got: ${item.relative}`,
              };
            }
            return { valid: true };
          }
        );
      }
      return { valid: true };

    case 'impulseItem':
      if (data.data) {
        return validateLevelDataArray(
          data.data,
          'data',
          (item: any) => validateRequiredFields(item, [
            { name: 'value', type: 'number' },
          ])
        );
      }
      return { valid: true };

    case 'addItemStateTag':
      if (data.data) {
        return validateLevelDataArray(
          data.data,
          'data',
          (item: any) => {
            const result = validateRequiredFields(item, [
              { name: 'tags', type: 'array' },
            ]);
            if (!result.valid) return result;

            // Validate each tag in array
            for (let i = 0; i < item.tags.length; i++) {
              const tag = item.tags[i];
              const tagValidation = validateRequiredFields(tag, [
                { name: 'time', type: 'number' },
                { name: 'tag', type: 'string' },
              ]);
              if (!tagValidation.valid) {
                return {
                  valid: false,
                  error: `tags[${i}]: ${tagValidation.error}`,
                };
              }
            }
            return { valid: true };
          }
        );
      }
      return { valid: true };

    case 'chargeItem':
    case 'changeItemCharge':
      if (data.data) {
        return validateLevelDataArray(
          data.data,
          'data',
          (item: any) => validateRequiredFields(item, [
            { name: 'charge', type: 'string' },
            { name: 'count', type: 'number' },
          ])
        );
      }
      return { valid: true };

    default:
      return { valid: true };
  }
};

/**
 * Validate aura data
 */
const validateAuraData = (data: any): ValidationResult => {
  if (!data.effectType) {
    return {
      valid: false,
      error: 'Aura must have effectType field',
    };
  }

  const effectTypeValidation = validateEnum(
    data.effectType,
    'effectType',
    ['item', 'character']
  );
  if (!effectTypeValidation.valid) {
    return effectTypeValidation;
  }

  // Accept both simple preset format and complex level-based format
  if (data.modificateStats) {
    // Simple preset format: array of {statId, value}
    if (Array.isArray(data.modificateStats)) {
      // Check if it's simple format (array of stat objects)
      if (data.modificateStats.length === 0) {
        return { valid: true };
      }

      const firstItem = data.modificateStats[0];
      // Simple format
      if (firstItem.statId !== undefined || firstItem.name !== undefined) {
        for (let i = 0; i < data.modificateStats.length; i++) {
          const stat = data.modificateStats[i];
          if (typeof stat.value !== 'number') {
            return {
              valid: false,
              error: `modificateStats[${i}].value must be a number`,
            };
          }
        }
        return { valid: true };
      }

      // Level-based format
      if (firstItem.level !== undefined) {
        return validateLevelDataArray(
          data.modificateStats,
          'modificateStats',
          (item: any) => {
            if (!Array.isArray(item)) {
              return {
                valid: false,
                error: 'modificateStats data must be an array',
              };
            }

            for (let i = 0; i < item.length; i++) {
              const stat = item[i];
              const statValidation = validateRequiredFields(stat, [
                { name: 'name', type: 'string' },
                { name: 'value', type: 'number' },
              ]);
              if (!statValidation.valid) {
                return {
                  valid: false,
                  error: `stat[${i}]: ${statValidation.error}`,
                };
              }
            }
            return { valid: true };
          }
        );
      }
    }
  }

  // Old format with data.modificateStats
  if (data.data) {
    if (typeof data.data.isDebuff !== 'boolean') {
      return {
        valid: false,
        error: 'Aura data.isDebuff must be a boolean',
      };
    }

    if (!Array.isArray(data.data.modificateStats)) {
      return {
        valid: false,
        error: 'Aura data.modificateStats must be an array',
      };
    }

    return validateLevelDataArray(
      data.data.modificateStats,
      'data.modificateStats',
      (item: any) => {
        if (!Array.isArray(item)) {
          return {
            valid: false,
            error: 'modificateStats data must be an array',
          };
        }

        for (let i = 0; i < item.length; i++) {
          const stat = item[i];
          const statValidation = validateRequiredFields(stat, [
            { name: 'name', type: 'string' },
            { name: 'value', type: 'number' },
          ]);
          if (!statValidation.valid) {
            return {
              valid: false,
              error: `stat[${i}]: ${statValidation.error}`,
            };
          }
        }

        return { valid: true };
      }
    );
  }

  return { valid: true };
};

/**
 * Validate conditional data
 */
const validateConditionalData = (data: any): ValidationResult => {
  if (!data.conditionalType) {
    return {
      valid: false,
      error: 'Conditional must have conditionalType field',
    };
  }

  const validConditionalTypes = [
    'characterRelative',
    'characterRandom',
    'characterSelf',
    'battleState',
    'itemTag',
    'itemSelf',
    'itemPosition',
    'characterTag',
    'characterResources',
  ];

  if (!validConditionalTypes.includes(data.conditionalType)) {
    return {
      valid: false,
      error: `Invalid conditionalType: ${data.conditionalType}. Valid types: ${validConditionalTypes.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Validate counter data
 */
const validateCounterData = (data: any): ValidationResult => {
  // Accept both 'type' and 'counterType' fields
  const typeField = data.counterType || data.type;

  if (!typeField) {
    return {
      valid: false,
      error: 'Counter must have counterType or type field',
    };
  }

  const validCounterTypes = [
    'resources',
    'character',
    'item',
  ];

  if (!validCounterTypes.includes(typeField)) {
    return {
      valid: false,
      error: `Invalid counter type: ${typeField}. Valid types: ${validCounterTypes.join(', ')}`,
    };
  }

  return { valid: true };
};
