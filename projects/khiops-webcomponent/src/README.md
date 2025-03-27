# Khiops visualization & covisualization Angular components

Khiops Visualization is a visualization plug-in of the data preparation and scoring tool Khiops. Khiops Visualization allows visualizing all analysis results in an intuitive way, providing a quick and easy interpretation of the discovered patterns.

## Installation

Latest version:

```bash
npm i khiops-visualization@latest
```

Or specific version:

```bash
npm i khiops-visualization@11.5.5
```

## Usage

Into you html app file:

```html
<khiops-visualization></khiops-visualization> <khiops-covisualization></khiops-covisualization>
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

## Configuration

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

## Datas models

VisualizationDatas & CovisualizationDatas Models interfaces can be found here:\
[VisualizationDatas](https://github.com/KhiopsML/khiops-visualization/blob/master/src/app/khiops-visualization/interfaces/app-datas.d.ts)\
[CovisualizationDatas](https://github.com/KhiopsML/khiops-visualization/blob/master/src/app/khiops-covisualization/interfaces/app-datas.d.ts)

## License

Khiops visualization & covisualization webcomponents is available under the [BSD 3-Clause Clear License](LICENSE).
