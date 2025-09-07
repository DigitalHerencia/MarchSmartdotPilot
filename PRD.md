# 🎺 Marching Band Progressive Web App – PRD

## 1. Product Overview

This PWA enables marching band members to learn, practice, and perform shows with precision. The app uses GPS for exact positioning, overlays routes on a football field grid, and provides tools for tempo, steps, and music synchronization. The experience is designed to feel purpose-built for marching bands, eliminating friction and focusing on what performers actually need on the field.

---

## 2. Goals & Objectives

* **Accurate GPS visualization**: Transform physical field coordinates into precise dot charts and live positional feedback.
* **Practice optimization**: Provide tools for learning shows efficiently (step counts, coordinates, tempo guidance).
* **Performance assistance**: Deliver visual/audio cues for real-time correction and confidence during live performance.
* **UX built for marching band culture**: Clean, minimal, and tradition-aligned design that resonates with users.
* **Offline-first reliability**: Works without network access during practice or performance.

---

## 3. Core Features

| Domain | Feature | Functionality | Implementation Details |
|---|---|---|---|
| GPS | Worker‑based tracking | 2 Hz updates with optional Kalman smoothing, exposes accuracy metrics | useGpsTracker spawns a Web Worker to throttle geolocation and smooth output, publishing accuracy stats to a shared store |
| Field | Calibration & math | Solves affine transform from geo points → field coordinates; applies transform & RMS error | Utilities compute least‑squares transform and apply it for on‑field positioning |
| Routes | CRUD & offline sync | Zod‑validated route schema, server actions backed by Prisma or in‑memory store; offline queue syncs on reconnect | Server actions gate on Clerk auth and use Prisma when DATABASE_URL is present<br>IndexedDB queue drains once online via client sync helper |
| Practice | HUD & music tools | Practice HUD computes distance/steps to target, MusicXML upload + phrase map, settings persisted via server action | Settings action enforces Clerk auth and writes preferences via Prisma |
| Performance | Visual cues | Canvas layer pulses yard lines in time with BPM; overlay for cue text | VisualCueLayer renders beat‑synced pulses using AudioContext timing |
| Auth | Clerk integration | Middleware protects routes; dynamic sign‑in/sign‑up pages | Global middleware applies Clerk, sign‑in/-up pages render Clerk components |
| Data | Neon/Prisma | PostgreSQL models for users, routes, waypoints, preferences | Prisma schema targets Postgres via DATABASE_URL environment variable, enabling Neon usage |

### 3.1 GPS Tracking & Field Grid

* High-precision GPS (down to \~1m) with configurable calibration (hash marks, sidelines).
* Field visualization with customizable yard lines, hash marks, and performance grids.

### 3.2 Route Management Tool

* Create, edit, and store marching routes using counts, coordinates, and step sizes.
* Import/export route data for directors and performers.
* Multi-step preview mode for show progression.

### 3.3 Practice Mode

* Step-by-step route playback with audio cues.
* Tempo/metronome integration with customizable BPM.
* Live “dot” tracking with error margin visualization.

### 3.4 Performance Mode

* Real-time position vs. target overlay.
* Visual tempo cues (pulsing lines, flashing beats).
* Sheet music overlay or cue cards.

### 3.5 Music Import & Analysis

* Upload PDFs or MusicXML files.
* Automatic parsing to generate counts, phrases, and cue points.
* Optional AI-assisted phrasing suggestions.

### 3.6 Personalization

* Save user preferences: step size, drill notation style, field dimensions.
* Switch between different shows, parts, or instruments.

---

## 4. User Stories

| Role       | User Story                                                                                                                      | Acceptance Criteria                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Performer  | As a marcher, I want to see my live position on a football field grid, so I can adjust my steps in real time.                   | GPS position updates every 0.5s, grid accuracy ±1m, position indicated as a dot. |
| Performer  | As a marcher, I want a practice mode that shows my path step-by-step with tempo, so I can rehearse drill without staff present. | Step preview with count numbers, metronome audio, next-step indicator.           |
| Performer  | As a marcher, I want performance mode cues (tempo flashes, position feedback) so I can stay in time during run-throughs.        | Visual pulse synced with BPM, real-time error indicators if off by >0.5 steps.   |
| Director   | As a director, I want to create and share marching routes, so I can distribute shows digitally.                                 | Route editor saves JSON data, shareable via QR code or link.                     |
| Director   | As a director, I want to import sheet music, so I can sync counts with drill formations.                                        | App parses measures and allows assigning counts to drill moves.                  |
| Power User | As a band member, I want to configure my step size and preferred drill style, so the visuals match how I march.                 | Persistent user settings stored locally and synced with account.                 |

---

## 5. Technical Requirements

### 5.1 Core Stack

* **Framework:** Next.js 15 (App Router + React 19)
* **Language:** TypeScript 5.8.3
* **Styling:** Tailwind CSS v4 (dark mode support with next-themes)
* **State Management:** Server Actions + Next.js cache + optional client store
* **Database:** Neon Postgres + Prisma ORM 6.11
* **Auth:** Clerk 6.22 (user preferences, team-based sharing)
* **Data Viz:** Recharts / Canvas rendering for field visualization
* **File Handling:** @vercel/blob + react-pdf + MusicXML parser
* **Deployment:** Vercel (PWA with offline caching, service worker)
* **Testing:** Vitest + Playwright for e2e

