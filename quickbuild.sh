
ng build khiops-webcomponent --single-bundle

# extractCss is deprecated with new Angular version so we need to convert styles manually
# https://github.com/angular/angular-cli/issues/22198
node wrap-css.js dist/khiops-webcomponent/styles.css dist/khiops-webcomponent/styles.js

cd dist/khiops-webcomponent
cat polyfills.js styles.js main.js > khiops-webcomponents.bundle.js
