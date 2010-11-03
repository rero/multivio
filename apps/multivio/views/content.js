/**
==============================================================================
Project: Multivio - https://www.multivio.org/
Copyright: (c) 2009-2010 RERO
License: See file license.js
==============================================================================
*/

/** @class

  The content view image. It contains the image displaying the main content. 
  
  @author {dwy}
  @extends {SC.ImageView}
  @since {0.2.0}
*/
Multivio.ImageContentView = SC.ImageView.extend(
/** @scope Multivio.ImageContentView.prototype */ {

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
    var contentWidth = parent.get('layout').width;
    var contentHeight = parent.get('layout').height;

    // adjust dimensions of child accordingly
    this.adjust('width',  contentWidth);
    this.adjust('height', contentHeight);

  }
  
});

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
  isLoadingContentBinding: SC.Binding.oneWay('Multivio.masterController.isLoadingContent'),
  
  /**
    Binds to the search result selection in the search controller.
    This binding is read only.

    @binding {SC.Selection}
  */
  searchResultSelection: null,
  searchResultSelectionBinding: SC.Binding.oneWay('Multivio.searchController.selection'),
  
  /** 
    Determines whether the highlight view (this) needs to be redrawn or not.
  
    @property {Boolean}
    @default NO
  */
  highlightNeedsUpdate: NO,
  
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
  persistentSelection: NO,
  
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
    
    // create userSelection view for selection, with 0x0 dimensions for a start
    this.userSelection = this.createChildView(
      SC.View.design({
        layout:  { top: 0, left: 0, width: 0, height: 0 },
        classNames: 'selection-transparent'.w()
      })
    );
    
    this.appendChild(this.userSelection);
    this.userSelection.set('isVisible', NO);
  
    sc_super();
  },
  
  /**
    When the selection of search results changes,
    update the position of the scroll in the view, if needed.

    @private
    @observes searchResultSelection
  */
  _searchResultSelectionDidChange: function () {

    this._updateSearchResultScroll();

  }.observes('searchResultSelection'),
  
  /**
    Update the position of the scroll in the view if needed.

    @private
  */
  _updateSearchResultScroll: function () {
    
    var selection = this.get('searchResultSelection').firstObject();
    var selectionIndex = Multivio.searchController.indexOf(selection);
    
    // store selection index, will be used to apply 
    // a specific style for the selected highlight in this.render()
    SC.RunLoop.begin();
    this.set('_selectionIndex', selectionIndex);
    SC.RunLoop.end();
    
    Multivio.logger.debug("_searchResultSelectionDidChange selection: " +
                                                                  selection);
    Multivio.logger.debug("_searchResultSelectionDidChange selectionIndex: " +
                                                             selectionIndex);
    
    if (!SC.none(selection)) {
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
      this.set('layerNeedsUpdate', YES);
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
    When the zoom changes, notify the highlight and serach controllers
    and flag the view for a redraw.

    @observes zoomFactor
  */
  zoomFactorDidChange: function () {
    
    Multivio.logger.debug('HighlightContentView#zoomFactorDidChange() %@'.
                                                fmt(this.get('zoomFactor')));

    // notify controllers the zoom change
    Multivio.selectionController.set('zoomFactor', this.get('zoomFactor'));
    Multivio.searchController.set('zoomFactor', this.get('zoomFactor'));
    
    // flag the view for a redraw, (causes render() function to be called)
    this.set('highlightNeedsUpdate', YES);
    
  }.observes('zoomFactor'),
  
  /**
    When content has finished loading (isLoadingContent changes to NO),
    update serach results' scroll and flag the view for a redraw.

    @observes isLoadingContent
  */
  isLoadingContentDidChange: function () {
    
    var loading = this.get('isLoadingContent');
    var hnu     = this.get('highlightNeedsUpdate');
    
    Multivio.logger.debug('HighlightContentView#isLoadingContentDidChange()' + 
                              ' loading: %@, highlight: %@'.fmt(loading, hnu));
    
    // finished loading, update scroll
    if (!loading) {
      Multivio.logger.debug("isLoadingContentDidChange: updating scroll");
      this._updateSearchResultScroll();
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
        
    // if persistent, create a highlight zone from this user selection 
    if (this.persistentSelection) {
      var l = this.userSelection.get('layout'), top, left;
      
      // compute top and left values, if absent ("reverse" selection)
      top = l.top ? l.top :     (this._mouseDownInfo.viewLayout.height - l.bottom - l.height);
      left = l.left ? l.left :  (this._mouseDownInfo.viewLayout.width  - l.right  - l.width);
      // send to controller
      Multivio.selectionController.
                      addHighlight(top, left, l.width, l.height, 
                        this.get('currentPage'), 'selection', this.get('zoomFactor'), NO);
    }
    
    // hide user selection rectangle
    this.userSelection.set('isVisible', NO);

    // clean up initial info
    this._mouseDownInfo = null;
        
    return YES;
  },
  
  /**
    When the selection highlights change,
    flag the view for a redraw.
  
    @observes Multivio.selectionController.[]
  */
  selectionsDidChange: function () {
    
    // flag the view for a redraw, causes render() function to be called
    //this.set('layerNeedsUpdate', YES);
    this.set('highlightNeedsUpdate', YES);

  }.observes('Multivio.selectionController.[]'),
  
  /**
    When the search results change,
    flag the view for a redraw.
  
    @observes Multivio.searchController.[]
  */
  searchResultsDidChange: function () {

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
      
    this.removeAllChildren();
    
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
      cn = (i === index? cl + ' selected-highlight' : cl);
      this._drawHighlightZone(zones.objectAt(i), cn, i);
    }
    
    // highlight pane just redrawn, no need for update anymore
    this.set('highlightNeedsUpdate', NO);
  },
  
  /**
    Creates and appends a new view to the highlight pane.

    @private
    @param {SC.Object} zone the highlight zone
    @param {String} classNames_ the class names for the styles of the highlight
    @param {Number} index the page number
  */
  _drawHighlightZone: function (zone, classNames_, index) {
    
    //Multivio.logger.debug('_drawHighlightZone, drawing position (%@x%@) at [%@,%@] with classnames: [%@]'.fmt(zone.current.width, zone.current.height, zone.current.top, zone.current.left, classNames_));
    
    //Multivio.logger.debug('## draw zone. current page: %@, zone page: %@'.fmt(this.get('currentPage'), zone.index));
    
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

/** 
  @class

The mainContentView of the application

@author che
@extends SC.ScrollView
@since 0.1.0
*/
Multivio.ContentView = SC.ScrollView.extend(
/** @scope Multivio.ContentView.prototype */ {

  /**
Binds to the masterController isLoadingContent property.

@binding {Boolean}
*/
  isLoadingContent: null,
  isLoadingContentBinding: 'Multivio.masterController.isLoadingContent',
  
  /**
Binds to the zoomRatio in the zoom controller.
@binding {Number}
*/
  zoomRatio: null,
  zoomRatioBinding: 'Multivio.zoomController.zoomRatio',
  
  /**
    Binds to the currentZoomState in the zoom controller.
    This binding is read only
    
    @binding {String}
  */
  zoomState: null,
  zoomStateBinding:
      SC.Binding.oneWay('Multivio.zoomController.currentZoomState'),

  /**
Binds to the currentValue in the rotate controller.
This binding is read only
@binding {Number}
*/
  rotateValueBinding:
      SC.Binding.oneWay('Multivio.rotateController.currentValue'),
 
  /**
Binds to the imageController's selection

@binding {url}
*/
  selection: null,
  selectionBinding: 'Multivio.imageController.selection',
  
  /**
Binds to the imageSize object of the CDM

@binding {Hash}
*/
  imageSize: null,
  imageSizeBinding: 'Multivio.CDM.imageSize',

  /**
The native image size
*/
  nativeWidth: undefined,
  nativeHeight: undefined,
  
  /**
The next asked Url if user choose to proceed loading a bigg image
*/
  _nextUrl: null,
  
  needToScrollUp: YES,
  isNewImage: NO,
  
  /**
ZoomRatio has changed, check if we need to load a new image

@observes zoomRatio
*/
  zoomRatioDidChange: function () {
    var zoomVal = this.get('zoomRatio');
    if (SC.none(this.get('zoomState'))) {
      this._loadNewImage();
    }
  }.observes('zoomRatio'),
  
  /**
ZoomState has changed, check if we need to load a new image
@observes zoomState
*/
  zoomStateDidChange: function () {
    var state = this.get('zoomState');
    if (!SC.none(state)) {
      this._loadNewImage();
    }
  }.observes('zoomState'),
  
  /**
Rotate value has changed, check if we need to load a new image.
@observes rotateValue
*/
  rotateValueDidChange: function () {
    var rot = this.get('rotateValue');
    if (!SC.none(rot)) {
      this._loadNewImage();
    }
  }.observes('rotateValue'),
  
  /**
ImageSize object has changed, see if we can load the image
@observes imageSize
*/
  imageSizeDidChange: function () {
    var size = this.get('imageSize');
    if (!SC.none(size)) {
      var currentSelection = this.get('selection');
      if (!SC.none(currentSelection) && !SC.none(currentSelection.firstObject())) {
        
        var defaultUrl = currentSelection.firstObject().url;
        var index = defaultUrl.indexOf('page_nr=');
        if (index === -1) {
          index = defaultUrl.indexOf('url=');
        }
        var fileUrl = defaultUrl.substring(index, defaultUrl.length);
        var imageSize = this.get('imageSize')[fileUrl];
        // imageSize is avalaible
        if (imageSize !== -1 && !SC.none(imageSize)) {
          this.nativeWidth = imageSize.width;
          this.nativeHeight = imageSize.height;
          this._loadNewImage();
        }
      }
    }
  }.observes('imageSize'),
  

  /**
Callback applied after image has been loaded.
It puts the image in the container and adjust the size
(add & remove scroll), then check zoom buttons.

@private
@callback SC.imageCache.load
@param {String} url
@param {Image} image
*/
  _adjustSize: function (url, image) {
    SC.RunLoop.begin();
    var content = this.get('contentView');
    
    // adjust scroll
    var isVerticalVisible = this.get('isVerticalScrollerVisible');
    if (isVerticalVisible) {
      if (this.isNewImage) {
        if (this.needToScrollUp) {
          if (this.get('isHorizontalScrollerVisible')) {
            this.set('horizontalScrollOffset', 0);
            this.set('verticalScrollOffset', 0);
          }
          else {
            this.set('verticalScrollOffset', 0);
          }
        }
        else {
          this.set('verticalScrollOffset', this.get('maximumVerticalScrollOffset'));
          this.needToScrollUp = YES;
        }
      }
    }

    // wyd: set inner content view instead 
    // (additional layer because of highlight pane)
    content.get('innerContent').set('value', url);
    content.adjust('width', image.width);
    content.adjust('height', image.height);
    content.adjust('left', 0);
    SC.RunLoop.end();
    
    if (!this.get('isHorizontalScrollerVisible')) {
      content.adjust('left', undefined);
    }

    // calculate zoomRatio if zoomState !== null
    var state = this.get('zoomState');
    if (!SC.none(state)) {
      var rot = this.get('rotateValue');
      Multivio.zoomController.calculateRatio(rot, image.width, image.height,
          this.nativeWidth);
    }
    
    //enabled buttons
    SC.RunLoop.begin();
    this.set('isLoadingContent', NO);
    SC.RunLoop.end();
    this.isNewImage = NO;
    Multivio.logger.info('ContentView#_adjustSize');
  },
  
  /**
Load the image with adapated width and height and rotation
*/
  _loadNewImage: function () {
    var currentSelection = this.get('selection');
    if (!SC.none(currentSelection) && !SC.none(currentSelection.firstObject())) {
      var defaultUrl = currentSelection.firstObject().url;
      // the index of the url parameter
      var urlIndex = defaultUrl.indexOf('url');
      // get zoomState
      var zoomSt = this.get('zoomState');
      var rot = this.get('rotateValue');
      var maxRes = Multivio.configurator.get('zoomParameters').maxResolution;
      var isBiggerThanMax = NO;
      var newUrl = "";
      // load fixtures or real images
      if (Multivio.initializer.get('inputParameters').scenario === 'fixtures') {
        newUrl = defaultUrl;
      }
      else {
        switch (zoomSt) {
        case Multivio.zoomController.FULLPAGE:
        console.info('Full ');
          var windowWidth = this.get('frame').width;
          var windowHeight = this.get('frame').height;
          if (rot % 180 === 0) {
            newUrl = defaultUrl.substring(0, urlIndex).concat('max_width=' +
                windowWidth + '&max_height=' + windowHeight + '&angle=' + rot +
                '&').concat(defaultUrl.substring(urlIndex, defaultUrl.length));
          }
          else {
            newUrl = defaultUrl.substring(0, urlIndex).concat('max_width=' +
                windowHeight + '&max_height=' + windowWidth + '&angle=' + rot +
                '&').concat(defaultUrl.substring(urlIndex, defaultUrl.length));
          }
          
          // calculate if the image size > maxRes
          var imageMaxW = this.nativeWidth / windowWidth;
          var imageMaxH = this.nativeHeight / windowHeight;
          var maxRat = imageMaxW > imageMaxH ? imageMaxW : imageMaxH;
          var tempM = (this.nativeWidth / maxRat) * (this.nativeHeight / maxRat);
          if (tempM > maxRes) {
            isBiggerThanMax = YES;
          }
          break;

        case Multivio.zoomController.PAGEWIDTH:
          var calculatedWidth = this.get('frame').width -
              this.get('childViews')[1].get('scrollbarThickness');
          if (rot % 180 === 0) {
            newUrl = defaultUrl.substring(0, urlIndex).concat('max_width=' +
                calculatedWidth + '&angle=' + rot +
                '&').concat(defaultUrl.substring(urlIndex, defaultUrl.length));
          }
          else {
            newUrl = defaultUrl.substring(0, urlIndex).concat('max_height=' +
                calculatedWidth + '&angle=' + rot +
                '&').concat(defaultUrl.substring(urlIndex, defaultUrl.length));
          }
          // calculate if the image size > maxRes
          var rat = this.nativeWidth / windowWidth;
          var nextSize = (this.nativeWidth / rat) * (this.nativeHeight / rat);
          if (nextSize > maxRes) {
            isBiggerThanMax = YES;
          }
          break;

        case Multivio.zoomController.HUNDREDPERCENT:
          newUrl = defaultUrl.substring(0, urlIndex).concat('angle=' + rot +
            '&').concat(defaultUrl.substring(urlIndex, defaultUrl.length));
        
          // calculate if the image size > maxRes
          if (this.nativeWidth * this.nativeHeight > maxRes) {
            isBiggerThanMax = YES;
          }
          break;
        
        default:
          var zoomVal = this.get('zoomRatio');
          Multivio.logger.info('currentpercent ' + zoomVal);
          var newWidth = this.nativeWidth * zoomVal;
          var newHeight = this.nativeHeight * zoomVal;

          newUrl = defaultUrl.substring(0, urlIndex).concat('max_width=' +
              parseInt(newWidth, 10) + '&max_height=' +
              parseInt(newHeight, 10) + '&angle=' + rot +
              '&').concat(defaultUrl.substring(urlIndex, defaultUrl.length));
            
          // calculate if the image size > maxRes
          if (parseInt(newWidth, 10) * parseInt(newHeight, 10) > maxRes) {
            isBiggerThanMax = YES;
          }
          break;
        }
      }
      if (isBiggerThanMax) {
        this._nextUrl = newUrl;
        Multivio.usco.showAlertPaneWarn(
            '_Loading the requested resolution may take a long time'.loc(),
            '_Would you like to proceed?'.loc(),
            '_Proceed'.loc(),
            '_Use lower resolution'.loc(),
            this);
      }
      else {
        console.info('URL '+newUrl);
        SC.imageCache.loadImage(newUrl, this, this._adjustSize);
      }
    }
  },
  
  /**
Override render method to force top set frame property
@param {Object} context
@param {Boolean} firstTime
*/
  render: function (context, firstTime) {
    this.set('frame', {});
    sc_super();
  },
  
  /**
Delegate method of the Multivio.usco.showAlertPaneWarn
@param {String} pane the pane instance
@param {} status
*/
  alertPaneDidDismiss: function (pane, status) {

    switch (status) {
    
    case SC.BUTTON1_STATUS:
      SC.imageCache.loadImage(this._nextUrl, this, this._adjustSize);
      break;
        
    case SC.BUTTON2_STATUS:
      // load the best image
      var currentSelection = this.get('selection');
      Multivio.zoomController.setBestStep(this.nativeWidth, this.nativeHeight);
      break;
    }
  },
  
  /**
The view size has changed load a new image if the zoom state is Full or
Width.
TODO: if possible find a method that is called once.
*/
  viewDidResize: function () {
    // force frame to be updated and refresh all children
    this.set('frame', {});
    for (var i = 0; i < this.get('childViews').length; i++) {
      var oneChild = this.get('childViews')[i];
      oneChild.layoutDidChange();
    }
    var zoomSt = this.get('zoomState');
    if (zoomSt === Multivio.zoomController.PAGEWIDTH ||
        zoomSt === Multivio.zoomController.FULLPAGE) {
      this._loadNewImage();
    }
  },
  
  /**
Updates value by observing changes in the imageController's
selection
@private
@observes selection
*/
  _selectionDidChange: function () {
    var currentSelection = this.get('selection');
    if (!SC.none(currentSelection) && !SC.none(currentSelection.firstObject())) {
      // reset nativeWidth, nativeHeight & rotate
      this.nativeWidth = 0;
      this.nativeHeight = 0;
      Multivio.rotateController.resetRotateValue();
      this.isNewImage = YES;
      
      var defaultUrl = currentSelection.firstObject().url;
      // first check if page_nr exist
      var index = defaultUrl.indexOf('page_nr=');
      if (index === -1) {
        index = defaultUrl.indexOf('url=');
      }
      var fileUrl = defaultUrl.substring(index, defaultUrl.length);
      console.info('A= '+fileUrl);
      var nativeSize = Multivio.CDM.getImageSize(fileUrl);
      // nativeSize is avalaible
      if (nativeSize !== -1) {
        this.nativeWidth = nativeSize.width;
        this.nativeHeight = nativeSize.height;
        this._loadNewImage();
      }
    }
  }.observes('selection'),
  
  /**
    Return the value to scroll to see the next part of the document
    
    @return {Number} the value to scroll
  */
  scrollValueScreen: function () {
    // calcalate the visible part of the document to scroll to the next part
    var visiblePart = this.get('contentView').get('frame').height;
    var frameHeight = this.get('frame').height;
    var ratio = visiblePart / frameHeight;
    var toScroll = this.get('maximumVerticalScrollOffset') / ratio;
    toScroll += this.get('verticalScrollerView').thumbLength();
    return toScroll;
  },
  
  /**
    This Method is call when a key of the keyboard has been selected
      
    @param {SC.Event} Event fired 
    @returns {Boolean} Return value if executed or not 
  */
  keyDown: function (evt) {
    if (! this.isLoadingContent) {
      var isVisible = YES;
      switch (evt.which) {
      
      // page_up
      case 33:
        // shift + page_up
        if (evt.shiftKey) {
          return NO;
        }
        else {
          if (this.get('verticalScrollOffset') === 0) {
            this.needToScrollUp = NO;
            Multivio.navigationController.goToPreviousPage();
          }
          else {
            this.scrollBy(null, -this.scrollValueScreen());
          }
          return YES;  
        }
        break;
      
      // page_down  
      case 34:
        // shift + page_down
        if (evt.shiftKey) {
          return NO;
        }
        else {
          var vertical = this.get('verticalScrollOffset');
          if (vertical >= this.get('maximumVerticalScrollOffset')) {
            Multivio.navigationController.goToNextPage();
          }
          else {
            this.scrollBy(null, +this.scrollValueScreen());
          }
          return YES;  
        }
        break;
    
      // left
      case 37:
        isVisible = this.get('isHorizontalScrollerVisible');
        if (isVisible) {
          if (this.get('horizontalScrollOffset') !== 0) {
            this.scrollBy(-40, null);
          }
        }
        return YES;
      // up
      case 38:
        isVisible = this.get('isVerticalScrollerVisible');
        if (isVisible) {
          if (this.get('verticalScrollOffset') !== 0) {
            this.scrollBy(null, -40);
          }
          else {
            if (Multivio.masterController.get('currentPosition') !== 1) {
              this.needToScrollUp = NO;
              Multivio.navigationController.goToPreviousPage();
            }
          }
        }
        else {
          // move to the previous page
          this.needToScrollUp = YES;
          Multivio.navigationController.goToPreviousPage();
        }
        return YES;
      // right
      case 39:
        isVisible = this.get('isHorizontalScrollerVisible');   
        if (isVisible) {
          var maxHor = this.get('maximumHorizontalScrollOffset');
          if (this.get('horizontalScrollOffset') < maxHor) {
            this.scrollBy(40, null);
          }
        }
        return YES;
       // down
      case 40:
        isVisible = this.get('isVerticalScrollerVisible');
        if (isVisible) {
          var maxVert = this.get('maximumVerticalScrollOffset');
          if (this.get('verticalScrollOffset') < maxVert) {
            this.scrollBy(null, 40);
          }
          else {
            Multivio.navigationController.goToNextPage();
          } 
        }
        else {
          // move to the next page
          Multivio.navigationController.goToNextPage();
        }
        return YES;
      default:
        return NO;
      }
    }
  },
  
  /**
    Intercept mouse wheel event and see if we must go to the next or the
    previous page.
    
    @param {SC.Event}
  */  
  mouseWheel: function (evt) {
    if (! this.isLoadingContent) {
      // evt.wheelDeltaY > 0 go down
      if (evt.wheelDeltaY > 0) {
        if (this.get('maximumVerticalScrollOffset') === 
          this.get('verticalScrollOffset')) {
          // move to the next page
          Multivio.navigationController.goToNextPage();
        }
      }
      if (evt.wheelDeltaY < 0) {
        if (this.get('verticalScrollOffset') === 0) {
          this.needToScrollUp = NO;
          Multivio.navigationController.goToPreviousPage();
        }
      } 
      sc_super();
    }  
  }

});
