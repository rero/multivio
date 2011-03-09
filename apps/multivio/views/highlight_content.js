/**
==============================================================================
Project: Multivio - https://www.multivio.org/
Copyright: (c) 2009-2011 RERO
License: See file license.js
==============================================================================
*/

/** @class

  The highlight layer on top of the content view image 
  (Multivio.ImageContentView).
  
  It contains the highlights for current search results
  as well as the words selected by the user using drag and drop.
  
  @author {dwy}
  @extends {SC.View}
  @since {0.2.0}
*/
Multivio.HighlightContentView = SC.View.extend(
/** @scope Multivio.HighlightContentView.prototype */ {
  
  /** 
    div which contains the selected text.
    
    @property {SC.TextFieldView}
    @default null
  */
  selectedTextDiv: null,
  
  /**
    Binds to the selectionController's selectedTextString.
    This binding is read only.
    
    @binding {SC.String}
  */
  selectedTextString: null,
  selectedTextStringBinding: 
      SC.Binding.oneWay("Multivio.selectionController.selectedTextString"),
  
  /**
    Binds to the masterController's currentPosition.
    This binding is read only.
    
    @binding {Number}
  */
  currentPage: null,
  currentPageBinding: 
      SC.Binding.oneWay("Multivio.masterController.currentPosition"),
  
  /**
      Binds to the masterController's isLoadingContent.
      This binding is read only.
      
      @binding {Boolean}
  */
  isLoadingContent: null,
  isLoadingContentBinding: 
              SC.Binding.oneWay('Multivio.masterController.isLoadingContent'),
  
  /**
    Binds to the search result selection in the search controller.
    This binding is read only.

    @binding {SC.Selection}
  */
  searchResultSelectionIndex: null,
  searchResultSelectionIndexBinding: 
                SC.Binding.oneWay(
                  'Multivio.masterController.currentSearchResultSelectionIndex'),
//                    SC.Binding.oneWay('Multivio.searchController.selection'),
  
  /** 
    Determines whether the highlight view (this) needs to be redrawn or not.
  
    @property {Boolean}
    @default NO
  */
  highlightNeedsUpdate: NO,
  
  /** 
    Determines whether the coordinates must be recomputed by the controller
    after a change (new results, zoom or rotation).
  
    @property {Boolean}
    @default NO
  */
  coordinatesNeedUpdate: NO,
  
  /** 
    Binds to the selectionController's content,
    an array of user selected zones.

    @binding {SC.Array}

  */
  selections: [],
  selectionsBinding: 'Multivio.selectionController.[]',
  
  /** 
    Binds to the searchController's content,
    an array of search results.
    
    @binding {SC.Array}
  */
  searchResults: [],
  searchResultsBinding: 'Multivio.searchController.[]',
  
  /**
    Binds to the zoom factor in the zoom controller.
    This binding is read only.
  
    @binding {Number}
   */
  zoomFactor: null, 
  zoomFactorBinding:
      SC.Binding.oneWay('Multivio.zoomController.zoomRatio'),
  
  /**
    Binds to the currentValue in the rotate controller.
    This binding is read only.

    @binding {Number}
  */
  rotateValue: null,
  rotateValueBinding:
      SC.Binding.oneWay('Multivio.rotateController.currentValue'),
  
  /** 
    Rectangle of user selection during mouse drag.
    
    @property {SC.View}
    @default null
  */
  userSelection: null,
  
  /** 
    Position information after a mouse click.
    
    @property {SC.Object}
    @default null
  */
  _mouseDownInfo: null,


  /** 
    If selection is persistent, user-drawn rectangle remains on
    view after mouseUp, otherwise removed.

    @property {Boolean}     
    @default NO
  */  
  persistentSelection: YES,
  
  /** 
    Index of currently selected search result
    
    @private
    @property {Number}
    @default null
  */    
  _selectionIndex: null,
  
  
  /**
    Initialize the view, prepare the view for user selection
    (starts as invisible).
  */
  init: function () {
    
    // create userSelection view for the display of the selection
    // highlight zone, with 0x0 dimensions for a start
    this.userSelection = this.createChildView(
      SC.View.design({
        layout:  { top: 0, left: 0, width: 0, height: 0 },
        classNames: 'selection-transparent'.w()
      })
    );
    
    this.appendChild(this.userSelection);
    this.userSelection.set('isVisible', NO);
  
    
    // create invisible div which will contain the selected text,
    // and will be used to copy it to clipboard
    this.selectedTextDiv = this.createChildView(
      SC.TextFieldView.design({
        layout:  { top: -10, left: -10, width: 1, height: 1 },
        layerId: 'selected_text'
      })
    );
     
    // add the label to the view NOTE: set it as visible,
    // with 1x1 dimensions outside the view so it's not actually visible
    // but still takes new text values
    this.appendChild(this.selectedTextDiv);
    this.selectedTextDiv.set('isVisible', YES);
    this.selectedTextDiv.set('isEnabled', YES);

    sc_super();

  },
  
  /**
    When the selected text in selectionController changes, insert it
    in a label view, which will be used for the copy to clipboard.

    @observes selectedTextString
  */
  selectedTextStringDidChange: function () {
    
    var t = this.get('selectedTextString');
    
    Multivio.logger.debug('HighlightContentView: selectedTextStringDidChange: ' + t);
    
    SC.RunLoop.begin();
    // set text in the div (SC.TextFieldView)
    this.selectedTextDiv.set('value', t);
    
    // get input field of the SC.TextFieldView used for selection
    Multivio.selectionController.selectTextField();
    
    SC.RunLoop.end();

  }.observes('selectedTextString'),
  
  /**
    When the coordinate update flag is set, update them in both controllers.

    @observes coordinatesNeedUpdate
  */
  coordinatesNeedUpdateDidChange: function () {

    SC.RunLoop.begin();
    if (this.get('coordinatesNeedUpdate')) {
      
      // update done by the controllers
      Multivio.searchController.updateCoordinates();
      Multivio.selectionController.updateCoordinates();
      
      // update done, reset flag 
      this.set('coordinatesNeedUpdate', NO);
      
    }
    SC.RunLoop.end();
    
  }.observes('coordinatesNeedUpdate'),
  
  /**
    When the selection of search results changes,
    update the position of the scroll in the view, if needed.

    @observes searchResultSelectionIndex
  */
  searchResultSelectionIndexDidChange: function () {

    // update coordinates for the current selection
    // (after the page changes, the coordinates need to be updated anyway)
    //this.set('coordinatesNeedUpdate', YES);
    SC.RunLoop.begin();
    Multivio.searchController.updateCoordinates();

    this.updateSearchResultScroll();

    this.set('layerNeedsUpdate', YES);
    SC.RunLoop.end();

  }.observes('searchResultSelectionIndex'),
  
  /**
    Update the position of the scroll in the view if needed.

    @private
  */
  updateSearchResultScroll: function () {
    
    //var selection = this.get('searchResultSelection').firstObject();
    //var selectionIndex = Multivio.searchController.indexOf(selection);
    var selectionIndex = this.get('searchResultSelectionIndex');
    
    // store selection index, will be used to apply 
    // a specific style for the selected highlight in this.render()
    SC.RunLoop.begin();
    this.set('_selectionIndex', selectionIndex);
    SC.RunLoop.end();
    
    Multivio.logger.debug("updateSearchResultScroll selectionIndex: " +
                                                             selectionIndex);
    if (selectionIndex !== -1) {
      // retrieve the list of the search results visible in the view
      var listView = this.get('childViews');
      var sr = undefined;
      for (var i = 0; i < listView.get('length'); i++) {
        sr = listView[i];
        // if this is the selected one, scroll it
        if (sr.id === selectionIndex) {
          Multivio.logger.debug('updating search result scroll'); 
          sr.scrollToVisible();
        
          break;
        }
      }
      // need to redraw the highlight zones to show current selection
      this.set('coordinatesNeedUpdate', YES);
    }
    
  },
  
  /**
    When the current page changes,
    flag the highlight view for a redraw to update display.

    @observes currentPage
  */
  currentPageDidChange: function () {

    // flag the view for a redraw, (causes render() function to be called)
    this.set('highlightNeedsUpdate', YES);
    
  }.observes('currentPage'),
  
  /**
    When the rotation angle changes,
    flag the highlight view for a redraw to update display.

    @observes currentPage
  */
  rotateValueDidChange: function () {

    Multivio.logger.debug('HighlightContentView#rotateValueDidChange(): ' +
                                                    this.get('rotateValue'));

    // notify controllers the rotation change
    Multivio.searchController.set('rotateValue', this.get('rotateValue'));
    Multivio.selectionController.set('rotateValue', this.get('rotateValue'));

    // flag the view for a redraw, (causes render() function to be called)
    this.set('highlightNeedsUpdate', YES);
    
  }.observes('rotateValue'),
  
  /**
    When the zoom changes, notify the highlight and search controllers
    and flag the view for a redraw.

    @observes zoomFactor
  */
  zoomFactorDidChange: function () {
    
    Multivio.logger.debug('HighlightContentView#zoomFactorDidChange(): %@'.
                                                fmt(this.get('zoomFactor')));

    // notify controllers the zoom change
    Multivio.selectionController.set('zoomFactor', this.get('zoomFactor'));
    Multivio.searchController.set('zoomFactor', this.get('zoomFactor'));
    
    // flag the view for a redraw, (causes render() function to be called)
    this.set('highlightNeedsUpdate', YES);

    
  }.observes('zoomFactor'),
  
  /**
    When content has finished loading (isLoadingContent changes to NO),
    update search results' scroll and flag the view for a redraw.

    @observes isLoadingContent
  */
  isLoadingContentDidChange: function () {
    
    var loading = this.get('isLoadingContent');
    var hnu     = this.get('highlightNeedsUpdate');
    
    Multivio.logger.debug('HighlightContentView#isLoadingContentDidChange()' + 
                              ' loading: %@, highlight: %@'.fmt(loading, hnu));
    
    // finished loading, update scroll
    if (!loading) {
      //Multivio.logger.debug("isLoadingContentDidChange: updating scroll");
      //this.updateSearchResultScroll();
    }
    
    // if the highlight pane needs an update, 
    // flag the view for a redraw, which causes render() function to be called.
    // Update only after 'isLoadingContent' is NO again, 
    // to wait for the image to finish loading
    if (hnu && !loading) {
      this.set('layerNeedsUpdate', YES);
    }  
  }.observes('isLoadingContent'),
  
  
  /* mouse events */

  /**
    On mouseDown, store the initial mouse pointer position and initialise
    the user selection view.

    @event
    @param evt
    @return {Boolean} true if everything OK
  */
  mouseDown: function (evt) {
    
    // hide a palette
    Multivio.paletteController.hidePalette(null);
    // cancel selections on current page
    Multivio.selectionController.removeAllHighlights();

    // get current rectangle and view layout
    var viewLayout = this.get('layout');

    // get position of mouse relative to the view
    var loc = this.convertFrameFromView({ x: evt.pageX, y: evt.pageY });

    // save mouse and rectangle positions when mouse is clicked
    this._mouseDownInfo = {
      pageX:  evt.pageX,    // coordinates of mouse on the page
      pageY:  evt.pageY,
      x:      loc.x,        // coordinates of mouse on the view
      y:      loc.y,       
      viewLayout: viewLayout
    };

    // set the start coordinates (top left) of the rectangle where the mouse was clicked
    this.userSelection.adjust('left', loc.x);
    this.userSelection.adjust('top',  loc.y);
    this.userSelection.adjust('width',  0);
    this.userSelection.adjust('height', 0);
    this.userSelection.set('isVisible', YES);

    return YES;
  },
  
  /**
    On mouseDrag, compute user selection view dimension and draw it on screen.

    @event
    @param evt
    @return {Boolean} true if everything OK
  */
  mouseDragged: function (evt) {
    var info = this._mouseDownInfo, dim;

    // handle width difference
    dim = (evt.pageX - info.pageX);

    // "normal" direction (left-to-right), anchor point is 'left'
    if (dim >= 0) {
      this.userSelection.adjust('left', info.x);
      this.userSelection.adjust('right', null);      
    }
    // reverse direction (right-to-left), anchor point is 'right'
    else {
      dim *= (-1); 
      this.userSelection.adjust('right', info.viewLayout.width - info.x);
      this.userSelection.adjust('left', null);
    }
    this.userSelection.adjust('width', dim);

    // handle height difference
    dim = (evt.pageY - info.pageY);

    // "normal" direction (top-to-bottom), anchor point is 'top'
    if (dim >= 0) {
      this.userSelection.adjust('top', info.y);
      this.userSelection.adjust('bottom', null);      
    }
    // reverse direction (down-to-up), anchor point is 'bottom'    
    else {
      dim *= (-1); 
      this.userSelection.adjust('bottom', info.viewLayout.height - info.y);
      this.userSelection.adjust('top', null);
    }
    this.userSelection.adjust('height', dim);

    return YES;
  },

  /**
    On mouseUp, the user selection view is hidden.
    If 'persistentSelection' equals YES, a highlight 
    is created at this position.

    @event
    @param evt
    @return {Boolean} true if everything OK
  */
  mouseUp: function (evt) {

    // compute top and left values, if absent ("reverse" selection)
    var l = this.userSelection.get('layout'), top, left;
    top = l.top ? l.top :     (this._mouseDownInfo.viewLayout.height - l.bottom - l.height);
    left = l.left ? l.left :  (this._mouseDownInfo.viewLayout.width  - l.right  - l.width);
      
    // if persistent, create a highlight zone from this user selection 
    if (this.persistentSelection) {

      // add highlight in controller
      // TODO test let selection controller add highlights according to text
      /*Multivio.selectionController.
                        addHighlight(top, left, l.width, l.height, 
                          this.get('currentPage'), 'selection', 
                          this.get('zoomFactor'), NO,
                          Multivio.masterController.get('currentFile'));*/
    }

    // hide user selection rectangle
    this.userSelection.set('isVisible', NO);

    // send selection to selection controller
    Multivio.selectionController.set('userSelection', { top: top, 
                                                          left: left, 
                                                          width: l.width,
                                                          height: l.height,
                                                          page: this.get('currentPage'),
                                                          type: 'selection' });

    // clean up initial info
    this._mouseDownInfo = null;

    return YES;
  },
  
  /**
    When the selection highlights change,
    flag the coordinates for a recomputation and the view for a redraw.
  
    @observes Multivio.selectionController.[]
  */
  selectionsDidChange: function () {
           
    // set flag for updating coordinates to take rotation and zoom into account
    this.set('coordinatesNeedUpdate', YES);

    // flag the view for a redraw, causes render() function to be called
    this.set('layerNeedsUpdate', YES);
    
  }.observes('Multivio.selectionController.[]'),
  
  /**
    When the search results change,
    flag the coordinates for a recomputation and the view for a redraw.
  
    @observes Multivio.searchController.[]
  */
  searchResultsDidChange: function () {

    // set flag for updating coordinates to take rotation and zoom into account
    this.set('coordinatesNeedUpdate', YES);

    // flag the view for a redraw, causes render() function to be called
    this.set('layerNeedsUpdate', YES);

  }.observes('Multivio.searchController.[]'),
  
  /**
    @method

    Called when the parent view was resized.
    Applies the same dimensions to this element.

  */
  parentViewDidResize: function () {

    // get parent view of element, exit if none
    var parent = this.get('parentView');

    if (SC.none(parent)) return;

    // get dimensions of parent element
    var contentWidth  = parent.get('layout').width;
    var contentHeight = parent.get('layout').height;

    // adjust dimensions of child accordingly
    this.adjust('width',  contentWidth);
    this.adjust('height', contentHeight);
    
    this.set('layerNeedsUpdate', YES);
    
  },
  
  /**
    @method
    
    Override render method to draw highlight zones on the pane.
    
    Draws highlights, on the correct page. 
    Check that the place where there are search results and/or text selections
    is visible on the main content page. 

    @param {Object} context
    @param {Boolean} firstTime
  */
  render: function (context, firstTime) {

    if (firstTime) {
      sc_super();
    }
    else {
      var current_master_file = Multivio.masterController.get('currentFile');
      var ref_url             = Multivio.searchController.get('url');
      var csf = Multivio.searchController.get('currentSearchFile') || ref_url;
    
      // update highlights only if the search results belong to the current
      // file, or 'All files' search scope is selected.
      if (csf !== current_master_file && csf !== ref_url) return;
 
      // clear view
      this.removeAllChildren();
    
      // add user selection rectangle and text div
      this.appendChild(this.userSelection);
      this.appendChild(this.selectedTextDiv);
    
      // get selections' highlights
      var zones = this.get('selections');
      var len   = zones.get('length');
      var i;
          
      // redraw all selection zones
      // NOTE: 'selections' is an array of zones
      for (i = 0; i < len; i++) {
        this._drawHighlightZone(zones.objectAt(i), 'highlight selection-highlight', i);
      }
    
      // get current search results highlights
      zones = this.get('searchResults');
      len   = zones.get('length');
    
      // redraw all search results' zones
      var cl = 'highlight search-highlight';
      var cn = '';
      var index = this.get('_selectionIndex');
      // Note: apply a specific class name for the selected result highlight
      for (i = 0; i < len; i++) {
        cn = (i === index? cl + ' search-selected-highlight' : cl);
        this._drawHighlightZone(zones.objectAt(i), cn, i);
      }
    
      // highlight pane just redrawn, no need for update anymore
      this.set('highlightNeedsUpdate', NO);
    
      // update scroll position
      this.updateSearchResultScroll();
    }
  },
  
  /**
    Creates and appends a new view to the highlight pane.

    @private
    @param {SC.Object} zone the highlight zone
    @param {String} classNames_ the class names for the styles of the highlight
    @param {Number} index index number of the highlight zone
  */
  _drawHighlightZone: function (zone, classNames_, index) {
    
    // check if the zone belongs to the current file
    if (Multivio.masterController.get('currentFile') !== zone.url) return;
    
    // check if the zone belongs to the current page.
    if (this.get('currentPage') !== zone.page_number) return;
    
    // NOTE: not applying zoom factor, we expect adapted data in zone.current
    var cz = zone.current;
        
    this.appendChild(this.createChildView(
      SC.View.design({
        layout:  { 
          top:    cz.top,
          left:   cz.left, 
          width:  cz.width, 
          height: cz.height 
        },
        classNames: classNames_.w(),
        id: index
      })
    ));
    
  }
});
