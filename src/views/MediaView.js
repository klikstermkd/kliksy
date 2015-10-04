define(function(require, exports, module) {

   var View = require('famous/core/View');
   var Surface = require('famous/core/Surface');
   var Transform = require('famous/core/Transform');
   var StateModifier = require('famous/modifiers/StateModifier');
   var BoxView = require('views/BoxView');
   var Timer = require('famous/utilities/Timer');

   function MediaView() {
      View.apply(this, arguments);

      _createBackground.call(this);
      _createLightbox.call(this);
      _createControlButtons.call(this);
   }

   MediaView.prototype = Object.create(View.prototype);
   MediaView.prototype.constructor = MediaView;

   MediaView.DEFAULT_OPTIONS = {};

   function _createBackground() {
      this.background = new Surface({
         properties: {
            backgroundColor: '#0F0F0A'
         }
      });

      var backgroundModifier = new StateModifier({
         opacity: 0.9
      });

      this._eventInput.on('showMediaView', function(data) {
         this.background.setProperties({zIndex: 1});
         this.nextButton.setProperties({zIndex: 1});
         this.previousButton.setProperties({zIndex: 1});

         Timer.setTimeout(function() {
            this.nextButtonModifier.setOpacity(0.5, {duration: 600, curve: 'linear'});
            
            var isFirstMedia = this.options.mediaIds.indexOf(data.mediaId) === 0 ? true : false;

            if (!isFirstMedia) {
               this.previousButtonModifier.setOpacity(0.5, {duration: 600, curve: 'linear'});
            }
         }.bind(this), 800);

         this.boxView.trigger('showBoxView', data);
      }.bind(this));

      this.background.on('touchend', function(data) {
         // console.log(data.changedTouches[0].clientY);
         if (data.changedTouches[0].clientY < 430) {
            this.nextButton.setProperties({zIndex: '-1'});
            this.previousButton.setProperties({zIndex: '-1'});
            this.nextButtonModifier.setOpacity(0);
            this.previousButtonModifier.setOpacity(0);
            this.boxView.trigger('showFeedView', {pos: -1000});
         } else if (data.changedTouches[0].clientY > 570) {
            this.nextButton.setProperties({zIndex: '-1'});
            this.previousButton.setProperties({zIndex: '-1'});
            this.nextButtonModifier.setOpacity(0);
            this.previousButtonModifier.setOpacity(0);
            this.boxView.trigger('showFeedView', {pos: 1000});
         }
         
      }.bind(this));

      this.add(backgroundModifier).add(this.background);
   }

   function _createLightbox() {
      this.boxView = new BoxView({mediaId: this.options.mediaId, mediaIds: this.options.mediaIds});

      this.boxView.on('hideMediaView', function() {
         this._eventOutput.trigger('showFeedView');
         Timer.setTimeout(function() {
            this.background.setProperties({zIndex: '-1'});
         }.bind(this), 300);
      }.bind(this));

      this.boxView.on('scrollToNextMedia', function() {
         this._eventOutput.trigger('scrollToNextMedia');
      }.bind(this));

      this.boxView.on('scrollToPrevMedia', function() {
         this._eventOutput.trigger('scrollToPrevMedia');
      }.bind(this));

      this.boxViewModifier = new StateModifier({
         size: [610, window.innerHeight - 103],
         align: [0.5, 0.5],
         origin: [0.5, 0.5],
      });

      this.add(this.boxViewModifier).add(this.boxView);

      this.boxView.on('hideControlButtons', function() {
         this.previousButtonModifier.setOpacity(0, {duration: 400, curve: 'linear'});
         this.nextButtonModifier.setOpacity(0, {duration: 400, curve: 'linear'});
      }.bind(this));

      this.boxView.on('showControlButtons', function(data) {
         if (!data.isFirstMedia) {
            this.previousButton.setProperties({zIndex: 1});
            this.previousButtonModifier.setOpacity(0.5, {duration: 400, curve: 'linear'});
         } else {
            this.previousButtonModifier.setOpacity(0, {duration: 200, curve: 'linear'}, function() {
               this.previousButton.setProperties({zIndex: -1});
            }.bind(this));
         }
         this.nextButtonModifier.setOpacity(0.5, {duration: 400, curve: 'linear'});
      }.bind(this));
   }

   function _createControlButtons() {
      this.previousButtonModifier = new StateModifier({
         size: [null, null],
         align: [0, 0.5],
         opacity: 0
      });

      this.previousButton = new Surface({
         properties: {
            color: '#5C7373',
            fontSize: '100px',
            marginLeft: '15px',
            marginTop: '-50px'
         },
         classes: ['fa', 'fa-angle-left']
      });

      this.add(this.previousButtonModifier).add(this.previousButton);

      this.nextButtonModifier = new StateModifier({
         size: [null, null],
         align: [1, 0.5],
         opacity: 0
      });

      this.nextButton = new Surface({
         properties: {
            color: '#5C7373',
            fontSize: '100px',
            marginLeft: '-55px',
            marginTop: '-50px'
         },
         classes: ['fa', 'fa-angle-right']
      });

      this.add(this.nextButtonModifier).add(this.nextButton);

      Timer.setTimeout(function() {
         this.nextButtonModifier.setOpacity(0.5, {duration: 600, curve: 'linear'});

         var isFirstMedia = this.options.mediaIds.indexOf(this.options.mediaId) === 0 ? true : false;

         if (!isFirstMedia) {
            this.previousButtonModifier.setOpacity(0.5, {duration: 600, curve: 'linear'});
         } else {
            this.previousButton.setProperties({zIndex: -1});
         }
      }.bind(this), 800);

      this.nextButton.on('touchstart', function() {
         this.nextButtonModifier.setOpacity(1);
         this.nextButton.setProperties({color: '#9DABAB'});
      }.bind(this));

      this.nextButton.on('touchend', function() {
         this.nextButtonModifier.setOpacity(0.5);
         this.nextButton.setProperties({color: '#5C7373'});
         this.boxView.trigger('showNextMediaBox');
      }.bind(this));

      this.previousButton.on('touchstart', function() {
         this.previousButtonModifier.setOpacity(1);
         this.previousButton.setProperties({color: '#9DABAB'});
      }.bind(this));

      this.previousButton.on('touchend', function() {
         this.previousButtonModifier.setOpacity(0.5);
         this.previousButton.setProperties({color: '#5C7373'});
         this.boxView.trigger('showPrevMediaBox');
      }.bind(this));
   }

   module.exports = MediaView;
});
