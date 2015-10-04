define(function(require, exports, module) {
  
   var Engine = require('famous/core/Engine');
   var FastClick = require('famous/inputs/FastClick');
   var Surface = require('famous/core/Surface');
   var StateModifier = require('famous/modifiers/StateModifier');
   var Transform = require('famous/core/Transform');
   var Lagometer = require('famous-lagometer/Lagometer');
   
   var AppView = require('views/AppView');

   var mainContext = Engine.createContext();

   var lagometerModifier = new StateModifier({
      size: [100, 100],
      align: [1.0, 0.0],
      origin: [1.0, 0.0],
      transform: Transform.translate(-10, 10, 0)
   });

   var lagometer = new Lagometer({
      size: lagometerModifier.getSize() 
   });

/*window.localStorage.removeItem('isLoggedIn');
   window.location.href = 'https://instagram.com/accounts/logout';*/

   // mainContext.add(lagometerModifier).add(lagometer);

   var isIPad = navigator.userAgent.match(/iPad/i) ? true : false;

   if (isIPad) {

      // window.navigator.standalone

      var background = new Surface({
         properties: {
            backgroundColor: '#1F1F14',
            zIndex: '-100'
         }
      });

      mainContext.add(background);

      var text = new Surface({
         content: 'Landscape mode is not yet supported. Switch to portrait.',
         size: [620, null],
         properties: {
            zIndex: '-100',
            font: '24px Helvetica',
            color: 'white'
         }
      });

      var textModifier = new StateModifier({
         align: [0.5, 0.5],
         origin: [0.5, 0.5],
         opacity: 0
      });

      mainContext.add(textModifier).add(text);

      var appView = new AppView();
      mainContext.add(appView);

      if (window.innerHeight < window.innerWidth) {
         background.setProperties({zIndex: '100'});
         text.setProperties({zIndex: '100'});
         textModifier.setOpacity(1);
      } 

      window.addEventListener('orientationchange', function() {
         var deviceOrientation = window.orientation;
         
         if (deviceOrientation == 90 || deviceOrientation == -90) {
            background.setProperties({zIndex: '100'});
            text.setProperties({zIndex: '100'});
            textModifier.setOpacity(1);
         } else {
            background.setProperties({zIndex: '-100'});
            text.setProperties({zIndex: '-100'});
            textModifier.setOpacity(0);
         }

      });
      
   } else {
      var background = new Surface({
         properties: {
            backgroundColor: '#1F1F14',
            zIndex: '100'
         }
      });

      mainContext.add(background);

      var text = new Surface({
         content: 'This app is optimized only for iPad.',
         size: [230, null],
         properties: {
            zIndex: '100',
            font: '15px Helvetica',
            color: 'white'
         }
      });

      var textModifier = new StateModifier({
         align: [0.5, 0.5],
         origin: [0.5, 0.5]
      });

      mainContext.add(textModifier).add(text);
   }

});