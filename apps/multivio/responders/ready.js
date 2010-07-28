/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @namespace

  The state after all controllers have been initialized.

  @author che
  @extends SC.Responder
  @since 0.2.0
*/
Multivio.READY = SC.Responder.create(
/** @scope Multivio.READY.prototype */ {
  
  /**
    First responder did change.
  */
  didBecomeFirstResponder: function () {
    Multivio.logger.debug('Multivio state is READY');
  },
  
  /**
    Select the first position of the current file
  */
  firstPosition: function () {
    Multivio.masterController.selectFirstPosition();
  },
  
  /**
    Select the first file of the current document 
  */
  firstFile: function () {
    Multivio.makeFirstResponder(Multivio.INIT);
    // send this message to be sure of being in the INIT state 
    Multivio.sendAction('reset');
    Multivio.masterController.selectFirstFile();
  }
  
});