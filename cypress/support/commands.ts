// cypress/support/commands.js

//@ts-ignore
Cypress.Commands.add("loadFile", (file: string) => {
	// Load the visualization page
	cy.visit("/visualization/");

	// Switch to the desired tab (assuming it's the last tab)
	cy.get(".mat-tab-label").last().click();

	// Upload the file
	cy.get("#open-file-input").first().type(file, { force: true });
	cy.get("#open-file-button").first().click({ force: true });
});

