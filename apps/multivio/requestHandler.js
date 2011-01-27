/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  Object that manages the communication with the server.

  @author che
  @extends SC.Object
  @since 0.2.0
*/
Multivio.requestHandler = SC.Object.create(
/** @scope Multivio.requestHandler.prototype */ {
  
  /**
    A set that contains all request send to the server
  */
  listOfRequest: undefined,
  
  /**
    Return Yes if the request has not been yet asked and No if the request 
    has been already send.
    
    @param {String} request the request to ask
    @returns {Boolean}
  */
  notAsked: function (request) {
    if (SC.none(this.listOfRequest)) {
      this.listOfRequest = SC.Set.create();
      return YES;
    }
    if (!this.listOfRequest.contains(request)) {
      this.listOfRequest.add(request);
      return YES;
    }
    else {
      return NO;
    }
  },
  
  /**
    Send a request to the server and when the response is received
    call the callback method
    
    @param {String} uri the url of the server
    @param {String} callbackTarget the class to call after the response 
      has been received
    @param {String} callbackMethod the method to call after the response 
      has been received
    @param {String} param1 the key (url) to store the response 
  */
  sendGetRequest: function (uri, callbackTarget, callbackMethod, param1, check_uri) {
    // if check_uri is NO, don't call this.notAsked()
    var check = SC.none(check_uri)? YES : check_uri;
    if (!check_uri || this.notAsked(uri)) {
      var serverName = Multivio.configurator.get('serverName');
      var req = SC.Request.getUrl(serverName + uri).
          json().notify(callbackTarget, callbackMethod, param1);
      req.set('isJSON', YES);
      req.send();
    }
  }
  
});