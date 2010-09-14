// ==========================================================================
// Project:   Multivio.searchController
// Copyright: ©2010 RERO, Inc.
// ==========================================================================
/*globals Multivio */

/**
  @class

  This controller manages an array of HighlightZones to draw on the associated highlight pane
  TODO: this requires one instance for each page/content piece to highlight.
  
        It will be used to handle the user selection:
          - when mouse is released, highlight the word(s) enclosed in the rectangle. 
            need to know the corresponding coordinates. Either query the multivio server when mouse is released,
            or the complete data for the current page is already available (eg. when the page is loaded).

  @author {dwy}
  @extends {SC.ArrayController}
  @since {0.1.0}
*/
Multivio.HighlightController = SC.ArrayController.extend(
/** @scope Multivio.selectionController.prototype */ {
  
  allowsMultipleSelection: NO,
  isEditable: YES, 
  
  /**
    @binding {Number}
    
    Binds to the zoom factor in the zoom controller.
    This is needed to compute the coordinates and dimensions
    of a highlighted zone according to the current zoom. 
    
  */ 
  zoomFactor: null, 
  //zoomFactorBinding: 'Multivio.zoomController.zoomRatio',

  // zones with a dimension (in pixels) smaller than this value will be discarded
  minimalZoneDimension: 2, 

  // create a new highlight zone
  addHighlight: function (top_, left_, width_, height_, page_, type_, current_zoom_factor) {

    // discard zones that are too small
    if (width_ <= this.minimalZoneDimension ||
       height_ <= this.minimalZoneDimension) return null;

    Multivio.logger.debug('selectionController#addhighlight (current): %@, %@, %@, %@'.fmt(top_, left_, width_, height_));

    // dimensions and position of zone according to the current zoom factor
    var current_zone;

    //TODO: use the store or not ?
    current_zone = SC.Object.create(
      {
        top:    top_,
        left:   left_, 
        width:  width_, 
        height: height_
      }
    );
/*    current_zone = Multivio.store.createRecord(
      Multivio.HighlightZone, {
        top:    top_,
        left:   left_, 
        width:  width_, 
        height: height_, 
        page:   page_, 
        type:   type_
      }
    );
*/

    // compute the dimensions and position according to original content size (zoom factor = 1)
    var original_zone = this._getOriginalZone(current_zone, current_zoom_factor);

    //Multivio.logger.debug('selectionController#addhighlight (original): %@, %@, %@, %@'
    //      .fmt(original_zone.top, original_zone.left, original_zone.width, original_zone.height));

    // add object to array
    // TODO: storing both current and original info, necessary ? 
    // TODO: test label for search results view
    //this.addObject({current: current_zone, original: original_zone, context: 'top: %@px'.fmt(top_) });
    this.addObject({ 
      index: page_, 
      type: type_,
      current: current_zone, 
      original: original_zone 
    });
    
    
    //var len = this.get('length');
    //Multivio.logger.debug("length: " + len);
    //Multivio.logger.debug("highlight controller, last object: " + this.objectAt(len - 1).context);
    
    return current_zone;
  },
  
  // remove a given highlight zone and destroy 
  removeHighlight: function (index) {
    var record = this.objectAt(index);
    
    if (SC.none(record)) return NO;
    
    this.removeObject(record);
    /*Multivio.logger.debug('selectionController#removeHighlight: %@, %@, %@, %@'.fmt(record.original.get('top'), 
                                      record.original.get('left'), 
                                      record.original.get('width'), 
                                      record.original.get('height')));
    */
                                      
    // note: var record contains two actual records, original and current
    record.original.destroy();
    record.current.destroy();
    //Multivio.store.destroyRecord(Multivio.HighlightZone, index);
    return YES;
  },

  // remove a highlight zone on a given page of content 
  removeHighlightOnPage: function (index, page) {
    //Multivio.logger.debug('selectionController#removeHighlight on page: %@, zone is on page: %@'.
    //  fmt(page, this.objectAt(index).original.page));
    
    if (this.objectAt(index).index === page) {
      this.removeHighlight(index);
    }  
  },

  // remove all highlight zones on a given page of content 
  removeAllHighlightsOnPage: function (page) {
    var l = this.get('length');
    while (--l >= 0) {
      this.removeHighlightOnPage(l, page);
    }
  },

  // remove all highlight zones 
  removeAllHighlights: function () {
    /*var l = this.get('length');
    while (--l >= 0) {
      this.removeHighlight(l);
    }*/
    // TODO: this is faster, but individual objects are not destroyed,
    // waiting of garbage collector. If memory consumption is a problem
    // then using removeHighlight() is advised.
    this.set('content', []);
  },

  // return a zone
  getZone: function (index) {
    return this.objectAt(index);
  },

  

  zoomFactorDidChange: function () {
    //Multivio.logger.debug('%@#zoomFactorDidChange(): %@'.fmt(this, this.get('zoomFactor')));
    
    // update current position and dimensions for all zones for current zoom
    // TODO: alternatively, each zone could have a function which can update itself with
    // a new zoom factor, i.e. zone.updateZoom(new_zoom_factor);
    var zoom_factor = this.get('zoomFactor');
    var l = this.get('length'), c, o, z;
    
    //Multivio.logger.debug('   # objects to update: %@'.fmt(l));
    
    while (--l >= 0) {
      z = this.getZone(l);
      c = z.current;
      o = z.original;
      
      c.top     = o.top     * zoom_factor;
      c.left    = o.left    * zoom_factor;
      c.width   = o.width   * zoom_factor;
      c.height  = o.height  * zoom_factor;      
      
      //Multivio.logger.debug('%@   before %@,%@'.fmt(l, o.top, o.left));
      //Multivio.logger.debug('%@   after  %@,%@'.fmt(l, c.top, c.left));      
      
    }
  }.observes('zoomFactor'),

  // compute the position and dimension of a zone as it is on the
  // unzoomed content, based on its current data and the zoom factor
  // at which said data was recorded
  _getOriginalZone: function (zone, zoom_factor) {
    
    var new_zone;
    
    new_zone = SC.Object.create(
      {
        top:    zone.top    / zoom_factor,
        left:   zone.left   / zoom_factor, 
        width:  zone.width  / zoom_factor, 
        height: zone.height / zoom_factor, 
        page:   zone.page, 
        type:   zone.type
      }
    );
    
    //Multivio.logger.info('_getOriginalZone before: %@,%@ after: %@, %@'.fmt(zone.top, zone.left, new_zone.top, new_zone.left));
    
    return new_zone;
  },
  
  /**
    @method

    Initialize the controller, and its content

  */
  initialize: function (url) {
    // init content to an empty array
    this.set('content', []);
    Multivio.sendAction('addComponent', 'selectionController');
    Multivio.logger.info('HighlightController initialized');
  }

});



