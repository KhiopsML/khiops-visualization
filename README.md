[![Unit tests](https://github.com/KhiopsML/khiops-visualization/actions/workflows/test.yml/badge.svg)](https://github.com/KhiopsML/khiops-visualization/actions/workflows/test.yml) [![Publish to NPM](https://github.com/KhiopsML/khiops-visualization/actions/workflows/publish.yml/badge.svg?branch=master)](https://github.com/KhiopsML/khiops-visualization/actions/workflows/publish.yml) [![npm version](https://badge.fury.io/js/khiops-visualization.svg)](https://www.npmjs.com/package/khiops-visualization) [![End-to-end tests](https://github.com/KhiopsML/khiops-visualization/actions/workflows/e2e.yml/badge.svg)](https://github.com/KhiopsML/khiops-visualization/actions/workflows/e2e.yml) <img alt="gitleaks badge" src="https://img.shields.io/badge/protected%20by-gitleaks-blue">

# Khiops Visualization NPM component

Intuitive visualization of [Khiops][khiops] analysis results

This repository contains the code of [Khiops Visualization][kv] and [Khiops Covisualization][kc] tools combined into one [npm package][khiopsNpm]

![khiops-demo][demoGif]

## Development Setup

### Prerequisites

- Install [Node.js][node] which includes [Node Package Manager][npm]
- Prefer to use [Yarn][yarn] Package Manager.

### Ecosystem

- [Angular][angular]
- [Angular Material][angularMaterial]

### Installation

Run `yarn install`

### Development server

Run `yarn start` for a dev server. Navigate to [http://localhost:4200/](http://localhost:4200/).
The app will automatically reload if you change any of the source files.

Test files can be found into `./src/assets/mocks` folder

### Running unit tests

Run `yarn test` to execute the unit tests via [Karma][karma].

### Running e2e tests

Run `yarn e2e` to execute the unit tests via [Cypress][cypress].

## License

This software is distributed under the BSD 3-Clause-clear License, the text of which is available at
https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the [LICENSE](./LICENSE) for more
details.

[demoGif]: https://github.com/KhiopsML/khiops-visualization/assets/13203455/53a90746-64da-4d44-adaf-f18c6f854622
[khiops]: https://khiops.org/
[kv]: https://github.com/KhiopsML/kv-electron
[kc]: https://github.com/KhiopsML/kc-electron
[khiopsNpm]: https://www.npmjs.com/package/khiops-visualization
[angularMaterial]: https://material.angular.io/
[angular]: https://angular.dev/
[cypress]: https://www.cypress.io/
[karma]: https://karma-runner.github.io
[node]: https://nodejs.org/en
[npm]: https://www.npmjs.com/
[yarn]: https://yarnpkg.com/
