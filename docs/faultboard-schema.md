# Faultboard Schema Design

*April 2026 — Foundation document*

## Relationship to Services Platform

Faultboard and the Services platform (field ticketing/invoicing) share one Supabase database. The **equipment** table is the connective tissue: the truck Meghan triages a fault on is the same truck that gets dispatched to a jobsite and billed on a field ticket.

Shared tables (owned by Services, read by Faultboard):
- `organizations` (multi-tenancy)
- `equipment` (the fleet registry)
- `employees` (techs, drivers)

Faultboard-owned tables:
- `samsara_connections` (API credentials per org)
- `samsara_sync_cursors` (polling state)
- `fault_code_events` (every fault ever seen, the core ledger)
- `fault_code_catalog` (J1939/OBD-II reference data)
- `vehicle_snapshots` (periodic odometer/hours/fuel captures)
- `work_orders` + `work_order_fault_links`
- `work_order_parts` (parts consumed per repair)
- `pm_schedules` + `pm_schedule_logs`
- `ai_diagnoses` (per-vehicle AI analysis, linked to work orders)
- `fleet_insights` (daily fleet-wide pattern analysis)
- `repair_playbooks` (learned fault-to-fix mappings)

---

## Shared Equipment Table

This is the single source of truth for every vehicle and piece of equipment across both apps. The Services schema defines the billing fields; Faultboard adds maintenance fields.

```sql
-- Owned by Services, extended for Faultboard
CREATE TABLE equipment (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES organizations(id),

  -- Identity
  unit_number           text NOT NULL,           -- "Unit 48", "EV.BD-010", "TK-340"
  description           text,                    -- "2015 Kenworth T880"
  category              text NOT NULL,           -- "class_8", "pickup", "belly_dump", "vacuum_truck", "backhoe", etc.
  year                  integer,
  make                  text,                    -- "KENWORTH", "INTERNATIONAL", "RAM"
  model                 text,                    -- "T880", "LT625", "2500"
  vin                   text,
  license_plate         text,

  -- Samsara link
  samsara_vehicle_id    text,                    -- Samsara internal ID (e.g. "281474979993661")
  samsara_vehicle_name  text,                    -- How it appears in Samsara ("Unit 48 Mario")
  samsara_gateway_serial text,                   -- Gateway hardware serial
  samsara_camera_serial text,                    -- Dashcam serial (null if none)

  -- Current readings (updated by Samsara sync)
  current_odometer_mi   integer,                 -- OBD odometer in miles
  current_engine_hrs    numeric(10,1),           -- OBD engine hours
  current_fuel_pct      integer,                 -- Fuel tank level 0-100
  last_known_location   text,                    -- Reverse-geocoded address
  last_known_lat        numeric(10,6),
  last_known_lon        numeric(10,6),
  last_telemetry_at     timestamptz,             -- When readings were last updated

  -- Status
  status                text NOT NULL DEFAULT 'active',  -- active, in_shop, out_of_service, sold

  -- Billing (Services app)
  default_operating_rate_cents  integer,
  default_daily_rate_cents      integer,
  default_standby_rate_cents    integer,
  fuel_surcharge_rate_cents     integer,

  -- Maintenance (Faultboard)
  active_fault_count    integer NOT NULL DEFAULT 0,  -- denormalized for dashboard speed
  health_score          integer,                      -- 0-100, computed by AI
  last_work_order_at    timestamptz,
  next_pm_due_at        timestamptz,                  -- earliest upcoming PM (denormalized)
  next_pm_due_mi        integer,                      -- or mileage threshold
  next_pm_due_hrs       numeric(10,1),                -- or hours threshold

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  UNIQUE(org_id, unit_number)
);
```

---

## Samsara Integration Layer

```sql
-- One row per Samsara org connected to our system
CREATE TABLE samsara_connections (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES organizations(id),
  label                 text NOT NULL,           -- "StandardTX", "Rival Energy"
  api_key_encrypted     text NOT NULL,           -- encrypted at rest
  samsara_org_id        text,                    -- Samsara's org ID
  is_active             boolean NOT NULL DEFAULT true,
  last_sync_at          timestamptz,
  last_sync_status      text,                    -- "success", "error: 429 rate limited", etc.
  vehicle_count         integer,                 -- last known count from API
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- Cursor state for the stats/feed polling endpoint
-- One row per connection per stat type
CREATE TABLE samsara_sync_cursors (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id         uuid NOT NULL REFERENCES samsara_connections(id),
  stat_type             text NOT NULL,           -- "faultCodes", "obdOdometerMeters", "obdEngineSeconds", etc.
  cursor                text,                    -- Samsara pagination cursor (endCursor value)
  last_polled_at        timestamptz,
  UNIQUE(connection_id, stat_type)
);
```

