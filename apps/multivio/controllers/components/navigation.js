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
  
  currentFile: null,
  //currentFileBinding: 'Multivio.masterController.currentFilePosition',
  
  /**
    @property {Number} 
    
    @private
    @default null
  */
  _numberOfPages: null,
  
  /**
    Binds to the masterController isLoadingContent property.
    
    This binding is used to enabled and disabled navigation buttons

    @binding {Boolean}
  */
  isLoadingContent: null,
  isLoadingContentBinding: 'Multivio.masterController.isLoadingContent',
  
  /**
    Boolean to enabled and disabled Buttons
  */
  isNextEnabled: YES,
  isPreviousEnabled: YES,
  isFirstEnabled: YES,
  isLastEnabled: YES,
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
    this.bind('currentFile', 'Multivio.masterController.currentFilePosition');
    
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
    if (!SC.none(this.get('currentFile')) && this.get('currentFile') > 0) {
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
      // verify if we need to set selection (avoid loopbacks)
      var currentPageNumber = this.get('currentPage');
      if (currentPageNumber !== newPosition) {
        this.set('isLoadingContent', YES);
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
        Multivio.usco.showAlertPaneWarn(
            '_Incorrect page number'.loc(),
            '_Please enter a number between 1 and %@'.loc() +
            this.get('_numberOfPages'), '_Ok'.loc(), '', this);
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
    }
    else {
      // enabled buttons after checking conditions
      var current = this.get('currentPage');
      var currentFileP = this.get('currentFile');
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
        if (!SC.none(currentFileP)) {
          if (current !== 1) {
            this.set('isPreviousEnabled', YES);
          }
          if (currentFileP !== 0) {
            this.set('isFirstEnabled', YES);
          }
          if (current !== this.get('_numberOfPages')) {
            this.set('isNextEnabled', YES);
          }
          if (currentFileP < Multivio.masterController.listOfFiles.length - 
              1 || (currentFileP === 
              (Multivio.masterController.listOfFiles.length - 1) && current !== 
              this.get('_numberOfPages'))) {
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
    var np = this.get('currentPage') + 1;
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
    if (!SC.none(this.get('currentFile')) && this.get('currentFile') !== 0 &&
        !Multivio.masterController.isGrouped) {
      var current = this.get('currentFile');
      current--; 
      Multivio.makeFirstResponder(Multivio.INIT);
      Multivio.sendAction('notAllowSelection');
      Multivio.masterController.zoomState = Multivio.zoomController.currentZoomState;
      this.currentPage = null;
      this.set('currentFile', current); 
    }
    else {
      this.set('currentPage', 1);
    }
  },
  
  /**
    Go to the last page.
  */ 
  goToLastPage: function () {
    SC.RunLoop.begin();
    this.set('isLoadingContent', YES);
    SC.RunLoop.end();
    if (!SC.none(this.get('currentFile')) && (this.get('currentFile') !== 
        Multivio.masterController.listOfFiles.length - 1) && 
        !Multivio.masterController.isGrouped) {
      var current = this.get('currentFile');   
      current++; 
      Multivio.makeFirstResponder(Multivio.INIT);
      Multivio.sendAction('notAllowSelection');
      Multivio.masterController.zoomState = Multivio.zoomController.currentZoomState;
      this.set('currentFile', current);   
    }
    else {
      var nbp = this.get('_numberOfPages');
      this.set('currentPage', nbp);
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
      this.goToPreviousPage();
      return YES;
    // page_down
    case 34:
      this.goToNextPage();
      return YES;
    default:
      return NO;
    }
  }

});
