/**
==============================================================================
Project: Multivio - https://www.multivio.org/
Copyright: (c) 2009-2011 RERO
License: See file license.js
==============================================================================
*/

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
    Binds to the isPanButtonEnabled of the panController
    
    @binding {Boolean}
  */
  panButton: NO,
  panButtonBinding: 'Multivio.panController.isPanButtonEnabled',
  glassButton: NO,
  glassButtonBinding: 'Multivio.paletteController.isGlassButtonEnabled',
  
  /**  
    Variable that contains mouse pointer position. Information used by pan
    
    @ private 
  */ 
  _mouseDownInfo: null, 

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
    Whether the user has already authorized or not loading images of large
    resolutions. This is used in order to avoid asking repeatedly the same
    question:
  
    "Loading the requested resolution may take a long time. Would you like
    to proceed?"
  */
  largeResolutionsAuthorized: NO,
  
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
    ScrollerVisible property has changed, see if we can enabled (disabled) pan
    button
    
    @observes isHorizontalScrollerVisible and isVerticalScrollerVisible
  */
  scrollStateDidChange: function () {
    if (this.get('isHorizontalScrollerVisible') || 
        this.get('isVerticalScrollerVisible')) {
      this.set('panButton', YES);
      this.set('glassButton', YES);
    }
    else {
      this.set('panButton', NO);
      this.set('glassButton', NO);
    }
    
  }.observes('isHorizontalScrollerVisible', 'isVerticalScrollerVisible'),
  

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
            SC.RunLoop.begin();
            this.set('verticalScrollOffset', 0);
            SC.RunLoop.end();
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
    
    // flag highlight pane for a redraw
    content.get('highlightpane').set('layerNeedsUpdate', YES);
    
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
      if (isBiggerThanMax && this.get('largeResolutionsAuthorized') === NO) {
        this._nextUrl = newUrl;
        Multivio.usco.showAlertPaneWarn(
            '_Loading the requested resolution may take a long time'.loc(),
            '_Would you like to proceed?'.loc(),
            '_Proceed'.loc(),
            '_Use lower resolution'.loc(),
            this);
      }
      else {
        Multivio.logger.debug('load new image ' + newUrl);
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
      // go ahead and load image with large resolution
      SC.imageCache.loadImage(this._nextUrl, this, this._adjustSize);
      // from now on large resolutions are permanently authorized
      this.set('largeResolutionsAuthorized', YES);
      break;
        
    case SC.BUTTON2_STATUS:
      // load the best possible image within the limited resolution
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
    this.updateLayer();
    var zoomSt = this.get('zoomState');
    if (zoomSt === Multivio.zoomController.PAGEWIDTH ||
        zoomSt === Multivio.zoomController.FULLPAGE && 
        this.get('frame').width !== 0) {
      
      SC.RunLoop.begin();
      this.set('isLoadingContent', YES);
      SC.RunLoop.end();
      this._loadNewImage();
    }
    else {
      if (!this.get('isHorizontalScrollerVisible')) {
        this.get('contentView').adjust('left', undefined);
      }
    }
    // if magnifying palette is active, refresh draw zone
    if (Multivio.paletteController.get('isMagnifyingGlassActive')) {
      Multivio.getPath('views.magnifyingPalette').get('contentView').drawZone();
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
    Refresh draw zone of the magnifying glass palette observing offsets of scrolls
    
    
    @observes verticalScrollOffset, horizontalScrollOffset 
  */
  scrollOffsetDidChange: function () {
    if (Multivio.paletteController.get('isMagnifyingGlassActive')) {
      Multivio.getPath('views.magnifyingPalette').get('contentView').drawZone();
    }
  }.observes('verticalScrollOffset', 'horizontalScrollOffset'),
  
  /**
    On mouse down hide the current palette or save mouse pointer position
    
    @param {SC.Event} Event fired
  */
  mouseDown: function (evt) {
    if (Multivio.panController.get('isPanActive')) {
      // indicate dragging - rerenders view
      this.set('isDragging', YES);
      this._mouseDownInfo = {
        pageX: evt.pageX, // save mouse pointer loc for later use
        pageY: evt.pageY
      };
      return YES;
    }
    else {
      Multivio.paletteController.hidePalette(null);
      // declare the event as not handled to allow browser context menu
      return NO;
    }
  },
  
  /**
    On mouse up reset mouseDownInfo variable
    
    @param {SC.Event} Event fired
  */  
  mouseUp: function (evt) {
    if (Multivio.panController.get('isPanActive')) {
      // no longer dragging - will rerender
      this.set('isDragging', NO);

      // apply one more time to set final position
      this.mouseDragged(evt); 
      this._mouseDownInfo = null; // cleanup info
      return YES; // handled!
    }
  },
  
  /**
    On mouse dragged set scrollHoffset
    
    @param {SC.Event} Event fired
  */  
  mouseDragged: function (evt) {
    if (Multivio.panController.get('isPanActive')) {
      if (this.get('isVerticalScrollerVisible'))  {
        var currentVerticalOffset = this.get('verticalScrollOffset');
        var newVerticalOffset = currentVerticalOffset + 
            (this._mouseDownInfo.pageY - evt.pageY);
        this.set('verticalScrollOffset', newVerticalOffset);
      }
      if (this.get('isHorizontalScrollerVisible')) {
        var currentHorizontalOffset = this.get('horizontalScrollOffset');
        var newHorizontalOffset = currentHorizontalOffset + 
            (this._mouseDownInfo.pageX - evt.pageX);
        this.set('horizontalScrollOffset', newHorizontalOffset);
      }
      // save new values
      this._mouseDownInfo = {
        pageX: evt.pageX,
        pageY: evt.pageY
      };
      return YES;
    }
  },
  
  /**
    Move vertical and(or) horizontal scrollbars
    
    @param {Number} vertical  
    @param {Number} horizontal  
  */
  moveScroll: function (vertical, horizontal) {
    if (this.get('isVerticalScrollerVisible') && vertical !== 0)  {
      var currentVerticalOffset = this.get('verticalScrollOffset');
      var newVerticalOffset = currentVerticalOffset + vertical;
      if (newVerticalOffset > 0 || newVerticalOffset < this.get('maximumVerticalScrollOffset')) {
        this.set('verticalScrollOffset', newVerticalOffset);
      }
    }
    if (this.get('isHorizontalScrollerVisible') && horizontal !== 0) {
      var currentHorizontalOffset = this.get('horizontalScrollOffset');
      var newHorizontalOffset = currentHorizontalOffset + horizontal; 
      if (newHorizontalOffset > 0 || newHorizontalOffset < this.get('maximumHorizontalScrollOffset')) {    
        this.set('horizontalScrollOffset', newHorizontalOffset);
      }
    }
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
            Multivio.navigationController.goToPrevious();
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
            Multivio.navigationController.goToNext();
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
              Multivio.navigationController.goToPrevious();
            }
          }
        }
        else {
          // move to the previous page
          this.needToScrollUp = YES;
          Multivio.navigationController.goToPrevious();
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
            Multivio.navigationController.goToNext();
          } 
        }
        else {
          // move to the next page or document
          Multivio.navigationController.goToNext();
        }
        return YES;
      // ctrl + c (or 'apple' + c for mac)
      case 67:
        var cmd = evt.commandCodes();
              
        if (cmd.indexOf('ctrl_c') !== -1) {
          
          // get input field of the SC.TextFieldView used for selection
          // NOTE: this is done a second time (was done already in 
          // selectedTextStringDidChange()) to select the text,
          // as seemingly Safari needs it done twice so the text field
          // is correctly selected
          Multivio.selectionController.selectTextField();
          
          // put focus back on main content
          var main = SC.$('div.sc-view .image-and-highlight-container')[0];
          main.focus();
        }
        
        // declare the event as not handled so the browser still
        // does his job (copy text) on ctrl + c
        return NO;
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
          Multivio.navigationController.goToNext();
        }
      }
      if (evt.wheelDeltaY < 0) {
        if (this.get('verticalScrollOffset') === 0) {
          this.needToScrollUp = NO;
          Multivio.navigationController.goToPrevious();
        }
      } 
      sc_super();
    }  
  }

});
