/**
==============================================================================
Project: Multivio - https://www.multivio.org/
Copyright: (c) 2009-2011 RERO
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
    User selection rectangle. A modification of the selection triggers the
    computation of the selected text (getSelectionsOnLinesBetweenPoints).
    
    Format of the data: {top: , left: , width: , height: }
    
    TODO: investigate if we can compute the selected text all the while dragging
    the mouse during selection, or on set intervals.
  */
  userSelection: undefined,

  /**
    Selected text, string only
   
    @property {SC.String}
    @default undefined
  */
  selectedTextString:  undefined,

  /**
    Listen to change of the user selection on the content
    
    NOTE: need to normalise those coordinates before trying to find the 
    selected words.
    
  */
  userSelectionDidChange: function () {
  
    // first, get normalised coordinates
    var c = this.get('userSelection'), o;
    
    // get rotation angle for update
    var angle = this.get('rotateValue');
    
    // get zoom factor for update
    var zoom_factor = this.get('zoomFactor');
    
    // get unzoomed coordinates
    o = this._getOriginalZone(c, zoom_factor);
    
    // compute new coordinates according to current angle
    // and unzoomed coordinates
    o = this.getUnrotatedCoords(o, angle);
    
    // get array of selected words
    var words = this.getSelectionsOnLinesBetweenPoints(o.left,  o.top, 
                                           o.left + o.width, 
                                           o.top  + o.height);                          
    // store text 
    // NOTE: view listens to changes on 'selectedTextString'
    var text = '';
    if (!SC.none(words)) text = words.join(' ');
    
    Multivio.selectionController.set('selectedTextString', text);
    
    Multivio.logger.debug('userSelectionDidChange: text: [%@]'.fmt(text));
    
  }.observes('userSelection'),  

  /**
    Returns the text located inside all the highlight zones.
    For each zone, the corresponding text is stored in the highlight object
    in the 'text' field.
    
    NOTE: for now, only considering the first zone, if there are several.
    
    @returns {String} the selected text
    
  */
  /*getSelectedText: function () {
    
    if (this.get('length') === 0) return '';
    
    var t = '', z = this.objectAt(0);
        
    // get original coordinates of zone (unzoomed)    
    var o = z.original;
    var x1 = o.left, y1 = o.top, x2 = x1 + o.width, y2 = y1 + o.height;
    
    // NOTE: always call getText on unzoomed, unrotated content (normalisation)
    var angle = 0; //this.get('rotateValue');
    
    // send request to server to get text
    // NOTE: coordinates are original, unrotated
    //t = Multivio.CDM.getSelectedText(z.url, z.page_number, 
    //                                 x1, y1, x2, y2, angle);
    // TODO multiline selection
    //this.getSelectionsOnLinesBetweenPoints(x1, y1, x2, y2);
    
    return t;
    
  },*/

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
    
    // indexing is empty
    if (SC.none(pi.pages) || SC.none(pi.pages[current_page])) return -1;

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
    If page indexing does not exist, returns empty list [].
    
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
    
    Multivio.logger.debug(
          'getSelectionsOnLinesBetweenPoints(%@,%@,%@,%@)'.fmt(x1, y1, x2, y2));
    
    // discard too small selections
    if (Math.abs(x2 - x1) < 3 || Math.abs(y2 - y1) < 3) return [];
    
    var pi = this._getPageIndexing();
    
    // no page indexing available
    if (SC.none(pi) || pi === -1) return [];
    
    // build result structure
    var result = [];
    
    // select the lines of the current page
    var current_page = Multivio.masterController.get('currentPosition');
    
    // indexing is empty
    if (SC.none(pi.pages) || SC.none(pi.pages[current_page])) return [];
    
    var lines = pi.pages[current_page].lines;
    var single_line = undefined, _loop_start_index = 0;
    // line coordinates for the creation of highlight zones
    var lx1 = 0, ly1 = 0, lx2 = 0, ly2 = 0; 
    
    // parse lines, look for the first selected one
    var l, start = -1, stop = -1, word_start = -1, word_stop = -1,
      selected_words = [], words_1 = [], words_2 = [], words_3 = [], 
      last_line = NO, line_limit = -1;
    for (var i = 0; i < lines.length; i++) {
      l = lines[i];
      
      // found the first line
      // conditions:
      //    1. start not found yet
      //    2. selection top left point higher than line top
      //    3. selection bottom right point lower than line top
      //    4. selection top left point to the left of line right
      // start detection condition: 1 && 2 && 3 && 4
      //Multivio.logger.debug('line, l.l:%@, l.r:%@, l.t:%@, x2,%@, y1:%@'
      //  .fmt(l.l, l.r, l.t, x2, y1));
      if (start === -1 && y1 <= l.t && y2 >= l.t && x1 <= l.r) {
        start = i;
        Multivio.logger.debug('selection start at line #' + i);
      } 
            
      // found the last line
      // conditions:
      //    1. start has been found
      //    2. stop not yet found
      //    3. current line is the last line of the page
      //    4. selection bottom right point is higher than the current line
      //    5. selection bottom right point is to the left of the current line
      // stop detection condition: (1 && 2) && (3 || 4 || 5)
      last_line = (i === (lines.length - 1));
      // note: put limit at middle height of line
      line_limit = (l.t + l.h * 0.5);
      if ((start !== -1 && stop === -1) && 
          (last_line || (y2 <= line_limit) || x2 <= l.l)) { 
        
        stop = i;
        Multivio.logger.debug('selection stop at line #' + i);
        // store the last line
        // note: don't store last one because we detected it 1 too late,
        // except when there's only 1 line, or when the selection
        // goes further than the last line's limit. In this case, the
        // bottom right selection point must be to the right of the beginning
        // of the line
        // conditions recap:
        //    1. there is only one line selected
        //    2. the current line is the last one
        //    3. the bottom right selection point is further down than the limit
        //    4. the bottom right selection point is to the right of 
        //       the beginning of the line
        // conditions to store line at stop: (1 || (2 && 3) && 4)
        if ((result.length === 0 ||
           (last_line && y2 > line_limit) && x2 >= l.l)) {
          result.push(l);
        }

        // use this because a single-line selection is a special case
        single_line = (result.length === 1);

        // PART 2: parse words inside selected lines

        var cl = undefined, w = undefined, wt = '';
        word_start = -1; 
        word_stop = -1;

        // NOTE: we can detect the first and last word by looking only on the 
        // first, respectively last line.
        var k = 0, j = 0;
        
        // ====(1) loop first line separately here
        cl = result[k];
        wt = cl.text.split(" "); // split text of current line into list of words
        // parse the line
        for (j = 0; j < cl.x.length; j++) {
          w = cl.x[j];
          
          
          if (word_start === -1 && (x1 <= w.l || (w.l <= x1 && x1 <= w.r))) {
            word_start = j;
            //Multivio.logger.debug('--word selection start at w #' + word_start);
            //Multivio.logger.debug('--word text: "' + wt[word_start] + '"');
          }  
          
          // add all words of the line once the start word has been found
          if (word_start !== -1 && j >= word_start) {
            words_1.push(wt[j]);
          }
        }
        // temp fix (TODO):
        // we may not find the start when text is on 2+ columns.
        if (word_start === -1) {
          Multivio.logger.debug('first line, word_start is -1, setting to 0...');
          word_start = 0;
        } 
        // definition of highlight zone
        // if there are several lines selected, we know the first line
        // is selected to the end.
        if (result.length !== 1) {
          lx1 = cl.x[word_start].l;
          ly1 = cl.t;
          lx2 = cl.x[cl.x.length - 1].r;
          ly2 = ly1 + cl.h;
          this.addHighlightHelper(lx1, ly1, lx2, ly2, YES);
        }
        
        
        // ====(2) loop last line separately here
        cl = result[result.length - 1];
        wt = cl.text.split(" "); // split text of current line into list of words
        // parse the line
        // NOTE: if it's a single line, take word_start index into account
        _loop_start_index = (single_line? word_start: 0);
        for (j = _loop_start_index; j < cl.x.length; j++) {
          w = cl.x[j];
          
          // add all words of last line until the last word is found
          if (word_stop === -1) {
            words_3.push(wt[j]);
          }
          
          if (x2 <= w.l) {
            word_stop = Math.max(j - 1, 0); //note: ensure it's never below zero
            //Multivio.logger.debug('--word selection stop at w #' + j);
            //Multivio.logger.debug('--word text: "' + wt[word_stop] + '"');
            // remove last word because we detect the end too late
            // (word_stop is on j-1).
            // note: pop() on empty list returns undefined, not an exception
            words_3.pop();
            
            break;
          }  
        }
        // it's possible that we get out of the loop without detecting 
        // the end, and word_stop still equals -1. If that's the case, it means
        // we select the whole line.
        if (word_stop === -1) word_stop = cl.x.length - 1;
        
        // definition of highlight zone
        // if only one line, both start and stop word coordinates are known
        if (result.length === 1) {
          lx1 = cl.x[word_start].l;
          ly1 = cl.t;
          lx2 = cl.x[word_stop].r;
          ly2 = ly1 + cl.h;
        } else { // else, from start of line until word_stop
          lx1 = cl.l;
          ly1 = cl.t;
          //Multivio.logger.debug('word_stop: ' + word_stop);
          //Multivio.logger.debug('cl.x.length: ' + cl.x.length);
          
          lx2 = cl.x[word_stop].r;
          ly2 = ly1 + cl.h;
        }
        this.addHighlightHelper(lx1, ly1, lx2, ly2, YES);
        
        // ====(3) loop the lines inbetween and add all of their words
        // to the result
        for (k = 1; k < result.length - 1; k++) {
          cl = result[k];
          // split text of current line into list of words
          wt = cl.text.split(" ");
          // parse the words of each selected line
          // and check which words are selected
          for (j = 0; j < cl.x.length; j++) {
            w = cl.x[j];
            
            //Multivio.logger.debug('--word #' + j + ' l: ' + w.l + ' r: ' + w.r);
            //Multivio.logger.debug('--word text: "' + wt[j] + '"');
            
            words_2.push(wt[j]);
          }
          
          // inbetween, lines are wholly selected
          lx1 = cl.l;
          ly1 = cl.t;
          lx2 = cl.x[cl.x.length - 1].r;
          ly2 = ly1 + cl.h;
          this.addHighlightHelper(lx1, ly1, lx2, ly2, YES);
          
        }
        
        // build complete list of selected words
        // note: if we have only one line, words_2 is empty,
        // words_3 contains the result because word_start and word_stop
        // are known (whereas words_1 does not know word_stop)
        if (result.length === 1) {
          selected_words = words_3; 
        } else {
          selected_words = words_1.concat(words_2).concat(words_3);          
        }
        
        // debug: display the list of words
        /*Multivio.logger.debug('words_1: ' + words_1);
        Multivio.logger.debug('words_2: ' + words_2);
        Multivio.logger.debug('words_3: ' + words_3);
        Multivio.logger.debug('selected_words: ' + selected_words);
        */
        // get out of the lines' loop
        break;
      
      }

      // a line between start and stop of selection        
      if (start !== -1 && stop === -1) {
        result.push(l);
      }
    }
    
    return selected_words;
    
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
      return Multivio.CDM.getPageIndexing(
                                  current_file, page_nr, undefined, undefined);
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
    var dr =  null;

    Multivio.logger.debug('_physicalStructureDidChange,referer: ' + url +
                                                        ' phys: ' + phys[url]);
    Multivio.logger.debug('_physicalStructureDidChange, entering...');

    if (!SC.none(phys) && !SC.none(phys[url]) && phys[url].length > 0) {

      this.set('physicalStructureInitialised', YES);

      if (phys[url].length < 2) {
            
        Multivio.logger.debug('_physicalStructureDidChange, removing scope');
        Multivio.logger.debug('_physicalStructureDidChange, url: ' + 
                                                            phys[url][0].url);
        // init search file to the single file
        // this.set('currentSearchFile', phys[url][0].url);
        // TODO NOTE: set specifically in search controller (not this class)
        Multivio.searchController.set('currentSearchFile', phys[url][0].url);
        
        // init file list with one element
        //this.set('currentFileList', [phys[url][0]]);
        // NOTE: set specifically in both controllers TODO find better solution
        Multivio.searchController.set('currentFileList', [phys[url][0]]);
        Multivio.selectionController.set('currentFileList', [phys[url][0]]);      
        
      }
      else {
        
        // add 'All files' search option to file list
        var fileList = Multivio.CDM.clone(phys[url]);
        // NOTE: don't add 'All files' if there's only one file
        if (phys[url].length > 1) {
          fileList.insertAt(0, {'label': '_AllFiles'.loc(), 'url': url});          
        }

        // NOTE: set specifically in both controllers TODO find better solution
        Multivio.selectionController.set('currentFileList', fileList);
        Multivio.searchController.set('currentFileList', fileList);

      }
      
      // init display properties for each file
      dr = {};
      for (var i = 0; i < phys[url].length; i++) {
        dr[phys[url][i].url] = YES;
      }

      // NOTE: set specifically in both controllers TODO find better solution
      //this.set('displayResults', dr);
      Multivio.selectionController.set('displayResults', dr);
      Multivio.searchController.set('displayResults', dr);
    }
  }.observes('physicalStructure'),


  /**
    Create a new highlight zone with given coordinates and zoom factor.
    
    'is_original' specifies if the coordinates are given in the original
     size  of the content. This information is used to compute the coordinates
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
    Helper function to add a highlight, giving only basic xy params.
  */
  addHighlightHelper: function (x1, y1, x2, y2, is_original) {

    // compute tlwh
    var top_ =  y1,
        left_ = x1, 
        width_  = Math.abs(x2 - x1),
        height_ = Math.abs(y2 - y1);

    // gather necessary data (take current values of context)
    var z = this.get('zoomFactor');
    var u = Multivio.masterController.get('currentFile');
    var p = Multivio.masterController.get('currentPosition');
    var t = 'selection';
    
    //  top_, left_, width_, height_, page_, type_, current_zoom_factor, is_original, url
    return this.addHighlight(top_, left_, width_, height_, p, t, z, is_original, u);
    
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
    
    // TODO experimental selection
    if (Multivio.firstResponder !== Multivio.READY) {
      return;
    }
    
    // get rotation angle for update
    var angle = this.get('rotateValue');
    
    // get zoom factor for update
    var zoom_factor = this.get('zoomFactor');
        
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
    Returns YES if the first file in the list of candidate searchable files
    is a PDF.
  */
  isDocumentSearchable: function () {
    var cfl = this.get('currentFileList'),
        fileURL = '',
        typeOfFirstFile = '';
    if (!SC.none(cfl)) {
      // cfl.length is never 2; it may be:
      // 0
      // 1 (for single files)
      // > 2 (for multiple files, because the root file is included)
      if (cfl.length === 1) {
        fileURL = cfl[0].url;
      }
      else if (cfl.length > 2) {
        fileURL = cfl[1].url;
      }
      var md = Multivio.CDM.getFileMetadata(fileURL);
      if (SC.typeOf(md) === SC.T_HASH) {
        typeOfFirstFile = Multivio.configurator.getTypeForMimeType(md.mime);
      }
    }
    return (typeOfFirstFile === 'pdf');
  }.property('currentFileList', 'Multivio.CDM.fileMetadata'),

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
    Determines whether there was a check for textual content on the current
    document or not. This is used to display a message only once per document.
  
    @property {Boolean}
    @default NO
  */
  textualContentHasBeenChecked: NO,
    
  /**
    If results already exist for this file in the CDM, load them.
    Else, clear content.
    
    @private
    @param {String} url the url of the file
  */
  _loadExistingSearchResultsForFile: function (url) {
    
    // clear results' list
    this.set('content', []);
        
    // look for existing stuff in the CDM
    var all_results = Multivio.CDM.get('searchResults');
    var new_results = Multivio.CDM.clone(all_results);   
        
    // always update the search results, be it empty or not
    //SC.RunLoop.begin();
    this.set('_load_url', url);
    // wake up bindings on searchResults
    this.set('searchResults', new_results); 
    //SC.RunLoop.end();
    
    /*
    if (!SC.none(all_results) && !SC.none(all_results[url])) {
      new_results = Multivio.CDM.clone(all_results);
      SC.RunLoop.begin();
      this.set('_load_url', url);
      // this should trigger _searchResultsDidChange()
      this.set('searchResults', new_results); 
      SC.RunLoop.end();
    }
    */
    
  },

  /**
    When the selection of the search result changes, we switch 
    to the corresponding page of the content, if needed.
    
    @private
    
    @return {Boolean} true if selection change sucessful
    
    @observes selection
  */
  _selectionDidChange: function () {
    
    if (!this.get('allowsSelection')) {
      return;
    }
        
    var selSet = this.get('selection');
    var selectedObject = selSet.firstObject();
    var selIndex = this.indexOf(selectedObject);
    
    Multivio.logger.debug("_selectionDidChange: index: " + selIndex);
    Multivio.logger.debug("_selectionDidChange: object: " + selectedObject);
        
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
        
    // if necessary, switch to the corresponding document
    // WARNING: changing master's currentFile initialises controllers anew.
    // in initialize(), check for existing results in CDM
    var current_search_file = this.get('currentSearchFile');
    var current_master_file = Multivio.masterController.get('currentFile');
    var ref_file            = this.get('url');
        
    //if (current_master_file !== current_search_file) {
    if (current_master_file !== selectedObject.url) {
      SC.RunLoop.begin();
      Multivio.logger.debug("selectionDidChange: switching to file: " + 
                                                selectedObject.url);
                                                
      // set init state since we change file
      // TODO state chart
      Multivio.makeFirstResponder(Multivio.INIT);                   
      Multivio.masterController.set('currentFile', selectedObject.url);
      
      // store the position of the file to switch to once the initialisation
      // of the new file is done
      Multivio.masterController.set('initialPosition', 
                                                selectedObject.page_number);
      // we're going to load some content
      Multivio.masterController.set('isLoadingContent', YES);
      
      SC.RunLoop.end();

    } else {
      Multivio.logger.debug("selectionDidChange: switching to page: " + 
                                                selectedObject.page_number);                                              
      Multivio.masterController.set('currentPosition', 
                                                selectedObject.page_number);
    }
    
    return YES;
    
  }.observes('selection'),

  /**
    Set the current selection to the object corresponding to the given index.
    
    @param {Number} index the number of the selected search result.
                    First item of list has index 0.
    
  */
  setSelectionIndex: function (index) {
        
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

    // force UTF8 encoding of the query in order to avoid problems with
    // diacritics in Internet Explorer
    if (SC.browser.msie) {
      query = unescape(encodeURIComponent(query));
    }

    this.set('lastSearchQuery', query);
    // clear previous results
    this.clearResults();

    // initialize check variable
    this.set('textualContentHasBeenChecked', NO);

    // discard empty strings
    if (SC.none(query) || SC.empty(query.trim())) return NO;
    
    SC.RunLoop.begin();
    this.set('searchStatus', '_searchInProgress'.loc());
    // don't allow selection while search is in progress    
    // TODO set state
    this.set('allowsSelection', NO);
    Multivio.searchTreeController.set('allowsSelection', NO);
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
      Multivio.logger.debug('doSearch ALL: file_list: %@, length: %@'.fmt(
                                                  file_list, file_list.length));
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
    // NOTE: as of now, always clear results for all files
    // This fixes a problem when searching in a specific file
    // (in a multi-file document) when previous results exist
    // for other files
    if (YES) {//if (rf === cf) {
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
          
          // results undefined for this url, skip
          if (SC.none(res[file_list[i].url])) {
            continue;
          }
          
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
          "_searchResultsDidChange restore previous selection: " + 
            selectedObject);

        newSel.addObject(selectedObject);
        
        if (!SC.none(selectedObject)) {
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
      
      // get total number of search results, not for this file only (ref url)
      var num_all_res, num_res = res.file_position.results.length;
      var all_res = this.get('searchResults');
      num_all_res = 0;
      var num_res_pages = 0;
      var files = this.get('currentFileList');
      var num_files = files.length;
      var ref_url = this.get('url');
      var csf = this.get('currentSearchFile');

      // in this loop we can detect if we received a response
      // for every file in the list
      // NOTE: don't take 'All Files' into account, begin at index 1
      //handle case where there's only one file
      var done = YES, u, more = '';
      
      // if we searched a specific file, check only this one
      if (csf !== ref_url) {
        if (SC.none(all_res) || SC.none(all_res[csf])) {
          Multivio.logger.debug('---no result for specific file, skip: ' + csf);
          done = NO;
        } else {
          num_all_res = all_res[csf].file_position.results.length;
          // display a '+' if results were truncated
          if (all_res[csf].max_reached !== 0) more = '+';
        }

      } else { // searching all files, check the list
      
        for (var j = 0; j < num_files; j++) {

          // current url
          u = files[j].url;
        
          // skip 'all files'
          if (files[j].label === '_AllFiles'.loc()) {
            continue;
          }
                        
          // result missing, search not done  
          if (SC.none(all_res) || SC.none(all_res[u])) {
            done = NO;
            continue;
          }
          num_all_res += all_res[u].file_position.results.length;
          // display a '+' if results were truncated
          if (all_res[u].max_reached !== 0) more = '+';
        }
      }
      Multivio.logger.debug('---search done: ' + done);
      Multivio.logger.debug('---number of search results: ' + num_all_res);

      if (done) {
        // allow selection when search is done
        // TODO set state
        this.set('allowsSelection', YES);
        Multivio.searchTreeController.set('allowsSelection', YES);
        
        if (num_all_res === 0) {
          this.set('searchStatus', '_noResult'.loc());
          // TODO check if there is textual content on the current page
          this._checkTextualContent();
        }
        else {
          this.set('searchStatus', '_listOfResults'.loc(num_all_res, more));
        }
      }
      
      // add all results in content      
      var a = null, b  = null, c = null, z = null,
          resPages = {};
      
      for (var i = 0; i < num_res; i++) {
        z = res.file_position;
        a = z.results[i];
        b = a.index;
        c = b.bounding_box;
        resPages[b.page.toString()] = YES;

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

      // update number of pages with results
      num_res_pages = Object.keys(resPages).length;
      if (num_res_pages > 0) {
        this.set('searchStatus',
            '_listOfResults'.loc(num_all_res, more) + ' ' +
            '_resultPages'.loc(num_res_pages, more));
      }
    }
  },

  /**
    @method
    @private
    
    This function checks if the current page does have textual indexing.
    If not, display a message to the user warning him that the document
    is apparently not searchable.
    
    The check is performed only is this.textualContentHasBeenChecked is false.
    
  */
  _checkTextualContent: function () {

    if (this.get('textualContentHasBeenChecked')) return;
    
    Multivio.logger.debug('_checkTextualContent');
    
    // get page indexin
    var pi = this._getPageIndexing();
    
    // did not receive page indexing from the server
    if (pi === -1) return;

    // get the current page
    var current_page = Multivio.masterController.get('currentPosition');
    
    // indexing is empty
    if (SC.none(pi) || SC.none(pi.pages) || 
        SC.none(pi.pages[current_page]) ||
        SC.none(pi.pages[current_page].lines) ||
        pi.pages[current_page].lines.length === 0) {
      
      Multivio.usco.showAlertPaneInfo('_NoTextualContent'.loc(), 
        '_NotSearchable'.loc(), 'OK');
      
    }
    
    this.set('textualContentHasBeenChecked', YES);
    
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
    }
    
    SC.RunLoop.end();
  },

  /**
    Initialize the search controller, its content (array of search results).

    @param {String} url
  */
  initialize: function (url) {
  
    Multivio.logger.info('searchController:: initialize()');
    
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
    
    Multivio.logger.debug('search init: master search file: ' + msf);
                                  
    // initialise content, display                           
    this.set('content', []);
    this.set('searchStatus', ''); 
    
    // if an input param was defined, run the search query
    var iq = this.get('initSearchTerm');
    
    if (!SC.none(iq) && iq !== '') {
      
      // replace escaped characters (such as %20)
      iq = unescape(iq);

      // set file to search (default: all files, using referer url)
      this.set('currentSearchFile', this.get('url'));

      Multivio.logger.debug('search ctrl init, found input query: ' + iq);
      this.set('currentSearchTerm', iq);

      // NOTE: we need to initialize currentFileList before searching
      
      var phys;
      if (this.get('physicalStructureInitialised')) {
        phys = this.get('physicalStructure');
      } else {
        // warning, phys can be -1
        phys = Multivio.CDM.getPhysicalstructure(this.get('url'));
        if (phys === -1) {
          // store data to launch the search once we receive the file list
          this.set('initial_search', YES);
          this.set('initial_term', iq);
          this.set('initial_url', this.get('url'));
          return;
        }
      }
      
      Multivio.logger.debug('search ctrl init, phys: ' + phys);
      this.set('currentFileList', phys);

      Multivio.logger.debug('search ctrl init, url: ' + this.get('url'));
      
      // clear init search term, avoid loops
      this.set('initSearchTerm', undefined);

      // show search palette
      Multivio.logger.debug('search ctrl init, trying to display palette');
      // get search button TODO button should be named in views.js
      var sbt = Multivio.getPath('views.leftButtons').get('childViews')[0];
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
      //this._loadExistingSearchResultsForFile(url);
      // TODO experimental selection: always load ref url because we always want the results of
      // all files
      this._loadExistingSearchResultsForFile(this.get('url'));
    
      // TODO experimental selection try setting saved selection
      var newSel = SC.SelectionSet.create();
      newSel.addObject(this.objectAt(mi));
      var cont = this.get('content');
      this.set('selection', newSel);
    }
    Multivio.sendAction('addComponent', 'searchController');
    Multivio.logger.info('searchController initialized with url:' + url);
  },
  
  // TODO experimental selection
  selectionIndexDidChange: function () {
    
    // get selection index
    var idx = Multivio.masterController.get('currentSearchResultSelectionIndex');

    Multivio.logger.debug('search, selectionIndexDidChange: ' + idx);
    
    // set the selection to the element in content which has this index
    if (idx > -1 && idx < this.get('length')) {
      var nextObject = this.objectAt(idx);
      
      Multivio.logger.debug('search, selectionIndexDidChange, next object: ' +
                                                                    nextObject);
      
      var newSel = SC.SelectionSet.create();
      newSel.addObject(nextObject);
      this.set('selection', newSel);
    }
  }.observes('Multivio.masterController.currentSearchResultSelectionIndex'),  
  
  /**
    This function is used to launch an initial search (coming from param
    &search=<term> in URL), when we don't have the physical structure yet
    to know the list of all files.
  */
  currentFileListDidChange: function () {
    
    Multivio.logger.debug('currentFileListDidChange');
    
    var cfl = this.get('currentFileList');
    
    if (SC.none(cfl)) return;
    
    // once we receive the file list, we can get the page indexing as well
    this._getPageIndexing();
    
    var is = this.get('initial_search');
    var it = this.get('initial_term');
    var iu = this.get('initial_url');
    
    if (SC.none(is) || !is) return;
    
    // use stored data and clear it right away
    this.set('currentSearchTerm', it);
    this.set('initial_term', undefined);
    
    this.set('currentSearchFile', iu);
    this.set('initial_url', undefined);
    
    this.set('initial_search', NO);
    
    // TODO show search palette
    //Multivio.logger.debug('currentFileListDidChange, trying to display palette');
    // get search button TODO button should be named in views.js
    //var sbt = Multivio.getPath('views.leftButtons').get('childViews')[2];
    //Multivio.paletteController.showSearch(sbt);
    
    // launch search
    this.doSearch();
    
  }.observes('currentFileList'),
  
  /**
  */
  currentSearchFileDidChange: function () {
    this.doClear();
  }.observes('currentSearchFile'),
  
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
