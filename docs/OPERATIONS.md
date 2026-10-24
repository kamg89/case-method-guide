# Operating guide

## Give students access

1. Open the [instructor workspace](https://kamg89.github.io/case-method-guide/#instructor/login). Your private code is in the local `.private/Instructor access.txt` file delivered with this project. It is not in GitHub.
2. Create a cohort. A deadline is optional and informational; it does not impose a timer or lock out late work.
3. Expand **Add students and manage access**. Import a CSV with exactly the headers `student_id,display_name`. Email addresses are unnecessary. Import up to 200 rows at a time, with a maximum of 500 students per cohort. IDs must be unique within that cohort. An invalid or duplicate import rolls back as a whole.
4. Download the generated access-code CSV immediately. Codes are shown only once. Give each student only their own code and the [student address](https://kamg89.github.io/case-method-guide/#login), using your learning platform or another private channel. Do not post the full code sheet.
5. Ask students to finish all eight stages, the reflection and the AI disclosure. They receive their debrief and learning summary inside the app. Instructor review is optional.

Example roster (synthetic):

```csv
student_id,display_name
sample-01,Sample Student One
sample-02,Sample Student Two
```

## Review, export and reopen

The roster shows not started, in progress, completed, and reviewed states. Open a student record to see responses, initial/final choices, confidence, stage activity, checkpoint snapshots, feedback/reference activity, and AI disclosure. Instructor notes stay private.

**Export CSV summary** provides completion, timing, choices, confidence and disclosure status. **Export full records** provides JSON with responses, snapshots, events, review notes and timing totals by stage. Both contain student information. Store them privately and keep them out of this repository. CSV text is escaped to limit spreadsheet formula injection.

**Reopen submission** allows editing while retaining earlier checkpoint snapshots. A first judgment remains preserved after its initial checkpoint; later recommendation fields capture reconsideration. Students must submit again. Review flags reset when reopened.

## Access recovery and sessions

Student and instructor codes contain 192 bits of randomness. Only SHA-256 hashes are stored in the database. Sign-in exchanges a code for an expiring session; sessions expire after seven days. The browser keeps the session in session storage and does not put credentials in URLs. Anyone holding a code can use its access: the code identifies a roster entry, not a verified person.

For a lost student code, open the record and select **Replace access code**. This revokes old codes and sessions without deleting work. Download the replacement. **Revoke access** blocks further use but retains work.

If the instructor code is lost, use the private local copy first. If it must be replaced, an authorized database administrator must generate a new random code and update the hash on the **existing instructor credential row**. Preserve its ID because cohorts belong to that row. Revoke/delete sessions for that exact credential. Do not create an unrelated instructor row or run a bulk update. Share the new code privately. Never save plaintext credentials in SQL migration files, GitHub issues, Actions variables, or public logs.

## Saving and interrupted connections

Each edit autosaves after a brief pause. Unsynced responses are kept in local storage under that attempt ID, retried periodically and when connectivity returns. Keep the tab open until the status says **All changes saved**. Reload recovers unsynced responses on the same browser. Another device sees only server-saved work. Page position is saved locally; another device resumes at the saved stage and may need to move through its short pages.

A revision number prevents silent overwrites from concurrent tabs or devices. When newer server work exists, the app shows a comparison and offers a local draft download. Choose which responses to keep. If the server already completed the submission, the completed version takes precedence; download any draft you want to retain first.

Completion appears only after server acknowledgment. A lost connection cannot create a false completion screen. Closing or clearing the browser before a failed save syncs can lose the local draft. Activity telemetry is best effort and is not queued indefinitely; missing intervals are not fabricated.

## Time and participation records

Elapsed time spans the first attempt creation through the latest save or submission, including breaks. Visible time estimates foreground intervals. Estimated active time also requires an interaction within two minutes. Quiet reading may be undercounted. Background periods are excluded from visible/active estimates.

The database keeps one record per attempt and 15-second wall-clock bucket, taking the greatest received duration rather than adding overlapping tabs. Partial, disjoint intervals in one bucket can be undercounted. The first stage recorded in a bucket receives its attribution. Client clocks and events are not proof of attention. A shared access code can distort records. Nothing here identifies AI authorship. Use the actual reasoning and disclosure for a human participation review.

## Deletion and retention

Records remain until the instructor deletes the cohort. Export records you need first. In **Cohort settings**, deletion requires the exact cohort name. The backend verifies instructor ownership and deletes that specific cohort ID; foreign keys remove only its roster, student credentials/sessions, attempts, revisions, events, timing and reviews. Other cohorts and instructor credentials remain. There is no in-app undo. Local drafts and previously downloaded exports are separate copies and must be handled separately.

Provider operational logs follow the providers' policies. The application does not collect webcam recordings, browsing history, raw keystrokes or IP addresses as student records. The login limiter stores a hash derived from the request IP; provider infrastructure may log IPs.

## Database isolation and deployment guardrails

| Item | Dedicated target |
|---|---|
| Organization | Kamfree, Free plan |
| Project | Case Method Guide |
| Project reference | `apyakpyzoealaxbvhqnn` |
| Region | `us-east-1` |
| Browser API | `https://apyakpyzoealaxbvhqnn.supabase.co/functions/v1/case-guide` |
| Application tables/functions | `public.cg_*` |

This is a separate database and service role from every other app. No existing course files or other projects' tables were used. The original migration creates only explicitly named `cg_` objects; its grants/revokes target those objects. It contains no schema drop, truncate, reset, wildcard table mutation, or organization-level operation.

All ten application tables have RLS enabled, with no browser access policies and no grants to `anon` or `authenticated`. Supabase's informational **RLS Enabled No Policy** notice is intentional: only the authenticated Edge Function uses the server-only service role. Every student operation derives the learner/attempt from its session, and every instructor operation checks cohort ownership. No client-supplied learner ID determines student data access. Privileged functions are inaccessible to browser roles. Inputs are validated, saves use atomic revision checks, and duplicate event IDs are ignored.

The Edge Function checks `SUPABASE_URL` against the dedicated project before creating a database client. Accidentally deploying it to another project fails closed. `scripts/deploy-backend.mjs` also checks the pinned project and refuses conflicting environment or CLI-link targets. It accepts no arbitrary arguments and can only deploy the `case-guide` function. It cannot reset a database or pause/delete a project.

```sh
node scripts/deploy-backend.mjs --check
node scripts/deploy-backend.mjs
```

Supabase CLI authentication is required. Custom code/session authentication is why Supabase JWT verification is disabled for this one function. This does not make application operations anonymous; only `health`, `login`, and CORS preflight are public.

For future SQL changes: inspect the project name and reference, review a new additive migration, test against local PGlite or a disposable database, and apply it only to `apyakpyzoealaxbvhqnn`. Do not use `supabase db reset`, an unverified `--linked` target, or credentials from another app. Do not reapply the already-installed initial migration. Schema migrations are not run by GitHub Actions. Existing migrations are immutable.

The frontend's GitHub Actions variable `VITE_API_URL` is the public endpoint above. Frontend deployment needs no database/service-role secret. A push to `main` tests, builds and publishes GitHub Pages. A failed build does not replace the existing site. Review pending lesson attempts before changing `LESSON_VERSION`: old attempts are blocked from saving to a new version. Preserve the old implementation or provide a deliberate migration; do not silently reinterpret old responses.

## Free service availability and Sidecar

The dedicated project was created on October 24, 2026 after a fresh quote of **$0 per month**. No paid add-ons or database branches were enabled. GitHub Pages serves this public repository under GitHub Free's public-repository offering. Quotas and product terms can change; review dashboards before a large cohort. [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

As authorized, **Sidecar Classroom was paused** to free the project slot. Its database-backed features remain unavailable while paused. Its tables were not changed or deleted. Restoring it may require freeing another project slot or changing the plan; do not pause this app while students are working without planning for the outage.

Supabase Free projects with low activity over a seven-day period may be paused. Current documentation allows restoring a paused project for up to **one year after pausing**. Resume from its dashboard within that window; do not treat pausing as indefinite archival storage. Export important records and check service availability before assignment. The public site and local demonstration may load while the backend is paused, but sign-in and server saves will be unavailable. No paid upgrade or artificial keep-alive automation has been configured. [Supabase project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)

For support, check Edge Function logs, migration history and the project's security/performance advisors. The public health operation verifies function availability but does not prove database readiness; a synthetic student login/save is a stronger pre-assignment check.
