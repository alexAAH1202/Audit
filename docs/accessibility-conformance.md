# Accessibility conformance report — Access Audit Tool

Date: 2026-11-23. Target: **WCAG 2.2 level AA**. Subject: `access-audit.html` (commit after this report)
and the standalone report it exports.

This is an honest self-assessment. **It is not a claim of full conformance**, because the most
important test, a real screen reader and a real keyboard-only run by a disabled auditor, has not
been done. What was done is listed below, with what failed and what is still open.

## How it was tested

| Method | Scope |
| --- | --- |
| Automated: axe-core 4.10.2, rule sets WCAG 2.0/2.1/2.2 A and AA plus best practice | 10 screens: audit page (desktop and phone), Site Scope, report, template editor, drawer open, More menu open, reset dialog, review dialog, Title Page. Also the exported report at 1280px and 390px. |
| Scripted keyboard run | Every Tab stop on a 188-control page: focus indicator present, focus not scrolled out of view |
| Scripted reflow | 320px wide (equivalent to 400% zoom at 1280px) on six screens |
| Scripted text-spacing test | WCAG 1.4.12 values applied: no clipped controls |
| Contrast calculation | Every colour pair the tool uses, calculated |
| Touch-target measurement | All controls on a phone-width page |

## What failed and was fixed

| Criterion | Finding | Fix |
| --- | --- | --- |
| 1.3.1 / 4.1.2 Info and Relationships, Name Role Value | Priority options had no state exposed (done earlier) | Radio groups with `aria-checked`, roving tab index, arrow keys |
| 1.3.1, 3.3.2 Labels | Text, date and signature fields and the per-question Comment box had a visible label that was not connected to the field. Additional-item text boxes had only a placeholder. | Labels now tied to their fields; additional-item boxes named |
| 4.1.2 | About 40 template-editor controls (selects, titles, clause boxes) had no accessible name | Each is named by its purpose |
| 1.4.3 Contrast | Empty matrix cells: grey on grey at 2.4:1 | Darkened to 5.9:1 |
| 1.4.11 Non-text contrast | Text-box borders were 1.4:1 against the page | Darkened to 4.0:1 |
| 2.5.8 Target size (minimum) | Template-editor checkboxes were 13px | Now 24px |
| 2.4.1 Bypass blocks | No skip link | "Skip to the audit" skip link, first Tab stop |
| 2.4.3 / 2.4.7 Focus | On a phone the closed navigation drawer was off screen but its links were still in the Tab order, so focus could land on invisible controls | The closed drawer is now inert |
| 2.4.11 Focus not obscured | The floating "Next unanswered" button could sit on top of the answer options | It is now a bar under the questions, not a floating button |
| 1.3.1 Headings | The only level-one heading was in the sidebar, and card headings skipped a level | Page title is the level-one heading; card headings are level two; sub-headings level three |
| 1.4.10 Reflow | The report's priority matrix and works schedule needed horizontal scrolling at 320px | Matrix shrinks to fit; the schedule stacks into cards on a narrow screen |
| 1.3.1 | The matrix's corner header cell was empty | Named "Journey priority" |
| Landmarks | The exported report had no main landmark | Wrapped in `main`, with the toolbar as a header |
| Navigation | The current page was shown by colour only | `aria-current="page"` added; the nav also has a name |
| Product standard | The brief says 44px tap targets, but the main answer buttons were 29px tall | 44px minimum on screens up to 820px wide |

Final automated result: **0 violations** on all 10 screens and on the export at both widths.

## Already in place and re-checked

Visible focus indicators (0 of 188 stops without one), `prefers-reduced-motion` respected (drawer
transition is 0s), status messages announced (`role="status"` on notices, sweep and scope messages),
page language and title set, no keyboard traps, no dragging gestures, text spacing survives,
colour is never the only cue for a finding (every badge carries text).

## Known gaps and open items

1. **No screen reader testing.** Nothing here was checked with VoiceOver, TalkBack or NVDA.
   Axe cannot judge whether announcements make sense. This is the main gap.
2. **No test with a switch device or voice control.**
3. **Contrast items axe could not decide ("needs review").** Three are the dashed-border note boxes
   partly overlapped by neighbouring elements, and one is the dismiss button's "✕" symbol, which
   has an accessible name. The colour pairs themselves were calculated separately and pass.
4. **Target size: 44px is not met everywhere.** On a phone, 5 checkboxes (the relevant-standards
   list) are 24px, which meets the AA minimum but not the 44px standard the brief sets.
   Note boxes are 52px or taller. Desktop answer buttons are 29px, which meets AA.
5. **Selected answer is shown by fill, border colour and bold text.** The border is a 1px line.
   This passes the non-text contrast rule but is a subtle cue; a tick mark would be stronger and
   was not added because it would wrap on narrow screens.
6. **Clearing an answer by tapping it again** is not announced by screen readers as a radio behaviour.
7. **Heading levels use `aria-level`** on card and sub-headings so the visual styling stays the same.
   Valid, but a plainer fix would be changing the tag names.
8. **Exported report editing** uses `contenteditable`, which assistive technology handles unevenly.
9. **The report's findings list** is a sequence of cards, not a list element.
10. **Print and PDF accessibility** (tagged PDF, reading order) was not assessed.

## Suggested next step

A 30-minute session with VoiceOver on a phone and NVDA on a desktop, walking one page, the Site
Scope, the report and the export, would test what the automated tools cannot. Findings from it
should be added here, including any that do not conform.
