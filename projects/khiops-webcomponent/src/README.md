# Khiops Visualization & Covisualization Components

[![npm version](https://badge.fury.io/js/khiops-visualization.svg)](https://badge.fury.io/js/khiops-visualization) [![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

Khiops Visualization is a powerful visualization plugin for the data preparation and scoring tool Khiops. It provides intuitive visualizations of analysis results, enabling quick and easy interpretation of discovered patterns in your data.

## ⚡ Installation

Latest version:

```bash
npm i khiops-visualization@latest
```

Or specific version:

```bash
npm i khiops-visualization@11.5.5
```

## 🚀 Usage

### 🅰️ With Angular

Into your html app file:

```html
<khiops-visualization></khiops-visualization>
```

or

```html
<khiops-covisualization></khiops-covisualization>
```

Into your .ts app component:

```ts
import { Component, ElementRef, ViewChild } from '@angular/core';
import 'khiops-visualization';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  jsonData = {}; // JSON data to be displayed

  @ViewChild('visualizationComponent', {
    static: false,
  })
  visualizationComponent?: ElementRef<HTMLElement>;

  @ViewChild('covisualizationComponent', {
    static: false,
  })
  covisualizationComponent?: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.visualizationComponent?.nativeElement.setConfig({
      showProjectTab: false,
      showLogo: false,
      // ... see Configuration
    });
    this.visualizationComponent?.nativeElement.setDatas(jsonData);

    this.covisualizationComponent?.nativeElement.setConfig({
      showProjectTab: false,
      showLogo: false,
      // ... see Configuration
    });
    this.covisualizationComponent?.nativeElement.setDatas(jsonData);
  }
}
```

You may have to allow CUSTOM_ELEMENTS_SCHEMA into your module:

```ts
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
```

### 🌐 Without Angular (Vanilla JavaScript)

You can also use the library in any HTML application without Angular. Here's a complete example:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Khiops Visualization</title>
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <khiops-visualization id="kv1" style="width: 100%; height: 100%"></khiops-visualization>

    <!-- Include the library from CDN -->
    <script src="https://unpkg.com/khiops-visualization/khiops-webcomponents.bundle.js"></script>

    <script>
      document.addEventListener('DOMContentLoaded', function () {
        // Get the component element
        const kv1 = document.querySelector('khiops-visualization');

        // Wait for the component to be fully initialized
        if (kv1 && typeof kv1.clean === 'function') {
          initializeComponent();
        } else {
          setTimeout(() => {
            initializeComponent();
          }, 500);
        }
      });

      function initializeComponent() {
        const kv1 = document.querySelector('khiops-visualization');

        // Clean any previous data
        kv1.clean();

        // Set configuration
        kv1.setConfig({
          showProjectTab: false,
          showLogo: false,
          showOpenFileBtn: true,
        });

        // Load and set your JSON data
        loadData().then((data) => {
          kv1.setDatas(data);
        });
      }

      async function loadData() {
        // Example: load data from a JSON file
        try {
          const response = await fetch('./your-data.json');
          return await response.json();
        } catch (error) {
          console.error('Error loading data:', error);
          return {}; // Return empty object as fallback
        }
      }
    </script>
  </body>
</html>
```

For covisualization, simply replace `<khiops-visualization>` with `<khiops-covisualization>` in the HTML.

## ⚙️ Configuration

The components can be customized using the `setConfig()` method with the following options:

| Option         | Type     | Description                                                                                                                                                                                                                                                    | Default |
| -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| showProjectTab | boolean  | Show or hide project's tab                                                                                                                                                                                                                                     | true    |
| showLogo       | boolean  | Show or hide header's logo                                                                                                                                                                                                                                     | true    |
| appSource      | string   | Specify app source for metrics                                                                                                                                                                                                                                 | WEB     |
| trackerId      | string   | Matomo tracker id                                                                                                                                                                                                                                              |         |
| onFileOpen     | Callback | Callback when a file is open                                                                                                                                                                                                                                   |         |
| onCopyData     | Callback | Callback when datas are copied                                                                                                                                                                                                                                 |         |
| onCopyImage    | Callback | Callback when screenshot is copied                                                                                                                                                                                                                             |         |
| onSendEvent    | Callback | Send custom events<br> Event must have a message and may have additionnal datas of any type                                                                                                                                                                    |         |
| readLocalFile  | Callback | Callback when a local file is loaded automatically. <br>For security reasons, local files can not be loaded automatically without Electron.<br>Used to load external datas at startup.<br>This method takes a file in input and a callback when file is loaded |         |

## 📋 Data Models

The components expect specific data structures. TypeScript interfaces are available for reference:

- 📊 **VisualizationDatas**: [View Interface](https://github.com/KhiopsML/khiops-visualization/blob/master/src/app/khiops-visualization/interfaces/app-datas.d.ts)
- 🔗 **CovisualizationDatas**: [View Interface](https://github.com/KhiopsML/khiops-visualization/blob/master/src/app/khiops-covisualization/interfaces/app-datas.d.ts)

> 💡 **Tip**: Use these TypeScript interfaces in your project for better type safety and IntelliSense support.

## 🔧 API Methods

The components provide several methods for interaction:

| Method              | Description                            | Example                                  |
| ------------------- | -------------------------------------- | ---------------------------------------- |
| `setDatas(data)`    | Load visualization data                | `component.setDatas(jsonData)`           |
| `setConfig(config)` | Set component configuration            | `component.setConfig({showLogo: false})` |
| `clean()`           | Clear current data and reset component | `component.clean()`                      |

## 📄 License

Khiops visualization & covisualization webcomponents is available under the [BSD 3-Clause Clear License](LICENSE).
