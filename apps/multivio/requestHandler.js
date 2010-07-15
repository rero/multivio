/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
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
    Send a request to the server and when the response is received
    call the callback method
    
    @param {String} uri
    @param {String} callbackTarget
    @param {String} callbackMethod
    @param {String} param1 the key (url) to store the response 
  */
  sendGetRequest: function (uri, callbackTarget, callbackMethod, param1) {
    var serverName = Multivio.configurator.get('serverName');
    var req = SC.Request.getUrl(serverName + uri).
        json().notify(callbackTarget, callbackMethod, param1);
    req.set('isJSON', YES);
    req.send(); 
  }
  
});