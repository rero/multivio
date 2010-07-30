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

    @param {Object} message to show
  */
  initialize: function (message) {
    this.set('content', message);
    Multivio.logger.info('errorController initialized');
  },

  /**
    Return the message that explains the error
    
    @property {String} ths message
  */
  message: function () {
    var errorContent = this.get('content');
    var errorName = errorContent.err_name;
    var errorMessage = Multivio.configurator.get('errorMessage')[errorName];
    // if it's an unknown error get the default message
    if (SC.none(errorMessage)) {
      var support = Multivio.configurator.get('support');
      errorMessage = Multivio.configurator.get('errorMessage').Default + support;
    }
    return errorMessage;
  }.property('content')
  
});