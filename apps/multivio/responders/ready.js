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
    Multivio.treeController.allowSelection(YES);
    Multivio.getPath('views.mainContentView.innerMainContent').becomeFirstResponder();
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
    Multivio.sendAction('notAllowSelection');
    Multivio.masterController.selectFirstFile();
  }
  
});