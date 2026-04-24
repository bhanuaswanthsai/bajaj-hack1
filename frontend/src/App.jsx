/**
 * SRM Full Stack Engineering Challenge - Frontend
 * React single-page app with premium dark UI
 */
import { useState } from 'react';
import './App.css';

// ── API base URL (change for deployment) ──────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Quick example presets ─────────────────────────────────
const EXAMPLES = [
  { label: 'Simple Tree', data: '["A->B", "A->C", "B->D"]' },
  { label: 'Cycle', data: '["A->B", "B->C", "C->A"]' },
  { label: 'Mixed', data: '["A->B", "A->C", "B->D", "E->F", "F->G", "G->E", "hello", "1->2"]' },
  { label: 'Duplicates', data: '["A->B", "A->B", "A->B", "A->C"]' },
];

export default function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRaw, setShowRaw] = useState(false);

  // ── Submit handler ────────────────────────────────────
  const handleSubmit = async () => {
    setError('');
    setResult(null);
    setShowRaw(false);

    // Parse input
    let parsed;
    try {
      parsed = JSON.parse(input.trim());
      if (!Array.isArray(parsed)) throw new Error();
    } catch {
      setError('Invalid input. Please enter a valid JSON array, e.g. ["A->B", "A->C"]');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bfhl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsed }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  // ── Clear handler ─────────────────────────────────────
  const handleClear = () => {
    setInput('');
    setResult(null);
    setError('');
    setShowRaw(false);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header__badge">
          <span className="header__badge-dot" />
          SRM Full Stack Challenge
        </div>
        <h1 className="header__title">Hierarchy Analyzer</h1>
        <p className="header__subtitle">
          Process tree structures, detect cycles, and analyze hierarchical relationships
        </p>
      </header>

      {/* Input Section */}
      <section className="input-section">
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <span className="card__title-icon">📝</span>
              Input Data
            </h2>
            <span className="card__hint">JSON array format</span>
          </div>

          {/* Quick Examples */}
          <div className="examples">
            <span className="examples__label">Quick fill:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                className="example-btn"
                onClick={() => setInput(ex.data)}
              >
                {ex.label}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <div className="textarea-wrapper">
            <textarea
              id="data-input"
              className="textarea"
              placeholder='Enter JSON array, e.g. ["A->B", "A->C", "B->D"]'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
              }}
            />
          </div>

          {/* Buttons */}
          <div className="btn-row">
            <button
              id="submit-btn"
              className="btn-submit"
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Processing...
                </>
              ) : (
                <>🚀 Analyze Hierarchy</>
              )}
            </button>
            <button className="btn-clear" onClick={handleClear}>
              Clear
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="error-banner">
              <span className="error-banner__icon">⚠️</span>
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      {result && <ResultsView result={result} showRaw={showRaw} setShowRaw={setShowRaw} />}

      {/* Footer */}
      <footer className="footer">
        <p>SRM Full Stack Engineering Challenge &copy; 2026</p>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Results View Component
// ═══════════════════════════════════════════════════════════
function ResultsView({ result, showRaw, setShowRaw }) {
  const { user_id, email_id, college_roll_number, hierarchies, invalid_entries, duplicate_edges, summary } = result;

  return (
    <section className="results-section">
      {/* Results Header */}
      <div className="results-header">
        <h2 className="results-header__title">
          <span>📊</span> Results
        </h2>
        <div className="results-header__status">
          <span className="header__badge-dot" />
          Success
        </div>
      </div>

      {/* User Info */}
      <div className="user-info">
        <div className="user-info__item">
          <div className="user-info__label">User ID</div>
          <div className="user-info__value">{user_id}</div>
        </div>
        <div className="user-info__item">
          <div className="user-info__label">Email</div>
          <div className="user-info__value">{email_id}</div>
        </div>
        <div className="user-info__item">
          <div className="user-info__label">Roll Number</div>
          <div className="user-info__value">{college_roll_number}</div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-grid">
          <div className="summary-card summary-card--trees">
            <div className="summary-card__number">{summary.total_trees}</div>
            <div className="summary-card__label">Valid Trees</div>
          </div>
          <div className="summary-card summary-card--cycles">
            <div className="summary-card__number">{summary.total_cycles}</div>
            <div className="summary-card__label">Cycles Found</div>
          </div>
          <div className="summary-card summary-card--largest">
            <div className="summary-card__number">{summary.largest_tree_root || '—'}</div>
            <div className="summary-card__label">Largest Tree Root</div>
          </div>
        </div>
      )}

      {/* Hierarchies */}
      {hierarchies && hierarchies.length > 0 && (
        <>
          <h3 className="card__title" style={{ marginBottom: '1rem' }}>
            <span className="card__title-icon">🌳</span>
            Hierarchies ({hierarchies.length})
          </h3>
          <div className="hierarchies">
            {hierarchies.map((h, i) => (
              <HierarchyCard key={i} hierarchy={h} index={i} />
            ))}
          </div>
        </>
      )}

      {/* Issues */}
      {((invalid_entries && invalid_entries.length > 0) || (duplicate_edges && duplicate_edges.length > 0)) && (
        <div className="issues-grid">
          {invalid_entries && invalid_entries.length > 0 && (
            <div className="issue-card">
              <div className="issue-card__title">
                <span className="issue-card__title-icon">🚫</span>
                Invalid Entries ({invalid_entries.length})
              </div>
              <ul className="issue-list">
                {invalid_entries.map((e, i) => (
                  <li key={i} className="issue-tag issue-tag--invalid">
                    {e || '(empty)'}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {duplicate_edges && duplicate_edges.length > 0 && (
            <div className="issue-card">
              <div className="issue-card__title">
                <span className="issue-card__title-icon">🔁</span>
                Duplicate Edges ({duplicate_edges.length})
              </div>
              <ul className="issue-list">
                {duplicate_edges.map((e, i) => (
                  <li key={i} className="issue-tag issue-tag--duplicate">{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Raw JSON */}
      <div className="raw-json-section">
        <button className="raw-json-toggle" onClick={() => setShowRaw(!showRaw)}>
          <span className={`raw-json-toggle__arrow ${showRaw ? 'raw-json-toggle__arrow--open' : ''}`}>▶</span>
          {showRaw ? 'Hide' : 'Show'} Raw JSON Response
        </button>
        {showRaw && (
          <pre className="raw-json-content">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// Hierarchy Card Component
// ═══════════════════════════════════════════════════════════
function HierarchyCard({ hierarchy, index }) {
  const { root, has_cycle, depth, tree } = hierarchy;

  return (
    <div className="hierarchy-card">
      <div className="hierarchy-card__header">
        <div className="hierarchy-card__title">
          <span>#{index + 1}</span>
          <span>Root: </span>
          <span className="hierarchy-card__root">{root}</span>
        </div>
        <div className="hierarchy-card__badges">
          {has_cycle ? (
            <span className="badge badge--cycle">⚡ Cycle</span>
          ) : (
            <span className="badge badge--tree">✓ Tree</span>
          )}
          {!has_cycle && depth !== undefined && (
            <span className="badge badge--depth">Depth: {depth}</span>
          )}
        </div>
      </div>
      <div className="hierarchy-card__body">
        {has_cycle ? (
          <div className="empty-state">Cyclic group — no tree structure available</div>
        ) : (
          <pre className="tree-json">{JSON.stringify(tree, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
