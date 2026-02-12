#!/bin/bash

DIST_DIR="dist/khiops-webcomponent"

# Function to process bundle after Angular build
process_bundle() {
    if [ -f "$DIST_DIR/main.js" ] && [ -f "$DIST_DIR/styles.css" ]; then
        # Convert CSS to JS
        node ./scripts/wrap-css.js "$DIST_DIR/styles.css" "$DIST_DIR/styles.js" 2>/dev/null
        
        # Replace --mdc- with --mdc-v2- for color keys
        sed -i -E 's/(--mdc-[^:]*color[^:]*)([^\w-]|:)/--mdc-v2-\1\2/g' "$DIST_DIR/main.js"
        
        # Bundle all files
        cat "$DIST_DIR/polyfills.js" "$DIST_DIR/styles.js" "$DIST_DIR/main.js" > "$DIST_DIR/khiops-webcomponents.bundle.js"
        
        echo "✅ Bundle updated!"
    fi
}

# Watch for main.js changes and process bundle
watch_and_process() {
    LAST_HASH=""
    while true; do
        if [ -f "$DIST_DIR/main.js" ]; then
            CURRENT_HASH=$(stat -c %Y "$DIST_DIR/main.js" 2>/dev/null || stat -f %m "$DIST_DIR/main.js" 2>/dev/null)
            if [ "$CURRENT_HASH" != "$LAST_HASH" ]; then
                LAST_HASH="$CURRENT_HASH"
                sleep 0.5  # Small delay to ensure file is fully written
                process_bundle
            fi
        fi
        sleep 1
    done
}

# Start watcher in background
watch_and_process &
WATCHER_PID=$!
trap "kill $WATCHER_PID 2>/dev/null" EXIT

# Start Angular build in watch mode
ng build khiops-webcomponent --single-bundle --configuration=development --source-map --watch
