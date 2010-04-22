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

  @author fma
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
    Binds to the masterController's masterSelection.
    
    @binding {Multivio.CoreDocumentNode}
   */
  contentBinding: SC.Binding.single("Multivio.masterController.masterSelection"),
  
  metadata: null,
  metadataBinding: SC.Binding.oneWay("Multivio.CDM.metadata"),
 
  /**
    Updates currentPage by observing changes in master controller's
    master selection.
    
    @private
    @observes content
  */
  _contentDidChange: function () {
    // find the page that corresponds to the current master selection
    var currentNavigationValue = !SC.none(this.get('currentPage')) ?
        this.get('currentPage') : undefined;
    var currentMasterSelection = this.get('content');
    if (!SC.none(currentMasterSelection)) {
      var newPage = currentMasterSelection.get('sequenceNumber');
      // make sure the selection has actually changed, (to avoid loopbacks)
      if (SC.none(currentNavigationValue) ||
          (!SC.none(newPage) && newPage !== currentNavigationValue)) {
        this.set('currentPage', newPage);
      }    
    } else {
      var errMess = "Unable to retrieve the masterSelection !!";
      Multivio.logger.error(errMess);
      throw {message: errMess};
    }
    
  }.observes('content'),

  /**
    Updates content by observing changes in navigation controller's
    currentPage.
    
    @private
    @observes currentPage
  */  
  _currentPageDidChange: function () {
    if (!SC.none(this.get('currentPage'))) {
      var currentContent = this.get('content');
      if (SC.none(currentContent) ||
          this.get('currentPage') !== currentContent.get('sequenceNumber')) { 
        var cdmStore = Multivio.store.find(Multivio.CoreDocumentNode);
        var q = SC.Query.create({ recordType: Multivio.CoreDocumentNode, 
            conditions: "sequenceNumber = %@".fmt(this.get('currentPage'))});
        var imageObjects = cdmStore.find(q);
        var cdmObject = imageObjects.firstObject();
        if (!SC.none(cdmObject)) {
          SC.RunLoop.begin();
          this.set('content', cdmObject);
          SC.RunLoop.end();
        }
      }
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
  },
  
  /**
    Retrieve the number of pages.
    
    @private
    @property _numberOfPages
    @returns {Number} Returns the number of pages.
  */ 
  _retrieveNumberOfPages: function () {
    var thumbnails = Multivio.store.find(Multivio.Thumbnail);
    return thumbnails.get('length');
  }.property('_numberOfPages').cacheable(),
  
  /**
    Initialize this controller, retrieve the number of pages.
  */
  initialize: function (url) {
    var meta = Multivio.CDM.getMetadata(url);
    var nb = meta.nPages;
    this.set('_numberOfPages', nb);
    Multivio.layoutController.addComponent('views.navigationView');
    Multivio.logger.info('navigationController initialized');
  }
  
});
