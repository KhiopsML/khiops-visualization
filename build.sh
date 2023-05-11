cd libs/khiops-hypertree
mkdir -p dist
yarn install
yarn build
cd ../..
ng build khiops-webcomponent --single-bundle
cd dist/khiops-webcomponent
cat polyfills.js styles.js main.js > khiops-webcomponents.bundle.js
