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
  addHighlight: function (top_, left_, width_, height_, page_, type_, current_zoom_factor, is_original) {

    // discard zones that are too small
    if (width_ <= this.minimalZoneDimension ||
       height_ <= this.minimalZoneDimension) return null;

    //Multivio.logger.debug('selectionController#addhighlight (current): %@, %@, %@, %@'.fmt(top_, left_, width_, height_));
    //Multivio.logger.debug('selectionController#addhighlight (current): type:%@, page:%@, zoom:%@'.fmt(type_, page_, current_zoom_factor));
    
    // dimensions and position of zone according to the current zoom factor
    var received_zone;

    received_zone = SC.Object.create(
      {
        top:    top_,
        left:   left_, 
        width:  width_, 
        height: height_
      }
    );
    

    //Multivio.logger.debug('selectionController#addhighlight (original): %@, %@, %@, %@'
    //      .fmt(original_zone.top, original_zone.left, original_zone.width, original_zone.height));

    // add object to array
    // TODO: storing both current and original info, necessary ? 
    // TODO: test label for search results view
    //this.addObject({current: current_zone, original: original_zone, context: 'top: %@px'.fmt(top_) });
    var new_zone = null;
    if (is_original) {
      new_zone = this._getCurrentZone(received_zone, current_zoom_factor);
      this.addObject({ 
        page_number: page_, 
        type: type_,
        current: new_zone, 
        original: received_zone 
      });
      
    } else {
      // compute the dimensions and position according to original content size (zoom factor = 1)
      new_zone = this._getOriginalZone(received_zone, current_zoom_factor);
      this.addObject({ 
        page_number: page_, 
        type: type_,
        current: received_zone, 
        original: new_zone 
      });      
    }

    
    
    //var len = this.get('length');
    //Multivio.logger.debug("length: " + len);
    //Multivio.logger.debug("highlight controller, last object: " + this.objectAt(len - 1).context);
    
    return YES;
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
  
  // compute the position and dimension of a zone as it is on the
  // zoomed content, based on its original positioning data and the current zoom factor
  _getCurrentZone: function (zone, zoom_factor) {
    return this._getOriginalZone(zone, 1 / zoom_factor);
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
  
  // property, should be bound to the value of the searchScopeView
  currentSearchFile: undefined,
  
  lastSearchQuery: undefined,
  
  url: undefined,
  
  currentResults: undefined,
  currentResultsBinding: 'Multivio.CDM.searchResults',

  currentFileList: undefined,
  
  physicalStructure: undefined,
  physicalStructureBinding: 'Multivio.CDM.physicalStructure',
  
  // extract file list (labels + urls) from physical structure, store as a flat list
  _physicalStructureDidChange: function () {
    
    var phys = this.get('physicalStructure');
    var url = Multivio.CDM.getReferer();

    if (!SC.none(phys)) {
      this.set('currentFileList', phys[url]);
      // select first file in list
      this.set('currentSearchFile', phys[url][0].url);
    }
  }.observes('physicalStructure'),
  
  _currentSearchFileDidChange: function () {
    
    var res = this.get('currentSearchFile');
    console.info("_currentSearchFileDidChange: url:" + res);
    
  }.observes('currentSearchFile'),
  
  _currentResultsDidChange: function () {
    
    var res = this.get('currentResults');
    var current_url = this.get('currentSearchFile');
    
    if (!SC.none(res) && !SC.none(res[current_url])) {
      this._setSearchResults(res[current_url], this.get('lastSearchQuery'));
    }
    
  }.observes('currentResults'),

  selectionDidChange: function () {
    var selSet = this.get('selection');
    var selectedObject = selSet.firstObject();
    
    if (SC.none(selectedObject)) return NO;
        
    // change master's currentPosition so that we 'jump' to the place 
    // in the content where the search result points
    Multivio.masterController.set('currentPosition', selectedObject.page_number);
    
    // TODO scroll ?
    
    return YES;
    
  }.observes('selection'),

  // return a zone (which is inside a search result here)
  getZone: function (index) {
    return this.objectAt(index);
  },

  doSearch: function () {
    
    // store last search query for later use
    var query = this.get('currentSearchTerm');
    this.set('lastSearchQuery', query);
    
    // discard empty strings
    if (SC.none(query) || SC.empty(query.trim())) return NO;
    
    Multivio.logger.debug('SearchController.doSearch("%@")'.fmt(query));
    
    // clear previous results
    this.doClear();
    
    // get rotation angle
    var angle = Multivio.rotateController.currentValue || 0;
    
    // TODO: query multivio server: context size=15, max_results=11
    var res = Multivio.CDM.getSearchResults(this.get('currentSearchFile'), query, '', '', 15, 11, angle);
    
    // store results
    this._setSearchResults(res, query);
     
    return YES;
  },
  
  _setSearchResults: function (res, query) {
    
    //console.info("_setSearchResults(), query=" +  query);          
                                            
    if (res !== -1) {
      var num_res = res.file_position.results.length;
      
      var a = null, b  = null, c = null;
      for (var i = 0; i < num_res; i++) {
        a = res.file_position.results[i];
        b = a.index;
        c = b.bounding_box;

        this.addSearchResult(query, a.preview,
                             c.y1, c.x1, 
                             Math.abs(c.x1 - c.x2), Math.abs(c.y1 - c.y2), b.page,
                             this.get('zoomFactor'));
        
      }
      
      // TODO: add number of search results to some nodes (which ones? all ? ...)
      var treeItems = Multivio.treeController.get('arrangedObjects');
      //console.info("treeItems: " + treeItems);
    
      // TODO: testing, set number for first tree element 
      // --> OK, works
      if (!SC.none(treeItems) && treeItems.length > 0) {
        //console.info("setting number of search results on page " + treeItems.objectAt(0).file_position.index);
        treeItems.objectAt(0).setSearchResultsNumber(num_res);
      }
      
      // select first result
      this.goToNextResult();
    }
  },

  doClear: function () {
    //Multivio.logger.debug('SearchController.doClear()');
    
    // clear all current search results.
    Multivio.CDM.set('searchResults', undefined);
    this.set('content', []);
    
    // clear current search term
    //this.set('currentSearchTerm', '');
    
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

  addSearchResult: function (label, context, top_, left_, width_, height_, page_, current_zoom_factor) {
    //Multivio.logger.debug('SearchController.addSearchResult(): label: %@, context: %@, top: %@, left: %@, width: %@, height: %@, page: %@, zoom: %@'.fmt(label, context, top_, left_, width_, height_, page_, current_zoom_factor));

    // first, add a highlight zone
    this.addHighlight(top_, left_, width_, height_, page_, 'search', current_zoom_factor, YES);

    // then insert additional search information
    var obj = this.objectAt(this.get('length') - 1);
    obj.label = label;
    obj.context = context;
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
    
    // set referer url
    // NOTE: don't use 'url' arg, contains the url to the first file (does not work for documents with multiple files)
    this.set('url', Multivio.CDM.getReferer());

    this.set('content', []);
    Multivio.sendAction('addComponent', 'searchController');
    Multivio.logger.info('SearchController initialized');
  }

});

// instantiate the selection and search controllers
Multivio.selectionController = Multivio.HighlightController.create();
Multivio.searchController = Multivio.SearchController.create();