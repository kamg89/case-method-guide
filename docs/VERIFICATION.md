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

The authoring budget is 3 + 8 + 5 + 7 + 8 + 4 + 6 + 4 = **45 minutes**. A structured pacing review assigns time to reading, calculations, written responses, comparisons and reflection. There is no countdown or minimum time gate. The short pages do not add work beyond the eight stages.

The mechanical browser walkthrough verifies function, not learner thinking speed. **Actual learner timing is unvalidated until piloted.** Pilot with MBA and EMBA learners, record elapsed/visible estimates alongside participant feedback, and revise the text or prompts if typical completion falls outside 30–45 minutes. Do not represent the suggested duration as a measured student result.

## Practical limits

Credential possession is not identity verification. Client activity is an estimate and may be incomplete or manipulated. The app cannot prove attention or identify AI authorship. Autosave protects responses only after local storage or server acknowledgment; clearing browser storage can erase unsynced drafts. Another device resumes server-saved responses at stage level. Provider outages, free-tier pausing and quotas can interrupt live sign-in and saving. Written reasoning is not automatically graded.

## Lesson revision 2

The landing page now names the case method explicitly and contains only a definition, purpose and start action, with quiet utility links. The case preview and marketing sections were removed. The lesson adds an opening contribution, more plausible alternatives with choice-specific feedback, more demanding evidence/criteria prompts, and a discussion-preparation checklist. Existing database records and schema are unchanged; a read-only check found no live attempts before the version change.

## Lesson revision 3

The lesson begins by defining a case, explaining what case learning does, and showing the route through the exercise. It asks no academic question in the introduction. Students read the complete seven-part narrative and exhibits before describing the decision maker, choice and stakes. They frame the decision before recording an initial position. The second-reading strategy check now appears in the closing review.

The case is a 949-word original narrative centered on Dave Gilboa. Its decision review is an explicitly labeled instructional construction. Each narrative page contains 131–142 words. Exhibit 3 presents competing proposals rather than supplying an analysis template. Page transition buttons name the next stage.

Regression checks verify this sequence and that the initial-position lock occurs after decision framing, in both the interface and server. The lesson version is `warby-2024-v3`. A read-only check found no live attempts before this revision. No SQL migration is needed.

Revision 3 verification passed: 36 automated tests, production build, a complete browser walkthrough, saved-page/response recovery after reload, and the live API suite with incremental stage responses. The live check confirms that students can enter their first position after reading and that the server rejects later changes to that preserved position. Synthetic test records were deleted. The revised opening was reviewed at desktop and 390 px widths.

## Concepts and prompt clarification, October 25, 2026

The introduction explains learning concepts, frameworks and theories through cases. A short theory page precedes comparison, and the existing written activities apply the resource-based view, an original comparison framework, and opportunity cost. Reflection and the reusable checklist explicitly transfer these ideas to other cases. The case narrative is unchanged.

Prompts distinguish writing a question from writing an explanation. Decision framing asks for one question and no proposed solution. The discussion reply explicitly ends with one question. Constraint, initial position, opening contribution and reflection instructions specify the required output and sequence.

This is a compatible instructional update within lesson version 3: response keys, validation, checkpoints and saved attempts remain unchanged. No database or backend deployment is required. The estimated duration is 45 minutes; learner timing still requires a pilot.

The updated sequence completed in a browser walkthrough. The question-writing and discussion-reply instructions were checked in context. Framework teaching and its application occupy separate short pages. The revised pages were reviewed at 1280 by 720 and 390 px width, and the production build passed. Existing automated checks still cover all response fields and checkpoints.

## Student preparation purpose, October 25, 2026

The title now identifies the audience and purpose: "A student's guide to preparing for the case method." The landing page, opening route, reading and analysis guidance, discussion preparation, debrief, reflection, and completion screen explain that students use this process for each assigned case before class. The downloadable checklist separates preparation from actions during and after discussion. The practice exercise still finishes in the app.

This copy and layout update preserves the case narrative, response keys, checkpoints, lesson version, and database. All 36 automated tests pass. The production build passes. The landing page was reviewed on desktop and at 390 px width with no horizontal overflow, and the completion guidance was checked with an existing synthetic demonstration.
