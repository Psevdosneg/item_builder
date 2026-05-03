import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { updateNode, updateNodeData } from '../../features/logic/logicSlice';
import { Select } from '../common/Select';
import type { SelectOption } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import type { NodeType } from '../../types/logic.types';
import { createDefaultNodeData } from '../../types/logic.types';
import { validateNodeData } from '../../services/validation.service';
import { getPresetsForType } from '../../utils/nodePresets';
import { LevelDataEditor } from './LevelDataEditor';
import type { LevelEntry } from './LevelDataEditor';
import { ItemPositionGridEditor } from './ItemPositionGridEditor';
import styles from './LogicNodeForm.module.css';

// ─── Preset Matching Helpers ─────────────────────────────────────────────────

/** Returns the discriminant key for a given node type (e.g. 'checkerType'). */
function getSubtypeKey(nodeType: string): string {
  switch (nodeType) {
    case 'trigger':     return 'triggerType';
    case 'checker':     return 'checkerType';
    case 'activator':   return 'activatorType';
    case 'aura':        return 'effectType';
    case 'conditional': return 'conditionalType';
    case 'counter':     return 'counterType';
    default:            return '';
  }
}

/**
 * Finds the index (as string) of the preset whose discriminant value
 * matches nodeData's discriminant value, or '' if not found.
 */
function findMatchingPresetIndex(nodeType: string, nodeData: unknown): string {
  const key = getSubtypeKey(nodeType);
  if (!key) return '';
  const data = nodeData as Record<string, unknown>;
  const value = data?.[key] as string | undefined;
  if (!value) return '';
  const presets = getPresetsForType(nodeType);
  const idx = presets.findIndex(
    (p) => (p.data as Record<string, unknown>)[key] === value
  );
  return idx >= 0 ? idx.toString() : '';
}

// ─── Level Data Helpers ───────────────────────────────────────────────────────

function isLevelDataArray(value: unknown): value is LevelEntry[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'level' in item &&
        'data' in item
    )
  );
}

/**
 * Returns the dot-path to the LevelData[] within nodeData, or null if not found.
 * Checks 'data' directly, then 'data.modificateStats' (aura).
 * Add more paths here when new node shapes are introduced.
 */
function detectLevelDataPath(nodeData: unknown): string | null {
  if (!nodeData || typeof nodeData !== 'object') return null;
  const obj = nodeData as Record<string, unknown>;

  if (isLevelDataArray(obj.data)) return 'data';

  if (obj.data && typeof obj.data === 'object') {
    const inner = obj.data as Record<string, unknown>;
    if (isLevelDataArray(inner.modificateStats)) return 'data.modificateStats';
  }

  return null;
}

function getLevelArray(nodeData: unknown, path: string): LevelEntry[] {
  const obj = nodeData as Record<string, unknown>;
  if (path === 'data') return (obj.data as LevelEntry[]) ?? [];
  if (path === 'data.modificateStats') {
    const inner = obj.data as Record<string, unknown>;
    return (inner?.modificateStats as LevelEntry[]) ?? [];
  }
  return [];
}

function applyLevelArray(
  nodeData: unknown,
  path: string,
  levels: LevelEntry[]
): Record<string, unknown> {
  const obj = nodeData as Record<string, unknown>;
  if (path === 'data') return { ...obj, data: levels };
  if (path === 'data.modificateStats') {
    return {
      ...obj,
      data: { ...(obj.data as Record<string, unknown>), modificateStats: levels },
    };
  }
  return obj;
}

const NODE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'trigger', label: 'Trigger' },
  { value: 'checker', label: 'Checker' },
  { value: 'activator', label: 'Activator' },
  { value: 'aura', label: 'Aura' },
  { value: 'conditional', label: 'Conditional' },
  { value: 'counter', label: 'Counter' },
];

interface LogicNodeFormProps {
  nodeId: string;
}

