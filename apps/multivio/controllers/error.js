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

  @author {che}
  @extends {SC.ArrayController}
  @since {0.1.0}
*/

Multivio.errorController = SC.ArrayController.create(
/** @scope Multivio.errorHandler.prototype */ {
  
  /**
    @method

    Initialize the content of the controller

    @param {SC.RecordArray} nodes records of the Core Document Model
  */
  initialize: function (nodes) {
    this.set('content', nodes);
    Multivio.logger.info('errorController initialized');
  },

  /**
    @method
    
    Return the serverMessage that contains infomation about the error
    
    @property {Hash} serverMessage
  */
  serverMessage: function () {
    return this.get('content').firstObject().get('serverMessage');
  }.property('content')
  
});