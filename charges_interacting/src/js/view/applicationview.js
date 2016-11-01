/**
 * Created by JFishwick on 06.04.2016.
 */
define(function(require) {
  'use strict';

  var properties = require('properties');
  var event = require('event');
  var actions = require('stores/actions');

  var application = require('html!assets/application.html').cloneNode(true);

  var PageView = require('view/pageview');

  var ApplicationView = function(model) {
    var self = this;

    // Set title
    document.querySelector('title').textContent = model.title;
    var labTitle = application.querySelector('.lab-title');

    labTitle.textContent = model.title;
    labTitle.setAttribute('aria-label', model.title + '. ' + model.description);

    // Create pages
    var pageContainer = application.querySelector('.page-container');

    _.forOwn(model.pages, function(pageModel) {
      var page = new PageView(pageModel, model);

      pageContainer.appendChild(page);
    });

    // Navigation
    this.initNavButtons(model);
    this.initNavPages(model);

    event.addCustomEventListener(actions.PREV_PAGE, function() {
      if (model.currentPage > 0) {
        model.currentPage--;
      }
    });

    event.addCustomEventListener(actions.NEXT_PAGE, function(e) {
      if (e.stop) {
        return;
      }

      if (model.currentPage < model.pages.length - 1) {
        model.currentPage++;
      }
    });

    return application;
  };

  ApplicationView.prototype.initNavButtons = function(model) {
    var prevBtn = application.querySelector('.nav-button.prev');
    var nextBtn = application.querySelector('.nav-button.next');
    var creditsBtn = application.querySelector('.nav-button.credits');

    // Previous button
    prevBtn.addEventListener(event.user.mousedown, function() {
      event.dispatchCustomEvent(actions.PREV_PAGE);
    });
    prevBtn.addEventListener('keyup', function(e) {
      if (e.keyCode === 32) { // Space
        event.dispatchCustomEvent(actions.PREV_PAGE);
      }
    });

    // Next button
    nextBtn.addEventListener(event.user.mousedown, function() {
      event.dispatchCustomEvent(actions.NEXT_PAGE);
    });
    nextBtn.addEventListener('keyup', function(e) {
      if (e.keyCode === 32) { // Space
        event.dispatchCustomEvent(actions.NEXT_PAGE);
      }
    });

    // Credits button
    creditsBtn.addEventListener(event.user.mousedown, function() {
      window.open('./credits.html', '_blank');
    });
    creditsBtn.addEventListener('keyup', function(e) {
      if (e.keyCode === 32) { // Space
        window.open('./credits.html', '_blank');
      }
    });

    model.currentPageProperty.addObserver(function(pageInd) {
      var className = 'disabled';

      var func = (pageInd) ? 'remove' : 'add';
      prevBtn.classList[func](className);

      if (pageInd) {
        prevBtn.setAttribute('tabindex', '0');
      } else {
        prevBtn.removeAttribute('tabindex');
      }

      nextBtn.style.display = (pageInd === model.pages.length - 1) ? 'none' : '';
      creditsBtn.style.display = (pageInd === model.pages.length - 1) ? '' : 'none';
    });
  };

  ApplicationView.prototype.initNavPages = function(model) {
    var navPagesContainer = application.querySelector('.nav-pages');
    var navPageTemplate = navPagesContainer.querySelector('.nav-page');

    var navPages = [];
    var navPage;
    _.forOwn(model.pages, function(pageModel) {
      navPage = navPageTemplate.cloneNode(true);
      navPage.style.display = '';
      navPage.textContent = pageModel.i + 1;

      navPagesContainer.appendChild(navPage);
      navPages.push(navPage);
    });

    var className = 'current';

    model.currentPageProperty.addObserver(function(pageInd, oldPageInd) {
      if (oldPageInd !== null) {
        navPages[oldPageInd].classList.remove(className);
      }

      navPages[pageInd].classList.add(className);
    });
  };

  return ApplicationView;
});

