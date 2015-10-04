define(function(require, exports, module) {

   var View = require('famous/core/View');
   var Surface = require('famous/core/Surface');
   var Transform = require('famous/core/Transform');
   var StateModifier = require('famous/modifiers/StateModifier');

   function SignInView() {
      View.apply(this, arguments);
   }

   SignInView.prototype = Object.create(View.prototype);
   SignInView.prototype.constructor = SignInView;

   SignInView.DEFAULT_OPTIONS = {};

      

   module.exports = SignInView;
});
