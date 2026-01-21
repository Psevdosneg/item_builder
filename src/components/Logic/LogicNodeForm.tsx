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
import styles from './LogicNodeForm.module.css';

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
  const [localJsonText, setLocalJsonText] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  // Get presets for current node type
  const presets = useMemo(() => {
    if (!node) return [];
    return getPresetsForType(node.nodeType);
  }, [node?.nodeType]);

  // Convert presets to select options
  const presetOptions: SelectOption[] = useMemo(() => {
    return [
      { value: '', label: 'Select a preset...' },
      ...presets.map((preset, index) => ({
        value: index.toString(),
        label: preset.name,
      })),
    ];
  }, [presets]);

  // Sync local text with node data when node changes externally
  useEffect(() => {
    if (node) {
      setLocalJsonText(JSON.stringify(node.data, null, 2));
      setSelectedPreset(''); // Reset preset selection
    }
  }, [node?.nodeType]); // Only update when node type changes

  if (!node) return null;

  const handleTypeChange = (newType: string) => {
    const nodeType = newType as NodeType;
    dispatch(updateNode({ nodeId, updates: { nodeType, data: createDefaultNodeData(nodeType) } } as any));
    setValidationMessage(null);
  };

  const handleJsonChange = (jsonString: string) => {
    // Always update local text - allows free editing
    setLocalJsonText(jsonString);
    setValidationMessage(null); // Clear validation message on edit

    // Try to parse and save to Redux if valid, but don't block if invalid
    try {
      const data = JSON.parse(jsonString);
      dispatch(updateNodeData({ nodeId, data }));
    } catch (error) {
      // JSON is invalid, but we still allow editing
      // User can fix it and it will auto-save when valid
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
    } catch (error) {
      setValidationMessage('✗ Invalid JSON syntax');
      setIsValidationSuccess(false);
    }
  };

  const handleApplyPreset = () => {
    if (selectedPreset === '') return;

    const presetIndex = parseInt(selectedPreset);
    const preset = presets[presetIndex];

    if (preset) {
      const formattedData = JSON.stringify(preset.data, null, 2);
      setLocalJsonText(formattedData);
      dispatch(updateNodeData({ nodeId, data: preset.data }));
      setValidationMessage(`✓ Applied preset: ${preset.name}`);
      setIsValidationSuccess(true);
    }
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
            onChange={(value) => setSelectedPreset(value)}
            fullWidth
          />
          <Button
            size="small"
            variant="secondary"
            onClick={handleApplyPreset}
            disabled={selectedPreset === ''}
          >
            Apply Preset
          </Button>
        </div>
      )}

      {/* Validation button */}
      <div className={styles.validationSection}>
        <Button size="small" variant="secondary" onClick={handleValidate}>
          Validate JSON
        </Button>
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

      {/* JSON editor */}
      <div className={styles.dataDisplay}>
        <Textarea
          value={localJsonText}
          onChange={(e) => handleJsonChange(e.target.value)}
          placeholder="Enter node data as JSON"
          rows={12}
          fullWidth
          style={{ fontFamily: 'monospace' }}
        />
      </div>
    </div>
  );
};
