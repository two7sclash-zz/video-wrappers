define( function( require ) {

  var write = function( pluginName, moduleName, write ) {
    if ( buildMap[ moduleName ] ) {
      write('define("' + pluginName + '!' + moduleName + '", function() {\n' +
      '  var div = document.createElement("div");\n' + 
      '  div.innerHTML = ' + buildMap[ moduleName ] + ';\n' +
      '  return div.firstChild;\n});\n');
    }
  };

  var loadCSS = function( name, req, onLoad, config ) {
    var head = document.head || document.querySelector( 'head' );
    var link = document.createElement( 'link' );
    link.setAttribute( 'rel', 'stylesheet' )
    link.setAttribute( 'type', 'text/css' )
    link.setAttribute( 'href', req.toUrl( name ) );
    head.appendChild( link );
    onLoad( true );
  };

  // Return main API
  return {
    load : loadCSS
  };

} );