/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  This controller is used to navigate in the document.

  @author fma, che
  @extends SC.ObjectController
  @since 0.1.0
*/
Multivio.navigationController = SC.ObjectController.create(
/** @scope Multivio.navigationController.prototype */ {

  /** 
    @property {Number}
    
    @default null
  */
  currentPage: null,
  
  /**
    @property {Number} 
    
    @private
    @default null
  */
  _numberOfPages: null,
  
  /**
    local variables used to create bindings
  */
  position: null,
  //meta: null,
  physicalStructure: null,

  /**
    Initialize this controller, try to retrieve the number of pages.
    The number of pages can be find in the metadata if we have a PDF or
    we can find it by calculating the number of elements contains 
    in the physical structure
    
    @param {String} url
  */
  initialize: function (url) {
    this.position = null;
    this.bind('position', 'Multivio.masterController.currentPosition');
    
    var meta = Multivio.CDM.getMetadata(url);
    //meta = -1 response not on client => create a binding and wait
    /*if (meta === -1) {
      this.bind('meta', 'Multivio.CDM.metadata');
    }
    else {*/
      // we have metadata. If metadata.nPages === null we need to get
      // the physicalStructure to known it
      if (SC.none(meta.nPages)) {
        // if meta.nPages doesn't exist => it is not a PDF
        // if masterController.isGrouped => 
        // _numberOfPages = physicalstructure length of the referer 
        if (Multivio.masterController.isGrouped) {
          var refStruct = Multivio.CDM.getPhysicalstructure(Multivio.CDM.getReferer());
          this.set('_numberOfPages', refStruct.length);
          Multivio.layoutController.addComponent('navigationController');
        }
        else {
          var ph = Multivio.CDM.getPhysicalstructure(url);
          //ph = -1 response not on client => create binding
          if (ph === -1) {
            this.bind('physicalStructure', 'Multivio.CDM.physicalStructure');
          }
          else {
            if (!SC.none(ph)) {
              this.set('_numberOfPages', ph.length);
              Multivio.layoutController.addComponent('navigationController');
            }
          }
        }
      }
      else {
        if (Multivio.masterController.isGrouped) {
          //TO DO call all metadata and adding the nPages
        }
        else {
          this.set('_numberOfPages', meta.nPages);
          Multivio.layoutController.addComponent('navigationController');
        }
      }
    //}  
    Multivio.logger.info('navigationController initialized');
  },
  
  /**
  Multivio.CDM.metadata has changed, verify if we have now the metadata
  for the current file. If YES set the number of pages.
  
  @observes meta
  */
  /*metadataDidChange: function () {
    var metadata = this.get('meta');
    if (!SC.none(metadata)) {
      var cf = Multivio.masterController.get('currentFile');
      if (!SC.none(cf)) {
        var currentMeta = this.get('meta')[cf];
        //we have metadata else wait again
        if (currentMeta !== -1) {
          if (SC.none(currentMeta.nPages)) {
            var ph = Multivio.CDM.getPhysicalstructure(cf);
            if (ph !== -1) {
              this.bind('physicalStructure', 'Multivio.CDM.physicalStructure');
            }
            else {
              if (!SC.none(ph)) {
                this.set('_numberOfPages', ph.length);
                Multivio.layoutController.addComponent('navigationController');
              }
            }
          }
          else {
            this.set('_numberOfPages', currentMeta.nPages);
            Multivio.layoutController.addComponent('navigationController');
          }
        }
      }
    }
  }.observes('meta'),*/
  
  /**
  Multivio.CDM.physicalstructure has changed, verify if we have now 
  the physicalStructure for the current file. If YES set the number of pages.
  
  @observes physicalStructure
  */
  physicalStructureDidChange: function () {
    var ph = this.get('physicalStructure');
    if (!SC.none(ph)) {
      var cf = Multivio.masterController.get('currentFile');
      if (!SC.none(cf)) {
        var currentPh = this.get('physicalStructure')[cf];
        //we have physicalstructure
        if (currentPh !== -1 && !SC.none(currentPh)) {
          this.set('_numberOfPages', currentPh.length);
          Multivio.layoutController.addComponent('navigationController');
        }
      }
    }
  }.observes('physicalStructure'),
  
  /**
    Updates currentPage by observing changes of the position property of the 
    masterController
    
    @observes position
  */
  positionDidChange: function () {
    var newPosition = this.get('position');
    if (!SC.none(newPosition)) {
      //verify if we need to set selection (avoid loopbacks)
      var currentPageNumber = this.get('currentPage');
      if (currentPageNumber !== newPosition) {
        this.set('currentPage', newPosition);
        Multivio.logger.info('navigationController#positionDidChange: %@'.
            fmt(this.get('currentPage')));
      }
    }
  }.observes('position'),
 
  /**
    Updates position by observing changes in navigation controller's
    currentPage.
    
    @private
    @observes currentPage
  */  
  _currentPageDidChange: function () {
    try {
      //TO DO Problem with negative number
      var newCurrentPage = this.get('currentPage');    
     /* if (newCurrentPage <= 0 || newCurrentPage > this.get('_numberOfPages')) {
        Multivio.usco.showAlertPaneInfo('Invalid number', 
            newCurrentPage + ' must be between 0 and %@'. 
            fmt(this.get('_numberOfPages')));
      }
      else {*/
      if (!SC.none(newCurrentPage)) {
        var currentPosition = this.get('position');
        if (currentPosition !== newCurrentPage) {
          this.set('position', newCurrentPage);
          Multivio.logger.info('navigationController#_currentPageDidChange: %@'.
              fmt(this.get('position')));
        }
      }
      //}
    }
    catch (err) {
      Multivio.usco.showAlertPaneInfo('Problem: ' + err);
    }
  }.observes('currentPage'),
  
  /**
    Go to the next page.    
  */ 
  goToNextPage: function () {
    var np = this.get('currentPage') + 1;
    if (np <= this.get('_numberOfPages')) {
      this.set('currentPage', np);
    }
  },
  
  /**
    Go to the previous page.
  */    
  goToPreviousPage: function () {
    var pp = this.get('currentPage') - 1;
    if (pp > 0) {
      this.set('currentPage', pp);
    }
  },
  
  /**
    Go to the first page.
  */    
  goToFirstPage: function () {
    this.set('currentPage', 1);
  },
  
  /**
    Go to the last page.
  */ 
  goToLastPage: function () {
    var nbp = this.get('_numberOfPages');
    this.set('currentPage', nbp);
  }

});
