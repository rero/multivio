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
    console.info('ready firstResponder '+ this);
    Multivio.logger.debug('Multivio state is READY');
    Multivio.treeController.allowSelection(YES);
    Multivio.getPath('views.mainContentView').becomeFirstResponder();
    //Multivio.mainPage.mainPane.makeKeyPane();
    //Multivio.makeFirstResponder(Multivio.getPath('views.mainContentView'));
  },
  
  /**
    Select the first position of the current file
  */
  firstPosition: function () {
    Multivio.masterController.selectFirstPosition();
    //Multivio.getPath('views.mainContentView').testi();
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