export const LogicNodeForm: React.FC<LogicNodeFormProps> = ({ nodeId }) => {
  const dispatch = useAppDispatch();
  const node = useAppSelector((state) => state.logic.nodes[nodeId]);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isValidationSuccess, setIsValidationSuccess] = useState<boolean>(false);
  const [localJsonText, setLocalJsonText] = useState<string>(
    () => node ? JSON.stringify(node.data, null, 2) : ''
  );
  const [selectedPreset, setSelectedPreset] = useState<string>(
    () => node ? findMatchingPresetIndex(node.nodeType, node.data) : ''
  );
  const [isJsonCollapsed, setIsJsonCollapsed] = useState<boolean>(true);
  // Bumped to force LevelDataEditor to reinitialize (e.g. after applying a preset)
  const [levelEditorKey, setLevelEditorKey] = useState<number>(0);

  // Get presets for current node type
  const presets = useMemo(() => {
    if (!node) return [];
    return getPresetsForType(node.nodeType);
  }, [node]);

  // Convert presets to select options
  const presetOptions: SelectOption[] = useMemo(() => {
    return presets.map((preset, index) => ({
      value: index.toString(),
      label: preset.name,
    }));
  }, [presets]);

  // Store the current nodeType in a variable to use as dependency
  const currentNodeType = node?.nodeType;

  // When node type changes (user picked a different type) reset both text and preset
  useEffect(() => {
    if (node) {
      setLocalJsonText(JSON.stringify(node.data, null, 2));
      setSelectedPreset('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNodeType]);

  // When switching to a different node (copy / load from library) restore preset
  useEffect(() => {
    if (node) {
      setLocalJsonText(JSON.stringify(node.data, null, 2));
      setSelectedPreset(findMatchingPresetIndex(node.nodeType, node.data));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId]);

  if (!node) return null;

  const handleTypeChange = (newType: string) => {
    const nodeType = newType as NodeType;
    dispatch(updateNode({ nodeId, updates: { nodeType, data: createDefaultNodeData(nodeType) } }));
    setValidationMessage(null);
  };

  const handleJsonChange = (jsonString: string) => {
    setLocalJsonText(jsonString);
    setValidationMessage(null);

    try {
      const data = JSON.parse(jsonString);
      dispatch(updateNodeData({ nodeId, data }));
      // Keep LevelDataEditor in sync with manual JSON edits
      setLevelEditorKey((k) => k + 1);
    } catch {
      // Invalid JSON — allow free editing
    }
  };

  const handleValidate = () => {
    try {
      const data = JSON.parse(localJsonText);
      const validation = validateNodeData(node.nodeType, data);

      if (validation.valid) {
        // Format JSON with proper indentation
        const formattedJson = JSON.stringify(data, null, 2);
        setLocalJsonText(formattedJson);
        dispatch(updateNodeData({ nodeId, data }));

        setValidationMessage('✓ JSON structure is valid and formatted');
        setIsValidationSuccess(true);
      } else {
        setValidationMessage(`✗ ${validation.error || 'Invalid data structure'}`);
        setIsValidationSuccess(false);
      }
    } catch {
      setValidationMessage('✗ Invalid JSON syntax');
      setIsValidationSuccess(false);
    }
  };


  const levelDataPath = detectLevelDataPath(node?.data);

  const handleAddLevel = () => {
    if (!levelDataPath) return;
    const current = getLevelArray(node.data, levelDataPath);
    const last = current[current.length - 1];
    const newEntry: LevelEntry = {
      level: last !== undefined ? last.level + 1 : 0,
      data: last !== undefined ? JSON.parse(JSON.stringify(last.data)) : {},
    };
    const newLevels = [...current, newEntry];
    const newData = applyLevelArray(node.data, levelDataPath, newLevels);
    setLocalJsonText(JSON.stringify(newData, null, 2));
    dispatch(updateNodeData({ nodeId, data: newData }));
  };

  const handleDeleteLastLevel = () => {
    if (!levelDataPath) return;
    const current = getLevelArray(node.data, levelDataPath);
    if (current.length === 0) return;
    const newLevels = current.slice(0, -1);
    const newData = applyLevelArray(node.data, levelDataPath, newLevels);
    setLocalJsonText(JSON.stringify(newData, null, 2));
    dispatch(updateNodeData({ nodeId, data: newData }));
  };

  const handleLevelDataChange = (levels: LevelEntry[]) => {
    const newData = applyLevelArray(node.data, levelDataPath!, levels);
    setLocalJsonText(JSON.stringify(newData, null, 2));
    dispatch(updateNodeData({ nodeId, data: newData }));
  };

  const getNodeTypeColor = (type: NodeType): string => {
    const colors: Record<NodeType, string> = {
      trigger: '#00ff88',
      checker: '#00d4ff',
      activator: '#ff8800',
      aura: '#ff00ff',
      conditional: '#ffff00',
      counter: '#ff4488',
    };
    return colors[type] || '#888';
  };

  // Get subtype from node data based on node type
  const getNodeSubtype = (): string | null => {
    const data = node.data as Record<string, unknown>;
    if (!data) return null;

    switch (node.nodeType) {
      case 'trigger':
        return data.triggerType as string || null;
      case 'checker':
        return data.checkerType as string || null;
      case 'activator':
        return data.activatorType as string || null;
      case 'aura':
        return data.effectType as string || null;
      case 'conditional':
        return data.conditionalType as string || null;
      case 'counter':
        return (data.counterType || data.type) as string || null;
      default:
        return null;
    }
  };

  return (
    <div className={styles.form}>
      {/* Header with type selector */}
      <div className={styles.header}>
        <span
          className={styles.badge}
          style={{
            backgroundColor: getNodeTypeColor(node.nodeType),
            boxShadow: `0 0 10px ${getNodeTypeColor(node.nodeType)}40`,
          }}
        >
          {node.nodeType.toUpperCase()}
        </span>
        <Select
          value={node.nodeType}
          options={NODE_TYPE_OPTIONS}
          onChange={handleTypeChange}
          fullWidth
        />
      </div>

      {/* Preset selector */}
      {presets.length > 0 && (
        <div className={styles.presetSection}>
          <Select
            value={selectedPreset}
            options={presetOptions}
            onChange={(value) => {
              setSelectedPreset(value);
              const presetIndex = parseInt(value);
              const preset = presets[presetIndex];
              if (preset) {
                const formattedData = JSON.stringify(preset.data, null, 2);
                setLocalJsonText(formattedData);
                dispatch(updateNodeData({ nodeId, data: preset.data }));
                setValidationMessage(`✓ Applied preset: ${preset.name}`);
                setIsValidationSuccess(true);
                setLevelEditorKey((k) => k + 1);
              }
            }}
            fullWidth
          />
        </div>
      )}

      {/* Validation button */}
      <div className={styles.validationSection}>
        <Button size="small" variant="secondary" onClick={handleValidate}>
          Validate JSON
        </Button>
        {levelDataPath && (
          <>
            <Button size="small" variant="primary" onClick={handleAddLevel}>
              + Add Level
            </Button>
            <Button
              size="small"
              variant="danger"
              onClick={handleDeleteLastLevel}
              disabled={(() => {
                const lvls = getLevelArray(node.data, levelDataPath);
                if (lvls.length === 0) return true;
                const last = lvls[lvls.length - 1];
                return last.level === 0;
              })()}
            >
              - Delete Level
            </Button>
          </>
        )}
        {validationMessage && (
          <span
            className={styles.validationMessage}
            style={{
              color: isValidationSuccess ? '#00ff88' : '#ff4444',
            }}
          >
            {validationMessage}
          </span>
        )}
      </div>

      {/* Level Data editor — shown when node data contains a LevelData[] array */}
      {levelDataPath && (
        <LevelDataEditor
          key={levelEditorKey}
          levels={getLevelArray(node.data, levelDataPath)}
          onChange={handleLevelDataChange}
          renderLevelContent={
            (node.data as Record<string, unknown>).conditionalType === 'itemPosition'
              ? (data, onDataChange) => (
                  <ItemPositionGridEditor
                    data={data as { relative: string; points: Array<{ x: number; y: number }> }}
                    onChange={onDataChange}
                  />
                )
              : undefined
          }
        />
      )}

      {/* JSON editor - collapsible */}
      <div className={styles.jsonSection}>
        <button
          className={styles.jsonToggle}
          onClick={() => setIsJsonCollapsed(!isJsonCollapsed)}
          type="button"
        >
          <span className={`${styles.toggleArrow} ${isJsonCollapsed ? styles.collapsed : ''}`}>
            &#x25BC;
          </span>
          <span className={styles.toggleLabel}>
            JSON Data
          </span>
          <span className={styles.jsonPreview}>
            {isJsonCollapsed && getNodeSubtype() ? `${node.nodeType}Type: "${getNodeSubtype()}"` : ''}
          </span>
        </button>

        {!isJsonCollapsed && (
          <div className={styles.dataDisplay}>
            <Textarea
              value={localJsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder="Enter node data as JSON"
              rows={Math.max(3, localJsonText.split('\n').length)}
              fullWidth
              style={{ fontFamily: 'monospace', resize: 'none' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
