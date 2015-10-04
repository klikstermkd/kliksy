define(function(require, exports, module) {

   var View = require('famous/core/View');
   var StateModifier = require('famous/modifiers/StateModifier');
   var ImageSurface = require('famous/surfaces/ImageSurface');

   var SignInView = require('views/SignInView');
   var UserFeedView = require('views/UserFeedView');
   var NavBarView = require('views/NavBarView');

   function AppView() {
      View.apply(this, arguments);

      _authenticate.call(this);
   }

   AppView.prototype = Object.create(View.prototype);
   AppView.prototype.constructor = AppView;

   AppView.DEFAULT_OPTIONS = {};

   function _authenticate() {

      if (window.location.hash.indexOf('access_token') > - 1) {

         var token = window.location.hash.split('=')[1];

         window.localStorage.setItem('access_token', token);
         window.localStorage.setItem('isLoggedIn', '1');
         window.location.href = window.location.href.split('#')[0];

      } else if (window.location.hash.indexOf('logout') > -1) {
         window.localStorage.removeItem('isLoggedIn');

         var logoutImage = new ImageSurface({
            content: 'https://instagram.com/accounts/logout',
            properties: {
               visibility: 'hidden'
            }
         });

         this.add(logoutImage);
      }

      var isLoggedIn = window.localStorage.getItem('isLoggedIn');

      if (isLoggedIn) {
         var navBarView = new NavBarView();
         this.add(navBarView);

         var userFeedView = new UserFeedView();
         this.add(userFeedView);
      } else {
         var signInView = new SignInView();
         this.add(signInView);
      }
   }   

   module.exports = AppView;
});
