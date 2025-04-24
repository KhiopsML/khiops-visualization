const gulp = require('gulp');
const ts = require('gulp-typescript');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const mergeStream = require('ordered-read-streams');
const del = require('del');
const webpack = require('webpack-stream');

// commonjs lib (hypertree)
const projectname = 'd3-hypertree';

const paths = {
  src: './src/',
  dist: './dist/',
};

const files = {
  darkcss: projectname + `-dark.css`,
  lightcss: projectname + `-light.css`,
  mainjs: projectname + `.js`,
};

// Clean task
const clean = () => del(['dist/**/*']);

// SCSS compilation
const scss = (t) =>
  gulp
    .src(paths.src + `**/*${t}.scss`)
    .pipe(plumber())
    .pipe(sass())
    .pipe(concat(files[t + 'css']))
    .pipe(gulp.dest(paths.dist));

const sassTask = () => mergeStream([scss('light'), scss('dark')]);

// TypeScript compilation
const tsc = () => {
  const tsResult = gulp
    .src(paths.src + '**/*.ts')
    .pipe(plumber())
    .pipe(ts.createProject(require('./tsconfig').compilerOptions)());

  return mergeStream([
    tsResult.dts.pipe(gulp.dest(paths.dist + 'd/')),
    tsResult.js.pipe(gulp.dest(paths.dist + 'js/')),
  ]);
};

// Webpack bundling
const webpackTask = () => {
  return new Promise((resolve, reject) => {
    gulp
      .src(paths.dist + 'js/' + files.mainjs)
      .pipe(plumber())
      .pipe(
        webpack({
          mode: 'production', // Set the mode to 'production'
          output: {
            filename: files.mainjs,
            library: 'hyt',
          },
          devtool: 'source-map',
          performance: {
            hints: false, // Disable performance warnings
          },
        }),
      )
      .pipe(gulp.dest(paths.dist))
      .on('end', resolve) // Signal task completion
      .on('error', reject); // Handle errors
  });
};

// Copy DUCD files
const copyducd = () =>
  gulp.src(['src/ducd/**/*']).pipe(gulp.dest('dist/js/ducd'));

// Build task
const build = gulp.series(copyducd, gulp.series(tsc, webpackTask), sassTask);

// Watch task
const watch = () => {
  gulp.watch(paths.src + '**/*.ts', build);
  gulp.watch(paths.src + '**/*.scss', sassTask);
};

// Export tasks
exports.clean = clean;
exports.sass = sassTask;
exports.tsc = tsc;
exports.webpack = webpackTask;
exports.copyducd = copyducd;
exports.build = build;
exports.watch = watch;
exports.default = watch;
