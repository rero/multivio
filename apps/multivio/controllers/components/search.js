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
    //Multivio.logger.debug('selectionController#addhighlight (current): type:%@, page:%@, zoom:%@, is_original:%@'.fmt(type_, page_, current_zoom_factor, is_original));
    
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
    var new_zone  = undefined;
    var new_obj   = undefined;

    if (is_original) {
      new_zone = this._getCurrentZone(received_zone, current_zoom_factor);
      
      new_obj = { 
        page_number: page_, 
        type: type_,
        current: new_zone, 
        original: received_zone 
      };
      
    } else {
      // compute the dimensions and position according to original content size (zoom factor = 1)
      new_zone = this._getOriginalZone(received_zone, current_zoom_factor);
      
      new_obj = { 
        page_number: page_, 
        type: type_,
        current: received_zone, 
        original: new_zone 
      };  
      
    }

    this.addObject(new_obj);
    //Multivio.logger.debug("highlight controller, length: " + this.get('length'));
    
    return new_obj;
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
    Multivio.logger.info('selectionController initialized');
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
    this._positionToThumbnail = {};
    this.position = null;
    this.set('content', null);
    this.set('selection', null);
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
  // TODO no init value
  currentSearchTerm: 'test',
  
  // this property should be bound to the value of the searchScopeView
  currentSearchFile: undefined,
  
  // keep track of the last query sent to server
  lastSearchQuery: undefined,
  
  // TODO ? keep track of last file that was searched
  lastSearchFile: undefined,
  
  // referer url
  url: undefined,
  
  // search results' display state: defines whether the client must
  // display the results. NO = don't display (results cleared)
  displayResults: {},
  
  /**
    Binds to the currentValue in the rotate controller.
    This binding is read only
    
    @binding {Number}
  */
  rotateValue: undefined,      
  rotateValueBinding: SC.Binding.oneWay('Multivio.rotateController.currentValue'),
  
  // all search results
  searchResults: undefined,
  searchResultsBinding: SC.Binding.oneWay('Multivio.CDM.searchResults'),

  // list of all files of the document
  currentFileList: undefined,
  
  // physical srtucture of the document, contains the files' urls and labels
  physicalStructure: undefined,
  physicalStructureBinding: 'Multivio.CDM.physicalStructure',
  
  // send a new request to the server with the new angle
  _rotateValueDidChange: function () {
    
    console.info("_rotateValueDidChange: " + this.get('rotateValue'));
    
    // if there are already search results, send a new request to get new coordinates
    var res = this.get('searchResults');
    if (!SC.none(res) && !SC.none(res[this.get('currentSearchFile')])) {
      this.doSearch();      
    }

    
  }.observes('rotateValue'),
  
  // extract file list (labels + urls) from physical structure, store as a flat list
  _physicalStructureDidChange: function () {
    
    var phys = this.get('physicalStructure');
    var url = Multivio.CDM.getReferer();

    if (!SC.none(phys) && !SC.none(phys[url]) && phys[url].length > 0) {
      this.set('currentFileList', phys[url]);
      // select first file in list
      var file_url = phys[url][0].url;
      this.set('currentSearchFile', file_url);
      
      var dr = {};
      // init display properties for each file
      for (var i = 0; i < phys[url].length; i++) {
        dr[phys[url][i].url] = YES;
      }
      this.set('displayResults', dr);
      
    }
  }.observes('physicalStructure'),
  
  // when search file selection changes, load corresponding search results (if any)
  _currentSearchFileDidChange: function () {
    
    console.info('currentSearchFile did change');
    var current_file = this.get('currentSearchFile');
    this._loadExistingSearchResultsForFile(current_file);
    
  }.observes('currentSearchFile'),
 
  // when current file selection changes, load corresponding search results (if any)
  _currentFileDidChange: function () {
    /* TODO test old 10.10.2010
    var current_file = Multivio.masterController.get('currentFile');
    console.info('Multivio.masterController.currentFile did change: ' + current_file);
    //this._loadExistingSearchResultsForFile(current_file);
    SC.RunLoop.begin();
    this.set('content', []);
    console.info('Multivio.masterController.currentFile did change: content reset');
    SC.RunLoop.end();
    */
    var current_file = Multivio.masterController.get('currentFile');
    SC.RunLoop.begin();
    this.set('currentSearchFile', current_file);
    SC.RunLoop.end();
    console.info('Multivio.masterController.currentFile did change: ' + current_file);
  }.observes('Multivio.masterController.currentFile'), 

  
  // if results already exist for this file, load them. Else, empty content
  _loadExistingSearchResultsForFile: function (url) {
    
    // clear results' list
    this.set('content', []);
    
    console.info("_loadExistingSearchResultsForFile: url:" + url);
    
    // look for existing stuff in the CDM
    var all_results = Multivio.CDM.get('searchResults');
    var new_results = {};    
        
    if (!SC.none(all_results) && !SC.none(all_results[url])) {
      console.info("_loadExistingSearchResultsForFile: found results:" + all_results[url].file_position.results[0].preview);
      new_results = Multivio.CDM.clone(all_results);
      SC.RunLoop.begin();
      this.set('_load_url', url);
      this.set('searchResults', new_results); // should trigger _searchResultsDidChange()
      SC.RunLoop.end();
    }
    
  },

  _selectionDidChange: function () {
    
    // TODO: is it possible to detect the case when we come here from initialize()
    // and thus avoid jumping back to the current 
    
    //console.info("_selectionDidChange, begin");
    
    //SC.RunLoop.begin();
    
    // TODO: try to store angle and restore it ? for rotate support
    
    var selSet = this.get('selection');
    var selectedObject = selSet.firstObject();
    
    if (SC.none(selectedObject)) return NO;
    
    // if necessary, switch to the corresponding document
    // NOTE: changing to page number 1 at first because there might be
    // a mismatch in page numbers between the different documents 
    // WARNING: changing master's currentFile initialises controllers anew.
    // in initialize(), check for existing results in CDM
    var current_search_file = this.get('currentSearchFile');
    var current_master_file = Multivio.masterController.get('currentFile');
    if (current_master_file !== current_search_file) {
      SC.RunLoop.begin();
      console.info("selectionDidChange: switching to page 1 of document: " + current_search_file);
      //Multivio.masterController.set('currentPosition', 1);
      Multivio.masterController.set('currentFile', current_search_file);
      SC.RunLoop.end();
    }
        
    // change master's currentPosition so that we 'jump' to the place 
    // in the content where the search result points
    SC.RunLoop.begin();
    //console.info("selectionDidChange: ...");
    console.info("selectionDidChange: switching to page: " + selectedObject.page_number);
    Multivio.masterController.set('currentPosition', selectedObject.page_number);
    
    SC.RunLoop.end();
    
    return YES;
    
  }.observes('selection'),

  // return a zone (which is inside a search result here)
  getZone: function (index) {
    return this.objectAt(index);
  },

  doSearch: function () {
    
    // TODO test
    this.doClear();
    
    // store last search query for later use
    var query = this.get('currentSearchTerm');
    this.set('lastSearchQuery', query);
    // TODO store file url as well ?
    
    // discard empty strings
    if (SC.none(query) || SC.empty(query.trim())) return NO;
    
    Multivio.logger.debug('SearchController.doSearch("%@")'.fmt(query));
    
    // get rotation angle
    var angle = this.get('rotateValue'); //Multivio.rotateController.currentValue || 0;
    
    console.info("doSearch(): angle: " + angle);
    
    // get file url
    var url = this.get('currentSearchFile');
    
    // TODO: query multivio server: context size=15, max_results=50
    // Note: this triggers _searchResultsDidChange(), only the first time the server response is received
    var res = Multivio.CDM.getSearchResults(url, query, '', '', 15, 11, angle);
    
    // clear previous results
    //this.doClear();
    this.set('content', []);
    
    // store results
    // TODO test: centralise handling of new search results through function _searchResultsDidChange()
    //this._setSearchResults(res, query);
    
    // artificially trigger _searchResultsDidChange() again by setting searchResults (needs a cloned instance)
    // if there's something new
    var all_res = this.get('searchResults') || {};
    var new_res = Multivio.CDM.clone(all_res);
    new_res[url] = res;
    //TODO
    if (YES) {
      SC.RunLoop.begin();
      var nd = this.get('displayResults');
      nd[url] = YES;
      this.set('displayResults', nd);
      this.set('_load_url', url);
      this.set('searchResults', new_res);
      SC.RunLoop.end();
    }
     
    return YES;
  },
  
  doClear: function () {
    
    Multivio.logger.debug('SearchController.doClear()');
    
    // clear all current search results (ie. for current file only).
    // ?? note: don't clear the results stored in the CDM, just don't display them
    
    var cf = this.get('currentSearchFile');
    var all_results = Multivio.CDM.get('searchResults');
    var new_results = {};
    
    if (!SC.none(all_results) && !SC.none(all_results[cf])) {
      console.info("clearing...");
      new_results = Multivio.CDM.clone(all_results);
      new_results[cf] = undefined;
      SC.RunLoop.begin();
      Multivio.CDM.set('searchResults', new_results);
      SC.RunLoop.end();
    }
    
    this.set('content', []);
    var url = this.get('currentSearchFile');
    var nd = this.get('displayResults');
    nd[url] = NO;
    SC.RunLoop.begin();
    this.set('displayResults', nd);
    SC.RunLoop.end();
    
    // clear current search term
    //this.set('currentSearchTerm', '');    
  },
  
  _searchResultsDidChange: function () {
    
    // TODO: check if there is a difference in the results to avoid calling _setSearchResults() for nothing ?
    
    var res = this.get('searchResults');
    var url = this.get('_load_url');
    var current_url = (SC.none(url)? this.get('currentSearchFile') : url);
    var query = this.get('lastSearchQuery');
    
    
    console.info("_searchResultsDidChange: res:" + res);
    console.info("_searchResultsDidChange: current_url:" + current_url);
    console.info("_searchResultsDidChange: query:" + query);
    
    var key = current_url; //{'url': current_url, 'query': query};
    
    // debug
    if (!SC.none(res[key])) {
      console.info("_searchResultsDidChange: res[]:" + res[key]); //.file_position.results[0].preview);
      this.set('TODO', res[key]);
      
      if (!SC.none(res[key].file_position)) {
        console.info("_searchResultsDidChange: res[].f_p:" + res[key].file_position); //.file_position.results[0].preview);
        
        if (!SC.none(res[key].file_position.results)) {
          console.info("_searchResultsDidChange: res[].f_p.results:" + res[key].file_position.results); //.file_position.results[0].preview);
          
          if (res[key].file_position.results.length > 0 && !SC.none(res[key].file_position.results[0].preview)) {
            console.info("_searchResultsDidChange: res[].f_p.results:" + res[key].file_position.results[0].preview); //.file_position.results[0].preview);
          }
        }
      
      }
    } // end debug
  
    // clear load_url 
    this.set('_load_url', undefined);
    
    // do nothing if we don't have to display the results
    if (!this.get('displayResults')[current_url]) return;
    
    if (!SC.none(res) && !SC.none(res[key])) {
      SC.RunLoop.begin();
      this._setSearchResults(res[key], query);
      SC.RunLoop.end();
    }
    
  }.observes('searchResults'),
  
  _setSearchResults: function (res, query) {
    
    console.info("_setSearchResults(), query=" + query);          
    console.info("_setSearchResults(), res=" + res); 
    //console.info("_setSearchResults(), res=" + res.file_position.results[0].preview); 
                                            
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
      // TODO: note: this will trigger a selectionDidChange, which in turn will change
      // back to the current searched document, which makes it impossible to switch files form the treeview...
      //this.goToFirstResult();
    }
  },

  goToFirstResult: function () {
    var sel = this.get('selection');
    var selObj = sel.firstObject();
    var newSel = SC.SelectionSet.create();
    
    console.info("goToFirstResult");
    
    // select first item
    newSel.addObject(this.objectAt(0));
    SC.RunLoop.begin();
    this.set('selection', newSel);
    SC.RunLoop.end();
  },

  goToNextResult: function () {
    var sel = this.get('selection');
    var selObj = sel.firstObject();
    var newSel = SC.SelectionSet.create();
    var l = this.get('length');
    
    console.info("goToNextResult");
    
    // select first item if none selected,
    if (sel.get('length') === 0) {
      newSel.addObject(this.objectAt(0));
      SC.RunLoop.begin();
      this.set('selection', newSel);
      SC.RunLoop.end();
    } else { // otherwise, next element in array (go back to first element after reaching last)
      var currentIndex = this.indexOf(selObj, 0);
      var nextObject = this.objectAt(++currentIndex % l);
      newSel.addObject(nextObject);
      SC.RunLoop.begin();
      this.set('selection', newSel);
      SC.RunLoop.end();
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
      SC.RunLoop.begin();
      this.set('selection', newSel);
      SC.RunLoop.end();
    } else { // otherwise, previous element in array (go back to last element after reaching first)
      var currentIndex = this.indexOf(selObj, 0);
      var prevObject = this.objectAt((--currentIndex + l) % l);
      newSel.addObject(prevObject);
      SC.RunLoop.begin();
      this.set('selection', newSel);
      SC.RunLoop.end();
    }
  },

  addSearchResult: function (label, context, top_, left_, width_, height_, page_, current_zoom_factor) {
    //Multivio.logger.debug('SearchController.addSearchResult(): label: %@, context: %@, top: %@, left: %@, width: %@, height: %@, page: %@, zoom: %@'.fmt(label, context, top_, left_, width_, height_, page_, current_zoom_factor));

    SC.RunLoop.begin();

    // first, add a highlight zone
    var new_hl = this.addHighlight(top_, left_, width_, height_, page_, 'search', current_zoom_factor, YES);

    // then insert additional search information (assuming the addHighlight above was successful...)
    //var obj = this.objectAt(this.get('length') - 1);
    if (!SC.none(new_hl)) {
      new_hl.label = label;
      new_hl.context = context;      
    } else {
      console.info("Warning: cannot retrieve label and context ...");
    }
    
    SC.RunLoop.end();
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
    
    Multivio.logger.debug('searchController initialized with url (START):' + url);
    
    // set referer url
    // NOTE: don't use 'url' arg, contains the url to the first file (does not work for documents with multiple files)
    this.set('url', Multivio.CDM.getReferer());

    // check for existing results in CDM
    // NOTE: use 'url' arg of file, and not the referer
    this.set('content', []);
    this._loadExistingSearchResultsForFile(url);
    
    Multivio.sendAction('addComponent', 'searchController');
    Multivio.logger.info('searchController initialized with url (END):' + url);
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
    this._positionToThumbnail = {};
    this.position = null;
    this.set('content', null);
    this.set('selection', null);
  }

});

// instantiate the selection and search controllers
Multivio.selectionController = Multivio.HighlightController.create();
Multivio.searchController = Multivio.SearchController.create();