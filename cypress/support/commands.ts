// cypress/support/commands.js

//@ts-ignore
Cypress.Commands.add("loadFile", (ctx: string, file: string) => {
	// Load the visualization page
	cy.visit("/" + ctx + "/");

	// Switch to the desired tab (assuming it's the last tab)
	cy.get(".mat-tab-label").last().click();

	// Upload the file
	cy.get("#open-file-input").first().type(file, { force: true });
	cy.get("#open-file-button").first().click({ force: true });
});

//@ts-ignore
Cypress.Commands.add("initViews", () => {
	const viewsLayout = {
		isDimensionsChecked: true,
		isCoocurenceChecked: true,
		dimensionsViewsLayoutsVO: [],
	};

	for (let index = 0; index < 10; index++) {
		viewsLayout.dimensionsViewsLayoutsVO.push({
			isChecked: true,
			isHierarchyChecked: true,
			isClustersChecked: true,
			isAnnotationChecked: true,
			isCompositionChecked: true,
			isExternalDataChecked: true,
			isDistributionChecked: true,
		});
	}

	window.localStorage.setItem(
		"KHIOPS_COVISUALIZATION_VIEWS_LAYOUT",
		JSON.stringify(viewsLayout)
	);
});
