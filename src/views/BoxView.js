define(function(require, exports, module) {

   var View = require('famous/core/View');
   var Surface = require('famous/core/Surface');
   var Transform = require('famous/core/Transform');
   var StateModifier = require('famous/modifiers/StateModifier');
   var ImageSurface = require('famous/surfaces/ImageSurface');
   var Modifier = require('famous/core/Modifier');
   var Easing = require('famous/transitions/Easing');
   var Transitionable = require('famous/transitions/Transitionable');
   var GenericSync = require('famous/inputs/GenericSync');
   var MouseSync = require('famous/inputs/MouseSync');
   var TouchSync = require('famous/inputs/TouchSync');
   var Timer = require('famous/utilities/Timer');
   var SnapTransition = require("famous/transitions/SnapTransition");
   var ContainerSurface = require('famous/surfaces/ContainerSurface');
   var Scrollview = require("famous/views/Scrollview");
   var moment = require('moment');
   var FlexScrollView = require('famous-flex/FlexScrollView');
   var ListLayout = require('famous-flex/layouts/ListLayout');

   Transitionable.registerMethod("snap", SnapTransition)

   GenericSync.register({
      'mouse' : MouseSync,
      'touch' : TouchSync
   });


   function BoxView() {
      View.apply(this, arguments);

      this.initialMediaPosition = this.options.mediaIds.indexOf(this.options.mediaId);
         
      if (this.initialMediaPosition === 0) {
         this.position0dirX = new Transitionable(0);
         this.position1dirX = new Transitionable(780);
         this.position2dirX = new Transitionable(1560);

         this.mediaBox0MediaId = this.options.mediaId;
         this.mediaBox1MediaId = this.options.mediaIds[1];
         this.mediaBox2MediaId = this.options.mediaIds[2];
      } else {
         this.position0dirX = new Transitionable(-780);
         this.position1dirX = new Transitionable(0);
         this.position2dirX = new Transitionable(780);

         this.mediaBox0MediaId = this.options.mediaIds[this.initialMediaPosition - 1];
         this.mediaBox1MediaId = this.options.mediaId;
         this.mediaBox2MediaId = this.options.mediaIds[this.initialMediaPosition + 1];
      }  
      
      this.position0dirY = new Transitionable(0);
      this.position1dirY = new Transitionable(0);
      this.position2dirY = new Transitionable(0);

      this.syncMediaBox0dirX = new GenericSync(['mouse', 'touch'],{direction : GenericSync.DIRECTION_X});
      this.syncMediaBox1dirX = new GenericSync(['mouse', 'touch'],{direction : GenericSync.DIRECTION_X});
      this.syncMediaBox2dirX = new GenericSync(['mouse', 'touch'],{direction : GenericSync.DIRECTION_X});

      this.syncMediaBox0dirY = new GenericSync(['mouse', 'touch'],{direction : GenericSync.DIRECTION_Y});
      this.syncMediaBox1dirY = new GenericSync(['mouse', 'touch'],{direction : GenericSync.DIRECTION_Y});
      this.syncMediaBox2dirY = new GenericSync(['mouse', 'touch'],{direction : GenericSync.DIRECTION_Y});

      this.syncMediaBox0CommentsBox = new GenericSync(['touch']);
      this.syncMediaBox1CommentsBox = new GenericSync(['touch']);
      this.syncMediaBox2CommentsBox = new GenericSync(['touch']);

      _createBackground.call(this);

      this._eventInput.on('hideBoxView', function() {
         this.mediaBox0.setProperties({zIndex: '-10'});
         this.mediaBox1.setProperties({zIndex: '-10'});
         this.mediaBox2.setProperties({zIndex: '-10'});
      }.bind(this));

      this._eventInput.on('showBoxView', function(data) {

         var mediaId = data.mediaId;

         this.initialMediaPosition = this.options.mediaIds.indexOf(mediaId);

         if (this.initialMediaPosition === 0) {
            this.position0dirX.set(0);
            this.position1dirX.set(780);
            this.position2dirX.set(1560);

            this.mediaBox0MediaId = mediaId;
            this.mediaBox1MediaId = this.options.mediaIds[1];
            this.mediaBox2MediaId = this.options.mediaIds[2];
         } else {
            this.position0dirX.set(-780);
            this.position1dirX.set(0);
            this.position2dirX.set(780);

            this.mediaBox0MediaId = this.options.mediaIds[this.initialMediaPosition - 1];
            this.mediaBox1MediaId = mediaId;
            this.mediaBox2MediaId = this.options.mediaIds[this.initialMediaPosition + 1];
         }

         var mediaEntities = {
            image: this.mediaBox0Image,
            profilePic: this.mediaBox0ProfilePic,
            username: this.mediaBox0Username,
            imageCaption: this.mediaBox0ImageCaption,
            createdTime: this.mediaBox0CreatedTime,
            likeButton: this.mediaBox0LikeButton,
            likers: this.mediaBox0Likers,
            likersCounter: this.mediaBox0LikersCounter,
            commentsBox: this.mediaBox0CommentsBox
         };

         _updateMediaData.apply(this, [mediaEntities, 0]);

         mediaEntities.image = this.mediaBox1Image;
         mediaEntities.profilePic = this.mediaBox1ProfilePic;
         mediaEntities.username = this.mediaBox1Username;
         mediaEntities.imageCaption = this.mediaBox1ImageCaption;
         mediaEntities.createdTime = this.mediaBox1CreatedTime;
         mediaEntities.likeButton = this.mediaBox1LikeButton;
         mediaEntities.likers = this.mediaBox1Likers;
         mediaEntities.likersCounter = this.mediaBox1LikersCounter;
         mediaEntities.commentsBox = this.mediaBox1CommentsBox;

         _updateMediaData.apply(this, [mediaEntities, 1]);

         mediaEntities.image = this.mediaBox2Image;
         mediaEntities.profilePic = this.mediaBox2ProfilePic;
         mediaEntities.username = this.mediaBox2Username;
         mediaEntities.imageCaption = this.mediaBox2ImageCaption;
         mediaEntities.createdTime = this.mediaBox2CreatedTime;
         mediaEntities.likeButton = this.mediaBox2LikeButton;
         mediaEntities.likers = this.mediaBox2Likers;
         mediaEntities.likersCounter = this.mediaBox2LikersCounter;
         mediaEntities.commentsBox = this.mediaBox2CommentsBox;

         _updateMediaData.apply(this, [mediaEntities, 2]);

         Timer.setTimeout(function() {
            this.mediaBox0.setProperties({zIndex: '1'});
            this.mediaBox1.setProperties({zIndex: '1'});
            this.mediaBox2.setProperties({zIndex: '1'});
         }.bind(this), 500);
      }.bind(this));

      this._eventInput.on('showFeedView', function(data) {
         var pos = data.pos;
         var velocity = data.velocity;
         var duration = velocity ? 200 / Math.abs(velocity) : 300;

         if (this.position0dirX.state === 0) {
            this.position0dirY.set(pos, {
                duration: duration, curve: Easing.outQuad
            }, function() {
               this.trigger('hideBoxView');
               this._eventOutput.trigger('hideMediaView');
               Timer.setTimeout(function() {
                  this.position0dirY.set(0);
               }.bind(this), 300);
            }.bind(this));
         } else if (this.position1dirX.state === 0) {
            this.position1dirY.set(pos, {
                duration: duration, curve: Easing.outQuad
            }, function() {
               this.trigger('hideBoxView');
               this._eventOutput.trigger('hideMediaView');
               Timer.setTimeout(function() {
                  this.position1dirY.set(0);
               }.bind(this), 300);
            }.bind(this));
         } else if (this.position2dirX.state === 0) {
            this.position2dirY.set(pos, {
                duration: duration, curve: Easing.outQuad
            }, function() {
               this.trigger('hideBoxView');
               this._eventOutput.trigger('hideMediaView');
               Timer.setTimeout(function() {
                  this.position2dirY.set(0);
               }.bind(this), 300);
            }.bind(this));
         }

         
      }.bind(this));

      this._eventInput.on('showNextMediaBox', function() {

         var mediaBox0 = this.position0dirX.get();
         var mediaBox1 = this.position1dirX.get();
         var mediaBox2 = this.position2dirX.get();
         
         if (mediaBox0 === 0) {
            
            this.position0dirX.set(-780, {
                duration: 300, curve: Easing.outQuad
            });

            this.position1dirX.set(0, {
                duration: 300, curve: Easing.outQuad
            }, function() {
               var mediaEntities = {
                  image: this.mediaBox2Image,
                  profilePic: this.mediaBox2ProfilePic,
                  username: this.mediaBox2Username,
                  imageCaption: this.mediaBox2ImageCaption,
                  createdTime: this.mediaBox2CreatedTime,
                  likeButton: this.mediaBox2LikeButton,
                  likers: this.mediaBox2Likers,
                  likersCounter: this.mediaBox2LikersCounter,
                  commentsBox: this.mediaBox2CommentsBox
               };
               _updateMediaData.apply(this, [mediaEntities, 1, 'next']);
               this._eventOutput.trigger('scrollToNextMedia');
            }.bind(this));

            this.mediaBox2Modifier.setOpacity(0);
            this.position2dirX.set(780);
            this.mediaBox2Modifier.setOpacity(1);

            this._eventOutput.trigger('showControlButtons', {isFirstMedia: false});

         } else if (mediaBox1 === 0) {
            
            this.mediaBox0Modifier.setOpacity(0);
            this.position0dirX.set(780);
            this.mediaBox0Modifier.setOpacity(1);

            this.position1dirX.set(-780, {
                duration: 300, curve: Easing.outQuad
            });

            this.position2dirX.set(0, {
                duration: 300, curve: Easing.outQuad
            }, function() {
               var mediaEntities = {
                  image: this.mediaBox0Image,
                  profilePic: this.mediaBox0ProfilePic,
                  username: this.mediaBox0Username,
                  imageCaption: this.mediaBox0ImageCaption,
                  createdTime: this.mediaBox0CreatedTime,
                  likeButton: this.mediaBox0LikeButton,
                  likers: this.mediaBox0Likers,
                  likersCounter: this.mediaBox0LikersCounter,
                  commentsBox: this.mediaBox0CommentsBox
               };
               _updateMediaData.apply(this, [mediaEntities, 2, 'next']);
               this._eventOutput.trigger('scrollToNextMedia');
            }.bind(this));

            this._eventOutput.trigger('showControlButtons', {isFirstMedia: false});

         } else if (mediaBox2 === 0) {
            
            this.position0dirX.set(0, {
                duration: 300, curve: Easing.outQuad
            });

            this.mediaBox1Modifier.setOpacity(0);
            this.position1dirX.set(780);
            this.mediaBox1Modifier.setOpacity(1);

            this.position2dirX.set(-780, {
                duration: 300, curve: Easing.outQuad
            }, function() {
               var mediaEntities = {
                  image: this.mediaBox1Image,
                  profilePic: this.mediaBox1ProfilePic,
                  username: this.mediaBox1Username,
                  imageCaption: this.mediaBox1ImageCaption,
                  createdTime: this.mediaBox1CreatedTime,
                  likeButton: this.mediaBox1LikeButton,
                  likers: this.mediaBox1Likers,
                  likersCounter: this.mediaBox1LikersCounter,
                  commentsBox: this.mediaBox1CommentsBox
               };
               _updateMediaData.apply(this, [mediaEntities, 0, 'next']);
               this._eventOutput.trigger('scrollToNextMedia');
            }.bind(this));

            this._eventOutput.trigger('showControlButtons', {isFirstMedia: false});

         }

      }.bind(this));

      this._eventInput.on('showPrevMediaBox', function() {

         var mediaBox0 = this.position0dirX.get();
         var mediaBox1 = this.position1dirX.get();
         var mediaBox2 = this.position2dirX.get();
         var isSecondMedia, isPreviousMediaFirst;
         
         if (mediaBox0 === 0) {

            isSecondMedia = this.options.mediaIds.indexOf(this.mediaBox0MediaId) === 1 ? true : false;

            isPreviousMediaFirst = (this.options.mediaIds.indexOf(this.mediaBox0MediaId) - 1) === 0 ? true : false;
            
            this.position0dirX.set(780, {
                duration: 300, curve: Easing.outQuad
            });

            if (!isSecondMedia) {
               this.mediaBox1Modifier.setOpacity(0);
               this.position1dirX.set(-780);
               this.mediaBox1Modifier.setOpacity(1);
            }

            this.position2dirX.set(0, {
                duration: 300, curve: Easing.outQuad
            }, function() {
               if (!isSecondMedia) {
                  var mediaEntities = {
                     image: this.mediaBox1Image,
                     profilePic: this.mediaBox1ProfilePic,
                     username: this.mediaBox1Username,
                     imageCaption: this.mediaBox1ImageCaption,
                     createdTime: this.mediaBox1CreatedTime,
                     likeButton: this.mediaBox1LikeButton,
                     likers: this.mediaBox1Likers,
                     likersCounter: this.mediaBox1LikersCounter,
                     commentsBox: this.mediaBox1CommentsBox
                  };
                  _updateMediaData.apply(this, [mediaEntities, 2, 'prev']);
                  this._eventOutput.trigger('scrollToPrevMedia');
               }

               this._eventOutput.trigger('showControlButtons', {isFirstMedia: isPreviousMediaFirst});
            }.bind(this));

         } else if (mediaBox1 === 0) {

            isSecondMedia = this.options.mediaIds.indexOf(this.mediaBox1MediaId) === 1 ? true : false;
            isPreviousMediaFirst = (this.options.mediaIds.indexOf(this.mediaBox1MediaId) - 1) === 0 ? true : false;
            
            this.position0dirX.set(0, {
                duration: 300, curve: Easing.outQuad
            }, function() {
               if (!isSecondMedia) {
                  var mediaEntities = {
                     image: this.mediaBox2Image,
                     profilePic: this.mediaBox2ProfilePic,
                     username: this.mediaBox2Username,
                     imageCaption: this.mediaBox2ImageCaption,
                     createdTime: this.mediaBox2CreatedTime,
                     likeButton: this.mediaBox2LikeButton,
                     likers: this.mediaBox2Likers,
                     likersCounter: this.mediaBox2LikersCounter,
                     commentsBox: this.mediaBox2CommentsBox
                  };
                  _updateMediaData.apply(this, [mediaEntities, 0, 'prev']);
                  this._eventOutput.trigger('scrollToPrevMedia');
               }

               this._eventOutput.trigger('showControlButtons', {isFirstMedia: isPreviousMediaFirst});
            }.bind(this));

            this.position1dirX.set(780, {
                duration: 300, curve: Easing.outQuad
            });

            if (!isSecondMedia) {
               this.mediaBox2Modifier.setOpacity(0);
               this.position2dirX.set(-780);
               this.mediaBox2Modifier.setOpacity(1);
            }

         } else if (mediaBox2 === 0) {

            isSecondMedia = this.options.mediaIds.indexOf(this.mediaBox2MediaId) === 1 ? true : false;
               isPreviousMediaFirst = (this.options.mediaIds.indexOf(this.mediaBox2MediaId) - 1) === 0 ? true : false;

            if (!isSecondMedia) {
               this.mediaBox0Modifier.setOpacity(0);
               this.position0dirX.set(-780);
               this.mediaBox0Modifier.setOpacity(1);
            }

            this.position1dirX.set(0, {
                duration: 300, curve: Easing.outQuad
            }, function() {
               if (!isSecondMedia) {
                  var mediaEntities = {
                     image: this.mediaBox0Image,
                     profilePic: this.mediaBox0ProfilePic,
                     username: this.mediaBox0Username,
                     imageCaption: this.mediaBox0ImageCaption,
                     createdTime: this.mediaBox0CreatedTime,
                     likeButton: this.mediaBox0LikeButton,
                     likers: this.mediaBox0Likers,
                     likersCounter: this.mediaBox0LikersCounter,
                     commentsBox: this.mediaBox0CommentsBox
                  };
                  _updateMediaData.apply(this, [mediaEntities, 1, 'prev']);
                  this._eventOutput.trigger('scrollToPrevMedia');
               }

               this._eventOutput.trigger('showControlButtons', {isFirstMedia: isPreviousMediaFirst});
            }.bind(this));

            this.position2dirX.set(780, {
                duration: 300, curve: Easing.outQuad
            });

         }

      }.bind(this));
   }

   BoxView.prototype = Object.create(View.prototype);
   BoxView.prototype.constructor = BoxView;

   BoxView.DEFAULT_OPTIONS = {
      size: [400, 450],
      DISPLACEMENT_THRESHOLD_DIR_X: 400,
      DISPLACEMENT_THRESHOLD_DIR_Y: 200,
      access_token: window.localStorage.getItem('access_token'),
      likedMediaButtonColor: '#E60000',
      notLikedMediaButtonColor: '#A6CFCF'
   };

   function _createBackground() {
      this.mediaBox1 = new ContainerSurface({
         properties: {
            backgroundColor: '#FEFEFE',
            borderRadius: '5px'
         }
      });

      $.ajax({url: 'https://api.instagram.com/v1/media/' + this.mediaBox1MediaId + '/?access_token=' + this.options.access_token, dataType: 'jsonp'})
      .done(function(data) {
         this.mediaBox1Image = new ImageSurface({
            content: data.data.images.standard_resolution.url,
            size: [610, 610],
            properties: {
               borderTopLeftRadius: '5px',
               borderTopRightRadius: '5px'
            }
         });
         // console.log(image);
         this.mediaBox1.add(this.mediaBox1Image);

         var verticalSeparator = new Surface({
            size: [1, 95],
            properties: {
               backgroundColor: '#E7E7E7'
            }
         });

         var verticalSeparatorModifier = new StateModifier({
            transform: Transform.translate(360, 610)
         });

         this.mediaBox1.add(verticalSeparatorModifier).add(verticalSeparator);

         var horizontalSeparator2 = new Surface({
            size: [610, 1],
            properties: {
               backgroundColor: '#E7E7E7'
            }
         });

         var horizontalSeparator2Modifier = new StateModifier({
            transform: Transform.translate(0, 610)
         });

         this.mediaBox1.add(horizontalSeparator2Modifier).add(horizontalSeparator2);

         var horizontalSeparator = new Surface({
            size: [610, 1],
            properties: {
               backgroundColor: '#E7E7E7'
            }
         });

         var horizontalSeparatorModifier = new StateModifier({
            transform: Transform.translate(0, 705)
         });

         this.mediaBox1.add(horizontalSeparatorModifier).add(horizontalSeparator);

         this.mediaBox1ProfilePic = new ImageSurface({
            size: [55, 55],
            content: data.data.user.profile_picture,
            properties: {
               border: '1px solid #CFCFCF',
               borderRadius: '55px'
            }
         });

         var ownerProfilePicModifier = new StateModifier({
            transform: Transform.translate(11, 622)
         });

         this.mediaBox1.add(ownerProfilePicModifier).add(this.mediaBox1ProfilePic);

         this.mediaBox1CreatedTime = new Surface({
            size: [120, true],
            content: moment.unix(data.data.created_time).fromNow(true),
            properties: {
               font: '14px Helvetica',
               color: '#BABABA',
               textAlign: 'right'
            }
         });

         var createdTimeModifier = new StateModifier({
            transform: Transform.translate(232, 623)
         });

         this.mediaBox1.add(createdTimeModifier).add(this.mediaBox1CreatedTime);

         var username = '';
         var usernameLimit;

         if (this.mediaBox1CreatedTime.getContent() === 'a few seconds ago') {
            usernameLimit = 16;
         } else {
            usernameLimit = 19;
         }

         if (data.data.user.username.length > usernameLimit) {
            username = data.data.user.username.substring(0, usernameLimit - 1) + '...';
         } else {
            username = data.data.user.username;
         }

         this.mediaBox1Username = new Surface({
            size: [true, true],
            content: username,
            properties: {
               font: 'bold 17px Helvetica',
               color: '#006699',
            }
         });

         var ownerProfilePicUsernameModifier = new StateModifier({
            transform: Transform.translate(75, 620)
         });

         this.mediaBox1.add(ownerProfilePicUsernameModifier).add(this.mediaBox1Username);

         var imageCaption = data.data.caption ? data.data.caption.text : '';

         this.mediaBox1ImageCaption = new Surface({
            size: [280, 53],
            content: imageCaption,
            properties: {
               font: '14px Helvetica',
               color: '#292929',
               overflow: 'hidden'
            }
         });

         var imageCaptionModifier = new StateModifier({
            transform: Transform.translate(75, 645)
         });

         this.mediaBox1.add(imageCaptionModifier).add(this.mediaBox1ImageCaption);

         var likeButtonModifier = new StateModifier({
            transform: Transform.translate(385, 645)
         });

         var likeButtonColor = data.data.user_has_liked ? this.options.likedMediaButtonColor : this.options.notLikedMediaButtonColor;

         this.mediaBox1LikeButton = new Surface({
            size: [true, true],
            properties: {
               color: likeButtonColor,
               fontSize: '22px'
            },
            classes: ['fa', 'fa-heart']
         });

         this.mediaBox1.add(likeButtonModifier).add(this.mediaBox1LikeButton);

         var likerPosX = 433;
         var likerPosY = 618;
         this.mediaBox1Likers = [];
         var numOfLikes = data.data.likes.count;
         var likes, likerImage, likesCounter;

         for (var i = 0; i < 4; i++) {

            var liker = new ImageSurface({
               size: [36, 36],
               properties: {
                  border: '1px solid #CFCFCF',
                  borderRadius: '4px'
               }
            });

            if (data.data.likes.data[i] !== undefined) {
               liker.setContent(data.data.likes.data[i].profile_picture);
            } else {
               liker.setProperties({display: 'none'});
            }

            var likerModifier = new StateModifier({
               transform: Transform.translate(likerPosX, likerPosY)
            });

            this.mediaBox1.add(likerModifier).add(liker);
            this.mediaBox1Likers.push(liker);
         
            if (i == 1) {
               likerPosX -= 45;
               likerPosY += 45;
            } else {
               likerPosX += 45;
            }
         }

         this.mediaBox1LikersCounter = new Surface({
            size: [40, 40],
            properties: {
               font: '15px Helvetica',
               color: '#7D8F8F',
               fontWeight: 'bold',
               textAlign: 'center'
            }
         });

         if (numOfLikes > 4) {

            if ((numOfLikes - 4) <= 9999) {
               likes = numOfLikes - 4;
            } else if ((numOfLikes - 4) >= 10000 && (numOfLikes - 4) < 1000000) {
               likes = Math.floor((numOfLikes - 4) / 1000).toString() + 'K';
            } else {
               likes = Math.floor((numOfLikes - 4) / 1000000).toString() + 'M';
            }

            likesCounter = '+' + likes.toString();
            this.mediaBox1LikersCounter.setContent(likesCounter);
         } 

         var likerCounterModifier = new StateModifier({
            transform: Transform.translate(540, 648)
         });

         this.mediaBox1.add(likerCounterModifier).add(this.mediaBox1LikersCounter);     

         this.mediaBox1CommentsBox = new FlexScrollView({
            autoPipeEvents: true,
            useContainer: true,
            layout: ListLayout,
            layoutOptions: {
               margins: [15, 10]
            }
         });

         $.ajax({url: 'https://api.instagram.com/v1/media/' + this.mediaBox1MediaId + '/comments?access_token=' + this.options.access_token, dataType: 'jsonp'})
            .done(function(data) {

               var commentsSurfaces = [];

               for (var i = data.data.length - 1; i >= 0; i--) {
                  var comment = new ContainerSurface({
                     size: [undefined, 70]
                  });

                  var commentProfilePic = new ImageSurface({
                     size: [36, 36],
                     content: data.data[i].from.profile_picture,
                     properties: {
                        border: '1px solid #CFCFCF',
                        borderRadius: '4px'
                     }
                  });

                  var commentUsername = new Surface({
                     size: [undefined, true],
                     content: data.data[i].from.username,
                     properties: {
                        font: 'bold 14px Helvetica',
                        color: '#006699'
                     }
                  });

                  var commentUsernameModifier = new StateModifier({
                     transform: Transform.translate(46, 0)
                  });

                  var commentCreatedTime = new Surface({
                     size: [120, true],
                     content: moment.unix(data.data[i].created_time).fromNow(true),
                     properties: {
                        font: '14px Helvetica',
                        color: '#BABABA',
                        textAlign: 'right'
                     }
                  });

                  var commentCreatedTimeModifier = new StateModifier({
                     transform: Transform.translate(470, 5)
                  });

                  var commentText = new Surface({
                     size: [540, true],
                     content: data.data[i].text,
                     properties: {
                        font: '13px Helvetica',
                        color: '#292929',
                        overflow: 'hidden'
                     }
                  });

                  var commentTextModifier = new StateModifier({
                     transform: Transform.translate(46, 19)
                  });

                  comment.add(commentProfilePic);
                  comment.add(commentUsernameModifier).add(commentUsername);
                  comment.add(commentCreatedTimeModifier).add(commentCreatedTime);
                  comment.add(commentTextModifier).add(commentText);

                  commentsSurfaces.push(comment);
               }

               this.mediaBox1CommentsBox.sequenceFrom(commentsSurfaces);
            }.bind(this));

         var commentsBoxModifier = new StateModifier({
            size: [600, 215],
            transform: Transform.translate(0, 706)
         });

         this.mediaBox1CommentsBox.pipe(this.syncMediaBox1CommentsBox);

         this.syncMediaBox1CommentsBox.on('update', function(data) {
            var posX = data.delta[0];
            var posY = data.delta[1];

            if (Math.abs(posY) > 5) {
               this.mediaBox0.unpipe(this.syncMediaBox0dirX);
               this.mediaBox1.unpipe(this.syncMediaBox1dirX);
               this.mediaBox2.unpipe(this.syncMediaBox2dirX);
            }
         }.bind(this));

         this.syncMediaBox1CommentsBox.on('end', function() {
            this.mediaBox0.pipe(this.syncMediaBox0dirX);
            this.mediaBox1.pipe(this.syncMediaBox1dirX);
            this.mediaBox2.pipe(this.syncMediaBox2dirX);
         }.bind(this));

         this.mediaBox1.add(commentsBoxModifier).add(this.mediaBox1CommentsBox);

      }.bind(this));


      this.mediaBox1Modifier = new Modifier({
         transform : function() {
            return Transform.translate(this.position1dirX.get(), this.position1dirY.get(), 0);
         }.bind(this)
      });

      this.add(this.mediaBox1Modifier).add(this.mediaBox1);
      this.mediaBox1.pipe(this.syncMediaBox1dirX);
      // this.mediaBox1.pipe(this.syncMediaBox1dirY);

      this.mediaBox0 = new ContainerSurface({
         properties: {
            backgroundColor: '#FEFEFE',
            borderRadius: '5px'
         }
      });

      $.ajax({url: 'https://api.instagram.com/v1/media/' + this.mediaBox0MediaId + '/?access_token=' + this.options.access_token, dataType: 'jsonp'})
      .done(function(data) {
         this.mediaBox0Image = new ImageSurface({
            content: data.data.images.standard_resolution.url,
            size: [610, 610],
            properties: {
               borderTopLeftRadius: '5px',
               borderTopRightRadius: '5px'
            }
         });
         // console.log(image);
         this.mediaBox0.add(this.mediaBox0Image);

         var verticalSeparator = new Surface({
            size: [1, 95],
            properties: {
               backgroundColor: '#E7E7E7'
            }
         });

         var verticalSeparatorModifier = new StateModifier({
            transform: Transform.translate(360, 610)
         });

         this.mediaBox0.add(verticalSeparatorModifier).add(verticalSeparator);

         var horizontalSeparator2 = new Surface({
            size: [610, 1],
            properties: {
               backgroundColor: '#E7E7E7'
            }
         });

         var horizontalSeparator2Modifier = new StateModifier({
            transform: Transform.translate(0, 610)
         });

         this.mediaBox0.add(horizontalSeparator2Modifier).add(horizontalSeparator2);

         var horizontalSeparator = new Surface({
            size: [610, 1],
            properties: {
               backgroundColor: '#E7E7E7'
            }
         });

         var horizontalSeparatorModifier = new StateModifier({
            transform: Transform.translate(0, 705)
         });

         this.mediaBox0.add(horizontalSeparatorModifier).add(horizontalSeparator);

         this.mediaBox0ProfilePic = new ImageSurface({
            size: [55, 55],
            content: data.data.user.profile_picture,
            properties: {
               border: '1px solid #CFCFCF',
               borderRadius: '55px'
            }
         });

         var ownerProfilePicModifier = new StateModifier({
            transform: Transform.translate(11, 622)
         });

         this.mediaBox0.add(ownerProfilePicModifier).add(this.mediaBox0ProfilePic);

         this.mediaBox0CreatedTime = new Surface({
            size: [120, true],
            content: moment.unix(data.data.created_time).fromNow(true),
            properties: {
               font: '14px Helvetica',
               color: '#BABABA',
               textAlign: 'right'
            }
         });

         var createdTimeModifier = new StateModifier({
            transform: Transform.translate(232, 623)
         });

         this.mediaBox0.add(createdTimeModifier).add(this.mediaBox0CreatedTime);

         var username = '';
         var usernameLimit;

         if (this.mediaBox0CreatedTime.getContent() === 'a few seconds') {
            usernameLimit = 19;
         } else {
            usernameLimit = 22;
         }

         if (data.data.user.username.length > usernameLimit) {
            username = data.data.user.username.substring(0, usernameLimit - 1) + '...';
         } else {
            username = data.data.user.username;
         }

         this.mediaBox0Username = new Surface({
            size: [true, true],
            content: username,
            properties: {
               font: 'bold 17px Helvetica',
               color: '#006699',
            }
         });

         var ownerProfilePicUsernameModifier = new StateModifier({
            transform: Transform.translate(75, 620)
         });

         this.mediaBox0.add(ownerProfilePicUsernameModifier).add(this.mediaBox0Username);

         var imageCaption = data.data.caption ? data.data.caption.text : '';

         this.mediaBox0ImageCaption = new Surface({
            size: [280, 53],
            content: imageCaption,
            properties: {
               font: '14px Helvetica',
               color: '#292929',
               overflow: 'hidden'
            }
         });

         var imageCaptionModifier = new StateModifier({
            transform: Transform.translate(75, 645)
         });

         this.mediaBox0.add(imageCaptionModifier).add(this.mediaBox0ImageCaption);

         var likeButtonModifier = new StateModifier({
            transform: Transform.translate(385, 645)
         });

         var likeButtonColor = data.data.user_has_liked ? this.options.likedMediaButtonColor : this.options.notLikedMediaButtonColor;

         this.mediaBox0LikeButton = new Surface({
            size: [true, true],
            properties: {
               color: likeButtonColor,
               fontSize: '22px'
            },
            classes: ['fa', 'fa-heart']
         });

         this.mediaBox0.add(likeButtonModifier).add(this.mediaBox0LikeButton);

         var likerPosX = 433;
         var likerPosY = 618;
         this.mediaBox0Likers = [];
         var numOfLikes = data.data.likes.count;
         var likes, likerImage;

         for (var i = 0; i < 4; i++) {

            var liker = new ImageSurface({
               size: [36, 36],
               properties: {
                  border: '1px solid #CFCFCF',
                  borderRadius: '4px'
               }
            });

            if (data.data.likes.data[i] !== undefined) {
               liker.setContent(data.data.likes.data[i].profile_picture);
            } else {
               liker.setProperties({display: 'none'});
            }

            var likerModifier = new StateModifier({
               transform: Transform.translate(likerPosX, likerPosY)
            });

            this.mediaBox0.add(likerModifier).add(liker);
            this.mediaBox0Likers.push(liker);
         
            if (i == 1) {
               likerPosX -= 45;
               likerPosY += 45;
            } else {
               likerPosX += 45;
            }
         }

         this.mediaBox0LikersCounter = new Surface({
            size: [40, 40],
            properties: {
               font: '15px Helvetica',
               color: '#7D8F8F',
               fontWeight: 'bold',
               textAlign: 'center'
            }
         });

         if (numOfLikes > 4) {

            if ((numOfLikes - 4) <= 9999) {
               likes = numOfLikes - 4;
            } else if ((numOfLikes - 4) >= 10000 && (numOfLikes - 4) < 1000000) {
               likes = Math.floor((numOfLikes - 4) / 1000).toString() + 'K';
            } else {
               likes = Math.floor((numOfLikes - 4) / 1000000).toString() + 'M';
            }

            likesCounter = '+' + likes.toString();
            this.mediaBox0LikersCounter.setContent(likesCounter);
         } 

         var likerCounterModifier = new StateModifier({
            transform: Transform.translate(540, 648)
         });

         this.mediaBox0.add(likerCounterModifier).add(this.mediaBox0LikersCounter);

         this.mediaBox0CommentsBox = new FlexScrollView({
            autoPipeEvents: true,
            useContainer: true,
            layout: ListLayout,
            layoutOptions: {
               margins: [15, 10]
            }
         });

         $.ajax({url: 'https://api.instagram.com/v1/media/' + this.mediaBox0MediaId + '/comments?access_token=' + this.options.access_token, dataType: 'jsonp'})
            .done(function(data) {

               var commentsSurfaces = [];

               for (var i = data.data.length - 1; i >= 0; i--) {
                  var comment = new ContainerSurface({
                     size: [undefined, 70]
                  });

                  var commentProfilePic = new ImageSurface({
                     size: [36, 36],
                     content: data.data[i].from.profile_picture,
                     properties: {
                        border: '1px solid #CFCFCF',
                        borderRadius: '4px'
                     }
                  });

                  var commentUsername = new Surface({
                     size: [undefined, true],
                     content: data.data[i].from.username,
                     properties: {
                        font: 'bold 14px Helvetica',
                        color: '#006699'
                     }
                  });

                  var commentUsernameModifier = new StateModifier({
                     transform: Transform.translate(46, 0)
                  });

                  var commentCreatedTime = new Surface({
                     size: [120, true],
                     content: moment.unix(data.data[i].created_time).fromNow(true),
                     properties: {
                        font: '14px Helvetica',
                        color: '#BABABA',
                        textAlign: 'right'
                     }
                  });

                  var commentCreatedTimeModifier = new StateModifier({
                     transform: Transform.translate(470, 5)
                  });

                  var commentText = new Surface({
                     size: [540, true],
                     content: data.data[i].text,
                     properties: {
                        font: '13px Helvetica',
                        color: '#292929',
                        overflow: 'hidden'
                     }
                  });

                  var commentTextModifier = new StateModifier({
                     transform: Transform.translate(46, 19)
                  });

                  comment.add(commentProfilePic);
                  comment.add(commentUsernameModifier).add(commentUsername);
                  comment.add(commentCreatedTimeModifier).add(commentCreatedTime);
                  comment.add(commentTextModifier).add(commentText);

                  commentsSurfaces.push(comment);
               }

               this.mediaBox0CommentsBox.sequenceFrom(commentsSurfaces);
            }.bind(this));

         var commentsBoxModifier = new StateModifier({
            size: [600, 215],
            transform: Transform.translate(0, 706)
         });

         this.mediaBox0CommentsBox.pipe(this.syncMediaBox0CommentsBox);

         this.syncMediaBox0CommentsBox.on('update', function(data) {
            var posX = data.delta[0];
            var posY = data.delta[1];

            if (Math.abs(posY) > 5) {
               this.mediaBox0.unpipe(this.syncMediaBox0dirX);
               this.mediaBox1.unpipe(this.syncMediaBox1dirX);
               this.mediaBox2.unpipe(this.syncMediaBox2dirX);
            }
         }.bind(this));

         this.syncMediaBox0CommentsBox.on('end', function() {
            this.mediaBox0.pipe(this.syncMediaBox0dirX);
            this.mediaBox1.pipe(this.syncMediaBox1dirX);
            this.mediaBox2.pipe(this.syncMediaBox2dirX);
         }.bind(this));

         this.mediaBox0.add(commentsBoxModifier).add(this.mediaBox0CommentsBox);
      }.bind(this));

      this.mediaBox0Modifier = new Modifier({
         transform : function(){
            return Transform.translate(this.position0dirX.get(), this.position0dirY.get(), 0);
         }.bind(this)
      });

      this.add(this.mediaBox0Modifier).add(this.mediaBox0);
      this.mediaBox0.pipe(this.syncMediaBox0dirX);
      // this.mediaBox0.pipe(this.syncMediaBox0dirY);

      this.mediaBox2 = new ContainerSurface({
         properties: {
            backgroundColor: '#FEFEFE',
            borderRadius: '5px'
         }
      });

      $.ajax({url: 'https://api.instagram.com/v1/media/' + this.mediaBox2MediaId + '/?access_token=' + this.options.access_token, dataType: 'jsonp'})
      .done(function(data) {
         this.mediaBox2Image = new ImageSurface({
            content: data.data.images.standard_resolution.url,
            size: [610, 610],
            properties: {
               borderTopLeftRadius: '5px',
               borderTopRightRadius: '5px'
            }
         });
         // console.log(image);
         this.mediaBox2.add(this.mediaBox2Image);

         var verticalSeparator = new Surface({
            size: [1, 95],
            properties: {
               backgroundColor: '#E7E7E7'
            }
         });

         var verticalSeparatorModifier = new StateModifier({
            transform: Transform.translate(360, 610)
         });

         this.mediaBox2.add(verticalSeparatorModifier).add(verticalSeparator);

         var horizontalSeparator2 = new Surface({
            size: [610, 1],
            properties: {
               backgroundColor: '#E7E7E7'
            }
         });

         var horizontalSeparator2Modifier = new StateModifier({
            transform: Transform.translate(0, 610)
         });

         this.mediaBox2.add(horizontalSeparator2Modifier).add(horizontalSeparator2);

         var horizontalSeparator = new Surface({
            size: [610, 1],
            properties: {
               backgroundColor: '#E7E7E7'
            }
         });

         var horizontalSeparatorModifier = new StateModifier({
            transform: Transform.translate(0, 705)
         });

         this.mediaBox2.add(horizontalSeparatorModifier).add(horizontalSeparator);

         this.mediaBox2ProfilePic = new ImageSurface({
            size: [55, 55],
            content: data.data.user.profile_picture,
            properties: {
               border: '1px solid #CFCFCF',
               borderRadius: '55px'
            }
         });

         var ownerProfilePicModifier = new StateModifier({
            transform: Transform.translate(11, 622)
         });

         this.mediaBox2.add(ownerProfilePicModifier).add(this.mediaBox2ProfilePic);

         this.mediaBox2CreatedTime = new Surface({
            size: [120, true],
            content: moment.unix(data.data.created_time).fromNow(true),
            properties: {
               font: '14px Helvetica',
               color: '#BABABA',
               textAlign: 'right'
            }
         });

         var createdTimeModifier = new StateModifier({
            transform: Transform.translate(232, 623)
         });

         this.mediaBox2.add(createdTimeModifier).add(this.mediaBox2CreatedTime);
         // console.log(data.data);

         var username = '';
         var usernameLimit;

         if (this.mediaBox2CreatedTime.getContent() === 'a few seconds') {
            usernameLimit = 19;
         } else {
            usernameLimit = 22;
         }

         if (data.data.user.username.length > usernameLimit) {
            username = data.data.user.username.substring(0, usernameLimit - 1) + '...';
         } else {
            username = data.data.user.username;
         }

         this.mediaBox2Username = new Surface({
            size: [true, true],
            content: username,
            properties: {
               font: 'bold 17px Helvetica',
               color: '#006699',
            }
         });

         var ownerProfilePicUsernameModifier = new StateModifier({
            transform: Transform.translate(75, 620)
         });

         this.mediaBox2.add(ownerProfilePicUsernameModifier).add(this.mediaBox2Username);

         var imageCaption = data.data.caption ? data.data.caption.text : '';

         this.mediaBox2ImageCaption = new Surface({
            size: [280, 53],
            content: imageCaption,
            properties: {
               font: '14px Helvetica',
               color: '#292929',
               overflow: 'hidden'
            }
         });

         var imageCaptionModifier = new StateModifier({
            transform: Transform.translate(75, 645)
         });

         this.mediaBox2.add(imageCaptionModifier).add(this.mediaBox2ImageCaption);

         var likeButtonModifier = new StateModifier({
            transform: Transform.translate(385, 645)
         });

         var likeButtonColor = data.data.user_has_liked ? this.options.likedMediaButtonColor : this.options.notLikedMediaButtonColor;

         this.mediaBox2LikeButton = new Surface({
            size: [true, true],
            properties: {
               color: likeButtonColor,
               fontSize: '22px'
            },
            classes: ['fa', 'fa-heart']
         });

         this.mediaBox2.add(likeButtonModifier).add(this.mediaBox2LikeButton);

         var likerPosX = 433;
         var likerPosY = 618;
         this.mediaBox2Likers = [];
         var numOfLikes = data.data.likes.count;
         var likes, likerImage;

         for (var i = 0; i < 4; i++) {

            var liker = new ImageSurface({
               size: [36, 36],
               properties: {
                  border: '1px solid #CFCFCF',
                  borderRadius: '4px'
               }
            });

            if (data.data.likes.data[i] !== undefined) {
               liker.setContent(data.data.likes.data[i].profile_picture);
            } else {
               liker.setProperties({display: 'none'});
            }

            var likerModifier = new StateModifier({
               transform: Transform.translate(likerPosX, likerPosY)
            });

            this.mediaBox2.add(likerModifier).add(liker);
            this.mediaBox2Likers.push(liker);
         
            if (i == 1) {
               likerPosX -= 45;
               likerPosY += 45;
            } else {
               likerPosX += 45;
            }
         }

         this.mediaBox2LikersCounter = new Surface({
            size: [40, 40],
            properties: {
               font: '15px Helvetica',
               color: '#7D8F8F',
               fontWeight: 'bold',
               textAlign: 'center'
            }
         });

         if (numOfLikes > 4) {

            if ((numOfLikes - 4) <= 9999) {
               likes = numOfLikes - 4;
            } else if ((numOfLikes - 4) >= 10000 && (numOfLikes - 4) < 1000000) {
               likes = Math.floor((numOfLikes - 4) / 1000).toString() + 'K';
            } else {
               likes = Math.floor((numOfLikes - 4) / 1000000).toString() + 'M';
            }

            likesCounter = '+' + likes.toString();
            this.mediaBox2LikersCounter.setContent(likesCounter);
         } 

         var likerCounterModifier = new StateModifier({
            transform: Transform.translate(540, 648)
         });

         this.mediaBox2.add(likerCounterModifier).add(this.mediaBox2LikersCounter);

         this.mediaBox2CommentsBox = new FlexScrollView({
            autoPipeEvents: true,
            useContainer: true,
            layout: ListLayout,
            layoutOptions: {
               margins: [15, 10]
            }
         });

         $.ajax({url: 'https://api.instagram.com/v1/media/' + this.mediaBox2MediaId + '/comments?access_token=' + this.options.access_token, dataType: 'jsonp'})
            .done(function(data) {

               var commentsSurfaces = [];

               for (var i = data.data.length - 1; i >= 0; i--) {
                  var comment = new ContainerSurface({
                     size: [undefined, 70]
                  });

                  var commentProfilePic = new ImageSurface({
                     size: [36, 36],
                     content: data.data[i].from.profile_picture,
                     properties: {
                        border: '1px solid #CFCFCF',
                        borderRadius: '4px'
                     }
                  });

                  var commentUsername = new Surface({
                     size: [undefined, true],
                     content: data.data[i].from.username,
                     properties: {
                        font: 'bold 14px Helvetica',
                        color: '#006699'
                     }
                  });

                  var commentUsernameModifier = new StateModifier({
                     transform: Transform.translate(46, 0)
                  });

                  var commentCreatedTime = new Surface({
                     size: [120, true],
                     content: moment.unix(data.data[i].created_time).fromNow(true),
                     properties: {
                        font: '14px Helvetica',
                        color: '#BABABA',
                        textAlign: 'right'
                     }
                  });

                  var commentCreatedTimeModifier = new StateModifier({
                     transform: Transform.translate(470, 5)
                  });

                  var commentText = new Surface({
                     size: [540, true],
                     content: data.data[i].text,
                     properties: {
                        font: '13px Helvetica',
                        color: '#292929',
                        overflow: 'hidden'
                     }
                  });

                  var commentTextModifier = new StateModifier({
                     transform: Transform.translate(46, 19)
                  });

                  comment.add(commentProfilePic);
                  comment.add(commentUsernameModifier).add(commentUsername);
                  comment.add(commentCreatedTimeModifier).add(commentCreatedTime);
                  comment.add(commentTextModifier).add(commentText);

                  commentsSurfaces.push(comment);
               }

               this.mediaBox2CommentsBox.sequenceFrom(commentsSurfaces);
            }.bind(this));

         var commentsBoxModifier = new StateModifier({
            size: [600, 215],
            transform: Transform.translate(0, 706)
         });

         this.mediaBox2CommentsBox.pipe(this.syncMediaBox2CommentsBox);

         this.syncMediaBox2CommentsBox.on('update', function(data) {
            var posX = data.delta[0];
            var posY = data.delta[1];

            if (Math.abs(posY) > 5) {
               this.mediaBox0.unpipe(this.syncMediaBox0dirX);
               this.mediaBox1.unpipe(this.syncMediaBox1dirX);
               this.mediaBox2.unpipe(this.syncMediaBox2dirX);
            }
         }.bind(this));

         this.syncMediaBox2CommentsBox.on('end', function() {
            this.mediaBox0.pipe(this.syncMediaBox0dirX);
            this.mediaBox1.pipe(this.syncMediaBox1dirX);
            this.mediaBox2.pipe(this.syncMediaBox2dirX);
         }.bind(this));

         this.mediaBox2.add(commentsBoxModifier).add(this.mediaBox2CommentsBox);

      }.bind(this));

      this.mediaBox2Modifier = new Modifier({
         transform : function(){
            return Transform.translate(this.position2dirX.get(),this.position2dirY.get(),0);
         }.bind(this)
      });

      this.add(this.mediaBox2Modifier).add(this.mediaBox2);
      this.mediaBox2.pipe(this.syncMediaBox2dirX);
      // this.mediaBox2.pipe(this.syncMediaBox2dirY);
      // 
      var hideControlButtonsActive = true;

      this.syncMediaBox1dirX.on('update', function(data) {

         if (hideControlButtonsActive) {
            this._eventOutput.trigger('hideControlButtons');
            hideControlButtonsActive = false;
         }

         var currentPosition0dirX = this.position0dirX.get();
         var currentPosition1dirX = this.position1dirX.get();
         var currentPosition2dirX = this.position2dirX.get();
         var delta = data.delta;

         if (currentPosition1dirX > 0 && this.options.mediaIds.indexOf(this.mediaBox1MediaId) === 0) {
            this.position0dirX.set(currentPosition0dirX + delta / 4);  
            this.position1dirX.set(currentPosition1dirX + delta / 4);  
            this.position2dirX.set(currentPosition2dirX + delta / 4);     
         } else {
            this.position0dirX.set(currentPosition0dirX + delta);  
            this.position1dirX.set(currentPosition1dirX + delta);  
            this.position2dirX.set(currentPosition2dirX + delta);  
         }

         if (Math.abs(data.delta) > 0.5) {
            this.mediaBox1CommentsBox.setOptions({enabled: false});
            this.mediaBox1.unpipe(this.syncMediaBox1dirY); 
         }
      }.bind(this));

      this.syncMediaBox1dirY.on('update', function(data) {
         var currentPosition1dirY = this.position1dirY.get();
         var delta = data.delta;
         
         this.position1dirY.set(currentPosition1dirY + delta);  

         if (Math.abs(data.delta) > 0.5) {
            this.mediaBox1.unpipe(this.syncMediaBox1dirX); 
         }
      }.bind(this));

      this.syncMediaBox1dirY.on('end', function(data) {
         // this.mediaBox1.pipe(this.syncMediaBox1dirX);
         var currentPosition = this.position1dirY.get();
         

         var velocity = data.velocity;
         var showFeedViewData = {};
         
         if (velocity > 0.8) {
            showFeedViewData.pos = 1000;
            showFeedViewData.velocity = velocity;
            this.trigger('showFeedView', showFeedViewData);
         } else if (velocity < -0.8) {
            showFeedViewData.pos = -1000;
            showFeedViewData.velocity = velocity;
            this.trigger('showFeedView', showFeedViewData);
         } else {
            if (Math.abs(currentPosition) < this.options.DISPLACEMENT_THRESHOLD_DIR_Y) {
               this.position1dirY.set(0, {
                 method : 'snap',
                 period : 200    
              });
            } else {
               if (currentPosition > 0) {
                  showFeedViewData.pos = 1000;
                  this.trigger('showFeedView', showFeedViewData);
               } else {
                  showFeedViewData.pos = -1000;
                  this.trigger('showFeedView', showFeedViewData);
               }
            }
         }

         
      }.bind(this));

      this.syncMediaBox1dirX.on('end', function(data) {
         hideControlButtonsActive = true;

         if (this.mediaBox1CommentsBox) {
            this.mediaBox1CommentsBox.setOptions({enabled: true});
         }

         // this.mediaBox1.pipe(this.syncMediaBox1dirY); 
         var currentPosition = this.position1dirX.get();
         var velocity = data.velocity;
         var isFirstMedia = this.options.mediaIds.indexOf(this.mediaBox1MediaId) === 0 ? true : false;
         var isSecondMedia = this.options.mediaIds.indexOf(this.mediaBox1MediaId) === 1 ? true : false;
         var isPreviousMediaFirst = (this.options.mediaIds.indexOf(this.mediaBox1MediaId) - 1) === 0 ? true : false;

         if (velocity > 0 || currentPosition > 0) {
            if (isFirstMedia) {
               isPreviousMediaFirst = true;
            }

            Timer.setTimeout(function() {
               this._eventOutput.trigger('showControlButtons', {isFirstMedia: isPreviousMediaFirst});
            }.bind(this), 400);
         } else {
            Timer.setTimeout(function() {
               this._eventOutput.trigger('showControlButtons', {isFirstMedia: false});
            }.bind(this), 400);
         }

         if (velocity > 0.8 && !isFirstMedia) {
            this.position0dirX.set(0, {
                duration: 300, curve: Easing.outQuad
            }, function() {
               if (!isSecondMedia) {
                  var mediaEntities = {
                     image: this.mediaBox2Image,
                     profilePic: this.mediaBox2ProfilePic,
                     username: this.mediaBox2Username,
                     imageCaption: this.mediaBox2ImageCaption,
                     createdTime: this.mediaBox2CreatedTime,
                     likeButton: this.mediaBox2LikeButton,
                     likers: this.mediaBox2Likers,
                     likersCounter: this.mediaBox2LikersCounter,
                     commentsBox: this.mediaBox2CommentsBox
                  };
                  _updateMediaData.apply(this, [mediaEntities, 0, 'prev']);
                  this._eventOutput.trigger('scrollToPrevMedia');
               }
            }.bind(this));

            this.position1dirX.set(780, {
                duration: 300, curve: Easing.outQuad
            });

            if (!isSecondMedia) {
               this.mediaBox2Modifier.setOpacity(0);
               this.position2dirX.set(-780);
               this.mediaBox2Modifier.setOpacity(1);
            }
         } else if (velocity < -0.8) {
            this.mediaBox0Modifier.setOpacity(0);
            this.position0dirX.set(780);
            this.mediaBox0Modifier.setOpacity(1);

            this.position1dirX.set(-780, {
                duration: 300, curve: Easing.outQuad
            });

            this.position2dirX.set(0, {
                duration: 300, curve: Easing.outQuad
            }, function() {
               var mediaEntities = {
                  image: this.mediaBox0Image,
                  profilePic: this.mediaBox0ProfilePic,
                  username: this.mediaBox0Username,
                  imageCaption: this.mediaBox0ImageCaption,
                  createdTime: this.mediaBox0CreatedTime,
                  likeButton: this.mediaBox0LikeButton,
                  likers: this.mediaBox0Likers,
                  likersCounter: this.mediaBox0LikersCounter,
                  commentsBox: this.mediaBox0CommentsBox
               };
               _updateMediaData.apply(this, [mediaEntities, 2, 'next']);
               this._eventOutput.trigger('scrollToNextMedia');
            }.bind(this));

            
         } else {
            if (Math.abs(currentPosition) < this.options.DISPLACEMENT_THRESHOLD_DIR_X) {
               if (!isFirstMedia) {
                  this.position0dirX.set(-780, {
                      duration: 300, curve: Easing.outQuad
                  });
               }

               this.position1dirX.set(0, {
                   duration: 300, curve: Easing.outQuad
               });

               this.position2dirX.set(780, {
                   duration: 300, curve: Easing.outQuad
               });
            } else {
               if (currentPosition > 0 && !isFirstMedia) {
                  this.position0dirX.set(0, {
                      duration: 300, curve: Easing.outQuad
                  }, function() {
                     if (!isSecondMedia) {
                        var mediaEntities = {
                           image: this.mediaBox2Image,
                           profilePic: this.mediaBox2ProfilePic,
                           username: this.mediaBox2Username,
                           imageCaption: this.mediaBox2ImageCaption,
                           createdTime: this.mediaBox2CreatedTime,
                           likeButton: this.mediaBox2LikeButton,
                           likers: this.mediaBox2Likers,
                           likersCounter: this.mediaBox2LikersCounter,
                           commentsBox: this.mediaBox2CommentsBox
                        };
                        _updateMediaData.apply(this, [mediaEntities, 0, 'prev']);
                        this._eventOutput.trigger('scrollToPrevMedia');
                     }
                  }.bind(this));

                  this.position1dirX.set(780, {
                      duration: 300, curve: Easing.outQuad
                  });

                  if (!isSecondMedia) {
                     this.mediaBox2Modifier.setOpacity(0);
                     this.position2dirX.set(-780);
                     this.mediaBox2Modifier.setOpacity(1);
                  }
               } else {
                  this.mediaBox0Modifier.setOpacity(0);
                  this.position0dirX.set(780);
                  this.mediaBox0Modifier.setOpacity(1);

                  this.position1dirX.set(-780, {
                      duration: 300, curve: Easing.outQuad
                  });

                  this.position2dirX.set(0, {
                      duration: 300, curve: Easing.outQuad
                  }, function() {
                     var mediaEntities = {
                        image: this.mediaBox0Image,
                        profilePic: this.mediaBox0ProfilePic,
                        username: this.mediaBox0Username,
                        imageCaption: this.mediaBox0ImageCaption,
                        createdTime: this.mediaBox0CreatedTime,
                        likeButton: this.mediaBox0LikeButton,
                        likers: this.mediaBox0Likers,
                        likersCounter: this.mediaBox0LikersCounter,
                        commentsBox: this.mediaBox0CommentsBox
                     };
                     _updateMediaData.apply(this, [mediaEntities, 2, 'next']);
                     this._eventOutput.trigger('scrollToNextMedia');
                  }.bind(this));

                  
               }
            }    
         }
      }.bind(this));

      this.syncMediaBox0dirX.on('update', function(data) {

         if (hideControlButtonsActive) {
            this._eventOutput.trigger('hideControlButtons');
            hideControlButtonsActive = false;
         }

         var currentPosition0dirX = this.position0dirX.get();
         var currentPosition1dirX = this.position1dirX.get();
         var currentPosition2dirX = this.position2dirX.get();
         var delta = data.delta;

         if (currentPosition0dirX > 0 && this.options.mediaIds.indexOf(this.mediaBox0MediaId) === 0) {
            this.position0dirX.set(currentPosition0dirX + delta / 4);  
            this.position1dirX.set(currentPosition1dirX + delta / 4);  
            this.position2dirX.set(currentPosition2dirX + delta / 4);     
         } else {
            this.position0dirX.set(currentPosition0dirX + delta);  
            this.position1dirX.set(currentPosition1dirX + delta);  
            this.position2dirX.set(currentPosition2dirX + delta);  
         }

         if (Math.abs(data.delta) > 0.5) {
            this.mediaBox0.unpipe(this.syncMediaBox0dirY); 
         }
         
      }.bind(this));

      this.syncMediaBox0dirY.on('update', function(data) {
         var currentPosition0dirY = this.position0dirY.get();
         var delta = data.delta;
         
         this.position0dirY.set(currentPosition0dirY + delta);  

         if (Math.abs(data.delta) > 0.5) {
            this.mediaBox0.unpipe(this.syncMediaBox0dirX); 
         }
      }.bind(this));

      this.syncMediaBox0dirY.on('end', function(data) {
         // this.mediaBox0.pipe(this.syncMediaBox0dirX);
         var currentPosition = this.position0dirY.get();
         

         var velocity = data.velocity;
         var showFeedViewData = {};
         
         if (velocity > 0.8) {
            showFeedViewData.pos = 1000;
            showFeedViewData.velocity = velocity;
            this.trigger('showFeedView', showFeedViewData);
         } else if (velocity < -0.8) {
            showFeedViewData.pos = -1000;
            showFeedViewData.velocity = velocity;
            this.trigger('showFeedView', showFeedViewData);
         } else {
            if (Math.abs(currentPosition) < this.options.DISPLACEMENT_THRESHOLD_DIR_Y) {
               this.position0dirY.set(0, {
                 method : 'snap',
                 period : 200    
              });
            } else {
               if (currentPosition > 0) {
                  showFeedViewData.pos = 1000;
                  this.trigger('showFeedView', showFeedViewData);
               } else {
                  showFeedViewData.pos = -1000;
                  this.trigger('showFeedView', showFeedViewData);
               }
            }
         }

         
      }.bind(this));

      this.syncMediaBox0dirX.on('end', function(data){

        
         // this.mediaBox0.pipe(this.syncMediaBox0dirY); 
         var currentPosition = this.position0dirX.get();
         var velocity = data.velocity;
         var isFirstMedia = this.options.mediaIds.indexOf(this.mediaBox0MediaId) === 0 ? true : false;
         var isSecondMedia = this.options.mediaIds.indexOf(this.mediaBox0MediaId) === 1 ? true : false;
         var isPreviousMediaFirst = (this.options.mediaIds.indexOf(this.mediaBox0MediaId) - 1) === 0 ? true : false;

         if (velocity !== 0) {
            hideControlButtonsActive = true;

            if (velocity > 0 || currentPosition > 0) {
               if (isFirstMedia) {
                  isPreviousMediaFirst = true;
               }

               Timer.setTimeout(function() {
                  this._eventOutput.trigger('showControlButtons', {isFirstMedia: isPreviousMediaFirst});
               }.bind(this), 400);
            } else {
               Timer.setTimeout(function() {
                  this._eventOutput.trigger('showControlButtons', {isFirstMedia: false});
               }.bind(this), 400);
            }

            if (velocity > 0.8 && !isFirstMedia) {
               this.position0dirX.set(780, {
                   duration: 300, curve: Easing.outQuad
               });

               if (!isSecondMedia) {
                  this.mediaBox1Modifier.setOpacity(0);
                  this.position1dirX.set(-780);
                  this.mediaBox1Modifier.setOpacity(1);
               }

               this.position2dirX.set(0, {
                   duration: 300, curve: Easing.outQuad
               }, function() {
                  if (!isSecondMedia) {
                     var mediaEntities = {
                        image: this.mediaBox1Image,
                        profilePic: this.mediaBox1ProfilePic,
                        username: this.mediaBox1Username,
                        imageCaption: this.mediaBox1ImageCaption,
                        createdTime: this.mediaBox1CreatedTime,
                        likeButton: this.mediaBox1LikeButton,
                        likers: this.mediaBox1Likers,
                        likersCounter: this.mediaBox1LikersCounter,
                        commentsBox: this.mediaBox1CommentsBox
                     };
                     _updateMediaData.apply(this, [mediaEntities, 2, 'prev']);
                     this._eventOutput.trigger('scrollToPrevMedia');
                  }
               }.bind(this));
            } else if (velocity < -0.8) {
               this.position0dirX.set(-780, {
                   duration: 300, curve: Easing.outQuad
               });

               this.position1dirX.set(0, {
                   duration: 300, curve: Easing.outQuad
               }, function() {
                  var mediaEntities = {
                     image: this.mediaBox2Image,
                     profilePic: this.mediaBox2ProfilePic,
                     username: this.mediaBox2Username,
                     imageCaption: this.mediaBox2ImageCaption,
                     createdTime: this.mediaBox2CreatedTime,
                     likeButton: this.mediaBox2LikeButton,
                     likers: this.mediaBox2Likers,
                     likersCounter: this.mediaBox2LikersCounter,
                     commentsBox: this.mediaBox2CommentsBox
                  };
                  _updateMediaData.apply(this, [mediaEntities, 1, 'next']);
                  this._eventOutput.trigger('scrollToNextMedia');
               }.bind(this));

               this.mediaBox2Modifier.setOpacity(0);
               this.position2dirX.set(780);
               this.mediaBox2Modifier.setOpacity(1);

               
            } else {
               if (Math.abs(currentPosition) < this.options.DISPLACEMENT_THRESHOLD_DIR_X) {
                  this.position0dirX.set(0, {
                      duration: 300, curve: Easing.outQuad
                  });

                  this.position1dirX.set(780, {
                      duration: 300, curve: Easing.outQuad
                  });

                  if (!isFirstMedia) {
                     this.position2dirX.set(-780, {
                         duration: 300, curve: Easing.outQuad
                     });
                  }
               } else {
                  if (currentPosition > 0 && !isFirstMedia) {
                     this.position0dirX.set(780, {
                         duration: 300, curve: Easing.outQuad
                     });

                     if (!isSecondMedia) {
                        this.mediaBox2Modifier.setOpacity(0);
                        this.position1dirX.set(-780);
                        this.mediaBox2Modifier.setOpacity(1);
                     }

                     this.position2dirX.set(0, {
                         duration: 300, curve: Easing.outQuad
                     }, function() {
                        if (!isSecondMedia) {
                           var mediaEntities = {
                              image: this.mediaBox1Image,
                              profilePic: this.mediaBox1ProfilePic,
                              username: this.mediaBox1Username,
                              imageCaption: this.mediaBox1ImageCaption,
                              createdTime: this.mediaBox1CreatedTime,
                              likeButton: this.mediaBox1LikeButton,
                              likers: this.mediaBox1Likers,
                              likersCounter: this.mediaBox1LikersCounter,
                              commentsBox: this.mediaBox1CommentsBox
                           };
                           _updateMediaData.apply(this, [mediaEntities, 2, 'prev']);
                           this._eventOutput.trigger('scrollToPrevMedia');
                        }
                     }.bind(this));
                  } else {
                     this.position0dirX.set(-780, {
                         duration: 300, curve: Easing.outQuad
                     });

                     this.mediaBox2Modifier.setOpacity(0);
                     this.position2dirX.set(780);
                     this.mediaBox2Modifier.setOpacity(1);

                     this.position1dirX.set(0, {
                         duration: 300, curve: Easing.outQuad
                     }, function() {
                        var mediaEntities = {
                           image: this.mediaBox2Image,
                           profilePic: this.mediaBox2ProfilePic,
                           username: this.mediaBox2Username,
                           imageCaption: this.mediaBox2ImageCaption,
                           createdTime: this.mediaBox2CreatedTime,
                           likeButton: this.mediaBox2LikeButton,
                           likers: this.mediaBox2Likers,
                           likersCounter: this.mediaBox2LikersCounter,
                           commentsBox: this.mediaBox2CommentsBox
                        };
                        _updateMediaData.apply(this, [mediaEntities, 1, 'next']);
                        this._eventOutput.trigger('scrollToNextMedia');
                     }.bind(this));

                     
                  }
                  
               }    
            }
         }
         
      }.bind(this));

      this.syncMediaBox2dirX.on('update', function(data) {

         if (hideControlButtonsActive) {
            this._eventOutput.trigger('hideControlButtons');
            hideControlButtonsActive = false;
         }

         var currentPosition0dirX = this.position0dirX.get();
         var currentPosition1dirX = this.position1dirX.get();
         var currentPosition2dirX = this.position2dirX.get();
         var delta = data.delta;

         if (currentPosition2dirX > 0 && this.options.mediaIds.indexOf(this.mediaBox2MediaId) === 0) {
            this.position0dirX.set(currentPosition0dirX + delta / 4);  
            this.position1dirX.set(currentPosition1dirX + delta / 4);  
            this.position2dirX.set(currentPosition2dirX + delta / 4);     
         } else {
            this.position0dirX.set(currentPosition0dirX + delta);  
            this.position1dirX.set(currentPosition1dirX + delta);  
            this.position2dirX.set(currentPosition2dirX + delta);  
         }

         if (Math.abs(data.delta) > 0.5) {
            this.mediaBox2.unpipe(this.syncMediaBox0dirY); 
         }
      }.bind(this));

      this.syncMediaBox2dirY.on('update', function(data) {
         var currentPosition2dirY = this.position2dirY.get();
         var delta = data.delta;
         
         this.position2dirY.set(currentPosition2dirY + delta);  

         if (Math.abs(data.delta) > 0.5) {
            this.mediaBox2.unpipe(this.syncMediaBox2dirX); 
         }
      }.bind(this));

      this.syncMediaBox2dirY.on('end', function(data) {
         // this.mediaBox2.pipe(this.syncMediaBox2dirX);
         var currentPosition = this.position2dirY.get();
         

         var velocity = data.velocity;
         var showFeedViewData = {};
         
         if (velocity > 0.8) {
            showFeedViewData.pos = 1000;
            showFeedViewData.velocity = velocity;
            this.trigger('showFeedView', showFeedViewData);
         } else if (velocity < -0.8) {
            showFeedViewData.pos = -1000;
            showFeedViewData.velocity = velocity;
            this.trigger('showFeedView', showFeedViewData);
         } else {
            if (Math.abs(currentPosition) < this.options.DISPLACEMENT_THRESHOLD_DIR_Y) {
               this.position2dirY.set(0, {
                 method : 'snap',
                 period : 200    
              });
            } else {
               if (currentPosition > 0) {
                  showFeedViewData.pos = 1000;
                  this.trigger('showFeedView', showFeedViewData);
               } else {
                  showFeedViewData.pos = -1000;
                  this.trigger('showFeedView', showFeedViewData);
               }
            }
         }

         
      }.bind(this));

      this.syncMediaBox2dirX.on('end', function(data){

         hideControlButtonsActive = true;

         // this.mediaBox2.pipe(this.syncMediaBox2dirY); 
         var currentPosition = this.position2dirX.get();
         var velocity = data.velocity;
         var isFirstMedia = this.options.mediaIds.indexOf(this.mediaBox2MediaId) === 0 ? true : false;
         var isSecondMedia = this.options.mediaIds.indexOf(this.mediaBox2MediaId) === 1 ? true : false;
         var isPreviousMediaFirst = (this.options.mediaIds.indexOf(this.mediaBox2MediaId) - 1) === 0 ? true : false;

         if (velocity > 0 || currentPosition > 0) {
            if (isFirstMedia) {
               isPreviousMediaFirst = true;
            }

            Timer.setTimeout(function() {
               this._eventOutput.trigger('showControlButtons', {isFirstMedia: isPreviousMediaFirst});
            }.bind(this), 400);
         } else {
            Timer.setTimeout(function() {
               this._eventOutput.trigger('showControlButtons', {isFirstMedia: false});
            }.bind(this), 400);
         }

         if (velocity > 0.8 && !isFirstMedia) {
            if (!isSecondMedia) {
               this.mediaBox0Modifier.setOpacity(0);
               this.position0dirX.set(-780);
               this.mediaBox0Modifier.setOpacity(1);
            }

            this.position1dirX.set(0, {
                duration: 300, curve: Easing.outQuad
            }, function() {
               if (!isSecondMedia) {
                  var mediaEntities = {
                     image: this.mediaBox0Image,
                     profilePic: this.mediaBox0ProfilePic,
                     username: this.mediaBox0Username,
                     imageCaption: this.mediaBox0ImageCaption,
                     createdTime: this.mediaBox0CreatedTime,
                     likeButton: this.mediaBox0LikeButton,
                     likers: this.mediaBox0Likers,
                     likersCounter: this.mediaBox0LikersCounter,
                     commentsBox: this.mediaBox0CommentsBox
                  };
                  _updateMediaData.apply(this, [mediaEntities, 1, 'prev']);
                  this._eventOutput.trigger('scrollToPrevMedia');
               }
            }.bind(this));

            this.position2dirX.set(780, {
                duration: 300, curve: Easing.outQuad
            });
         } else if (velocity < -0.8) {
            this.position0dirX.set(0, {
                duration: 300, curve: Easing.outQuad
            });

            this.mediaBox1Modifier.setOpacity(0);
            this.position1dirX.set(780);
            this.mediaBox1Modifier.setOpacity(1);

            this.position2dirX.set(-780, {
                duration: 300, curve: Easing.outQuad
            }, function() {
               var mediaEntities = {
                  image: this.mediaBox1Image,
                  profilePic: this.mediaBox1ProfilePic,
                  username: this.mediaBox1Username,
                  imageCaption: this.mediaBox1ImageCaption,
                  createdTime: this.mediaBox1CreatedTime,
                  likeButton: this.mediaBox1LikeButton,
                  likers: this.mediaBox1Likers,
                  likersCounter: this.mediaBox1LikersCounter,
                  commentsBox: this.mediaBox1CommentsBox
               };
               _updateMediaData.apply(this, [mediaEntities, 0, 'next']);
               this._eventOutput.trigger('scrollToNextMedia');
            }.bind(this));

            
         } else {
            if (Math.abs(currentPosition) < this.options.DISPLACEMENT_THRESHOLD_DIR_X) {
               this.position0dirX.set(780, {
                   duration: 300, curve: Easing.outQuad
               });

               if (!isFirstMedia) {
                  this.position1dirX.set(-780, {
                      duration: 300, curve: Easing.outQuad
                  });
               }

               this.position2dirX.set(0, {
                   duration: 300, curve: Easing.outQuad
               });
            } else {
               if (currentPosition > 0 && !isFirstMedia) {
                  this.position1dirX.set(0, {
                      duration: 300, curve: Easing.outQuad
                  }, function() {
                     if (!isSecondMedia) {
                        var mediaEntities = {
                           image: this.mediaBox0Image,
                           profilePic: this.mediaBox0ProfilePic,
                           username: this.mediaBox0Username,
                           imageCaption: this.mediaBox0ImageCaption,
                           createdTime: this.mediaBox0CreatedTime,
                           likeButton: this.mediaBox0LikeButton,
                           likers: this.mediaBox0Likers,
                           likersCounter: this.mediaBox0LikersCounter,
                           commentsBox: this.mediaBox0CommentsBox
                        };
                        _updateMediaData.apply(this, [mediaEntities, 1, 'prev']);
                        this._eventOutput.trigger('scrollToPrevMedia');
                     }
                  }.bind(this));

                  if (!isSecondMedia) {
                     this.mediaBox0Modifier.setOpacity(0);
                     this.position0dirX.set(-780);
                     this.mediaBox0Modifier.setOpacity(1);
                  }

                  this.position2dirX.set(780, {
                      duration: 300, curve: Easing.outQuad
                  });
               } else {
                  this.position0dirX.set(0, {
                      duration: 300, curve: Easing.outQuad
                  });

                  this.mediaBox1Modifier.setOpacity(0);
                  this.position1dirX.set(780);
                  this.mediaBox1Modifier.setOpacity(1);

                  this.position2dirX.set(-780, {
                      duration: 300, curve: Easing.outQuad
                  }, function() {
                     var mediaEntities = {
                        image: this.mediaBox1Image,
                        profilePic: this.mediaBox1ProfilePic,
                        username: this.mediaBox1Username,
                        imageCaption: this.mediaBox1ImageCaption,
                        createdTime: this.mediaBox1CreatedTime,
                        likeButton: this.mediaBox1LikeButton,
                        likers: this.mediaBox1Likers,
                        likersCounter: this.mediaBox1LikersCounter,
                        commentsBox: this.mediaBox1CommentsBox
                     };
                     _updateMediaData.apply(this, [mediaEntities, 0, 'next']);
                     this._eventOutput.trigger('scrollToNextMedia');
                  }.bind(this));


               }
               
            }    
         }

      }.bind(this));
    }

    function _updateMediaData(mediaEntities, mediaBoxPos, direction) {
      var mediaId;
      var image = mediaEntities.image;
      var profilePic = mediaEntities.profilePic;
      var username = mediaEntities.username;
      var imageCaption = mediaEntities.imageCaption;
      var createdTime = mediaEntities.createdTime;
      var likeButton = mediaEntities.likeButton;
      var likers = mediaEntities.likers;
      var likersCounter = mediaEntities.likersCounter;
      var commentsBox = mediaEntities.commentsBox;

      if (direction === 'next') {
         if (mediaBoxPos === 0) {
            mediaId = this.mediaBox0MediaId;
            var mediaIdPos = this.options.mediaIds.indexOf(mediaId);
            var nextMediaId = this.options.mediaIds[mediaIdPos + 1];
            this.mediaBox1MediaId = nextMediaId;
         } else if (mediaBoxPos === 1) {
            mediaId = this.mediaBox1MediaId;
            var mediaIdPos = this.options.mediaIds.indexOf(mediaId);
            var nextMediaId = this.options.mediaIds[mediaIdPos + 1];
            this.mediaBox2MediaId = nextMediaId;
         } else if (mediaBoxPos === 2) {
            mediaId = this.mediaBox2MediaId;
            var mediaIdPos = this.options.mediaIds.indexOf(mediaId);
            var nextMediaId = this.options.mediaIds[mediaIdPos + 1];
            this.mediaBox0MediaId = nextMediaId;
         }

         
          $.ajax({url: 'https://api.instagram.com/v1/media/' + nextMediaId + '/?access_token=' + this.options.access_token, dataType: 'jsonp'})
          .done(function(data) {
            image.setContent(data.data.images.standard_resolution.url);
            profilePic.setContent(data.data.user.profile_picture);
            createdTime.setContent(moment.unix(data.data.created_time).fromNow(true));

            var usernameText = '';
            var usernameLimit;

            if (createdTime.getContent() === 'a few seconds') {
               usernameLimit = 19;
            } else {
               usernameLimit = 22;
            }

            if (data.data.user.username.length > usernameLimit) {
               usernameText = data.data.user.username.substring(0, usernameLimit - 1) + '...';
            } else {
               usernameText = data.data.user.username;
            }

            username.setContent(usernameText);

            var imageCaptionText = data.data.caption ? data.data.caption.text : '';

            imageCaption.setContent(imageCaptionText);

            var likeButtonColor = data.data.user_has_liked ? this.options.likedMediaButtonColor : this.options.notLikedMediaButtonColor;

            likeButton.setProperties({color: likeButtonColor});

            for (var i = 0; i < 4; i++) {
               if (data.data.likes.data[i] !== undefined) {
                  likers[i].setProperties({display: 'initial'});
                  likers[i].setContent(data.data.likes.data[i].profile_picture);
               } else {
                  likers[i].setProperties({display: 'none'});
               }
            }

            var numOfLikes = data.data.likes.count;

            if (numOfLikes > 4) {

               if ((numOfLikes - 4) <= 9999) {
                  likes = numOfLikes - 4;
               } else if ((numOfLikes - 4) >= 10000 && (numOfLikes - 4) < 1000000) {
                  likes = Math.floor((numOfLikes - 4) / 1000).toString() + 'K';
               } else {
                  likes = Math.floor((numOfLikes - 4) / 1000000).toString() + 'M';
               }

               likersCounter.setProperties({display: 'initial'});
               likersCounter.setContent('+' + likes.toString());
            } else {
               likersCounter.setProperties({display: 'none'});
            }

            $.ajax({url: 'https://api.instagram.com/v1/media/' + nextMediaId + '/comments?access_token=' + this.options.access_token, dataType: 'jsonp'})
               .done(function(data) {

                  var commentsSurfaces = [];

                  for (var i = data.data.length - 1; i >= 0; i--) {
                     var comment = new ContainerSurface({
                        size: [undefined, 70]
                     });

                     var commentProfilePic = new ImageSurface({
                        size: [36, 36],
                        content: data.data[i].from.profile_picture,
                        properties: {
                           border: '1px solid #CFCFCF',
                           borderRadius: '4px'
                        }
                     });

                     var commentUsername = new Surface({
                        size: [undefined, true],
                        content: data.data[i].from.username,
                        properties: {
                           font: 'bold 14px Helvetica',
                           color: '#006699'
                        }
                     });

                     var commentUsernameModifier = new StateModifier({
                        transform: Transform.translate(46, 0)
                     });

                     var commentCreatedTime = new Surface({
                        size: [120, true],
                        content: moment.unix(data.data[i].created_time).fromNow(true),
                        properties: {
                           font: '14px Helvetica',
                           color: '#BABABA',
                           textAlign: 'right'
                        }
                     });

                     var commentCreatedTimeModifier = new StateModifier({
                        transform: Transform.translate(470, 5)
                     });

                     var commentText = new Surface({
                        size: [540, true],
                        content: data.data[i].text,
                        properties: {
                           font: '13px Helvetica',
                           color: '#292929',
                           overflow: 'hidden'
                        }
                     });

                     var commentTextModifier = new StateModifier({
                        transform: Transform.translate(46, 19)
                     });

                     comment.add(commentProfilePic);
                     comment.add(commentUsernameModifier).add(commentUsername);
                     comment.add(commentCreatedTimeModifier).add(commentCreatedTime);
                     comment.add(commentTextModifier).add(commentText);

                     commentsSurfaces.push(comment);
                  }

                  commentsBox.goToFirstPage();
                  commentsBox.sequenceFrom(commentsSurfaces);
               }.bind(this));
          }.bind(this)); 
      } else if (direction === 'prev') {
         if (mediaBoxPos === 0) {
            mediaId = this.mediaBox0MediaId;
            var mediaIdPos = this.options.mediaIds.indexOf(mediaId);
            var prevMediaId = this.options.mediaIds[mediaIdPos - 1];
            this.mediaBox2MediaId = prevMediaId;
         } else if (mediaBoxPos === 1) {
            mediaId = this.mediaBox1MediaId;
            var mediaIdPos = this.options.mediaIds.indexOf(mediaId);
            var prevMediaId = this.options.mediaIds[mediaIdPos - 1];
            this.mediaBox0MediaId = prevMediaId;
         } else if (mediaBoxPos === 2) {
            mediaId = this.mediaBox2MediaId;
            var mediaIdPos = this.options.mediaIds.indexOf(mediaId);
            var prevMediaId = this.options.mediaIds[mediaIdPos - 1];
            this.mediaBox1MediaId = prevMediaId;
         }
         
          $.ajax({url: 'https://api.instagram.com/v1/media/' + prevMediaId + '/?access_token=' + this.options.access_token, dataType: 'jsonp'})
          .done(function(data) {
            image.setContent(data.data.images.standard_resolution.url);
            profilePic.setContent(data.data.user.profile_picture);
            createdTime.setContent(moment.unix(data.data.created_time).fromNow(true));

            var usernameText = '';
            var usernameLimit;

            if (createdTime.getContent() === 'a few seconds') {
               usernameLimit = 19;
            } else {
               usernameLimit = 22;
            }

            if (data.data.user.username.length > usernameLimit) {
               usernameText = data.data.user.username.substring(0, usernameLimit - 1) + '...';
            } else {
               usernameText = data.data.user.username;
            }

            username.setContent(usernameText);

            var imageCaptionText = data.data.caption ? data.data.caption.text : '';

            imageCaption.setContent(imageCaptionText);

            var likeButtonColor = data.data.user_has_liked ? this.options.likedMediaButtonColor : this.options.notLikedMediaButtonColor;

            likeButton.setProperties({color: likeButtonColor});

            for (var i = 0; i < 4; i++) {
               if (data.data.likes.data[i] !== undefined) {
                  likers[i].setProperties({display: 'initial'});
                  likers[i].setContent(data.data.likes.data[i].profile_picture);
               } else {
                  likers[i].setProperties({display: 'none'});
               }
            }

            var numOfLikes = data.data.likes.count;

            if (numOfLikes > 4) {

               if ((numOfLikes - 4) <= 9999) {
                  likes = numOfLikes - 4;
               } else if ((numOfLikes - 4) >= 10000 && (numOfLikes - 4) < 1000000) {
                  likes = Math.floor((numOfLikes - 4) / 1000).toString() + 'K';
               } else {
                  likes = Math.floor((numOfLikes - 4) / 1000000).toString() + 'M';
               }

               likersCounter.setProperties({display: 'initial'});
               likersCounter.setContent('+' + likes.toString());
            } else {
               likersCounter.setProperties({display: 'none'});
            }

            $.ajax({url: 'https://api.instagram.com/v1/media/' + prevMediaId + '/comments?access_token=' + this.options.access_token, dataType: 'jsonp'})
               .done(function(data) {

                  var commentsSurfaces = [];

                  for (var i = data.data.length - 1; i >= 0; i--) {
                     var comment = new ContainerSurface({
                        size: [undefined, 70]
                     });

                     var commentProfilePic = new ImageSurface({
                        size: [36, 36],
                        content: data.data[i].from.profile_picture,
                        properties: {
                           border: '1px solid #CFCFCF',
                           borderRadius: '4px'
                        }
                     });

                     var commentUsername = new Surface({
                        size: [undefined, true],
                        content: data.data[i].from.username,
                        properties: {
                           font: 'bold 14px Helvetica',
                           color: '#006699'
                        }
                     });

                     var commentUsernameModifier = new StateModifier({
                        transform: Transform.translate(46, 0)
                     });

                     var commentCreatedTime = new Surface({
                        size: [120, true],
                        content: moment.unix(data.data[i].created_time).fromNow(true),
                        properties: {
                           font: '14px Helvetica',
                           color: '#BABABA',
                           textAlign: 'right'
                        }
                     });

                     var commentCreatedTimeModifier = new StateModifier({
                        transform: Transform.translate(470, 5)
                     });

                     var commentText = new Surface({
                        size: [540, true],
                        content: data.data[i].text,
                        properties: {
                           font: '13px Helvetica',
                           color: '#292929',
                           overflow: 'hidden'
                        }
                     });

                     var commentTextModifier = new StateModifier({
                        transform: Transform.translate(46, 19)
                     });

                     comment.add(commentProfilePic);
                     comment.add(commentUsernameModifier).add(commentUsername);
                     comment.add(commentCreatedTimeModifier).add(commentCreatedTime);
                     comment.add(commentTextModifier).add(commentText);

                     commentsSurfaces.push(comment);
                  }

                  commentsBox.goToFirstPage();
                  commentsBox.sequenceFrom(commentsSurfaces);
               }.bind(this));
          }.bind(this)); 
      } else {
         if (mediaBoxPos === 0) {
            mediaId = this.mediaBox0MediaId;
         } else if (mediaBoxPos === 1) {
            mediaId = this.mediaBox1MediaId;
         } else if (mediaBoxPos === 2) {
            mediaId = this.mediaBox2MediaId;
         }

         $.ajax({url: 'https://api.instagram.com/v1/media/' + mediaId + '/?access_token=' + this.options.access_token, dataType: 'jsonp'})
         .done(function(data) {
            image.setContent(data.data.images.standard_resolution.url);
            profilePic.setContent(data.data.user.profile_picture);
            createdTime.setContent(moment.unix(data.data.created_time).fromNow(true));

            var usernameText = '';
            var usernameLimit;

            if (createdTime.getContent() === 'a few seconds') {
               usernameLimit = 19;
            } else {
               usernameLimit = 22;
            }

            if (data.data.user.username.length > usernameLimit) {
               usernameText = data.data.user.username.substring(0, usernameLimit - 1) + '...';
            } else {
               usernameText = data.data.user.username;
            }

            username.setContent(usernameText);

            var imageCaptionText = data.data.caption ? data.data.caption.text : '';

            imageCaption.setContent(imageCaptionText);


            var likeButtonColor = data.data.user_has_liked ? this.options.likedMediaButtonColor : this.options.notLikedMediaButtonColor;

            likeButton.setProperties({color: likeButtonColor});

            for (var i = 0; i < 4; i++) {
               if (data.data.likes.data[i] !== undefined) {
                  likers[i].setProperties({display: 'initial'});
                  likers[i].setContent(data.data.likes.data[i].profile_picture);
               } else {
                  likers[i].setProperties({display: 'none'});
               }
            }

            var numOfLikes = data.data.likes.count;

            if (numOfLikes > 4) {

               if ((numOfLikes - 4) <= 9999) {
                  likes = numOfLikes - 4;
               } else if ((numOfLikes - 4) >= 10000 && (numOfLikes - 4) < 1000000) {
                  likes = Math.floor((numOfLikes - 4) / 1000).toString() + 'K';
               } else {
                  likes = Math.floor((numOfLikes - 4) / 1000000).toString() + 'M';
               }

               likersCounter.setProperties({display: 'initial'});
               likersCounter.setContent('+' + likes.toString());
            } else {
               likersCounter.setProperties({display: 'none'});
            }

            $.ajax({url: 'https://api.instagram.com/v1/media/' + mediaId + '/comments?access_token=' + this.options.access_token, dataType: 'jsonp'})
               .done(function(data) {

                  var commentsSurfaces = [];

                  for (var i = data.data.length - 1; i >= 0; i--) {
                     var comment = new ContainerSurface({
                        size: [undefined, 70]
                     });

                     var commentProfilePic = new ImageSurface({
                        size: [36, 36],
                        content: data.data[i].from.profile_picture,
                        properties: {
                           border: '1px solid #CFCFCF',
                           borderRadius: '4px'
                        }
                     });

                     var commentUsername = new Surface({
                        size: [undefined, true],
                        content: data.data[i].from.username,
                        properties: {
                           font: 'bold 14px Helvetica',
                           color: '#006699'
                        }
                     });

                     var commentUsernameModifier = new StateModifier({
                        transform: Transform.translate(46, 0)
                     });

                     var commentCreatedTime = new Surface({
                        size: [120, true],
                        content: moment.unix(data.data[i].created_time).fromNow(true),
                        properties: {
                           font: '14px Helvetica',
                           color: '#BABABA',
                           textAlign: 'right'
                        }
                     });

                     var commentCreatedTimeModifier = new StateModifier({
                        transform: Transform.translate(470, 5)
                     });

                     var commentText = new Surface({
                        size: [540, true],
                        content: data.data[i].text,
                        properties: {
                           font: '13px Helvetica',
                           color: '#292929',
                           overflow: 'hidden'
                        }
                     });

                     var commentTextModifier = new StateModifier({
                        transform: Transform.translate(46, 19)
                     });

                     comment.add(commentProfilePic);
                     comment.add(commentUsernameModifier).add(commentUsername);
                     comment.add(commentCreatedTimeModifier).add(commentCreatedTime);
                     comment.add(commentTextModifier).add(commentText);

                     commentsBox.goToFirstPage(); 
                     commentsSurfaces.push(comment);
                  }

                  commentsBox.sequenceFrom(commentsSurfaces);
               }.bind(this));

         }.bind(this)); 
      }
    }

    module.exports = BoxView;
});
