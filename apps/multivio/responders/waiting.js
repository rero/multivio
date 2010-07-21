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
    Show waiting page
  */
  didBecomeFirstResponder: function () {
    Multivio.logger.debug('Multivio state is WAITING');
    Multivio.layoutController._showWaitingPage();
  },
  
  /**
    First fileMetadata has been received. Remove waiting page, initialize 
    metadataController and change state to INIT.
    
    @param {String} referer the referer url
  */
  fileMetadataDidChange: function (referer) {
    Multivio.layoutController._hideWaitingPage();
    Multivio.layoutController.configureWorkspace('init');
    Multivio.metadataController.initialize(referer);
    Multivio.makeFirstResponder(Multivio.INIT);
  }
  
});