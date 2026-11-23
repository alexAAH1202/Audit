# Scoping step — DRAFT for confirmation

Status: **draft, not in the tool.** Nothing here has been built. It uses the six questions
from the design brief (Phase 3, "A scoping step before the audit starts"):
building class, storeys, lift, parking, sanitary facilities, public or staff-only.

## The finding that changes the brief's promise

The brief says a scoping step on a single-storey building with no lift "removes several pages".
**This template cannot deliver that**, because it has no lift page and no internal stairs page.
Lifts appear only as single questions inside other pages (for example Internal Accessways,
Hearing Augmentation, Exits & Egress Routes). Skipping a page needs a page to skip.

What the six answers can honestly skip, measured against the current 35-page template
(499 questions across the 22 assessed pages):

| Building profile | Pages skipped | Questions skipped |
| --- | --- | --- |
| Single-storey, no lift, no on-site parking, **has** sanitary facilities | 3 (Car Parking, Refuge, one toilet page if the build date is known) | 85 to 100 |
| Same, **no** sanitary facilities | 6 (adds the other toilet pages and Adult Change) | about 185 (37%) |
| Multi-storey, parking, sanitary facilities, public | 0 or 1 | 0 to 70 |

So the brief's acceptance line, "a single-storey building with no lift and no parking skips at
least four pages", **fails for a building that has toilets**. I recommend changing it
(see open question 5) rather than inventing page skips the content doesn't support.

## The six questions

The answers would be saved with the audit like any other, appear on a new **Site Scope** page right
after the Title Page, and be listed in the report's scope section.

| # | Question | Options | What it does |
| --- | --- | --- | --- |
| 1 | Building class (NCC) | Class 1b, 2, 3, 5, 6, 7a, 7b, 8, 9a, 9b, 9c, 10, mixed, not sure | **Recorded only. Skips nothing.** I could not confirm which classes exempt which pages, so I did not guess. |
| 2 | How many storeys does the public use, counting basements? | 1 / 2 / 3 or more | Skips **Refuge & Assisted Evacuation** when 1. |
| 3 | Is a passenger lift provided for the public? | Yes / No | **Skips no page** (see above). Recorded; reserved for question-level skipping, which needs the per-question "not applicable" feature from the brief. |
| 4 | Is on-site car parking provided for the building? | Yes / No (street parking only counts as No) | Skips **Accessible Car Parking** when No. |
| 5 | Are sanitary facilities provided for the public? | Yes / No / Shared facilities outside the audited area | Skips all four toilet pages when No or Shared. When Yes, see 5a. |
| 5a | **My addition, say if you want it removed.** When were they built or last refurbished? | Before 1 May 2011 / On or after 1 May 2011 / Both / Unknown | Skips the other vintage's toilet page. Both or Unknown keeps both. |
| 6 | Who uses the building? | Public / Staff only / Both | Skips **Customer Service Areas** when Staff only. |

## Proposed rules

| Page | Questions | Skipped when |
| --- | --- | --- |
| Accessible Car Parking | 23 | parking = No |
| Accessible Toilets — Prior 1 May 2011 | 55 | sanitary = No or Shared, or built = On or after 1 May 2011 |
| Accessible Toilets — On/After 1 May 2011 | 70 | sanitary = No or Shared, or built = Before 1 May 2011 |
| Ambulant Toilets | 20 | sanitary = No or Shared |
| Accessible Adult Change Facilities | 10 | sanitary = No or Shared |
| Refuge & Assisted Evacuation | 7 | storeys = 1 |
| Customer Service Areas | 14 | use = Staff only |

Pages I deliberately did **not** tie to any answer, because a wrong skip loses a required check:
Hearing Augmentation, Meeting Spaces, Kitchen / Dining, Signage, Entrances, and every external page.
For a staff-only building the Premises Standards position on hearing augmentation and
meeting spaces is not something I could confirm.

## How a skipped page behaves

- **It stays in the navigation**, greyed, labelled "Not applicable" with the reason, for example
  "No on-site parking". It is not hidden, so the auditor can see what was left out.
- **Its page opens with a banner**: "Skipped by Site Scope: no on-site parking. Change the answer
  to include it, or assess it anyway." An **Assess anyway** button restores it for that page only.
  This is the safety valve for a wrong answer.
- **A page that already has answers is never hidden.** If you answer questions and then change
  the scope, the page stays and shows a warning.
- **Progress, score and "answered %" exclude skipped pages**, so a finished audit reads 100%, not 63%.
- **The report separates two things that are currently mixed up:**
  - *Not applicable by scope*, listed with the reason and the answer that caused it.
  - *No items recorded*, which means a gap in the audit. This is the existing list.
  Skipped pages leave the coverage denominator.
- **The scope answers print in the report's scope section**, so a client can see on what basis
  six pages were left out.

## Risks

- **A wrong answer silently drops required checks.** Mitigations above: the greyed navigation
  entry, the banner, **Assess anyway**, and the report listing every skip with its reason.
- **Renamed pages lose their rule.** Rules would be keyed by page title in code, so that saved
  templates need no migration and no question or page id changes. If a page is renamed, its rule
  stops applying and the page simply stays in.
- **Existing audits are unaffected.** With no scope answers recorded, nothing is skipped.

## Open questions for you

1. **Class.** Does any building class change which pages apply? If so, which?
2. **Storeys.** Is the Refuge page really not applicable on a single storey? A single-storey
   building with a raised floor, mezzanine or basement is a risk. I wrote the question to count basements.
3. **Staff only.** Which pages besides Customer Service Areas should it skip, if any?
4. **Question 5a.** Keep the build-date follow-up? It saves one 55–70 question toilet page.
5. **Acceptance criterion.** Replace "skips at least four pages" with a measure the content
   supports, for example "skips at least 100 questions for a single-storey building with no
   parking and a known toilet vintage", or add pages the template currently lacks (a lifts page
   and an internal stairs page), which would also help on multi-storey buildings.
6. **Lift = No.** About nine lift questions are spread across other pages. Do you want them
   switched off individually once per-question "not applicable" exists?
7. **Shared facilities.** Is "Shared facilities outside the audited area" the right way to
   treat a tenancy that relies on a landlord's toilets?

## Implementation note (for when this is approved)

- A new template item kind for a single choice (`pick`), stored as a text code such as `"no"`
  rather than an array index, in line with the data-model section of the brief. Stored under the
  same `key + "|suffix"` pattern, so it is covered by save, backup, restore and reset.
- The **Site Scope** page is appended at the end of `PAGES` and moved into place in
  `seedDefault()`, as Signage and LEAVE were, so no existing id changes. Saved templates get the
  same one-off "add" step with fresh ids.
- The rules table lives in code, keyed by page title.
- The change touches the navigation, the progress and score calculations, and the report's
  coverage table, so it needs its own verification pass.
