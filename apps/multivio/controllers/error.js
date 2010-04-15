/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  Controller for errors that occured on the server side.

  @author che
  @extends SC.ObjectController
  @since 0.1.0
*/

Multivio.errorController = SC.ObjectController.create(
/** @scope Multivio.errorController.prototype */ {
  
  /**
    Initialize the content of the controller

    @param {hash} message to show
  */
  initialize: function (message) {
    this.set('content', message);
    Multivio.logger.info('errorController initialized');
  },

  /**
    Return the message that explains the error
    
    @property {String} ths message
  */
  serverMessage: function () {
    return this.get('content').get('message');
  }.property('content')
  
});