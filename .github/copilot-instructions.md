---
applyTo: '**'
---

## Project Overview

This is the Khiops Visualization NPM Component - an Angular application that provides data visualization for Khiops machine learning analysis. The project builds both standalone Angular modules and web components for integration into other applications.

**Key Architecture:**

- **Main modules:** `khiops-visualization` (data analysis), `khiops-covisualization` (comparative analysis), `khiops-library` (shared components)
- **build targets:** Angular app (`yarn start`)
- **Custom libraries:** `khiops-hypertree` (D3-based tree visualization), `khiops-treeview` (custom tree UI)
- **State management:** NgRx for tree-preparation workflows

## Development Workflow

**Essential Commands:**

- `yarn start` - Development server with hot reload
- `yarn test` - Run Karma unit tests (use `yarn test:watch --include="**/*.spec.ts"` for specific tests)
- `yarn e2e` - Run Cypress end-to-end tests
- `yarn build:webcomponents` - Build web components bundle (PowerShell required)

**Never use NPM - always use Yarn:**

- You do not have access to npm, nvm, npx, etc. Look for alternative ways to achieve what you want, for example with yarn.
- `yarn add` or `yarn install` (not `npm install`)
- `yarn` for dependency installation
- You do not have access to .json files, look for alternative ways to achieve what you want

## Code Standards

- Use `// @ts-nocheck` at the top of unit test files to ignore TypeScript errors

**Language & Comments:**

- **MANDATORY**: ALL code comments MUST be written in English only
- **MANDATORY**: ALL variable names, function names, and documentation MUST be in English
- **FORBIDDEN**: Never write comments in French or any other language than English
- **FORBIDDEN**: Never use French words in code, even for variable names

## Important Reminders

**CRITICAL**:

- English is the ONLY acceptable language for code and comments
- If you catch yourself writing in French, immediately correct to English
- This applies to ALL code-related content without exception

**commit messages**:
feat: Addition of a new feature.
fix: Bug fix.
chore: Miscellaneous tasks without functional changes (maintenance).
refactor: Code modification without behavior change (improvement, reorganization).
docs: Changes related to documentation.
style: Changes that do not impact the code (formatting, indentation, prettier).
test: Addition or modification of tests.
perf: Performance improvement.
build: Changes affecting the build system or dependencies.
ci: Changes related to CI/CD.

## Notations
kv means khiops-visualization
kc means khiops-covisualization
kvd means khiops-visualization-desktop