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
  
  currentMetadata: undefined,
  
  /**
    Binds to the cdm metadata

    @binding {String}
   */
  metadata: null,
  metadataBinding: SC.Binding.oneWay("Multivio.CDM.metadata"),
   
  isFirstTime: YES,
  
  //dataProvider: undefined,
  
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
    var mimeType;
    if (SC.none(this.get('currentFile'))) {
      var reference = Multivio.CDM.getReferer();
      var meta = Multivio.CDM.getMetadata(reference);
      mimeType = meta.mime;
      this.set('currentFile', reference);
      this.set('currentMetadata', meta);
      Multivio.layoutController.setBasicLayout();
      Multivio.metadataController.initialize(reference);
    }
    else {
      mimeType = Multivio.CDM.getMetadata(this.get('currentFile')).mime;
    }
    if (mimeType !== this.get('currentType')) {
      this.set('currentType', mimeType);
    }
  }.observes('metadata'),
  
  currentTypeDidChange: function () {
    var ct = this.get('currentType');
    var cf = this.get('currentFile');
    switch (ct) {
    
    case 'application/pdf':
      Multivio.treeController.initialize(cf);
      Multivio.thumbnailController.initialize(cf);
      Multivio.navigationController.initialize(cf);
      Multivio.imageController.initialize(cf);
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
  
  currentMetadataChange: function () {
    var cm = this.get('currentMetadata');
  }.observes('currentMetadata')



});
