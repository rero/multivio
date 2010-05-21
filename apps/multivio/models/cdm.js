/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  A cdm is the global model of the application.
  
  TO Explain
  -1 request to the server
  undefined key doesn't exist
  null response of the server

  @extends SC.Object
  @version 0.2.0
*/
Multivio.CDM = SC.Object.create(
/** @scope Multivio.CDM.prototype */ {

  referer: undefined,
  metadata: undefined,
  logicalStructure: undefined,
  physicalStructure: undefined,

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
        //add the entry
        var t2 = {};
        if(SC.none(this.get('metadata'))) {
          //create new entry
          console.info('CDM metadata new Entry');
          //t2[url] =  jsonRes;

        }
        else {
          var oldMeta = this.get('metadata');
          console.info('CDM metadata add object');
          t2 = this.clone(oldMeta);

          //this.set('metadata', oldMeta);
        }
                  t2[url] = jsonRes;
      this.set('metadata', t2);
      }
      
      console.info('Metadata length ' + this.get('metadata'));
    }
  },
  
  clone: function(srcInstance) {
    /*Si l'instance source n'est pas un objet ou qu'elle ne vaut rien c'est une feuille donc on la retourne*/
    if(typeof(srcInstance) != 'object' || srcInstance == null) {
      return srcInstance;
    }
    
    /*On appel le constructeur de l'instance source pour crée une nouvelle instance de la même classe*/
    var newInstance = srcInstance.constructor();
    /*On parcourt les propriétés de l'objet et on les recopies dans la nouvelle instance*/
    for(var i in srcInstance) {
      newInstance[i] = this.clone(srcInstance[i]);
    }
    /*On retourne la nouvelle instance*/
    return newInstance;
  },
  
  /**
  return the metadata for a url. If the information is not in the client
  ask the server. 
  
  @param {String} url
  @return {Object} metadata can be -1 (doesn't exist), metadata 
  */
  getMetadata: function (url) {
    if (SC.none(url)) {
      url = this.referer;
    }

    if (SC.none(this.get('metadata')) || 
        this.get('metadata')[url] === undefined) {
      //ask the server
      var serverAdress = Multivio.configurator.
          getPath('baseUrlParameters.metadata');
      serverAdress += url;
      Multivio.requestHandler.
          sendGetRequest(serverAdress, this, 'setMetadata', url);
      //put -1 for this url
      var t2 = {};
      if(!SC.none(this.get('metadata'))) {
        var oldMeta = this.get('metadata');
        t2 = this.clone(oldMeta);
      }
      t2[url] =  -1;
      this.set('metadata', t2);
      console.info('CDM: set Metadata -1 for ' + url);    
      return -1;  
    }
    else {
      var md = this.get('metadata')[url];
      Multivio.logger.debug('metadata returned by cdm ');
      return md;
    }
  },

  /**
  store the referer url
  
  @param {String} url the url parameter of the input url  
  */
  setReferer: function (url) {
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
    //verify if response is OK and if there is no Error response
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
        Multivio.errorController.initialize(
            {'message': jsonRes['-1']});
        Multivio.layoutController._showErrorPage();
      }
      //save response
      else {
        var t2 = {};
        if(!SC.none(this.get('logicalStructure'))) {
          var oldLogic = this.get('logicalStructure');
          t2 = this.clone(oldLogic);
        }
        t2[url] =  jsonRes;
        this.set('logicalStructure', t2);
        console.info('CDM: set Logical for ' + url);
      }
    }
  },

  /**
  return the logicalStrucure for a url. If the information is not in the 
  client, ask the server
  
  @param {String} url
  @return {Object}
  */
  getLogicalStructure: function (url) {
    console.info('CDM: getLogical for ' + url);
    if (SC.none(this.get('logicalStructure')) ||
        this.get('logicalStructure')[url] === undefined) {
      //ask the server
      var serverAdress = Multivio.configurator.
          getPath('baseUrlParameters.logicalStructure');
      serverAdress += url;
      Multivio.requestHandler.
          sendGetRequest(serverAdress, this, 'setLogicalStructure', url);
      console.info('CDM no logical');
      //put -1 as logicalStructure for this url
      var t2 = {};
      if(!SC.none(this.get('logicalStructure'))) {
        var oldLogic = this.get('logicalStructure');
        t2 = this.clone(oldLogic);
      }
      t2[url] =  -1;
      this.set('logicalStructure', t2); 
      return -1;
    }
    else {
      var lst = this.get('logicalStructure')[url];
      Multivio.logger.info('logicalStructure returned by cdm ' + lst);
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
        if(!SC.none(this.get('physicalStructure'))) {
          var oldPhysic = this.get('physicalStructure');
          t2 = this.clone(oldPhysic);
        }
        t2[url] =  jsonRes;
        this.set('physicalStructure', t2);
      }
    }
  },

  /**
  return the physical strucure for this url or send the request to the 
  requestHandler
  
  @return Hash
  */
  getPhysicalstructure: function (url) {
    console.info('CDM get PH');
    if (SC.none(this.get('physicalStructure')) || 
        this.get('physicalStructure')[url] === undefined) {
      //ask the server    
      var serverAdress = Multivio.configurator.
          getPath('baseUrlParameters.physicalStructure');
      serverAdress += url;
      Multivio.requestHandler.
          sendGetRequest(serverAdress, this, 'setPhysicalStructure', url);
      console.info('CDM : physical return -1');
      var t2 = {};
      if(!SC.none(this.get('physicalStructure'))) {
        var oldPhysic = this.get('physicalStructure');
        t2 = this.clone(oldPhysic);
      }
      t2[url] =  -1;
      this.set('physicalStructure', t2);
      return -1;
    }
    else {
      var pst = this.get('physicalStructure')[url];
      Multivio.logger.debug('physicalStructure returned by cdm ' + pst);
      console.info('CDM return this ph ' + pst);
      return pst;
    }
  }

});
