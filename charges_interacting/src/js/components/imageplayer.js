/**
 * Created by JFishwick on 16.05.2016.
 */
define(function(require) {
  'use strict';

  var event = require('event');

  require('style!css/components/image_player.css');

  var noop = function() { /* no operations */ };

  var ImagePlayer = function(images, loop, stepTime) {
    this.images = images;
    this.index = null;
    this.loop = loop;
    this.stepTime = stepTime;
    this.isReplaying = false;

    this.onFlip = noop;
    this.onReset = noop;

    this.flipTo(0);
  };

  // Shows the image given by the selected index.
  ImagePlayer.prototype.flipTo = function(index) {
    if (this.index !== index) {
      if (this.index !== null) {
        this.images[this.index].style.display = 'none';
      }
      this.images[index].style.display = '';

      this.index = index;
      this.onFlip();
    }
  };

  // Shows the next image in the given images sequence.
  ImagePlayer.prototype.next = function() {
    if (this.index < this.images.length || this.loop) {
      var newIndex = (this.index + 1) % this.images.length;
      this.flipTo(newIndex);
    }
  };

  // Shows the next image in the given images sequence.
  ImagePlayer.prototype.back = function() {
    if (this.index > 0 || this.loop) {
      var index = (this.index - 1 + this.images.length) % this.images.length;

      this.flipTo(index);
    }
  };

  // Pauses the frame player
  ImagePlayer.prototype.pause = function() {
    this.isReplaying = false;
  };

  // Call this to start playing through images automatically.
  ImagePlayer.prototype.startAutoplay = function() {
    if (!this.isReplaying) {
      this.isReplaying = true;
      setTimeout(autoplay.bind(this), this.stepTime);
    }
  };

  // Flips the image, and sets a timeout to call itself again.
  var autoplay = function() {
    if (this.isReplaying === true) {
      if (this.index === this.images.length - 1 && this.loop) {
        // When the image player has run through all the frames
        // and is going back to pause on the first one
        this.next();
        this.isReplaying = false;

        this.onReset();

        return;
      } else if (this.index === this.images.length - 1) {
        this.isReplaying = false;

        return;
      }

      this.next();
      setTimeout(autoplay.bind(this), this.stepTime);
    }
  };

  return ImagePlayer;
});
