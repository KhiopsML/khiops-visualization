cd libs/khiops-hypertree
mkdir -p dist
yarn install
yarn build
cd ../..
ng build khiops-webcomponent --single-bundle

# extractCss is deprecated with new Angular version so we need to convert styles manually
# https://github.com/angular/angular-cli/issues/22198
node ./scripts/wrap-css.js dist/khiops-webcomponent/styles.css dist/khiops-webcomponent/styles.js

cd dist/khiops-webcomponent

# Replace all occurences of --mdc- into main.js file with --mdc-v2- when color is found into the key
# sed -i 's/--mdc-/--mdc-v2-/g' main.js
sed -i -E 's/(--mdc-[^:]*color[^:]*)([^\w-]|:)/--mdc-v2-\1\2/g' main.js

cat polyfills.js styles.js main.js > khiops-webcomponents.bundle.js

$SHELL