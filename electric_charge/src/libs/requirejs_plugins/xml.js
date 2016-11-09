define( function( require ) {
  
  // Import required dependencies
  var text = require( './text' );
  
  // Store for build mode
  var buildMap = {/* Store for loaded XML files */};
  
  // XML parser
  var parseXML = function( xmlString ) {
    var xml = null, parser;
    
    if ( window.DOMParser ) {
      parser = new window.DOMParser();
      xml = parser.parseFromString( xmlString, "text/xml" );
    } else
    if ( window.ActiveXObject ) {
      parser = new window.ActiveXObject("Microsoft.XMLDOM");
      parser.async = "false";
      parser.loadXML( xmlString );
      xml = parser;
    } else {
      throw new Error("No XML parser found!");
    }
    
    return xml.documentElement;
  };
  
  var write = function( pluginName, moduleName, write ) {
    if ( buildMap[ moduleName ] ) {
      write('define("' + pluginName + '!' + moduleName + '", function() {\n' +
      '  var div = document.createElement("div");\n' + 
      '  div.innerHTML = ' + buildMap[ moduleName ] + ';\n' +
      '  return div.firstChild;\n});\n');
    }
  };
  
  var loadXML = function( name, req, onLoad, config ) {
    if ( config.isBuild && config.inlineXML === false ) {
      // Avoid inlining cache busted JSON or if inlineXML:false
      onLoad( null );
    } else {
      text.get( req.toUrl( name ), function( data ) {
        if ( config.isBuild ) {
          buildMap[ name ] = data;
          onLoad( data );
        } else {
          onLoad( parseXML( data ) );
        }
      }, onLoad.error, {
          accept: 'application/xml'
      } );
    }
  };
  
  // Return main API
  return {
    load : loadXML,
    write :  write
  };
  
} );