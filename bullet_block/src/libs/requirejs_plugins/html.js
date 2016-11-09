define( function( require ) {
  
  // Import required dependencies
  var text = require( './text' );
  
  // Store for build mode
  var buildMap = {/* Store for loaded HTML files */};
  
  // XML parser
  var parseHTML = function( htmlString ) {
    var div = document.createElement( 'div' );
    div.innerHTML = htmlString;
    return div.firstChild;
  };
  
  var write = function( pluginName, moduleName, write ) {
    if ( buildMap[ moduleName ] ) {
      write('define("' + pluginName + '!' + moduleName + '", function() {\n' +
      '  var div = document.createElement("div");\n' + 
      '  div.innerHTML = ' + buildMap[ moduleName ] + ';\n' +
      '  return div.firstChild;\n});\n');
    }
  };
  
  var loadHTML = function( name, req, onLoad, config ) {
    if ( config.isBuild && config.inlineXML === false ) {
      // Avoid inlining cache busted JSON or if inlineXML:false
      onLoad( null );
    } else {
      text.get( req.toUrl( name ), function( data ) {
        if ( config.isBuild ) {
          buildMap[ name ] = data;
          onLoad( data );
        } else {
          onLoad( parseHTML( data ) );
        }
      }, onLoad.error, {
          accept: 'text/html'
      } );
    }
  };
  
  // Return main API
  return {
    load : loadHTML,
    write :  write
  };
  
} );