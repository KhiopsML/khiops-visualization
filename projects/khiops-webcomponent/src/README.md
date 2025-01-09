# Khiops visualization & covisualization webcomponents

Khiops Visualization is a visualization plug-in of the data preparation and scoring tool Khiops. Khiops Visualization allows visualizing all analysis results in an intuitive way, providing a quick and easy interpretation of the discovered patterns.

## Installation

```
npm i khiops-visualization
```

## Usage

```
<khiops-visualization></khiops-visualization>
<khiops-covisualization></khiops-covisualization>
```

```
const kv = document.querySelector('khiops-visualization');
kv.setConfig({
	appSource : 'WEB', // WEB or ELECTRON
	showProjectTab: true, // Show or hide project tab
	onFileOpen : function() {
		// Callback when a file is open
		console.log('fileOpen');
	},
	onCopyData : function(data) {
		// Callback when datas are copied
		console.log(data);
	},
	onCopyImage : function(base64data: any) {
		// Callback when screenshot is copied
		console.log(base64data);
	},
	onThemeChanged : function(data: string) {
		// Callback when theme has changed
		console.log(data);
	},
	readLocalFile : function(file: File | any, cb: Function) {
		// Callback when a local file is loaded automatically
		// For security reasons, local files can not be loaded automatically without Electron
		// Used to load external datas at startup
		// This method takes a file in input and a callback when file is loaded
	},
	onSendEvent : function(event: { message: string; data: any }) {
		// Send custom events
		// Event must have a message and may have additionnal datas of any type
		console.log(message, data);
	},
});
const datas: CovisualizationDatas | VisualizationDatas;
kv.setDatas(datas);
kv.getDatas();

```

## Datas models

VisualizationDatas & CovisualizationDatas Models interfaces can be fount here:\
[VisualizationDatas](https://github.com/KhiopsML/khiops-visualization/blob/master/src/app/khiops-visualization/interfaces/app-datas.d.ts)\
[CovisualizationDatas](https://github.com/KhiopsML/khiops-visualization/blob/master/src/app/khiops-covisualization/interfaces/app-datas.d.ts)

## License

Khiops visualization & covisualization webcomponents is available under the [BSD 3-Clause Clear License](LICENSE).