---

## Fault Code Event Ledger

This is the heart of Faultboard. Every fault code ever detected, including when it appeared and when it cleared. Nothing gets deleted. This history is what makes the AI diagnoses and pattern detection possible.

```sql
-- Reference catalog of known fault codes
CREATE TABLE fault_code_catalog (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol              text NOT NULL,           -- "J1939" or "OBD-II"
  -- J1939 fields
  spn_id                integer,                 -- Suspect Parameter Number
  fmi_id                integer,                 -- Failure Mode Identifier
  -- OBD-II fields
  dtc_code              text,                    -- "P0401", "P218F"
  -- Descriptions
  code_display          text NOT NULL,           -- "SPN 111 FMI 18" or "P0401"
  description           text NOT NULL,           -- "Engine Coolant Level 1"
  fmi_description       text,                    -- "Low—moderate severity"
  -- Classification (rule-based, Tier 1)
  default_severity      text NOT NULL DEFAULT 'low',  -- critical, high, medium, low
  system_category       text,                    -- "cooling", "braking", "exhaust", "transmission", "electrical", "fuel", etc.
  -- Helpful context
  common_causes         text,                    -- populated over time by AI
  typical_cost_range    text,                    -- e.g. "$200-1,500"
  urgency_guidance      text,                    -- "Do not operate. Inspect immediately."

  UNIQUE(protocol, spn_id, fmi_id),              -- J1939 uniqueness
  UNIQUE(protocol, dtc_code)                     -- OBD-II uniqueness (where dtc_code is not null)
);

-- Every fault code event: appearance and clearance
CREATE TABLE fault_code_events (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES organizations(id),
  equipment_id          uuid NOT NULL REFERENCES equipment(id),
  catalog_id            uuid REFERENCES fault_code_catalog(id),

  -- Code identity (denormalized for query speed)
  protocol              text NOT NULL,           -- "J1939", "OBD-II", "OBD-II (permanent)"
  code_display          text NOT NULL,           -- "SPN 111 FMI 18" or "P0401"
  description           text,                    -- "Engine Coolant Level 1"
  fmi_description       text,

  -- Severity (starts as rule-based default, can be overridden by AI)
  severity              text NOT NULL,           -- critical, high, medium, low
  severity_source       text NOT NULL DEFAULT 'rules',  -- "rules", "ai", "manual"

  -- Check engine light state at time of detection
  warning_light         boolean NOT NULL DEFAULT false,
  stop_light            boolean NOT NULL DEFAULT false,
  protect_light         boolean NOT NULL DEFAULT false,
  emissions_light       boolean NOT NULL DEFAULT false,

  -- Samsara metadata
  samsara_occurrence_count integer,              -- how many times Samsara has seen this
  samsara_detected_at   timestamptz NOT NULL,    -- when Samsara first reported it

  -- Lifecycle
  status                text NOT NULL DEFAULT 'active',  -- active, cleared, acknowledged, work_ordered
  cleared_at            timestamptz,             -- when the code was no longer reported
  acknowledged_at       timestamptz,             -- when a human reviewed it
  acknowledged_by       uuid REFERENCES employees(id),

  -- Vehicle state at time of detection (snapshot)
  odometer_at_detection integer,                 -- miles
  engine_hrs_at_detection numeric(10,1),
  location_at_detection text,                    -- reverse-geocoded address

  -- Work order link (set when this fault drives a work order)
  work_order_id         uuid REFERENCES work_orders(id),

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX fault_events_equipment_idx ON fault_code_events(equipment_id);
CREATE INDEX fault_events_org_status_idx ON fault_code_events(org_id, status);
CREATE INDEX fault_events_severity_idx ON fault_code_events(severity) WHERE status = 'active';
CREATE INDEX fault_events_catalog_idx ON fault_code_events(catalog_id);
CREATE INDEX fault_events_detected_idx ON fault_code_events(samsara_detected_at);
```

---

## Vehicle Snapshots

Periodic captures of vehicle telemetry. Used for trending (MPG degradation, coolant temp drift, odometer accumulation rate). The Samsara poll writes these alongside updating the equipment table.

