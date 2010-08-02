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
  
  Algo for setting _numberOfPages:
  
  getFileMetadata(): fileMetadata is already on the client 
    because asked by the masterController
    
    if (meta.nPages === undefined) : it's not a pdf, ask physical structure
      if (masterController.isGrouped) : get length of the physical structure 
        of the referer
      else : getPhysicalStructure
        if (ph === -1): create binding
        else:
          if (ph !== undefined): get length of the physical structure
        
    else : get nPages

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
    Boolean to enabled and disabled Buttons
  */
  isNextEnabled: YES,
  isPreviousEnabled: YES,
  isCurrentPageEnabled: YES,
  
  /**
    local variables used to create bindings
  */
  position: null,
  physicalStructure: null,

  /**
    Initialize this controller using the number of pages of the file.
    
    The number of pages may be find in the fileMetadata (for a PDF) 
    or deducted from the physical structure of the document.
    
    @param {String} url
  */
  initialize: function (url) {
    this.position = null;
    this.bind('position', 'Multivio.masterController.currentPosition');
    
    var meta = Multivio.CDM.getFileMetadata(url);
    if (SC.none(meta.nPages)) {  
      // if masterController.isGrouped => 
      // _numberOfPages = physicalstructure length of the referer 
      if (Multivio.masterController.isGrouped) {
        var refStruct = Multivio.CDM.getPhysicalstructure(Multivio.CDM.getReferer());
        this.set('_numberOfPages', refStruct.length);
        Multivio.sendAction('addComponent', 'navigationController');
      }
      else {
        var ph = Multivio.CDM.getPhysicalstructure(url);
        // ph = -1 response not on client => create binding
        if (ph === -1) {
          this.bind('physicalStructure', 'Multivio.CDM.physicalStructure');
        }
        else {
          if (!SC.none(ph)) {
            this.set('_numberOfPages', ph.length);
            Multivio.sendAction('addComponent', 'navigationController');
          }
        }
      }
    }
    // meta.nPages exist
    else {
      if (Multivio.masterController.isGrouped) {
        // TO DO call all metadata and adding the nPages
      }
      else {
        this.set('_numberOfPages', meta.nPages);
        Multivio.sendAction('addComponent', 'navigationController');
      }
    }
    this.checkButton();  
    Multivio.logger.info('navigationController initialized');
  },
  
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
        // we have physicalstructure
        if (currentPh !== -1 && !SC.none(currentPh)) {
          this.set('_numberOfPages', currentPh.length);
          Multivio.sendAction('addComponent', 'navigationController');
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
      this.set('isNextEnabled', YES);
      this.set('isPreviousEnabled', YES);
      // verify if we need to set selection (avoid loopbacks)
      var currentPageNumber = this.get('currentPage');
      if (currentPageNumber !== newPosition) {
        this.set('currentPage', newPosition);
        // it's first page => disabled previous buttons
        if (newPosition === 1) {
          this.set('isPreviousEnabled', NO);
        }
        if (newPosition === this.get('_numberOfPages')) {
          this.set('isNextEnabled', NO);
        }
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
      var newCurrentPage = this.get('currentPage'); 
      if (SC.typeOf(newCurrentPage) === SC.T_STRING &&
          !isNaN(newCurrentPage)) {
        newCurrentPage = parseFloat(newCurrentPage);
        // there is nothing
        if (isNaN(newCurrentPage)) {
          newCurrentPage = this.get('position');
        }
      }
      if (newCurrentPage < 1 || newCurrentPage > this.get('_numberOfPages') ||
          isNaN(newCurrentPage)) {
        Multivio.usco.showAlertPaneInfo(
            'Incorrect page number',
            'Please enter a number between 1 and ' +
            this.get('_numberOfPages'));
      }
      else {
        var currentPosition = this.get('position');
        if (currentPosition !== newCurrentPage) {
          this.set('position', newCurrentPage);
        }
      }
    }
    catch (err) {
      Multivio.usco.showAlertPaneInfo('Problem', err);
    }
  }.observes('currentPage'),
  
  /**
    Verify if navigation buttons should be disabled 
  */
  checkButton: function () {
    var current = this.get('currentPage');
    if (current === 1) {
      this.set('isPreviousEnabled', NO);
    }
    if (current === this.get('_numberOfPages')) {
      this.set('isNextEnabled', NO);
    }
  },
  
  /**
    Go to the next page.    
  */ 
  goToNextPage: function () {
    this.set('isPreviousEnabled', YES);
    var np = this.get('currentPage') + 1;
    if (np <= this.get('_numberOfPages')) {
      this.set('currentPage', np);
      if (np === this.get('_numberOfPages')) {
        this.set('isNextEnabled', NO);
      }
    }
  },
  
  /**
    Go to the previous page.
  */    
  goToPreviousPage: function () {
    this.set('isNextEnabled', YES);
    var pp = this.get('currentPage') - 1;
    if (pp > 0) {
      this.set('currentPage', pp);
      if (pp === 1) {
        this.set('isPreviousEnabled', NO);
      }
    }
  },
  
  /**
    Go to the first page.
  */    
  goToFirstPage: function () {
    this.set('currentPage', 1);
    this.set('isNextEnabled', YES);
    this.set('isPreviousEnabled', NO);
  },
  
  /**
    Go to the last page.
  */ 
  goToLastPage: function () {
    var nbp = this.get('_numberOfPages');
    this.set('currentPage', nbp);
    this.set('isPreviousEnabled', YES);
    this.set('isNextEnabled', NO);
  }

});
