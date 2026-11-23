# Inclusive Access Co. — Premises Access Audit Tool

## What this is

`access-audit.html` is a single-file, no-build, offline-capable web app for conducting
physical premises access audits in Australia (NCC Part D4, Disability (Access to
Premises — Buildings) Standards 2010, AS 1428 series, DDA 1992).

An auditor uses it on a phone, on site, often with no signal. It then produces a
client-facing report.

The full design brief is at `docs/design-brief.md`. Read it before proposing
architectural changes.

## Hard constraints — do not violate

1. **Never reorder or insert into the `PHML` array.** Answers are stored as array
   indices. Changing the order silently reinterprets every saved audit. If the
   response set must change, migrate to string codes first (brief, Data model).

2. **Never break single-file / no-build.** No bundler, no framework, no npm install
   step. Libraries load as ES modules from a CDN or not at all.

3. **Never break offline.** The tool must open and run fully with no network.

4. **Never break a saved audit.** Stored answers are real client work. Any change to
   storage shape needs a migration keyed on `schemaVersion` and a JSON backup written
   before it runs.

5. **Never regress accessibility.** This is an access consultancy's own tool. Target
   is WCAG 2.2 AA. Check any UI change against the criteria listed in the brief.

## Storage model

| What | Where | Key |
| --- | --- | --- |
| Answers | localStorage | `S[key]` — index into the response set |
| Note | localStorage | `S[key + "\|n"]` |
| Timeframe | localStorage | `S[key + "\|tf"]` |
| Effort | localStorage | `S[key + "\|diff"]` |
| Impact | localStorage | `S[key + "\|impact"]` |
| Action | localStorage | `S[key + "\|action"]` |
| Name of a repeated element | localStorage | `S[sectionId + suffix + "~" + n + "\|lbl"]` |
| Passed by group sweep | localStorage | `S[key + "\|sw"]` = `"1"` |
| Photo caption | localStorage | `S[key + "\|cap:" + photoId]` |
| Site Scope answer | localStorage | `S[itemId]`, a text code such as `"no"` |
| Page switched back on despite scope | localStorage | `S["scopeov\|" + pageId]` |
| Report-level text | localStorage | `S["report\|position"]`, `"report\|limits"`, `"report\|revision"` |
| Photos | IndexedDB (`iac-audit-photos`) | same answer key |
| Template | localStorage | `T` |

New per-finding fields use the same `key + "|suffix"` pattern. That needs no
migration and `saveA()` persists it unchanged.

## Current priority

**Phase 1 — data durability.** Browser storage can be erased after seven days of
inactivity (Safari's cap on script-writable storage), which can destroy a completed
audit with no backup. Until `navigator.storage.persist()`, auto-export, stale-backup
warning and quota-error handling are in place, nothing else ships.

## Known structure

- 27 template pages, some marked `divider: true` — these are journey sections
  (ARRIVE, ENTER, MOVE AROUND, JOIN IN, AMENITIES, BE INFORMED, LEAVE).
- Each page carries an optional `pri` (journey priority 1-4). Dividers set their
  section's priority; a page may override it.
- Report view is derived from those priorities crossed with effort. Priority answers
  *where in the journey*; severity answers *how bad*. Never conflate them.

## Terminology

- **Finding** — one non-compliant or noted item.
- **Journey priority** — 1 path of travel, 2 services, 3 amenities, 4 information.
- **Effort** — low / moderate / high-capital. Not a dollar figure.
- **Breach of Code** — a mandatory NCC or Premises Standards failure, not a
  best-practice gap.
