(function() {
  var DEBUG = false;

  var LIBS = './src/libs';
  var JS = './src/js';
  var REQUIRE_PLUGIN = LIBS + '/requirejs_plugins';

  requirejs.config({
    paths: {
      // Entry point
      main: JS + '/main',

      JS: JS,

      // List of main classes and objects
      browser: LIBS + '/browser',
      event: LIBS + '/event',
      properties: LIBS + '/properties',

      // Require plugins
      style: REQUIRE_PLUGIN + '/css',
      font: REQUIRE_PLUGIN + '/font',
      html: REQUIRE_PLUGIN + '/html',
      image: REQUIRE_PLUGIN + '/image',
      json: REQUIRE_PLUGIN + '/json',
      text: REQUIRE_PLUGIN + '/text',
      url: REQUIRE_PLUGIN + '/url',
      xml: REQUIRE_PLUGIN + '/xml',

      assets: './src/html',
      css: './src/css',
      model: JS + '/model',
      view: JS + '/view',
      widgets: JS + '/widgets',
      stores: JS + '/stores',
      components: JS + '/components'
    },

    waitSeconds: 60
  });

  if (DEBUG) {
    requirejs.config({
      urlArgs: "bust=" + Date.now()
    });
  }
})();