//See http://blog.millermedeiros.com/node-js-as-a-build-script/

// settings
var FILE_ENCODING = 'utf-8',
    EOL = '\n',
	COMPILER_JAR = '~/hd2/closure_compiler/compiler.jar',
    DIST_FILE_PATH = './kievII.js',
    DIST_UGLY_FILE_PATH = './kievII.min.js',
    DIST_CLOSURE_FILE_PATH = './kievII.min_cl.js',
	FILES = [ 	'common.js',
			'graphic_elements/UIElement.js',
    			'graphic_elements/UI.js',
    			'graphic_elements/Curve.js',
    			'graphic_elements/Bar.js',
    			'graphic_elements/Button.js',
    			'graphic_elements/Background.js',
    			'graphic_elements/Band.js',
    			'graphic_elements/Grid.js',
    			'graphic_elements/Knob.js',
    			'graphic_elements/Label.js',
    			'graphic_elements/RotKnob.js',
    			'graphic_elements/Slider.js',
    			'graphic_elements/Wavebox.js',
    			'graphic_elements/engines/EngineFactory.js',
    			'graphic_elements/engines/CanvasUtils.js',
    			'utilities/Utilities.js',
    		]

// setup
var _fs = require('fs');
var _exec = require('child_process').exec;

function concat(fileList, distPath) {
    var out = fileList.map(function(filePath){
            return _fs.readFileSync(filePath, FILE_ENCODING);
        });
    _fs.writeFileSync(distPath, out.join(EOL), FILE_ENCODING);
    console.log(' '+ distPath +' built.');
}

function uglify(srcPath, distPath) {
    var
      uglyfyJS = require('uglify-js'),
      jsp = uglyfyJS.parser,
      pro = uglyfyJS.uglify,
      ast = jsp.parse( _fs.readFileSync(srcPath, FILE_ENCODING) );

    ast = pro.ast_mangle(ast);
    ast = pro.ast_squeeze(ast);

    _fs.writeFileSync(distPath, pro.gen_code(ast), FILE_ENCODING);
    console.log(' '+ distPath +' built.');
}

function compile(srcPath, distPath) {
    // exec is asynchronous
    _exec(
      'java -jar '+ COMPILER_JAR +' --js '+ srcPath +' --js_output_file '+ distPath,
      function (error, stdout, stderr) {
        if (error) {
          console.log(stderr);
        } else {
            console.log(' '+ distPath + ' built.');
        }
      }
    );
}
 
concat(FILES, DIST_FILE_PATH);
uglify(DIST_FILE_PATH, DIST_UGLY_FILE_PATH);
compile(DIST_FILE_PATH, DIST_CLOSURE_FILE_PATH);
