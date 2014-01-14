module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: {
      install: {
         //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
      }
    },
    // UGLIFY TASK
    uglify: {
      task1: {
         options: {
            preserveComments: 'some',
            report: 'min',
            banner: '/** \n* @license <%= pkg.name %> - v<%= pkg.version %>\n' + 
             '* (c) 2013 Julien VALERY https://github.com/darul75/ng-prettyjson\n' +
             '* License: MIT \n**/\n'
         },         
         files: {
             'dist/public/javascripts/planetaryjs-twitter.min.js': ['public/javascripts/planetaryjs-twitter.js'],
             'dist/public/javascripts/planetaryjs.min.js': ['public/javascripts/planetaryjs.js']
         }
       }
     },
     // MINIFY CSS
    cssmin: {
      options: {
        keepSpecialComments: false,
        banner: '/** \n* @license <%= pkg.name %> - v<%= pkg.version %>\n' + 
             '* (c) 2013 Julien VALERY https://github.com/darul75/ng-prettyjson\n' +
             '* License: MIT \n**/\n'
      },
      compress: {
        files: {          
          'dist/public/stylesheets/stylesheet.min.css': ['public/stylesheets/stylesheet.css']
        }
      }
  },
      // COPY CONTENT
    copy: {
      main: {
        files: [          
          {expand: true, flatten: true, src: ['public/*.json'], dest: 'dist/public/'},
          {expand: true, flatten: true, src: ['views/*.jade'], dest: 'dist/views/'},
          {flatten: true, src: ['app.js'], dest: 'dist/app.js'},
          {flatten: true, src: ['package.json'], dest: 'dist/package.json'}         
        ]
      }
    },
});

  // LOAD PLUGINS
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-karma');
  // copy plugin
  grunt.loadNpmTasks('grunt-contrib-copy');

  // TASK REGISTER
  grunt.registerTask('default', ['cssmin', 'uglify:task1', 'copy']);
};
