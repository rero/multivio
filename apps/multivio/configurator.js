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
    This object contains all parameters of the Url
    
    @property {Object}
    @default undefined
  */
  inputParameters: {},
  
  /**
    The name of the multivio server
    
    @property {String}
    @default server
  */
  serverName: '/server',
  
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
    This object contains all urls used by the application
    
    @property {Object}
  */
  baseUrlParameters: {
    version: "/version",
    metadata: "/metadata/get?url=",
    logicalStructure: "/structure/get_logical?url=",
    physicalStructure: "/structure/get_physical?url=",
    
    thumbnail: "/document/get?width=100&url=",
    
    image: {
      small:  "/document/get?width=1000&url=",
      normal: "/document/get?width=1500&url=",
      big:    "/document/get?width=2000&url="
    },
    
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
        {name: 'navigationView', position: 'bottom'},
        {name: 'thumbnailView', position: 'right'}        
      ]
    },
    image : {
      components: [
        {name: 'treeAndContentView', position: 'leftAndCenter'},
        {name: 'navigationView', position: 'bottom'},
        {name: 'thumbnailView', position: 'right'}        
      ]
    }
  },

  /**
    Read and store parameters of the Url
    
    @param {String} params 
  */
  readInputParameters: function (params) {
    var prop = {};
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        switch (key) {
        case "":
          prop.scenario = params[key];
          break;
        case 'url':
          // use location.hash to prevent splitting the url
          var url = !SC.none(location.hash) ? location.hash : undefined;
          if (url !== undefined) {
            url = url.replace('#get&url=', '');
            url = url.substring(0, url.lastIndexOf('&'));
            prop.url = url;
            Multivio.CDM.setReferer(url);
          }
          break;
        case 'server':
        //server is an optional parameter
          this.set('serverName', params[key]);
          break;
        default:
          var value = params[key];
          prop[key] = value;
          break;
        }
      }
    }
    this.set('inputParameters', prop);
    //need to have serverName before this
    Multivio.logger.initialize();
    Multivio.logger.debug('end of configurator.readInputParameters()');
  },
  
  /**
    Observe inputParameters and  after it has changed verify if 
    the application can start or not. 
    
    @observes inputParameters
  */
  inputParametersDidChange: function () {
    var parameters = this.get('inputParameters');
      //check if Multivio call is valid => get & url parameters
    if (SC.none(parameters.scenario) || SC.none(parameters.url)) {
      //if no url see if it is fixtures
      if (parameters.scenario === 'fixtures') {
        this.setFixtures();
      }
      else {
        Multivio.layoutController._showUsagePage();
      }
    }
    else {
      //verify if the server and the client are compatible
      var versionReq = this.getPath('baseUrlParameters.version');
      Multivio.requestHandler.sendGetRequest(versionReq, this, 'verifyVersion');
    }
  }.observes('inputParameters'),
  
  /**
    Response received about the server version.
    If client and server are compatible start the application, 
    if no show the error page.
  */
  verifyVersion: function (response) {
    if (SC.ok(response)) {
      Multivio.logger.debug('version received from the server: %@'.
          fmt(response.get("body")));
      var jsonRes = response.get("body");
      //TO DO test between server and client
      if (jsonRes.api_version === '0.1') {
        Multivio.logger.debug('Client and server are compatible');
        Multivio.masterController.initialize();
      }
      else {
        Multivio.errorController.
            initialize({'message': 'incompatibility between server and client'});
        Multivio.logger.
            logException('Client and server are incompatible: ' + Multivio.VERSION);    
        Multivio.layoutController._showErrorPage();
      }
    } 
  },
  
  /**
  Set CDM from fixture data.
  */
  setFixtures: function () {
    var name = this.get('inputParameters').name;
    if (SC.none(name)) {
      Multivio.layoutController._showUsagePage();
    }
    else {
      //set CDM value
      switch (name) {
      
      case 'VAA':
        Multivio.CDM.setReferer('VAA');
        //get and set metadata
        var metadata = {};
        metadata[name] = Multivio.CDM.FIXTURES.metadata[name];
        var firstUrl = Multivio.CDM.FIXTURES.logical[name];
        metadata[firstUrl[0].file_position.url] = 
            Multivio.CDM.FIXTURES.metadata[firstUrl[0].file_position.url];
        Multivio.CDM.metadata = metadata;
        //get and set logicalStructure
        var logical = {};
        logical[name] = Multivio.CDM.FIXTURES.logical[name];
        Multivio.CDM.logicalStructure = logical;
        //get and set physicalStructure
        var physical = {};
        physical[name] = Multivio.CDM.FIXTURES.physical[name];
        Multivio.CDM.physicalStructure = physical;
        Multivio.logger.debug('Fixtures VAA setted');
        break;
      
      default: 
        Multivio.logger.error('configurator: the value "%@" '.fmt(name) +
            'for the "name" parameter is configured in the application ' +
            'but seems invalid at this point');
        break;
      }
      Multivio.masterController.initialize();   
    }
  },
  
  /**
    Return a configuration value given its path.

    Example: if configPath = 'baseUrlParameters.image.small.' the function
    returns the equivalent of this.get('baseUrlParameters').image.small
    
    @method
    @param {String} configPath
    @returns {String}
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
    var scenario = this.getPath('inputParameters.scenario');
    var modifiedUrl = '';
    switch (scenario) {
    
    case 'get':
      modifiedUrl = this.getPath('baseUrlParameters.image.normal');
      modifiedUrl += url;
      modifiedUrl += "&pagenr=" + pageNumber;      
      break;
    
    case 'fixtures':
      var name = this.getPath('inputParameters.name');
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
    var scenario = this.get('inputParameters').scenario;
    var modifiedUrl;
    
    switch (scenario) {
    
    case 'get':
      modifiedUrl = this.get('baseUrlParameters').thumbnail;
      modifiedUrl += url;
      modifiedUrl += "&pagenr=" + pageNumber;
      break;
    
    case 'fixtures':
      var name = this.get('inputParameters').name;
      modifiedUrl = this.getPath('baseUrlParameters.fixtures.%@'.fmt(name));
      modifiedUrl += url.substring(url.lastIndexOf("/"));
      break;
    
    default:
      modifiedUrl = undefined;
      break;
    }
    return modifiedUrl;
  },

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
