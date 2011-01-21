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
    Note: this value is not bound, it is given by the view 
    when the rotation changes.

  */
  rotateValue: undefined,      
  //rotateValueBinding: 
  //      SC.Binding.oneWay('Multivio.rotateController.currentValue'),

  /** 
    List of all files of the document, taken from the physical structure.
    
    @property {SC.Array}
    
    @default undefined
  */  
  currentFileList: undefined,

  /**
    Physical structure of the document, contains the files' urls and labels.

    NOTE: this property is bound manually in initialize() to avoid conflicts
    between child and parent classes (SearchController & HighlightController).
    
    @binding {Object}
  */
  physicalStructure: undefined,
  //physicalStructureBinding: 
  //              SC.Binding.oneWay('Multivio.CDM.physicalStructure'),

  /**
    Read selected text from CDM, only for non-empty values
    (not null, undefined or empty string).
  */
  selectedText: undefined,
  selectedTextBinding: SC.Binding.
                          oneWay('Multivio.CDM.selectedText').
                          notNull().notEmpty(),

  /**
    Selected text, string only
   
    @property {SC.String}
    @default undefined
  */
  selectedTextString:  undefined,

  /**
    When the content changes, get the text located inside the selection.
    
    @observes Multivio.selectionController.[]
  */
  contentDidChange: function () {
      
    if (this.get('length') === 0) return;
    
    Multivio.selectionController.getSelectedText();
    
  }.observes('Multivio.selectionController.[]'),
  

  /**
    Receive the selected text from the CDM and
    store it in the highlight object.

    NOTE: as of now, only using the first object, ignoring any additional
    objects.
    
  */
  selectedTextDidChange: function () {
    
    var url = Multivio.masterController.get('currentFile');
    var t = this.get('selectedText')[url];
    
    if (SC.none(t)) return;
    
    Multivio.logger.debug('selectedTextDidChange: "' + t.text + '"');
    
    if (Multivio.selectionController.get('length') === 0) {
      Multivio.logger.debug('selectedTextDidChange: no object to store text');
      return;
    }
    
    // store text
    Multivio.selectionController.objectAt(0).text = t.text;
    Multivio.selectionController.set('selectedTextString', t.text);
    
    // clear value in CDM so a new request will be sent to the server
    // for the next selection
    Multivio.CDM.set('selectedText', undefined);
        
  }.observes('selectedText'),

  /**
    Returns the text located inside all the highlight zones.
    For each zone, the corresponding text is stored in the highlight object
    in the 'text' field.
    
    NOTE: for now, only considering the first zone, if there are several.
    
    @returns {String} the selected text
    
  */
  getSelectedText: function () {
    
    if (this.get('length') === 0) return '';
    
    var t = '', z = this.objectAt(0);
        
    // get original coordinates of zone (unzoomed)    
    var o = z.original;
    var x1 = o.left, y1 = o.top, x2 = x1 + o.width, y2 = y1 + o.height;
    
    // NOTE: always call getText on unzoomed, unrotated content (normalisation)
    var angle = 0; //this.get('rotateValue');
    
    // send request to server to get text
    // NOTE: coordinates are original, unrotated
    t = Multivio.CDM.getSelectedText(z.url, z.page_number, 
                                     x1, y1, x2, y2, angle);
    
    return t;
    
  },

  /**
    Select the text field on the view that contains the text selection,
    so that it can be copied by the browser on ctrl + c.
  */
  selectTextField: function () {
    
    var t = this.get('selectedTextString');
    
    // ignore empty text selections
    if (SC.none(t) || t === '') return;
    
    // TODO test store current scroll position on the view
    var w = Multivio.getPath('views.mainContentView.content.innerMainContent'),
        h = w.get('horizontalScrollOffset'),
        v = w.get('verticalScrollOffset');
    
    Multivio.logger.debug('selectTextField, store scroll position: v: %@, h: %@'.fmt(v, h));
    
    var selected_text_field = SC.$('label#selected_text')[0]
      .childNodes[1].childNodes[0];
     
    // focus and select text field, so that it can be copied by the browser
    // when pressing ctrl/apple + c  
    selected_text_field.focus();
    selected_text_field.select();
    
    // TODO test update scroll position back (firefox scrolls up to textfield)
    w = Multivio.getPath('views.mainContentView.content.innerMainContent');
    //h = w.get('horizontalScrollOffset');
    //v = w.get('verticalScrollOffset');
    //Multivio.logger.debug('selectTextField, before restore: v: %@, h: %@'.fmt(v, h));
    w.set('horizontalScrollOffset', h);
    w.set('verticalScrollOffset', v);

    w.set('layerNeedsUpdate', YES);

  },

  /**
    Returns the line to which the point belongs, according to the
    page indexing. If page indexing does not exist, returns -1.
    
    NOTE: the given coordinates must be on the unzoomed, unrotated content.
    
    @param x x-coordinate of the point
    @param y y-coordinate of the point
    @returns {SC.Object} the indexed line
  
  */
  getSelectionLineAtPoint: function (x, y) {
    
    var pi = this._getPageIndexing();
    
    // no page indexing available
    if (SC.none(pi) || pi === -1) return -1;
    
    // select the lines of the current page
    var current_page = Multivio.masterController.get('currentPosition');
    var lines = pi.pages[current_page].lines;
    
    var l;
    for (var i = 0; i < lines.length; i++) {
      l = lines[i];
      if (y >= l.t && y <= (l.t + l.h)) {
        
        Multivio.logger.debug('getSelectionLineAtPoint: "%@" at line %@ ' +
            '(tlwh:%@,%@,%@,%@) for given point (%@,%@)'.
            fmt(l.text, i, l.t, l.l, l.w, l.h, x, y));
        
        return l;
      }
      
    }
    
  },

  /**
    Returns the zones of the words encased in the given points, with respect
    to the lines defined in the page indexing.
    If page indexing does not exist, returns -1.
    
    The result is given as a list of zones which contains words:
    
      [{top, left, width, height, page_nr, file_url},{idem}, ...]
    
    Each line is represented by a single zone, with the words contained in
    the selection. 
    
    NOTE: the given coordinates must be on the unzoomed, unrotated content.
    
    @param x1 upper-left point of the selection, x-coordinate
    @param y1 upper-left point of the selection, y-coordinate
    @param x2 lower-right point of the selection, x-coordinate
    @param y2 lower-right point of the selection, y-coordinate
    @returns {SC.Array} the list of words
  */
  getSelectionsOnLinesBetweenPoints: function (x1, y1, x2, y2) {
    
    Multivio.logger.debug('getSelectionsOnLinesBetweenPoints(%@,%@,%@,%@)'.fmt(x1, y1, x2, y2));
    
    // discard too small selections
    if (Math.abs(x2 - x1) < 3 || Math.abs(y2 - y1) < 3) return;
    
    var pi = this._getPageIndexing();
    
    // no page indexing available :/
    if (SC.none(pi) || pi === -1) return -1;
    
    // build result structure
    var result = [];
    
    // select the lines of the current page
    var current_page = Multivio.masterController.get('currentPosition');
    var lines = pi.pages[current_page].lines;

    // parse lines, search for the first selected one
    var l, start = -1, stop = -1;
    for (var i = 0; i < lines.length; i++) {
      l = lines[i];
      
      Multivio.logger.debug('current line, tlwh: (%@,%@,%@,%@): "%@"'.fmt(l.t, l.l, l.w, l.h, l.text));
      
      // found the first line
      if (start === -1 && y1 <= l.t && y2 >= l.t) {
        start = i;
        Multivio.logger.debug('line selection start');
      } 
      
      // found the last line
      if (start !== -1 && stop === -1 && y2 <= (l.t + l.h)) {
        
        stop = i;
        Multivio.logger.debug('line selection stop');
        result.addObject(l);
        // TODO parse words
        /*while (YES) {
          
        }*/
        break;
      
      }

      // a line between start and stop of selection        
      if (start !== -1 && stop === -1) {
        Multivio.logger.debug('line selection continue');
        result.addObject(l);
      }
      
    }
    
    return result;
    
  },

  /**
    When the master file position (page) changes,
    get the corresponding indexing. This is used for the text selection.
    
    @private
    @observes Multivio.masterController.currentPosition
  */
  _currentPositionDidChange: function () {
  
    Multivio.logger.debug('_currentPositionDidChange');
    this._getPageIndexing();
  
  }.observes('Multivio.masterController.currentPosition'),
  /**
    When the master file selection changes,
    get the corresponding indexing. This is used for the text selection.
    
    @private
    @observes Multivio.masterController.currentFile
  */
  _currentFileDidChange: function () {

    Multivio.logger.debug('_currentFileDidChange');
    this._getPageIndexing();      

  }.observes('Multivio.masterController.currentFile'), 

  _getPageIndexing: function () {
    
    // do not send request if the application is not ready
    // TODO better solution?
    if (Multivio.firstResponder !== Multivio.READY) {
      return;
    }
    
    Multivio.logger.debug('_getPageIndexing from: ' + this);
    
    var current_file = Multivio.masterController.get('currentFile');
    var page_nr = Multivio.masterController.get('currentPosition') || 1;

    var file_list = this.get('currentFileList');
    
    if (SC.none(file_list)) {
      Multivio.logger.debug('_getPageIndexing: no file list, skipping: ' + file_list);
      return;
    }
    
    var num_files = file_list.length;
    var ref_url = this.get('url');
    
    Multivio.logger.debug('_getPageIndexing, url: ' + current_file);

    // test that it's not the referer url, in case of several files
    if (num_files > 1 && current_file === ref_url) {
      Multivio.logger.debug('_getPageIndexing: ref_url, skipping');
      return;
    }

    // query the server
    if (!SC.none(current_file) && !SC.none(page_nr)) {
      return Multivio.CDM.getPageIndexing(current_file, page_nr, undefined, undefined);
    }
    
    return undefined;
    
  },

  /**
    When the physical structure changes, extract file list (labels + urls)
    from it, store as a flat list.
    
    @private
    @observes physicalStructure
  */
  _physicalStructureDidChange: function () {
    
    Multivio.logger.debug('_physicalStructureDidChange, first (%@)'.fmt(this));
    
    var phys = this.get('physicalStructure');
    
    // we already have a physical structure, no need for anything else
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
            
        Multivio.logger.debug('_physicalStructureDidChange, removing scope');
        Multivio.logger.debug('_physicalStructureDidChange, url: ' + 
                                                            phys[url][0].url);
        // init search file to the single file
        this.set('currentSearchFile', phys[url][0].url);
        
        // init file list with one element
        this.set('currentFileList', [phys[url][0]]);
        
        var childToRemove = Multivio.getPath(
            'views.searchPalette.contentView.innerSearch.searchScopeView');
        Multivio.getPath('views.searchPalette.contentView.innerSearch').
            removeChild(childToRemove);
      }
      else {
        
        // add 'All files' search option to file list
        var fileList = Multivio.CDM.clone(phys[url]);
        fileList.insertAt(0, {'label': '_AllFiles'.loc(), 'url': url});
        this.set('currentFileList', fileList);        
      
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
    @param {String} url url of the file the highlight belongs to
    @return {SC.Object} the created highlight zone
  */
  addHighlight: function (top_, left_, width_, height_, page_, type_,
                                      current_zoom_factor, is_original,
                                      url) {

    // discard zones that are too small
    if (width_ <= this.minimalZoneDimension ||
       height_ <= this.minimalZoneDimension) return null;
    
    // dimensions and position of zone according to 
    //the current zoom factor
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

    // store original and compute coordinates according to current zoom
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
      var original_zone = this._getOriginalZone(received_zone, current_zoom_factor);
      // compute unrotated coordinates here before storing
      var angle = this.get('rotateValue');
      original_zone = this.getUnrotatedCoords(original_zone, angle);
      
      new_obj = { 
        page_number: page_, 
        type: type_,
        current: received_zone, 
        original: original_zone 
      };  
      
    }

    // add url information
    new_obj.url = url;

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
    Update the coordinates of all highlight zones according to new angle.
    
    @observes rotateValue
  */
  rotateValueDidChange: function () {
    
    this.updateCoordinates(NO, YES);
    
  }.observes('rotateValue'),

  /**
    Update the coordinates of all highlight zones according to new zoom factor.
    
    @observes zoomFactor
  */
  zoomFactorDidChange: function () {
        
    this.updateCoordinates(YES, NO);
    
  }.observes('zoomFactor'),

  /**
    Compute the position and dimension of a zone as it is on the
    unzoomed content, based on its current data and the zoom factor
    at which said data was recorded.
    
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
    Update the coordinates of all highlight zones according to
    the rotation angle.
    
    To update the zones' coordinates:
    
    (1) take coordinates on the page (native size, unzoomed and no rotation)
    (2) compute rotated coordinates
    (3) apply zoom factor

    NOTE: only handling the highlight zones on the current page
    of the current file, the other ones are not updated

  */
  updateCoordinates: function (zoom_update_needed, rotation_update_needed) {
    
    // get rotation angle for update
    var angle = this.get('rotateValue');
    
    // get zoom factor for update
    var zoom_factor = this.get('zoomFactor');
    
    Multivio.logger.debug('updateCoordinates, angle:' + angle);
    Multivio.logger.debug('updateCoordinates, zoom_factor: ' + zoom_factor);
    
    // get page width and height
    // NOTE: only handling the highlight zones on the current page
    // of the current file, the other ones are not updated
    var file_url = Multivio.masterController.get('currentFile');
    var page_number = Multivio.masterController.get('currentPosition');
                            
    if (SC.none(file_url) || SC.none(page_number)) {
      return;
    }
    
    var url = 'page_nr=%@&url=%@'.fmt(page_number, file_url);
    var native_size = Multivio.CDM.getImageSize(url);
    
    var l = this.get('length'), c, o, z;  
    while (--l >= 0) {
      // get a zone
      z = this.getZone(l);
      
      // Only update the zone if it is located
      // on the current page.
      if (z.page_number !== page_number) continue;
      
      c = z.current;
      o = z.original;
      
      // compute new coordinates according to current angle
      // and original coordinates
      c = this.getRotationCoords(o, angle, native_size);
                                      
      // apply zoom factor on rotated coordinates
      c = this._getCurrentZone(c, zoom_factor);
                                                  
      z.current = c;
            
    }
  },
  
  /**
    Compute rotation values according to angle.
    Adapt coordinates according to given rotation angle and page size.
              Only orthogonal rotations are supported:
                                    0, +-90, +-180, +-270 degrees.
    
    NOTE: the input coordinates should always be given in a non-rotated
          form (angle = 0).
  
    @param {SC.Object} zone original coordinates (native size), unrotated
    @param {Number} angle rotation angle
    @param {SC.Object} native_size page width and height
    @return {SC.Object} zone coordinates rotated
          
  */
  getRotationCoords: function (original_zone, angle, native_size) {
        
    var page_width =  native_size.width;
    var page_height = native_size.height;
    
    var out_x1, x1 = original_zone.left;
    var out_y1, y1 = original_zone.top;
    var out_x2, x2 = x1 + original_zone.width;
    var out_y2, y2 = y1 + original_zone.height;
    
    // rotation to the right
    if (angle === -90 || angle === 270) {
      out_x1 = Math.max(0, page_height - y2);
      out_y1 = x1;
      out_x2 = Math.max(0, page_height - y1);
      out_y2 = x2;
      
    } // rotation to the left
    else if (angle === 90 || angle === -270) {
      out_x1 = y1;
      out_y1 = Math.max(0, page_width - x2);
      out_x2 = y2;
      out_y2 = Math.max(0, page_width - x1);
      
    } // rotation upside-down
    else if (angle === -180 || angle === 180) { 
      out_x1 = Math.max(0, page_width - x2);
      out_y1 = Math.max(0, page_height - y2);
      out_x2 = Math.max(0, page_width - x1);
      out_y2 = Math.max(0, page_height - y1);  
      
      // no rotation
    } else {
      out_x1 = x1;
      out_y1 = y1;
      out_x2 = x2;
      out_y2 = y2;
    }
    
    return {
      left:   out_x1,
      top:    out_y1,
      width:  Math.abs(out_x2 - out_x1),
      height: Math.abs(out_y2 - out_y1)
    };
  },
  
  /**
    Given coordinates on a rotated content (angle !== 0),
    this function returns the coordinates unrotated (angle = 0).
    
    @param {SC.Object} zone coordinates (native size), rotated
    @param {Number} angle rotation angle
    @return {SC.Object} zone coordinates unrotated
  */
  getUnrotatedCoords: function (zone, angle) {
    
    var new_zone = zone;
    
    if (angle === 0) return new_zone;

    var file_url = Multivio.masterController.get('currentFile');
    var page_number = Multivio.masterController.get('currentPosition');
                            
    if (SC.none(file_url) || SC.none(page_number)) {
      return;
    }
    
    var url = 'page_nr=%@&url=%@'.fmt(page_number, file_url);
    var native_size = Multivio.CDM.getImageSize(url);
    var ns = native_size;
    
    // switch height and width for "horizontal" case
    if (Math.abs(angle) === 90 || Math.abs(angle) === 270) {
      ns = {width: native_size.height, height: native_size.width};
    }
    new_zone = this.getRotationCoords(new_zone, -angle, ns);
        
    return new_zone;
    
  },
  
  /**
    Initialize the controller, and its content.
    
    @param {String} url
  */
  initialize: function (url) {
    
    Multivio.logger.info('selectionController:: initialize()');
    
    // init content to an empty array
    this.set('content', []);
    
    // physical structure not yet initialised (do it only once)
    this.set('physicalStructureInitialised', NO);
    
    // NOTE: manually binding to avoid conflicts with searchController
    // which is a child class
    this.bind('physicalStructure', 'Multivio.CDM.physicalStructure');
    
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
    Binds to the search results stored in the CDM.
    This binding is read only.
    
    @binding {Object}
  */
  searchResults: undefined,
  searchResultsBinding: SC.Binding.oneWay('Multivio.CDM.searchResults'),
  
  /** 
    String representing the search status
    (search in progress, number found results...) used to inform the user.

    @property {SC.String}

    @default ''
  */  
  searchStatus: '', 
  
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
        
    var selSet = this.get('selection');
    var selectedObject = selSet.firstObject();
    var selIndex = this.indexOf(selectedObject);
    
    Multivio.logger.debug("_selectionDidChange: index: " + selIndex);
    Multivio.logger.debug("_selectionDidChange: object: " + selectedObject);
    
    // store selection for later use. Storage must be done in master
    // controller, because if there is a file change, the search controller
    // will be reinitialised and the selection will be lost
    if (selIndex !== -1) {
      Multivio.logger.debug("_selectionDidChange: index not -1: " + selIndex);
      Multivio.masterController.set('currentSearchResultSelectionIndex', 
                                                                selIndex);
      // notify view of change
      Multivio.getPath('views.mainContentView.content.innerMainContent' + 
          '.contentView.highlightpane').searchResultSelectionIndexDidChange();
    } 
    
    // store current search file in master controler, so
    // that we don't lose this information in case we need to switch
    // files and this controller is reinitialised
    Multivio.logger.debug("### selectionDidChange: store url in master: " +
                                                this.get('currentSearchFile'));
    Multivio.masterController.set('currentSearchFile', 
                                  this.get('currentSearchFile'));
    
    if (SC.none(selectedObject)) {
      return NO;
    }
    
    Multivio.logger.debug("### selectionDidChange: url: " + selectedObject.url);
    
    // if necessary, switch to the corresponding document
    // WARNING: changing master's currentFile initialises controllers anew.
    // in initialize(), check for existing results in CDM
    var current_search_file = this.get('currentSearchFile');
    var current_master_file = Multivio.masterController.get('currentFile');
    var ref_file            = this.get('url');
    
    Multivio.logger.debug("selectionDidChange: current: " + 
                                              current_search_file);
    Multivio.logger.debug("selectionDidChange: master: " + 
                                              current_master_file);
    
    //if (current_master_file !== current_search_file) {
    if (current_master_file !== selectedObject.url) {
      SC.RunLoop.begin();
      Multivio.logger.debug("selectionDidChange: switching to file: " + 
                                                selectedObject.url);
      Multivio.masterController.set('currentFile', selectedObject.url);
      
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
    Set the current selection to the object corresponding to the given index.
    
    @param {Number} index the number of the selected search result.
                    First item of list has index 0.
    
  */
  setSelectionIndex: function (index) {
    
    Multivio.logger.debug("setSelectionIndex " + index);
    
    var newSel = SC.SelectionSet.create();
    newSel.addObject(this.objectAt(index));
    this.set('selection', newSel);
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
    
    Multivio.logger.debug('SearchController.doSearch("%@"), file: %@'.
                                fmt(query, this.get('currentSearchFile')));
    
    // get rotation angle
    // NOTE: don't use current angle, we want to obtain the unzoomed,
    // unrotated content and all computations are done on the client
    var angle = 0; //this.get('rotateValue');
    
    // get current file url for searching
    var url = this.get('currentSearchFile');
    var ref_url = this.get('url');
    var res = undefined;
    
    // If this is the referer url, 'search all files' option was
    // selected. Send a request for each file, and store them all in 
    // Multivio.CDM.searchResults[<referer_url>]
    if (url === ref_url) {
      Multivio.logger.debug('doSearch ALL: referer url: ' + url);
      
      // get list of all urls and send request
      // idea: each time search results change, we rebuild the complete list in
      // Multivio.CDM.searchResults[<referer_url>], in the order of the files
      // as they appear in the list.
      var file_list = this.get('currentFileList');
      for (var i = 0; i < file_list.length; i++) {
        
        // don't send request for referer url,
        // except if there's only one file
        if (file_list.length > 1 && file_list[i].url === ref_url) continue;
        
        Multivio.logger.debug('ALL: sending request for url: ' +
                                                     file_list[i].url);
        res = Multivio.CDM.getSearchResults(file_list[i].url, query, 
                                              '', '', 15, 50, angle);
                                              
        
      }
    } else {
      // query multivio server: context size=15, max_results=50
      // Note: this triggers _searchResultsDidChange(), 
      // only the first time the server response is received
      res = Multivio.CDM.getSearchResults(url, query, '', '', 15, 50, angle);
    }
        
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
    // store url so we know which one to load later on
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
    var rf = this.get('url');
    var all_results = Multivio.CDM.get('searchResults');
    var new_results = {};

    // if referer url is selected, clear all results
    if (rf === cf) {
      new_results = undefined;
      Multivio.logger.debug("clearing all...");
      SC.RunLoop.begin();
      Multivio.CDM.set('searchResults', new_results);
      SC.RunLoop.end();
    } else if (!SC.none(all_results) && !SC.none(all_results[cf])) {       
      // clear search results stored in CDM for a specific url
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
        
    // get search results and url to store them for
    var res = this.get('searchResults');
    var url = this.get('_load_url');
    var current_url = (SC.none(url)? this.get('currentSearchFile') : url);
    var query = this.get('lastSearchQuery');
    
    Multivio.logger.debug("_searchResultsDidChange: (1) res:" + res);
    Multivio.logger.debug("_searchResultsDidChange: (2) url:" + current_url);
    
    // use the current url as key for storage    
    var key = current_url;
    
    // debug info
    var ref_url = this.get('url');
    if (key === ref_url) {
      Multivio.logger.debug('_searchResultsDidChange: (3) REF URL HERE');
    }
    
    // clear load_url 
    this.set('_load_url', undefined);
    
    // do nothing if we don't have to display the results
    // NOTE: take ref_url into account
    if (!this.get('displayResults')[current_url] && current_url !== ref_url) {
      Multivio.logger.debug('_searchResultsDidChange, do not display url: ' +
                                                                  current_url);
      return;
    }
    
    // if there are results, store them
    // first, handle case for all results
    if (!SC.none(res) && (!SC.none(res[key]) || key === ref_url)) {
      
      Multivio.logger.debug('_searchResultsDidChange, (4) stuff to do...');
      
      SC.RunLoop.begin();
      // concat all results
      if (key === ref_url) {
        var file_list = this.get('currentFileList');
        var res_all = [];
        
        Multivio.logger.debug('_searchResultsDidChange, (5) concat all results...');
        
        // clear all results before adding the whole again
        this.set('content', []);
        
        for (var i = 0; i < file_list.length; i++) {
          
          Multivio.logger.debug('_searchResultsDidChange, (6) url: ' + file_list[i].url);
          
          // skip referer url, except if there's only one file
          if (file_list.length > 1 && file_list[i].url === ref_url) continue;
          
          // store results separately for each file
          this._setSearchResults(res[file_list[i].url], query);
          
          // need to update global list in searchResults[ref_url] too
          res_all.pushObject(res[file_list[i].url]);
          
        }
        SC.RunLoop.begin();
        Multivio.logger.debug('_searchResultsDidChange (7), setting all results');
        res[ref_url] = res_all;
        Multivio.CDM.set('searchResults', res);
        SC.RunLoop.end();
      } else {
        // if for a specific file, store results as is
        this._setSearchResults(res[key], query);
      }
      
      // get the latest stored selection (previous before reinit) from master
      //var sel = this.get('selectedIndex');
      var sel = Multivio.masterController.
                                    get('currentSearchResultSelectionIndex');
      
      Multivio.logger.debug("_searchResultsDidChange, selected index: " + sel);
      
      //if there previously was a selection, set it as selected again
      if (!SC.none(sel) && sel !== -1) {
        //SC.RunLoop.begin();
        var newSel = SC.SelectionSet.create();
        var selectedObject = this.objectAt(sel);

        Multivio.logger.debug(
          "_searchResultsDidChange restore previous selection after new results: " +
           selectedObject);

        newSel.addObject(selectedObject);
        
        if (!SC.none(selectedObject)) {
          Multivio.logger.debug('_searchResultsDidChange restore selection, context: ' +
           selectedObject.context);
          SC.RunLoop.begin();
          this.set('selection', newSel);
          SC.RunLoop.end();
        }
        
        // update master selection index
        //Multivio.masterController.set('currentSearchResultSelectionIndex', sel);
        //SC.RunLoop.end();
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
   
    Multivio.logger.debug("_setSearchResults, res: " + res);
   
    // if there are results                                         
    if (res !== -1 && !SC.none(res)) {
      
      // get total number of search results, not for this file only
      Multivio.logger.debug('counting all search results');
      var num_all_res, num_res = res.file_position.results.length;
      var all_res = this.get('searchResults')[this.get('url')];
      num_all_res = num_res;
      // NOTE: don't take 'All Files' into account
      var num_files = this.get('currentFileList').length - 1;
      for (var j = 0; j < num_files; j++) {
        
        if (SC.none(all_res) || SC.none(all_res[j])) continue;
        
        num_all_res += all_res[j].file_position.results.length;
      }
      Multivio.logger.debug('number of search results: ' + num_res);
      
      
      // warn user if no result found
      if (num_all_res === 0) {
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
      
      var a = null, b  = null, c = null, z = null;
      for (var i = 0; i < num_res; i++) {
        z = res.file_position;
        a = z.results[i];
        b = a.index;
        c = b.bounding_box;

        // get native page size
        //var url = 'page_nr=%@&url=%@'.fmt(b.page, z.url);
        //var page_size = Multivio.CDM.getImageSize(url);
        
        // get angle
        //var angle = this.get('rotateValue');

        // params: label, context, top_, left_, width_, height_, 
        //         file_url, page_, current_zoom_factor
        this.addSearchResult(query, a.preview,
                             c.y1, c.x1, 
                             Math.abs(c.x1 - c.x2),
                             Math.abs(c.y1 - c.y2),
                             z.url,
                             b.page,
                             this.get('zoomFactor'));
                             
      }      
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
    } else { 
      // otherwise, previous element in array 
      // (go back to last element after reaching first)
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
  addSearchResult: function (label, context, top_, left_, width_, height_, 
                                    file_url, page_, current_zoom_factor) {
    
    SC.RunLoop.begin();

    // first, add a highlight zone
    // note: add url to addHighlight call
    var new_hl = this.addHighlight(top_, left_, width_, height_,
                                  page_, 'search', current_zoom_factor, YES, file_url);

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
  
    Multivio.logger.info('searchController:: initialize()');
  
    // NOTE: manually binding to avoid conflicts with selectionController
    // which is a parent class
    this.bind('physicalStructure', 'Multivio.CDM.physicalStructure');
  
    // set referer url
    this.set('url', Multivio.CDM.getReferer());

    // physical structure not yet initialised (do it only once)
    this.set('physicalStructureInitialised', NO);

    // get previously selected search result
    // (when the controller has been reinitialised after a file change)
    var mi = Multivio.masterController.
                                  get('currentSearchResultSelectionIndex');
                                  
    // get the previously selected file to search in
    var msf = Multivio.masterController.get('currentSearchFile');                     
    
    Multivio.logger.debug('search init: Master search file: ' + msf);
                                  
    // initialise content                              
    this.set('content', []);
    
    // if an input param was defined, run the search query
    var iq = this.get('initSearchTerm');
    
    if (!SC.none(iq) && iq !== '') {
      
      // replace escaped characters (such as %20)
      iq = unescape(iq);

      Multivio.logger.debug('search ctrl init, found input query: ' + iq);
      this.set('currentSearchTerm', iq);

      // set file to search (default: all files, using referer url)
      this.set('currentSearchFile', this.get('url'));

      // clear init search term, avoid loops
      this.set('initSearchTerm', undefined);

      // show search palette
      Multivio.logger.debug('search ctrl init, trying to display palette');
      // get search button TODO button should be named in views.js
      var sbt = Multivio.getPath('views.mainContentView.leftButtons').
                                                      get('childViews')[2];
      Multivio.paletteController.showSearch(sbt);

      Multivio.logger.debug('search ctrl init, running search with url: ' + 
                                              this.get('currentSearchFile'));
      this.doSearch();
    } else {
    
      // if the selected search file was the referer, use this with
      // _loadExistingSearchResultsForFile to load results of all files at once.
      if (msf === this.get('url')) {
        url = msf;
      }

      // check for existing results in CDM
      // NOTE: use 'url' arg of file, and not the referer 
      // (as it can point to a document with multiple files), except in
      // the case of results of all files was selected (see above)
      this._loadExistingSearchResultsForFile(url);
    
      /*var newSel = SC.SelectionSet.create();
      newSel.addObject(this.objectAt(mi));
      Multivio.logger.debug("initialize: restore previous selection after new results");
      this.set('selection', newSel);*/
    }
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
    this.position = null;
    this.set('content', null);
    this.set('selection', null);
  }

});

// instantiate the selection and search controllers
Multivio.searchController    = Multivio.SearchController.create();
Multivio.selectionController = Multivio.HighlightController.create();
