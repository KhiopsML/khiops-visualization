# Khiops Visualization Workspace

## Projects

- `khiops-visualization-desktop/` — Electron + Angular desktop app (consumer)
- `visualization-component/` — Angular web component library (producer)

## Critical dependency

`khiops-visualization-desktop` loads the component library directly via a path reference in `angular.json` (dev mode):
`"scripts": ["../visualization-component/dist/khiops-webcomponent/main.js"]`

## Output format

At the end of every response, add a **very short French summary** of what was done, as bullet points.
Each bullet = one concrete action or decision, max 1 line.
Use project abbreviations: KVD (khiops-visualization-desktop), VC (visualization-component), KC (khiops-core).

Example:

- quand un tab est modifié dans KC, il passe à dirty dans KVD
- quand on move ce tab dans une nouvelle instance, j'envoie un `CustomEvent dirty-state-changed` à KC
