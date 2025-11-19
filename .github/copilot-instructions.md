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

**Language & Comments:**

- Always develop and comment in English, never French
- Use `// @ts-nocheck` at the top of unit test files to ignore TypeScript errors

**Testing Philosophy:**

- Don't write unit tests before verifying your changes work
- Write precise, explicit unit tests with exact inputs/outputs
- Avoid generic matchers like `toHaveBeenCalled()` or `toBeGreaterThan()`
- Example: `expect(method(a, b, c)).toEqual(expectedResult)`

## Architecture Patterns

**Module Structure:**

- Each major feature has its own module (`khiops-visualization.module.ts`, `khiops-covisualization.module.ts`)
- Shared components live in `khiops-library/` with extensive Material Design imports

**File Organization:**

- Components: `components/` (feature-specific) vs `khiops-library/components/` (shared)
- Services: `providers/` directories contain business logic
- Tests: Separate `/src/tests/` directory mirrors `/src/app/` structure
- Mock data: `/src/assets/mocks/` for sample Khiops analysis files

**Build System:**

- Custom build scripts handle CSS extraction and Material Design prefixing
- Web components require special bundling (polyfills + styles + main → single file)
- Gulp handles custom library builds (`libs/khiops-hypertree/gulpfile.js`)

**Environment Configuration:**

- Environment files split into visualization/covisualization common configs
- Cypress integration flag: `(window as any).Cypress` detection pattern

**Key Integration Points:**

- Custom overlay container for Material dialogs (`InAppOverlayContainer`)
- D3 hypertree integration via custom elements schema
- AG-Grid for data tables with custom cell renderers
- Angular Split for resizable panels
