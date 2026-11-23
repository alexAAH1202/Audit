# Access Audit Tool — Technical & UX Design Brief

As of 2026-11-23. Subject: `access-audit.html`, the Inclusive Access Co. premises access audit tool.

---

## How to read this brief

This brief treats the tool as a **field instrument first and a document generator second**. Every recommendation is judged against one question: does it survive a wet Tuesday in a carpark with one hand free and no signal?

Priorities are absolute, not negotiable preferences:

- **P0** — can lose a day of completed fieldwork. Fix before the next audit.
- **P1** — core to the product being good at its job.
- **P2** — growth and margin; valuable, not urgent.

Within each section, items are marked **Must**, **Should** or **Could**.

### Out of scope

Migrating to a framework, adding a backend, or building native apps. The single-file, no-build, works-offline architecture is a genuine asset for a tool used in basements and carparks, and nothing here requires abandoning it.

### The one principle worth stating

The audit template is the intellectual property. The code is replaceable; 27 pages of clause-referenced questions built by an accredited consultant are not. Every recommendation below protects that content or makes it faster to apply.

---

## Where the tool stands today

The capture layer is already better than most commercial products in this space. This section exists so that none of it gets rebuilt by accident.

| Already strong | Why it matters |
| --- | --- |
| 27 pages of clause-referenced questions, split into Legislative Requirements and Best Practice | This is the product. Competing tools ship generic checklists with no clause citation. |
| Template editor with JSON import/export | The template can evolve without a developer, and a client-specific variant costs minutes. |
| Per-item photo capture, compressed client-side to IndexedDB | Photographic evidence is what turns a checklist into a report. |
| Repeatable element sections | Four entrances and three WCs are modelled correctly rather than flattened. |
| Single file, no build step, works offline | Survives the carpark. No deployment pipeline to maintain. |
| Self-contained HTML export with inline `contentEditable` | The client can correct wording without owning the tool. A genuinely good idea. |
| 44 px minimum tap targets, `aria-expanded`, `inert` drawer, `prefers-reduced-motion` | Someone has already thought about accessibility. The foundations are there. |

### Where it falls down

Three things, in order of how much they cost:

1. **Stored data is not durable.** A completed audit can vanish without warning and without a backup. This is covered in the next section and it outranks everything else.
2. **One control carries two meanings.** The Pass / High / Medium / Low / Breach set fuses *what was found* with *how urgent it is*, which is why the report could only ever be a sorted list of flags.
3. **Capture is uniformly slow.** Every question costs the same number of taps whether the building has that element or not, and whether it complies or not. Most answers in a real audit are "complies", and the tool charges full price for each one.

---

## P0 — Data durability

**A completed audit stored in this tool can be deleted by the browser, silently, after seven days.** Everything else in this brief is an improvement. This one is a liability.

### The mechanism

Since iOS 13.4 and Safari 13.1, WebKit applies a seven-day cap to all script-writable storage — IndexedDB, localStorage, sessionStorage, service worker registrations and the Cache API alike. If the user does not interact with the site for seven days of browser use, all of it is erased.

Source: https://web.dev/articles/storage-for-the-web

That is precisely where this tool lives. Answers are in localStorage. Photos are in IndexedDB. Both are in scope for deletion, and nothing warns the auditor it has happened — the tool simply opens empty.

The realistic failure: audit a site on a Friday, invoice, move on to other work, come back a fortnight later to write the report. The photographs are gone. There is no server copy, and the client has already been told the audit is done.

### Compounding factors

- **Single device, no sync.** A lost or stolen phone is a lost audit. For a consultancy carrying professional indemnity cover, this is worth raising with the insurer.
- **`Reset audit` is one tap behind a `confirm()`.** It clears answers and photos together, irreversibly.
- **localStorage runs to roughly 5 MB.** Answers are text so the headroom is real, but a large template plus a long audit will eventually approach it, and a `QuotaExceededError` on write is not currently caught — a failed save looks identical to a successful one.
- **No integrity check.** Nothing detects that photos referenced by the answer set have disappeared from IndexedDB.

### What to do

