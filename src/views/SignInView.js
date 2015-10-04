define(function(require, exports, module) {

   var View = require('famous/core/View');
   var Surface = require('famous/core/Surface');
   var StateModifier = require('famous/modifiers/StateModifier');
   var FlexScrollView = require('famous-flex/FlexScrollView');
   var CollectionLayout = require('famous-flex/layouts/CollectionLayout');
   var Timer = require('famous/utilities/Timer');
   var ImageSurface = require('famous/surfaces/ImageSurface');
   var ContainerSurface = require('famous/surfaces/ContainerSurface');

   function SignInView() {
      View.apply(this, arguments);

      _createSignInView.call(this);
   }

   SignInView.prototype = Object.create(View.prototype);
   SignInView.prototype.constructor = SignInView;

   SignInView.DEFAULT_OPTIONS = {
      access_token: window.localStorage.getItem('access_token'),
   };

   function _createSignInView() {

      var scrollView = new FlexScrollView({
        autoPipeEvents: true,
          layout: CollectionLayout,
          layoutOptions: {
              itemSize: [241, 241],
              margins: [10, 0, 0, 13],
              spacing: 10
          }
      });

      var background = new Surface({
         properties: {
            backgroundColor: '#0F0F0A',
            zIndex: 2
         }
      });

      var backgroundModifier = new StateModifier({
         opacity: 0.85
      });
      
      background.pipe(scrollView);

      this.add(backgroundModifier).add(background);

      var logoTextModifier = new StateModifier({
         size: [240, null],
         align: [0.5, 0],
         origin: [0.5, 0]
      });

      var logoText = new Surface({
         content: 'kliksy',
         properties: {
            color: '#fff',
            textAlign: 'center',
            font: '70px Helvetica',
            marginTop: '180px',
            zIndex: 2
         }
      });

      this.add(logoTextModifier).add(logoText);

      var signInButtonContainer = new ContainerSurface({
         properties: {
            color: '#fff',
            backgroundColor: '#3f729b',
            padding: '16px',
            borderRadius: '5px',
            textAlign: 'center',
            font: '18px Helvetica',
            zIndex: 2
         }
      });

      var signInButtonContainerModifier = new StateModifier({
         size: [302, 70],
         align: [0.5, 0.5],
         origin: [0.5, 0.5]
      });

      var signInButtonIcon = new Surface({
         content: '<i class="fa fa-instagram"></i>',
         properties: {
            color: '#fff',
            fontSize: '42px',
            marginLeft: '-113px',
            marginTop: '-6px'
         }
      });

      signInButtonContainer.add(signInButtonIcon);

      var signInButtonText = new Surface({
         content: 'Sign in with Instagram',
         properties: {
            color: '#fff',
            fontSize: '18px',
            marginLeft: '25px',
            marginTop: '8px'
         }
      });

      signInButtonContainer.add(signInButtonText);

      signInButtonContainer.on('touchend', function() {
         window.location = 'https://instagram.com/oauth/authorize/?client_id=a99edf81ee0a40429cb0aca9bbadc354&redirect_uri=http://klikster.info/kliksy&response_type=token';
      });

      this.add(signInButtonContainerModifier).add(signInButtonContainer);

      var surfaces = [];
      var isScrolling = true;

      background.on('touchmove', function(data) {
         isScrolling = false;
      });

      scrollView.on('scroll', function(data) {
         if (Math.abs((Math.abs(data.scrollOffset) - Math.abs(data.oldScrollOffset))) < 0.6) {
            isScrolling = true;
         }
      });

      Timer.setInterval(function() {
         if (isScrolling) {
            scrollView.scroll(-0.6);
         };
      }, 1)

      var imagepos = 1;

      for(var i = 0; i < 500; i++) {
         var media = new ImageSurface({
            content: 'http://klikster.info/kliksy/images/samples/' + imagepos + '.jpg',
            properties: {
               border: '1px solid black'
            }
         });
            
         surfaces.push(media);

         if (imagepos === 19) {
            imagepos = 0;
         }

         imagepos++;
      }

      scrollView.sequenceFrom(surfaces);

      this.add(scrollView);
   }

   module.exports = SignInView;
});
