
define(function(require) {
  'use strict';

  var properties = require('properties');

  var ApplicationView = require('view/applicationview');
  var ApplicationModel = require('model/applicationmodel');

  var event = require('event').user;

  var Application = function(jsonData) {
    this.model = new ApplicationModel(jsonData);
    this.view = new ApplicationView(this.model);

    document.body.appendChild(this.view);

    this.setResizable();
    window.addEventListener('resize', this.setResizable.bind(this));
  };

  Application.prototype.setResizable = function() {
    var maxWidth = Math.min(document.body.parentNode.offsetWidth, this.model.defaultWidth);
    var maxHeight = Math.min(document.body.parentNode.offsetHeight, this.model.defaultHeight);

    var scaleFactorW = maxWidth / this.model.defaultWidth;
    var scaleFactorH = (maxHeight - 100) / (this.model.defaultHeight - 100);

    if (maxWidth < 700) {
      this.view.style.height = '100%';
      this.view.style.width = '100%';
    } else {
      if (scaleFactorW < scaleFactorH) {
        var height = ( this.model.defaultHeight - 100 ) * scaleFactorW;

        this.view.style.height = ( height + 100 ) + 'px';
        this.view.style.width = '100%';
      } else {
        var width = ( this.model.defaultWidth ) * scaleFactorH;

        this.view.style.width = width + 'px';
        this.view.style.height = '100%';
      }
    }
  };

  return Application;
});