| # | Action | Priority | Notes |
| --- | --- | --- | --- |
| 1 | Call `navigator.storage.persist()` on load | **Must** | One line. Where granted, storage becomes exempt from routine eviction. Record the result and surface it. |
| 2 | Auto-export a JSON snapshot when an audit is first marked complete | **Must** | Write to the Downloads folder via the existing blob-download pattern. The file lives outside browser storage, which is the whole point. |
| 3 | Warn on load if the last export is older than the last edit | **Must** | A single amber bar: "This audit has unsaved changes not backed up since Tuesday." |
| 4 | Catch `QuotaExceededError` on every write and tell the auditor | **Must** | A save that silently fails is worse than one that refuses. |
| 5 | Add to Home Screen, documented as the standard field setup | **Should** | web.dev reports the eviction policy does not apply to installed PWAs, though developers have reported otherwise to WebKit. Treat it as mitigation, never as the fix. |
| 6 | Verify photo integrity on load and flag orphans | **Should** | Count IndexedDB records against photo-bearing answer keys; report any gap. |
| 7 | Make `Reset audit` require typing the site name | **Should** | A `confirm()` is muscle memory by the fiftieth audit. |
| 8 | Optional sync to a file-system handle or cloud folder | **Could** | The File System Access API covers desktop; mobile realistically needs a backend. |

### Acceptance

Items 1 to 4 are a day's work and remove the catastrophic case. Nothing else in this brief should start before they are done.

---

## P1 — On-site capture

The design target is a consultant standing in a carpark in November sun, phone in one hand, tape measure in the other, three hours into a survey, with no signal. Every decision below follows from that.

### The arithmetic problem

A full audit is roughly 27 pages at around 30 questions each. Even at one tap per question that is 800 deliberate actions, and most of them record that something complies. The tool currently charges the same price for "this is fine" as for a breach that needs a photograph, a measurement and a recommendation.

The fix is not faster tapping. It is not asking.

### Must

**A scoping step before the audit starts.** Six questions — building classification, number of storeys, lift present, parking provided, sanitary facilities provided, public or staff-only — that mark whole pages not applicable and remove them from the run. On a single-storey building with no lift this alone removes several pages. This is the single largest time saving available and it costs one new page plus a `skip` flag per page.

**Sweep-to-pass per question group.** One control at the top of each Legislative Requirements group: *Mark all as Pass*. The auditor then taps only the exceptions. This inverts the cost model so the tool charges for findings rather than for compliance.

Guard it: a swept group must be visibly marked as swept rather than individually assessed, because the distinction matters if the report is ever challenged. A small "swept" chip on the group, carried into the export, is enough.

**Measurement capture as a first-class field.** A numeric field with `inputmode="decimal"`, the unit fixed by the question rather than typed, and the required value shown beside it so the comparison happens on site rather than at the desk. Where the measurement fails, the question auto-selects a non-compliant state.

### Should

**Photo annotation at capture.** A photograph of a tape measure across a doorway is the single most persuasive artefact in an access report, and it is worthless if nobody can read the figure later. Let the auditor drop one arrow and one measurement label onto the image immediately after capture, while they still remember what they were pointing at. Canvas over the existing compressed JPEG; no library needed.

**Voice note per finding.** Faster than typing while standing, and the auditor can transcribe at the desk. `MediaRecorder` to a blob in the same IndexedDB store.

**Resume where you left off.** Store the last answered question key and offer *Continue from Floor Surfaces, question 14* on load.

**An explicit "not applicable to this building" per question.** Distinct from unanswered. The report currently cannot tell the difference between a question nobody looked at and one that does not apply, and only one of those is a gap in the audit.

### Could

- Haptic confirmation on each tap, so the auditor does not need to look down to confirm registration.
- A high-contrast field mode: heavier weights, stronger borders, no mid-grey text, for direct sunlight.
- Bluetooth laser measure integration via Web Bluetooth — real time saving, narrow device support.

### What not to do

Do not add a confirmation step to answering a question. Do not animate page transitions. Do not autosave to a spinner. At 800 interactions, 200 ms of friction each is nearly three minutes of standing in a carpark watching a phone.

---

## P1 — Information architecture