/**
  @class

  TODO: manages the list of search results and associated actions

  @author {dwy}
  @extends {SC.ObjectController}
  @since {0.1.0}
*/

Multivio.SearchController = Multivio.HighlightController.extend(
/** @scope Multivio.searchController.prototype */ {

  allowsMultipleSelection: NO,
  isEditable: YES,

  // property, should be bound to the value of the searchQueryView textfield
  currentSearchTerm: 'test',
  
  // testing property binding
/*  currentSearchTermDidChange: function () {
    Multivio.logger.debug('SearchController.currentSearchTermDidChange(): %@'.fmt(this.get('currentSearchTerm')));
  }.observes('currentSearchTerm'),
*/

  selectionDidChange: function () {
    var selSet = this.get('selection');
    var selectedObject = selSet.firstObject();
    
    if (SC.none(selectedObject)) return NO;
    
    //Multivio.logger.debug('SearchController.selectionDidChange(), term: %@'.fmt(selectedObject.term));
    
    // TODO change 'masterSelection'(currentFile, currentPosition,...) so that we 'jump' to the place 
    //in the content where the search result points
    
    return YES;
    
  }.observes('selection'),

  // return a zone (which is inside a search result here)
  getZone: function (index) {
    return this.objectAt(index).position;
  },

  doSearch: function () {
    var s = this.get('currentSearchTerm');
    
    // discard empty strings
    if (SC.none(s) || SC.empty(s.trim())) return NO;
    
    Multivio.logger.debug('SearchController.doSearch("%@")'.fmt(s));
    
    // TODO: query multivio server
    
    // TODO: set example search results with fixtures
    this.set('content', Multivio.SearchController.FIXTURES);
    
    return YES;
  },
  

  doClear: function () {
    //Multivio.logger.debug('SearchController.doClear()');
    
    // clear all current search results.
    this.set('content', []);
    
    // clear current search term
    this.set('currentSearchTerm', '');
    
  },

  goToNextResult: function () {
    var sel = this.get('selection');
    var selObj = sel.firstObject();
    var newSel = SC.SelectionSet.create();
    var l = this.get('length');
    
    // select first item if none selected,
    if (sel.get('length') === 0) {
      newSel.addObject(this.objectAt(0));
      this.set('selection', newSel);
      
    } else { // otherwise, next element in array (go back to first element after reaching last)
      var currentIndex = this.indexOf(selObj, 0);
      var nextObject = this.objectAt(++currentIndex % l);
      
      newSel.addObject(nextObject);
      this.set('selection', newSel);
    }
  },
  
  goToPreviousResult: function () {
    var sel = this.get('selection');
    var selObj = sel.firstObject();
    var newSel = SC.SelectionSet.create();
    var l = this.get('length');
    
    // select last item if none selected,
    if (sel.get('length') === 0) {
      newSel.addObject(this.objectAt(l - 1));
      this.set('selection', newSel);
      
    } else { // otherwise, previous element in array (go back to last element after reaching first)
      var currentIndex = this.indexOf(selObj, 0);
      var prevObject = this.objectAt((--currentIndex + l) % l);
  
      newSel.addObject(prevObject);
      this.set('selection', newSel);
    }
  },

  addSearchResult: function (label, context, zone, page, current_zoom_factor) {
    
  },

  addSearchResults: function (results) {
    
  },
  
  removeSearchResult: function (result) {
    
  },  

  /**
    @method

    Initialize the search controller, its content (array of search results)

  */
  initialize: function (url) {
    this.set('content', []);
    Multivio.sendAction('addComponent', 'searchController');
    Multivio.logger.info('SearchController initialized');
  }

});

// instantiate the selection and search controllers
Multivio.selectionController = Multivio.HighlightController.create();
Multivio.searchController = Multivio.SearchController.create();