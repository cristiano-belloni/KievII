module.exports = function(grunt) {

    var before = ['pre.js'];
    var after = ['after.js'];
    var libFiles = ['ui/UIElement.js',
                    'ui/UI.js',
                    'ui/Area.js',
                    'ui/Curve.js',
                    'ui/Bar.js',
                    'ui/Button.js',
                    'ui/Background.js',
                    'ui/ClickBar.js',
                    'ui/Gauge.js',
                    'ui/Grid.js',
                    'ui/Knob.js',
                    'ui/Label.js',
                    'ui/RotKnob.js',
                    'ui/Slider.js',
                    'ui/Wavebox.js',
                    'ui/extras/CurveEditor.js',
                    'ui/extras/AreaEditor.js',
                    'ui/extras/BarSelect.js',
                    'ui/engines/EngineFactory.js',
                    'ui/engines/CanvasUtils.js',
                    'comm/osc.js',
                    'comm/OSCHandler.js',
                    'utilities/Utilities.js',
                    ];

    /*var libFiles = ['ui/*.js','ui/extras/*.js', 'ui/engines/*.js', 'comm/*.js', 'utilities/*.js'];*/

    var allFiles = before.concat(libFiles, after);

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-strip');

      // Project configuration.
      grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

       concat: {
        dist: {
          src: allFiles,
          dest: 'dist/<%= pkg.name %>.js'
        }
       },
        jshint: {
            beforeconcat: libFiles,
            afterconcat: ['<%= concat.dist.dest %>'],
              options: {
                  browser: true,
                  smarttabs: true
              }
          },
      uglify: {
          options: {
              // the banner is inserted at the top of the output
              banner: '/*! <%= pkg.name %> v<%= pkg.version %> built on <%= grunt.template.today("dd-mm-yyyy") %> */\n'
          },
          dist: {
              files: {
                  'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
              }
          }
      },
      strip : {
      main : {
        src : '<%= concat.dist.dest %>',
        dest : '<%= concat.dist.dest %>',
      }
    }

      });

      // Default task.
      grunt.registerTask('default', ['concat', 'jshint', 'uglify']);

      grunt.registerTask('release', ['concat', 'jshint', 'strip', 'uglify']);

    };
