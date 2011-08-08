/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  Object that get and store all config parameters.

  @author che
  @extends SC.Object
  @since 0.1.0
*/
Multivio.configurator = SC.Object.create(
/** @scope Multivio.configurator.prototype */ {
  
  /**
    The support address
  */
  support: 'info@multivio.org',  
  
  /**
    The name of the multivio server
    
    @property {String}
    @default server
  */
  serverName: '/server',
  
  /**
    The version of the server
    
    @property {String}
  */  
  serverVersion: null,
  
  /**
    The version of the server API that is compatible with the client
  */
  serverApiCompatibility: '1.0.0',

  /**
    List of allowed themes
  */
  allowedThemes: [
    'mvo-white-theme',
    'mvo-dark-gray-theme',
    'mvo-blue-theme'
  ],
  
  /**
    List ordered of metadata 
  */
  metadataKey: [
    'title',
    'creator',
    'language'
  ],
  
  /**
    The theme to be used
  */
  initialTheme: 'mvo-white-theme',
  
  /**
    The file and the page to show first
  */
  initialFile: 1,
  initialPosition: 1,
  
  /**
    This object contains all parameters for logs
    
    @property {Object}
  */
  logParameters: {
    log: {
      //console:        "LOG_INFO",
      browserConsole: "LOG_DEBUG", // "LOG_INFO"
      ajax:           "LOG_ERROR"
    },
    logFile: "/log/post"
  },
  
  /**
    This object contains parameters for the zoom
    
    @property {Object}
  */
  zoomParameters: {
    maxResolution:          4000000,
    scaleForVectorGraphics: [ 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.75, 1.0, 1.5,
        2.0, 3.0, 4.0 ],
    scaleForBitmapGraphics: [ 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.75, 1.0 ],
    initState:              'Full'
  },
  
  /**
    This object contains all urls used by the application
    
    @property {Object}
  */
  baseUrlParameters: {
    version: "/version",
    metadata: "/metadata/get?url=",
    logicalStructure: "/structure/get_logical?url=",
    physicalStructure: "/structure/get_physical?url=",
    
    thumbnail: "/document/render?max_height=100&max_width=100",
    
    image: "/document/render?",
    imageSize: "/document/get_size?",
    
    search: "/document/search?query=%@&from=%@&to=%@&context_size=%@&max_results=%@&angle=%@&url=",
    getText: "/document/get_text?page_nr=%@&x1=%@&y1=%@&x2=%@&y2=%@&angle=%@&url=",    
    getPageIndexing: "/document/get_indexing?page_nr=%@&from=%@&to=%@&url=",
    
    fixtures: {
      VAA: "/static/multivio/en/current/images/VAA"
    }
  },

  /**
    Definition of the different layouts that can be set on the main page
    
    @property {Object}
  */
  layouts: {
    'default': {
      layoutClass: 'GridLayout3x3',
      layoutParams: {
        'leftStripWidth':  0,
        'rightStripWidth': 0,
        'headerHeight':     0,
        'footerHeight':     50,
        'marginTop':        10,
        'marginRight':      10,
        'marginBottom':     0,
        'marginLeft':       10
      }
    }
  },

  /**
    Definition of different possible component arrangements on the screen.
    The 'baseLayout' key points to the one of the members of the property
    'this.layouts'.
  
    @property {Object}
  */
  componentLayouts: {
    'init': {
      baseLayout: 'default',
      components: [
          {name: 'views.footerView', coord: 'A3:C3'},
          {
              name: 'views.mainContentView',
              coord: 'A1:C2',
              children: [
                  'views.leftButtons',
                  'views.bottomButtons',
                  'views.navigationInfo'
                ]
            }
        ]
    },
    'usage': {
      baseLayout: 'default',
      components: [{name: 'views.usageView',   coord: 'A1:C3'}]
    },
    'waiting': {
      baseLayout: 'default',
      components: [{name: 'views.waitingView', coord: 'A1:C3'}]
    },
    'error': {
      baseLayout: 'default',
      components: [{name: 'views.errorView',   coord: 'A1:C3'}]
    }
  },

  fixtureSets: {
    'VAA': {
      componentLayout: 'pageBasedWithDivider'
    }
  },
  
  /**
    Configuration of the layout depending on the type of the document
  */
  layoutConfig: {
    xml: {
      components: [
        {name: 'views.treeView', coord: 'A1:C2'}
      ]
    },
    pdf: {
      components: [{
          name: 'views.mainContentView',
          coord: 'A1:C2',
          children: [
              'views.leftButtons',
              'views.bottomButtons',
              'views.navigationInfo'
            ]
        }],
      zoomScale: 'scaleForVectorGraphics'
    },
    image : {
      components: [{
          name: 'views.mainContentView',
          coord: 'A1:C2',
          children: [
              'views.leftButtons',
              'views.bottomButtons',
              'views.navigationInfo'
            ]
      }],
      zoomScale: 'scaleForBitmapGraphics'
    }
  },
  
  /**
    Return a local type used by the application that matches the mime type 
    received from the server
    
    @param {String} mime the mime type received
    @return {String} the local type
  */
  getTypeForMimeType: function (mime) {
    var typeToReturn = undefined;
    if (mime.match('.*?/xml.*?')) {
      typeToReturn = 'xml';
    }
    
    if (mime.match('.*?/pdf.*?')) {
      typeToReturn = 'pdf';
    }
    
    if (mime.match('image/.*?')) {
      typeToReturn = 'image';
    }
    return typeToReturn;
  },
  
  /**
    Return a configuration value given its path.

    Example: if configPath = 'baseUrlParameters.image.small.' the function
    returns the equivalent of this.get('baseUrlParameters').image.small
    
    @method
    @param {String} configPath
    @return {String}
  */
  getPath: function (configPath) {
    if (SC.typeOf(configPath) !== SC.T_STRING) {
      throw {message: 'Configuration path type "%@" is invalid'.fmt(
          SC.typeOf(configPath))};
    }
    var result = undefined;
    var pathComponents = configPath.split('.');
    if (!SC.none(pathComponents) && pathComponents.length > 0) {
      // extract the first path component, which corresponds to the target
      // dictionary of Multivio.configurator
      result = this[pathComponents[0]];
      // raise an exception if path component is invalid
      if (SC.none(result)) {
        throw {message: 'Configuration path "%@" is invalid'.fmt(configPath)};
      }
      // dive deeper in the dictionary structure following the successive path
      // components
      for (var i = 1; i < pathComponents.length; i++) {
        result = result[pathComponents[i]];
      }
    }
    return result;
  },

  /**
    Return the adapted url for a file

    @param {String} url the url of the file
    @param {Number} pageNumber the page number is optional
    @return {String} the new encoded url
  */
  getImageUrl: function (url, pageNumber) {
    var scenario = Multivio.initializer.get('inputParameters').scenario;
    var modifiedUrl = '';
    switch (scenario) {
    
    case 'get':
      modifiedUrl = this.getPath('baseUrlParameters.image');
      if (pageNumber !== 0) {
        modifiedUrl += "page_nr=" + pageNumber;
        modifiedUrl += "&url=" + url;
      }
      else {
        modifiedUrl += "url=" + url;
      }
      break;
    
    case 'fixtures':
      var name = Multivio.initializer.get('inputParameters').name;
      modifiedUrl = this.getPath('baseUrlParameters.fixtures.%@'.fmt(name));
      modifiedUrl += url.substring(url.lastIndexOf("/"));
      break;
    
    default:
      modifiedUrl = undefined;        
      break;
    }
    return modifiedUrl;
  },
  
  /**
    Return the adapted url for the thumbnail image

    @param {String} url the default url of the file
    @param {Number} pageNumber the page number is optional
    @return {String} the new encoded url
  */
  getThumbnailUrl: function (url, pageNumber) {
    var scenario = Multivio.initializer.get('inputParameters').scenario;
    var modifiedUrl;
    
    switch (scenario) {
    
    case 'get':
      modifiedUrl = this.get('baseUrlParameters').thumbnail;
      if (pageNumber !== 0) {
        modifiedUrl += "&page_nr=" + pageNumber;
      } 
      modifiedUrl += "&url=" + url;
      break;
    
    case 'fixtures':
      var name = Multivio.initializer.get('inputParameters').name;
      modifiedUrl = this.getPath('baseUrlParameters.fixtures.%@'.fmt(name));
      modifiedUrl += url.substring(url.lastIndexOf("/"));
      break;
    
    default:
      modifiedUrl = undefined;
      break;
    }
    return modifiedUrl;
  }

});
