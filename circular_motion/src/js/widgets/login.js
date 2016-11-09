/**
 * Created on 12.05.2016.
 */
define(function(require) {
  'use strict';

  var loginTemplate = require('html!assets/templates/login.html');

  var actions = require('stores/actions');
  var dataStore = require('stores/datastore');

  var event = require('event');

  var Login = function(jsonData, model, pageModel, uniqueId) {
    var view = loginTemplate.cloneNode(true);
    var title = view.querySelector('.login-title');
    var pageContainer;

    this.inputName = view.querySelector('input');

    // Set title
    title.textContent = model.title;

    var self = this;

    // Check answer on click next page
    event.addCustomEventListener(actions.NEXT_PAGE, function(e) {
      if (model.currentPage !== pageModel.i) { return false; }

      if (!pageContainer) {
        pageContainer = document.querySelector('.page-container');
      }
      // Export answer
      if (self.inputName.value) {
        model.userName = self.inputName.value;
      } else {
        view.classList.add('error');

        // Prevent flip of pages
        e.stop = true;

        pageContainer.scrollTop = (pageContainer.scrollHeight) / 3;
      }
    });

    this.inputName.addEventListener('focus', function() {
      view.classList.remove('error');
    });

    return view;
  };

  return Login;
});