```sql
CREATE TABLE vehicle_snapshots (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id          uuid NOT NULL REFERENCES equipment(id),
  captured_at           timestamptz NOT NULL,
  source                text NOT NULL DEFAULT 'samsara',  -- "samsara", "manual", "fuel_entry"

  odometer_mi           integer,
  engine_hrs            numeric(10,1),
  fuel_pct              integer,
  coolant_temp_f        integer,
  oil_pressure_psi      integer,
  engine_rpm            integer,
  engine_state          text,                    -- "On", "Off", "Idle"
  latitude              numeric(10,6),
  longitude             numeric(10,6),
  location_text         text
);

-- Partitioned by time for efficient range queries
CREATE INDEX vehicle_snapshots_equip_time_idx ON vehicle_snapshots(equipment_id, captured_at DESC);
```

---

## Work Orders

The action layer. Created from fault codes, PM triggers, or manual entry. Pre-filled by AI diagnosis. Linked back to fault codes for outcome tracking.

```sql
CREATE TYPE work_order_status AS ENUM (
  'draft',          -- created, not yet assigned
  'assigned',       -- tech assigned, not started
  'in_progress',    -- tech working on it
  'waiting_parts',  -- blocked on parts
  'completed',      -- work done, pending review
  'closed',         -- reviewed and closed
  'cancelled'
);

CREATE TYPE work_order_priority AS ENUM ('critical', 'high', 'medium', 'low');

CREATE TYPE work_order_source AS ENUM (
  'fault_code',     -- created from incoming fault code(s)
  'pm_schedule',    -- triggered by PM mileage/hours threshold
  'inspection',     -- from a driver inspection (DVIR)
  'manual',         -- Meghan created it manually
  'fleet_insight'   -- created from AI fleet-wide pattern analysis
);

CREATE TABLE work_orders (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES organizations(id),
  equipment_id          uuid NOT NULL REFERENCES equipment(id),

  -- Identity
  wo_number             text NOT NULL,           -- "WO-2026-0412" (sequential per org)

  -- Classification
  priority              work_order_priority NOT NULL DEFAULT 'medium',
  source                work_order_source NOT NULL,
  status                work_order_status NOT NULL DEFAULT 'draft',

  -- Assignment
  assigned_to           uuid REFERENCES employees(id),
  assigned_at           timestamptz,

  -- Description (may be pre-filled by AI)
  title                 text NOT NULL,           -- "Low coolant + ABS sensor — Unit 48"
  description           text,                    -- detailed description / instructions

  -- AI diagnosis (linked to ai_diagnoses table for full detail)
  ai_diagnosis_id       uuid REFERENCES ai_diagnoses(id),

  -- Location
  shop_location         text,                    -- "In-house", "Honest Engines", "Dugan's"

  -- Vehicle state when work order opened
  odometer_at_open      integer,
  engine_hrs_at_open    numeric(10,1),

  -- Vehicle state when work order closed
  odometer_at_close     integer,
  engine_hrs_at_close   numeric(10,1),

  -- Cost summary (denormalized from parts + labor)
  total_parts_cost_cents integer NOT NULL DEFAULT 0,
  total_labor_hrs       numeric(6,1) NOT NULL DEFAULT 0,
  labor_cost_cents      integer NOT NULL DEFAULT 0,
  external_cost_cents   integer NOT NULL DEFAULT 0,  -- outside shop invoice amount
  total_cost_cents      integer NOT NULL DEFAULT 0,

  -- Resolution
  resolution_notes      text,                    -- what was actually found/fixed
  resolved_at           timestamptz,
  resolved_by           uuid REFERENCES employees(id),

  -- Timestamps
  started_at            timestamptz,             -- when tech began work
  completed_at          timestamptz,             -- when tech marked done
  closed_at             timestamptz,             -- when reviewed and finalized
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Link table: which fault codes does this work order address?
CREATE TABLE work_order_fault_links (
  work_order_id         uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  fault_event_id        uuid NOT NULL REFERENCES fault_code_events(id),
  PRIMARY KEY (work_order_id, fault_event_id)
);

-- Parts consumed in a work order
CREATE TABLE work_order_parts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id         uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  part_name             text NOT NULL,           -- "EGR Cooler", "ABS Wheel Speed Sensor"
  part_number           text,                    -- manufacturer part number if known
  quantity              integer NOT NULL DEFAULT 1,
  unit_cost_cents       integer,                 -- cost per unit
  total_cost_cents      integer,
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX work_orders_org_status_idx ON work_orders(org_id, status);
CREATE INDEX work_orders_equipment_idx ON work_orders(equipment_id);
CREATE INDEX work_orders_priority_idx ON work_orders(priority) WHERE status NOT IN ('closed', 'cancelled');
```

---

## Preventive Maintenance Schedules

