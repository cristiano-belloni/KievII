module.exports = function(grunt) {
// var libFiles = ['common.js', 'graphic_elements/**/*.js', 'utilities/**/*.js'];
var libFiles = ['common.js',
		        'version.js',
                'graphic_elements/UIElement.js',
                'graphic_elements/UI.js',
                'graphic_elements/Area.js',
                'graphic_elements/Curve.js',
                'graphic_elements/Bar.js',
                'graphic_elements/Button.js',
                'graphic_elements/Background.js',
                'graphic_elements/ClickBar.js',
                'graphic_elements/Gauge.js',
                'graphic_elements/Grid.js',
                'graphic_elements/Knob.js',
                'graphic_elements/Label.js',
                'graphic_elements/RotKnob.js',
                'graphic_elements/Slider.js',
                'graphic_elements/Wavebox.js',
                'graphic_elements/extras/CurveEditor.js',
                'graphic_elements/extras/AreaEditor.js',
                'graphic_elements/extras/BarSelect.js',
                'graphic_elements/engines/EngineFactory.js',
                'graphic_elements/engines/CanvasUtils.js',
                'comm/osc.js',
                'comm/OSCHandler.js',
                'utilities/Utilities.js',
		        'amd.js'
                ];
var thirdParty = ['third_part/hammer.js/hammer.js'];

var allFiles = libFiles.concat(thirdParty);

  grunt.loadNpmTasks('grunt-strip');

  // Project configuration.
  grunt.initConfig({
    lint: {
      all: libFiles
    },
    jshint: {
      options: {
        browser: true,
        smarttabs: true,
      }
    },
   concat: {
    dist: {
      src: allFiles,
      dest: 'dist/kievII.js'
    }
   },
   min: {
    dist: {
      src: 'dist/kievII.js',
      dest: 'dist/kievII.min.js'
    }
  },
  uglify: {
    mangle: {toplevel: false},
    squeeze: {dead_code: false},
    codegen: {quote_keys: true}
  },
  strip : {
  main : {
    src : 'dist/kievII.js',
    dest : 'dist/kievII.js',
  }
}
   
  });

  // Default task.
  grunt.registerTask('default', 'lint concat min');
  
  grunt.registerTask('release', 'lint concat strip min');

};
