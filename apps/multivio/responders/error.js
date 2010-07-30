/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @namespace

  The state when an error occured.

  @author che
  @extends SC.Responder
  @since 0.2.0
*/
Multivio.ERROR = SC.Responder.create(
/** @scope Multivio.ERROR.prototype */ {
  
  /**
    First responder did change.
  */
  didBecomeFirstResponder: function () {
    // if we have waiting pane remove it
    if (Multivio.waitingPane.get('isPaneAttached')) {
      Multivio.layoutController._hideWaitingPage();
    }
    // Verify if the errorController has content
    if (Multivio.errorController.get('hasContent')) {
      Multivio.layoutController._showErrorPage();
    }
    else {
      Multivio.layoutController._showUsagePage();
    }
  }
});