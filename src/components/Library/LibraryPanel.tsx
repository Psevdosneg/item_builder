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

interface TagMatch { tag: string; score: number; segments: Segment[] }

const LibraryCard: React.FC<{
  entry: LibraryEntry;
  segments: Segment[];
  tagMatches: TagMatch[];
  onLoad: () => void;
  onRename: (name: string) => void;
  onExport: () => void;
  onPushToDB: () => void;
  pushing: boolean;
}> = ({ entry, segments, tagMatches, onLoad, onRename, onExport, onPushToDB, pushing }) => {
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
          {tags.map((t) => {
            const tm = tagMatches.find((m) => m.tag === t);
            return (
              <span key={t} className={`${styles.tag} ${tm && tm.score > 0 ? styles.tagMatched : ''}`}>
                {tm && tm.score > 0
                  ? tm.segments.map((seg, i) =>
                      seg.match
                        ? <mark key={i} className={styles.highlight}>{seg.text}</mark>
                        : <span key={i}>{seg.text}</span>
                    )
                  : t}
              </span>
            );
          })}
        </div>
      )}

      <div className={styles.cardActions}>
        <Button size="small" variant="primary" onClick={onLoad}>Load</Button>
        <Button size="small" variant="secondary" onClick={onExport}>Export</Button>
        <Button size="small" variant="secondary" onClick={onPushToDB} disabled={pushing}>
          {pushing ? '…' : '↑ DB'}
        </Button>
      </div>
    </div>
  );
};

// ── Panel ─────────────────────────────────────────────────────────────────────

interface LibraryPanelProps {
  entries: LibraryEntry[];
  onLoad: (entry: LibraryEntry) => void;
  onRename: (id: string, name: string) => void;
  onExport: (entry: LibraryEntry) => void;
  onSyncMongo: () => void;
  syncingMongo: boolean;
  onPushToDB: (entry: LibraryEntry) => void;
  pushingId: string | null;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({
  entries,
  onLoad,
  onRename,
  onExport,
  onSyncMongo,
  syncingMongo,
  onPushToDB,
  pushingId,
}) => {
  const [search, setSearch] = useState('');
  const [searchByTag, setSearchByTag] = useState(false);
  const [page, setPage] = useState(0);

  // Reset page on search/mode change
  useEffect(() => { setPage(0); }, [search, searchByTag]);

  const scored = entries
    .map((e) => {
      const tags = e.item.tags ?? [];
      const tagMatches: TagMatch[] = tags.map((t) => ({ tag: t, ...fuzzyMatch(search, t) }));

      if (searchByTag) {
        const bestTagScore = tagMatches.reduce((max, tm) => Math.max(max, tm.score), 0);
        return { entry: e, score: bestTagScore, segments: [{ text: e.name, match: false }], tagMatches };
      } else {
        const nameResult = fuzzyMatch(search, e.name);
        return { entry: e, score: nameResult.score, segments: nameResult.segments, tagMatches };
      }
    })
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
          placeholder={searchByTag ? 'Search by tag…' : 'Search by name…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className={styles.searchToggle}>
          <button
            className={`${styles.toggleBtn} ${!searchByTag ? styles.toggleActive : ''}`}
            onClick={() => setSearchByTag(false)}
            title="Search by name"
          >
            Name
          </button>
          <button
            className={`${styles.toggleBtn} ${searchByTag ? styles.toggleActive : ''}`}
            onClick={() => setSearchByTag(true)}
            title="Search by tag"
          >
            Tag
          </button>
        </div>
      </div>

      <div className={styles.toolbarActions}>
        <Button size="small" variant="secondary" onClick={onSyncMongo} disabled={syncingMongo}>
          {syncingMongo ? 'Syncing…' : '↓ MongoDB'}
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
            {pageItems.map(({ entry, segments, tagMatches }) => (
              <LibraryCard
                key={entry.id}
                entry={entry}
                segments={segments}
                tagMatches={tagMatches}
                onLoad={() => onLoad(entry)}
                onRename={(name) => onRename(entry.id, name)}
                onExport={() => onExport(entry)}
                onPushToDB={() => onPushToDB(entry)}
                pushing={pushingId === entry.id}
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
