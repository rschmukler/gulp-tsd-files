var path = require('path');
var through2 = require('through2');
var gutil = require('gulp-util');

var fs = require('fs');

module.exports = function(moduleName, opts) {
  opts = opts || {indent: '  '};
  return through2.obj(function(file, enc, next) {
    var isRootIndex = (new RegExp(file.base + path.sep + 'index.d.ts'));

    var out = [];
    if (isRootIndex.test(file.path)) {
      out = getLines(file, opts);
      modularize(moduleName, out);
    } else {
      out = getLines(file, opts);
      modularize(moduleName + '/' + file.relative.replace('.d.ts', ''), out);
    }
    file.contents = new Buffer(out.join('\n'));
    this.push(file);
    next();
  }, function(done) {
    var self = this;
    fs.readFile('typings/tsd.d.ts', function(err, contents) {
      if (err) return done(err);
      var lines = contents.toString().split('\n');
      var filesToLoad = lines.filter(function(l) { return l; })
        .map(function(line) {
          var match = line.match(/path="(.*)"/);
          return match && match[1];
        }).filter(function(l) { return l; });

      var buffer = [];

      var pending = filesToLoad.length;
      if (!pending) return done();
      filesToLoad.forEach(function(file) {
        fs.readFile('typings/' + file, addToBuffer);
      });

      function addToBuffer(err, contents) {
        if (err) return done(err);
        buffer = buffer.concat(contents.toString().split('\n'));
        if (!--pending) {
          self.push(new gutil.File({
            base: path.join(process.cwd(), 'typings'),
            path: path.join(process.cwd(), 'typings', 'tsd.d.ts'),
            cwd: process.cwd(),
            contents: new Buffer(buffer.join('\n'))
          }));
          done();
        }
      }

    });
  });

  function modularize(name, lines) {
      lines.unshift('declare module \'' + name + '\' {');
      lines.push('}');
  }

  function getLines(file) {
    var contents = file.contents.toString();

    var baseDir = path.dirname(file.relative);

    var line;
    var lines = contents.toString().split('\n');
    var out = [];
    for (var i = 0; i < lines.length; ++i) {
      line = lines[i];
      if ((/\/\/\//).test(line)) { continue; }

      var relativePath = line.match(/(\.?\.\/.*)'/);
      if (relativePath) {
        var replacePath = path.join(moduleName, baseDir, relativePath[1]);
        line = line.replace(relativePath[1], replacePath);
      }

      line = line.replace(/declare /g, '');
      out.push(opts.indent + line);
    }
    return out;
  }
};