### 5.2 GPS & Real-Time

* Use **Geolocation API** (fallback to manual calibration if unavailable).
* Implement smoothing + Kalman filter to reduce GPS jitter.
* Real-time position update loop at 2Hz with Web Workers for background accuracy.

### 5.3 Performance

* Optimize bundle size (tree-shaking, RSC streaming).
* Use server components for static data, client components only for live updates.
* Cache route data with Next.js `unstable_cache`.

---

## 6. Codebase Architecture

```
/src
 ├─ app/
 │   ├─ (routes)/
 │   │   ├─ practice/
 │   │   ├─ performance/
 │   │   └─ routes/
 │   └─ layout.tsx
 │   └─ page.tsx
 ├─ features/
 │   ├─ gps/
 │   │   ├─ hooks/useGpsTracker.ts
 │   │   ├─ utils/kalmanFilter.ts
 │   │   └─ components/GpsDebugPanel.tsx
 │   ├─ field/
 │   │   ├─ components/FieldGrid.tsx
 │   │   └─ utils/fieldMath.ts
 │   ├─ routes/
 │   │   ├─ RouteEditor.tsx
 │   │   └─ RouteViewer.tsx
 │   ├─ practice/
 │   │   ├─ PracticeHUD.tsx
 │   │   └─ Metronome.tsx
 │   └─ performance/
 │       ├─ PerformanceHUD.tsx
 │       └─ VisualCueLayer.tsx
 ├─ lib/
 │   ├─ prisma/
 │   ├─ actions/
 │   ├─ fetchers/
 │   └─ music/
 │       └─ parseMusicXml.ts
 ├─ schemas/
 │   ├─ routeSchema.ts
 │   ├─ userPreferencesSchema.ts
 │   └─ musicSchema.ts
 └─ styles/
     └─ globals.css
```

---

## 7. Quality & Conventions

* **Type safety:** Strict TypeScript everywhere.
* **Code style:** ESLint + Prettier + Husky pre-commit hooks.
* **Testing:** 80%+ coverage on logic-heavy modules.
* **Accessibility:** WCAG 2.1 AA compliance (focus states, color contrast).
* **Responsive Design:** Tailwind container queries for mobile-first layouts.
* **PWA:** Installable, offline-first with service worker caching via Next PWA plugin.

---

## 8) Workflow Principles (GitFlow, but slim and automated)

* **Branches**

  * `main`: production; tags/releases come from here.
  * `develop`: integration branch for upcoming release.
  * Short-lived support branches:
    `feature/*`, `bugfix/*`, `chore/*`, `docs/*`, `refactor/*` (branch from `develop`)
    `release/*` (branch from `develop`; stabilization)
    `hotfix/*` (branch from `main` for urgent fixes)
* **Commits & PRs**

  * **Conventional Commits** for semantic versioning: `feat:`, `fix:`, `perf:`, `refactor:`, `docs:`, `test:`, `chore:`, `build:`, `ci:`.
  * Every branch opens a **Draft PR** immediately and links an Issue.
  * **Squash merge** to keep linear history; PR title = release note line.
* **Releases**

  * `develop` → `release/*` → QA → merge to `main` with a tag + GitHub Release.
  * `hotfix/*` merges into `main` and back-merges to `develop`.

---

## 9) Repository Scaffolding (drop into your repo)

```
.github/
  CODEOWNERS
  pull_request_template.md
  ISSUE_TEMPLATE/
    bug_report.yml
    feature_request.yml
    chore.yml
    design_doc.yml
  workflows/
    ci.yml
    e2e.yml
    preview-vercel.yml
    release.yml
    labeler.yml
    codeql.yml
    dependabot.yml
    project-automation.yml
    secret-scan-block.yml
    lockfile-lint.yml
.editorconfig
.commitlintrc.cjs
.changeset/config.json
.eslintrc.cjs
.prettierrc
.vscode/
  extensions.json
  settings.json
  tasks.json
  launch.json
.devcontainer/
  devcontainer.json
  Dockerfile
```

### CODEOWNERS

```txt
# Require reviews from domain owners
* @DigitalHerencia/owners

# Optional: code area ownership
/src/features/gps/    @DigitalHerencia/gps
/src/features/field/  @DigitalHerencia/field
/src/features/routes/ @DigitalHerencia/drill
```

### PR Template (`.github/pull_request_template.md`)

```md
## Summary
<!-- What and why -->

## Linked Issues
Fixes #ISSUE_ID or Closes #ISSUE_ID

## Type
- [ ] feat
- [ ] fix
- [ ] perf
- [ ] refactor
- [ ] chore
- [ ] docs
- [ ] ci/build
- [ ] test

## Risk & Rollback
- Risk level: Low/Med/High
- Rollback plan: Revert PR, disable feature flag `X`

## Screenshots / Demos
<!-- if UI change, attach GIF or link to Vercel preview -->

## Checklists
- [ ] Tests added/updated (unit/e2e)
- [ ] Types strict
- [ ] Accessibility
- [ ] Docs updated
```

### Issue Forms (YAML)

**Bug Report** (`.github/ISSUE_TEMPLATE/bug_report.yml`)

