/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This controller manages the behavior of the thumbnail view. It depends on
  the master controller.

  @author fma, che, mmo
  @extends SC.ArrayController
  @since 0.1.0
*/

Multivio.thumbnailController = SC.ArrayController.create(
/** @scope Multivio.thumbnailController.prototype */ {

  allowsMultipleSelection: NO,

  /**
    Binds to the CDM.physicalStructure
    
    @binding {hash}
   */
  
  physicalStructure: null,
  physicalStructureBinding: SC.Binding.oneWay("Multivio.CDM.physicalStructure"),

  /**
    A conversion table (masterSelectionId -> thumbnail) used to quickly
    determine the thumbnail associated with a certain master selection
    
    @private
   */
  _cdmNodeToThumbnail: {},
  
  /**
    Initialize this controller, create the sub-model and then set its content

    @param {String} url the current file url
  */
  initialize: function (url) {
    var phSt = Multivio.CDM.getPhysicalstructure(url);
    if (!SC.none(phSt) && phSt !== -1) {
      this._createThumbnails(phSt);
    }
    Multivio.logger.info('thumbnailController initialized');
  },
  
  physicalStructureDidChange: function () {
    var cf = Multivio.masterController.get('currentFile');
    if (!SC.none(cf)) {
      var ph = this.get('physicalStructure')[cf];
      if (!SC.none(ph)) {
        if (ph === -1) {
          Multivio.layoutController.removeComponent('views.thumbnailView');
        }
        else {
          this._createThumbnails(ph);
        }
      }
    }
  }.observes('physicalStructure'),
  
  
  _createThumbnails: function (structure) {
    var ct = Multivio.masterController.get('currentType');
    var cont = [];
    var newTable = {};
    if (ct === 'application/pdf') {
      var firstChild = structure[0];
      var pdfUrl = firstChild.url;
      var cf = Multivio.masterController.get('currentFile');
      var nbOfPage = Multivio.CDM.getMetadata(cf).nPages;
      //create a thumbnail object for each page
      for (var i = 1; i < nbOfPage + 1; i++) {
        var thumbnailUrl = Multivio.configurator.get('serverName') + 
            Multivio.configurator.getThumbnailUrl(pdfUrl, i);
        var thumbnailHash = {
            url:  thumbnailUrl,
            pageNumber: i
          };
        newTable[i] = thumbnailHash;
        cont.push(thumbnailHash);
      }
    }
    this.set('content', cont);
    this.set('_cdmNodeToThumbnail', newTable);
    Multivio.layoutController.addComponent('views.thumbnailView');
  }
   
  /**
    If 'content' changes, the _cdmNodeToThumbnail conversion table must
    be updated (this should only happen once, during aplication setup)

    @observes content    
    @private
  */
 /* _contentDidChange: function () {
    var newTable = {};
    var thumbnails = Multivio.store.find(Multivio.Thumbnail);
    if (thumbnails && thumbnails.isEnumerable) {
      for (var i = 0; i < thumbnails.length(); i++) {
        var thumbnail = thumbnails.objectAt(i);
        var coreDocumentNodeId = thumbnail.get('coreDocumentNode').get('guid');
        newTable[coreDocumentNodeId] = thumbnail;
      }
    }
    this.set('_cdmNodeToThumbnail', newTable);

  }.observes('content'),*/

  /**
    Updates the masterSelection binding if the currently selected thumbnail 
    has changed.
    
    @observes selection
    @private
  */
 /* _selectionDidChange: function () {
    if (!SC.none(this.get('selection')) &&
        !SC.none(this.get('selection').firstObject())) {
      var pageNumber = this.get('selection').firstObject().pageNumber;
      //this.get('master').set('currentPosition', pageNumber);*/
      /*var coreDocumentNode =
          this.get('selection').firstObject().get('coreDocumentNode');
      // make sure the selection has actually changed, (to avoid loopbacks)
      if (SC.none(this.get('masterSelection')) ||
          coreDocumentNode !== this.get('masterSelection')) {
        SC.RunLoop.begin();
        this.set('masterSelection', coreDocumentNode);
        SC.RunLoop.end();

        Multivio.logger.debug('thumbnailController#_selectionDidChange: %@'.
            fmt(this.get('selection').firstObject()));
      }*/
   /* }
  }.observes('selection'),*/

  /**
    Updates thumbnail selection by observing changes in master controller's
    master selection
    
    @observes masterSelection
    @private
  */
 /* _masterSelectionDidChange: function () {
    // find the thumbnail that corresponds to the current master selection
    var currentThumbnailSelection = !SC.none(this.get('selection')) ?
        this.get('selection').firstObject() : undefined;
    var currentPosition = this.get('master').get('currentPosition'); */
    //if (!SC.none(currentPosition)) {    
        
      //this.set('selection', SC.SelectionSet.create().addObject(newThumbnail));
    /*var currentMasterSelection = this.get('masterSelection');
    if (!SC.none(currentMasterSelection)) {
      var newThumbnail =
          this.get('_cdmNodeToThumbnail')[currentMasterSelection.get('guid')];

      // make sure the selection has actually changed, (to avoid loopbacks)
      if (SC.none(currentThumbnailSelection) ||
          (newThumbnail && newThumbnail !== currentThumbnailSelection)) {
        SC.RunLoop.begin();
        this.set('selection', SC.SelectionSet.create().addObject(newThumbnail));
        SC.RunLoop.end();
        Multivio.logger.debug('thumbnailController#_masterSelectionDidChange: %@'.
            fmt(this.get('masterSelection').get('guid')));
      }
    }*/
 // }.observes('masterSelection')

});