# Quick build script for Windows PowerShell
# Alternative to quickbuild.sh for Windows environments

npx ng build khiops-webcomponent --single-bundle

# extractCss is deprecated with new Angular version so we need to convert styles manually
# https://github.com/angular/angular-cli/issues/22198
node ./scripts/wrap-css.js dist/khiops-webcomponent/styles.css dist/khiops-webcomponent/styles.js

Set-Location "dist/khiops-webcomponent"

# Replace all occurences of --mdc- into main.js file with --mdc-v2- when color is found into the key
# PowerShell equivalent of: sed -i -E 's/(--mdc-[^:]*color[^:]*)([^\w-]|:)/--mdc-v2-\1\2/g' main.js
(Get-Content main.js -Raw) -replace '(--mdc-[^:]*color[^:]*)([^\w-]|:)', '--mdc-v2-$1$2' | Set-Content main.js -NoNewline

Get-Content polyfills.js, styles.js, main.js -Raw | Set-Content khiops-webcomponents.bundle.js -NoNewline

Write-Host "Quick build completed successfully!"
Write-Host "Output: khiops-webcomponents.bundle.js"

Set-Location "../.."