```yml
name: Bug Report
description: Report a problem
labels: ["bug"]
body:
  - type: input
    id: summary
    attributes: { label: Summary, placeholder: "Short description" }
    validations: { required: true }
  - type: textarea
    id: steps
    attributes: { label: Steps to Reproduce, placeholder: "1) ..., 2) ..." }
    validations: { required: true }
  - type: input
    id: expected
    attributes: { label: Expected Result }
  - type: input
    id: actual
    attributes: { label: Actual Result }
  - type: dropdown
    id: severity
    attributes:
      label: Severity
      options: ["blocker","critical","major","minor","trivial"]
    validations: { required: true }
  - type: textarea
    id: logs
    attributes: { label: Logs / Console / Screens, render: shell }
```

**Feature Request** (`feature_request.yml`)

```yml
name: Feature Request
description: Request a feature
labels: ["enhancement"]
body:
  - type: input
    id: problem
    attributes: { label: Problem Statement }
  - type: textarea
    id: proposal
    attributes: { label: Proposed Solution / UX, description: "User stories + acceptance criteria" }
    validations: { required: true }
  - type: textarea
    id: scope
    attributes: { label: In / Out of Scope }
  - type: dropdown
    id: impact
    attributes:
      label: Impact
      options: ["high","medium","low"]
```

**Chore / Maintenance** (`chore.yml`)

```yml
name: Chore
description: Infra and non-product tasks
labels: ["chore"]
body:
  - type: input
    id: summary
    attributes: { label: Summary }
    validations: { required: true }
  - type: textarea
    id: tasks
    attributes: { label: Tasks, placeholder: "- [ ] ..." }
```

**Design Doc** (`design_doc.yml`)

```yml
name: Design Doc
description: Architecture proposal before implementation
labels: ["design"]
body:
  - type: input
    id: title
    attributes: { label: Title }
    validations: { required: true }
  - type: textarea
    id: context
    attributes: { label: Context & Goals }
    validations: { required: true }
  - type: textarea
    id: approach
    attributes: { label: Proposed Approach (API, data model, diagrams) }
    validations: { required: true }
  - type: textarea
    id: risks
    attributes: { label: Risks & Alternatives }
  - type: textarea
    id: rollout
    attributes: { label: Rollout Plan / Flags / Migration }
```

### Linting/Formatting

**.editorconfig**

```ini
root = true
[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true
```

**ESLint / Prettier / Commitlint**

```js
// .eslintrc.cjs
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "unused-imports", "import", "react-hooks"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  rules: {
    "unused-imports/no-unused-imports": "warn",
    "import/order": ["warn", { "newlines-between": "always", alphabetize: { order: "asc" }}],
    "@typescript-eslint/consistent-type-imports": "warn",
    "react-hooks/exhaustive-deps": "error",
  },
};
```

```json
// .prettierrc
{
  "singleQuote": false,
  "semi": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

```js
// .commitlintrc.cjs
module.exports = { extends: ["@commitlint/config-conventional"] };
```

**Changesets (semantic versioning)**

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config/schema.json",
  "changelog": ["@changesets/changelog-github", { "repo": "DigitalHerencia/<REPO>" }],
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch"
}
```

---

## 10) GitHub Projects v2: Fields, Views, Automation

**Project custom fields**

* `Status`: Backlog → In Progress → In Review → In QA → Done
* `Priority`: P0/P1/P2/P3
* `Type`: Bug / Feature / Chore / Design
* `Estimate`: 1, 2, 3, 5, 8, 13
* `Target Release`: `yyyy.mm.x`
* `Owner`: Assignee
* `Area`: gps / field / routes / practice / performance / infra

**Views**

* **Board** by `Status`, grouped by `Area`
* **Sprint** filtered by `Target Release`
* **Bugs** filtered `Type=Bug`, sorted by `Priority`
* **Release Readiness** grouped by `Target Release`, show missing tests/reviews via labels

**Automation**

* Use `project-automation.yml` (below) to:

  * Auto-add new issues/PRs to the project.
  * Move item to **In Progress** on first non-draft commit or when PR is marked “Ready for Review”.
  * Move to **In Review** when a PR is opened (non-draft).
  * Move to **In QA** when checks pass & “needs-qa” label applied.
  * Move to **Done** on merge.

---

## 11) Workflows: CI/CD, Security, Automation

> Pin actions by SHA in prod repos for supply-chain security. Shown with tags here for brevity.

**Node CI (`.github/workflows/ci.yml`)**

```yml
name: CI
on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [feature/**, bugfix/**, chore/**, refactor/**, docs/**]
jobs:
  build-test-lint:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: npm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm install --frozen-lockfile
      - run: npm lint
      - run: npm typecheck
      - run: npm test -- --coverage
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with: { name: coverage, path: coverage }
      - name: Copilot PR summary (optional)
        uses: github/copilot-summary@latest
        if: ${{ github.event_name == 'pull_request' }}
```

**E2E (Playwright) (`e2e.yml`)**

```yml
name: E2E
on:
  pull_request:
    branches: [develop, main]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: npm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm install --frozen-lockfile
      - run: npm exec playwright install --with-deps
      - run: npm build
      - run: npm start & npx wait-on http://localhost:3000
      - run: npm exec playwright test
```

**Vercel Preview on PRs (`preview-vercel.yml`)**

