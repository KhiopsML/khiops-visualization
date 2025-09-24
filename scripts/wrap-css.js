// Import the 'fs' module for file system operations
const fs = require("fs");

// Check if the required arguments are provided
if (process.argv.length !== 4) {
	console.error("Usage: node integrateCSS.js cssFile jsFile");
	process.exit(1);
}

// Assign command line arguments to variables
const cssFile = process.argv[2];
const jsFile = process.argv[3];

// Read the content of the CSS file
fs.readFile(cssFile, "utf8", (err, cssContent) => {
	if (err) {
		console.error(`Error reading CSS file: ${err.message}`);
		process.exit(1);
	}

	// Create JavaScript script with integrated CSS content
	const jsScript = `
    const styleElement = document.createElement('style');
    styleElement.appendChild(document.createTextNode(\`${cssContent}\`));
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
