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
    Binds to the masterController's currentPosition.
    
    @binding {Multivio.CoreDocumentNode}
  */
  position: null,
  //positionBinding: "Multivio.masterController.currentPosition",

  /**
    Initialize this controller, retrieve the number of pages.
  */
  initialize: function (url) {
    this.position = null;
    this.bind('position', 'Multivio.masterController.currentPosition');
    var meta = Multivio.CDM.getMetadata(url);
    var nb = meta.nPages;
    this.set('_numberOfPages', nb);
    Multivio.layoutController.addComponent('views.navigationView');
    Multivio.logger.info('navigationController initialized');
  },
  
  /**
    Updates currentPage by observing changes of the position property
    
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