```yml
name: Preview Deploy
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
jobs:
  preview:
    runs-on: ubuntu-latest
    env:
      VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    steps:
      - uses: actions/checkout@v4
      - run: npm i -g vercel@latest
      - run: vercel pull --yes --environment=preview --token=$VERCEL_TOKEN
      - run: vercel build --token=$VERCEL_TOKEN
      - id: deploy
        run: echo "url=$(vercel deploy --prebuilt --token=$VERCEL_TOKEN)" >> $GITHUB_OUTPUT
      - name: Comment Preview URL
        uses: thollander/actions-comment-pull-request@v2
        with:
          message: "Vercel Preview: ${{ steps.deploy.outputs.url }}"
```

**Release (Changesets) (`release.yml`)**

```yml
name: Release
on:
  push:
    branches: [main]
jobs:
  version:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: npm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm install --frozen-lockfile
      - run: npm changeset version
      - run: git config user.name "github-actions[bot]"
      - run: git config user.email "github-actions[bot]@users.noreply.github.com"
      - run: |
          if [[ -n $(git status -s) ]]; then
            git add -A
            git commit -m "chore(release): version packages"
            git push
          fi
  publish:
    needs: version
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: npm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm install --frozen-lockfile
      - run: npm build
      - run: npm changeset publish
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
```

**Labeler (`labeler.yml`)**

```yml
name: Labeler
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/labeler@v5
        with:
          configuration-path: .github/labeler.yml
```

**Project Automation (`project-automation.yml`)**

```yml
name: Project Automation
on:
  issues:
    types: [opened, labeled, closed]
  pull_request:
    types: [opened, ready_for_review, closed]
jobs:
  sync:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      pull-requests: write
      project: write
    steps:
      - uses: actions/add-to-project@v1
        with:
          project-url: https://github.com/orgs/DigitalHerencia/projects/<ID>
      - name: Move to In Progress on RFR
        if: ${{ github.event_name == 'pull_request' && github.event.action == 'ready_for_review' }}
        uses: leonsteinhaeuser/project-beta-automations@v2
        with:
          project_url: https://github.com/orgs/DigitalHerencia/projects/<ID>
          resource_node_id: ${{ github.event.pull_request.node_id }}
          field: Status
          value: In Progress
```

**CodeQL (`codeql.yml`)**

```yml
name: CodeQL
on:
  push: { branches: [main, develop] }
  pull_request: { branches: [main, develop] }
jobs:
  analyze:
    uses: github/codeql-action/.github/workflows/codeql.yml@v3
    with:
      languages: javascript
```

**Dependabot (`dependabot.yml`)**

```yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule: { interval: "weekly" }
    open-pull-requests-limit: 10
    versioning-strategy: increase
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule: { interval: "weekly" }
```

**Secret-scan gate for PRs (`secret-scan-block.yml`)**

```yml
name: Block Secrets
on: pull_request
jobs:
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: GitHub Secret Scanning (native)
        run: echo "Enable repo security & analysis > secret scanning alerts & push protection"
      - name: Trufflehog
        uses: trufflesecurity/trufflehog@v3
        with:
          path: .
```

**Lockfile Lint (`lockfile-lint.yml`)**

```yml
name: Lockfile Lint
on: pull_request
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm
```

---

## 12) Branch Protections, Environments, Merge Queue

**Branch protection (main, develop)**

* Require PR reviews (min 1–2), **CODEOWNERS** review as needed.
* Require status checks: `CI`, `E2E`, `CodeQL`, `Lockfile Lint`.
* Require linear history; **squash merges only**.
* Require successful **secret scanning** & **push protection** enabled.
* Enforce signed commits (optional).

**Environments**

* `Preview` (PRs): Vercel preview URLs, limited secrets.
* `Staging`: nightly release branches or `release/*`.
* `Production`: tagged releases from `main`.
  Use environment protection rules with required reviewers for Prod deploys.

**Merge Queue**

* Enable **Merge queue** on `main` to serialize merges after checks.

---

## 13) VS Code, Codespaces & MCP Integration

**Recommended extensions (`.vscode/extensions.json`)**

```json
{
  "recommendations": [
    "GitHub.copilot",
    "GitHub.copilot-chat",
    "GitHub.vscode-pull-request-github",
    "Prisma.prisma",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-playwright.playwright",
    "bradlc.vscode-tailwindcss"
  ]
}
```

