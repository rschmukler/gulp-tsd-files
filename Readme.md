# gulp-tsd-files

Add ES6 modularized typescript definition files for your TS project.

## Install

```
npm install gulp-tsd-files
```

## Usage

```js
var ts = require('gulp-typescript');
var merge = require('merge2');

var modularize = require('gulp-tsd-files');

var pkg = require('package.json');

tsProject = ts.createProject({ declarationFiles: true });

gulp.task('build', function() {
  var tsCompile = gulp.src(TS_PATHS)
    .pipe(ts(tsProject))

  merge(
    tsCompile.js, 
    tsCompile.dts
      .pipe(modularize(pkg.name))
  ).pipe(
    gulp.dest('built/')
  );
});
```

## Notice

Right now this was released as quickly as possible. It has no configuration, no deep linking, etc. If you want this functionality to be configurable, open an issue.
