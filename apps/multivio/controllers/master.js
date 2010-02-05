/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** @class

  This is the application's master controller. It serves as communication
  hub between the controllers of the different widgets.

  In this case it holds a reference to the currently selected object (image),
  in order to keep the thumbnail and tree views synchronized.

  @author {mmo}
  @extends {SC.ArrayController}
  @since {0.1.0}
*/

Multivio.masterController = SC.ArrayController.create(
/** @scope Multivio.masterController.prototype */ {

  allowsMultipleSelection: NO,
  
  /**
    @property {Multivio.CoreDocumentNode}
    
    The masterSelection is the selected CDM node.
    The guid of the selected file/object that is currently being displayed by
    the application
  */
  masterSelection: undefined,
  
  /**
    @property {Boolean}
    
    Say if it's the first file. Set to YES during initialization  
  */   
  isFirstFile: undefined,
  
  /**
    @method

    Initialize the master controller, its content

    @param {SC.RecordArray} nodes records of the Core Document Model
  */
  initialize: function (nodes) {
    this.set('isFirstFile', YES);
    this.set('content', nodes);
    Multivio.logger.info('masterController initialized');
  },

  /**
    @method 
    
    The the document's descriptive metadata contained in the root node of the
    CoreDocumentModel
    
    @observes {content} first node contains the descriptiveMetadataDictionary
  */
  descriptiveMetadataDictionary: function () {
    var metadata = this.get('content').firstObject().get('metadata');
    return metadata;
  }.property('content')  

});
