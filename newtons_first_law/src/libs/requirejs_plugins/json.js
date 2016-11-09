define( function( require ) {
  
  // Import required dependencies
  var text = require( './text' );
  
  // Store for build mode
  var buildMap = {/* Store for loaded JSON */};
  
  var write = function( pluginName, moduleName, write ) {
    if ( buildMap[ moduleName ] ) {
      write('define("' + pluginName + '!' + moduleName + '", function() { return ' + buildMap[ moduleName ] + ';});\n');
    }
  };
  
  var loadJSON = function( name, req, onLoad, config ) {
    if ( config.isBuild && config.inlineJSON === false ) {
      // Avoid inlining cache busted JSON or if inlineJSON:false
      onLoad( null );
    } else {
      text.get( req.toUrl( name ), function( data ) {
        if ( config.isBuild ) {
          buildMap[ name ] = data;
          onLoad( JSON.parse( data ) );
        } else {
          onLoad( JSON.parse( data ) );
        }
      }, onLoad.error, {
          accept: 'application/json'
      } );
    }
  };
  
  // Return main API
  return {
    load : loadJSON,
    write :  write
  };
  
} );