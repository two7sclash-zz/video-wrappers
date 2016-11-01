/**
 * Created by JFishwick on 20.05.2016.
 */
define(function(require) {
  'use strict';

  var framePlayerTemplate = require('html!assets/templates/frame_player.html');

  var event = require('event');

  var ImagePlayer = require('components/imageplayer');

  var properties = require('properties');

  require('style!css/widgets/frame_player.css');

  var FramePlayer = function(jsonData, model, pageModel) {
    var view = framePlayerTemplate.cloneNode(true);

    if (jsonData.description) {
      view.setAttribute('aria-label', jsonData.description);
    }

    // Init images and image player
    var imageContainer = view.querySelector('.images');
    var frames = [];

    _.forEach(jsonData.frames, function(frame) {
      var img = new Image();
      img.src = 'images/' + frame;
      img.style.display = 'none';

      img.setAttribute('class', 'image-player-image');
      imageContainer.appendChild(img);
      frames.push(img);
    }.bind(this));

    var imagePlayer = new ImagePlayer(frames, true /* loop */, jsonData.step_time);

    // Controls
    var leftControl = view.querySelector('.left');
    var rightControl = view.querySelector('.right');
    var playControl = view.querySelector('.play');
    var pauseControl = view.querySelector('.pause');
    var timelineBar = view.querySelector('.timeline-bar');
    var timelineRange = view.querySelector('.timeline-range');

    var dragEnabled = false;
    var bBox;

    timelineBar.addEventListener(event.user.mousedown, function(e) {
      dragEnabled = true;
      bBox = timelineBar.getBoundingClientRect();

      pause();

      onTimelineBarDrag.call(this, e);
    }.bind(this));

    var onTimelineBarDrag = function(e) {
      if (!dragEnabled) { return false; }

      var offsetX = event.user.position(e).x - bBox.left;
      var percentage = offsetX / bBox.width;

      // Keep percentage in bounds
      percentage = _.clamp(percentage, 0, 1);

      var frame = Math.round(( imagePlayer.images.length - 1 ) * percentage);
      imagePlayer.flipTo(frame);
      updateProgress();

      e.stopPropagation();
      e.preventDefault();
    };

    window.addEventListener(event.user.mousemove, onTimelineBarDrag.bind(this));
    window.addEventListener(event.user.mouseup, function(e) {
      if (dragEnabled) {
        dragEnabled = false;

        e.stopPropagation();
        e.preventDefault();
      }
    });

    var updateProgress = function() {
      timelineRange.style.width = (imagePlayer.index / (imagePlayer.images.length - 1)) * 100 + '%';
    };

    var play = function() {
      imagePlayer.startAutoplay();
      playControl.style.display = 'none';
      pauseControl.style.display = '';
    };

    var pause = function() {
      imagePlayer.pause();
      playControl.style.display = '';
      pauseControl.style.display = 'none';
    };

    // Set up control listeners
    leftControl.addEventListener(event.user.mousedown, imagePlayer.back.bind(imagePlayer));
    rightControl.addEventListener(event.user.mousedown, imagePlayer.next.bind(imagePlayer));

    view.addEventListener('keyup', function(evt) {
      if (evt.keyCode === 32) { // Space
        if (imagePlayer.isReplaying) {
          pause();
        } else {
          play();
        }
      }
    });
    
    view.addEventListener('keyup', function(evt) {
      if (!imagePlayer.isReplaying) {
        if (evt.keyCode === 37) { // Left
          imagePlayer.back.call(imagePlayer)
        } else if (evt.keyCode === 39) { // Right
          imagePlayer.next.call(imagePlayer)
        }
      }
    });

    playControl.addEventListener(event.user.mousedown, play);
    pauseControl.addEventListener(event.user.mousedown, pause);

    model.currentPageProperty.addObserver(function(pageInd) {
      if (pageInd === pageModel.i) {
        play();
      }
    });

    // Listeners for the image player and scrub bar
    imagePlayer.onFlip = updateProgress;
    imagePlayer.onReset = pause;

    return view;
  };

  return FramePlayer;
});