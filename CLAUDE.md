# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Item Builder React is a visual editor for creating game items with complex logic systems. Items have metadata (name, weight, description), a 5x5 grid shape, stats/charges, and hierarchical logic trees consisting of triggers, checkers, activators, auras, conditionals, and counters.

## Commands

```bash
npm run dev      # Start Vite dev server with HMR on http://localhost:5173
npm run build    # Type check with tsc, then build for production
npm run lint     # Run ESLint on the codebase
npm run preview  # Preview the production build locally
```

## Architecture

### State Management (Redux Toolkit)

The application uses Redux Toolkit with 6 feature slices:

1. **item** - Basic metadata (name, weight, ico, description, tags)
2. **grid** - Grid points stored as serialized strings ("x,y") and pivot point
3. **stats** - Default stats (price, level, maxLevel, rarity), custom stats array, charges array
4. **logic** - Normalized logic tree (flat Record<string, LogicNodeState>)
5. **templates** - Saved item templates
6. **ai** - AI generation state (modal, API key, model selection)

Use typed hooks from `src/app/hooks.ts`:
- `useAppDispatch()` instead of `useDispatch()`
- `useAppSelector()` instead of `useSelector()`

### Logic System Architecture

The logic system is the most complex part of the codebase:

**Normalized Storage Pattern:**
- Logic nodes are stored in a flat structure: `Record<string, LogicNodeState>`
- Each node has `id`, `nodeType`, `parentId`, `childIds[]`, and type-specific `data`
- This prevents deep nesting issues in Redux and enables efficient updates
- Root nodes are tracked separately in `rootNodeIds[]`

**Denormalization for Export:**
- When exporting JSON, the flat structure is converted to a recursive tree
- `denormalizeLogicForExport()` in `src/utils/logicTree.utils.ts` handles this conversion
- The inverse `normalizeLogicTree()` converts imported JSON back to flat structure

**Node Types (6 types):**
1. **Trigger** - Events that initiate logic chains (cooldown, itemActivated, changeBattleState, cripSpawn, cripDeath, itemChargesChanged)
2. **Checker** - Condition validators (cooldown, resourcePrice, chargePrice, allyPrice, battleState, itemConditional, cripConditional)
3. **Activator** - Actions that execute (damage, heal, changeResource, spawner, impulseItem, addItemStateTag, chargeItem, changeItemCharge)
4. **Aura** - Passive stat modifications with level scaling
5. **Conditional** - Execution filters (characterRelative, characterRandom, characterSelf, battleState, itemTag, itemSelf, itemPosition, characterTag, characterResources)
6. **Counter** - Entity/resource counters (resources, character, item)

**Type System:**
- `src/types/logic.types.ts` (550+ lines) defines discriminated unions for all node data types
- Each node type has a specific data shape validated by TypeScript
- Type guards like `isTriggerData()`, `isCheckerData()` ensure type safety
- Never manually construct node data - use `createDefaultNodeData(nodeType)` factory function

**Level-Based Data:**
- Many nodes use `LevelData<T>` interface: `{ level: number, data: T }[]`
- This allows stats/effects to scale with item level
- Example: `data: [{ level: 1, data: { value: 10 } }, { level: 2, data: { value: 20 } }]`

### Preset System

Presets are JSON files in `src/data/presets/` (one per node type). Structure:

```json
[
  {
    "name": "Preset Name",
    "description": "What it does",
    "data": { /* node-specific data matching the node type's data shape */ }
  }
]
```

The preset system supports two formats:
1. **Simple format** - Basic key-value pairs (used in presets)
2. **Level-based format** - Complex scaling data with `data: [{ level, data }]` arrays

Validation in `src/services/validation.service.ts` accepts both formats for flexibility.

To add/edit presets, directly modify the JSON files. The `getPresetsForType()` function in `src/utils/nodePresets.ts` loads them at runtime.

### Data Flow

**Export Flow:**
```
Redux State → generateItemFromState() → denormalizeLogicForExport()
→ generateJSONString() → JSON output (download or clipboard)
```

**Import Flow:**
```
JSON File → Parse → Dispatch actions (loadItem, setPoints, loadStats, loadLogicTree)
→ normalizeLogicTree() → Update Redux state
```

