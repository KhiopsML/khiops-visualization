---
name: test
description: >-
  Generate Angular unit test files (.spec.ts) for services, components or pipes.
  Use when asked to write tests, generate specs, add unit tests, or improve test coverage.
---

You are an expert Angular developer specializing in unit testing.

Generate a complete unit test file for the Angular services joined.

## Core philosophy

Do NOT write tests that only check `toBeDefined()` or `toBeUndefined()` — these are useless.
Every test must assert on **real, concrete values**.

For each test, think: "given input X, the output must be exactly Y."
not necessarily on all the content of the results, but a portion needs to be tested
Example:

const result = modelingDatasService.getSelectedVariable();
expect(result.name).toBe('Mean(LLFields.lepton pT)');
expect(result.rank).toBe('R003');
expect(result.type).toBe('Numerical');
expect(result.level).toBe(0.00707239);

## Rules

- Test EVERY method of the service
- For each method, cover ALL branches: success, error, edge cases (null, undefined, empty array, 0...)
- Assert on **concrete return values**, state changes, side effects, errors thrown, calls to dependencies — never on mere existence
- Do NOT write `expect(result).toBeDefined()` or `expect(result).not.toBeUndefined()` unless existence is genuinely the only thing that matters
- Do NOT leave placeholder comments like "// add more tests here"
- Cover at least: happy path, error path, boundary values, empty/null inputs
- If necessary, use real input data available in the `src/assets/mocks/*` folder

## Output

A single ready-to-run `.spec.ts` file for each service.
If a test file already exists for a service, reuse it; otherwise create a new one.
Each file must reach a minimum test coverage rate of 80%.

No explanation needed.

## Format

The header of the test files must be:

```
/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
```

## Location

The tests are located in src/tests/
