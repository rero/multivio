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
    The name of the multivio server
    
    @property {String}
    @default server
  */
  serverName: '/server',
  
  /**
    The current version of the client
  */
  clientVersion: '0.1',
  
  /**
    The table of compatibility between the server (key) and the client (value)
  */
  serverCompatibility: {
    '0.1': ['0.1']
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
    max: 2000,
    min: 100,
    initState: 'Full'
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
    
    image: "/document/render?width=1500",
    
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
      components: [
        {name: 'views.headerView',         x: 0, y: 0, xlen: 3, ylen: 1}
      ]
    },
    'usage': {
      baseLayout: 'default',
      components: [
        {name: 'views.usageView', x: 0, y: 0, xlen: 3, ylen: 3}
      ]
    },
    'waiting': {
      baseLayout: 'default',
      components: [
        {name: 'views.waitingView', x: 0, y: 0, xlen: 3, ylen: 3}
      ]
    },
    'error': {
      baseLayout: 'default',
      components: [
        {name: 'views.errorView', x: 0, y: 0, xlen: 3, ylen: 3}
      ]
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
        {name: 'treeView', position: 'left'}
      ]
    },
    pdf: {
      components: [
        {name: 'treeAndContentView', position: 'leftAndCenter'},
        {name: 'toolbar', position: 'bottom'},
        {name: 'thumbnailView', position: 'right'}        
      ]
    },
    image : {
      components: [
        {name: 'treeAndContentView', position: 'leftAndCenter'},
        {name: 'toolbar', position: 'bottom'},
        {name: 'thumbnailView', position: 'right'}        
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
  },

  /**
    The text that explain how to call correctly the application
  */
  usageText: '' +
    '<img src="%@" class="sc-icon-info-48">'.fmt(SC.BLANK_IMAGE_URL) +
    '<div class="mvo_info_full_message">' +
    '<h3>' + '_How to launch Multivio'.loc() + '</h3>' +
    '<p>' +
    '_The calling syntax is'.loc() + ':' +
    '<ul><li>http://demo.multivio.org/client/#get&url={TARGET}</li></ul>' +
    '_The {TARGET} URL can link to'.loc() + ':' +
    '<ul>' +
    '  <li>' + '_A Dublin Core record'.loc() + '</li>' +
    '  <li>' + '_A METS record (supported profiles only)'.loc() + '</li>' +
    '</ul>' +
    '_Examples'.loc() + ':' +
    '<ul>' +
    '  <li>http://demo.multivio.org/client/#get&url=http://doc.rero.ch/record/9495/export/xd</li>' +
    '  <li>http://demo.multivio.org/client/#get&url=http://era.ethz.ch/oai?verb=GetRecord&metadataPrefix=mets&identifier=oai:era.ethz.ch:34314</li>' +
    '</ul>' +
    '</p>' +
    '</div>'
  
});
