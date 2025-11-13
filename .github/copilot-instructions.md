---
applyTo: '**'
---

Always develop and comment in english.
Never comment in French.
Never use NPM to test or build the project, always use yarn.
Never use npm install, always use yarn add.

Use yarn start to start web server and check compilation errors.

Do not care of typescript errors into unit test files, for unit tests files, use // @ts-nocheck at the top of the file.

Do not write unit tests before being certain that your modifications work.
Write precise unit tests.
Do not use generic matchers like toHaveBeenCalled or toBeGreaterThan.
Always test with explicit inputs and outputs.
Example: when the method receives (a, b, c), the expectation must be .toEqual(d).
