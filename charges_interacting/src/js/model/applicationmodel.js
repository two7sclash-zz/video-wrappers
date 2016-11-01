/**
 * Created by JFishwick on 06.04.2016.
 */
define(function(require) {
  'use strict';

  var properties = require('properties');

  var PageModel = require('model/pagemodel');

  var ApplicationModel = function(jsonData) {
    var self = this;

    properties.call(this, {
      currentPage: 0
    });

    this.defaultWidth = 1200;
    this.defaultHeight = 780;

    this.startDate = new Date();

    // Title of model
    this.title = jsonData.title || '';

    // Description of model
    this.description = jsonData.description || this.title;

    // Intro image of model
    this.image = jsonData.image;

    // Init pages of model
    this.pages = [];

    _.forEach(jsonData.pages, function(page, i) {
      var pageModel = new PageModel(page, i);

      this.pages.push(pageModel);
    }.bind(this));
  };

  return ApplicationModel;
});
