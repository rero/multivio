/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This controller manages the behavior of the thumbnail view.
  
  Algo for the sub-model:
    getMetdatada(url) : meta !== -1 because already asked by the masterController 
      if (meta.nPages === null) 
        if (masterController.isGrouped) : createThumbnail for the referer
        else : it's not a pdf ask physicalStructure
          if (phS === -1) : create binding
          else 
            if (ph !== null) : createThumbnail
          
      else :
        if (masterController.isGrouped) : createdConcatenedThumbnails
        else : create PDFThumbnails

  @author fma, che, mmo
  @extends SC.ArrayController
  @since 0.1.0
*/

Multivio.thumbnailController = SC.ArrayController.create(
/** @scope Multivio.thumbnailController.prototype */ {

  allowsMultipleSelection: NO,

  /**
    Local variables for bindings
  */
  physicalStructure: null,
  position: null,

  /**
    A conversion table (position-> thumbnail) used to quickly
    determine the thumbnail associated with a certain position
    
    @private
  */
  _positionToThumbnail: {},
  
  /**
    Initialize this controller and verify if the sub-model can be created. 
    To create the sub-model we need to know the number of thumbnails. 
    This information may be find in the fileMetadata or deducted
    from the physical structure of the document.

    @param {String} url the current file url
  */
  initialize: function (url) {
    if (this.get('bindings').length !== 0) {
      this.reset();
    }
    this.bind('position', 'Multivio.masterController.currentPosition');
    
    var meta = Multivio.CDM.getFileMetadata(url);
    if (SC.none(meta.nPages)) {
      if (Multivio.masterController.isGrouped) {
        var refStruct = Multivio.CDM.getPhysicalstructure(Multivio.CDM.getReferer());
        // check if physical structure of the referer is on the client
        // else create a binding
        if (refStruct !== -1) {
          this._createThumbnails(refStruct);
        }
        else {
          this.bind('physicalStructure', 'Multivio.CDM.physicalStructure');
        }
      }
      else {
        var phSt = Multivio.CDM.getPhysicalstructure(url);
        if (phSt !== -1) {
          if (!SC.none(phSt)) {
            this._createThumbnails(phSt);
          }
          else {
            Multivio.logger.warning('ThumbnailController has no physical structure');
          }
        }
        else {
          this.bind('physicalStructure', 'Multivio.CDM.physicalStructure');
        }
      }
    }
    else {
      if (Multivio.masterController.isGrouped) {
        // TO DO
        //this.createdConcatenedThumbnails
      }
      else {
        this._createPDFThumbnails(url, meta.nPages);
      }
    }
    Multivio.logger.info('thumbnailController initialized ');
  },
  
  /**
    Reset variables and disconnect bindings
  */
  reset: function () {
    // first disconnect bindings
    var listOfBindings = this.get('bindings');
    for (var i = 0; i < listOfBindings.length; i++) {
      var oneBinding = listOfBindings[i];
      oneBinding.disconnect();
    }
    this.set('bindings', []);
    this._positionToThumbnail = {};
    this.position = null;
    this.set('content', null);
    this.set('selection', null);
  },

  /**
    CDM.physicalStructure has changed. Verify if we can create the sub-model.

    @observes physicalStructure
  */
  physicalStructureDidChange: function () {
    var phStr = this.get('physicalStructure');
    if (!SC.none(phStr)) {
      if (Multivio.masterController.isGrouped) {
        var refStruct = Multivio.CDM.getPhysicalstructure(Multivio.CDM.getReferer());
        if (refStruct !== -1) {
          this._createThumbnails(refStruct);
        }
      }
      else {
        var cf = Multivio.masterController.get('currentFile');
        if (!SC.none(cf)) {
          var ph = this.get('physicalStructure')[cf];
          if (ph !== -1) {
            if (!SC.none(ph)) {
              this._createThumbnails(ph);
            }
          }
        }
      }
    }
  }.observes('physicalStructure'),
  
  /**
    Create the list of thumbnails using the physical structure of the file.
    
    @param {Object} structure the physicalStructure
    @private
  */  
  _createThumbnails: function (structure) {
    var cont = [];
    var newTable = {};
    var firstChild = undefined;
    // create for each node of the physical structure a thumbnail
    for (var j = 0; j < structure.length; j++) {
      var imageUrl = structure[j].url;
      var thumbnailImageUrl = undefined;
      // If we have fixtures we don't need a server
      if (Multivio.initializer.get('inputParameters').scenario === 'fixtures') {
        thumbnailImageUrl = Multivio.configurator.getThumbnailUrl(imageUrl, 0);
      }
      else {
        thumbnailImageUrl = Multivio.configurator.get('serverName') + 
          Multivio.configurator.getThumbnailUrl(imageUrl, 0);
      }
      var thumbnailImageHash = {
        url:  thumbnailImageUrl,
        pageNumber: j + 1
      };
      newTable[j + 1] = thumbnailImageHash;
      cont.push(thumbnailImageHash);     
    }
    this.set('content', cont);
    this.set('_cdmNodeToThumbnail', newTable);
    Multivio.sendAction('addComponent', 'thumbnailController');
    Multivio.logger.info('thumbnailController#_createThumbnails');
  },
  
  /**
    Create the list of thumbnails using the number of pages of the PDF.
    
    @param {String} pdfUrl the url of the pdf
    @param {Number} nbp the number of pages of the PDF
    @private
  */
  _createPDFThumbnails: function (pdfUrl, nbP) {
    var cont = [];
    var newTable = {};
    // PDF =>create a thumbnail object for each page
    for (var i = 1; i < nbP + 1; i++) {
      var thumbnailUrl = Multivio.configurator.get('serverName') + 
          Multivio.configurator.getThumbnailUrl(pdfUrl, i);
      var thumbnailHash = {
        url:  thumbnailUrl,
        pageNumber: i
      };
      newTable[i] = thumbnailHash;
      cont.push(thumbnailHash);
    }
    this.set('content', cont);
    this.set('_cdmNodeToThumbnail', newTable);
    Multivio.sendAction('addComponent', 'thumbnailController');
    Multivio.logger.info('thumbnailController#_createPDFThumbnails');
  },
  
  /**
    Updates selection by observing changes of the position property.
    
    @observes position
  */  
  positionDidChange: function () {
    var newPosition = this.get('position');
    if (!SC.none(newPosition)) {
      var currentSelection = !SC.none(this.get('selection')) ?
          this.get('selection').firstObject() : undefined;
      var currentPageNumber = !SC.none(currentSelection) ?
          currentSelection.pageNumber : 0;
      // verify if we need to set selection (avoid loopbacks)
      if (currentPageNumber !== newPosition) {
        var thumbnailToSelect = this.get('_cdmNodeToThumbnail')[newPosition];
        this.set('selection', 
            SC.SelectionSet.create().addObject(thumbnailToSelect));
        Multivio.logger.info('thumbnailController#positionDidChange: %@'.
            fmt(this.get('selection').firstObject().pageNumber));
      }
    }
  }.observes('position'),

  /**
    Updates position by observing changes of the selection property.
    
    @observes selection
  */  
  selectionDidChange: function () {
    var newSelection =  this.get('selection');
    if (!SC.none(newSelection) && !SC.none(newSelection.firstObject())) { 
      var pageNumber = newSelection.firstObject().pageNumber;
      var currentPosition = this.get('position');
      // verify if we need to set position (avoid loopbacks)
      if (currentPosition !== pageNumber) {
        this.set('position', pageNumber);
        Multivio.logger.info('thumbnailController#selectionDidChange: %@'.
            fmt(this.get('position')));
      }
    }
  }.observes('selection')

});