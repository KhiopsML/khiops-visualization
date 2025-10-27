# Commands

## Interactive mode to select updates

```bash
yarn upgrade-interactive
```

## View outdated packages

```bash
yarn outdated
```

## Remove unused dependencies

```bash
npx depcheck
```

## Analyze duplications

```bash
npx jscpd -r html --pattern 'src/app/**/*.ts' .
```

## Generate the size report

```bash
yarn build --configuration production --stats-json
```

### Then analyze with

```bash
npx webpack-bundle-analyzer dist/visualization-component/stats.json
```

npx webpack-bundle-analyzer dist/visualization-component/stats.json
