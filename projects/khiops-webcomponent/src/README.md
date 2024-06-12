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
	appSource : 'WEB',
	onFileOpen : function() {
		console.log('fileOpen');
	},
	onCopyData : function(data) {
		console.log(data);
	},
	onCopyImage : function(data) {
		console.log(data);
	},
	onThemeChanged : function(data) {
		console.log(data);
	},

});
kv.setDatas(DATA);
kv.getDatas();

```

## License

Khiops visualization & covisualization webcomponents is available under the [BSD 3-Clause Clear License](LICENSE).
