/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This controller manages the behavior of the header view. It depends on
  the master controller.

  @author che
  @extends SC.ObjectController
  @since 0.1.0
*/

Multivio.metadataController = SC.ObjectController.create(
/** @scope Multivio.metadataController.prototype */ {

  /**
    Binds to the cdm metadata

    @binding {hash}
   */
  metadata: null,
  metadataBinding: SC.Binding.oneWay("Multivio.CDM.metadata"),
  
  /**
    Initialize this controller by setting its content if its 

    @param {String} url the current file url
  */
  initialize: function (url) {
    var meta = Multivio.CDM.getMetadata(url);
    if (!SC.none(meta) && meta !== -1) {
      this.set('content', meta);
    }
    Multivio.logger.info('metadataController initialized');    
  },
  
  metadataDidChange: function () {
    var cf = Multivio.masterController.get('currentFile');
    var meta = this.get('metadata')[cf];
    if (!SC.none(meta) && meta !== -1) {
      this.set('content', meta);
    }
  }.observes('metadata'), 
  
   
  /**
    The document's descriptive metadata
    
    @observes content
  */
  descriptiveMetadataDictionary: function () { 
    var cc = this.get('content');
    return cc;
  }.property('content')
  
});