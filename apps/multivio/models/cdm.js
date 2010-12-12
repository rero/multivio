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
    searchResults {Object}: the current search results
    pageIndexing {Object}: the page indexing used for text selection
  */
  referer: undefined,
  fileMetadata: undefined,
  logicalStructure: undefined,
  physicalStructure: undefined,
  imageSize: undefined,
  searchResults: undefined,
  pageIndexing: undefined,
  selectedText: undefined,

  clear: function () {
      this.referer = undefined;
      this.fileMetadata = undefined;
      this.logicalStructure = undefined;
      this.physicalStructure = undefined;
      this.imageSize = undefined;
      this.searchResults = undefined;
      this.pageIndexing = undefined;
      this.selectedText = undefined;
  },

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
      var t2 = {};
      if (!SC.none(this.get('fileMetadata'))) {
        if (this.get('fileMetadata')[url] === undefined) {
          var oldMeta = this.get('fileMetadata');
          t2 = this.clone(oldMeta);
          t2[url] = jsonRes;
          this.set('fileMetadata', t2);
          Multivio.logger.info('New metadata added for ' + url);
        }
      }
      else {
        t2[url] = jsonRes;
        this.set('fileMetadata', t2);
        Multivio.logger.info('New metadata added for ' + url);
      }
    }
    else {
      Multivio.errorController.initialize(response.get('body'));
      Multivio.sendAction('errorOccured');
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
      var t2 = {};
      if (!SC.none(this.get('logicalStructure'))) {
        //verify if value is not already in the CDM
        if (this.get('logicalStructure')[url] === undefined) {
          var oldLogic = this.get('logicalStructure');
          t2 = this.clone(oldLogic);
          t2[url] = jsonRes;
          this.set('logicalStructure', t2);
          Multivio.logger.info('New logicalStructure added for ' + url);
        }
      }
      else {
        t2[url] = jsonRes;
        this.set('logicalStructure', t2);
        Multivio.logger.info('New logicalStructure added for ' + url);
      }
    }
    else {
      Multivio.errorController.initialize(response.get('body'));
      Multivio.sendAction('errorOccured');
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
      var t2 = {};
      if (!SC.none(this.get('physicalStructure'))) {
        //verify if value is not already in the CDM
        if (this.get('physicalStructure')[url] === undefined) {
          var oldPhysic = this.get('physicalStructure');
          t2 = this.clone(oldPhysic);
          t2[url] = jsonRes;
          this.set('physicalStructure', t2);
          Multivio.logger.debug('New physicalStructure added for ' + url);
        }
      }
      else {
        t2[url] = jsonRes;
        this.set('physicalStructure', t2);
        Multivio.logger.debug('create and add physicalStructure for ' + url);
      }
    }
    else {
      Multivio.errorController.initialize(response.get('body'));
      Multivio.sendAction('errorOccured');
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
      return -1;
    }
    else {
      var pst = this.get('physicalStructure')[url];
      Multivio.logger.debug('physicalStructure returned by cdm ' + pst);
      return pst;
    }
  },
  
  /**
    Return the size of the image or send the request to the server
    and return -1
  
    @param {String} url
    @return {Object}
  */
  getImageSize: function (url) {
    if (SC.none(this.get('imageSize')) || 
        this.get('imageSize')[url] === undefined) {
      // ask the server    
      var serverAdress = Multivio.configurator.
          getPath('baseUrlParameters.imageSize');
      serverAdress += url;
      Multivio.requestHandler.
          sendGetRequest(serverAdress, this, 'setImageSize', url);
      return -1;
    }
    else {
      var size = this.get('imageSize')[url];
      Multivio.logger.debug('imageSize returned by cdm ' + size);
      return size;
    }

  },

  /**
    Store the size of an image

    @param {String} response the response received from the server
    @param {url} url the corresponding url
  */
  setImageSize: function (response, url) {
    if (SC.ok(response)) {
      Multivio.logger.debug('imageSize received from the server: %@'.
          fmt(response.get("body")));    
      var jsonRes = response.get("body");
      var t2 = {};
      if (!SC.none(this.get('imageSize'))) {
        //verify if value is not already in the CDM
        if (this.get('imageSize')[url] === undefined) {
          var oldSize = this.get('imageSize');
          t2 = this.clone(oldSize);
          t2[url] = jsonRes;
          this.set('imageSize', t2);
          Multivio.logger.debug('New imageSize added for ' + url);
        }
      }
      else {
        t2[url] = jsonRes;
        this.set('imageSize', t2);
        Multivio.logger.debug('New imageSize added for ' + url);
      }
    }
    else {
      Multivio.errorController.initialize(response.get('body'));
      Multivio.makeFirstResponder(Multivio.ERROR);
    }
  },
  
  /**
    Return the search results or send the request to the server
    and return -1.
  
    @param {String} url
    @param {String} query the search query
    @param {Number} from page number start
    @param {Number} to page number stop
    @param {Number} context_size number of characters around found words
    @param {Number} max_results maximal amout of occurences to return
    @param {Number} angle the rotation angle in degrees
    
    @return {Object}
  */
  getSearchResults: 
        function (url, query, from, to, context_size, max_results, angle) {
          
    if (SC.none(this.get('searchResults')) || 
        this.get('searchResults')[url] === undefined) {    
          
      // ask the server    
      var serverAddress = Multivio.configurator.
          getPath('baseUrlParameters.search');
      serverAddress = serverAddress.
                fmt(query, from, to, context_size, max_results, angle) + url;
      Multivio.requestHandler.
          sendGetRequest(serverAddress, this, 'setSearchResults', url);
      Multivio.logger.debug('request sent to server: ' + serverAddress);
          
      return -1;
    }
    else {
      var res = this.get('searchResults')[url];
      Multivio.logger.debug('search results returned by cdm ' + res);
      return res;
    }

  },

  /**
    Store the current search results

    @param {String} response the response received from the server
    @param {url} url the corresponding url
  */
  setSearchResults: function (response, url) {
    
    if (SC.ok(response)) {
      Multivio.logger.debug('search results received from the server: %@'.
          fmt(response.get("body")));    
      var jsonRes = response.get("body");
      var t2 = {};
      if (!SC.none(this.get('searchResults'))) {
        var oldRes = this.get('searchResults');
        t2 = this.clone(oldRes);
      }
      //t2[{'url': url.url, 'query': url.query}] = jsonRes;
      t2[url] = jsonRes;
      this.set('searchResults', t2);
      Multivio.logger.debug('New search results added for ' + url);
    }
    else {
      Multivio.errorController.initialize(response.get('body'));
      Multivio.makeFirstResponder(Multivio.ERROR);
    }
  },
  
  /**
    Return the page indexing (for text selection) or send the request
    to the server and return -1.

    If a range of pages is defined using 'from' and 'to', 'page_nr'
    is ignored.
  
    @param {String} url document url
    @param {Number} page_nr page to get indexing of
    @param {Number} from page number start
    @param {Number} to page number stop
    
    @return {Object}
  */
  getPageIndexing: function (url, page_nr, from, to) {
    
    // storage in page_nr=X&from=Y&to=Z&url=<doc_url>
    var serverAddress = Multivio.configurator.
        getPath('baseUrlParameters.getPageIndexing');
    serverAddress = serverAddress.
              fmt(page_nr, from, to) + url;
    
    if (SC.none(this.get('pageIndexing')) || 
        this.get('pageIndexing')[serverAddress] === undefined) {    
          
      // ask the server    
      Multivio.requestHandler.
          sendGetRequest(serverAddress, this, 'setPageIndexing', serverAddress);
      Multivio.logger.debug('page indexing: request sent to server: ' + serverAddress);
          
      return -1;
    }
    else {
      var res = this.get('pageIndexing')[serverAddress];
      Multivio.logger.debug('page indexing returned by cdm ' + res);
      return res;
    }

  },
  
  /**
    Store the page indexing.

    @param {String} response the response received from the server
    @param {url} url the corresponding url
  */
  setPageIndexing: function (response, url) {
    
    if (SC.ok(response)) {
      Multivio.logger.debug('page indexing received from the server: %@'.
          fmt(response.get("body")));    
      var jsonRes = response.get("body");
      var t2 = {};
      if (!SC.none(this.get('pageIndexing'))) {
        var oldRes = this.get('pageIndexing');
        t2 = this.clone(oldRes);
      }
      //t2[{'url': url.url, 'query': url.query}] = jsonRes;
      t2[url] = jsonRes;
      this.set('pageIndexing', t2);
      Multivio.logger.debug('New page indexing added for ' + url);
    }
    else {
      Multivio.errorController.initialize(response.get('body'));
      Multivio.makeFirstResponder(Multivio.ERROR);
    }
  },
  
  /**
    Return the text located in the given box on the specified page 
    of the document.

  
    @param {String} url document url
    @param {Number} page_nr page number
    @param {Number} x1 upper left point, x
    @param {Number} y1 upper left point, y
    @param {Number} x2 bottom right point, x
    @param {Number} y2 bottom right point, y
    @param {Number} angle rotation angle of content
    
    @return {Object}
  */
  getSelectedText: function (url, page_nr, x1, y1, x2, y2, angle) {
    
    if (SC.none(this.get('selectedText')) || 
        this.get('selectedText')[url] === undefined) {
      // ask the server    
      var serverAdress = Multivio.configurator.
          getPath('baseUrlParameters.getText');
          
      serverAdress = serverAdress.fmt(page_nr, x1, y1, x2, y2, angle) + url;
      
      Multivio.requestHandler.
          sendGetRequest(serverAdress, this, 'setSelectedText', url, NO);
      return -1;
    }
    else {
      var t = this.get('selectedText')[url];
      Multivio.logger.debug('selectedText returned by cdm ' + t);
      return t;
    }

  },

  /**
    Store the currently selected text.

    @param {String} response the response received from the server
    @param {url} url the corresponding url
  */
  setSelectedText: function (response, url) {
    
    if (SC.ok(response)) {
      Multivio.logger.debug('selected text received from the server: %@'.
          fmt(response.get("body")));    
      var jsonRes = response.get("body");
      var t2 = {};
      if (!SC.none(this.get('selectedText'))) {
        var oldRes = this.get('selectedText');
        t2 = this.clone(oldRes);
      }
      t2[url] = jsonRes;
      this.set('selectedText', t2);
      Multivio.logger.debug('New selected text added for ' + url);
    }
    else {
      Multivio.errorController.initialize(response.get('body'));
      Multivio.makeFirstResponder(Multivio.ERROR);
    }
  }
});
