define(function(require) {

  // Import used utilities
  var browser = require('./browser');

  // Constant, indicate current device platform
  var TOUCH = browser.platform.Mobile;

  // Collection of all listeners
  var CollectionOfListeners = {/* Collection of EventName: [ Listeners ] */};

  CollectionOfListeners.get = function(name) {
    // If collection not existed - create, than return collection
    return ( ( !this[name] && ( this[name] = [] ) ) || this[name] );
  };

  CollectionOfListeners.remove = function(name) {
    ( this[name] ) && ( this[name] = [] );
  };

  var removeAll = function() {
    var events = Object.keys(CollectionOfListeners);
    for (var i = events.length; i--;) {
      CollectionOfListeners[events[i]].length = 0;
    }
  };

  var removeCustomEventListener = function(event, func) {
    if (func) {
      var coll = CollectionOfListeners.get(event.name);
      coll.splice(coll.indexOf(func), 1);
    } else {
      CollectionOfListeners.remove(event.name);
    }
  };

  var addCustomEventListener = function(event, func) {
    var coll = CollectionOfListeners.get(event.name);
    func && func.call && coll.push(func);
  };

  var dispatchCustomEvent = function(event, options) {
    // New non-changed event object each dispatch time
    var e = _.cloneDeep(event);

    var coll = CollectionOfListeners.get(e.name);
    for (var i = 0; i < coll.length; i++) {
      coll[i](e, options);
    }
  };

  var getCursorPosition = function(e, offset) {
    var x = e.pageX, y = e.pageY, html;

    if (offset) {
      offset = offset.getBoundingClientRect();
    } else {
      offset = {left: 0, top: 0};
    }

    if (e.pageX == null && e.clientX != null) {
      html = document.documentElement.body || document.body;
      x = e.clientX + ( html && html.scrollLeft || body && body.scrollLeft || 0 ) - ( html.clientLeft || 0 );
      y = e.clientY + ( html && html.scrollTop || body && body.scrollTop || 0 ) - ( html.clientTop || 0 );
    }

    if (e.changedTouches && e.changedTouches.length) {
      x = e.changedTouches[0].pageX;
      y = e.changedTouches[0].pageY;
    }

    return {
      x: Math.round(x - offset.left), y: Math.round(y - offset.top)
    };
  };

  // Return singleton object
  return {
    user: {
      mousedown: ( TOUCH ) ? "touchstart" : "mousedown",
      mousemove: ( TOUCH ) ? "touchmove" : "mousemove",
      mouseup: ( TOUCH ) ? "touchend" : "mouseup",
      mouseover: ( TOUCH ) ? "xxx" : "mouseover",
      mouseout: ( TOUCH ) ? "xxx" : "mouseout",
      position: getCursorPosition,
      touch: TOUCH
    },

    removeCustomEventListener: removeCustomEventListener,
    addCustomEventListener: addCustomEventListener,
    dispatchCustomEvent: dispatchCustomEvent,
    removeAll: removeAll
  };
});