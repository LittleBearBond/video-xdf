/**
 * 组件安装
 * npm install gulp-util gulp-imagemin gulp-ruby-sass gulp-minify-css gulp-jshint gulp-uglify gulp-rename gulp-concat gulp-clean gulp-livereload gulp-sourcemaps tiny-lr st --save-dev
 */

// 引入 gulp及组件
var gulp = require('gulp'), //基础库
    imagemin = require('gulp-imagemin'), //图片压缩
    sass = require('gulp-sass'), //sass
    minifycss = require('gulp-minify-css'), //css压缩
    jshint = require('gulp-jshint'), //js检查
    uglify = require('gulp-uglify'), //js压缩
    rename = require('gulp-rename'), //重命名
    concat = require('gulp-concat'), //合并文件
    clean = require('gulp-clean'), //清空文件夹
    sourcemaps = require('gulp-sourcemaps'),
    jpegtran = require('imagemin-jpegtran'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    notify = require('gulp-notify'),
    gutil = require('gulp-util'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

//Gulp 仅有 5 个方法就能组合出你需要的任务流程：task, run, watch, src, dest
var src = './src/';
var destSrc = './dist/';
var logLine = function() {
    Array.prototype.slice.call(arguments).forEach(function(val) {
        console.log('=================' + val + '=================');
    });
};
// HTML处理
gulp.task('html', function() {
    var htmlSrc = src + 'video/video-js-4.12.15/**/*.html',
        htmlDst = destSrc + 'video/';
    return gulp.src(htmlSrc)
        .pipe(gulp.dest(htmlDst));
});

// 样式处理
gulp.task('sass', function() {
    return gulp.src('./src/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('./', {
            includeContent: false,
            sourceRoot: 'source'
        }))
        .pipe(gulp.dest('./src'));
});

// 发布样式处理
gulp.task('publishSass', function() {
    var cssSrc = src + 'video/video-js-4.12.15/**/*.scss',
        cssDst = destSrc + 'video/';

    return gulp.src(cssSrc)
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(gulp.dest(cssDst))
        .pipe(autoprefixer())
        .pipe(gulp.dest(cssDst))
        .pipe(minifycss())
        .pipe(sourcemaps.write('./', {
            includeContent: false,
            sourceRoot: 'source'
        }))
        .pipe(gulp.dest(cssDst));
});

// 图片处理
gulp.task('images', function() {
    var imgSrc = src + 'video/video-js-4.12.15/**/*.+(png|jpg|jpeg|gif)', //*.+(jpeg|jpg|png)'
        imgDst = destSrc + 'video/';

    // 1. 找到图片
    return gulp.src(imgSrc)
        // 2. 压缩图片
        // 只有新的或更动的图片会被压缩
        .pipe(cache(imagemin({
            progressive: true,
            quality: '65-80',
            interlaced: true
        })))
        .on('error', function(e) {
            console.log(e);
        })
        // 3. 另存图片
        .pipe(gulp.dest(imgDst));
});


// js处理
gulp.task('js', function() {
    var jsSrc = src + 'video/video-js-4.12.15/**/*.js',
        jsDst = destSrc + 'video/';

    return gulp.src(jsSrc)
        //.pipe(jshint('.jshintrc'))
        .on('error', function(e) {
            console.log(e);
        })
        .on('error', gutil.log)
        //.pipe(jshint.reporter('default'))
        .pipe(gulp.dest(jsDst))
        // .pipe(rename({
        //     suffix: '.min'
        // }))
        .pipe(uglify())
        .pipe(gulp.dest(jsDst));
});

// 清空图片、样式、js
gulp.task('clean', function() {
    //*.* 记住这个
    return gulp.src([destSrc + 'video/**/*.*'], {
            read: false //file.contents 会返回空值（null），并不会去读取文件
        })
        .pipe(clean());
});

// web服务 Server + watching scss/js files
gulp.task('web-server', function() {
    browserSync.init({
        server: './src/video/video-js-4.12.15/test-page/',
        index: 'index.html',
        port: 3000,
        /*ui: {
            port: 8080
        },*/
        logLevel: 'debug',
        logPrefix: 'bear',
        open: true,
        logConnections: true,
        //监听文件
        files: [src + '**/*.js', src + '**/*.css', src + '**/*.html'] //监控变化
    });
});

// 监听任务 运行语句 gulp watch
gulp.task('watch', /*['web-server'], */ function() {
    // 监听css
    gulp.watch(src + '**/*.scss', function() {
        logLine(arguments[0].path);
        gulp.run('sass');
    });
});

//gulp.task('bulid', ['clean','publishSass', 'js', 'images']); 这样写不靠谱，必须要先清理完毕在执行其他任务
gulp.task('bulid', ['clean'], function() {
    var startTime = +new Date();
    gulp.start('publishSass', 'js', 'images', 'html', function() {
        logLine('bulid ok !', '耗时：' + ((+new Date()) - startTime) / 1000) + 's';
    });
});

gulp.task('default', ['watch'], function() {
    logLine('start watch …………');
});
