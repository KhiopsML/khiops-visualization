const gulp = require('gulp');
const ts = require('gulp-typescript');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const merge = require('merge2');
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

gulp.task('clean', () => del(['dist/**/*']));
const scss = (t) =>
  gulp
    .src(paths.src + `**/*${t}.scss`)
    .pipe(plumber())
    .pipe(sass())
    .pipe(concat(files[t + 'css']))
    .pipe(gulp.dest(paths.dist));

gulp.task('sass', () => merge([scss('light'), scss('dark')]));

gulp.task('tsc', () => {
  const tsResult = gulp
    .src(paths.src + '**/*.ts')
    .pipe(plumber())
    .pipe(ts.createProject(require('./tsconfig').compilerOptions)());

  return merge([
    tsResult.dts.pipe(gulp.dest(paths.dist + 'd/')),
    tsResult.js.pipe(gulp.dest(paths.dist + 'js/')),
  ]);
});
gulp.task('webpack', gulp.series('tsc'), () =>
  gulp
    .src(paths.dist + 'js/' + files.mainjs)
    .pipe(plumber())
    .pipe(
      webpack({
        output: {
          filename: files.mainjs,
          library: 'hyt',
        },
        devtool: 'source-map',
      }),
    )
    .pipe(gulp.dest(paths.dist)),
);

gulp.task('copyducd', () =>
  gulp.src(['src/ducd/**/*']).pipe(gulp.dest('dist/js/ducd')),
);

gulp.task('build', gulp.series('copyducd', 'webpack', 'sass'));

gulp.task('watch', function (done) {
  gulp.watch(paths.src + '**/*.ts', gulp.series('build'));
  gulp.watch(paths.src + '**/*.scss', gulp.series('sass'));
  done();
});

gulp.task('default', gulp.series('watch'));
