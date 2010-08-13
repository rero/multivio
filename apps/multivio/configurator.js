/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
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
    The current version of the client
  */
  clientVersion: '0.2',
  
  /**
    The table of compatibility between the server (key) and the client (value)
  */
  serverCompatibility: {
    '0.1': ['0.1'],
    '0.2': ['0.2']
  },
  
  /**
    This object contains all parameters for logs
    
    @property {Object}
  */
  logParameters: {
    log: {
      //console:        "LOG_INFO",
      browserConsole: "LOG_INFO",
      ajax:           "LOG_ERROR"
    },
    logFile: "/log/post"
  },
  
  /**
    This object contains parameters for the zoom
    
    @property {Object}
  */
  zoomParameters: {
    max: 4000000,
    initState: 'Full'
  },
  
  /**
    Zoom scale for PDF and for images
  */
  zoomStep1: [ 0.25, 0.5, 1.0, 1.5, 2.0, 4.0],
  zoomStep2: [ 0.1, 0.25, 0.5, 0.75, 1.0 ],
  
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
    
    image: "/document/render?width=1500",
    imageSize: "/document/get_size?",
    
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
        'leftStripWidth':  200,
        'rightStripWidth': 200,
        'headerHeight':     80,
        'footerHeight':     60,
        'marginTop':        10,
        'marginRight':      10,
        'marginBottom':     10,
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
      components: [{name: 'views.headerView',  coord: 'A1:C1'}]
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
        {name: 'views.treeView', coord: 'A2:A2'}
      ]
    },
    pdf: {
      components: [
        {name: 'views.treeAndContentView', coord: 'A2:B2'},
        {name: 'views.toolbar',            coord: 'A3:C3'},
        {name: 'views.thumbnailView',      coord: 'C2:C2'}
      ]
    },
    image : {
      components: [
        {name: 'views.treeAndContentView', coord: 'A2:B2'},
        {name: 'views.toolbar',            coord: 'A3:C3'},
        {name: 'views.thumbnailView',      coord: 'C2:C2'}
      ]
    }
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
