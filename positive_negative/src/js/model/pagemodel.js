/**
 * Created by JFishwick on 08.05.2016.
 */
define(function(require) {
  'use strict';

  var PageModel = function(page, i) {
    this.i = i;

    this.layout = page.layout;
    this.elements = page.elements;
  };

  return PageModel;
});