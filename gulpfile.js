'use strict';

/*******************************************************************************
    DEPENDENCIES
*******************************************************************************/


// Load plugins fails with some plugins!
// var $ = require('gulp-load-plugins')();
// instead use fashion style:

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    compass = require('gulp-compass'),
    stylus = require('gulp-stylus'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    jade = require('gulp-jade'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css'),
    minifyHTML = require('gulp-minify-html'),
    imagemin = require('gulp-imagemin'),
    clean = require('gulp-clean'),
    connect = require('gulp-connect'),
    browserify = require('gulp-browserify'),
    rjs = require('gulp-requirejs'),
    cache = require('gulp-cache'),
    jeet = require("jeet"),
    size = require('gulp-size');




/*******************************************************************************
    FILE / PATH / SHIM  CONFIG
*******************************************************************************/

var folders = {
    src: './app',
    dest: './public',
    bower: './app/assets/components',
    tmp: './.tmp',
    sassIncludePaths: ['app/assets/components'],
    componentsPath: 'app/assets/components'
};


var config = {
    shim: {
        jquery: {
            path: folders.bower + '/jquery/dist/jquery.js',
            exports: '$'
        }
    },
    autoprefixer: {
        def: [
            'last 2 version',
            '> 1%',
            'safari 5',
            'ie 8',
            'ie 9',
            'opera 12.1',
            'ios 6',
            'android 4'
        ],
        mobile: [
            'ios 6',
            'android 4'
        ]
    }
};



/*******************************************************************************
    CLEAN DEST TASK
*******************************************************************************/
gulp.task('clean', function() {
    return gulp.src([folders.dest + '/assets/css', folders.dest + '/assets/js', folders.dest + '/assets/images'], {
        read: false
    })
        .pipe(clean());
});


/*******************************************************************************
    CSS TASK
*******************************************************************************/

gulp.task('sass', function() {
    return gulp.src(folders.src + '/assets/scss/style.scss', { read: false })
        .pipe(plumber())
        .pipe(sass({
            includePaths: folders.sassIncludePaths,
            outputStyle: 'expanded'
        }))
        .pipe(autoprefixer.apply(config.autoprefixer.def))
        .pipe(gulp.dest(folders.tmp + '/assets/css'))
        .pipe(size());
});


gulp.task('compass', function() {
    return gulp.src(folders.src + '/assets/scss/*.{scss,sass}')
        .pipe(plumber())
        .pipe(compass({
            // css: folders.src + '/assets/css',
            css: folders.tmp + '/assets/css',
            sass: folders.src + '/assets/scss',
            image: folders.src + '/assets/images',
            javascripts: folders.src + '/assets/js',
            fonts: folders.src + '/assets/fonts',
            import_path: folders.sassIncludePaths
            /*,
            require: ['susy', 'modular-scale']*/
        }))
        .pipe(autoprefixer.apply(config.autoprefixer.def))
        .pipe(gulp.dest(folders.tmp + '/assets/css'));
});


gulp.task('stylus', function() {
    gulp.src(folders.src + '/assets/stylus/*.styl')
        .pipe(plumber())
        .pipe(stylus({
            // set:['compress','linenos'],
            use: ['nib', 'jeet'],
            import: ['nib', 'jeet']
        }))
        .pipe(autoprefixer.apply(config.autoprefixer.def))
        .pipe(gulp.dest(folders.tmp + '/assets/css'));
});

/*******************************************************************************
    JAVASCRIPT TASK
*******************************************************************************/

gulp.task('jshint', function() {
    return gulp.src(folders.src + 'assets/js/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish));
});

gulp.task('js', function() {
    return gulp.src(folders.src + '/assets/js/main.js')
        .pipe(plumber())
        .pipe(browserify({
            insertGlobals: false,
            debug: true,
            shim: config.shim
        }))
        .pipe(rename('app.js'))
        .pipe(gulp.dest(folders.tmp + '/assets/js'))
        .pipe(size());
});



// as an example for requirejs:
gulp.task('requirejs', function() {
    rjs({
        name: 'main',
        baseUrl: folders.src + '/assets/js',
        mainConfigFile: folders.src + '/assets/js/main.js',
        out: 'app.js',
        optimize: 'none',
        generateSourceMaps: true,
        preserveLicenseComments: false,
        useStrict: true,
        wrap: false
    })
        .pipe(gulp.dest(folders.dest + '/assets/js'));


    return gulp.src([folders.componentsPath + '/almond/almond.js', folders.dest + '/assets/js/app.js'], {
        read: false
    })
        .pipe(concat('app.js'))
        .pipe(uglify({
            outSourceMap: true
        }))
        .pipe(gulp.dest(folders.dest + '/assets/js'));
});


/*******************************************************************************
    IMAGES / SPRITE TASK
*******************************************************************************/

gulp.task('images', function() {
    return gulp.src(folders.src + '/assets/images/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(folders.dest + '/assets/images'))
        .pipe(size());
});



/*******************************************************************************
    TEMPLATE TASK
*******************************************************************************/

// Jade
gulp.task('jade', function() {
    return gulp.src(folders.src + '/jade/*.jade')
        .pipe(jade())
        .pipe(gulp.dest(folders.tmp))
        .pipe(size());
});


/*******************************************************************************
    SERVER TASK
*******************************************************************************/

// Connect
gulp.task('connect', connect.server({
    root: [folders.src, folders.tmp],
    port: 9000,
    livereload: true,
    open: {
        // file: 'index.html',
        browser: 'Google Chrome'
    },
}));


// Browser-Sync
gulp.task('browsersync', function() {
    browserSync.init([folders.tmp + '/assets/css', folders.tmp + '/assets/js']);
    /*, {
        proxy: {
            host: 'localhost',
            port: '2368'
        }
    });*/
});



/*******************************************************************************
    BUILD TASK
*******************************************************************************/

gulp.task('default', function() {
    gulp.start('jshint', 'js', 'sass', 'images', 'jade');
});

gulp.task('build', ['clean', 'default'], function() {

    gulp.src(folders.tmp + '/assets/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(folders.dest + '/assets/js'));

    gulp.src(folders.tmp + '/assets/css/**/*.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest(folders.dest + '/assets/css'));

    gulp.src(folders.tmp + '/**/*.{html,shtml,php,xml,json}')
        .pipe(minifyHTML())
        .pipe(gulp.dest(folders.dest))
        .pipe(notify('Build successfull'));
});




// Watch
gulp.task('watch', ['default', 'connect'], function() {
    // Watch for changes in `app` folder
    gulp.watch([
        folders.tmp + '/**/*.{html,shtml,php,xml,json}',
        folders.tmp + '/assets/css/**/*.css',
        folders.tmp + '/assets/js/**/*.js',
        folders.src + '/assets/images/**/*'
    ], function(event) {
        return gulp.src(event.path)
            .pipe(connect.reload());
    });

    // Watch .scss files
    gulp.watch(folders.src + '/assets/scss/**/*.scss', ['sass']);

    // Watch .stylus files
    gulp.watch(folders.src + '/assets/stylus/**/*.styl', ['stylus']);

    // Watch .js files
    gulp.watch(folders.src + '/assets/js/**/*.js', ['js']);

    // Watch image files
    gulp.watch(folders.src + '/assets/images/**/*', ['images']);

    // Watch .jade files
    gulp.watch(folders.src + '/jade/**/*.jade', ['jade']);

});
