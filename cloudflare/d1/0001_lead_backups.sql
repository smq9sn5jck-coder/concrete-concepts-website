CREATE TABLE IF NOT EXISTS lead_backups (
  id TEXT PRIMARY KEY,
  lead_type TEXT NOT NULL CHECK (lead_type IN ('quote', 'callback', 'guide')),
  created_at TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  suburb TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  lead_source TEXT NOT NULL DEFAULT 'Direct',
  photo_urls_json TEXT,
  job_brief_json TEXT,
  received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_lead_backups_created_at
  ON lead_backups(created_at);

CREATE INDEX IF NOT EXISTS idx_lead_backups_phone
  ON lead_backups(phone);

CREATE INDEX IF NOT EXISTS idx_lead_backups_email
  ON lead_backups(email);
