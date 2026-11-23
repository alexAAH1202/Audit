# Changes made in this session (2026-11-23)

Everything below is on branch `claude/awesome-maxwell-md7es8`, in 39 commits before this document, starting from the files you
supplied (`access-audit.html` at 1,860 lines, now about 3,700). The commit hash is given beside each change so
you can read or revert it. Nothing was merged to another branch and no pull request was opened.

**Read this first**

- Items marked **DRAFT** were built from best-practice defaults, not confirmed decisions. They are all
  listed in the tool under **Review list** and in `docs/review-with-consultant.md`.
- **One format change affects stored data:** answers moved from option positions to text codes
  (`24fe7ba`). Existing audits convert on first load after a backup file is downloaded. See
  [Data safety](#data-safety).
- Not tested: a real phone, a real screen reader, Safari or Firefox, a real browser evicting storage.

---

## 1. Report v2 (your patch files)

| Commit | Change |
| --- | --- |
| `f6c4885` | Baseline: your `access-audit.html` and the patch files, unchanged |
| `84e2d5b` | Step 1, report styles appended to the main stylesheet |
| `d1d0ce7` | Step 2, report event wiring |
| `4ba24c7` | Step 3, `reportHTML()` replaced; `PRIORITY_GROUPS` removed; `tfOptions()` and `TF_MAX_MONTHS` kept |
| `9a7b470` | Step 4, updated `patch.js`: journey priority is a property of the page, `SECTION_PRI` is only a fallback |
| `376c02a` | Step 5, journey-priority control in the template editor |

The report now has: a position paragraph (replaces the % score), summary tiles, a priority-by-effort matrix,
a journey view, findings with Impact and Action fields, and a works schedule.

## 2. Template content

| Commit | Change |
| --- | --- |
| `892f204` | `addJourneyDividers` pointed ENTER at "Entrances" (that function is now superseded by the in-app button) |
| `cdd979c` | Signage shown after Accessible Adult Change Facilities (order only; no ids changed) |
| `f37f091` | Dividers added: **ENTER, MOVE AROUND, AMENITIES, BE INFORMED** (with ARRIVE, JOIN IN, LEAVE the journey has 7 stages). Internal Accessways, Floor / Ground Surfaces and Signage moved to sit in order. Saved templates get an **Add journey sections** offer. |
| `eea8eaa`, `19b642b` | **LEAVE section**, 3 pages, 31 questions, **DRAFT**. Corrected against NCC 2022 text (see section 12). Saved templates get an **Add LEAVE section** offer. |
| `b0fe1d1` | **Site Scope** page after the Title Page, **DRAFT** (section 7) |

No existing page or question id changed in any of these. New pages are appended in code and moved into place.

## 3. Data safety (design brief, Phase 1)

| Commit | Change |
| --- | --- |
| `6daecab` | Asks the browser for persistent storage; says plainly when refused |
| `9f503ed` | **Back up audit** (one JSON: answers, report fields, photos, template), **Restore audit** (validates, previews, writes a safety backup first), **Mark audit complete** (writes a backup), automatic backup on Report view and Export report when something changed, "Not backed up" warning on load |
| `e1b48aa` | Failed saves are no longer silent (red notice, clears itself); **Reset audit** now needs the site name typed |
| `24fe7ba` | Answers stored as **text codes** (`pass`, `high`, `med`, `low`, `breach`; `found`, `notfound`, `na`) instead of array positions. Saved as `{s, r, cur, v:2}`. |
| `d0af660` | **Photo integrity check**: a manifest of photo ids is compared with what the browser holds on load; missing photos raise a notice naming the items |
| `3fed43e` | **Resume where you left off**, with a Continue button; Next unanswered also continues from the saved point |

**The migration to text codes** copies the raw data inside the browser (`iac_answers_v2_pre_codes`,
`iac_template_v2_pre_codes`), downloads a JSON backup, then converts and saves with version 2. An answer that
pointed at no option is kept as `key|legacy`. Older backup files (`schemaVersion` 1) and imported templates
convert on the way in; new backups are `schemaVersion` 2. I verified it against an audit made by the previous
build: every label, finding, score and navigation count matched, except one deliberately corrupt answer.
`CLAUDE.md` now says "never change an existing response option's code" in place of "never reorder PHML".

## 4. Report output and print

| Commit | Change |
| --- | --- |
| `deded0d` | **Export schedule (CSV)** button |
| `764838e`, `7932602` | Exported report flattens the editable boxes and dropdowns to text and drops auditor guidance |
| `76843d0`, `10eeac6` | Matrix colours fixed; the export carries the report styles and ignores the on-screen matrix filter |
| `7937579` | **Print layout**: A4 cover page, running header with site name and revision, "Page X of Y" footer, repeating schedule headers, no finding split across pages. Ctrl+P prints the same flattened document as the export. Findings now sort by journey order so section headings do not repeat. A **Revision** field was added. |
| `f5477ce` | **Photo plates**: findings and the schedule cite "Figure N"; large numbered plates (two per page) with optional captions. CSV gains a Figures column. |
| `22fcea8` | **Scope and limitations** section (scope, benchmark, engagement, coverage table, editable exclusions, key to the ratings). Fixed a bug where date fields never appeared in the report. |

Print header, footer and page numbers use a feature only Chrome and Edge support.

## 4b. Report rewrite (after the review)

- **Findings say what was found.** Each question can carry a *finding statement*, a *standard impact* and a *standard
  action*, written once in the template editor (Report wording). Until they are written, a finding reads
  "Not met: <requirement>" instead of repeating the requirement as if it were the result.
- **New structure:** 1 Summary (position, numbers, the five most serious findings, where to start, the journey),
  About this report, 2 Scope and method, 3 Findings (by journey stage, then place, each place once, numbered F1, F2 …),
  4 Action plan (by when to act, linked by F-number), 5 Items to monitor, Appendix A coverage, B ratings, C photographs.
  The same 150-finding test audit prints in 28 pages instead of 39.
- **Severity wording:** answer buttons read Pass / High / Medium / Low / Breach of Code; the report says "High severity"
  and so on. "Priority" now means journey position only. Stored codes are unchanged.
- **Firm name** on the cover, header and footer comes from the Title Page (Consultant > Company Name).
- **Insert a draft** writes a position paragraph from the answers for the auditor to rewrite.
- **About this report**: your standard text is the starting content of the Access Audit Overview box (editable per
  audit) and prints as its own section.
- CSV gains Ref, Finding and Requirement columns.

## 5. Capture on site

| Commit | Change |
| --- | --- |
| `1a3c553` | **Sweep to Pass** on Legislative groups: never overwrites an answer, marks swept answers, Undo sweep, disclosed in the report |
| `1aeefe0` | Phone top bar: secondary actions moved behind a **More** menu (282px to 100px tall) |
| `1a8c928` | Navigation shows **answered / total** with a tick when complete, not a compliance score; section totals; **Next unanswered** button |
| `ed21fc6` | **Name each repeated element** ("Bay 2 near the door"), carried into the report, schedule, CSV and photo plates |
| `2ec0332`, `ca06d44`, `d0af660`, `75cd5c5` | Question layout restyled (stacked, readable); **Not applicable** as a sixth answer on every question; **+ Comment** toggle; **Best Practice groups folded** by default |
| `6994bb2` | **Search across questions** (text, clause, page, element name, your comments) |
| (see git log) | **Photo mark-up**: after a photo is taken, an optional editor adds an arrow and "790 mm" style labels by tapping (also keyboard-operable); Skip keeps the photo as taken; thumbnails reopen it; the marked-up picture is used everywhere and the original is kept |

## 6. Accessibility

| Commit | Change |
| --- | --- |
| `3dab842` | Answer buttons are radio groups: named, state announced, one tab stop, arrow keys |
| `ce2c19d` | Full check with axe-core over 10 screens plus the export: **0 violations**. Fixes included labels, heading order, contrast, closed phone drawer made inert, skip link, 44px targets on phones, reflow at 320px, a main landmark in the export, and Next unanswered moved from a floating button to a bar so it never covers an answer. Report: `docs/accessibility-conformance.md`. |

**Not done:** no real screen reader, switch or voice-control testing. That is the main gap.

## 7. Site Scope and Not applicable — DRAFT

The Site Scope page asks six questions (class, storeys, lift, parking, sanitary facilities, public or staff) plus a
build-date follow-up. Draft rules leave out Accessible Car Parking, the four toilet pages and Refuge & Assisted
Evacuation. A left-out page is greyed with its reason, offers **Assess anyway**, is never hidden once answered and
drops out of progress and scores. **No lift** marks four lift-only questions Not applicable. Staff-only skips nothing,
because NCC D4D2(6) counts employees as occupants.

## 8. Review list

A top-bar **Review list (N)** button opens 17 items to review with your consultant, each with a tick box
(`T.meta.reviewed`). Orange tags mark draft content in the tool: **DRAFT RULES** on Site Scope, **Draft rule** in a
skipped-page banner, **Needs review** beside "clause TBC" questions, and a **Draft content** box in the report view.
None of these tags prints or exports. `docs/review-with-consultant.md` mirrors the list.

## 9. Storage keys added

All are saved with the audit in `S` unless noted, and so are covered by backup, restore and reset.

| Key | Meaning |
| --- | --- |
| `S[key]` | now a text code (schema v2) |
| `S[key\|sw]` | passed by group sweep |
| `S[key\|nasrc]` | Not applicable set by Site Scope |
| `S[sectionId+suffix~n\|lbl]` | name of a repeated element |
| `S[key\|cap:photoId]` | photo caption |
| `S["scopeov\|"+pageId]` | page switched back on despite scope |
| `S["report\|position" / "limits" / "revision"]` | report-level text |
| `iac_resume_v1` (browser) | where you left off |
| `iac_photo_manifest_v1` (browser) | photos the audit recorded |
| `iac_backup_v1` (browser) | last backup time and fingerprint |

`CLAUDE.md` has the updated table.

## 10. Documents added to the repo

| File | What it is |
| --- | --- |
| `docs/design-brief.md`, `CLAUDE.md`, `README.md` | The brief and project instructions you supplied |
| `docs/leave-section-draft.md` | LEAVE questions, with a research update from the NCC text |
| `docs/scoping-step-draft.md` | Site Scope design, defaults used, and research findings |
| `docs/review-with-consultant.md` | The 17 items to review |
| `docs/accessibility-conformance.md` | Method, fixes and open gaps |
| `docs/session-changes.md` | This file |

## 11. Environment change

To read the NCC and legislation pages I proposed, and you approved, a personal environment named **Audit** for
this repository that allows `ncc.abcb.gov.au`, `www.abcb.gov.au`, `humanrights.gov.au` and
`www.legislation.gov.au`. It replaces the Default environment for this session; the two Firebase hosts the Default
allowed are not carried over.

## 12. Corrections the research produced

Read directly from NCC 2022 Parts D3, D4, E3 and E4:

- Latch height is 900mm to 1.1m (downward action) or 900mm to 1.2m (push), not "900 to 1200mm". Grip clearance 35 to 45mm.
- Exit handrails (D3D22(1)(f)) and exit stairs (D4D4) are code requirements; fire-isolated stairs need only clause 11.1(f) and (g).
- Braille and tactile exit signage (D4D7(1)) and the lift fire-warning sign (E3D4) were added as Legislative questions.
- E4D9 has no visual alarm requirement for deaf occupants.
- Staff-only areas are covered by D4D2(6), so the draft rule skipping Customer Service Areas was withdrawn.

Still unconfirmed and marked "clause TBC": AS 1670.1 visual alarms, refuge dimensions (the 800 x 1300mm figure),
the WHS emergency-plan clause, and AS 1428.1 clause 11.1(f) and (g).

## 13. How it was tested

A set of headless-browser scripts was run after each change and is now in the repository as **`tests/`**:
30 suites covering answering, navigation, template migrations, backup and restore, the text-code migration against
an audit saved by the previous build, printing and export, and axe-core accessibility checks on 10 screens plus the
export. `node tests/run.js` runs them in about 1.5 minutes; each suite's output is compared with a saved snapshot and
a page error fails the run. I confirmed the suite is stable over repeated runs and that it catches a deliberately
introduced fault (removing `aria-checked` from the answer buttons). See `tests/README.md` for how to read a result and
what is not covered.

## 14. Left undone

- **From the brief:** voice notes, measurement fields (need your consultant's values), the Phase 3
  field test, multiple audits, re-audit and rectification, and the Firebase option.
- **Needs you:** the Review list; whether the tool is hosted anywhere (offline use and Add to Home Screen need a web address).
- **Known rough edges:** Next unanswered's first jump from a fresh audit lands on the Summary page; open Best
  Practice groups and comment boxes are not remembered across reloads; old saved templates need three one-click
  "add" offers (LEAVE, journey sections, Site Scope).

## Severity wording, To be confirmed, action-plan reference

- "About this report" now says High, Medium and Low **severity**, and refers to "the action plan in section 4" instead of the works schedule. Saved templates still holding the first wording are updated on load; edited text is left alone.
- New answer **To be confirmed** (code `tbc`), appended to the Pass/High/Medium/Low/Breach set. It is not a finding and is not scored (like Not applicable). Saved templates get the option added on load.
- Report section 5 is now "Open items and items to monitor", listing To be confirmed items first; Appendix B defines the term.
- On a phone the extra button adds one row (about 65px) to each question.

## Effort: suggested defaults and setting it on site

- Every finding now has an effort, so "Where to start" fills in. It comes from, in order: the effort chosen for that finding, the question's default effort in the template, then a draft guess from the question text (about 155 High / capital, 245 Moderate, 105 Low). On the Review list as `effort-defaults`.
- On site: once an answer is a finding, an **Effort** dropdown appears beside + Comment, preset to "Moderate (suggested)" or similar. A choice is saved under `key|diff`; leaving it on the suggestion saves nothing, so a better template default still reaches it later.
- Report view marks an untouched effort as *suggested* (not exported). Template editor: Report wording has a **Default effort** field per question (`item.eff`).
- The To be confirmed button reads **TBC** (spoken "TBC, to be confirmed") so answers fit on one row on a phone.
