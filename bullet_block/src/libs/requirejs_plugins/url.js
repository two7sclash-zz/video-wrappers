define( function( require ) {

  return {
    load : function( name, req, onLoad, config ) {
      onLoad( req.toUrl( name ) );
    }
  };

} );