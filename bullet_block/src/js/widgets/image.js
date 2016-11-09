/**
 * Created on 13.05.2016.
 */
define(function(require) {
  'use strict';

  require('style!css/widgets/image.css');

  var textTemplate = require('html!assets/templates/image.html');

  var ImageView = function(jsonData) {
    var view = textTemplate.cloneNode(true);
    var image = view.querySelector('.image-container');

    var img = new Image();
    img.src = 'images/' + jsonData.url;
    img.alt = jsonData.description || '';
    img.setAttribute('tabindex', '0');

    image.appendChild(img);

    return view;
  };

  return ImageView;
});