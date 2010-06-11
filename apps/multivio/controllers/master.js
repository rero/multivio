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

  /**
  The url of the file_position object
  
  @property {file}
  */
  currentFile: null,
  
  /**
  The index of the file_position
  
  Now it's a number but it can be something else
  
  @property {position}
  */
  currentPosition: null,
    
  /**
  The type of the currentDocument
  
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
    Initialize masterController. Get the referer (the url given to multivio) 
    of the document and set it as the currentFile
  */
  initialize: function () {
    //start layoutController => show waiting page
    Multivio.layoutController.initialize();
    var reference = Multivio.CDM.getReferer();
    this.set('currentFile', reference);
    Multivio.logger.info('masterController initialized');
  },
  
  /**
  Reset variables
  */
  reset: function () {
    this.set('currentFile', null);
    this.set('currentPosition', null);
    this.set('currentType', null);
  },

  /**
  Multivio.CDM.metadata has changed.Set new type.
  
  @observe metadata
  */
  metadataDidChange: function () {
    var meta = this.get('metadata');
    if (!SC.none(meta)) { 
      var cf = this.get('currentFile');
      var currentMeta = this.get('metadata')[cf];
      if (currentMeta !== -1) {
        if (!Multivio.layoutController.get('isBasicLayoutUp')) {
          Multivio.layoutController.setBasicLayout();
          Multivio.metadataController.initialize(cf);
        }
        this.set('currentType', currentMeta.mime);
      }
    }
  }.observes('metadata'),
  
  /**
  Set current position to 1
  */
  selectFirstPosition: function () {
    this.set('currentPosition', 1);
    Multivio.logger.debug('MasterController set currentPosition 1');
  },
  
  /**
  Select the first file of the Document and set currentfile with this value
  */ 
  selectFirstFile: function () {
    //get logical structure of the document
    var logSt = Multivio.CDM.getLogicalStructure(this.get('currentFile'));
    if (!SC.none(logSt)) {
      var validUrl = logSt[0].file_position.url;
      if (SC.none(validUrl)) {
        var childs = logSt[0].childs
        for (var i = 0; i < childs.length; i++) {
          var temp = childs[i];  
          if (!SC.none(temp.file_position.url)) {
            validUrl = temp.file_position.url;
            break;
          }
        }
      }
      this.set('currentFile', validUrl);
    }
    else {
      //get physical structure
      var phSt = Multivio.CDM.getPhysicalstructure(this.get('currentFile'));
      this.set('currentFile', phSt[0].url);
    }
  },
  
  /**
  Initialize new controllers depending of the currentType
  
  @observes currentType
  */
  currentTypeDidChange: function () {
    var ct = this.get('currentType');
    var cf = this.get('currentFile');
          //Multivio.layoutController.getListOfController(ct);
    switch (ct) {
    
    case 'application/pdf':
      Multivio.layoutController.getListOfController(ct);
      Multivio.treeDispatcher.initialize(cf);
      Multivio.thumbnailController.initialize(cf);
      Multivio.navigationController.initialize(cf);
      Multivio.imageController.initialize(cf);
      break;
      
    case 'text/xml':
    case 'application/xml':
    case 'text/xml;charset=utf-8':
      Multivio.layoutController.getListOfController(ct);
      Multivio.treeDispatcher.initialize(cf);
      break;
      
    case 'image/jpeg':
    case 'image/jpg':
      var ref = Multivio.CDM.getReferer();
      this.currentFile = ref;
      Multivio.layoutController.getListOfController(ct);
      Multivio.thumbnailController.initialize(ref);
      Multivio.imageController.initialize(ref); 
      Multivio.navigationController.initialize(ref);  
      break;
      
    default:
      Multivio.logger.info(ct + 'is an undefined type for the masterController');
      break;
    }
  }.observes('currentType'),
  
  /**
  A new file has been selected, retreives metadata for it
  
  @observes currentFile
  */ 
  currentFileDidChange: function () {
    if (!SC.none('currentFile')) {
      this.currentType = null;
      //this.currentPosition = null;
      this.set('currentPosition', null);
      var cf = this.get('currentFile');
      this.getMetadataForFile(cf);
    }
  }.observes('currentFile'),
  
  /**
  Retreive metadata for this url
  
  @param {String} fileUrl
  */
  getMetadataForFile: function (fileUrl) {
    var meta = Multivio.CDM.getMetadata(fileUrl);
    if (meta !== -1) {
      if (!Multivio.layoutController.get('isBasicLayoutUp')) {
        Multivio.layoutController.setBasicLayout();
        Multivio.metadataController.initialize(fileUrl);
      }
      this.set('currentType', meta.mime);
    }
  },
  
  /**
  CurrentPosition has changed. This method is only used to verify 
  that synchronisation works fine.
  
  @observe currentPosition
  */
  currentPositionDidChange: function () {
    console.info('currentPosition did Change....');
    console.info('new Val = ' + this.get('currentPosition'));
  }.observes('currentPosition')
  
});
