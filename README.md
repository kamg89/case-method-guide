# A guide to the case method

A standalone guide to studying cases and preparing for case discussion, for MBA and EMBA students. Learners make an investment recommendation for Warby Parker, examine evidence, respond to an objection, experience an authored discussion, and finish with a debrief and reflection. No later class activity is required.

- [Open the exercise](https://kamg89.github.io/case-method-guide/)
- [Try the demonstration](https://kamg89.github.io/case-method-guide/#demo)
- [Instructor sign-in](https://kamg89.github.io/case-method-guide/#instructor/login)
- [Operating guide](docs/OPERATIONS.md)
- [Sources and instructional assumptions](docs/SOURCES.md)
- [Verification and timing](docs/VERIFICATION.md)

The eight stages are divided into short pages. Responses save automatically. A roster-linked access code resumes work on another device. Required checkpoints, reflection, and AI disclosure determine completion; no automated grade or instructor approval is needed. AI assistance is allowed with disclosure.

The public repository contains code and original instructional material. Student records and credential hashes live in a separate Supabase project. Private access codes, exports, source attachments, and local configuration are excluded from the repository. The demonstration stores synthetic work only in the browser.

## Run locally

Node 24 and npm are required.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:4173/case-method-guide/`. Without a backend URL, the demonstration remains available. For live sign-in, set `VITE_API_URL` to the dedicated Edge Function URL in the operating guide. This URL is public configuration, not a secret.

```sh
npm test
npm run build
```

GitHub Actions runs the tests and production build before deploying `dist/` to GitHub Pages. Backend changes are deployed separately, with a project identity guard. Never put a Supabase service key in a `VITE_` variable.

## Structure

- `src/`: React interface, authored case, page sequence, saving and instructor controls.
- `shared/lesson.ts`: lesson version, requirements and validation shared with the backend.
- `supabase/`: project lock, scoped SQL migration and Edge Function.
- `tests/`: validation, real Postgres behavior through PGlite, API authorization and deployment isolation.
- `scripts/test-api.mjs`: opt-in live checks using disposable synthetic records.

Designed for about 42 minutes. Actual learner timing remains unvalidated until piloted. This is an independent instructional exercise, with no affiliation with Harvard or Warby Parker. Fonts are distributed under their licenses in `public/licenses/`.
