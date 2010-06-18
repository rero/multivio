/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This controller manages the behavior of the header view. The header view
  contains only metadata about the global document

  @author che
  @extends SC.ObjectController
  @since 0.1.0
*/

Multivio.metadataController = SC.ObjectController.create(
/** @scope Multivio.metadataController.prototype */ {
  
  /**
    Initialize this controller by setting its content 

    @param {String} url the current file url
  */
  initialize: function (url) {
    var meta = Multivio.CDM.getMetadata(url);
    //normally meta is not egal to -1 because this controller is initialized
    //after the masterController received the metadata of the referer url
    if (!SC.none(meta) && meta !== -1) {
      this.set('content', meta);
    }
    Multivio.logger.info('metadataController initialized');    
  },
   
  /**
    The document's descriptive metadata
    
    @observes content
  */
  descriptiveMetadataDictionary: function () { 
    var cc = this.get('content');
    return cc;
  }.property('content')
  
});