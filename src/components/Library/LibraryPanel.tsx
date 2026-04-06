import React, { useState, useEffect } from 'react';
import type { LibraryEntry } from '../../features/library/librarySlice';
import { Button } from '../common/Button';
import styles from './LibraryPanel.module.css';

const PAGE_SIZE = 15;

// ── Fuzzy search ─────────────────────────────────────────────────────────────

interface Segment { text: string; match: boolean }

function fuzzyMatch(query: string, text: string): { score: number; segments: Segment[] } {
  const noMatch = { score: 0, segments: [{ text, match: false }] };
  if (!query) return { score: 1, segments: [{ text, match: false }] };

  const q = query.toLowerCase();
  const t = text.toLowerCase();

  const indices: number[] = [];
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) { indices.push(ti); qi++; }
  }
  if (qi < q.length) return noMatch;

  let score = 0;
  for (let i = 0; i < indices.length; i++) {
    if (indices[i] === 0) score += 10;
    if (i > 0 && indices[i] === indices[i - 1] + 1) score += 5;
    score += 1;
  }

  const segments: Segment[] = [];
  let prev = 0;
  for (const idx of indices) {
    if (idx > prev) segments.push({ text: text.slice(prev, idx), match: false });
    segments.push({ text: text[idx], match: true });
    prev = idx + 1;
  }
  if (prev < text.length) segments.push({ text: text.slice(prev), match: false });

  return { score, segments };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

const LibraryCard: React.FC<{
  entry: LibraryEntry;
  segments: Segment[];
  onLoad: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
  onExport: () => void;
}> = ({ entry, segments, onLoad, onDelete, onRename, onExport }) => {
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(entry.name);

  useEffect(() => { setNameValue(entry.name); }, [entry.name]);

  const handleRenameSubmit = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== entry.name) onRename(trimmed);
    setEditing(false);
  };

  const tags = entry.item.tags ?? [];

  return (
    <div className={styles.card}>
      <div className={styles.cardMain}>
        {editing ? (
          <input
            className={styles.renameInput}
            value={nameValue}
            autoFocus
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') { setNameValue(entry.name); setEditing(false); }
            }}
          />
        ) : (
          <span
            className={styles.cardName}
            onDoubleClick={() => setEditing(true)}
            title="Double-click to rename"
          >
            {segments.map((seg, i) =>
              seg.match
                ? <mark key={i} className={styles.highlight}>{seg.text}</mark>
                : <span key={i}>{seg.text}</span>
            )}
          </span>
        )}
        <span className={styles.cardDate}>{formatDate(entry.savedAt)}</span>
      </div>

      {tags.length > 0 && (
        <div className={styles.cardTags}>
          {tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
        </div>
      )}

      <div className={styles.cardActions}>
        <Button size="small" variant="primary" onClick={onLoad}>Load</Button>
        <Button size="small" variant="secondary" onClick={onExport}>Export</Button>
        <Button size="small" variant="danger" onClick={onDelete}>Delete</Button>
      </div>
    </div>
  );
};

// ── Panel ─────────────────────────────────────────────────────────────────────

interface LibraryPanelProps {
  entries: LibraryEntry[];
  onLoad: (entry: LibraryEntry) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onExport: (entry: LibraryEntry) => void;
  onSaveCurrent: () => void;
  onLoadExamples: () => void;
  loadingExamples: boolean;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({
  entries,
  onLoad,
  onDelete,
  onRename,
  onExport,
  onSaveCurrent,
  onLoadExamples,
  loadingExamples,
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  // Reset page on search change
  useEffect(() => { setPage(0); }, [search]);

  const scored = entries
    .map((e) => ({ entry: e, ...fuzzyMatch(search, e.name) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const totalPages = Math.max(1, Math.ceil(scored.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = scored.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <div className={styles.panel}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          type="text"
          placeholder="Fuzzy search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      <div className={styles.toolbarActions}>
        <Button size="small" variant="primary" onClick={onSaveCurrent}>
          + Save current
        </Button>
        <Button size="small" variant="secondary" onClick={onLoadExamples} disabled={loadingExamples}>
          {loadingExamples ? 'Loading…' : 'Load Examples'}
        </Button>
      </div>

      {/* List */}
      {entries.length === 0 ? (
        <div className={styles.empty}>Library is empty. Save an item or load examples.</div>
      ) : scored.length === 0 ? (
        <div className={styles.empty}>No items match "{search}"</div>
      ) : (
        <>
          <div className={styles.list}>
            {pageItems.map(({ entry, segments }) => (
              <LibraryCard
                key={entry.id}
                entry={entry}
                segments={segments}
                onLoad={() => onLoad(entry)}
                onDelete={() => onDelete(entry.id)}
                onRename={(name) => onRename(entry.id, name)}
                onExport={() => onExport(entry)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
              >
                ‹
              </button>
              <span className={styles.pageInfo}>
                {safePage + 1} / {totalPages}
                <span className={styles.pageCount}> ({scored.length})</span>
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage === totalPages - 1}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
