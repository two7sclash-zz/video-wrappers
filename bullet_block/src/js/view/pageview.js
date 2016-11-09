/**
 * Created on 08.05.2016.
 */
define(function(require) {
  'use strict';

  var layouts = {
    '1': require('html!assets/layouts/layout_1.html'),
    '2-1': require('html!assets/layouts/layout_2_1.html'),
    '2-2': require('html!assets/layouts/layout_2_2.html'),
    '1-2-1': require('html!assets/layouts/layout_1_2_1.html')
  };

  var WIDGETS = {
    login: require('widgets/login'),
    certificate: require('widgets/certificate'),
    video: require('widgets/video'),
    question: require('widgets/question'),
    text: require('widgets/text'),
    answer: require('widgets/answer'),
    image: require('widgets/image'),
    'x-y-analysis': require('widgets/analysis'),
    'x-y-graph': require('widgets/graph'),
    'frame-player': require('widgets/frameplayer')
  };

  var PageView = function(pageModel, model) {
    this.model = model;

    var view = layouts[pageModel.layout.template].cloneNode(true);
    view.setAttribute('id', 'page-' + (pageModel.i + 1));

    // Add observers
    model.currentPageProperty.addObserver(function(pageInd) {
      view.style.display = (pageInd === pageModel.i) ? '' : 'none';

      var nextFocused = view.querySelector('*[tabindex="0"]');
      if (nextFocused) {
        nextFocused.focus();
      }
    });

    _.forEach(pageModel.elements, function(element, i) {
      initElement(element, model, view, pageModel, i);
    });

    this.view = view;

    this.setResizable();
    window.addEventListener('resize', this.setResizable.bind(this));

    return view;
  };

  PageView.prototype.setResizable = function() {
    var maxWidth = Math.min(document.body.parentNode.offsetWidth, this.model.defaultWidth);
    var maxHeight = Math.min(document.body.parentNode.offsetHeight, this.model.defaultHeight);

    if (maxWidth < 700) {
      var scaleFactorW = maxWidth / this.model.defaultWidth;
      var scaleFactorH = (maxHeight - 70) / (this.model.defaultHeight - 70);

      if (scaleFactorW < scaleFactorH) {
        var height = ( this.model.defaultHeight - 70 ) * scaleFactorW;

        this.view.style.height = height + 'px';
        this.view.style.width = '100%';
      } else {
        var width = ( this.model.defaultWidth ) * scaleFactorH;

        this.view.style.width = width + 'px';
        this.view.style.height = '100%';
      }
    } else {
      this.view.style.height = '100%';
      this.view.style.width = '100%';
    }
  };

  var initElement = function(element, model, view, pageModel, i) {
    var template = element.layout.template;

    if (WIDGETS[template]) {
      var uniqueId = '-' + (pageModel.i + 1 ) + '-' + ( i + 1);
      var widget = new WIDGETS[template](element.data, model, pageModel, uniqueId);

      widget.setAttribute('id', 'widget' + uniqueId);
      view.querySelector('.slot-' + (i + 1)).appendChild(widget);
    }
  };

  return PageView;
});
