/**
 * Created on 12.05.2016.
 */
define(function(require) {
  'use strict';

  var certificateTemplate = require('html!assets/templates/certificate.html');

  var actions = require('stores/actions');
  var dataStore = require('stores/datastore');

  var event = require('event');

  require('style!css/widgets/certificate.css');

  var Certificate = function(jsonData, model, pageModel, uniqueId) {
    var view = certificateTemplate.cloneNode(true);
    var title = view.querySelector('.certificate-title');
    var username = view.querySelector('.certificate-username');
    var self = this;

    this.completed = false;

    // Set title
    title.textContent = model.title;

    model.currentPageProperty.addObserver(function(pageInd) {
      if (pageInd === pageModel.i) {

        if (!self.completed) {
          username.textContent = model.userName;

          view.setAttribute('aria-label',
            'Complition certificate ' + model.userName + ' has completed the ' + model.title +
            ' Interactive Video Vignette.');

          var date = new Date();

          var dateNow = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();

          var startTimeString = model.startDate.getHours() + ":" + model.startDate.getMinutes();
          var endTimeString = date.getHours() + ":" + date.getMinutes();

          view.querySelector('.date').textContent = dateNow;
          view.querySelector('.startTime').textContent = startTimeString;
          view.querySelector('.endTime').textContent = endTimeString;
        }

        self.completed = true;
      }
    });

    return view;
  };

  return Certificate;
});