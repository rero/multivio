/**
==============================================================================
Project: Multivio - https://www.multivio.org/
Copyright: (c) 2009-2010 RERO
License: See file license.js
==============================================================================
*/
/*globals Multivio */

/**
  @class

  This controller manages an array of HighlightZones to draw on the associated highlight pane
  This requires one instance for each page/content piece to highlight.
  
        It will be used to handle the user selection:
          - when mouse is released, highlight the word(s) enclosed in the rectangle. 
            need to know the corresponding coordinates. Either query the multivio server when mouse is released,
            or the complete data for the current page is already available (eg. when the page is loaded).

  @author {dwy}
  @extends {SC.ArrayController}
  @since {0.2.0}
*/
Multivio.HighlightController = SC.ArrayController.extend(
/** @scope Multivio.selectionController.prototype */ {
  
  /** 
    @property {Boolean}
    
    @default NO
  */
  allowsMultipleSelection: NO,
  
  /** 
    @property {Boolean}
    
    @default YES
  */
  isEditable: YES, 
  
  /**    
    This is needed to compute the coordinates and dimensions
    of a highlighted zone according to the current zoom.
    
    Note: this value is not bound, it is given by the view 
    when the zoom changes.
    
    @default null
  */ 
  zoomFactor: null, 
  //zoomFactorBinding: 'Multivio.zoomController.zoomRatio',

  /**
    Zones with a dimension (in pixels) smaller than this value will be discarded
   
    @property {Number}
    @default 2
  */
  minimalZoneDimension: 2, 

  /**
    Create a new highlight zone with given coordinates and zoom factor.
    
    'is_original' specifies if the coordinates are given in the original
     size of the content. This information is used to compute the coordinates
     according to the current zoom factor.
    
    @param {Number} top_ 
    @param {Number} left_
    @param {Number} width_
    @param {Number} height_
    @param {Number} page the page number
    @param {String} type type: search or highlight
    @param {Number} current_zoom_factor
    @param {Boolean} is_original 
    @return {SC.Object} the created highlight zone
  */
  addHighlight: function (top_, left_, width_, height_, page_, type_,
                                      current_zoom_factor, is_original) {

    // discard zones that are too small
    if (width_ <= this.minimalZoneDimension ||
       height_ <= this.minimalZoneDimension) return null;
    
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

    var new_zone  = undefined;
    var new_obj   = undefined;

    // store original and compute corrdinates according to current zoom
    if (is_original) {
      new_zone = this._getCurrentZone(received_zone, current_zoom_factor);
      
      new_obj = { 
        page_number: page_, 
        type: type_,
        current: new_zone, 
        original: received_zone 
      };
      
    } else {
      // compute the dimensions and position according to 
      // original content size (zoom factor = 1)
      new_zone = this._getOriginalZone(received_zone, current_zoom_factor);
      
      new_obj = { 
        page_number: page_, 
        type: type_,
        current: received_zone, 
        original: new_zone 
      };  
      
    }

    // add highlight to the array
    this.addObject(new_obj);
    
    return new_obj;
  },
  
  /**
    Remove a highlight zone (given by its index in the array) and destroy it.
    
    @param {Number} index
    @return {Boolean} true if removed successfully
  */
  removeHighlight: function (index) {
    var record = this.objectAt(index);
    
    if (SC.none(record)) return NO;
    
    this.removeObject(record);
                                      
    // note: var record contains two actual records, original and current
    record.original.destroy();
    record.current.destroy();
    //Multivio.store.destroyRecord(Multivio.HighlightZone, index);
    return YES;
  },

  /**
    Remove a highlight zone (given by its index in the array)
    on a given page of content, and destroy it.
    
    @param {Number} index
    @param {Number} page
  */
  removeHighlightOnPage: function (index, page) {
    
    if (this.objectAt(index).index === page) {
      this.removeHighlight(index);
    }  
  },

  /**
    Remove all highlight zones on a given page of content.
    
    @param {Number} page
  */
  removeAllHighlightsOnPage: function (page) {
    var l = this.get('length');
    while (--l >= 0) {
      this.removeHighlightOnPage(l, page);
    }
  },
 
  /**
    Remove all highlight zones.
  */
  removeAllHighlights: function () {
    /*var l = this.get('length');
    while (--l >= 0) {
      this.removeHighlight(l);
    }*/
    // TODO?: this is faster, but individual objects are not destroyed,
    // waiting of garbage collector. If memory consumption is a problem
    // then using removeHighlight() is advised.
    this.set('content', []);
  },

  /**
    Return a highlight zone given by its index in the array.
    
    @param {Number} index
    @return {SC.Object}
  */
  getZone: function (index) {
    return this.objectAt(index);
  },

  /**
    Update the coordinates of all highlight zones according to new zoom factor.
    
    @observes zoomFactor
  */
  zoomFactorDidChange: function () {
    
    // update current position and dimensions for all zones for current zoom
    // TODO?: alternatively, each zone could have a function which can 
    // update itself with a new zoom factor,
    // i.e. zone.updateZoom(new_zoom_factor);
    var zoom_factor = this.get('zoomFactor');
    var l = this.get('length'), c, o, z;  
    while (--l >= 0) {
      z = this.getZone(l);
      c = z.current;
      o = z.original;
      
      c.top     = o.top     * zoom_factor;
      c.left    = o.left    * zoom_factor;
      c.width   = o.width   * zoom_factor;
      c.height  = o.height  * zoom_factor;      
    }
  }.observes('zoomFactor'),

  /**
    Compute the position and dimension of a zone as it is on the
    unzoomed content, based on its current data and the zoom factor
    at which said data was recorded
    
    @private
    
    @param {SC.Object} zone
    @param {Number} zoom_factor
    @return {SC.Object} the original zone object
  */
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
    
    return new_zone;
  },
  
  /**
    Compute the position and dimension of a zone as it is on the
    zoomed content, based on its original positioning data and 
    the current zoom factor.
    
    @private
    
    @param {SC.Object} zone
    @param {Number} zoom_factor
    @return {SC.Object} the current zone object
  */
  _getCurrentZone: function (zone, zoom_factor) {
    return this._getOriginalZone(zone, 1 / zoom_factor);
  },
  
  /**
    Initialize the controller, and its content.
    
    @param {String} url
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

  Handles client search requests to the server
  and manages the list of search results and associated actions.

  @author {dwy}
  @extends {SC.HighlightController}
  @since {0.2.0}
*/

Multivio.SearchController = Multivio.HighlightController.extend(
/** @scope Multivio.searchController.prototype */ {

  /** 
    @property {Boolean}
    
    @default NO
  */
  allowsMultipleSelection: NO,
  
  /** 
    @property {Boolean}
    
    @default YES
  */
  isEditable: YES,

  /** 
    The current search term.
    
    This property should be bound to the value 
    of the searchQueryView textfield.
  
    @property {Boolean}
    
    @default ''
  */
  currentSearchTerm: '',
  
  /** 
    The url of file we have currently selected for searching in.
    
    This property should be bound to the value of the searchScopeView.
    
    @property {String}
    
    @default undefined
  */
  currentSearchFile: undefined,
  

  /** 
    Keep track of the last query sent to server.
    
    @property {String}
    
    @default undefined
  */
  lastSearchQuery: undefined,
    
  /** 
    Url of the referer.
    
    @property {String}
    
    @default undefined
  */
  url: undefined,
  

  /** 
    The search results' display state: defines whether the client must
    display the results or not. NO = don't display (results cleared).
    
    This is a dictionary matching each file url to a Boolean.
    
    @property {Object}
    
    @default {}
  */
  displayResults: {},
  
  /**
    Binds to the currentValue in the rotate controller.
    This binding is read only.
    
    @binding {Number}
  */
  rotateValue: undefined,      
  rotateValueBinding: 
        SC.Binding.oneWay('Multivio.rotateController.currentValue'),
  
  /**
    Binds to the search results stored in the CDM.
    This binding is read only.
    
    @binding {Object}
  */
  searchResults: undefined,
  searchResultsBinding: SC.Binding.oneWay('Multivio.CDM.searchResults'),

  /** 
    List of all files of the document, taken from the physical structure.
    
    @property {SC.Array}
    
    @default undefined
  */  
  currentFileList: undefined,
  
  /**
    Physical structure of the document, contains the files' urls and labels.
    This binding is read only.
    
    @binding {Object}
  */
  physicalStructure: undefined,
  physicalStructureBinding: 
                SC.Binding.oneWay('Multivio.CDM.physicalStructure'),
  
  /** 
    String representing the search status
    (search in progress, number found results...) used to inform the user.

    @property {SC.String}

    @default ''
  */  
  searchStatus: '', 
  
  /**
    When the rotation angle changes, send a new search request to the server
    to obtain the new coordinates.
    
    @private
    @observes rotateValue
  */
  _rotateValueDidChange: function () {
    
    Multivio.logger.debug("_rotateValueDidChange: " + this.get('rotateValue'));
    
    // if there are already search results, send a new request 
    // to get new coordinates according to new rotation angle
    var res = this.get('searchResults');
    if (!SC.none(res) && !SC.none(res[this.get('currentSearchFile')])) {
      // keep selected item
      var selSet = this.get('selection');
      this.set('selectedIndex', this.indexOf(selSet.firstObject()));

      Multivio.logger.debug('currently selected object:' +
                 selSet.firstObject() + ', #' + this.get('selectedIndex'));

      // send a new search request
      // TODO: in the future, compute new coordinates locally,
      // without querying the server again
      this.doSearch();
      
      // NOTE: restore selection after we receive results
      // This will be done once we receive the results,
      // in this._searchResultsDidChange() 
    }
  }.observes('rotateValue'),
  
  /**
    When the physical structure changes, extract file list (labels + urls)
    from it, store as a flat list.
    
    @private
    @observes physicalStructure
  */
  _physicalStructureDidChange: function () {
    
    var phys = this.get('physicalStructure');
    
    // we already have a physical structure, no need for something else
    if (this.get('physicalStructureInitialised')) return;
    
    var url = Multivio.CDM.getReferer();

    Multivio.logger.debug('_physicalStructureDidChange,referer: ' + url +
                                                        ' phys: ' + phys[url]);
    Multivio.logger.debug('_physicalStructureDidChange, entering...');

    if (!SC.none(phys) && !SC.none(phys[url]) && phys[url].length > 0) {
      this.set('physicalStructureInitialised', YES);
      if (phys[url].length < 2 && 
          Multivio.getPath('views.searchPalette.contentView.innerSearch').
          get('childViews').length === 8) {
        var childToRemove = Multivio.getPath(
            'views.searchPalette.contentView.innerSearch.searchScopeView');
        Multivio.getPath('views.searchPalette.contentView.innerSearch').
            removeChild(childToRemove);
      }
      else {
        this.set('currentFileList', phys[url]);
        // select first file in list
        var file_url = phys[url][0].url;
        // TODO test
        //this.set('currentSearchFile', file_url);
      
        var dr = {};
        // init display properties for each file
        for (var i = 0; i < phys[url].length; i++) {
          dr[phys[url][i].url] = YES;
        }
        this.set('displayResults', dr);
      }
    }
  }.observes('physicalStructure'),
  
  /**
    When search file selection changes,
    load corresponding search results (if any).
    
    @private
    @observes currentSearchFile
  */
  _currentSearchFileDidChange: function () {
    
    var current_file = this.get('currentSearchFile');
    Multivio.logger.debug('currentSearchFile did change: ' + current_file);
    this._loadExistingSearchResultsForFile(current_file);
    
  }.observes('currentSearchFile'),
 
  
  /**
    When the master file selection changes,
    load corresponding search results (if any)
    
    @private
    @observes Multivio.masterController.currentFile
  */
  _currentFileDidChange: function () {
    var current_file = Multivio.masterController.get('currentFile');
    SC.RunLoop.begin();
    this.set('currentSearchFile', current_file);
    SC.RunLoop.end();
    Multivio.logger.debug('Multivio.masterController.currentFile did change: ' + current_file);
    
  }.observes('Multivio.masterController.currentFile'), 

  
  /**
    If results already exist for this file in the CDM, load them.
    Else, clear content.
    
    @private
    @param {String} url the url of the file
  */
  _loadExistingSearchResultsForFile: function (url) {
    
    // clear results' list
    this.set('content', []);
    
    Multivio.logger.debug("_loadExistingSearchResultsForFile: url:" + url);
    
    // look for existing stuff in the CDM
    var all_results = Multivio.CDM.get('searchResults');
    var new_results = {};    
        
    if (!SC.none(all_results) && !SC.none(all_results[url])) {
      new_results = Multivio.CDM.clone(all_results);
      SC.RunLoop.begin();
      this.set('_load_url', url);
      // this should trigger _searchResultsDidChange()
      this.set('searchResults', new_results); 
      SC.RunLoop.end();
    }
    
  },

  /**
    When the selection of the search result changes, we switch 
    to the corresponding page of the content, if needed.
    
    @private
    
    @return {Boolean} true if selection change sucessful
    
    @observes selection
  */
  _selectionDidChange: function () {
    
    // TODO: is it possible to detect the case when we come here from initialize()
    // and thus avoid jumping back to the current ?
    
    var selSet = this.get('selection');
    var selectedObject = selSet.firstObject();
    
    // store selection for later use. Storage must be done in master
    // controller, because if there is a file change, the search controller
    // will be reinitialised and the selection will be lost
    Multivio.masterController.set('currentSearchResultSelectionIndex',
                                            this.indexOf(selectedObject));
    
    if (SC.none(selectedObject)) return NO;
    
    // if necessary, switch to the corresponding document
    // WARNING: changing master's currentFile initialises controllers anew.
    // in initialize(), check for existing results in CDM
    var current_search_file = this.get('currentSearchFile');
    var current_master_file = Multivio.masterController.get('currentFile');
    
    Multivio.logger.debug("selectionDidChange: current: " + 
                                              current_search_file);
    Multivio.logger.debug("selectionDidChange: master: " + 
                                              current_master_file);
    
    if (current_master_file !== current_search_file) {
      SC.RunLoop.begin();
      Multivio.masterController.set('currentFile', current_search_file);
      SC.RunLoop.end();
    }
        
    // change master's currentPosition so that we 'jump' to the place 
    // in the content where the search result points
    SC.RunLoop.begin();
    Multivio.logger.debug("selectionDidChange: switching to page: " + 
                                              selectedObject.page_number);                                              
    Multivio.masterController.set('currentPosition', 
                                              selectedObject.page_number);
    SC.RunLoop.end();
    
    return YES;
    
  }.observes('selection'),

  /**
    Update the message status for search information.
  
    @private
  */
  _updateSearchStatus: function () {
    
    var selSet = this.get('selection');
    var selectedObject = selSet.firstObject();
    var selectedIndex = this.indexOf(selectedObject);
    
    // display selection index in search status
    // note: assuming indexOf() always returns -1 when nothing is selected
    SC.RunLoop.begin();
    this.set('searchStatus', '_resultSelection'.loc(selectedIndex + 1,
                                                    this.get('length')));
    SC.RunLoop.end();
    
  },

  /**
    Return a highlight zone (which is inside a search result),
    given by its index in the array.
    
    @param {Number} index
    @return {SC.Object} the zone object
  */
  getZone: function (index) {
    return this.objectAt(index);
  },

  /**
    Perform a search by sending a request to the server.
    The previous search results are cleared and the list of results is updated.
    
    @return {Boolean} true if search successful
  */
  doSearch: function () {
    
    // store last search query for later use
    var query = this.get('currentSearchTerm');
    this.set('lastSearchQuery', query);
    
    // clear previous results
    this.clearResults();
    
    // discard empty strings
    if (SC.none(query) || SC.empty(query.trim())) return NO;
    
    SC.RunLoop.begin();
    this.set('searchStatus', '_searchInProgress'.loc());
    SC.RunLoop.end();
    
    Multivio.logger.debug('SearchController.doSearch("%@")'.fmt(query));
    
    // get rotation angle
    var angle = this.get('rotateValue');
    
    // get current file url for searching
    var url = this.get('currentSearchFile');
    
    // TODO: query multivio server: context size=15, max_results=50
    // Note: this triggers _searchResultsDidChange(), only the first time the server response is received
    var res = Multivio.CDM.getSearchResults(url, query, '', '', 15, 50, angle);
        
    // store results
    // NOTE: artificially trigger _searchResultsDidChange() 
    // by setting searchResults (needs a cloned instance)
    var all_res = this.get('searchResults') || {};
    var new_res = Multivio.CDM.clone(all_res);
    new_res[url] = res;

    SC.RunLoop.begin();
    var nd = this.get('displayResults');
    nd[url] = YES;
    this.set('displayResults', nd);
    this.set('_load_url', url);
    this.set('searchResults', new_res);
    SC.RunLoop.end();
     
    return YES;
  },

  /**
    Clear all current search results (ie. for current file only).
  */
  clearResults: function () {

    Multivio.logger.debug('SearchController.clearResults()');

    var cf = this.get('currentSearchFile');
    var all_results = Multivio.CDM.get('searchResults');
    var new_results = {};

    // clear search results stored in CDM
    if (!SC.none(all_results) && !SC.none(all_results[cf])) {
      Multivio.logger.debug("clearing...");
      new_results = Multivio.CDM.clone(all_results);
      new_results[cf] = undefined;
      SC.RunLoop.begin();
      Multivio.CDM.set('searchResults', new_results);
      SC.RunLoop.end();
    }

    // clear local array
    this.set('content', []);
    var url = this.get('currentSearchFile');

    // set display flag to false for this file
    var nd = this.get('displayResults');
    nd[url] = NO;
    SC.RunLoop.begin();
    this.set('displayResults', nd);
    SC.RunLoop.end();
  },

  /**
    When clear button is pressed, clear all current search results
    (ie. for current file only) and clear query field.
  */
  doClear: function () {

    Multivio.logger.debug('SearchController.doClear()');

    this.clearResults();

    SC.RunLoop.begin();
    this.set('currentSearchTerm', '');
    this.set('searchStatus', '');
    SC.RunLoop.end();
  },
  
  /**
    When search results change, load the new results.
    If there is a result selection, try to restore it after the results
    are loaded. This happens when the user rotates the content while
    a search result is selected.

    @private
    @observes searchResults
  */
  _searchResultsDidChange: function () {
    
    // TODO: check if there is a difference in the results to
    // avoid calling _setSearchResults() for nothing ?
    
    // get search results and url to store them for
    var res = this.get('searchResults');
    var url = this.get('_load_url');
    var current_url = (SC.none(url)? this.get('currentSearchFile') : url);
    var query = this.get('lastSearchQuery');
    
    Multivio.logger.debug("_searchResultsDidChange: res:" + res);
    
    // use the current url as key for storage    
    var key = current_url;
    
    // clear load_url 
    this.set('_load_url', undefined);
    
    // do nothing if we don't have to display the results
    if (!this.get('displayResults')[current_url]) return;
    
    // if there are results, store them
    if (!SC.none(res) && !SC.none(res[key])) {
      
      SC.RunLoop.begin();
      this._setSearchResults(res[key], query);

      // get the latest stored selection (previous before reinit)
      var sel = this.get('selectedIndex');

      Multivio.logger.debug("_searchResultsDidChange, selected index: " + sel);
      
      //if there previously was a selection, set it as selected again
      if (!SC.none(sel) && sel !== -1) {
        var newSel = SC.SelectionSet.create();
        newSel.addObject(this.objectAt(sel));
        Multivio.logger.debug("restore previous selection after new results");
        this.set('selection', newSel);
        // update master selection index
        Multivio.masterController.set('currentSearchResultSelectionIndex', sel);
      }
      SC.RunLoop.end();
      
      // warn user if results truncated because limit was reached
      /*if (res[key].max_reached > 0) {
        Multivio.usco.showAlertPaneInfo('_tooManyResults'.loc(), 
          '_firstOccurrences'.loc(res[key].max_reached), 'OK');
      }*/
      
    }
    
  }.observes('searchResults'),
  
  /**
    Store the search results (if any) by creating new highlight zones
    and computing coordinates according to the current zoom.

    @private
    @param {Object} res -- the search results
    @param {String} query -- the search query used
  */
  _setSearchResults: function (res, query) {
   
    // if there are results                                         
    if (res !== -1 && !SC.none(res)) {
      var num_res = res.file_position.results.length;
      
      // warn user if no result found
      if (num_res === 0) {
        /*Multivio.usco.showAlertPaneInfo('_noSearchResultTitle'.loc(), 
          '_noSearchResultDesc'.loc(), 'OK');*/
        SC.RunLoop.begin();  
        this.set('searchStatus', '_noResult'.loc());  
        SC.RunLoop.end();
      } else {
        SC.RunLoop.begin();  
        this.set('searchStatus', '');  
        SC.RunLoop.end();
      }
      
      var a = null, b  = null, c = null;
      for (var i = 0; i < num_res; i++) {
        a = res.file_position.results[i];
        b = a.index;
        c = b.bounding_box;

        this.addSearchResult(query, a.preview,
                             c.y1, c.x1, 
                             Math.abs(c.x1 - c.x2),
                             Math.abs(c.y1 - c.y2), b.page,
                             this.get('zoomFactor'));
      }
      
      // update search status
      //this._updateSearchStatus();
      
      // TODO: add number of search results to some nodes:
      //      (which ones? all ? ...)
      //var treeItems = Multivio.treeController.get('arrangedObjects');
      //Multivio.logger.debug("treeItems: " + treeItems);
    
      // TODO: test, set number for first tree element 
      // --> OK, works
      //if (!SC.none(treeItems) && treeItems.length > 0) {
        //Multivio.logger.debug("setting number of search results on page " +
        //   treeItems.objectAt(0).file_position.index);
        //treeItems.objectAt(0).setSearchResultsNumber(num_res);
      //}
      
      // select first result
      // TODO: note: this will trigger a selectionDidChange, which in turn will change
      // back to the current searched document, which makes it impossible to switch files from the treeview...
      //this.goToFirstResult();
    }
  },

  /**
    Selects the first search result.
  */
  goToFirstResult: function () {
    var sel = this.get('selection');
    var selObj = sel.firstObject();
    var newSel = SC.SelectionSet.create();
    
    Multivio.logger.debug("goToFirstResult");
    
    // select first item
    newSel.addObject(this.objectAt(0));
    SC.RunLoop.begin();
    this.set('selection', newSel);
    SC.RunLoop.end();
  },

  /**
    Selects the next search result.
    If none selected, selects the first one.
    If the last search result is selected, executing goToNextResult()
    will select the first element.
  */
  goToNextResult: function () {
    var sel = this.get('selection');
    var selObj = sel.firstObject();
    var newSel = SC.SelectionSet.create();
    var l = this.get('length');
    
    Multivio.logger.debug("goToNextResult");
    
    // select first item if none selected,
    if (sel.get('length') === 0) {
      this.goToFirstResult();
    } else { // otherwise, next element in array 
            // (go back to first element after reaching last)
      var currentIndex = this.indexOf(selObj, 0);
      var nextObject = this.objectAt(++currentIndex % l);
      newSel.addObject(nextObject);
      SC.RunLoop.begin();
      this.set('selection', newSel);
      SC.RunLoop.end();
    }
  },
  
  /**
    Selects the previous search result.
    If none selected, selects the last one.
    If the first search result is selected, executing goToPreviousResult()
    will select the last element.
  */
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

  /**
    Adds a new search result by first creating a highlight zone and then
    adding label and context information to it. 
  */
  addSearchResult: function (label, context, top_, left_, width_, height_, page_, current_zoom_factor) {
    
    SC.RunLoop.begin();

    // first, add a highlight zone
    var new_hl = this.addHighlight(top_, left_, width_, height_,
                                  page_, 'search', current_zoom_factor, YES);

    // then insert additional search information 
    // (assuming the addHighlight above was successful...)
    if (!SC.none(new_hl)) {
      new_hl.label = label;
      new_hl.context = context;
    } else {
      Multivio.logger.debug("Warning: cannot retrieve label and context ...");
    }
    
    SC.RunLoop.end();
  },

  /**
    Initialize the search controller, its content (array of search results).

    @param {String} url
  */
  initialize: function (url) {
  
    // set referer url
    this.set('url', Multivio.CDM.getReferer());

    // physical structure not yet initialised
    this.set('physicalStructureInitialised', NO);

    // get previous selected item
    // (when the controller has been reinitialised after a file change)
    var mi = Multivio.masterController.
                                  get('currentSearchResultSelectionIndex');
    // initialise content                              
    this.set('content', []);
    
    // restore previous selection if there was one
    if (mi !== -1) {
      this.set('selectedIndex', mi);
    }
    // TODO: ? or replace the above by directly setting selection after _loadExisting ?

    // check for existing results in CDM
    // NOTE: use 'url' arg of file, and not the referer 
    // (as it can point to a document with multiple files)    
    this._loadExistingSearchResultsForFile(url);
    
    /*var newSel = SC.SelectionSet.create();
    newSel.addObject(this.objectAt(mi));
    Multivio.logger.debug("initialize: restore previous selection after new results");
    this.set('selection', newSel);*/
    
    Multivio.sendAction('addComponent', 'searchController');
    Multivio.logger.info('searchController initialized with url:' + url);
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
Multivio.searchController    = Multivio.SearchController.create();