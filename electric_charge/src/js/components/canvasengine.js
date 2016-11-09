define(function() {

  var dataStore = require('stores/datastore');
  var actions = require('stores/actions');
  var event = require('event');
  var browser = require('browser');

  var CanvasEngine = function(options) {
    var self = this;

    this.canvas = options.canvas;
    this.jsonData = options.jsonData;
    this.analysis = options.analysis;
    this.model = options.model;
    this.pageModel = options.pageModel;

    if (this.jsonData.exports_to === undefined) {
      throw new Error('Need somewhere to export data');
    }

    if (this.jsonData.displays === undefined) {
      throw new Error('Need a method to display:' +
                      ' [point|horizontal|vertical]');
    }

    if (this.jsonData.step_time === undefined) {
      throw new Error('Need a step_time to export data.');
    }

    if (this.jsonData.displays === 'point') {
      this.drawMethod = this.drawPoint;
    } else if (this.jsonData.displays === 'horizontal') {
      this.drawMethod = this.drawHorizontal;
    } else if (this.jsonData.displays === 'vertical') {
      this.drawMethod = this.drawVertical;
    }

    // Setup display settings
    var settings = this.jsonData.display_settings || {};

    // Colors
    this.warningColor = settings.warning_color || 'yellow';
    this.normalColor = settings.normal_color || 'black';
    this.currentColor = settings.current_color || 'orange';

    // Sizes
    this.horizLineLength = settings.hor_line_length || 25;
    this.pointSize = settings.point_size || 4;
    this.originalWidth = settings.canvas_width || 300;
    this.originalHeight = settings.canvas_height || 150;
    this.lineWidth = settings.line_width || 1.5;

    this.exportLoc = this.jsonData.exports_to;

    this.scaleX = 1;
    this.scaleY = 1;

    // Add events to canvas
    event.addCustomEventListener(actions.UPDATE_DATA_STORE, redraw.bind(self));

    this.analysis.errorProperty.addObserver(function(error) {
      if (error) {
        redraw.call(self);
      }
    });

    this.analysis.frameProperty.addObserver(redraw.bind(self));

    this.model.currentPageProperty.addObserver(resizeCanvas.bind(this));

    window.addEventListener('resize', resizeCanvas.bind(this));
  };

  // Resize the canvas to properly account for the scale factor
  // between the widget's size and the actual size of the canvas
  var resizeCanvas = function() {
    if (this.pageModel.i !== this.model.currentPage) {return;}

    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    if (this.canvas.width > 0) {
      this.scaleX = this.canvas.width / this.originalWidth;
      this.scaleY = this.canvas.height / this.originalHeight;
    }

    redraw.call(this);
  };

  // Clears out anything drawn on the canvas.
  CanvasEngine.prototype.drawClear = function() {
    this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  // Clears the canvas first, and always controls the color before passing it onto different drawMethods.
  var redraw = function() {
    var self = this;

    // Clear out points on canvas
    this.drawClear();

    var data = dataStore.getData(this.exportLoc);

    // Find current point
    var specialFrame = -1;
    _.forEach(data, function(value) {
      var frame = value[0];

      if (self.analysis.frame === frame) {
        specialFrame = frame;

        return false; // Quit the loop early
      }
      if (self.analysis.frame === frame + 1) {
        specialFrame = frame;
      }

      return true;
    });

    // Redraw points from dataStore
    _.forEach(data, function(value) {
      if (value[0] === specialFrame) {
        self.setColor(self.currentColor);
      } else {
        self.setColor(self.normalColor);
      }

      self.drawMethod(value[1] * self.scaleX, value[2] * self.scaleY);
    });

    // Draw error point
    if (this.analysis.error) {
      self.setColor(self.warningColor);

      self.drawMethod(this.analysis.error[0] * self.scaleX, this.analysis.error[1] * self.scaleY);
    }
  };

  CanvasEngine.prototype.click = function(frame) {
    var frameData = this.jsonData['track_locations'][frame];
    var x2 = frameData.x;
    var y2 = frameData.y;
    var r = frameData.r;

    // If so, replace any old data, if it exists
    var time = frame * this.jsonData.step_time;
    var newData = [frame, x2, y2, time];

    var data = dataStore.getData(this.exportLoc);

    if (!checkDuplicates(data, newData)) {
      data.push(newData);
      dataStore.setData(this.exportLoc, data);
    }

    this.analysis.next();
  };

  var checkDuplicates = function(array, newData) {
    var result = false;

    _.forEach(array, function(item) {
      if (item[0] === newData[0]) {
        result = true;
      }
    });

    return result;
  };

  CanvasEngine.prototype.checkClick = function(frame, x, y) {
    var frameData = this.jsonData['track_locations'][frame];
    var x2 = frameData.x * this.scaleX;
    var y2 = frameData.y * this.scaleY;
    var r = frameData.r;

    if (browser.platform.Mobile) {
      r *= 2;
    }

    return this.checkRadius(x, y, x2, y2, r);
  };

  // Check whether the given locations are within a certain radius of each other.
  CanvasEngine.prototype.checkRadius = function(x1, y1, x2, y2, r) {
    var xD = x1 - x2;
    var yD = y1 - y2;

    return xD * xD + yD * yD < r * r;
  };

  // Set color
  CanvasEngine.prototype.setColor = function(color) {
    this.canvas.getContext('2d').strokeStyle = color;
    this.canvas.getContext('2d').fillStyle = color;
  };

  // Draw point
  CanvasEngine.prototype.drawPoint = function(x, y) {
    this.canvas.getContext('2d').beginPath();
    this.canvas.getContext('2d').arc(x, this.canvas.height - y, this.pointSize, 0, 2 * Math.PI, false);
    this.canvas.getContext('2d').closePath();
    this.canvas.getContext('2d').fill();
  };

  // Draw point and verticalLine
  CanvasEngine.prototype.drawVertical = function(x, y) {
    this.drawPoint(x, y);
    this.canvas.getContext('2d').lineWidth = this.lineWidth;
    this.canvas.getContext('2d').beginPath();
    this.canvas.getContext('2d').moveTo(x, 0);
    this.canvas.getContext('2d').lineTo(x, this.canvas.height);
    this.canvas.getContext('2d').stroke();
  };

  // Draw point and horizontal line
  CanvasEngine.prototype.drawHorizontal = function(x, y) {
    this.drawPoint(x, y);
    this.canvas.getContext('2d').lineWidth = this.lineWidth;
    this.canvas.getContext('2d').beginPath();
    this.canvas.getContext('2d').moveTo(x - this.horizLineLength, this.canvas.height - y);
    this.canvas.getContext('2d').lineTo(x + this.horizLineLength, this.canvas.height - y);
    this.canvas.getContext('2d').stroke();
  };

  return CanvasEngine;
});