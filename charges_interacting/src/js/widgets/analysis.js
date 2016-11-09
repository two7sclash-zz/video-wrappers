/**
 * Created on 16.05.2016.
 */
define(function(require) {
  'use strict';

  var analysisTemplate = require('html!assets/templates/analysis.html');

  var actions = require('stores/actions');
  var dataStore = require('stores/datastore');
  var event = require('event');
  var ImagePlayer = require('components/imageplayer');
  var CanvasEngine = require('components/canvasengine');

  var properties = require('properties');

  require('style!css/widgets/analysis.css');

  var Analysis = function(jsonData, model, pageModel) {
    var view = analysisTemplate.cloneNode(true);

    var hiddenBtn = view.querySelector('.hidden');

    var ariaText = '';
    var analysisContainer = view.querySelector('.analysis-container');
    if (jsonData.description) {
      analysisContainer.setAttribute('aria-label', jsonData.description + ' ' + ariaText);
    }

    var initialData = dataStore.getData(jsonData.exports_to) || [];

    // Set initial data
    dataStore.setData(jsonData.exports_to, initialData);

    properties.call(this, {
      frame: 0,
      error: null
    });

    // Init images and image player
    var imageContainer = view.querySelector('.images');
    this.images = [];

    _.forEach(jsonData.frames, function(frame) {
      var img = new Image();
      img.src = 'images/' + frame;
      img.style.display = 'none';

      img.setAttribute('class', 'image-player-image');
      imageContainer.appendChild(img);
      this.images.push(img);
    }.bind(this));

    var imagePlayer = new ImagePlayer(this.images, false /* no loop */);

    // Initially show instruction message
    var instructionMessage = view.querySelector('.instruction-message');
    if (jsonData.instructions) {
      instructionMessage.style.display = '';
      instructionMessage.innerHTML = jsonData.instructions;

      if (jsonData.instructions_location) {
        instructionMessage.classList.add(jsonData.instructions_location);
      }
    }

    // Init error message
    var errorMessage = view.querySelector('.error-message');
    if (jsonData.error_message) {
      errorMessage.innerHTML = jsonData.error_message;
    } else {
      // Default error message
      errorMessage.innerHTML = 'Please click closer to the target object.';
    }

    var showErrorMessage = function() {
      $(errorMessage).stop();
      errorMessage.style.opacity = 1;
      errorMessage.style.display = '';
      $(errorMessage).fadeOut(2000);
    };

    // Init time block
    var currentTime = view.querySelector('.current-time');
    if (jsonData.time_color) {
      currentTime.style.color = jsonData.time_color;
    }
    var updateTime = function(frame) {
      currentTime.innerHTML = "t = " + (frame * jsonData.step_time).toFixed(2) + "s";
    };

    // Canvas
    var canvas = view.querySelector('.canvas');

    // Initialize canvas controller
    var CanvasController = new CanvasEngine({
      canvas: canvas,
      jsonData: jsonData,
      model: model,
      analysis: this,
      pageModel: pageModel
    });

    // Set up canvas click listener
    canvas.addEventListener(event.user.mousedown, function(e) {
      instructionMessage.style.display = 'none';

      var coords = canvas.relativeMouseCoords(e);

      var goodClick = CanvasController.checkClick(this.frame, coords.x, coords.y);

      if (goodClick) {
        this.error = null;
        CanvasController.click(this.frame);
      } else {
        showErrorMessage();
        this.error = [coords.x / CanvasController.scaleX, coords.y / CanvasController.scaleY];
      }
    }.bind(this));

    var firstClick;
    hiddenBtn.addEventListener('keyup', function(evt) {
      if (evt.keyCode === 32) { // Space

        if (this.frame < this.images.length && !firstClick) {
          if (this.frame === this.images.length - 1) {
            firstClick = true;
          }

          if ((this.frame + 1) >= this.images.length) {
            analysisContainer.setAttribute('aria-label', jsonData.post_description);
            hiddenBtn.style.display = 'none';
          } else {
            analysisContainer.setAttribute('aria-label', jsonData.locations_descriptions[this.frame]);
          }

          analysisContainer.focus();

          CanvasController.click(this.frame);
        }
      }

      evt.stopPropagation();
      evt.preventDefault();
    }.bind(this));

    // Controls
    var leftControl = view.querySelector('.left');
    var rightControl = view.querySelector('.right');
    var clearDataControl = view.querySelector('.clear-data');
    var timelineBar = view.querySelector('.timeline-bar');
    var timelineRange = view.querySelector('.timeline-range');

    var dragEnabled = false;
    var bBox;

    timelineBar.addEventListener(event.user.mousedown, function(e) {
      dragEnabled = true;
      bBox = timelineBar.getBoundingClientRect();

      onTimelineBarDrag.call(this, e);
    }.bind(this));

    var onTimelineBarDrag = function(e) {
      if (!dragEnabled) { return false; }

      var offsetX = event.user.position(e).x - bBox.left;
      var percentage = offsetX / bBox.width;

      // Keep percentage in bounds
      percentage = _.clamp(percentage, 0, 1);
      this.frame = Math.round(( imagePlayer.images.length - 1 ) * percentage);

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

    this.frameProperty.addObserver(function(frame, oldFrame) {
      if (oldFrame !== null) {
        instructionMessage.style.display = 'none';
      }

      imagePlayer.flipTo(frame);

      timelineRange.style.width = (frame / (this.images.length - 1)) * 100 + '%';

      this.error = null;

      updateTime(frame);
    }.bind(this));

    // Set up control listeners
    leftControl.addEventListener(event.user.mousedown, this.prev.bind(this));
    rightControl.addEventListener(event.user.mousedown, this.next.bind(this));

    clearDataControl.addEventListener(event.user.mousedown, function() {
      this.frame = 0;

      if (jsonData.instructions) {
        instructionMessage.style.display = '';
      }

      dataStore.setData(jsonData.exports_to, []);
    }.bind(this));

    instructionMessage.addEventListener(event.user.mousedown, function(e) {
      instructionMessage.style.display = 'none';
    });

    // Find relative coordinates of click on canvas
    HTMLCanvasElement.prototype.relativeMouseCoords = function(e) {
      var bBox = this.getBoundingClientRect();
      var mousePos = event.user.position(e);

      var canvasX = Math.round(mousePos.x - bBox.left);
      var canvasY = Math.round(mousePos.y - bBox.top);

      // Revert inverted Y-axis
      canvasY = this.height - canvasY;

      return {x: canvasX, y: canvasY};
    };

    return view;
  };

  Analysis.prototype.next = function() {
    this.frame = this.frame < this.images.length - 1 ? this.frame + 1 : this.frame;
  };

  Analysis.prototype.prev = function() {
    this.frame = this.frame ? this.frame - 1 : this.frame;
  };

  return Analysis;
});
