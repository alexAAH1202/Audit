# Report v2 — patch for access-audit.html

Apply in order. Nothing touches the capture flow, the `PHML` array, or any
stored answer, so existing audits keep working.

| File | Where it goes |
|---|---|
| `styles.css` | End of the existing `<style>` block |
| `patch.js` | Replaces `reportHTML()` |
| `wiring.js` | EVENTS section, after `const content=…` |
| `editor-priority.js` | Two small edits to existing lines in the editor |

## 1. styles.css
Paste before the closing `</style>`. Adds the matrix, tiles, journey rail
and report-field styles. Reuses your existing CSS variables.

## 2. patch.js
Delete the whole existing function, from

    function reportHTML(){

down to and including its closing

    return h+`</div></div>`;
    }

Keep `tfOptions()` and `TF_MAX_MONTHS` directly above it — both are still
called. `PRIORITY_GROUPS` becomes dead; remove it. Paste `patch.js` in.

## 3. wiring.js
Anywhere after `const content=document.getElementById("content");`. It
registers its own listeners instead of editing yours, so none of your
existing handlers can regress.

## 4. editor-priority.js
Two marked edits to existing lines — one in `render()`, one in the change
listener. Adds the journey-priority control to the page editor.

## 5. Optional — the CSV button
In the top-bar injection IIFE, beside `btnExport`:

    const bCsv=mk("btnCsv","Export schedule (CSV)");
    top.appendChild(bCsv);
    bCsv.onclick=exportScheduleCSV;

---

## How priority now works

Priority is a **property of the page**, set in the template editor. A
divider sets the priority for its whole section; an individual page can
override it, so a Lifts page inside a late section is still path of travel.

`SECTION_PRI` is now only a fallback for dividers you haven't set yet. The
editor shows an amber "not set — falling back to …" hint so you can see
which dividers are still guessing.

Priority answers **where in the journey**, never **how bad**. Severity
already carries that on the other axis. A non-compliant adult change
facility therefore stays priority 3 and takes its weight from the Breach of
Code classification, which lands it in the breaches tile regardless.

## New fields (report view only)

Nothing changes on site. Three controls appear in the report, which is
where this writing actually happens.

| Control | Stored at |
|---|---|
| Position paragraph | `S["report\|position"]` |
| Effort select | `S[key+"\|diff"]` |
| Impact textarea | `S[key+"\|impact"]` |
| Action textarea | `S[key+"\|action"]` |

Same `key + "|suffix"` pattern as your existing `|n` and `|tf`, so
`saveA()` persists them with no migration and Reset audit clears them.

---

## What this patch does NOT do

**It cannot create dividers.** They are template content, not code. With
only ARRIVE and JOIN IN, the journey view has two rungs and earns little —
this is the highest-value remaining change and it is yours to make.

Suggested set, mapped to the pages in your template:

| Divider | Priority | Covers |
|---|---|---|
| ARRIVE | 1 | Car parking, Landscaping, Kerb ramps, External accessways, External ramps & stairs |
| ENTER | 1 | Principal pedestrian entrance, Additional entrances |
| MOVE AROUND | 1 | Internal accessways, Floor & ground surfaces, Internal ramps, Stairs, Lifts |
| JOIN IN | 2 | Reception & counters, Seating, Hearing augmentation, Kitchens & servery |
| AMENITIES | 3 | Accessible toilets, Ambulant cubicles, Showers & change, Adult change facilities |
| BE INFORMED | 4 | Signage, Wayfinding, Braille & tactile, Emergency information |
| LEAVE | 1 | Egress, Evacuation, Refuge areas |

`addJourneyDividers()` at the foot of `editor-priority.js` will insert them
for you. Edit its map to match your real page titles, run it with no
argument for a dry run, then `addJourneyDividers(true)` to commit. Export
template first as a backup.

**It does not add an egress section.** If your template has no LEAVE pages,
that is an audit content gap rather than a reporting one. Egress for people
with disability is the most consistently under-audited area in Australian
practice, because the Premises Standards largely stop at the door on the
way out. Worth closing regardless of this work.

## Known rough edges

- Findings with no effort set are treated as moderate for placement. The
  report states how many are outstanding rather than hiding them.
- `exportReport()` serialises `reportHTML()`, so the standalone export
  inherits all of this — but the textareas export as editable fields. To
  flatten them, swap `rfField()` for a read-only `<div>` behind an
  `EXPORTING` flag.
- The journey lists sections in template order, which is correct only if
  your pages are ordered the way a visitor moves.
