/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  Object that initializes the application.

  @author che
  @extends SC.Object
  @since 0.1.0
*/
Multivio.initializer = SC.Object.create(
/** @scope Multivio.initializer.prototype */ {

  /**
    This object contains all parameters of the Url
    
    @property {Object}
    @default undefined
  */
  inputParameters: {},

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
            var index = url.indexOf('&url=');
            url = url.substring(index, url.length);
            url = url.replace('&url=', '');
            console.info('url = '+ url);
            //url = url.substring(0, url.lastIndexOf('&'));
            prop.url = url;
            Multivio.CDM.setReferer(url);
          }
          break;
        case 'server':
        //server is an optional parameter
          Multivio.configurator.set('serverName', params[key]);
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
      var versionReq = Multivio.configurator.getPath('baseUrlParameters.version');
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
      Multivio.CDM.setReferer(name);
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
      Multivio.logger.debug('Fixtures "%@" setted'.fmt(name));
    
      Multivio.masterController.initialize();   
    }
  }
  
});
