const gulp = require('gulp');
const bs = require('browser-sync').create();

const rootDir = 'app';

gulp.task('reload', function (cb) {
    bs.reload();
    cb();
});

gulp.task('default', function () {
    bs.init({
        server: {
            baseDir: rootDir,
			serveStaticOptions: {
				extensions: ["html"]
			}
        }
    });

    gulp.watch(`${rootDir}/**/*`, [], 'reload');
});
