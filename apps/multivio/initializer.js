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
  readInputParameters: function () {
    Multivio.CDM.clear();
    // if new document clear treeController
    Multivio.treeController.clear();
    // first split url and get parameters
    var inputUrl = !SC.none(location.hash) ? location.hash : undefined;
    if (inputUrl !== undefined) {
      var listOfParams = inputUrl.split('&');
      var params = {};
      for (var i = 0; i < listOfParams.length; i++) {
        var parts = listOfParams[i].split('=');
        // no key
        if (parts.length === 1) {
          params[""] = parts[0].replace('#', '');
        }
        if (parts.length === 2) {
          params[parts[0]] = parts[1];
        }
        if (parts.length > 2) {
          var newParam = parts[1];
          for (var j = 2; j < parts.length; j++) {
            newParam += parts[j];
          }
          params[parts[0]] = newParam;
        }
      } 
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
              // regular expression
              var regExp = /(.*?)url=(.*)/;
              var res = url.match(regExp);
              url = res.pop();
              prop.url = url;
              Multivio.CDM.setReferer(url);
            }
            break;
          
          case 'doc_nr':
            Multivio.configurator.set('initialDocNr', params[key]);
            break;

          case 'server':
            // server is an optional parameter
            Multivio.configurator.set('serverName', params[key]);
            break;

          case 'theme':
            Multivio.layoutController.changeTheme(SC.Object.create({
              newTheme: 'mvo-%@-theme'.fmt(params[key])
            }));
            Multivio.layoutController.set('showThemeSelector', NO);
            break;

          // init application with a search query
          case 'search':
            // store query, ctrl will execute it upon running initialize
            var s = params[key];
            Multivio.logger.debug('initializer, store search query: ' + s);
            Multivio.searchController.set('initSearchTerm', s);
            break;

          default:
            // dump the other input parameters as-is in the table
            var value = params[key];
            prop[key] = value;
            break;
          }
        }
      }
      this.set('inputParameters', prop);
    }
    // need to have serverName before this
    Multivio.logger.initialize();
    Multivio.logger.debug('end of configurator.readInputParameters()');
  },


  /**
    Observe inputParameters and after it has changed verify if
    the application can start or not. 
    
    @observes inputParameters
  */
  inputParametersDidChange: function () {
    var parameters = this.get('inputParameters');
      // check if Multivio call is valid => get & url parameters
    if (SC.none(parameters.scenario) || SC.none(parameters.url)) {
      // if no url see if it is fixtures
      if (parameters.scenario === 'fixtures') {
        this.setFixtures();
      }
      else {
        // change application state
        Multivio.makeFirstResponder(Multivio.ERROR);
      }
    }
    else {
      // verify if the server and the client are compatible
      var versionReq = Multivio.configurator.getPath('baseUrlParameters.version');
      Multivio.requestHandler.sendGetRequest(versionReq, this, 'verifyVersion');
    }
  }.observes('inputParameters'),


  /**
    Response received about the server version.
    If client and server are compatible start the application, 
    otherwise show the error page.
    
    @param {String} response received from the server
  */
  verifyVersion: function (response) {
    if (SC.ok(response)) {
      Multivio.logger.debug('version received from the server: %@'.
          fmt(response.get("body")));
      var jsonRes = response.get("body");
      
      var serverVersion = jsonRes.api_version;
      Multivio.configurator.set('serverVersion', jsonRes.version);
      
      if (!SC.none(serverVersion) && 
          serverVersion === Multivio.configurator.serverCompatibility) {
        Multivio.logger.debug('Client and server are compatible');
        // TODO: would prefer to change state here, instead of initializing the master
        Multivio.masterController.initialize();   
      }
      else {
        Multivio.errorController.initialize({
            'err_name':         'VersionIncompatibility',
            'err_description':  'Versions:' + 
              '<ul>' +
              '  <li>server = %@</li>'.fmt(serverVersion) +
              '  <li>client = %@</li>'.fmt(Multivio.VERSION) +
              '</ul>'
          });
        Multivio.makeFirstResponder(Multivio.ERROR);
        Multivio.logger.logException('Client and server are incompatible: ' +
            Multivio.VERSION);
      }
    }
    else {
      Multivio.errorController.initialize({'err_name': 'ServerNotFound'});
      Multivio.makeFirstResponder(Multivio.ERROR);
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
      Multivio.makeFirstResponder(Multivio.WAITING);
      
      // set CDM value
      Multivio.CDM.setReferer(name);
      // get and set metadata
      var metadata = {};
      metadata[name] = Multivio.CDM.FIXTURES.metadata[name];
      var firstUrl = Multivio.CDM.FIXTURES.logical[name];
      metadata[firstUrl[0].file_position.url] = 
          Multivio.CDM.FIXTURES.metadata[firstUrl[0].file_position.url];
      Multivio.CDM.fileMetadata = metadata;
      Multivio.sendAction('fileMetadataDidChange', name);
      
      // get and set logicalStructure
      var logical = {};
      logical[name] = Multivio.CDM.FIXTURES.logical[name];
      Multivio.CDM.logicalStructure = logical;
      
      // get and set physicalStructure
      var physical = {};
      physical[name] = Multivio.CDM.FIXTURES.physical[name];
      Multivio.CDM.physicalStructure = physical;
      
      // get and set size
      var size = {};
      size = Multivio.CDM.FIXTURES.size[name];
      Multivio.CDM.imageSize = size;
      
      Multivio.masterController.set('currentFile', name);
      Multivio.logger.debug('Fixtures "%@" setted'.fmt(name));
    }
  }
  
});
