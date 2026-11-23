# Review with the access consultant

Every place a **best-practice default** was used instead of a confirmed decision. Nothing here is
locked: each item can be changed in the template editor or in code. In the tool, the **Review list**
button (top bar, under **More** on a phone) shows the same list with tick boxes and a count of what is
still open, and orange **Needs review** tags mark questions whose clause is still "TBC".

This file mirrors `REVIEW_ITEMS` in `access-audit.html`. If you add a default, add it in both places.


## LEAVE section

- [ ] **Questions whose clause is still "TBC"** (`leave-tbc`)  
  AS 1670.1 visual alarms, AS 3745 emergency plans and PEEPs, ABCB lift-evacuation guidance and the refuge items have no confirmed clause. The text 'clause TBC' prints in the report until each is resolved.
- [ ] **Refuge space of 800 x 1300mm** (`leave-refuge-size`)  
  A placeholder figure, not confirmed. Give the dimension actually applied, or delete the number.
- [ ] **Legislative or Best Practice placement** (`leave-groups`)  
  Doubtful: the 20N door opening force (fire doors often exceed it) and the WHS written emergency plan (workplaces only). Most of the section is best practice, so Breach of Code should rarely apply.
- [ ] **Journey priority of Emergency Information & Alarms** (`leave-pri`)  
  Set to 4 (information). A missing visual alarm could arguably block leaving, which would make it 1.

## Site Scope

- [ ] **Building class only records, skips nothing** (`scope-class`)  
  NCC D4D2 sets the extent of access by class, but the pages are organised by element, so no page is skipped by class. Confirm, or say which classes drop which pages.
- [ ] **One storey skips Refuge & Assisted Evacuation** (`scope-storeys`)  
  The question counts basements. Mezzanines and raised floors are a risk. NCC D4D4 also lets a small building of up to 3 storeys leave upper levels without a lift.
- [ ] **Lift answer only records** (`scope-lift`)  
  The template has no lift page. About nine lift questions on other pages are not switched off. Needs per-question not-applicable.
- [ ] **No parking, or attended-only, skips Accessible Car Parking** (`scope-parking`)  
  Attended-only follows D4D6 (parking service, no public access to spaces). Confirm.
- [ ] **No sanitary facilities, or shared, skips four pages** (`scope-sanitary`)  
  Shared facilities outside the audited area is treated as No. Confirm that is right for a tenancy using a landlord's toilets.
- [ ] **Build-date follow-up skips the other 2011 toilet page** (`scope-built`)  
  My addition to the six questions. Remove it if unwanted.
- [ ] **Staff only skips nothing** (`scope-staff`)  
  NCC D4D2(6) covers employees as occupants, so no automatic skip. Confirm whether any page should be left out.
- [ ] **Acceptance criterion** (`scope-accept`)  
  The brief says a single-storey building with no lift and no parking skips four pages. With toilets, the template skips three. Restate it or add lift and stairs pages.

## Report

- [ ] **'How to read the ratings' wording** (`report-ratings`)  
  Written from project terminology, not by the consultant. Confirm each definition.
- [ ] **No standard disclaimer or liability wording** (`report-liability`)  
  Only the template's own Disclaimer field appears. Decide whether standard wording is wanted, with your insurer.
- [ ] **Timeframes: Do first, Programme, Plan, Monitor** (`report-zones`)  
  The mapping from journey priority and effort to timeframe comes from the original patch. Confirm the meaning of each timeframe.

## Capture

- [ ] **Sweep to Pass only on Legislative groups** (`capture-sweep`)  
  The brief names Legislative groups only. Decide whether Best Practice groups should have it too.

## What is marked in the tool

| Where | Marker |
| --- | --- |
| Top bar | **Review list (N)**, N = items still unticked |
| Site Scope page | orange **DRAFT RULES** bar |
| A page left out by a scope rule | orange **Draft rule** tag in its banner |
| A question with a "TBC" clause | orange **Needs review** tag beside the clause |
| Report view | orange **Draft content** box, with the findings that cite a "TBC" clause |

The report view box, and every tag, is **not printed and not exported**. The text "clause TBC" itself
*does* print in the clause line under a finding, so resolve those before a report goes to a client.
