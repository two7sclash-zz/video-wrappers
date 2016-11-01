/**
 * Created by JFishwick on 12.05.2016.
 */
define(function(require) {

  var event = require('event');
  var actions = require('stores/actions');

  var dataStore = {};

  var setData = function(source, data) {
    dataStore[source] = data;

    event.dispatchCustomEvent(actions.UPDATE_DATA_STORE);
  };

  var getData = function(source) {
    return dataStore[source];
  };

  // Return singleton object
  return {
    getData: getData,
    setData: setData
  };
});
