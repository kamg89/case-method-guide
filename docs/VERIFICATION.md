# Verification and timing

Verified October 24, 2026. The automated checks and production build pass. The published instructor dashboard was also checked for roster display, private review saving, and export controls. Tests use synthetic learners; no real student records were imported.

## Checks

- Unit and Postgres-backed tests cover required responses, disclosure, malformed inputs, CSV quoting, atomic revision conflicts, checkpoint snapshots, timing deduplication, transactional imports, code/session rotation, browser-role denials, RLS, completed-attempt locks, reopening and deletion cascades.
- Handler tests exercise authentication, unauthorized origins, student/instructor separation, cross-instructor ownership, stage skipping, stale requests and submission validation against a real local Postgres engine through PGlite.
- Live API checks cover separate student records, completion, duplicates, timing, reviews, exports, reopening and revocation. The synthetic cohort is removed afterwards.
- Deployment tests reject a different project target. The Edge Function checks the dedicated project before creating its database client.
- Browser walkthrough covers all eight stages, factual and calculation feedback, keyboard-accessible native controls, saved responses, page navigation, case reference access, debrief, reflection and acknowledged completion. The original long stage screens were replaced with short pages and separate feedback screens. On the same browser, reload restores the short-page position.
- Phone-sized (390 px) and desktop layouts were visually reviewed. Headings receive focus after navigation; native fieldsets, labels, radio groups, selects, tables and a modal dialog provide accessible structure. No drag-only interaction is required. Measured contrast: maroon/white 9.79:1, primary text/warm white 13.56:1, secondary text/warm white 5.56:1. This is a manual accessibility review, not an independent screen-reader certification.
- The public bundle contains no privileged keys, private instructor/student codes, exports, handbook or screenshots.

## Duration

The authoring budget is 3 + 7 + 4 + 7 + 6 + 5 + 6 + 4 = **42 minutes**. A structured pacing review assigns time to reading, calculations, written responses, comparisons and reflection. There is no countdown or minimum time gate. The short pages do not add work beyond the eight stages.

The mechanical browser walkthrough verifies function, not learner thinking speed. **Actual learner timing is unvalidated until piloted.** Pilot with MBA and EMBA learners, record elapsed/visible estimates alongside participant feedback, and revise the text or prompts if typical completion falls outside 30–45 minutes. Do not represent the suggested duration as a measured student result.

## Practical limits

Credential possession is not identity verification. Client activity is an estimate and may be incomplete or manipulated. The app cannot prove attention or identify AI authorship. Autosave protects responses only after local storage or server acknowledgment; clearing browser storage can erase unsynced drafts. Another device resumes server-saved responses at stage level. Provider outages, free-tier pausing and quotas can interrupt live sign-in and saving. Written reasoning is not automatically graded.

## Lesson revision 2

The landing page now names the case method explicitly and contains only a definition, purpose and start action, with quiet utility links. The case preview and marketing sections were removed. The lesson adds an opening contribution, more plausible alternatives with choice-specific feedback, more demanding evidence/criteria prompts, and a discussion-preparation checklist. Existing database records and schema are unchanged; a read-only check found no live attempts before the version change.
