import { defineConfig } from "cypress";

export default defineConfig({
	e2e: {
		baseUrl: "http://localhost:4200/",
	},

	includeShadowDom: true,
	chromeWebSecurity: false,
	watchForFileChanges: true,
	viewportWidth: 3000, // important to have big screen to prevent hidden texts
	viewportHeight: 1500,
	component: {
		devServer: {
			framework: "angular",
			bundler: "webpack",
		},
		specPattern: "cypress/**/*.cy.ts",
	},
});
