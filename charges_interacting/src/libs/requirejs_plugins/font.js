define( function( require ) {

  var browser = require( '../../../../common/scripts/tools/browser' );
  var timer = require( '../../../../common/scripts/tools/timer/timer' );
  // Import used utilities

  // Store for loaded fonts
  var loadedFonts = {
    /*
     state 1: sent request to load font
     state 2: font loaded
     */
  };

  var fontTypeMap = {
    'italic': 'font-style: italic;\n',
    'bold': 'font-weight: bold;\n',
    'regular': ''
  };

  var fontStyleMap = {
    'italic': 'fontStyle',
    'bold': 'fontWeight'
  };

  var parseFontName = function( config, name ) {
    var index = name.lastIndexOf( "!" ),
      fontName, fontType, fontURL;

    if ( index > -1 ) {
      fontType = name.substring( index + 1 );
      fontName = name.substring( 0, index );
    }
    else {
      fontType = "regular";
      fontName = name;
    }

    fontURL = config.paths.FONTS + '/' +
              fontName.replace( /\s/g, "" );

    return {
      name: fontName,
      type: fontType,
      url: fontURL
    };
  };

  var createCSSFontStyle = function( font ) {
    var head = document.querySelector( 'head' );
    var style = document.createElement( 'style' );
    style.type = 'text/css';
    style.innerHTML = "@font-face {\n" +
                      '  font-family: "' + font.name + '";\n' + '  ' + fontTypeMap[ font.type ] +
                      '  src: url("' + font.url + '-' + font.type + '.woff") format("woff"),\n' +
                      '    url("' + font.url + '-' + font.type + '.ttf") format("truetype");\n' +
                      '}';
    head.appendChild( style );
    return style;
  };

  var createTextBlock = function() {
    var body = document.querySelector( 'body' );
    var div = document.createElement( 'div' );
    div.style.visibility = "hidden";
    div.style.position = "absolute";
    div.style.fontFamily = "Arial";
    div.style.fontSize = "16px";
    div.style.left = "0px";
    div.style.top = "0px";
    div.innerHTML = "text_example";
    body.appendChild( div );
    return div;
  };

  var setNodeFont = function( node, font ) {
    if ( fontStyleMap[ font.type ] ) {
      node.style[ fontStyleMap[ font.type ] ] = font.type;
    }
    node.style.fontFamily = font.name;
  };

  var removeDOMObject = function( node ) {
    if ( node.parentNode ) {
      node.parentNode.removeChild( node );
    }
  };

  var loadFont = function( name, req, onLoad, config ) {
    if ( config.isBuild ) {
      // Avoid errors on the optimizer
      onLoad( null );
    }
    else {
      var font = parseFontName( config, name ),
        fontId = font.name + font.type,
        div = createTextBlock( font ),
        oldHeight = div.offsetHeight,
        oldWidth = div.offsetWidth;

      var removeDivAndCallOnLoad = function() {
        removeDOMObject( div );
        onLoad( true );
      };

      var addCheckerListenerAndSetNodeFont = function() {
        timer.addTimeListener( checker );
        setNodeFont( div, font );
      };

      var checker = function() {
        var h = div.offsetHeight,
          w = div.offsetWidth;

        if ( w !== oldWidth || h !== oldHeight ) {
          timer.delTimeListener( checker );
          removeDivAndCallOnLoad();
          loadedFonts[fontId] = 2;
        }
      };

      // Font hasn't been loaded
      if ( !loadedFonts[fontId] ) {
        createCSSFontStyle( font );

        addCheckerListenerAndSetNodeFont();
        timer.play();

        loadedFonts[fontId] = 1;
      }
      // Font is loading
      else if ( loadedFonts[fontId] === 1 ) {
        addCheckerListenerAndSetNodeFont();
      }
      // Font already loaded
      else if ( loadedFonts[fontId] === 2 ) {
        removeDivAndCallOnLoad();
      }
    }
  };

  // Return main API
  return {
    load: loadFont
  };

} );