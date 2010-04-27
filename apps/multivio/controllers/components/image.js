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
    Binds to the CDM physicalStructure
    
    @binding {hash}
   */
  physicalStructure: null,
  physicalStructureBinding: SC.Binding.oneWay("Multivio.CDM.physicalStructure"),
 
  /**
    Binds to the currentPosition of the masterController
    
    @binding {hash}
   */ 
  position: null,
  positionBinding: "Multivio.masterController.currentPosition",
  
  /**
  Initialize the controller. This controller need to know 
  the physical structure of the document.
  
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