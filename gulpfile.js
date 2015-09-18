/**
 * 组件安装
 * npm install gulp-util gulp-imagemin gulp-ruby-sass gulp-minify-css gulp-jshint gulp-uglify gulp-rename gulp-concat gulp-clean gulp-livereload gulp-sourcemaps tiny-lr st --save-dev
 */

// 引入 gulp及组件
var gulp = require('gulp'), //基础库
    imagemin = require('gulp-imagemin'), //图片压缩
    rubySass = require('gulp-ruby-sass'), //sass
    sass = require('gulp-sass'), //sass
    minifycss = require('gulp-minify-css'), //css压缩
    jshint = require('gulp-jshint'), //js检查
    uglify = require('gulp-uglify'), //js压缩
    rename = require('gulp-rename'), //重命名
    concat = require('gulp-concat'), //合并文件
    clean = require('gulp-clean'), //清空文件夹
    livereload = require('gulp-livereload'), //livereload
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    jpegtran = require('imagemin-jpegtran'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    notify = require('gulp-notify'),
    autoprefixer = require('gulp-autoprefixer');

//Gulp 仅有 5 个方法就能组合出你需要的任务流程：task, run, watch, src, dest
var src = './src/';
var destSrc = './dist/';

// HTML处理
gulp.task('html', function() {
    var htmlSrc = src + '*.html',
        htmlDst = destSrc;

    return gulp.src(htmlSrc)
        .pipe(gulp.dest(htmlDst));
});


// 样式处理
gulp.task('sass', function() {
    var cssSrc = './src/video/video-js-4.12.15/video-js-xdf/'; //src + '*.scss',

    /*// gulp-ruby-sass: 0.7.1
    gulp.task('sass', function() {
        return gulp.src('path/to/scss')
            .pipe(sass({ style: 'expanded' }))
            .pipe(gulp.dest('path/to/css'));
    });

    // gulp-ruby-sass: 1.x
    gulp.task('sass', function() {
        return sass('path/to/scss', { style: 'expanded' })
            .pipe(gulp.dest('path/to/css'));
    });*/

    /*return rubySass(cssSrc + 'video-xdf.scss', {
            // precision: 6,
            // stopOnError: true,
            // cacheLocation: './',
            // loadPath: ['library', '../../shared-components']
            style: 'expanded',
            sourcemap: true
        })
        .on('error', rubySass.logError)
        // For inline sourcemaps
        .pipe(sourcemaps.write())
        // For file sourcemaps
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('maps', {
            includeContent: false,
            sourceRoot: 'source'
        }))
        // .pipe(rename({
        //     suffix: '.min'
        // }))
        // .pipe(minifycss())
        .pipe(gulp.dest(cssSrc))
        // .pipe(notify({
        //     message: 'sass ok !'
        // }));*/
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

// 样式处理
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

// 任务：压缩jpg
//gulp.task('jpgmin',function(){
//    return gulp.src('images/**/*.jpg')
//           .pipe(imagemin({
//                progressive: true,
//                use:[jpegtran()]
//           }))
//           .pipe(gulp.dest(destSrc + 'images/'));
//});

// 任务：压缩png
//gulp.task('pngmin',function(){
//    return gulp.src('images/**/*.png')
//           .pipe(imagemin({
//                quality: '65-80',
//                speed: 4,
//                use:[pngquant()]
//           }))
//           .pipe(gulp.dest(destSrc + 'images/'));
//});

// js处理
gulp.task('js', function() {
    var jsSrc = src + 'video/video-js-4.12.15/**/*.js',
        jsDst = destSrc + 'video/';

    return gulp.src(jsSrc)
        //.pipe(jshint('.jshintrc'))
        .on('error', function(e) {
            console.log(e);
        })
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



gulp.task('default', ['watch']);

//gulp.task('bulid', ['clean','publishSass', 'js', 'images']); 这样写不靠谱，必须要先清理完毕在执行其他任务
gulp.task('bulid', ['clean'], function() {
    gulp.start('publishSass', 'js', 'images');
    //console.log('=================bulid ok !=================')
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
        console.dir(arguments[0].path)
        gulp.run('sass');
    });
});