**Key Files:**
- `src/utils/json.utils.ts` - Import/export logic
- `src/utils/logicTree.utils.ts` - Tree normalization/denormalization

### Component Structure

**Container/Presentational Pattern:**
- **Containers** (`src/containers/`) connect to Redux and handle business logic
- **Presentational components** (`src/components/`) are pure UI with props
- Example: `LogicContainer` (container) wraps `LogicBuilder` (presentational)

**Main App Layout:**
```
App (keyboard shortcuts: Ctrl+S, Ctrl+O, Ctrl+G)
├── Action Bar (AI, Import, Templates, Clear)
├── MainGrid
│   ├── BasicInfoPanel
│   └── JSONPreview (memoized)
├── StatsContainer
└── LogicContainer
    └── LogicBuilder
        ├── LogicPresets
        └── LogicNode (recursive tree rendering)
```

### Validation

Node data validation happens in `src/services/validation.service.ts`:

- **Flexible validation** - Accepts both simple preset format and complex level-based format
- **Type-specific rules** - Each node type has its own validator function
- **Non-blocking** - Validation only runs when user clicks "Validate JSON" button
- Invalid JSON can still be edited freely; validation just provides feedback

When updating validation:
- Add new node types to the `valid*Types` arrays
- Keep validation permissive to support both preset and production data formats
- Include helpful error messages with lists of valid values

### Important Patterns

**Grid Serialization:**
- Grid points are stored as strings ("x,y") to avoid Redux serialization warnings
- Convert back to objects when rendering: `const [x, y] = point.split(',').map(Number)`

**Node ID Generation:**
- Use `generateNodeId()` from `src/utils/logicTree.utils.ts`
- Format: `node_${timestamp}_${random}`

**Deep Copying Nodes:**
- Never manually clone nodes - use `copyNodeWithChildren()` from logicTree.utils.ts
- This properly handles the recursive tree structure and generates new IDs

**Memoization:**
- JSONPreview uses `useMemo()` because JSON generation is expensive
- Always memoize expensive computations that depend on large state slices

### Keyboard Shortcuts

These are implemented in `src/App.tsx`:
- `Ctrl+S` / `Cmd+S` - Copy JSON to clipboard
- `Ctrl+O` / `Cmd+O` - Trigger file import
- `Ctrl+G` / `Cmd+G` - Open AI Generator modal

### AI Integration

- API key stored in localStorage under `openai_api_key`
- Supports multiple OpenAI models (gpt-4o-mini, gpt-4o, gpt-4-turbo)
- State managed in `src/features/ai/aiSlice.ts`
- Async calls in `src/features/ai/aiThunks.ts`

## Common Development Scenarios

### Adding a New Node Type

1. Add type to `NodeType` union in `src/types/logic.types.ts`
2. Create data interface (e.g., `NewNodeData`) with discriminated union
3. Add to `NodeData` union type
4. Implement type guard function (e.g., `isNewNodeData()`)
5. Add case to `createDefaultNodeData()` factory
6. Add validation in `src/services/validation.service.ts`
7. Create preset file `src/data/presets/newnode.json`
8. Update `src/utils/nodePresets.ts` to import and map the preset
9. Add color to `COLOR_MAP` in `src/utils/constants.ts`

### Modifying Logic Tree Structure

Never mutate the logic tree directly. Always:
1. Use Redux actions from `src/features/logic/logicSlice.ts`
2. Actions handle both normalized state and denormalized children recursively
3. For bulk operations, use utility functions from `logicTree.utils.ts`

### Working with Validation

Validation is intentionally flexible:
- Presets use simple format without level arrays
- Production data may use complex level-based format
- Validators check for presence of `data` field to determine format
- Always return helpful error messages with valid value lists

### Redux Store Configuration

The store has custom serialization configuration:
```typescript
serializableCheck: {
  ignoredActions: ['logic/loadLogicTree'],
  ignoredPaths: ['logic.collapsedNodes', 'logic.treeView.collapsedTreeNodes']
}
```

This prevents warnings when loading complex logic trees. Maintain this configuration when adding new logic-related actions.
