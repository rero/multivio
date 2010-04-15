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
  
  listOfRequest: undefined,
  
  hasRequestAlreadyDone: function (request) {
    if (SC.none(this.listOfRequest)) {
      this.listOfRequest = SC.Set.create();
      return NO;
    }
    if (!this.listOfRequest.contains(request)) {
      this.listOfRequest.add(request);
      return NO;
    }
    else {
      return YES;
    }
  },
  
  sendGetRequest: function (uri, callbackTarget, callbackMethod, param1) {
    if (!this.hasRequestAlreadyDone(uri)) {
      var serverName = Multivio.configurator.get('serverName');
      var req = SC.Request.getUrl(serverName + uri).
        json().notify(callbackTarget, callbackMethod, param1);
      req.set('isJSON', YES);
      req.send();
    } 
  }
  
});