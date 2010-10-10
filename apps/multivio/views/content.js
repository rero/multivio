/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** @class

  The content view image. 
  
  @author {dwy}
  @extends {SC.ImageView}
  @since {0.1.0}
*/
Multivio.ImageContentView = SC.ImageView.extend(
/** @scope Multivio.ImageContent.prototype */ {

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
    
    // debug message
    //Multivio.logger.debug('ImageContentView#parentViewDidResize to %@x%@'.fmt(contentWidth, contentHeight));
  }
  
});

/** @class

  The highlight layer on top of the content view image (Multivio.ImageContentView).
  It contains the highlights for current search results as well as the words selected by the user
  using drag and drop.
  
  @author {dwy}
  @extends {SC.View}
  @since {0.1.0}
*/
Multivio.HighlightContentView = SC.View.extend(
/** @scope Multivio.HighlightContent.prototype */ {
  
  /**
    @binding {Number}

    Binds to the masterController's masterSelection.
  */
  currentPage: null,
  currentPageBinding: 
      SC.Binding.oneWay("Multivio.masterController.currentPosition"),
  
  /**
      Binds to the masterController isLoadingContent property.
      @binding {Boolean}
  */
  isLoadingContent: null,
  isLoadingContentBinding: 'Multivio.masterController.isLoadingContent',
  
  /**
    Binds to the search result selection in the search controller

    @binding {String}
  */
  searchResultSelection: null,
  searchResultSelectionBinding: "Multivio.searchController.selection",
  
  /** 
    @property {SC.Object}
    
    Determines whether the highlight view (this) needs to be redrawn or not.
    
    @default NO
  */
  highlightNeedsUpdate: NO,
  
  /** 
    @binding {SC.Array}
    
    Array of user selected zones.
    
    @default []
  */
  selections: [],
  selectionsBinding: 'Multivio.selectionController.[]',
  
  /** 
    @binding {SC.Array}
    
    Array of search results.
    
    @default []
  */
  searchResults: [],
  searchResultsBinding: 'Multivio.searchController.[]',
  
  /**
    @binding {Number}
    
    Binds to the zoom factor in the zoom controller.
   */
  zoomFactor: null, 
  zoomFactorBinding:
      SC.Binding.oneWay('Multivio.zoomController.zoomRatio'),
  
  /** 
    @property {SC.View}
    
    rectangle of user selection during mouse drag
    
    @default null
  */
  userSelection: null,
  
  /** 
    @property {SC.Object}
    
    offset of mouse on page relative to the frame, Y coordinate
    
    @default null
  */
  _mouseDownInfo: null,


  /** 
    @property {SC.Object}
    
    if selection is persistent, user-drawn rectangle remains on
    view after mouseUp, otherwise removed.
    
    @default null
  */  
  persistentSelection: YES,
  
  /** 
    @property {Number}
    Original width.

    @private
    @default {null}
  */  
  _originalWidth: null,
  
  /** 
    @property {Number}
    
    Original height.
    
    @private
    @default {null}
  */    
  _originalHeight: null,
  
  /** 
    @property {Number}
    
    index of currently selected search result
    
    @private
    @default {null}
  */    
  _selectionIndex: null,
  
  
  init: function () {
    
    // create userSelection viewfor selection, with 0x0 dimensions for a start
    this.userSelection = this.createChildView(
      SC.View.design({
        layout:  { top: 0, left: 0, width: 0, height: 0 },
        classNames: 'selection-transparent'.w()
      })
    );
    
    this.appendChild(this.userSelection);
    this.userSelection.set('isVisible', NO);
    
    //Multivio.logger.debug('HighlightContentView#init() %@x%@'.fmt(this));  

    sc_super();
  },
  
  /**
    Update the position of the scroll in the view if needed.

    @private
    @observes searchResultSelection
  */
  _searchResultSelectionDidChange: function () {
    
    var selection = this.get('searchResultSelection').firstObject();
    var selectionIndex = Multivio.searchController.indexOf(selection);
    
    // store selection index, will be used to apply a specific style in render()
    SC.RunLoop.begin();
    this.set('_selectionIndex', selectionIndex);
    SC.RunLoop.end();
    
    //console.info("_searchResultSelectionDidChange selection: " + selection);
    //console.info("_searchResultSelectionDidChange selectionIndex: " + selectionIndex);
    
    if (!SC.none(selection)) {
      // retrieve the list of the search results visible in the view
      //var listView = this.get('contentView').get('childViews');
      var listView = this.get('childViews');
      var sr = undefined;
      for (var i = 0; i < listView.get('length'); i++) {
        sr = listView[i];

        if (sr.id === selectionIndex) {
          Multivio.logger.debug('updating search result scroll'); 
          //console.info("selection id: " + selectionIndex);
          //console.info("listView id: " + sr.id);
          sr.scrollToVisible();
        
          break;
        }
      }
      // need to redraw the highlight zones to show current selection
      this.set('layerNeedsUpdate', YES);
    }
  }.observes('searchResultSelection'),
  
  currentPageDidChange: function () {
    
    //Multivio.logger.debug('HighlightContentView#currentPageDidChange() %@'.fmt(this.get('currentPage')));
      
    // ask for a redraw of highlight pane (each highlight zone is assigned to a page)
    //this.set('layerNeedsUpdate', YES);
    //SC.RunLoop.begin();
    this.set('highlightNeedsUpdate', YES);
    //SC.RunLoop.end();
    
  }.observes('currentPage'),
  
  zoomFactorDidChange: function () {
    Multivio.logger.debug('HighlightContentView#zoomFactorDidChange() %@'.fmt(this.get('zoomFactor')));

    Multivio.selectionController.set('zoomFactor', this.get('zoomFactor'));
    Multivio.searchController.set('zoomFactor', this.get('zoomFactor'));
    
    // flag the view for a redraw, (causes render() function to be called)
    //this.set('layerNeedsUpdate', YES);
    //SC.RunLoop.begin();
    this.set('highlightNeedsUpdate', YES);
    //SC.RunLoop.end();
    
  }.observes('zoomFactor'),
  
  isLoadingContentDidChange: function () {
    
    var loading = this.get('isLoadingContent');
    var hnu     = this.get('highlightNeedsUpdate');
    
    Multivio.logger.debug('HighlightContentView#isLoadingContentDidChange() loading: %@, highlight: %@'.fmt(loading, hnu));
    
    // if the highlight pane needs an update, 
    // flag the view for a redraw, which causes render() function to be called.
    // Update only after 'isLoadingContent' is NO again, 
    // to wait for the image to finish loading
    if (hnu && !loading) {
      this.set('layerNeedsUpdate', YES);
    }  
  }.observes('isLoadingContent'),
  
  
  /* mouse events */

  mouseDown: function (evt) {

    // cancel selections on current page
    Multivio.selectionController.removeAllHighlights();
    //Multivio.searchController.removeAllHighlightsOnPage(this.get('currentPage'));
    
    // get current rectangle and view layout
    var rectLayout = this.userSelection.get('layout');
    var viewLayout = this.get('layout');
    
    // get position of mouse relative to the view
    var loc = this.convertFrameFromView({ x: evt.pageX, y: evt.pageY });
      
    // save mouse and rectangle positions when mouse is clicked
    this._mouseDownInfo = {
      pageX:  evt.pageX,    // coordinates of mouse on the page
      pageY:  evt.pageY,
      x:      loc.x,        // coordinates of mouse on the view
      y:      loc.y,       
      rectLayout: rectLayout, // TODO: delete, unused // coordinates and dimensions of rectangle on the view
      viewLayout: viewLayout
    };
    
    //Multivio.logger.debug('# HIGHLIGHT PANE: loc x y %@, %@'.fmt(loc.x, loc.y));
    
    // set the start coordinates (top left) of the rectangle where the mouse was clicked
    this.userSelection.adjust('left', loc.x);
    this.userSelection.adjust('top',  loc.y);
    this.userSelection.adjust('width',  0);
    this.userSelection.adjust('height', 0);
    this.userSelection.set('isVisible', YES);

    return YES;
  },
  
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

  mouseUp: function (evt) {
    
    // current mouse position relative to view
    //Multivio.logger.debug('# HIGHLIGHT PANE: mouse up %@, %@'.fmt(this._mouseDownInfo.x, this._mouseDownInfo.y));
        
    // if persistent, create a highlight zone from this user selection 
    if (this.persistentSelection) {
      var l = this.userSelection.get('layout'), top, left;
      // compute top and left values, if absent ("reverse" selection)
      // TODO: compute this in controller instead ? would need to pass view and user sel. layouts/dimensions
      top = l.top ? l.top :     (this._mouseDownInfo.viewLayout.height - l.bottom - l.height);
      left = l.left ? l.left :  (this._mouseDownInfo.viewLayout.width  - l.right  - l.width);
      // send to controller
      Multivio.selectionController.addHighlight(top, left, l.width, l.height, this.get('currentPage'), 'selection', this.get('zoomFactor'), NO);
      // TODO: test: create a "search result" highlight instead
      //Multivio.searchController.addHighlight(top, left, l.width, l.height, this.get('currentPage'), 'search', this.get('zoomFactor'), NO);
    }
    
    // hide user selection rectangle
    this.userSelection.set('isVisible', NO);

    // clean up
    this._mouseDownInfo = null;
        
    return YES;
  },
  

  // NOTE: need to observe '[]' of the ArrayController.
  //              observing local variable 'selections' does not work
  selectionsDidChange: function () {
    
    //Multivio.logger.debug('################ selectionsDidChange, enter');
    
    // flag the view for a redraw, causes render() function to be called
    //this.set('layerNeedsUpdate', YES);
    this.set('highlightNeedsUpdate', YES);

  }.observes('Multivio.selectionController.[]'),
  
  searchResultsDidChange: function () {
    
    //Multivio.logger.debug('################ searchResultsDidChange, enter');
    
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
    
    // TODO TEST
    //this.set('highlightNeedsUpdate', YES);
    this.set('layerNeedsUpdate', YES);
    
    // debug message
    //Multivio.logger.debug('HighlightContentView#parentViewDidResize to %@x%@'.fmt(contentWidth, contentHeight));
  },
  
  /**
    @method
    
    Override render method to draw highlight zones on the pane
    
    TODO: draw on the correct page. Must check that the place where there are search results
    and/or text selections is visible
    (on the main content page or thumbnails). 
    Possible alternatives: - a highlight pane knows its page number and looks in the global search result list
                            whether it must draw highlight zones or not
                           - the search controller tells the pages with search results on it to redraw (render) their
                            highlight pane

    @param {Object} context
    @param {Boolean} firstTime
  */
  render: function (context, firstTime) {

    if (firstTime) {
      sc_super();
    }
    
    // TODO differentiate between user selection, highlight and search results
    // TODO: more optimised way of replacing all children
/*    // below is an optimized version of: this.replaceAllChildren(views);
    containerView.beginPropertyChanges();
    containerView.destroyLayer().removeAllChildren();
    containerView.set('childViews', views); // quick swap
    containerView.replaceLayer();
    containerView.endPropertyChanges();
*/    
    this.removeAllChildren();
    
    // get selections' highlights
    var zones = this.get('selections');
    var len   = zones.get('length');
    var i;
    //Multivio.logger.debug('HighlightContentView#render [%@], positions %@, (%@)'.fmt(this, len, pos.objectAt(len - 1)));
    
    // redraw all selection zones
    // NOTE: 'selections' is an array of zones
    for (i = 0; i < len; i++) {
      this._drawHighlightZone(zones.objectAt(i), 'highlight selection-highlight', i);
      //Multivio.logger.debug('HighlightContentView#render selections %@, (%@,%@)'.fmt(len, zones.objectAt(i).top, zones.objectAt(i).left));
    }
    
    // get current search results highlights
    zones = this.get('searchResults');
    len   = zones.get('length');
    
    // redraw all search results' zones
    var cl = 'highlight search-highlight';
    var cn = '';
    var index = this.get('_selectionIndex');
    for (i = 0; i < len; i++) {
      //Multivio.logger.debug('HighlightContentView#render search results %@, (%@,%@)'.fmt(len, zones.objectAt(i)));
      cn = (i === index? cl + ' selected-highlight' : cl);
      this._drawHighlightZone(zones.objectAt(i), cn, i);
    }
    
    // highlight pane just redrawn, no need for update anymore
    this.set('highlightNeedsUpdate', NO);
  },
  
  // TODO description
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
        if (imageSize !== -1) {
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
    var content =  this.get('contentView');
    //wyd: set inner content view instead
    //content.set('value', url);
    content.get('innerContent').set('value', url);
    content.adjust('width', image.width);
    content.adjust('height', image.height);    
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
    Multivio.logger.debug('ContentView#_adjustSize');
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
          if (rot % 180 === 0) {  
            newUrl = defaultUrl.substring(0, urlIndex).concat('max_width=' +
                this.get('frame').width + '&angle=' + rot +
                '&').concat(defaultUrl.substring(urlIndex, defaultUrl.length));
          }
          else {
            newUrl = defaultUrl.substring(0, urlIndex).concat('max_height=' +
                this.get('frame').width + '&angle=' + rot +
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
        SC.imageCache.loadImage(newUrl, this, this._adjustSize);
      }
    }
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
      
      var defaultUrl = currentSelection.firstObject().url;
      // first check if page_nr exist
      var index = defaultUrl.indexOf('page_nr=');
      if (index === -1) {
        index = defaultUrl.indexOf('url=');
      }
      var fileUrl = defaultUrl.substring(index, defaultUrl.length);
      var nativeSize = Multivio.CDM.getImageSize(fileUrl);
      // nativeSize is avalaible
      if (nativeSize !== -1) {
        this.nativeWidth = nativeSize.width;
        this.nativeHeight = nativeSize.height;
        this._loadNewImage();
      }
    }
  }.observes('selection')

});