Twenty-seven pages is the right amount of content and the wrong amount of navigation. The off-canvas drawer is a sound pattern; what it lacks is any way to answer "what is left?" without reading the whole list.

### Must

**Progress by section, not score by page.** The nav currently shows `12/18 2` per page, which is a compliance figure dressed as a progress figure. An auditor mid-survey needs *answered / total*, and a section that is complete should read as complete. Keep the flag count; move the score out of the nav entirely.

**Jump to next unanswered.** A single persistent control. At the end of a long audit, finding the four questions that were skipped is currently a manual scan of 27 pages.

**Name element instances.** Repeatable sections are the right model, but `Disability Accessible Parking Bay x 3` produces three identically-titled blocks in the report. Add a required short label per instance — *Bay 1 (nearest entry)*, *WC Level 1*, *East entrance* — captured when the instance is added. The report cannot be read without it, and the works schedule cannot be acted on.

### Should

**Search across questions.** Free-text over question text and clause reference. An auditor who remembers a handrail question but not which page it was on currently has no route to it.

**Mark a page not applicable, with a reason.** Distinct from unanswered, and carried into the report as a scope statement. This is also what makes the scoping step work.

**Collapse Best Practice groups by default.** They are valuable and they are not what gets audited first. Collapsed by default, with a count, keeps the legislative run tight without hiding the content.

### Could

A single-page "sweep" mode that lists every unanswered question across the whole audit in one scroll, for the final tidy-up before leaving site. Leaving a site and discovering a gap is an expensive mistake.

---

## P1 — Data model

Two structural problems, one of which is a latent data-corruption bug.

### Answers are stored as array indices

`S[key]` holds the position of the chosen option in the `PHML` array. The code already carries a comment warning that inserting an option mid-array would silently reinterpret every saved answer — which is correct, and is exactly why the response set can never be improved while that representation stands.

**Must: migrate to stable string codes.** `"pass"`, `"high"`, `"med"`, `"low"`, `"breach"`. The migration is a one-time pass over stored answers keyed on a `schemaVersion` flag, run on load, with a JSON backup written before it touches anything. Perhaps twenty lines. Until it is done, the response set is frozen.

### One control carries three dimensions

Pass / High / Medium / Low / Breach fuses three independent facts: what was found, how bad it is, and how hard it is to fix. Separating them is what makes a works programme derivable rather than hand-written.

| Dimension | Values | Captured where |
| --- | --- | --- |
| **Status** | Complies, Does not comply, Capable of compliance, To be confirmed, Not applicable | On site — one tap, as now |
| **Severity** | Breach of Code, High, Medium, Low | On site, only when status is non-compliant |
| **Effort** | Low, Moderate, High / capital | At the desk, in the report view |
| **Journey priority** | 1-4 | Derived from the page's divider section. Never typed. |

Status and severity can share a single row of controls on site, since severity is only asked when status warrants it. *Capable of compliance* and *To be confirmed* are the two states the current set cannot express, and both appear constantly in real reports.

### Fields to add

| Field | Suffix on the answer key | Captured |
| --- | --- | --- |
| Measured value | `meas` | On site |
| Required value | `req` | From the template, not typed |
| Effort | `diff` | Report view |
| Impact — who is excluded | `impact` | Report view |
| Action — the works instruction | `action` | Report view |

Each is stored at the answer key plus a pipe plus the suffix — the pattern already established by the existing `n` (note) and `tf` (timeframe) keys. They therefore need no migration, and `saveA()` persists them unchanged.

### Template versioning

A re-audit twelve months later must align to the earlier one, and the template will have moved in between. **Should:** stamp every export with `templateVersion` and keep question `id`s stable across edits — the editor already mints ids via `genId()`; what is missing is a guarantee that editing a question's text preserves its id. Add a short "this will break re-audit alignment" warning when a question is deleted rather than edited.

### Export format

**Should:** version the audit export itself (`{schemaVersion, templateVersion, answers, photos, meta}`) and make import tolerant of older versions. Today's export is a convenience; once it is the backup mechanism described in the P0 section, it is a format with obligations.

---

## P2 — The client deliverable

