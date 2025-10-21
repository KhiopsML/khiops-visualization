# Khiops Visualization NPM Component

[![Unit tests](https://github.com/KhiopsML/khiops-visualization/actions/workflows/test.yml/badge.svg)](https://github.com/KhiopsML/khiops-visualization/actions/workflows/test.yml)
[![Publish to NPM](https://github.com/KhiopsML/khiops-visualization/actions/workflows/publish.yml/badge.svg)](https://github.com/KhiopsML/khiops-visualization/actions/workflows/publish.yml)
[![npm version](https://badge.fury.io/js/khiops-visualization.svg)](https://www.npmjs.com/package/khiops-visualization)
[![End-to-end tests](https://github.com/KhiopsML/khiops-visualization/actions/workflows/e2e.yml/badge.svg?branch=master)](https://github.com/KhiopsML/khiops-visualization/actions/workflows/e2e.yml)
![gitleaks badge](https://img.shields.io/badge/protected%20by-gitleaks-blue)

**Intuitive visualization of [Khiops][khiops] analysis results**

<img width="791" height="546" alt="demo-khiops" src="https://github.com/user-attachments/assets/194483be-215e-49dd-b4f0-84e81fdbf415" />

**🌐 [Khiops Visualization Live Demo](https://khiopsml.github.io/khiops-visualization/)**

**🌐 [Khiops Covisualization Live Demo](https://khiopsml.github.io/khiops-visualization/covisualization.html)**

---

## 📖 Table of Contents

- [About](#-about)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage](#-usage)
- [Development](#-development)
- [Testing](#-testing)
- [License](#-license)

## 🔍 About

This repository contains the source code for [Khiops Visualization][kv] and [Khiops Covisualization][kc] tools, unified into a single, powerful [npm package][khiopsNpm]. Built with Angular and modern web technologies, it provides comprehensive data visualization capabilities for machine learning analysis.

---

**Integration Notice:**

- The **khiops-visualization** part of this npm library is integrated in the [kv-electron](https://github.com/KhiopsML/kv-electron) project.
- The **khiops-covisualization** part is integrated in the [kc-electron](https://github.com/KhiopsML/kc-electron) project.

## 🚀 Quick Start

```bash
# Install the package
npm install khiops-visualization
# or
yarn add khiops-visualization
```

```typescript
// Import in your Angular module
import { KhiopsVisualizationModule } from 'khiops-visualization';

@NgModule({
  imports: [KhiopsVisualizationModule],
  // ...
})
export class YourModule {}
```

## 📦 Installation

### Prerequisites

- **Node.js** - [Download Node.js][node]
- **npm** or **Yarn** - We recommend [Yarn][yarn]

### Install Dependencies

```bash
yarn install
```

## 📚 Usage

### Basic Implementation

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  template: ` <khiops-visualization [data]="visualizationData"></khiops-visualization> `,
})
export class ExampleComponent {
  visualizationData = {
    // Your Khiops analysis data
  };
}
```

### Sample Data

Test files and examples can be found in the `./src/assets/mocks` folder.

## 🛠 Development

### Technology Stack

- **Framework:** [Angular][angular]
- **UI Library:** [Angular Material][angularMaterial]
- **Testing:** [Karma][karma] + [Cypress][cypress]
- **Build System:** Angular CLI

### Development Server

Start the development server:

```bash
yarn start
```

Navigate to [http://localhost:4200/](http://localhost:4200/). The application will automatically reload when you make changes to the source files.

### Project Structure

```text
src/
├── app/
│   ├── khiops-visualization/     # Main visualization module
│   ├── khiops-covisualization/   # Covisualization module
│   └── khiops-library/           # Shared library components
├── assets/
│   └── mocks/                    # Sample data files
└── environments/                 # Environment configurations
```

## 🧪 Testing

### Unit Tests

Run unit tests with Karma:

```bash
yarn test
```

### End-to-End Tests

Run e2e tests with Cypress:

```bash
yarn e2e
```

### Test Coverage

Generate and view test results:

```bash
yarn test
```

### Bundle Compilation

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\build.ps1"
```

or

```bash
yarn build:webcomponents
```

## 📄 License

This software is distributed under the BSD 3-Clause-clear License, the text of which is available at
<https://spdx.org/licenses/BSD-3-Clause-Clear.html> or see the [LICENSE](./LICENSE) for more
details.

[khiops]: https://khiops.org/
[kv]: https://github.com/KhiopsML/kv-electron
[kc]: https://github.com/KhiopsML/kc-electron
[khiopsNpm]: https://www.npmjs.com/package/khiops-visualization
[angularMaterial]: https://material.angular.io/
[angular]: https://angular.dev/
[cypress]: https://www.cypress.io/
[karma]: https://karma-runner.github.io
[node]: https://nodejs.org/en
[yarn]: https://yarnpkg.com/
