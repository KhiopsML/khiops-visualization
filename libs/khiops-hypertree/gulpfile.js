
var gulp = require('gulp')
var ts = require('gulp-typescript')
const sass = require('gulp-sass')(require('sass'));
// var sass = require('gulp-sass')
var concat = require('gulp-concat')
var plumber = require('gulp-plumber')
var merge = require('merge2')
var del = require('del')
var webpack = require('webpack-stream')

// commonjs lib (hypertree)
var projectname = 'd3-hypertree'
libname = 'hyt'
watchdep = {}
cssimport = {}

var paths = {
    src: './src/',
    dist: './dist/'
}

var files = {
    darkcss: projectname + `-dark.css`,
    lightcss: projectname + `-light.css`,
    mainjs: projectname + `.js`
}



gulp.task('clean', () => del(['dist/**/*']))
var scss = (t) => gulp.src(paths.src + `**/*${t}.scss`) // all *light.scss or *dark.scss
    .pipe(plumber())
    .pipe(sass())
    .pipe(concat(files[t + 'css'])) // files.lightcss or files.darkcss
    .pipe(gulp.dest(paths.dist))

gulp.task('sass', () => merge([scss('light'), scss('dark')]))

gulp.task('tsc', () => {
    var tsResult = gulp.src(paths.src + '**/*.ts')
        .pipe(plumber())
        .pipe(ts.createProject(require('./tsconfig').compilerOptions)())

    return merge([
        tsResult.dts.pipe(gulp.dest(paths.dist + 'd/')),
        tsResult.js.pipe(gulp.dest(paths.dist + 'js/'))
    ])
})
gulp.task('webpack', gulp.series('tsc'), () =>
    gulp.src(paths.dist + 'js/' + files.mainjs)
    .pipe(plumber())
    .pipe(webpack({
        output: {
            filename: files.mainjs,
            library: libname // use hypertree... in browser
        },
        devtool: 'source-map',
    }))
    .pipe(gulp.dest(paths.dist))
)


gulp.task('copyducd', () =>
    gulp.src(['src/ducd/**/*']).pipe(gulp.dest('dist/js/ducd'))
)

gulp.task('build', gulp.series('copyducd', 'webpack', 'sass'))


// gulp.task('watch', gulp.series('build'), () => {
//     // gulp.watch('../ducd-master/dist/ducd.js', gulp.series('build'))
//     gulp.watch(paths.src + '**/*.ts', gulp.series('build'))
//     gulp.watch(paths.src + '**/*.scss', gulp.series('sass'))
// })

gulp.task('watch', function (done) {
    // gulp.watch('ducd/ducd.js', gulp.series('build'))
    gulp.watch(paths.src + '**/*.ts', gulp.series('build'))
    gulp.watch(paths.src + '**/*.scss', gulp.series('sass'))
    done();
})



// ---------------------------------------------------------------------------------------------

// gulp.task('minifyjs', ()=>
//     gulp.src(paths.dist + files.mainjs)
//         .pipe(uglifyjs())
//         .pipe(rename(minfiles.mainjs))
//         .pipe(gulp.dest(paths.dist)))

// gulp.task('minifydarkcss', ()=>
//     gulp.src(paths.dist + files.darkcss)
//         .pipe(uglifycss())
//         .pipe(rename(minfiles.darkcss))
//         .pipe(gulp.dest(paths.dist)))

// gulp.task('minifylightcss', ()=>
//     gulp.src(paths.dist + files.lightcss)
//         .pipe(uglifycss())
//         .pipe(rename(minfiles.lightcss))
//         .pipe(gulp.dest(paths.dist)))

// gulp.task('minify', ['minifyjs', 'minifydarkcss', 'minifylightcss'])
gulp.task('default', gulp.series('watch'))