Largely addressed by the Report v2 patch already applied: journey-ordered findings, a priority-by-effort matrix, Fact / Impact / Action framing, a works schedule, and the percentage score removed. What follows is what remains.

### Must

**Set the journey dividers.** The patch derives priority from divider sections, and with only two dividers the journey view has two rungs. Seven dividers — ARRIVE, ENTER, MOVE AROUND, JOIN IN, AMENITIES, BE INFORMED, LEAVE — make it the view a client is walked through in a meeting. This is template content, not code, and it is the highest-value remaining change.

**Add a LEAVE section to the template.** Egress for people with disability is the most consistently under-audited area in Australian practice, because the Premises Standards largely stop at the door on the way out, so nothing in a compliance-driven template prompts anyone to look at it. Refuge areas, evacuation lifts, warden procedures and emergency communication deserve a page. This is an audit-quality gap, not a reporting one.

### Should

**PDF pagination.** The export prints, but nothing controls where pages break. `break-inside: avoid` on findings and cards is in the patch; a cover page, running headers carrying the site name and revision, and page numbers are not. A report that arrives with a finding split across two pages reads as unfinished.

**Photo plates.** Large-format photographs with figure numbers, referenced from findings, rather than thumbnails inline. This is the convention in consultant reports and it is what makes a report feel like one.

**Scope and limitations as a report section.** Drawn from the existing Access Audit Details page. Every professional access report carries one, and it is what limits liability when a client asks why the roof terrace was not assessed.

### Could

A client-facing web version of the report at a shareable link, with filters live. More useful than a PDF for a facilities team working through a programme, and it is a plausible subscription hook.

---

## P1 — Accessibility of the tool itself

An access consultancy's own software failing WCAG is a commercial risk, not just an ethical one. It will eventually be opened in front of a client, and it should be the strongest argument in the room rather than the weakest. It also has to be usable by an auditor who is themselves disabled — a materially likely scenario in this profession.

The foundations are already laid: 44 px targets, `aria-expanded` on the drawer toggle, `inert` on the background rather than a focus trap, `prefers-reduced-motion`, visible `:focus-visible` rings, and status colours paired with text labels rather than carrying meaning alone.

### The defect to fix first

**The priority buttons do not expose their state.** Each option renders as a plain `<button>` whose selection is carried by an `on` class — purely visual. A screen reader user can hear the five options and cannot tell which one is chosen, and cannot tell that choosing one deselected another.

Fix as a radio group:

```html
<div role="radiogroup" aria-labelledby="q-<id>-label">
  <button role="radio" aria-checked="true"  ...>Pass</button>
  <button role="radio" aria-checked="false" ...>High Priority</button>
</div>
```

Keep the buttons; add `role`, `aria-checked`, and arrow-key navigation within the group. `updateAnswerUI()` already toggles the class per key, so it is the natural place to set `aria-checked` alongside.

### WCAG 2.2 items worth a deliberate pass

| Criterion | Level | Relevance here |
| --- | --- | --- |
| 1.3.1 Info and Relationships | A | The radio-group defect above. The highest-impact item. |
| 2.4.3 Focus Order | A | Re-render on answer must not drop focus. Partly handled by the targeted-update helpers; confirm under keyboard. |
| 4.1.2 Name, Role, Value | A | Same root cause as 1.3.1. |
| 2.5.8 Target Size (Minimum) | AA | 24 x 24 required; the tool already uses 44. Passing. |
| 3.3.2 Labels or Instructions | AA | Textareas in the report view need visible labels, not placeholders alone. The patch supplies these. |
| 1.4.3 Contrast (Minimum) | AA | Check the muted greys on the light background, particularly `--muted` on `--bg`. |
| 1.4.11 Non-text Contrast | AA | Option button borders and focus rings against their backgrounds. |
| 3.2.6 Consistent Help | AA | New in 2.2. If help is added, keep it in the same place on every page. |
| 3.3.7 Redundant Entry | AA | New in 2.2. Site and client details should not be re-entered anywhere. |
| 2.5.7 Dragging Movements | AA | New in 2.2. Nothing currently drags; keep it that way, or supply a tap alternative. |
| 1.4.10 Reflow | AA | Verify at 320 px and at 400% zoom. The 27-page nav is the risk. |

