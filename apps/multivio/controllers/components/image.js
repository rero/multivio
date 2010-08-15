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
  
  Algo for the sub-model:
  
  getFileMetadata(): fileMetadata is already on the client 
    because asked by the masterController
    
    if (meta.nPages === undefined) : it's not a pdf, ask physical structure
      if (masterController.isGrouped) : create the list of images 
            with the physical structure of the referer
      else : getPhysicalStructure
        if (ph === -1): create binding
        if (ph === null): error
        else : create the list of images with the physical structure
        
    else : create the list of images using nPages (the number of pages)

  @author che
  @extends SC.ArrayController
  @since 0.1.1
*/
Multivio.imageController = SC.ArrayController.create(
/** @scope Multivio.imageController.prototype */ {
  
  /**
    Binds to the masterController isLoadingContent property.

    @binding {Boolean}
  */
  isLoadingContent: null,
  isLoadingContentBinding: 'Multivio.masterController.isLoadingContent',

  allowsMultipleSelection: NO,
  
  /**
    local variable for bindings
   */
  physicalStructure: null,
  position: null,
  
  /**
    Initialize the controller. This controller needs to know the number 
    of images. This information may be find in the fileMetadata or deducted
    from the physical structure of the document.
  
    @param {String} url
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
        this._createImages(refStruct);
      }
      else {
        var phSt = Multivio.CDM.getPhysicalstructure(url);
        if (phSt !== -1) {
          if (!SC.none(phSt)) {
            this._createImages(phSt);
          }
          else {
            Multivio.logger.warning('ImageController has no physical structure');
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
        // this.createdConcatenedImages
      }
      else {
        this._createPDFImages(url, meta.nPages);
      }
    }
    Multivio.logger.info('imageController initialized');
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
    var phStr = this.get('physicalStructure');
    if (!SC.none(phStr)) {
      var cf = Multivio.masterController.get('currentFile');
      if (!SC.none(cf)) {
        var ph = this.get('physicalStructure')[cf];
        if (ph !== -1) {
          if (!SC.none(ph)) {
            this._createImages(ph);
          }
        }
      }
    }
  }.observes('physicalStructure'),
 
  /**
    Create images urls for a PDF document. 

    @param {String} pdfUrl the url of the PDF
    @param {Number} nb the number of pages of the PDF
    @private
  */ 
  _createPDFImages: function (pdfUrl, nb) {
    var cont = [];
    // create as many images that there are pages
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
    Multivio.sendAction('addComponent', 'imageController');
    Multivio.logger.info(
        'imageController#createPDFImages pdf images created and layout setted' + 
        this.get('content').length);
  },
  
  /**
    Create image urls for images

    @param {Object} structure the physical structure of a document
    @private
  */  
  _createImages: function (structure) {
    // each images has its own url => create for each a new url
    var cont = [];
    for (var i = 0; i < structure.length; i++) {
      var files = structure[i];
      var defaultUrl = files.url;
      var imageUrl = undefined;
      // if we have fixtures we don't need to have a server
      if (Multivio.initializer.get('inputParameters').scenario === 'fixtures') {
        imageUrl = Multivio.configurator.getImageUrl(defaultUrl, 0);
      }
      else {
        imageUrl = Multivio.configurator.get('serverName') + 
          Multivio.configurator.getImageUrl(defaultUrl, 0);
      }
      var imageHash = {
          url:  imageUrl,
          pageNumber: i + 1
        };
      cont.push(imageHash);
    }
    this.set('content', cont);
    Multivio.sendAction('addComponent', 'imageController');  
    Multivio.logger.info(
        'imageController#createImages images created and layout setted' + 
        this.get('content').length);
  },
  
  /**
    Change image in the view by observing changes of the position. 
    
    @observes position
  */
  positionDidChange: function () {
    var newPosition = this.get('position');
    if (!SC.none(newPosition)) {
      // need to sub 1 because array start at 0 and page start at 1
      newPosition--;  
      var cont = this.get('content');
      var image = cont[newPosition];
      this.set('selection', SC.SelectionSet.create().addObject(image));
      SC.RunLoop.begin();
      this.set('isLoadingContent', YES);
      SC.RunLoop.end();
      Multivio.logger.info('imageController#positionDidChange: %@'.
          fmt(this.get('selection').firstObject()));
    }
  }.observes('position')
  
});