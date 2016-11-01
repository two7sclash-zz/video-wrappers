/**
 * Created by JFishwick on 12.05.2016.
 */
define(function(require) {
  'use strict';

  require('style!css/widgets/text.css');

  var textTemplate = require('html!assets/templates/text.html');

  var Text = function(jsonData) {
    var view = textTemplate.cloneNode(true);
    var text = view.querySelector('.text');

    view.setAttribute('aria-label', jsonData.content.replace('/\\n/g', ''));

    // Split and create lines
    var lines = jsonData.content.split('\n');

    _.forEach(lines, function(lineData, i) {
      var line = document.createElement('p');
      line.setAttribute('class', 'line line-' + i);
      line.innerHTML = lineData;

      text.appendChild(line);
    });

    return view;
  };

  return Text;
});