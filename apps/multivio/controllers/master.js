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

  @author mmo, che
  @extends SC.Objectcontroller
  @since 0.1.0
*/

Multivio.masterController = SC.ObjectController.create(
/** @scope Multivio.masterController.prototype */ {
  
  //history: [],
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
  
  /**
    Binds to the cdm metadata

    @binding {String}
   */
  metadata: null,
  metadataBinding: SC.Binding.oneWay("Multivio.CDM.metadata"),
   
  isFirstTime: YES,
  
  
  /**
    Initialize masterController
  */
  initialize: function () {
    //start layoutController => show waiting page
    Multivio.layoutController.initialize();
    var reference = Multivio.CDM.getReferer();
    this.set('currentFile', reference);
    Multivio.logger.info('masterController initialized');
  },
  
  reset: function () {
    this.set('currentFile', null);
    this.set('currentPosition', null);
    this.set('currentType', null);
  },

  /**
  Get the first part of the document and set currentFilePosition
  */
  metadataDidChange: function () {
    console.info('MS: metadata change');
    var meta = this.get('metadata');
    if (!SC.none(meta)) { 
      var cf = this.get('currentFile');
      console.info('MS: metadata change for ' + cf);
      var currentMeta = this.get('metadata')[cf];
      if (currentMeta !== -1) {
        console.info('MS: metadata set type ' + currentMeta.mime);
        if (!Multivio.layoutController.get('isBasicLayoutUp')) {
          Multivio.layoutController.setBasicLayout();
          Multivio.metadataController.initialize(cf);
        }
        this.set('currentType', currentMeta.mime);
      }
    }
  }.observes('metadata'),
  
  selectFirstPosition: function () {
    console.info('masterController set currentPosition 1');
    this.set('currentPosition', 1);
  },
  
  selectFirstFile: function () {
    var firstFile = Multivio.treeStructureController._treeLabelByPosition[0];
    console.info('set first = ' + firstFile[1].file_postition.url);
    this.set('currentFile', firstFile[1].file_postition.url);
  },
  
  currentTypeDidChange: function () {
    console.info('currentTYPE DID CHANGE');
    var ct = this.get('currentType');
    var cf = this.get('currentFile');
          //Multivio.layoutController.getListOfController(ct);
    switch (ct) {
    
    case 'application/pdf':
      console.info('MS: current type = pdf');
      Multivio.layoutController.getListOfController(ct);
      Multivio.treeDispatcher.initialize(cf);
      Multivio.thumbnailController.initialize(cf);
      Multivio.navigationController.initialize(cf);
      Multivio.imageController.initialize(cf);
      break;
      
    case 'text/xml':
      Multivio.layoutController.getListOfController(ct);
      Multivio.treeDispatcher.initialize(cf);
      break;
      
    case 'image/jpg':
      // create thumbnailcontroller and navigationController
      // add index to the treeController
    //var historyLength = this.get('history').length;
    
    /*var lastXML = this.get('history')[length - 2];
      Multivio.thumbnailController.initialize(lastXML);
      Multivio.navigationController.initialize(lastXML);
      Multivio.imageController.initialize(lastXML);
      Multivio.treeController.addIndex(lastXML);
      Multivio.treeController.setSelection(cf);*/
      break;
      
    default:
      console.info('undefined type ' + ct);
      break;
    }
  }.observes('currentType'),
  
  currentFileDidChange: function () {
    console.info('MS: currentFileDidChange ?');
    if (!SC.none('currentFile')) {
      this.set('currentType', null);
      this.set('currentPosition', null);
      var cf = this.get('currentFile');
      console.info('MS: new file ' + cf);
      this.getMetadataForFile(cf);
    }
  }.observes('currentFile'),
  
  getMetadataForFile: function (fileUrl) {
    console.info('MS: getMetadataForFile ' + fileUrl);
    var meta = Multivio.CDM.getMetadata(fileUrl);
    if (meta !== -1) {
      console.info('MS: get MetadataFF set mime');
      this.set('currentType', meta.mime);
    }
  },
  
  currentPositionDidChange: function () {
    console.info('currentPosition did Change....');
    console.info('new Val = ' + this.get('currentPosition'));
  }.observes('currentPosition')

 /* getCurrentFile: function () {
    var cf = this.get('currentFile');
    return cf;
  },
  
  currentMetadataChange: function () {
    var cm = this.get('currentMetadata');
  }.observes('currentMetadata')*/



});