### Do this, then say so

**Must:** audit the tool with the tool. **Should:** publish the result — an accessibility statement and conformance report for your own software, including what does not yet conform and by when.

An access consultancy that publishes an honest conformance report for its own product, including the failures, is making an argument no competitor's marketing can match. It is also the most efficient possible test of the template.

---

## P2 — Multi-site, re-audit and rectification

The tool currently holds one audit at a time. Starting the next one means resetting and losing the last. That single constraint caps the business model at one-off reports.

### Must

**Hold more than one audit.** Namespace stored answers under an audit id rather than at the root, with a picker on load: *Kerrabee Community Centre — 12 Nov, in progress*. The storage pattern barely changes; what changes is that finishing an audit stops being destructive.

**Archive rather than reset.** `Reset audit` becomes `Close audit`, which exports a JSON snapshot and moves it out of the active slot.

### Should

**Re-audit from a previous audit.** Open last year's audit, carry every finding forward with its status, and work through confirming or clearing each. The auditor records what changed rather than starting from zero.

**Rectification status per finding.** Open -> In progress -> Rectified -> Verified. The report then shows movement rather than a fresh list of faults, and a client who can see progress has a reason to commission the next one.

This is the change that converts a one-off deliverable into a recurring engagement, and it is worth more than anything else in this brief commercially.

### Could

- **Portfolio view.** One client with fourteen sites, ranked by outstanding breaches. This is the view a council or university facilities manager actually wants.
- **Client read-only link** per site, showing live rectification progress.
- **Benchmarking across a portfolio** — which barriers recur, where the systemic spend should go.

---

## Backend option — Firebase on the free Spark plan

**Yes, with one significant constraint: photographs.** Spark solves the P0 durability problem properly. It cannot store images the normal way.

### What Spark gives you

| Service | Spark allowance | Fit for this tool |
| --- | --- | --- |
| Cloud Firestore | 1 GiB stored, 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day, 10 GiB/month egress | Comfortable. An audit is a few thousand small values. |
| Authentication | Email, password and social sign-in, no cost | Enough for a small team of auditors. Phone auth is charged. |
| Hosting | 10 GB storage, 360 MB/day transfer | Ample for one HTML file. |
| Cloud Functions | **Not available on Spark** | No server-side PDF generation, scheduled jobs or privileged logic. |
| Cloud Storage | **Not available on Spark** | The constraint. See below. |

Sources: https://firebase.google.com/docs/firestore/pricing and https://firebase.google.com/pricing

### The change that matters

Since 3 February 2026, Cloud Storage for Firebase requires a linked billing account, which means Blaze, at any volume. Spark projects lost access to all buckets including default ones. Any tutorial older than this year that shows photo upload on the free plan is out of date.

So the obvious design — JSON in Firestore, JPEGs in Cloud Storage — is not available on Spark.

### The workaround, and its ceiling

Store each compressed photograph as base64 inside its own Firestore document. A Firestore document holds up to 1 MiB, and base64 inflates by about a third, so the tool's existing 1400 px / 0.7-quality output fits with room to spare.

The ceiling is the 1 GiB total. At roughly 400 KB a photo that is about 2,500 photographs — perhaps 20 to 40 audits. Enough to prove the model, not enough to run on indefinitely.

Treat this as a deliberate staging post rather than an architecture.

### The part that is genuinely excellent

Firestore's offline persistence is close to purpose-built for this tool. The SDK reads and writes against a local cache and syncs when a connection returns, so the carpark-with-no-signal case is handled by the library rather than by your code. It would replace the current localStorage layer rather than sitting beside it.

One caution, because it is the same trap as before: that local cache is itself IndexedDB, so unsynced writes remain exposed to Safari's seven-day eviction. Sync opportunistically, and keep the JSON export from the P0 section regardless.

### It does not break the architecture

The Firebase SDK loads as ES modules from a CDN, so single-file and no-build-step both survive. Security rules replace the server logic that Cloud Functions would otherwise provide, which suits a model where each auditor only ever reads their own audits.

### What this would actually cost on Blaze

