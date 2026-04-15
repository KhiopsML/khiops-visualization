const path = require('path');

module.exports = {
  resolve: {
    alias: {
      'dockview-angular': path.resolve(
        __dirname,
        'node_modules/dockview-angular/dist/fesm2022/dockview-angular.mjs',
      ),
    },
  },
};
