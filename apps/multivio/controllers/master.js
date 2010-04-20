/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This is the application's master controller. It serves as communication
  hub between the controllers of the different widgets.

  In this case it holds a reference to the currently selected object (image),
  in order to keep the thumbnail and tree views synchronized.

  @author mmo
  @extends SC.Objectcontroller
  @since 0.1.0
*/

Multivio.masterController = SC.ObjectController.create(
/** @scope Multivio.masterController.prototype */ {
  
  /**
  @property {file}
  */
  currentFile: null,
  
  /**
  @property {position}
  */
  currentPosition: null,
    
  /**
  @property {currentType}
  */
  currentType: null,
  
  currentMetadata: null,
  
  /**
    Binds to the cdm metadata

    @binding {String}
   */
  metadataBinding: "Multivio.CDM.metadata",
   
  isFirstTime: YES,
  
  /**
    Initialize masterController
  */
  initialize: function () {
    //start layoutController => show waiting page
    Multivio.layoutController.initialize();
    //request for metadata
    Multivio.CDM.getMetadata();
    Multivio.logger.info('masterController initialized');
  },

  /**
  Get the first part of the document and set currentFilePosition
  */
  metadataDidChange: function () {
    if (this.isFirstTime) {
      this.isFirstTime =  NO;
    }
    else {  
      var mimeType;
      if (SC.none(this.get('currentFile'))) {
        var reference = Multivio.CDM.getReferer();
        var meta = Multivio.CDM.getMetadata(reference);
        mimeType = meta.mime;
        SC.RunLoop.begin();
        this.set('currentFile', reference);
        this.set('currentMetadata', meta);
        SC.RunLoop.end();
        Multivio.layoutController.setBasicLayout();
        //Multivio.treeController.initialize(reference);
        this.descriptiveMetadataDictionary();
      }
      else {
        mimeType = Multivio.CDM.getMetadata(this.get('currentFile')).mime;
      }
      if (mimeType !== this.get('currentType')) {
        SC.RunLoop.begin();
        this.set('currentType', mimeType);
        SC.RunLoop.end();
      }
    }
  }.observes('metadata'),
  
  currentTypeDidChange: function () {
    console.info('currentTypeDidChange...');
    var ct = this.get('currentType');
    var cf = this.get('currentFile');
    switch (ct) {
    
    case 'application/pdf':
      console.info('pdf');
      Multivio.treeController.initialize(cf);
      Multivio.thumbnailController.initialize(cf);
      Multivio.navigationController.initialize(cf);
      break;
      
    case 'text/xml':
      Multivio.thumbnailController.initialize(cf);
      //var strLog = Multivio.CDM.getLogicalStructure(cf);
      //var strPh = Multivio.CDM.getPhysicalstructure(cf);
      break;
      
    default:
      console.info('undefined type ' + ct);
      break;
    }
  }.observes('currentType'),
  
  currentFileDidChange: function () {
    var cf = this.get('currentFile');
  }.observes('currentFile'),
  
  currentPositionDidChange: function () {
  },

  getCurrentFile: function () {
    var cf = this.get('currentFile');
    return cf;
  },

  /**
    The document's descriptive metadata contained in the root node of the
    CoreDocumentModel
    
    @observes content first node contains the descriptiveMetadataDictionary
  */
  descriptiveMetadataDictionary: function () { 
    var cmt = this.get('currentMetadata');
    return cmt;
  }.property('content')  

});
