/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
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
  
  currentFileIndex: -1,
  //currentFileBinding: 'Multivio.masterController.currentFileIndex',
  
  /**
    The current list of files
  */
  listOfFiles: null,
  
  /**
    @property {Number} 
    
    @private
    @default null
  */
  _numberOfPages: null,
  
  
  /**
    Binds to the masterController isLoadingContent property.
    
    This binding is used to enable and disable navigation buttons

    @binding {Boolean}
  */
  isLoadingContent: null,
  isLoadingContentBinding: 'Multivio.masterController.isLoadingContent',
  
  /**
    Booleans to enable and disable buttons
  */
  isNextEnabled: YES,
  isPreviousEnabled: YES,
  isFirstEnabled: YES,
  isLastEnabled: YES,
  isCurrentPageEnabled: YES,

  /**
    Value is YES if the current file is the first one in the document, or
    if the document contains a single file

    @property Boolean
  */
  isFirstFile: function () {
    return this.get('currentFileIndex') === 0 ? YES : NO;
  }.property('currentFileIndex').cacheable(),

  /**
    Value is YES if the current file is the last one in the document, or
    if the document contains a single file

    @property Boolean
  */
  isLastFile: function () {
    var nf = this.get('numberOfFilesInDocument');
    return (nf > 0 && this.get('currentFileIndex') === nf - 1) ? YES : NO;
  }.property('listOfFiles', 'currentFileIndex').cacheable(),
  
  /**
    Value is YES if the current document contains a single file, otherwise NO

    @property Boolean
  */
  /*
  isSingleFileDocument: function() {
    return (
        SC.typeOf(this.get('listOfFiles')) === SC.T_ARRAY &&
        this.get('listOfFiles').length > 0
      ) ? NO : YES;
  }.property('listOfFiles').cacheable(),
  */

  /**
    The number of files in the document. Returns -1 in case of error.

    @property Number
  */
  numberOfFilesInDocument: function () {
    return SC.typeOf(this.get('listOfFiles')) === SC.T_ARRAY ?
        this.get('listOfFiles').length : -1;
  }.property('listOfFiles').cacheable(),

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
    this.bind('currentFileIndex', 'Multivio.masterController.currentFileIndex');
    this.bind('listOfFiles', 'Multivio.masterController.listOfFiles');
    
    var meta = Multivio.CDM.getFileMetadata(url);
    if (SC.none(meta.nPages)) {  
      // if masterController.isGrouped => 
      // _numberOfPages = physicalstructure length of the referer 
      if (Multivio.masterController.isGrouped) {
        var refStruct = Multivio.CDM.getPhysicalstructure(Multivio.CDM.getReferer());
        // check if physical structure of the referer is on the client
        // else create a binding
        if (refStruct !== -1) {
          this.set('_numberOfPages', refStruct.length);
          Multivio.sendAction('addComponent', 'navigationController');
        }
        else {
          this.bind('physicalStructure', 'Multivio.CDM.physicalStructure');
        }
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
    //this.checkButton();  
    if (!SC.none(this.get('currentFileIndex')) && this.get('currentFileIndex') > 0) {
      this.set('isFirstEnabled', YES);
    } 
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
      if (Multivio.masterController.isGrouped) {
        var refStruct = Multivio.CDM.getPhysicalstructure(Multivio.CDM.getReferer());
        if (refStruct !== -1) {
          this.set('_numberOfPages', refStruct.length);
          Multivio.sendAction('addComponent', 'navigationController');
        }
      }
      else {
        var cf = Multivio.masterController.get('currentFileIndex');
        if (!SC.none(cf)) {
          var currentPh = this.get('physicalStructure')[cf];
          // we have physicalstructure
          if (currentPh !== -1 && !SC.none(currentPh)) {
            this.set('_numberOfPages', currentPh.length);
            Multivio.sendAction('addComponent', 'navigationController');
          }
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
    if (!SC.none(newPosition) && !SC.none(this.get('_numberOfPages'))) {
      // verify if we need to set selection (avoid loopbacks)
      var currentPageNumber = this.get('currentPage');
      if (currentPageNumber !== newPosition) {
        this.set('isLoadingContent', YES);
        this.set('currentPage', newPosition);
        Multivio.logger.info('navigationController#positionDidChange: %@'.
            fmt(this.get('currentPage')));
      }
    }
  }.observes('position', '_numberOfPages'),
 
  /**
    Updates position by observing changes in navigation controller's
    currentPage.
    
    @private
    @observes currentPage
  */  
  _currentPageDidChange: function () {
    var newCurrentPage = this.get('currentPage');
    // convert to int if it's a finite, legal number
    // takes care of strings such as '01', '002', etc
    if (isFinite(newCurrentPage)) {
      newCurrentPage = parseInt(newCurrentPage, 10);
    }
    if (newCurrentPage < 1 || newCurrentPage > this.get('_numberOfPages') ||
        isNaN(newCurrentPage)) {
      Multivio.usco.showAlertPaneWarn(
          '_Incorrect page number'.loc(),
          '_Please enter a number between 1 and %@'.loc() +
          this.get('_numberOfPages'), '_Ok'.loc(), '', this);
    }
    else {
      this.set('position', newCurrentPage);
    }
  }.observes('currentPage'),
  
  
  /**
    Delegate method of the Multivio.usco.showAlertPaneWarn
    
    @param {String} pane the pane instance
    @param {} status 
  */  
  alertPaneDidDismiss: function (pane, status) {
    switch (status) {
    case SC.BUTTON1_STATUS:
      this.set('currentPage', this.get('position'));
      break;
    }
  },
  
  /**
    Change buttons status observing isLoadingContent property.
    
    @observes isLoadingContent
  */
  isLoadingContentDidChange: function () {
    var isLoadingContent = this.get('isLoadingContent');
    if (isLoadingContent) {
      // disabled buttons
      this.set('isPreviousEnabled', NO);
      this.set('isNextEnabled', NO);
      this.set('isFirstEnabled', NO);
      this.set('isLastEnabled', NO);
      this.set('isCurrentPageEnabled', NO);
    }
    else {
      // enabled buttons after checking conditions
      this.set('isCurrentPageEnabled', YES);
      var current = this.get('currentPage');
      var currentFileI = this.get('currentFileIndex');
      if (Multivio.masterController.isGrouped) {
        if (current !== 1) {
          this.set('isPreviousEnabled', YES);
          this.set('isFirstEnabled', YES);
        }
        if (current !== this.get('_numberOfPages')) {
          this.set('isNextEnabled', YES);
          this.set('isLastEnabled', YES);
        }
      }
      else {
        if (!SC.none(currentFileI)) {
          if (current !== 1) {
            this.set('isPreviousEnabled', YES);
          }
          else {
            //current = 1 but we are no at the first doc
            if (currentFileI !== 0) {
              this.set('isPreviousEnabled', YES);
            }
          }
          if (currentFileI !== 0) {
            this.set('isFirstEnabled', YES);
          }
          else {
            // currentFileI = 0 and current != 1 go to the first page
            if (current !== 1) {
              this.set('isFirstEnabled', YES);
            }
          }
          if (current !== this.get('_numberOfPages')) {
            this.set('isNextEnabled', YES);
          }
          else {
            // last page but not last document
            if (!SC.none(Multivio.masterController.listOfFiles) &&
                currentFileI < Multivio.masterController.listOfFiles.length - 1) {
              this.set('isNextEnabled', YES);
            }
          }
          if (!SC.none(Multivio.masterController.listOfFiles) && (
              currentFileI < Multivio.masterController.listOfFiles.length - 
              1 || (currentFileI === 
              (Multivio.masterController.listOfFiles.length - 1)) && 
                current !== this.get('_numberOfPages'))) {
            this.set('isLastEnabled', YES);
          }
        }
        else {
          // only one file
          if (current !== 1) {
            this.set('isPreviousEnabled', YES);
            this.set('isFirstEnabled', YES);
          }
          if (current !== this.get('_numberOfPages')) {
            this.set('isNextEnabled', YES);
            this.set('isLastEnabled', YES);
          }
        }
      }
    }
  }.observes('isLoadingContent'),
  
  /**
    Go to the next page.    
  */ 
  goToNextPage: function () {
    this.set('isPreviousEnabled', YES);
    var np = parseInt(this.get('currentPage'), 10) + 1;
    if (np <= this.get('_numberOfPages')) {
      SC.RunLoop.begin();
      this.set('isLoadingContent', YES);
      SC.RunLoop.end();
      this.set('currentPage', np);
    }
  },
  
  /**
    Go to the previous page.
  */    
  goToPreviousPage: function () {
    this.set('isNextEnabled', YES);
    var pp = this.get('currentPage') - 1;
    if (pp > 0) {
      SC.RunLoop.begin();
      this.set('isLoadingContent', YES);
      SC.RunLoop.end();
      this.set('currentPage', pp);
    }
  },
  
  /**
    Go to the first page.
  */    
  goToFirstPage: function () {
    SC.RunLoop.begin();
    this.set('isLoadingContent', YES);
    SC.RunLoop.end();
    //only one document
    if (SC.none(this.get('currentFileIndex'))) {
      this.set('currentPage', 1);
    }
    else {
      if (this.get('currentPage') !== 1) {
        this.set('currentPage', 1);
      }
      else {
        this.goToPreviousFile();
      }
    }
  },
  
  /**
    Go to the last page.
  */ 
  goToLastPage: function () {
    SC.RunLoop.begin();
    this.set('isLoadingContent', YES);
    SC.RunLoop.end();
    //only one document
    if (SC.none(this.get('currentFileIndex'))) {
      var nbp = this.get('_numberOfPages');
      this.set('currentPage', nbp);
    }
    else {
      if (this.get('currentPage') !== this.get('_numberOfPages')) {
        this.set('currentPage', this.get('_numberOfPages'));
      }
      else {
        this.goToNextFile();
      }
    }
  },

  /**
    Go to the previous file in the document
  */
  goToPreviousFile: function () {
    var current = this.get('currentFileIndex');
    // sanity check
    if (SC.typeOf(current) === SC.T_NUMBER && current > 0) {
      current--;
      this.set('currentFileIndex', current);
      Multivio.makeFirstResponder(Multivio.INIT);
      //Multivio.READY.showLastPosition = YES;
      Multivio.sendAction('notAllowSelection');
      Multivio.masterController.zoomState =
          Multivio.zoomController.currentZoomState;
    }
  },

  /**
    Go to the next file in the document
  */
  goToNextFile: function () {
    var current = this.get('currentFileIndex');
    // sanity check
    if (SC.typeOf(current) === SC.T_NUMBER &&
        current < this.get('numberOfFilesInDocument') - 1) {
      current++;
      Multivio.makeFirstResponder(Multivio.INIT);
      Multivio.sendAction('notAllowSelection');
      Multivio.masterController.zoomState =
          Multivio.zoomController.currentZoomState;
      this.set('currentFileIndex', current);
    }
  },

  /**
    Select if we have to go to the next page or to the next document
  */  
  goToNext: function () {
    //only one document
    if (this.get('numberOfFilesInDocument') === 1) {
      if (this.get('currentPage') !== this.get('_numberOfPages')) {
        this.goToNextPage();
      }
    }
    else {
      // last page
      if (this.get('currentPage') === this.get('_numberOfPages')) {
        if (this.get('currentFileIndex') !== 
            Multivio.masterController.listOfFiles.length - 1  &&
            !Multivio.masterController.isGrouped) {
          this.goToLastPage();
        }
      }
      else {
        this.goToNextPage();
      }
    }
  },
  
  /**
    Select if we have to go to the previous page or to the previous document
  */
  goToPrevious: function () {
    // only one document
    if (SC.none(this.get('currentFileIndex'))) {
      if (this.get('currentPage') !== 1) {
        this.goToPreviousPage();
      }
    }
    else {
      // first page
      if (this.get('currentPage') === 1) {
        if (this.get('currentFileIndex') !== 0) {
          this.goToFirstPage();
        }
      }
      else {
        this.goToPreviousPage();
      }
    }
  },
  
  /**
    Method that is called when an event occured
  
    @param {SC.Event} evt the event that trigged this action
  */
  keyEvent: function (evt) {
    switch (evt.which) {
    // page_up
    case 33:
      this.goToPrevious();
      return YES;
    // page_down
    case 34:
      this.goToNext();
      return YES;
    default:
      return NO;
    }
  }

});
