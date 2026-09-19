CREATE TABLE IF NOT EXISTS pricing_idempotency (
  idempotency_key_hash TEXT PRIMARY KEY,
  request_hash TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('processing', 'completed')),
  http_status INTEGER,
  response_json TEXT,
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS pricing_idempotency_expiry_idx
  ON pricing_idempotency (expires_at);

CREATE TABLE IF NOT EXISTS pricing_calculation_audit (
  request_id TEXT PRIMARY KEY,
  idempotency_key_hash TEXT NOT NULL,
  source_submission_id TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  rate_card_version TEXT NOT NULL,
  calculation_version TEXT NOT NULL,
  outcome TEXT NOT NULL,
  reason_codes_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS pricing_audit_submission_idx
  ON pricing_calculation_audit (source_submission_id, created_at);

CREATE TABLE IF NOT EXISTS pricing_rate_limits (
  bucket_hash TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  request_count INTEGER NOT NULL,
  PRIMARY KEY (bucket_hash, window_start)
);

CREATE INDEX IF NOT EXISTS pricing_rate_limits_window_idx
  ON pricing_rate_limits (window_start);
