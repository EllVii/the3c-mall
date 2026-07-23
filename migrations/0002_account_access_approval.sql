PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS account_access (
  user_id TEXT PRIMARY KEY,
  approval_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  full_name TEXT,
  request_reason TEXT,
  requested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at TEXT,
  decision_note TEXT,
  decided_by TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_account_access_status_requested
  ON account_access(approval_status, requested_at);

-- Preserve access for accounts created before manual approval was required.
INSERT OR IGNORE INTO account_access (
  user_id,
  approval_status,
  requested_at,
  decided_at,
  decided_by
)
SELECT
  id,
  'approved',
  COALESCE(created_at, CURRENT_TIMESTAMP),
  COALESCE(updated_at, CURRENT_TIMESTAMP),
  'legacy_migration'
FROM users;