```sql
CREATE TYPE pm_trigger_type AS ENUM ('mileage', 'engine_hours', 'calendar');

CREATE TABLE pm_schedules (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES organizations(id),
  equipment_id          uuid NOT NULL REFERENCES equipment(id),

  -- What service
  service_name          text NOT NULL,           -- "Oil Change", "Brake Inspection", "DPF Cleaning"

  -- Trigger
  trigger_type          pm_trigger_type NOT NULL,
  interval_miles        integer,                 -- for mileage trigger (e.g. 15000)
  interval_hours        numeric(10,1),           -- for hours trigger (e.g. 500)
  interval_days         integer,                 -- for calendar trigger (e.g. 90)

  -- Last completed
  last_completed_at     timestamptz,
  last_completed_mi     integer,
  last_completed_hrs    numeric(10,1),
  last_work_order_id    uuid REFERENCES work_orders(id),

  -- Next due (computed and denormalized)
  next_due_at           timestamptz,             -- for calendar-based
  next_due_mi           integer,                 -- for mileage-based
  next_due_hrs          numeric(10,1),           -- for hours-based
  is_overdue            boolean NOT NULL DEFAULT false,

  -- Alert lead time
  alert_lead_miles      integer DEFAULT 500,     -- warn 500 mi before due
  alert_lead_hours      numeric(10,1) DEFAULT 25,
  alert_lead_days       integer DEFAULT 7,

  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Log of every PM completion (even if the PM schedule gets modified)
CREATE TABLE pm_completion_log (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pm_schedule_id        uuid NOT NULL REFERENCES pm_schedules(id),
  equipment_id          uuid NOT NULL REFERENCES equipment(id),
  work_order_id         uuid REFERENCES work_orders(id),
  completed_at          timestamptz NOT NULL,
  odometer_mi           integer,
  engine_hrs            numeric(10,1),
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pm_schedules_equipment_idx ON pm_schedules(equipment_id);
CREATE INDEX pm_schedules_overdue_idx ON pm_schedules(is_overdue) WHERE is_active = true;
```

---

## AI Layer

Three levels of AI output, each a first-class entity.

```sql
-- Tier 2: Per-vehicle diagnosis (generated when a work order is created)
CREATE TABLE ai_diagnoses (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES organizations(id),
  equipment_id          uuid NOT NULL REFERENCES equipment(id),

  -- What triggered this diagnosis
  trigger_type          text NOT NULL,           -- "work_order", "manual", "new_critical_fault"

  -- Input context (stored for reproducibility)
  fault_codes_input     jsonb NOT NULL,          -- the active fault codes at time of analysis
  vehicle_context       jsonb NOT NULL,          -- make, model, year, mileage, hours, history summary
  repair_history_input  jsonb,                   -- past work orders on this vehicle
  playbook_input        jsonb,                   -- any matching repair playbooks

  -- AI output
  model_used            text NOT NULL,           -- "claude-haiku-4-5-20251001", "claude-sonnet-4-6", etc.
  diagnosis_text        text NOT NULL,           -- the full diagnosis narrative
  recommended_parts     jsonb,                   -- [{name, partNumber, estimatedCost, confidence}]
  estimated_labor_hrs   numeric(4,1),
  estimated_cost_range  text,                    -- "$200-500"
  urgency_assessment    text,                    -- "Operate with caution" / "Do not dispatch"

  -- For the print PDF
  pdf_diagnosis         text,                    -- formatted for print (shorter, action-oriented)
  pdf_parts_checklist   jsonb,                   -- [{name, quantity}] for the checkbox list

  -- Token usage (for cost tracking)
  input_tokens          integer,
  output_tokens         integer,
  cost_cents            integer,                 -- estimated API cost for this call

  created_at            timestamptz NOT NULL DEFAULT now()
);

-- Tier 3: Fleet-wide pattern analysis (generated by daily cron)
CREATE TABLE fleet_insights (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES organizations(id),

  -- Analysis metadata
  analysis_date         date NOT NULL,
  model_used            text NOT NULL,

  -- The insight
  title                 text NOT NULL,           -- "Water in fuel across 8 trucks"
  severity              text NOT NULL,           -- critical, high, medium, informational
  insight_type          text NOT NULL,           -- "pattern", "trend", "anomaly", "recommendation"
  body                  text NOT NULL,           -- the full analysis text

  -- What vehicles/faults does this insight reference?
  affected_equipment    jsonb,                   -- [{equipmentId, unitNumber}]
  affected_fault_events jsonb,                   -- [{faultEventId}]

  -- Recommended action
  recommendation        text,                    -- "Investigate Pecos yard fuel source"
  recommended_action    text,                    -- "bulk_work_order", "inspection_campaign", "monitor", "disposal_review"

  -- Lifecycle
  status                text NOT NULL DEFAULT 'new',  -- new, acknowledged, acted_on, dismissed
  acknowledged_by       uuid REFERENCES employees(id),
  acknowledged_at       timestamptz,

  -- Cost tracking
  input_tokens          integer,
  output_tokens         integer,
  cost_cents            integer,

  created_at            timestamptz NOT NULL DEFAULT now()
);

-- Tier 4: Repair playbooks (learned from closed work orders)
CREATE TABLE repair_playbooks (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid,                    -- null = global (cross-org learning)

  -- What fault code pattern does this playbook cover?
  protocol              text NOT NULL,
  code_display          text NOT NULL,           -- "SPN 111 FMI 18"

  -- Vehicle specificity (most specific match wins)
  make                  text,                    -- null = any make
  model                 text,                    -- null = any model
  year_min              integer,                 -- null = any year
  year_max              integer,
  mileage_min           integer,                 -- null = any mileage
  mileage_max           integer,

  -- What we've learned
  sample_size           integer NOT NULL DEFAULT 0,  -- how many resolved work orders inform this
  most_common_cause     text,                    -- "EGR cooler failure"
  cause_distribution    jsonb,                   -- [{cause, pct, avgCost, avgHours}]
  recommended_parts     jsonb,                   -- [{name, partNumber, frequency}]
  avg_repair_cost_cents integer,
  avg_labor_hrs         numeric(4,1),

  -- AI-generated narrative
  playbook_text         text,                    -- "SPN 111 on International LT625s (2017-2020) at 500K+ miles..."

  -- Last updated by Tier 4 learning job
  last_updated_at       timestamptz NOT NULL DEFAULT now(),
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX repair_playbooks_code_idx ON repair_playbooks(protocol, code_display);
CREATE INDEX fleet_insights_org_date_idx ON fleet_insights(org_id, analysis_date DESC);
CREATE INDEX ai_diagnoses_equipment_idx ON ai_diagnoses(equipment_id);
```

