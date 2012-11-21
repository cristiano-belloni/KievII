# grunt-strip

Strip JavaScript nodes (like console.*) out of your source code

## Getting Started
Install this grunt plugin next to your project's [Gruntfile][getting_started] with: `npm install grunt-strip`

Then add this line to your project's Gruntfile:

```javascript
grunt.loadNpmTasks('grunt-strip');
```

[grunt]: https://github.com/cowboy/grunt
[getting_started]: https://github.com/cowboy/grunt/blob/master/docs/getting_started.md

## Configuration

### Basic configuration

The most basic configuration will strip out all calls to 'console.*'

```
strip : {
  main : {
    src : 'src/main.js',
    dest : 'src/main.built.js',
  }
}
```

### Configuring the nodes to strip out

```
strip : {
  main : {
    src : 'src/main.js',
    dest : 'src/main.built.js',
    nodes : ['console','debug']
  }
}
```

### Bulk inline rewrites

You can specify a list of files with the `files` property.

***Warning*** : This **is** a destructive configuration, and you must specify `inline:true`
in order for this command to succeed, otherwise it will fail with a warning message.

This is useful in build steps where your entire source tree is copied over (like with the requirejs r.js optimizer).

```
strip : {
  main : {
    files : 'build/**/*.js',
    inline : true,
    nodes : ['console']
  }
}
```

## How it's done

Right now, the logic consists of a simple replacement of your selected nodes with a falsy statement (0).
This is proving to work in all reasonable situations and alleviates the need for complex rewrite logic.

At some later date that rewrite logic may be important, but the cost vs reward isn't there right now.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## Release History

- 0.1.3 Fixed issues on node 0.6 
- 0.1.0 Initial release. Pulled from the [rcl](http://rcljs.com/) project


## License
Copyright (c) 2012 Jarrod Overson  
Licensed under the MIT license.
