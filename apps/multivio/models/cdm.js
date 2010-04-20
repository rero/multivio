/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  A cdm is the global model of the application

  @extends SC.Object
  @version 0.2.0
*/
Multivio.CDM = SC.Object.create(
/** @scope Multivio.CDM.prototype */ {

  referer: undefined,
  metadata: null,
  logicalStructure: null,
  physicalStructure: null,

  /**
  store server metadata for this url
  
  @param {String} response the response received from the server
  */
  setMetadata: function (response, url) {
    if (SC.ok(response)) {
      Multivio.logger.debug('metadata received from the server: %@'.
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
        Multivio.errorController.initialize(
            {'message': jsonRes['-1']});
        Multivio.layoutController._showErrorPage();
      }
      else {
        var t2 = {};
        t2[url] =  jsonRes;
        SC.RunLoop.begin();
        this.set('metadata', t2);
        SC.RunLoop.end();
      }
    }
  },
  
  /**
  return the metadata hash
  
  @return Hash
  */
  getMetadata: function (url) {
    if (SC.none(url)) {
      url = this.referer;
    }
    if (SC.none(this.get('metadata')) || SC.none(this.get('metadata')[url])) {
      var serverAdress = Multivio.configurator.
          getPath('baseUrlParameters.metadata');
      serverAdress += url;
      Multivio.requestHandler.
          sendGetRequest(serverAdress, this, 'setMetadata', url);
      return -1;  
    }
    else {
      var md = this.get('metadata')[url];
      Multivio.logger.debug('metadata returned by cdm ' + md);
      return md;
    }
  },

  /**
  store the referer url
  
  @param {String} url the url parameter of the input url  
  */
  setReferer: function (url) {
    //Multivio.logger.debug('referer setted to ' + url);
    this.set('referer', url);
  },
  
  /**
  return the referer url
  
  @return String
  */
  getReferer: function () {
    var referer = this.get('referer');
    return referer;
  },
  
  /**
  store server logical structure for a specific url 
  
  @param {String} response the response received from the server
  @param {String} url the url
  */
  setLogicalStructure: function (response, url) {
    if (SC.ok(response)) {
      console.info('set Logical -----');
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
        Multivio.errorController.initialize(
            {'message': jsonRes['-1']});
        Multivio.layoutController._showErrorPage();
      }
      else {
        var t2 = {};
        t2[url] =  jsonRes;
        SC.RunLoop.begin();
        this.set('logicalStructure', t2);
        SC.RunLoop.end();
      }
    }
  },  

  /**
  return the logicalStrucure for this url
  
  @return Array
  */
  getLogicalStructure: function (url) {
    if (SC.none(this.get('logicalStructure')) ||
        SC.none(this.get('logicalStructure')[url])) {
      var serverAdress = Multivio.configurator.
          getPath('baseUrlParameters.logicalStructure');
      serverAdress += url;
      Multivio.requestHandler.
          sendGetRequest(serverAdress, this, 'setLogicalStructure', url); 
      return -1;
    }
    else {
      var lst = this.get('logicalStructure')[url];
      Multivio.logger.debug('logicalStructure returned by cdm ' + lst);
      return lst;
    }
  },
  
  /**
  store the physicalStructure received from server side
  
  @param {String} response the response received from the server
  @param {url} url the physicalStructure for this url
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
        Multivio.errorController.initialize(
            {'message': jsonRes['-1']});
        Multivio.layoutController._showErrorPage();
      }
      else {
        var t2 = {};
        t2[url] =  jsonRes;
        SC.RunLoop.begin();
        this.set('physicalStructure', t2);
        SC.RunLoop.end();
      }
    }
  },  

  /**
  return the physical strucure for this url or send the request to the 
  requestHandler
  
  @return Hash
  */
  getPhysicalstructure: function (url) {
    if (SC.none(this.get('physicalStructure')) || 
        SC.none(this.get('physicalStructure')[url])) {
      var serverAdress = Multivio.configurator.
          getPath('baseUrlParameters.physicalStructure');
      serverAdress += url;
      Multivio.requestHandler.
          sendGetRequest(serverAdress, this, 'setPhysicalStructure', url);
      return -1;
    }
    else {
      var pst = this.get('physicalStructure')[url];
      Multivio.logger.debug('physicalStructure returned by cdm ' + pst);
      return pst;
    }
  }

});
