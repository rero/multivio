/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @namespace

  The state after the first file metadata has been retreived.

  @author che
  @extends SC.Responder
  @since 0.2.0
*/
Multivio.INIT = SC.Responder.create(
/** @scope Multivio.INIT.prototype */ {
  
  /**
    First responder did change.
  */
  didBecomeFirstResponder: function () {
    Multivio.logger.debug('Multivio state is INIT');
    Multivio.layoutController._showWaitingView();
  },
  
  /**
    Do nothing
    */
  reset: function () {
  },
  
  /**
    Add a component to the page. 
    
    This action is allow only if the current state is INIT
    
    @param {String} controllerName the name of the controller
  */
  addComponent: function (controllerName) {
    Multivio.layoutController.addComponent(controllerName);
  }
  
});