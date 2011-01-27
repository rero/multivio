/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @namespace

  The state after the first file metadata has been retrieved.

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
  },
  
  /**
    Disabled allowSelection property of the treecontroller
  */
  notAllowSelection: function () {
    Multivio.treeController.allowSelection(NO);
  },

  /**
    An error occured during the INIT state, don't stop the application, only
    show an errorPane with the error message
  */  
  errorOccured: function () {
    var errorContent = Multivio.errorController.get('content');
    var errorName = errorContent.err_name;
    var errorMessage = ('_' + errorName).loc();
    // if it's an unknown error get the default message
    if (errorMessage[0] === '_') {
      var support = Multivio.configurator.get('support');
      if (SC.none(support)) {
        // support variable not configured, fall back to a hard-coded default
        support = 'info@multivio.org';
      }
      errorMessage = '_Default'.loc(support);
    }
    Multivio.usco.showAlertPaneError('_An error occurred'.loc(), errorMessage);
    Multivio.treeController.allowSelection(YES);
  },

  // TODO: there's an inconsistency here: trying to add a component and
  // providing a controller instead
  /**
    Add a component to the page. 
    
    This action is allow only if the current state is INIT
    
    @param {String} controllerName the name of the controller
  */
  addComponent: function (controllerName) {
    Multivio.layoutController.addComponent(controllerName);
  }
  
});