-- Release 3A staging migration only. Do not apply to production until all release gates pass.
PRAGMA foreign_keys = ON;

CREATE TABLE other_trade_leads (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  received_at TEXT NOT NULL,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  suburb_postcode TEXT NOT NULL,
  trade_category TEXT NOT NULL CHECK (trade_category IN (
    'Plumbing',
    'Blockwork / bricklaying',
    'Electrical',
    'Excavation / earthworks',
    'Landscaping',
    'Carpentry',
    'Roofing',
    'Other'
  )),
  description TEXT NOT NULL,
  timeframe TEXT NOT NULL CHECK (timeframe IN (
    'Urgent',
    'Within 1 week',
    '2–4 weeks',
    '1–3 months',
    'Flexible'
  )),
  photo_urls_json TEXT NOT NULL DEFAULT '[]',
  source TEXT NOT NULL,
  landing_page TEXT NOT NULL,
  service_area_status TEXT NOT NULL CHECK (service_area_status IN ('in_area', 'service_area_review')),
  consent_status TEXT NOT NULL DEFAULT 'granted' CHECK (consent_status IN ('granted', 'withdrawn', 'disclosed')),
  consent_version TEXT NOT NULL,
  consent_timestamp TEXT NOT NULL,
  consent_text_sha256 TEXT NOT NULL,
  page_version TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'd1_stored_email_pending' CHECK (delivery_status IN ('d1_stored_email_pending', 'email_sent', 'email_failed')),
  review_status TEXT NOT NULL DEFAULT 'new',
  provider_recipient TEXT DEFAULT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_other_trade_leads_created_at ON other_trade_leads(created_at);
CREATE INDEX idx_other_trade_leads_review_status ON other_trade_leads(review_status);
CREATE INDEX idx_other_trade_leads_consent_status ON other_trade_leads(consent_status);

CREATE TABLE other_trade_disclosures (
  id TEXT PRIMARY KEY NOT NULL,
  lead_id TEXT NOT NULL UNIQUE,
  provider_identifier TEXT NOT NULL,
  shared_field_categories_json TEXT NOT NULL,
  authorised_actor TEXT NOT NULL,
  disclosed_at TEXT NOT NULL,
  notes TEXT,
  photo_token_issued_at TEXT,
  photo_token_expires_at TEXT,
  photo_token_revoked_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES other_trade_leads(id) ON DELETE RESTRICT
);

-- NORMAL PRODUCTION ROLLBACK:
-- Deploy the default-off website bundle to remove the route, endpoint and redirect.
-- Retain both tables and all records so consent and disclosure audit evidence is preserved.
-- Any preview-only teardown must be separately reviewed and may occur only before genuine data exists.
