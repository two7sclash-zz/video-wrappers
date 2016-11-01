define( function() {
  
  var xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
      bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
      xdRegExp = /^((\w+)\:)?\/\/([^\/\\]+)/,
      hasLocation = location && location.href,
      defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
      defaultHostName = hasLocation && location.hostname,
      defaultPort = hasLocation && (location.port || undefined),
      buildMap = {}, getText, fs;
  
  // Strips <?xml ...?> declarations so that external SVG and XML
  //   documents can be added to a document without worry. Also, if the string
  //   is an HTML document, only the part inside the body tag is returned.
  var textStrip = function( content ) {
    if ( content ) {
      content = content.replace( xmlRegExp, "" );
      var matches = content.match( bodyRegExp );
      ( matches ) && ( content = matches[1] );
    } else {
      content = "";
    }
    
    return content;
  };
  
  // Escape content of textfile for javascript
  var jsEscape = function( content ) {
    return content.replace(/(['\\])/g, '\\$1')
                  .replace(/[\f]/g, "\\f")
                  .replace(/[\b]/g, "\\b")
                  .replace(/[\n]/g, "\\n")
                  .replace(/[\t]/g, "\\t")
                  .replace(/[\r]/g, "\\r");
  };
  
  // Parses a resource name into its component parts.
  // Resource names look like: module/name.ext!strip,
  //   where the !strip part is optional.
  // @param {String} name the resource name
  // @returns {Object} with properties "moduleName", "ext" and "strip",
  //   where strip is a boolean.
  var parseName = function( name ) {
    var strip = false, index = name.indexOf("."),
        ext = name.substring( index + 1, name.length ),
        modName = name.substring( 0, index );
    
    // Pull off the strip arg.
    index = ext.indexOf("!");
    
    if ( index > -1 ) {
      strip = ext.substring( index + 1, ext.length );
      ext = ext.substring( 0, index );
      strip = ( strip === "strip" );
    }
  
    return {
      moduleName: modName,
      strip: strip,
      ext: ext
    };
  };
  
  // Is an URL on another domain. Only works for browser use,
  //   returns false in non-browser environments.
  // Only used to know if an optimized .js version of a text resource
  //   should be loaded instead.
  // @param {String} url
  // @returns Boolean
  var useXHR = function( url, protocol, hostname, port ) {
    var match = xdRegExp.exec( url ),
        uProtocol, uHostName, uPort;
    
    if ( !match ) { return true; };
    
    uProtocol = match[2];
    uHostName = match[3];
    
    uHostName = uHostName.split(':');
    uPort = uHostName[1];
    uHostName = uHostName[0];
    
    return ( !uProtocol || uProtocol === protocol ) &&
           ( !uHostName || uHostName === hostname ) &&
        ( ( !uPort && !uHostName ) || uPort === port );
  };
  
  var finishLoad = function( name, strip, content, onLoad, config ) {
    content = strip ? textStrip( content ) : content;
    ( config.isBuild ) && ( buildMap[ name ] = content );
    onLoad( content );
  };
  
  var loadText = function( name, req, onLoad, config ) {
    // Name has format: some.module.filext!strip
    // The strip part is optional.
    // If strip is present, then that means only get the string contents
    //   inside a body tag in an HTML string. For XML/SVG content it means
    //   removing the <?xml ...?> declarations so the content can be inserted
    //   into the current doc without problems.
    //
    // Do not bother with the work if a build and text will not be inlined.
    if ( config.isBuild && !config.inlineText ) {
        onLoad(); return false;
    }
    
    var useXhr = ( config && config.text && config.text.useXhr ) || useXHR,
        parsed = parseName( name ),
        nonStripName = parsed.moduleName + '.' + parsed.ext,
        url = req.toUrl( nonStripName );
    
    if ( !hasLocation || useXhr( url, defaultProtocol, defaultHostName, defaultPort ) ) {
      // Load the text. Use XHR if possible and in a browser.
      getText( url, function( content ) {
        finishLoad( name, parsed.strip, content, onLoad, config );
      });
    } else {
      // Need to fetch the resource across domains. Assume
      //   the resource has been optimized into a JS module.
      // Fetch by the module name + extension, but do not include
      //   the !strip part to avoid file system issues.
      req( [ nonStripName ], function( content ) {
        finishLoad( nonStripName, parsed.strip, content, onLoad, config );
      });
    }
  };
  
  var writeText = function( pluginName, moduleName, write, config ) {
    if ( buildMap[ moduleName] ) {
      var content = jsEscape( buildMap[ moduleName ] );
      write.asModule(
        pluginName + "!" + moduleName,
        "define(function () { return '" + content + "';});\n"
      );
    }
  };
  
  var writeFile = function (pluginName, moduleName, req, write, config) {
    // Use a '.js' file name so that it indicates it is a
    //   script that can be loaded across domains.
    var parsed = parseName( moduleName ),
        nonStripName = parsed.moduleName + '.' + parsed.ext,
        fileName = req.toUrl( nonStripName ) + '.js';
    
    // Leverage own loadText() method to load plugin value, but only
    //   write out values that do not have the strip argument,
    //   to avoid any potential issues with ! in file names.
    loadText( nonStripName, req, function( value ) {
      // Use own write() method to construct full module value.
      // But need to create shell that translates writeFile's
      //  write() to the right interface.
      var textWrite = function ( contents ) {
        return write( fileName, contents );
      };
      
      textWrite.asModule = function ( moduleName, contents ) {
        return write.asModule(moduleName, fileName, contents);
      };
    
      writeText( pluginName, nonStripName, textWrite, config );
    }, config );
  };
  
  // Build getText function
  if ( XMLHttpRequest ) {
    getText = function( url, callback ) {
      var xhr = new XMLHttpRequest();
      xhr.open( 'GET', url, true );
      xhr.onreadystatechange = function( evt ) {
        // Do not explicitly handle errors, those should be
        //   visible via console output in the browser.
        if ( xhr.readyState === 4 ) {
          callback( xhr.responseText );
        }
      };
      
      xhr.send( null );
    };
  } else
  if ( process && process.versions && !!process.versions.node ) {
    // Using special require.nodeRequire, something added by r.js.
    // See http://requirejs.org/docs/optimization.html
    fs = require.nodeRequire('fs');
    getText = function (url, callback) {
      var file = fs.readFileSync( url, 'utf8' );
      // Remove BOM (Byte Mark Order) from utf8 files if it is there.
      if ( file.indexOf('\uFEFF') === 0 ) {
        file = file.substring(1);
      }
      callback( file );
    };
  } else
  if ( Packages ) {
    // Why Java, why is this so awkward?
    getText = function( url, callback ) {
      var file = new java.io.File( url ),
          lineSeparator = java.lang.System.getProperty("line.separator"),
          inputSteam = new java.io.FileInputStream( file ),
          inputStreamReader = new java.io.InputStreamReader( inputSteam, "utf-8" ),
          input = new java.io.BufferedReader( inputStreamReader ),
          stringBuffer, line, content = '';
      
      try {
        stringBuffer = new java.lang.StringBuffer();
        line = input.readLine();
        
        // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324.
        // See http://www.unicode.org/faq/utf_bom.html
    
        // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
        // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
        if ( line && line.length() && line.charAt(0) === 0xfeff ) {
          // Eat the BOM, since we've already found the encoding on this file,
          //   and we plan to concatenating this buffer with others;
          //   the BOM should only appear at the top of a file.
          line = line.substring(1);
        }
        
        stringBuffer.append( line );
        
        while ( ( line = input.readLine() ) !== null ) {
          stringBuffer.append( lineSeparator );
          stringBuffer.append( line );
        }
        
        // Make sure we return a JavaScript string and not a Java string.
        content = String( stringBuffer.toString() );
      } finally {
        input.close();
      }
      
      callback( content );
    };
  }
  
  // Return main API
  return {
    writeFile : writeFile,
    write : writeText,
    load : loadText,
    get : getText
  };
  
} );