/**
 * Created by JFishwick on 12.05.2016.
 */
define(function(require) {
  'use strict';

  var answerTemplate = require('html!assets/templates/answer.html');

  var actions = require('stores/actions');
  var dataStore = require('stores/datastore');
  var event = require('event');

  require('style!css/widgets/answer.css');

  var Answer = function(jsonData) {
    var view = answerTemplate.cloneNode(true);
    var answer = view.querySelector('.answer');

    event.addCustomEventListener(actions.UPDATE_DATA_STORE, function() {
      // Get the answer chosen by the user
      var ans = dataStore.getData(jsonData.imports_from);

      if (ans !== undefined) {
        // Update the view for this widget
        answer.innerHTML = '';

        var ariaLabel = jsonData.answers[ans].replace('/\\n/g', '');

        if (jsonData.descriptions) {
          ariaLabel += jsonData.descriptions[ans];
        }

        view.setAttribute('aria-label', ariaLabel);

        // Split and create lines
        var lines = jsonData.answers[ans].split('\n');

        _.forEach(lines, function(lineData, i) {
          var line = document.createElement('p');
          line.setAttribute('class', 'line line-' + i);
          line.innerHTML = lineData;

          answer.appendChild(line);
        });

        if (jsonData.sources) {
          var image = new Image();
          image.src = 'images/' + jsonData.sources[ans];

          answer.appendChild(image);
        }
      }
    }.bind(this));

    return view;
  };

  return Answer;
});