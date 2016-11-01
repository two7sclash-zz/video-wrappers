define( function() {
  
  var loadImage = function( name, req, onLoad, config ) {
    if ( config.isBuild ){
      // Avoid errors on the optimizer since it can't inline image files
      onLoad( null );
    } else {
      // Define image as Tag object
      var img = new Image();
      
      img.onerror = function( err ) {
        onLoad.error( err );
      };
      
      img.onload = function( evt ) {
        img.onload = null;
        onLoad( img );
      };
      
      // Load image by default link
      name = req.toUrl( name );

      if ( name.indexOf( '!cache' ) > -1 ) {
        name = name.substring( 0, name.indexOf( '!cache' ) );
      }

      img.src = name;
    }
  };
  
  // Return main API
  return {
    load : loadImage
  };
  
} );