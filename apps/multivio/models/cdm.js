/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  CDM (Core Document Model) is the global model of the application. 
  The CDM consists of 4 objects.
  
  CDM can return as response:
    -1: the response is not on the client-side but 
        the request has been transmitted to the server
    {Object}: the response of the request. The response can be 'null'

  @extends SC.Object
  @version 0.2.0
*/
Multivio.CDM = SC.Object.create(
/** @scope Multivio.CDM.prototype */ {

  /**
    CDM parts
  
    referer {String}: the initial url
    fileMetadata {Object}: descriptive and technical metadata of the file
    logicalStructure {Object}: the logical structure of the file (can be null)
    physicalStructure {Object}: the physical structure of the file 
  */
  referer: undefined,
  fileMetadata: undefined,
  logicalStructure: undefined,
  physicalStructure: undefined,

  /**
    Store the fileMetadata for a specific url
  
    @param {String} response the response received from the server
    @param {String} url the corresponding url
  */
  setFileMetadata: function (response, url) {
    if (SC.ok(response)) {
      Multivio.logger.debug('metadata received from the server: %@'.
          fmt(response.get("body")));    
      var jsonRes = response.get("body");
      var isError = NO;
      // Check if there is an error
      for (var key in jsonRes) {
        if (jsonRes.hasOwnProperty(key)) {
          if (key === '-1') {
            isError = YES;
          }
        } 
      }
      // if error change to state ERROR
      if (isError) {
        Multivio.errorController.initialize({'message': jsonRes['-1']});
        Multivio.makeFirstResponder(Multivio.ERROR);
      }
      // else add the response to the fileMetadata object
      else {
        var t2 = {};
        if (!SC.none(this.get('fileMetadata'))) {
          var oldMeta = this.get('fileMetadata');
          t2 = this.clone(oldMeta);
        }
        t2[url] = jsonRes;
        this.set('fileMetadata', t2);
        Multivio.logger.info('New metadata added for ' + url);
      }
    }
  },
  
  /**
    Clone the structure.
    
    We must clone the object to activate the binding
  
    @param {Object} instance the instance to clone
    @return {Object} the cloned instance
  */
  clone: function (instance) {
    if (typeof(instance) !== 'object' || instance === null) {
      return instance;
    }

    //create new instance
    var newInstance = instance.constructor();
    //clone the instance
    for (var i in instance) {
      if (instance.hasOwnProperty(i)) {
        newInstance[i] = this.clone(instance[i]);
      }
    }
    return newInstance;
  },
  
  /**
    Return the fileMetadata for a url. If the information is not on the client
    ask the server and return -1. 
  
    @param {String} url
    @return {Object} metadata returns actual fileMetadata or 
        -1 if it doesn't exist 
  */
  getFileMetadata: function (url) {
    if (SC.none(url)) {
      url = this.referer;
    }

    if (SC.none(this.get('fileMetadata')) || 
        this.get('fileMetadata')[url] === undefined) {
      // ask the server
      var serverAdress = Multivio.configurator.
          getPath('baseUrlParameters.metadata');
      serverAdress += url;
      Multivio.requestHandler.
          sendGetRequest(serverAdress, this, 'setFileMetadata', url);
      // put -1 for this url
     /* var t2 = {};
      if (!SC.none(this.get('fileMetadata'))) {
        t2 = this.get('fileMetadata');
      }
      t2[url] = -1;
      this.set('fileMetadata', t2);*/
      return -1;  
    }
    else {
      var md = this.get('fileMetadata')[url];
      Multivio.logger.debug('metadata returned by cdm ' + md);
      return md;
    }
  },

  /**
    Store the referer url
  
    @param {String} url the initial url parameter 
  */
  setReferer: function (url) {
    this.set('referer', url);
  },
  
  /**
    Return the referer url
  
    @return {String}
  */
  getReferer: function () {
    var referer = this.get('referer');
    return referer;
  },
  
  /**
    Store the logical structure for a specific url 
  
    @param {String} response the response received from the server
    @param {String} url the corresponding url
  */
  setLogicalStructure: function (response, url) {
    // verify if response is OK and if there is no error code in the response
    if (SC.ok(response)) {
      Multivio.logger.debug('logicalStructure received from the server: %@'.
          fmt(response.get("body")));    
      var jsonRes = response.get("body");
      var isError = NO;
      for (var key in jsonRes) {
        if (jsonRes.hasOwnProperty(key)) {
          if (key === '-1') {
            isError = YES;
          }
        } 
      }
      if (isError) {
        Multivio.errorController.initialize({'message': jsonRes['-1']});
        Multivio.makeFirstResponder(Multivio.ERROR);
      }
      // save response
      else {
        var t2 = {};
        if (!SC.none(this.get('logicalStructure'))) {
          var oldLogic = this.get('logicalStructure');
          t2 = this.clone(oldLogic);
        }
        t2[url] = jsonRes;
        this.set('logicalStructure', t2);
        Multivio.logger.info('New logicalStructure added for ' + url);
      }
    }
  },

  /**
    Return the logical strucure for a url. If the information is not in the 
    client, ask the server and return -1
  
    @param {String} url
    @return {Object}
  */
  getLogicalStructure: function (url) {
    
    if (SC.none(this.get('logicalStructure')) ||
        this.get('logicalStructure')[url] === undefined) {
      // ask the server
      var serverAdress = Multivio.configurator.
          getPath('baseUrlParameters.logicalStructure');
      serverAdress += url;
      Multivio.requestHandler.
          sendGetRequest(serverAdress, this, 'setLogicalStructure', url);

      // put -1 as logicalStructure for this url
     /* var logical = {};
      if (!SC.none(this.get('logicalStructure'))) {
        logical = this.get('logicalStructure');
      }
      logical[url] =  -1;
      this.set('logicalStructure', logical);*/
      return -1;
    }
    else {
      var lst = this.get('logicalStructure')[url];
      Multivio.logger.info('logicalStructure returned by cdm ' + lst);
      return lst;
    }
  },
  
  /**
    Store the physical structure for a specific
  
    @param {String} response the response received from the server
    @param {url} url the corresponding url
  */
  setPhysicalStructure: function (response, url) {
    if (SC.ok(response)) {
      Multivio.logger.debug('physicalStructure received from the server: %@'.
          fmt(response.get("body")));    
      var jsonRes = response.get("body");
      var isError = NO;
      for (var key in jsonRes) {
        if (jsonRes.hasOwnProperty(key)) {
          if (key === '-1') {
            isError = YES;
          }
        } 
      }
      if (isError) {
        Multivio.errorController.initialize({'message': jsonRes['-1']});
        Multivio.makeFirstResponder(Multivio.ERROR);
      }
      else {
        var t2 = {};
        if (!SC.none(this.get('physicalStructure'))) {
          var oldPhysic = this.get('physicalStructure');
          t2 = this.clone(oldPhysic);
        }
        t2[url] = jsonRes;
        this.set('physicalStructure', t2);
        Multivio.logger.debug('New physicalStructure added for ' + url);
      }
    }
  },

  /**
    Return the physical strucure for a url or send the request to the 
    server and return -1
  
    @param {String} url
    @return {Object}
  */
  getPhysicalstructure: function (url) {
    if (SC.none(this.get('physicalStructure')) || 
        this.get('physicalStructure')[url] === undefined) {
      // ask the server    
      var serverAdress = Multivio.configurator.
          getPath('baseUrlParameters.physicalStructure');
      serverAdress += url;
      Multivio.requestHandler.
          sendGetRequest(serverAdress, this, 'setPhysicalStructure', url);

     /* var physical = {};
      if (!SC.none(this.get('physicalStructure'))) {
        physical = this.get('physicalStructure');
      }
      physical[url] =  -1;
      this.set('physicalStructure', physical);*/
      return -1;
    }
    else {
      var pst = this.get('physicalStructure')[url];
      Multivio.logger.debug('physicalStructure returned by cdm ' + pst);
      return pst;
    }
  }

});
