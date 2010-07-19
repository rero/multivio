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
  didBecomeFirstResponder: function() {
    Multivio.layoutController._hideWaitingPage();
    Multivio.layoutController.configureWorkspace('init');
  },
  
  /**
    Can add a component to the page only if the current state is INIT
  */
  addComponent: function(controllerName) {
    Multivio.layoutController.addComponent(controllerName);
  }
  
});