**Settings (`.vscode/settings.json`)**

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
  "files.eol": "\n",
  "eslint.useFlatConfig": false,
  "tailwindCSS.experimental.classRegex": [["clsx\\(([^)]*)\\)","cva\\(([^)]*)\\)"]],
  "git.confirmSync": false,
  "githubPullRequests.createOnPublishBranch": "never"
}
```

**Tasks (`.vscode/tasks.json`)**

```json
{
  "version": "2.0.0",
  "tasks": [
    { "label": "dev", "type": "shell", "command": "npm dev" },
    { "label": "typecheck", "type": "shell", "command": "npm typecheck" },
    { "label": "lint", "type": "shell", "command": "npm lint" },
    { "label": "test", "type": "shell", "command": "npm test" },
    { "label": "e2e", "type": "shell", "command": "npm exec playwright test" }
  ]
}
```

**Codespaces Devcontainer**

```json
// .devcontainer/devcontainer.json
{
  "name": "marching-band-pwa",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/npm:1": { "version": "9" }
  },
  "postCreateCommand": "npm install",
  "customizations": {
    "vscode": {
      "extensions": [
        "GitHub.copilot",
        "GitHub.copilot-chat",
        "GitHub.vscode-pull-request-github",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ]
    }
  },
  "remoteEnv": {
    "NEXT_TELEMETRY_DISABLED": "1"
  }
}
```

**MCP / Tooling surfaces**

* If you’re running **MCP servers** (Model Context Protocol), add them via your AI client or VS Code agent host. For VS Code-native flows, prefer:

  * **Copilot Chat** “/terminal”, “/tests”, “/fix” tools.
  * **Copilot Edits** to apply multi-file refactors safely on a branch.
  * **GitHub Agents** (Org/Repo settings) to automate repo chores (labeling, release note drafts, project hygiene). Configure minimal scopes, log outputs back to PRs.

---

## 14) Copilot / Agents: Practical Usage Patterns

**In PRs**

* Ask Copilot Chat: *“Summarize this PR’s risk and test impact.”*
* *“Generate unit test cases for changed functions in /src/features/routes.”*
* *“Suggest more strict types for this diff.”*
* Use **Copilot ‘Explain’** on CI failures; apply **Copilot Edits** to fix.

**In Editor**

* “Write Playwright tests for PracticeHUD interactions: start/stop, bpm input, step advance.”
* “Refactor useGpsTracker to use Web Workers + Kalman filter; preserve API.”

**Repo Maintenance via Agents**

* Daily: triage new issues, label, add to Project.
* Weekly: dependency audit summary, open PRs with grouped minor bumps.
* Release: generate release note draft grouped by Conventional Commit type.

---

## 15) End-to-End Development Cycle (step-by-step)

1. **Intake & Planning**

   * Create Issue from template (Feature or Bug), define acceptance criteria.
   * Add to **Project v2**, set `Priority`, `Estimate`, `Area`, and `Target Release`.
   * Optional: attach a **Design Doc** issue for non-trivial work.

2. **Branching (GitFlow)**

   * From `develop`:
     `gh repo set-default` (once)
     `gh issue view 123 -w` (review scope)
     `git switch -c feature/gps-worker-123`
   * Open a **Draft PR** immediately; link Issue (#123).

3. **Build & Test Locally**

   * `npm dev`, `npm typecheck`, `npm lint`, `npm test`.
   * Use **Copilot Chat** inside files to scaffold tests and fix types.

4. **Continuous Feedback**

   * Push commits with **Conventional Commits**.
   * CI runs **lint/typecheck/unit**; PR comment adds **Vercel Preview**.
   * If UI change, attach screenshots/GIF and preview URL.

5. **Review & Hardening**

   * Request reviewers (CODEOWNERS auto-request).
   * Address PR feedback with **Copilot Edits** for safe batch changes.
   * Ensure **Playwright e2e** passes on the preview.

6. **Merge to `develop`**

   * Convert Draft → Ready for review; checks must pass.
   * **Squash merge** with a clean, semantic title.
   * Project item auto-moves to **In QA** → **Done** when merged.

7. **Release Stabilization**

   * Cut `release/2025.09.x` from `develop`.
   * Only fixes enter; bump versions via **Changesets** if needed.
   * QA on staging environment; sign-off checklist.

8. **Go Live**

   * Merge `release/*` → `main`.
   * `release.yml` generates tags & **GitHub Release** notes.
   * Deploy to **Production** environment (protected reviewers gate).

9. **Hotfix (if needed)**

   * From `main`: `hotfix/<id>`, PR with `fix:` commits, merge to `main`, tag, then back-merge to `develop`.

10. **Retro & Metrics**

* Use Project insights: lead time, PR cycle time, failure rate.
* Create chores or tech-debt issues as follow-ups.

---

## 16) Security & Supply-Chain Hardening

* **Enable**: Dependabot, CodeQL, Secret scanning + Push protection, Actions self-hosted runner protection (optional).
* **Pin Actions** by SHA; use **reusable workflows** from a locked infra repo.
* **SLSA provenance** (if publishing packages): add provenance generation step.
* **Least-privilege** tokens for Actions; deploy via **Environments** with required reviewers and masked secrets.
* **Prisma/Neon/Clerk**: rotate tokens regularly; enforce `.env` schema checks (e.g., `zod-env` on boot).

---

## 17) Optional QoL Enhancements

* **Auto-assign reviewers** via `labeler.yml` + `CODEOWNERS`.
* **Semantic PR titles** enforcement (actions/github-lint-title).
* **Preview database** seeds for Playwright PR runs (ephemeral Neon branch db).
* **PR size labels** (XS/S/M/L/XL) to nudge smaller changes.
* **Contributors bot** to maintain credits.

---

### Minimal GH CLI Aliases (drop in `.bashrc`/PowerShell profile)

```bash
alias gpr="gh pr create --fill --draft"
alias gco="gh pr checkout"
alias gri="gh issue view"
alias glp="gh pr list -L 50"
alias gmr="gh pr merge --squash --delete-branch"
```

---
Below is a complete, repo-ready **Supplementary Design & Branding Doc** for your marching band PWA. It includes original branding, a full visual system, tokens, logo SVGs, motion rules, UI patterns, accessibility, and implementation snippets aligned to your stack (Next.js 15, React 19, TS, Tailwind v4, shadcn/ui).

---

# 🎺 Supplementary Design & Branding

## 0) Brand Naming & Rationale

**Primary Brand Name:** **DotPilot**
**Tagline:** *Know your dot. Nail the count.*

* **Why:** “Dot” is drill vocabulary; “Pilot” implies guidance and navigation (GPS + performance cues). Short, pronounceable, ownable.
* **Alt candidates (reserve):** **Hashmark**, **DrillPilot**, **CadenceGrid**, **Yardline**.
  Keep these as internal alternates in case of naming conflicts later.

---

## 1) Brand Foundations

**Mission:** Make every marcher field-confident by translating complex drill & music into immediate, actionable cues.
**Positioning:** *The* mobile-first dot-drill navigator for practice and performance, built on precise GPS + field-accurate grids.
**Values:** Precision, calm confidence, tradition-aware UX, no gimmicks.
**Voice:** Clear, supportive, respectful of band culture. Avoid slang or hype.
**Tone by context:**

* Setup & Docs → instructive and concise
* Practice → encouraging and focused
* Performance → minimal, high-signal, “you got this”

---

## 2) Visual Identity System

### 2.1 Color Palette (accessible AA/AAA pairings)

| Token                                   | Hex       | Usage                                         |
| --------------------------------------- | --------- | --------------------------------------------- |
| `--brand-primary` (**Field Green 600**) | `#1F7A3F` | Primary CTAs, focus accents, route highlights |
| `--brand-primary-700`                   | `#186236` | Hover/pressed                                 |
| `--brand-accent` (**Brass Gold 500**)   | `#C9A227` | Metronome pulse, status dots, highlights      |
| `--brand-danger` (**Tempo Red 500**)    | `#D94141` | “Off-count” indicators / alerts               |
| `--brand-info` (**Sky 500**)            | `#2F7FD3` | GPS/connection state                          |
| `--ink-900`                             | `#0F172A` | Primary text (slate-900)                      |
| `--ink-700`                             | `#334155` | Secondary text                                |
| `--surface-0`                           | `#0B0F14` | App background (dark)                         |
| `--surface-1`                           | `#121821` | Cards/HUD                                     |
| `--surface-2`                           | `#1B2430` | Elevated surfaces                             |
| `--grid-line`                           | `#E7E7E7` | Field/yard/hash lines (light mode invert)     |
| `--white`                               | `#FFFFFF` | Pure white for grid/hash overlays             |

* Contrast: primary on dark surfaces ≥ AA; red/gold on dark tested for ≥ AA for text ≥ 16px or semibold.
* Light theme derives by swapping surfaces and ink values (keep same brand colors).

### 2.2 Typography

* **Headings / Numerics:** **Archivo Variable** (Bold 700). Wide, athletic, highly legible from distance.
* **Body/UI:** **Inter Variable** (400/500/600).
* **Counters/Monospace:** **Roboto Mono** (Tabular). Use for BPM, counts, coordinates.

Typographic scale (mobile-first):

* Display: 32/36/40 (clamp) for page titles
* H1: 24–28
* H2: 20–22
* Body: 14–16
* Caption/Meta: 12–13
* Numeric HUD: 28–36 tabular (auto-resize when space constrained)

### 2.3 Logo & Marks

**Concept:** A dot traveling along a 5-yard grid path; a subtle metronome pulse integrated into the mark.

**Primary Wordmark:** “DotPilot” with stylized “o” as the dot.
**Primary Glyph:** Grid square + path curve + dot.

**SVG – Logomark (icon-only, 24/48/256 scalable)**

<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" rx="48" fill="#121821"/>
  <!-- Grid -->
  <g stroke="#E7E7E7" stroke-opacity="0.25" stroke-width="2">
    <path d="M32 64H224M32 112H224M32 160H224M32 208H224" />
    <path d="M64 32V224M112 32V224M160 32V224M208 32V224" />
  </g>
  <!-- Path -->
  <path d="M56 192 C 96 112, 160 144, 200 80" stroke="#1F7A3F" stroke-width="10" fill="none" stroke-linecap="round"/>
  <!-- Dot -->
  <circle cx="200" cy="80" r="14" fill="#C9A227" />
  <!-- Tempo ring -->
  <circle cx="200" cy="80" r="26" stroke="#C9A227" stroke-opacity="0.35" stroke-width="4"/>
</svg>

**SVG – Wordmark (horizontal)**

<svg width="640" height="160" viewBox="0 0 640 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="640" height="160" fill="#121821"/>
  <g transform="translate(24,24)">
    <rect width="112" height="112" rx="24" fill="#121821"/>
    <g stroke="#E7E7E7" stroke-opacity="0.25" stroke-width="2">
      <path d="M8 32H104M8 64H104M8 96H104" />
      <path d="M32 8V120M64 8V120M96 8V120" />
    </g>
    <path d="M16 96 C 36 56, 78 68, 100 40" stroke="#1F7A3F" stroke-width="8" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="40" r="10" fill="#C9A227"/>
  </g>
  <text x="160" y="95" fill="#FFFFFF" font-family="Archivo, system-ui, sans-serif" font-weight="700" font-size="64">
    Dot<tspan fill="#C9A227">P</tspan>ilot
  </text>
</svg>

**Monochrome usage:** Use `--ink-900` on light; `--white` on dark.
**Clearspace:** ≥ height of the “D”.
**Min size:** 24px icon, 140px wordmark.

---

## 3) Design Tokens & Tailwind v4 Setup

**globals.css (CSS custom properties)**

```css
:root {
  --brand-primary: #1F7A3F;
  --brand-primary-700: #186236;
  --brand-accent: #C9A227;
  --brand-danger: #D94141;
  --brand-info: #2F7FD3;

  --ink-900: #0F172A;
  --ink-700: #334155;

  --surface-0: #0B0F14;
  --surface-1: #121821;
  --surface-2: #1B2430;

  --grid-line: #E7E7E7;
  --white: #FFFFFF;

  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 20px;

  --shadow-1: 0 4px 16px rgba(0,0,0,.25);
  --shadow-2: 0 10px 30px rgba(0,0,0,.35);

  /* Motion */
  --tempo-ms: 500; /* 120 BPM default; 60000 / bpm at runtime */
  --pulse-scale: 1.06;
}

