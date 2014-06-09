/*
 * grunt-protractor-coverage
 * https://github.com/r3b/grunt-protractor-coverage
 *
 * Copyright (c) 2014 ryan bridges
 * Licensed under the APLv2 license.
 */

'use strict';
var tmp = require('tmp');
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp', 'build', 'instrumented', 'coverage', 'reports'],
    },
    // connect: {
    //   server: {
    //     options: {
    //       port: 3000,
    //       base: 'instrumented/resources/app/angularjs'
    //     }
    //   },
    // },
    // Configuration to be run (and then tested).
    protractor_coverage: {
      options: {
        configFile: "test/protractorConf.js", // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        coverageDir: 'coverage',
        server:{
          port:3000,
          path:'instrumented/angularjs',
        },
        args: {}
      },
      local: {
        options: {
          args: {
            baseUrl: 'http://localhost:3000/',
            // Arguments passed to the command
            'browser': 'chrome'
          }
        }
      },
      remote: {
        options: {
          configFile: "test/protractorConf.remote.js", // Default config file
          args: {
            baseUrl: 'http://localhost:3000/',
            // Arguments passed to the command
            'browser': 'chrome'
          }
        }
      },
    },
    copy: {
      'instrument': {
        files: [{
          src: ['resources/app/**/*', '!resources/app/**/*.js'],
          dest: 'instrumented/'
        }]
      },
    },
    // instrument: {
    //   files: 'resources/app/**/*.js',
    //   options: {
    //     lazy: true,
    //     basePath: "instrumented"
    //   }
    // },
    instrument_app: {
      options: {
        lazy: true,
      },
      test_app:{
        files: [{src:'resources/app',dest:'instrumented'}]
      }
    },
    coverage_report: {
      full:{
        options: {
          type: 'lcov',
          dir: 'reports',
          print: 'detail',
          base: "instrumented"
        },
        files: [{src:'coverage/**/*.json'}]
      },
      summary:{
        options: {
          type: 'text',
        },
        files: [{src:'coverage/**/*.json'}]
      },
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },
    coveralls: {
      main:{
        src: 'reports/**/*.info',
        options: {
          force: true
        },
      },
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-copy');
  // grunt.loadNpmTasks('grunt-contrib-connect');
  // grunt.loadNpmTasks('grunt-istanbul');
  grunt.loadNpmTasks('grunt-coveralls');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'copy', 'instrument_app', 'protractor_coverage:local', 'coverage_report']);
  grunt.registerTask('test-remote', ['clean', 'copy', 'instrument_app', 'protractor_coverage:remote', 'coverage_report']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