---

## Fuel-at-Fill-Up (the per-vehicle MPG tracker)

```sql
CREATE TABLE fuel_entries (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES organizations(id),
  equipment_id          uuid NOT NULL REFERENCES equipment(id),

  -- Fill-up data
  filled_at             timestamptz NOT NULL,
  gallons               numeric(8,2) NOT NULL,
  price_per_gallon      numeric(6,3),            -- if known
  total_cost_cents      integer,
  odometer_mi           integer NOT NULL,        -- reading at pump

  -- Calculated (filled by trigger or app logic)
  miles_since_last      integer,                 -- delta from previous fill-up
  mpg                   numeric(5,2),            -- miles_since_last / gallons

  -- Source
  source                text NOT NULL DEFAULT 'manual',  -- "manual", "fuel_card", "nfc"
  entered_by            uuid REFERENCES employees(id),

  -- For equipment (GPH model instead of MPG)
  engine_hrs_at_fill    numeric(10,1),
  hours_since_last      numeric(6,1),
  gph                   numeric(5,2),            -- gallons per hour

  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX fuel_entries_equipment_idx ON fuel_entries(equipment_id, filled_at DESC);
```

---

## QR Codes for Vehicle Lookup

Not a table, just a note: each equipment row gets a deterministic QR code URL: `https://faultboard.com/v/{equipment_id}` (or a short code). The QR sticker on the truck door links to the vehicle's page showing active codes, open work orders, PM status, and full history. No login required for read-only view (or PIN-protected if needed).

---

## Indexes and Performance Notes

The two hottest queries:

1. **Meghan's morning dashboard**: all active fault codes grouped by severity, joined to equipment for unit/make/model. Index on `fault_code_events(org_id, status)` where `status = 'active'` covers this.

2. **Vehicle detail page** (the tech's view): all fault events for one vehicle, all work orders, all PM schedules. Indexed by `equipment_id` on all three tables.

The daily fleet insight cron reads all active faults in one query, builds the context, and sends it to Claude. One API call, one insert into `fleet_insights`. The Samsara polling cron runs every 15 minutes, hits the feed endpoint with the stored cursor, and upserts into `fault_code_events` and `vehicle_snapshots`.

---

## Table Count

| Category | Tables | Purpose |
|----------|--------|---------|
| Shared | 3 | organizations, equipment, employees |
| Samsara sync | 2 | connections, cursors |
| Fault tracking | 3 | events, catalog, vehicle_snapshots |
| Work orders | 3 | work_orders, fault_links, parts |
| PM scheduling | 2 | schedules, completion_log |
| AI layer | 3 | diagnoses, fleet_insights, playbooks |
| Fuel tracking | 1 | fuel_entries |
| **Total** | **17** | |
