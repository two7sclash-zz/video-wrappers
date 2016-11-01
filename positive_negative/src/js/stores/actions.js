/**
 * Created by JFishwick on 12.05.2016.
 */
'use strict';
define(function() {
  var navActions = {
    NEXT_PAGE: {name: 'NEXT_PAGE'},
    PREV_PAGE: {name: 'PREV_PAGE'}
  };

  var dataActions = {
    UPDATE_DATA_STORE: {name: 'UPDATE_DATA_STORE'}
  };

  return Object.freeze(_.merge(dataActions, navActions));
});