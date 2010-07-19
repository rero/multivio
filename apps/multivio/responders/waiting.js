/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @namespace

  The state when retreiving the first file metadata.

  @author che
  @extends SC.Responder
  @since 0.2.0
*/
Multivio.WAITING = SC.Responder.create(
/** @scope Multivio.WAITING.prototype */ {
  
  /**
    First responder did change.
  */
  didBecomeFirstResponder: function() {
    Multivio.layoutController._showWaitingPage();
  },
  
  /**
    Call this method the first time file metadata is received. 
    Change to state 'init'
  */
  fileMetadataDidChange: function(referer) {
    Multivio.metadataController.initialize(referer);
    Multivio.makeFirstResponder(Multivio.INIT);
  }
  
});