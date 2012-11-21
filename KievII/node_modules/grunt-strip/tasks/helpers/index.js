var grunt = require('grunt'),
    falafel = require('falafel'),
    fs = require('fs');

exports.stripNodes = function(nodeName, file, dest) {
  "use strict";

  var existsSync = fs.existsSync || require('path').existsSync;

  var src = existsSync(file) ? grunt.file.read(file) : file;

  var output = falafel(src, function(node){
    if (
        node.type === 'CallExpression' &&
        node.callee.object && node.callee.object.name === nodeName
      ) {
      node.update('0');
    }
  });

  if (dest) {
    return grunt.file.write(dest, output);
  } else {
    return output.toString();
  }
};

