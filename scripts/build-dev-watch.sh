#!/bin/bash

DIST_DIR="dist/khiops-webcomponent"

# Function to process bundle after Angular build
process_bundle() {
    if [ -f "$DIST_DIR/main.js" ] && [ -f "$DIST_DIR/styles.css" ]; then
        # Convert CSS to JS (only if newer than styles.js)
        if [ ! -f "$DIST_DIR/styles.js" ] || [ "$DIST_DIR/styles.css" -nt "$DIST_DIR/styles.js" ]; then
            node ./scripts/wrap-css.js "$DIST_DIR/styles.css" "$DIST_DIR/styles.js" 2>/dev/null
        fi
        
        # Replace --mdc- with --mdc-v2- for color keys (in-place, fast)
        sed -i -E 's/(--mdc-[^:]*color[^:]*)([^\w-]|:)/--mdc-v2-\1\2/g' "$DIST_DIR/main.js"
        
        # Bundle all files (fast concatenation)
        cat "$DIST_DIR/polyfills.js" "$DIST_DIR/styles.js" "$DIST_DIR/main.js" > "$DIST_DIR/khiops-webcomponents.bundle.js"
        
        echo "✅ Bundle updated in $(date +%H:%M:%S)"
    fi
}

# Watch for main.js changes with debouncing
watch_and_process() {
    LAST_HASH=""
    PROCESSING=0
    
    while true; do
        if [ -f "$DIST_DIR/main.js" ]; then
            CURRENT_HASH=$(stat -c %Y "$DIST_DIR/main.js" 2>/dev/null || stat -f %m "$DIST_DIR/main.js" 2>/dev/null)
            
            if [ "$CURRENT_HASH" != "$LAST_HASH" ] && [ $PROCESSING -eq 0 ]; then
                LAST_HASH="$CURRENT_HASH"
                PROCESSING=1
                
                # Wait for file to stabilize (debounce multiple writes)
                sleep 0.3
                
                # Check if hash changed again during debounce
                NEW_HASH=$(stat -c %Y "$DIST_DIR/main.js" 2>/dev/null || stat -f %m "$DIST_DIR/main.js" 2>/dev/null)
                if [ "$NEW_HASH" = "$CURRENT_HASH" ]; then
                    process_bundle
                fi
                
                PROCESSING=0
            fi
        fi
        sleep 0.5  # Faster polling
    done
}

# Start watcher in background
watch_and_process &
WATCHER_PID=$!
trap "kill $WATCHER_PID 2>/dev/null" EXIT

# Start Angular build in watch mode with faster incremental builds
ng build khiops-webcomponent --single-bundle --configuration=development --source-map=false --optimization=false --build-optimizer=false --aot=false --watch --poll=1000