[data-theme="light"] {
  --surface-0: #FFFFFF;
  --surface-1: #F8FAFC;
  --surface-2: #EDF2F7;
  --ink-900: #0B0F14;
  --grid-line: #1F2937;
}
```

**tailwind.config.ts (v4)**

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--brand-primary)",
          700: "var(--brand-primary-700)",
          accent: "var(--brand-accent)",
          danger: "var(--brand-danger)",
          info: "var(--brand-info)",
        },
        ink: { 900: "var(--ink-900)", 700: "var(--ink-700)" },
        surface: { 0: "var(--surface-0)", 1: "var(--surface-1)", 2: "var(--surface-2)" },
        grid: { line: "var(--grid-line)" },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        brand1: "var(--shadow-1)",
        brand2: "var(--shadow-2)",
      },
      keyframes: {
        pulseBeat: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(var(--pulse-scale))" },
        },
      },
      animation: {
        pulseBeat: "pulseBeat calc(var(--tempo-ms)*1ms) ease-in-out infinite",
      },
      fontFamily: {
        display: ["Archivo", "Inter", "system-ui", "sans-serif"],
        ui: ["Inter", "system-ui", "sans-serif"],
        mono: ["Roboto Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

**shadcn/ui theming note:** map primary to `brand` and set `--primary` in `:root` to `--brand-primary`.

---

## 4) Components & Patterns (spec)

### 4.1 Primary Button (shadcn variant)

```tsx
// ui/button.tsx (variant example)
import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";

