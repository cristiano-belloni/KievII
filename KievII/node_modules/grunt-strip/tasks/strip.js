/*
 * grunt-strip
 * https://github.com/joverson/grunt-strip
 *
 * Copyright (c) 2012 Jarrod Overson
 * Licensed under the MIT license.
 */

'use strict';

var helpers = require('./helpers');

module.exports = function(grunt) {

  grunt.registerMultiTask('strip', 'Strip console and iog logging messages', function() {
    var nodes = ['console'];

    if (this.data.nodes) {
      nodes = this.data.nodes instanceof Array  ? this.data.nodes : [this.data.nodes];
    }

    if (this.data.files) {
      if (!this.data.inline) {
        grunt.log.error('WARNING : POTENTIAL CODE LOSS.'.yellow);
        grunt.log.error('You must specify "inline : true" when using the "files" configuration.');
        grunt.log.errorlns(
          'This WILL REWRITE FILES WITHOUT MAKING BACKUPS. Make sure your ' +
            'code is checked in or you are configured to operate on a copied directory.'
        );
        return;
      }
      var files = grunt.file.expandFiles(this.data.files);
      files.forEach(function(file) {
        stripSource(file,file,nodes);
      });
    } else {
      var file = this.file.src,
        dest = this.file.dest;
      stripSource(file,dest,nodes);
    }
  });

  function stripSource(file,dest, nodes) {
    var src = grunt.file.read(file),
      output = stripNodes(src,nodes);

    return grunt.file.write(dest,output);
  }

  function stripNodes(src,nodes) {
    var output = src;
    nodes.forEach(function(node){
      output = helpers.stripNodes(node, output);
    });
    return output;
  }

};
