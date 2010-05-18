/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This controller manages the behavior of the main content view for images.

  @author che
  @extends SC.ArrayController
  @since 0.1.1
*/
Multivio.imageController = SC.ArrayController.create(
/** @scope Multivio.imageController.prototype */ {

  allowsMultipleSelection: NO,
  
  /**
    local variable for bindings
   */
  physicalStructure: null,
  position: null,
  
  /**
  Initialize the controller. This controller need to know 
  the physical structure of the document.
  
  @param {String} url
  */   
  initialize: function (url) {
    if (this.get('bindings').length !== 0) {
      this.reset();
    }
    this.bind('position', 'Multivio.masterController.currentPosition');
    var structure = Multivio.CDM.getPhysicalstructure(url);
    if (structure !== -1) {
      var meta = Multivio.CDM.getMetadata(url);
      if (meta !== -1) {
        if (SC.none(meta.nPages)) {
          this._createImages(structure);
        }
        else {
          this._createPDFImages(structure, meta.nPages);
        }
      }
    }
    else {
      this.bind('physicalStructure', 'Multivio.CDM.physicalStructure');
    }   
    Multivio.logger.info('imageController initialized');
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
    this.position = null;
    this.set('content', null);
    this.set('selection', null);
  },

  /**
    CDM.physicalStructure has changed. Verify if we can create the content of
    the imageController.

    @observes physicalStructure
  */ 
  physicalStructureDidChange: function () {
    console.info('IM: physicalStructure did change');
    if (!SC.none(this.get('physicalStructure'))) {    
      var cf = Multivio.masterController.get('currentFile');
      if (!SC.none(cf)) {
        var phSt = this.get('physicalStructure')[cf];
        if (!SC.none(phSt)) {
          if (phSt === -1) {
            Multivio.layoutController.removeComponent('views.thumbnailView');
          }
          else {
            var meta = Multivio.CDM.getMetadata(cf);
            if (SC.none(meta.nPages)) {
              this._createImages(phSt);
            }
            else {
              this._createPDFImages(phSt, meta.nPages);
            }
          }
        }
      }
    }
  }.observes('physicalStructure'),
 
  /**
    Create imageController content for PDF

    @private
  */ 
  _createPDFImages: function (structure, nb) {
    //TO do verify the currentType to know what to do
    var files = structure[0];
    var pdfUrl = files.url; 
    var cont = [];
    for (var i = 1; i < nb + 1; i++) {
      var imageUrl = Multivio.configurator.get('serverName') + 
          Multivio.configurator.getImageUrl(pdfUrl, i);
      var imageHash = {
          url:  imageUrl,
          pageNumber: i
        };
      cont.push(imageHash);
    }
    this.set('content', cont);
    Multivio.layoutController.addComponent('views.mainContentView');
    Multivio.logger.info('imageController#content created and layout setted');
  },
  
  /**
    Create imageController content for images

    @private
  */  
  _createImages: function (structure) {
    //TO do verify the currentType to know what to do
    var cont = [];
    for (var i = 0; i < structure.length; i++) {
      var files = structure[i];
      var pdfUrl = files.url;
      var imageUrl = Multivio.configurator.get('serverName') + 
          Multivio.configurator.getImageUrl(pdfUrl, 0);
      var imageHash = {
          url:  imageUrl,
          pageNumber: i + 1
        };
      cont.push(imageHash);
    }
    this.set('content', cont);
    Multivio.layoutController.addComponent('views.mainContentView');
    Multivio.logger.info('imageController#content created and layout setted');
  },
  
  /**
    Change image in the view by observing changes of the position. 
    
    @observes position
  */
  positionDidChange: function () {
    var newPosition = this.get('position');
    if (!SC.none(newPosition)) {
      //need to sub 1 because array start at 0 and page start at 1
      newPosition--;  
      var cont = this.get('content');
      var image = cont[newPosition];
      this.set('selection', SC.SelectionSet.create().addObject(image));
      Multivio.logger.info('imageController#positionDidChange: %@'.
          fmt(this.get('selection').firstObject()));
    }
  }.observes('position')
  
});