const button = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white hover:bg-brand-700",
        ghost: "bg-transparent text-white hover:bg-white/10",
        danger: "bg-brand-danger text-white hover:bg-brand-danger/90",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export function Button({ className, variant, size, ...props }: any) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
```

### 4.2 HUD: Tempo Pulse & Count

```tsx
export function TempoPulse({ bpm }: { bpm: number }) {
  const ms = Math.max(100, Math.min(1000, Math.round(60000 / bpm)));
  return (
    <div
      style={{ ["--tempo-ms" as any]: ms }}
      className="w-10 h-10 rounded-full bg-brand-accent/80 animate-pulseBeat will-change-transform"
      aria-label={`Tempo ${bpm} beats per minute`}
    />
  );
}

export function CountBadge({ count }: { count: number }) {
  return (
    <div className="rounded-md bg-surface-2 px-3 py-1 shadow-brand1">
      <span className="font-mono text-xl text-white tabular-nums">{count}</span>
    </div>
  );
}
```

### 4.3 Field Grid (spec)

* 53 ⅓ yd wide x 120 yd long (incl. end zones) → translate to px via scale.
* Hash marks: college vs. high-school positions (configurable).
* **Rendering:** Canvas for performance; overlay React HUD.
* **GPS Accuracy Ring:** Draw circle radius `accuracy` from geolocation, color `brand.info` with opacity 0.25.

### 4.4 Performance Mode Overlay

* Only three high-signal elements on by default: **Dot**, **Next Target**, **Tempo Pulse**.
* Optional toggles: **Step Count**, **Coordinate**, **Path Ghost** (last 4 counts), **Error Arrows** (vector to target).

### 4.5 Iconography (Lucide mapping)

* Tempo: `metronome`, GPS: `navigation`, Route: `route`, Practice: `play-circle`, Performance: `sparkles`, Music: `music-4`, Settings: `sliders`.
* Use stroke 1.75–2 on dark, 1.5 on light; `currentColor` with `text-ink-700` by default.

---

## 5) Motion, Haptics, and Feedback

* **Tempo-sync animations** use `animation: pulseBeat var(--tempo-ms)`.
* **Reduced motion:** respect `prefers-reduced-motion: reduce` → freeze pulse scale at 1, replace with subtle opacity fade.
* **Haptics (mobile):** short vibration on downbeat (if user enables).

  ```ts
  export function vibrateDownbeat(enabled: boolean) {
    if (!enabled || !("vibrate" in navigator)) return;
    navigator.vibrate?.(15); // short tick
  }
  ```
* **GPS state transitions:** fade in/out overlays within 120–200ms, no bouncing.

---

## 6) Accessibility & Content

* **Color contrast:** primary vs. surfaces ≥ 4.5:1 for body text, ≥ 3:1 for large UI text.
* **Touch targets:** 44×44 min; spacing 8–12px.
* **Screen reader labels:** Every HUD element has `aria-label` with live region updates for tempo & count.
* **Copy guidelines:**

  * Practice tips: imperative + specific (“Align to right hash; 8 counts to 35 yd”).
  * No exclamation marks in performance mode; calm language cues.

---

## 7) Asset Pipeline & App Icons

**Repo structure**

```
/public/brand/
  dotpilot-logomark.svg
  dotpilot-wordmark.svg
  color-palette.png
  usage.md
