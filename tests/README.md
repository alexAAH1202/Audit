# Regression tests

Developer-only tests for `access-audit.html`. **The tool itself still needs no install and no build**; nothing here
is loaded by it, and you can ignore this folder to use or ship the tool.

Each suite opens the real page in headless Chromium, drives it like a person would (tapping, typing, keyboard,
reload, backup and restore, print to PDF), and prints what it saw. The runner compares that output with a saved
**snapshot** and also fails on any uncaught page error.

## Running

```bash
cd tests
npm install                 # once: playwright and axe-core (only for the tests)
npx playwright install chromium   # once, if you have no Chromium yet
node run.js                 # all 29 suites, about 1.5 minutes
node run.js --only search   # suites whose name contains "search"
node run.js --update        # accept the current output as the new snapshots
```

`npm test` and `npm run test:update` do the same. To test a different copy of the app, pass its path:
`node run.js ../some-other/access-audit.html`.

If Playwright and axe-core are installed globally instead, the runner finds them; no `npm install` is needed.

## Reading a result

| Result | Meaning |
| --- | --- |
| `PASS` | No page error and the output matches the snapshot |
| `FAIL ... output differs` | Behaviour changed. Compare `tests/.out/<suite>.actual.txt` with `tests/expected/<suite>.txt`. If the change is intended (new question, new wording), run `--update` and commit the new snapshot. If not, it is a regression. |
| `FAIL ... the page raised an error` | The page threw an exception during the run |
| `SKIP` | A fixture build could not be read from git history (see below) |

A snapshot is a record of what a person would have seen, so **read the diff before updating it**. Updating without
reading turns the test into a rubber stamp.

## What is covered

| Area | Suites |
| --- | --- |
| Answering | `radio-groups`, `sweep-to-pass`, `not-applicable`, `comment-toggle`, `comment-box-size`, `best-practice-groups`, `repeated-elements` |
| Moving around | `next-unanswered`, `resume`, `search`, `top-bar`, `keyboard-focus` |
| Template and scope | `leave-and-saved-templates`, `journey-dividers`, `add-site-scope`, `site-scope`, `scope-section` |
| Data safety | `backup-restore`, `answer-codes-migration`, `save-failure-and-reset`, `photo-integrity`, `persistence-notices` |
| Report | `print-and-export`, `photo-plates`, `csv-export`, `export-flattening`, `scope-section` |
| Accessibility | `accessibility-axe` (10 screens), `export-axe`, `accessibility-manual` (reflow at 320px, text spacing, tap targets, structure) |

## Fixtures come from git history

Three suites simulate data saved by an **older build** (a template from before LEAVE existed, an audit stored with
answer positions instead of codes). The runner extracts those builds with `git show`:

| File | Commit | Used for |
| --- | --- | --- |
| `before.html` | `cdd979c` | a saved template with no LEAVE, journey or Site Scope pages |
| `before2.html` | `eea8eaa` | a saved template with LEAVE but without the new dividers |
| `legacy.html` | `ed21fc6` | an audit saved before answers became text codes |

Keep those commits in the repository (do not squash or rewrite history). If one is missing, the suites that need it
are skipped and say so.

## Limits

- These check the page in Chromium only. Safari, Firefox and a real phone are not covered.
- Print header, footer and page numbers need Chrome or Edge, and the PDF is produced by Chromium.
- Axe finds about a third of accessibility problems. It cannot say whether a screen reader announces something
  sensibly. See `docs/accessibility-conformance.md`.
- Snapshots contain counts (for example the number of questions). Editing the template changes them; that is
  expected, review and update.
- Suites share no state, but they do run one after another against a fresh browser each time, so a failure in one is
  unlikely to cause another.
