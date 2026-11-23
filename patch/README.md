# Report v2 — patch for access-audit.html

Three files. Apply in order. Nothing touches the capture flow, the `PHML`
array, or any stored answer, so existing audits keep working.

## 1. `styles.css` → paste at the END of the existing `<style>` block
Before the closing `</style>`. Adds the matrix, tiles, journey rail and
report-time field styles. Reuses your existing CSS variables.

## 2. `patch.js` → replaces `reportHTML()`
Delete the whole existing function, from the line

    function reportHTML(){

down to and including its closing

    return h+`</div></div>`;
    }

Leave `tfOptions()`, `TF_MAX_MONTHS` and `PRIORITY_GROUPS` directly above it
in place — `tfOptions` and `TF_MAX_MONTHS` are still used. `PRIORITY_GROUPS`
becomes dead and can go.

Paste the contents of `patch.js` in its place.

## 3. `wiring.js` → paste into the EVENTS section
Anywhere after `const content=document.getElementById("content");`. It
registers its own listeners instead of editing yours, so none of your
existing handlers can regress.

## 4. Optional — the CSV button
In the top-bar injection IIFE, beside `btnExport`:

    const bCsv=mk("btnCsv","Export schedule (CSV)");
    top.appendChild(bCsv);
    bCsv.onclick=exportScheduleCSV;

---

## What changes for the auditor

Nothing on site. The question rows, the Pass/High/Medium/Low/Breach taps,
the camera, the notes are all untouched.

Three new controls appear **in the report view only**, which is the right
place for them: on site you tap and photograph, at the desk you write the
client-facing wording.

| Control | Stored at | Purpose |
|---|---|---|
| Position paragraph | `S["report\|position"]` | Replaces the percentage score |
| Effort select | `S[key+"\|diff"]` | The second axis of the matrix |
| Impact textarea | `S[key+"\|impact"]` | Who is excluded, and from what |
| Action textarea | `S[key+"\|action"]` | The works instruction |

Same `key + "|suffix"` pattern as your existing `|n` and `|tf`, so
`saveA()` persists them with no migration and `Reset audit` clears them.

## What you must tune

`SECTION_PRI` at the top of `patch.js` maps your divider page titles to a
journey priority 1–4 by regex. I seeded it from `ARRIVE` plus the usual
access-audit sections. Check it against your actual dividers — anything
unmatched defaults to priority 2, which is a safe but blunt placement.

A page title can override its section, so a `Lifts` page inside a late
section still scores priority 1.

## Known rough edges

- Findings with no effort set land in the "not yet set" column of the
  matrix logic (treated as moderate). The report tells the client how many
  are outstanding rather than hiding it.
- `exportReport()` still serialises `reportHTML()`, so the exported
  standalone HTML inherits all of this for free — but the textareas export
  as editable fields. If you want them flattened to plain text in the
  export, swap `rfField()` for a read-only `<div>` behind an `EXPORTING`
  flag.
- The journey view lists sections in template order. That is correct as
  long as your pages are ordered the way a visitor moves.
