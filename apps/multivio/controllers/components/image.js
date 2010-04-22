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
  @since 0.1.0
*/
Multivio.imageController = SC.ArrayController.create(
/** @scope Multivio.imageController.prototype */ {

  allowsMultipleSelection: NO,
  
  /**
    Binds to the CDM physicalStructure
    
    @binding {hash}
   */
  physicalStructure: null,
  physicalStructureBinding: SC.Binding.oneWay("Multivio.CDM.physicalStructure"),
  
  /**
  Initialize this controller. This controller need to know 
  the physical structure of the document to show.
  
  @param {String} url
  */   
  initialize: function (url) {
    var meta = Multivio.CDM.getMetadata(url);
    var structure = Multivio.CDM.getPhysicalstructure(url);
    if (!SC.none(meta) && meta !== -1 && !SC.none(structure) && structure !== -1) {
      this._createImages(structure, meta.nPages);
    }    
    Multivio.logger.info('imageController initialized');
  },

  /**
    CDM.physicalStructure has changed. Verify if we can create the content of
    the imageController.

    @observes physicalStructure
   */ 
  physicalStructureDidChange: function () {
    var cf = Multivio.masterController.get('currentFile');
    if (!SC.none(cf)) {
      var phSt = this.get('physicalStructure')[cf];
      if (!SC.none(phSt)) {
        if (phSt === -1) {
          Multivio.layoutController.removeComponent('views.thumbnailView');
        }
        else {
          var meta = Multivio.CDM.getMetadata(cf);
          this._createImages(phSt, meta.nPages);
        }
      }
    }
  }.observes('physicalStructure'),
 
  /**
    Create imageController content

    @private
   */ 
  _createImages: function (structure, nb) {
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
  }
  
});