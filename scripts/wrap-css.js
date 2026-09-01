// Import the 'fs' module for file system operations
const fs = require("fs");
const path = require("path");

// Check if the required arguments are provided
if (process.argv.length !== 4) {
	console.error("Usage: node integrateCSS.js cssFile jsFile");
	process.exit(1);
}

// Assign command line arguments to variables
const cssFile = process.argv[2];
const jsFile = process.argv[3];

// Guess a mime type from file extension for data URI generation
function getMimeType(ext) {
	const mimeTypes = {
		".woff2": "font/woff2",
		".woff": "font/woff",
		".ttf": "font/ttf",
		".eot": "application/vnd.ms-fontobject",
		".svg": "image/svg+xml",
		".png": "image/png",
		".jpg": "image/jpeg",
		".jpeg": "image/jpeg",
		".gif": "image/gif",
	};
	return mimeTypes[ext] || "application/octet-stream";
}

// Inline local url(...) references (e.g. material-icons fonts) as base64 data
// URIs so the resulting bundle is self-contained and doesn't depend on the
// host app serving separate font files next to the bundle.
function inlineLocalAssets(cssContent, cssDir) {
	return cssContent.replace(
		/url\((['"]?)([^'")]+)\1\)/g,
		(match, quote, url) => {
			if (url.startsWith("data:") || /^https?:\/\//.test(url)) {
				return match;
			}
			const assetPath = path.join(cssDir, url.split("?")[0].split("#")[0]);
			if (!fs.existsSync(assetPath)) {
				return match;
			}
			const ext = path.extname(assetPath).toLowerCase();
			const base64 = fs.readFileSync(assetPath).toString("base64");
			return `url("data:${getMimeType(ext)};base64,${base64}")`;
		},
	);
}

// Read the content of the CSS file
fs.readFile(cssFile, "utf8", (err, cssContent) => {
	if (err) {
		console.error(`Error reading CSS file: ${err.message}`);
		process.exit(1);
	}

	const inlinedCssContent = inlineLocalAssets(cssContent, path.dirname(cssFile));

	// Create JavaScript script with integrated CSS content
	const jsScript = `
    const styleElement = document.createElement('style');
    styleElement.appendChild(document.createTextNode(\`${inlinedCssContent}\`));
    document.getElementsByTagName('head')[0].appendChild(styleElement);
  `;

	// Write the JavaScript script to the destination file
	fs.writeFile(jsFile, jsScript, "utf8", (err) => {
		if (err) {
			console.error(`Error writing to JS file: ${err.message}`);
			process.exit(1);
		}

		console.log("CSS integration completed successfully!");
	});
});