Blaze includes the same no-cost quotas and bills only above them. For one consultancy's volume — a few audits a month, a few thousand photographs a year — the realistic bill is low single-digit dollars a month, mostly Cloud Storage at roughly $0.02/GB/month.

The genuine objection to Blaze is a runaway bill from a mistake or an abusive client, not the expected cost. That is addressed with a budget alert, App Check, and security rules that cap per-user writes.

**Recommendation:** build against Firestore now, on Spark, with photos as base64. Keep the photo read and write behind a thin adapter of two functions. Moving to Cloud Storage later then changes those two functions and nothing else.

---

## Roadmap

Four phases, each with an exit gate. Sequence, not to scale.

| Phase | When | Work | Exit gate |
| --- | --- | --- | --- |
| **1. Secure the data** | Now, 1-2 days | `storage.persist()`, auto-export on close, stale-backup warning, quota errors caught | Audit survives a wiped browser |
| **2. Report and template** | This week | Report v2 applied, 7 journey dividers set, LEAVE section added | Journey view reads as a walk-through |
| **3. Capture speed** | 2-3 weeks | Scoping step, sweep-to-pass, measurement fields, radio-group a11y fix | Full audit completed in under two hours |
| **4. Sync and re-audit** | When it pays | Firestore on Spark, multi-audit storage, rectification status | Re-audit opens the previous findings |

The sequencing is not negotiable at the first gate: Phase 1 is a day's work and removes the only failure that destroys completed client work. Phases 2 and 3 can overlap if two people are working. Phase 4 should wait until the tool has carried three or four real audits, because the storage model should be designed around how the data actually accumulates rather than around how it was expected to.

---

## Acceptance criteria

Each is testable by someone who did not write the code. A phase is not done until every row for it passes.

### Phase 1 — Secure the data

- [ ] Complete a short audit, clear all site data in browser settings, reopen: the audit is recoverable from the exported file.
- [ ] `navigator.storage.persisted()` returns true after load, or the tool says plainly that persistence was refused.
- [ ] Filling storage to quota produces a visible error, not a silent failed save.
- [ ] Editing an audit and not exporting produces a warning on next load.
- [ ] `Reset audit` cannot be triggered by two taps.

### Phase 2 — Report and template

- [ ] Every divider has an explicit journey priority; no amber fallback hints remain in the editor.
- [ ] The journey view shows at least six stages, in the order a visitor moves.
- [ ] A finding with Impact and Action written appears correctly in the works schedule and the CSV.
- [ ] The printed report breaks pages without splitting a finding.
- [ ] A LEAVE section exists with at least six questions.

### Phase 3 — Capture speed

- [ ] A single-storey building with no lift and no parking skips at least four pages via the scoping step.
- [ ] Sweeping a group to Pass marks it visibly as swept, and that mark survives export.
- [ ] A measurement below the required value selects a non-compliant state without a second tap.
- [ ] **Field test:** one real audit completed start to finish on a phone, outdoors, in sunlight, in airplane mode, in under two hours. Nothing in this phase is accepted on a desk.
- [ ] Every question group is operable by keyboard alone, and a screen reader announces which option is selected.

### Phase 4 — Sync and re-audit

- [ ] Two audits exist simultaneously; switching between them loses nothing.
- [ ] An audit started offline syncs when a connection returns.
- [ ] Opening last year's audit carries every finding forward with its status.
- [ ] A rectified finding appears as rectified in the report, not as a new fault.

### Standing criteria

These apply to every phase and are worth re-checking at each gate.

| Check | Why |
| --- | --- |
| The tool still works as one file with no build step | The architecture's main asset |
| The tool still opens and runs with no network | The carpark case |
| No new WCAG 2.2 AA failure introduced | The credibility argument |
| A saved audit from the previous version still loads | Never break stored client work |

### Open questions

- What is the realistic photo count on a large audit? That number decides whether the Firestore base64 ceiling is a staging post or a dead end.
- Does the business want other auditors using this, or is it a single-operator tool? Multi-user changes the auth and rules design in Phase 4.
- Is there an existing egress question set to draw the LEAVE section from, or does it need writing from the NCC and AS 1428 provisions?
