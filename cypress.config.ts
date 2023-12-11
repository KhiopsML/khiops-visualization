import { defineConfig } from "cypress";

export default defineConfig({
	e2e: {
		baseUrl: "http://localhost:4200/",
	},

	includeShadowDom: true,
	chromeWebSecurity: false,
	watchForFileChanges: true,
	viewportWidth: 1920, // important to have big screen to prevent hidden texts
	viewportHeight: 1000,
	component: {
		devServer: {
			framework: "angular",
			bundler: "webpack",
		},
		specPattern: "cypress/**/*.cy.ts",
	},
});
