define( function() {
  
  var fullVersion = parseFloat( navigator.appVersion, 10 ) + "",
      majorVersion = parseInt( navigator.appVersion, 10 ),
      browserName = navigator.appName,
      nVer = navigator.appVersion,
      nAgt = navigator.userAgent;
  
  var nameOffset, verOffset, ix, ver;
  
  // In Opera, the true version is after "Opera" or after "Version"
  if ( ( verOffset = nAgt.indexOf("Opera") ) > -1 ) {
    fullVersion = nAgt.substring( verOffset + 6 );
    verOffset = nAgt.indexOf("Version");
    if ( verOffset > -1 ) {
      fullVersion = nAgt.substring( verOffset + 8 );
    }
    browserName = "Opera";
  } else
  // In MSIE, the true version is after "MSIE" in userAgent
  if ( ( verOffset = nAgt.indexOf("MSIE") ) > -1 ) {
    fullVersion = nAgt.substring( verOffset + 5 );
    browserName = "MSIE";
  } else
  if ( ( verOffset = nAgt.indexOf("Trident") ) > -1 ) {
    fullVersion = nAgt.match(/rv:\d+\.?(\d+)?/)[0].replace(/rv:/, "");
    browserName = "MSIE";
  } else
  // In Chrome, the true version is after "Chrome" 
  if ( (verOffset = nAgt.indexOf("Chrome") ) > -1 ) {
    fullVersion = nAgt.substring( verOffset + 7 );
    browserName = "Chrome";
  } else
  // In Safari, the true version is after "Safari" or after "Version" 
  if ( ( verOffset = nAgt.indexOf("Safari") ) > -1 ) {
    fullVersion = nAgt.substring( verOffset + 7 );
    verOffset = nAgt.indexOf("Version");
    if ( verOffset > -1 ) {
      fullVersion = nAgt.substring( verOffset + 8 );
    }
    browserName = "Safari";
  } else
  // In Firefox, the true version is after "Firefox" 
  if ( ( verOffset = nAgt.indexOf("Firefox") ) > -1 ) {
    fullVersion = nAgt.substring( verOffset + 8 );
    browserName = "Firefox";
  }
  
  // Trim the fullVersion string at semicolon/space if present
  if ( ( ix = fullVersion.indexOf(";") ) > -1 ) {
    fullVersion = fullVersion.substring( 0, ix );
  }
  if (( ix = fullVersion.indexOf(" ") ) > -1 ) {
    fullVersion = fullVersion.substring(0,ix);
  }
  
  fullVersion = parseFloat( fullVersion, 10 );
  majorVersion = parseInt( fullVersion, 10 );
  
  if ( isNaN( majorVersion ) ) {
   fullVersion  = parseFloat( navigator.appVersion, 10 ); 
   majorVersion = parseInt( navigator.appVersion, 10 );
  }
  
  // Constructor to detect the operating system name
  var OS = function() {
    this.BlackBerry = ( nAgt.indexOf("BlackBerry") > -1 );
    this.iOS = ( nAgt.match(/iPad|iPhone|iPod/) > -1 );
    this.Android = ( nAgt.indexOf("Android") > -1 );
    this.Windows = ( nVer.indexOf("Win") > -1 );
    this.Linux = ( nVer.indexOf("Linux") > -1 );
    this.MacOS = ( nVer.indexOf("Mac") > -1 );
    this.UNIX = ( nVer.indexOf("X11") > -1 );
  };
  
  // Constructor to detect current user language
  var Language = function() {
    var lang = navigator.language;
    
    if ( !Language.allowed[ lang ] ) {
      lang = Language.DEFAULT;
    }
    
    return Language.allowed[ lang ];
  };
  
  Language.allowed = {
    "en": "English",
    "es": "Spanish"
  };
  
  Language.DEFAULT = "en";
  
  // Constructor to detect the platform type name
  var Platform = function() {
    this.Mobile = nAgt.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
    this.PC = !this.Mobile;
  };
  
  // Constructor to detect browser name
  var BrowserName = function() {
    this.Firefox = ( browserName == "Firefox" );
    this.Safari = ( browserName == "Safari" );
    this.Chrome = ( browserName == "Chrome" );
    this.Opera = ( browserName == "Opera" );
    this.MSIE = ( browserName == "MSIE" );
  };
  
  var Browser = function() {
    // Detect language
    this.language = new Language();
    
    // Detect platform type
    this.platform = new Platform();
    
    // Detect browser name
    this.name = new BrowserName();
    
    // Detect OS system
    this.os = new OS();
    
    // Define version
    this.fullVersion = fullVersion;
    this.version = majorVersion;
  };

  // Return instance of Browser object
  return new Browser();
  
} );