/public/icons/
  favicon.svg
  mask-icon.svg
  icon-192.png
  icon-512.png
  apple-touch-icon.png
```

**favicon.svg (maskable)**

```svg
<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <mask id="m"><rect width="256" height="256" rx="56" fill="#fff"/></mask>
  </defs>
  <rect width="256" height="256" fill="#121821" mask="url(#m)"/>
  <path d="M56 192 C 96 112, 160 144, 200 80" stroke="#1F7A3F" stroke-width="12" fill="none" stroke-linecap="round"/>
  <circle cx="200" cy="80" r="16" fill="#C9A227"/>
</svg>
```

**manifest.webmanifest (excerpt)**

```json
{
  "name": "DotPilot",
  "short_name": "DotPilot",
  "theme_color": "#121821",
  "background_color": "#0B0F14",
  "display": "standalone",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

---

## 8) Page Templates & Layouts

**Navigation model (mobile-first bottom nav):**

* **Practice**, **Performance**, **Routes**, **Music**, **Settings**.
  Use a bottom bar with 5 icons, enlarged center for Performance. Hide on scroll, show on idle.

**Template: App Shell**

* Top: compact header with current show/part dropdown.
* Body: canvas field (fills), overlay HUD.
* Bottom: nav bar (safe-area aware with `pt-[env(safe-area-inset-bottom)]`).

**Example Layout Snippet**

```tsx
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-0 text-white">
      <header className="h-12 px-3 flex items-center justify-between bg-surface-1/80 backdrop-blur-md">
        <div className="font-display tracking-wide">DotPilot</div>
        <div className="text-ink-700 text-sm">Show: Fall ’25 • Trumpet 1</div>
      </header>
      <main className="relative">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 bg-surface-1/80 backdrop-blur-md border-t border-white/5">
        {/* nav buttons */}
      </nav>
    </div>
  );
}
```

---

## 9) Documentation Patterns (integrated in-app help)

* **Quickstart:** 5-step inline guide (calibrate field, set step size, load route, pick tempo, start practice).
* **Contextual tips:** small “?” buttons that open side sheets with diagrams.
* **Troubleshooting cards:** GPS accuracy, device calibration, tempo mismatch, sheet parsing hints.
* **Glossary:** dot, set, count, hash, 8-to-5, guide, yard line.

---

## 10) QA Visual Checklist

* Field grid aligns to device rotation; lines remain crisp (device pixel ratio aware).
* HUD text legible under direct sun: ≥ 16px, high contrast.
* Motion respects reduced-motion settings.
* Favicon maskable and PWA install meta verified (Android & iOS).
* Logo clear at 24px; no color bleed on OLED (avoid pure #000 black).

---

## 11) Brand Usage Do/Don’t

**Do:** keep spacing, use brand colors, maintain typographic hierarchy.
**Don’t:** skew the logo, apply drop shadows to the wordmark, or color the dot red (reserved for error).

---

## 12) Delivery & Handoff

**Files to commit now:**

* `/public/brand/*.svg` (logomark & wordmark provided above)
* `/public/icons/favicon.svg`, `manifest.webmanifest` (above)
* `globals.css`, `tailwind.config.ts` updates
* `README_brand.md` summarizing usage + tokens

**Figma starter (structure suggestion):**

* Pages: *Brand*, *Tokens*, *Components*, *Templates*, *Flows*
* Libraries: export color & type styles, component sets (HUD, buttons, editor handles)

---

## 13) Roadmapped Enhancements

* **Dynamic Theme Accent:** allow show-specific accent color (keep core green for affordances).
* **Team Branding:** director can upload school colors → generate derived palette (auto-contrast).
* **Telemetry Heatmaps (privacy-safe):** aggregate off-count vectors to improve teaching focus.
* **Adaptive Readability:** auto-increase weight/size under bright light using Ambient Light Sensor (when available) with user consent.

---

## 14) Brand Readme (drop-in)

```md
# DotPilot – Brand & UI System

This folder contains the official DotPilot brand assets and UI tokens.

## Files
- `dotpilot-logomark.svg` – icon-only
- `dotpilot-wordmark.svg` – horizontal lockup
- `/icons/favicon.svg`, `manifest.webmanifest`

## Colors (CSS variables)
See `globals.css` for `--brand-*`, `--surface-*`, `--ink-*`.

## Typography
- Headings: Archivo
- Body: Inter
- Numerics: Roboto Mono (tabular)

## Usage
- Maintain clearspace = height of the “D”
- Do not recolor the dot to red (reserved for error state)
- Ensure AA contrast under sunlight

## Contact
Open a `design_doc` issue for any proposed changes.
```

---
