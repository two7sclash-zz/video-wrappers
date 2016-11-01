/**
 * Define Property
 **/

define( function() {

  var Properties = function ( values ) {
    'use strict';
    var self = this;
    Object.getOwnPropertyNames( values ).forEach( function( entry ) {
      createProperty.call( self, entry, values[entry] );
    } );

  };

  var createProperty = function( entry, val ) {
    var self = this;
    self[entry + 'Property'] = new Property( val );
    Object.defineProperty( self, entry, {
      // Getter proxies to Model#get()...
      // Setter proxies to Model#set(attributes)
      get: function( value ) {
        return self[entry + 'Property'].get();
      },
      set: function( value ) {
        self[entry + 'Property'].set( value );
      },

      // Make it configurable and enumerable so it's easy to override...
      configurable: true,
      enumerable: true
    } );
  };

  var Property = function( value ) {
    'use strict';
    this._value = value;
    this._initialValue = value;
    this._observers = [];
  };

  Property.prototype.get = function() {
    'use strict';
    return this._value;
  };

  Property.prototype.set = function( value ) {
    'use strict';
    if ( value !== this._value ) {
      var oldValue = this._value;
      this._value = value;
      for ( var i = 0; i < this._observers.length; i++ ) {
        this._observers[i]( value, oldValue );
      }
    }
  };

  Property.prototype.notifyObservers = function () {
    for ( var i = 0; i < this._observers.length; i++ ) {
      this._observers[i]( this._value );
    }
  };

  Property.prototype.reset = function() {
    'use strict';
    this.set( this._initialValue );
  };

  Property.prototype.addObserver = function( observer ) {
    'use strict';
    if ( this._observers.indexOf( observer ) === -1 ) {
      this._observers.push( observer );
      observer( this._value, null );
    }
  };

  Property.prototype.removeObserver = function( observer ) {
    'use strict';
    var index = this._observers.indexOf( observer );
    if ( index !== -1 ) {
      this._observers.splice( index, index + 1 );
    }
  };

  return Properties;

} );
