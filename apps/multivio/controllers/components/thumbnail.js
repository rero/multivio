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
  //physicalStructureBinding: SC.Binding.oneWay("Multivio.CDM.physicalStructure"),

  /**
    Binds to the masterController's currentPosition
    
    @binding {hash}
  */  
  position: null,
  //positionBinding: "Multivio.masterController.currentPosition",

  /**
    A conversion table (position-> thumbnail) used to quickly
    determine the thumbnail associated with a certain position
    
    @private
   */
  _positionToThumbnail: {},
  
  /**
    Initialize this controller and verify if the sub-model can be created. 
    The sub-model need to have the physical structure of the document.

    @param {String} url the current file url
  */
  initialize: function (url) {
    if (this.get('bindings').length !== 0) {
      this.reset();
    }
    this.bind('physicalStructure', 'Multivio.CDM.physicalStructure');
    this.bind('position', 'Multivio.masterController.currentPosition');
    var phSt = Multivio.CDM.getPhysicalstructure(url);
    if (!SC.none(phSt) && phSt !== -1) {
      this._createThumbnails(phSt);
    }
    Multivio.logger.info('thumbnailController initialized ');
  },
  
  /**
  Reset variables and disconnect bindings
  */
  reset: function () {
    //first disconnect bindings
    var listOfBindings = this.get('bindings');
    for (var i = 0; i < listOfBindings.length; i++) {
      var oneBinding = listOfBindings[i];
      oneBinding.disconnect();
    }
    this.set('bindings', []);
    this._positionToThumbnail = {};
    this.position = null;
    //this.set('physicalStructure', null);
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
    }
  }.observes('physicalStructure'),
  
  /**
    Create the sub-model of this controller and set the content.
    
    @param {Object} physicalStructure
    @private
  */  
  _createThumbnails: function (structure) {
    var ct = Multivio.masterController.get('currentType');
    var cont = [];
    var newTable = {};
    //TO DO strategy depending of the type
    if (ct === 'application/pdf') {
      var firstChild = structure[0];
      var pdfUrl = firstChild.url;
      var cf = Multivio.masterController.get('currentFile');
      var nbOfPage = Multivio.CDM.getMetadata(cf).nPages;
      //PDF =>create a thumbnail object for each page
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
    Multivio.logger.info('thumbnailController#_createThumbnails');
  },
  
  /**
    Updates selection by observing changes of the position property.
    
    @observes position
  */  
  positionDidChange: function () {
    console.info('TH: position did change ');
    var newPosition = this.get('position');
    if (!SC.none(newPosition)) {
      var currentSelection = !SC.none(this.get('selection')) ?
          this.get('selection').firstObject() : undefined;
      var currentPageNumber = !SC.none(currentSelection) ?
          currentSelection.pageNumber : 0;
      //verify if we need to set selection (avoid loopbacks)
      if (currentPageNumber !== newPosition) {
        var thumbnailToSelect = this.get('_cdmNodeToThumbnail')[newPosition];
        this.set('selection', 
            SC.SelectionSet.create().addObject(thumbnailToSelect));
        Multivio.logger.info('thumbnailController#positionDidChange: %@'.
            fmt(this.get('selection').firstObject()));
      }
    }
  }.observes('position'),

  /**
    Updates position by observing changes of the selection property.
    
    @observes selection
  */  
  selectionDidChange: function () {
    console.info('TH: selection did change');
    var newSelection =  this.get('selection');
    if (!SC.none(newSelection) && !SC.none(newSelection.firstObject())) { 
      var pageNumber = newSelection.firstObject().pageNumber;
      var currentPosition = this.get('position');
      //verify if we need to set position (avoid loopbacks)
      if (currentPosition !== pageNumber) {
        this.set('position', pageNumber);
        Multivio.logger.info('thumbnailController#selectionDidChange: %@'.
            fmt(this.get('position')));
      }
    }
  }.observes('selection')

});