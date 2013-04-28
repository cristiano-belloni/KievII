module.exports = function(grunt) {
var before = ['common.js'];
var after = ['amd.js'];
var libFiles = ['version.js',
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
		        ];

var allFiles = before.concat(libFiles, after);

  grunt.loadNpmTasks('grunt-strip');

  // Project configuration.
  grunt.initConfig({
    lint: {
      all: libFiles
    },
   concat: {
    dist: {
      src: allFiles,
      dest: 'dist/kievII.js'
    }
   },
    jshint: {
        beforeconcat: libFiles,
        afterconcat: ['dist/kievII.js'],
          options: {
              browser: true,
              smarttabs: true,
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
  grunt.registerTask('default', 'concat lint min');
  
  grunt.registerTask('release', 'concat lint strip min');

};
