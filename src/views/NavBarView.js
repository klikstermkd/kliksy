define(function(require, exports, module) {

   var View = require('famous/core/View');
   var Surface = require('famous/core/Surface');
   var StateModifier = require('famous/modifiers/StateModifier');
   var ImageSurface = require('famous/surfaces/ImageSurface');

   function NavBarView() {
      View.apply(this, arguments);

      _createNavBar.call(this);
   }

   NavBarView.prototype = Object.create(View.prototype);
   NavBarView.prototype.constructor = NavBarView;

   NavBarView.DEFAULT_OPTIONS = {
      access_token: window.localStorage.getItem('access_token')
   };

   function _createNavBar() {
         
      var background = new Surface({
         properties: {
            backgroundColor: '#0F0F0A'
         }
      });

      var backgroundModifier = new StateModifier({
         size: [70, undefined],
         align: [0, 0]
      });

      this.add(backgroundModifier).add(background);

      $.ajax({url: 'https://api.instagram.com/v1/users/self?access_token=' + this.options.access_token, dataType: 'jsonp'})
      .done(function(data) {

         var profileButtonModifier = new StateModifier({
            align: [0, 0],
         });

         var profileButton = new ImageSurface({
            content: data.data.profile_picture,
            size: [40, 40],
            properties: {
               borderRadius: '40px',
               marginLeft: '15px',
               marginTop: '35px'
            }
         });

         this.add(profileButtonModifier).add(profileButton);
      }.bind(this));

      var homeButtonModifier = new StateModifier({
         size: [40, null],
         align: [0, 0.35],
      });

      var homeButton = new Surface({
         properties: {
            color: '#fff',
            fontSize: '30px',
            marginLeft: '20px'
         },
         classes: ['fa', 'fa-home']
      });

      homeButton.on('touchend', function() {
         window.location.reload();
      });

      this.add(homeButtonModifier).add(homeButton);

      var heartButtonModifier = new StateModifier({
         size: [40, null],
         align: [0, 0.35],
      });

      var heartButton = new Surface({
         properties: {
            color: '#3F3F3B',
            fontSize: '30px',
            marginLeft: '20px',
            marginTop: '70px'
         },
         classes: ['fa', 'fa-heart']
      });

      this.add(heartButtonModifier).add(heartButton);

      var starButtonModifier = new StateModifier({
         size: [40, null],
         align: [0, 0.35],
      });

      var starButton = new Surface({
         properties: {
            color: '#3F3F3B',
            fontSize: '30px',
            marginLeft: '20px',
            marginTop: '140px'
         },
         classes: ['fa', 'fa-star']
      });

      this.add(starButtonModifier).add(starButton);

      var exploreButtonModifier = new StateModifier({
         size: [40, null],
         align: [0, 0.35],
      });

      var exploreButton = new Surface({
         properties: {
            color: '#3F3F3B',
            fontSize: '30px',
            marginLeft: '20px',
            marginTop: '210px'
         },
         classes: ['fa', 'fa-compass']
      });

      this.add(exploreButtonModifier).add(exploreButton);

      var searchButtonModifier = new StateModifier({
         size: [40, null],
         align: [0, 0.35],
      });

      var searchButton = new Surface({
         properties: {
            color: '#3F3F3B',
            fontSize: '30px',
            marginLeft: '20px',
            marginTop: '280px'
         },
         classes: ['fa', 'fa-search']
      });

      this.add(searchButtonModifier).add(searchButton);

      var settingsButtonModifier = new StateModifier({
         size: [40, null],
         align: [0, 0.9],
      });

      var settingsButton = new Surface({
         properties: {
            color: '#3F3F3B',
            fontSize: '30px',
            marginLeft: '20px'
         },
         classes: ['fa', 'fa-cog']
      });

      this.add(settingsButtonModifier).add(settingsButton);

      var logoutButtonModifier = new StateModifier({
         size: [40, null],
         align: [0, 0.9],
      });

      var logoutButton = new Surface({
         properties: {
            color: '#3F3F3B',
            fontSize: '30px',
            marginLeft: '20px',
            marginTop: '50px'
         },
         classes: ['fa', 'fa-sign-out']
      });

      logoutButton.on('touchstart', function() {
         window.location.href = 'http://klikster.info/kliksy#logout';
         window.location.reload();
      }.bind(this));

      this.add(logoutButtonModifier).add(logoutButton);
   }   

   module.exports = NavBarView;
});
