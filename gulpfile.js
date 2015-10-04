/* global require */

(function() {

   'use strict';

   var gulp = require('gulp');
   var browserSync = require('browser-sync');
   var reload = browserSync.reload;

   var settings = {
      serverPort: 8000,
      src: {
         app: 'app',
         scripts: 'app/scripts',
         styles: 'app/styles',
         views: 'app/views'
      }
   };

   gulp.task('default', function(cb) {
      browserSync.init({
         server: {
            baseDir: './'
         },
         notify: false,
         ghostMode: false
      });

      gulp.watch('index.html', reload);
      gulp.watch('src/main.js', reload);
      gulp.watch('src/views/*.js', reload);
   });

})();
