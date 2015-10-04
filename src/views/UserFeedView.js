define(function(require, exports, module) {

   var View = require('famous/core/View');
   var Surface = require('famous/core/Surface');
   var StateModifier = require('famous/modifiers/StateModifier');
   var ImageSurface = require('famous/surfaces/ImageSurface');
   var GridLayout = require('famous/views/GridLayout');
   var FlexScrollView = require('famous-flex/FlexScrollView');
   var CollectionLayout = require('famous-flex/layouts/CollectionLayout');
   var Timer = require('famous/utilities/Timer');

   function UserFeedView() {
      View.apply(this, arguments);


      _createFeed.call(this);
   }

   UserFeedView.prototype = Object.create(View.prototype);
   UserFeedView.prototype.constructor = UserFeedView;

   UserFeedView.DEFAULT_OPTIONS = {
      access_token: window.localStorage.getItem('access_token'),
      firstTime: true
   };

   function _createFeed() {

// https://api.instagram.com/v1/users/1483611/media/recent?access_token=
      var userId;
      var isScrolling = false;
      var imagePos = 0;
      var mediaView, MediaView, mediaViewModifier;
      var mediaIds = [];

     /* $.ajax({url: 'https://api.instagram.com/v1/media/839886446857562152_213921801/likes?access_token=' + this.options.access_token, dataType: 'jsonp'})
      .done(function(data) {
         console.log(data);
      });
*/
      /*$.ajax({url: 'https://api.instagram.com/v1/users/self?access_token=' + this.options.access_token, dataType: 'jsonp'})
      .done(function(data) {
         userId = data.data.id;*/

// console.log(this.options.access_token);
         $.ajax({url: 'https://api.instagram.com/v1/users/self/feed?access_token=' + this.options.access_token, dataType: 'jsonp'})
         .done(function(data) {
            // console.log(data);
            var nextUrl = data.pagination.next_url;

            var scrollView = new FlexScrollView({
               autoPipeEvents: true,
                  layout: CollectionLayout,
                  layoutOptions: {
                     itemSize: [200, 200],
                     margins: 0,
                     spacing: 30
                  }
            });

            scrollView.on('scrollstart', function() {
               isScrolling = true;
            });

            var lastItem = data.data.length - 1;

            scrollView.on('scrollend', function() {
               isScrolling = false;
               if (scrollView.getLastVisibleItem().index === lastItem) {
                  $.ajax({url: nextUrl, dataType: 'jsonp'})
                  .done(function(data) {

                     nextUrl = data.pagination.next_url;
                     lastItem += data.data.length;

                     for (var i = 0; i < data.data.length; i++) {

                        var media = new ImageSurface({
                           content: data.data[i].images.low_resolution.url,
                           size: [220, 220],
                           properties: {
                              border: '1px solid black'
                           },
                           attributes: {
                              id: data.data[i].id
                           }
                        });

                        mediaIds.push(data.data[i].id);

                        media.on('touchend', function(evt) {

                           if (!isScrolling) {

                              var mediaId = evt.target.id;

                              if (this.options.firstTime) {
                                 MediaView = require('views/MediaView');
                                 mediaView = new MediaView({mediaId: mediaId, mediaIds: mediaIds});
                                 mediaViewModifier = new StateModifier({
                                    opacity: 0
                                 });

                                 mediaView.on('showFeedView', function() {
                                    mediaViewModifier.setOpacity(0, {duration: 300, curve: 'linear'});
                                 });

                                 mediaView.on('scrollToNextMedia', function() {
                                    scrollView.goToNextPage();
                                 });

                                 mediaView.on('scrollToPrevMedia', function() {
                                    scrollView.goToPreviousPage();
                                 });

                                 mediaViewModifier.setOpacity(1, {duration: 300, curve: 'linear'});
                                 this.add(mediaViewModifier).add(mediaView);
                              } else {
                                 mediaViewModifier.setOpacity(1, {duration: 300, curve: 'linear'});
                                 mediaView.trigger('showMediaView', {mediaId: mediaId});
                              }
                              this.options.firstTime = false;
                           }

                        }.bind(this));
                     
                        scrollView.push(media);
                     }
                  }.bind(this));
               }
            }.bind(this));

            var surfaces = [];

            

            for (var i = 0; i < data.data.length; i++) {
               var media = new ImageSurface({
                  content: data.data[i].images.low_resolution.url,
                  size: [220, 220],
                  properties: {
                     border: '1px solid black'
                  },
                  attributes: {
                     id: data.data[i].id
                  }
               });

               mediaIds.push(data.data[i].id);
               // console.log(mediaIds);

               media.on('touchend', function(evt) {

                  if (!isScrolling) {

                     var mediaId = evt.target.id;

                     if (this.options.firstTime) {
                        MediaView = require('views/MediaView');
                        mediaView = new MediaView({mediaId: mediaId, mediaIds: mediaIds});
                        mediaViewModifier = new StateModifier({
                           opacity: 0
                        });

                        mediaView.on('showFeedView', function() {
                           mediaViewModifier.setOpacity(0, {duration: 300, curve: 'linear'});
                        });

                        mediaView.on('scrollToNextMedia', function() {
                           scrollView.goToNextPage();
                        });

                        mediaView.on('scrollToPrevMedia', function() {
                           scrollView.goToPreviousPage();
                        });

                        mediaViewModifier.setOpacity(1, {duration: 300, curve: 'linear'});
                        this.add(mediaViewModifier).add(mediaView);
                     } else {
                        mediaViewModifier.setOpacity(1, {duration: 300, curve: 'linear'});
                        mediaView.trigger('showMediaView', {mediaId: mediaId});
                     }
                     this.options.firstTime = false;
                  }

               }.bind(this));

         
               surfaces.push(media);
            }
            scrollView.sequenceFrom(surfaces);

            var gridModifier = new StateModifier({
               size: [690, undefined],
               align: [0.1, 0.007],
               opacity: 1
            });

            this.add(gridModifier).add(scrollView);
         }.bind(this));

         
      // }.bind(this));

      
      

      var background = new Surface({
         properties: {
            backgroundColor: '#1F1F14',
            zIndex: -1
         }
      });

      this.add(background);


   }   

   module.exports = UserFeedView;
});
