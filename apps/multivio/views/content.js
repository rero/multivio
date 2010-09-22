/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
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
    
    // verify if verticalScroll and horizontalScroll exist and need to be moved
    var needVerticalScrollToMove = (this.get('isVerticalScrollerVisible') &&
        this.get('verticalScrollOffset') !== 0) ? YES : NO;
    var needHorizontalScrollToMove = (this.get('isHorizontalScrollerVisible') && 
        this.get('horizontalScrollOffset') !== 0) ? YES : NO;
    
    if (needVerticalScrollToMove || needHorizontalScrollToMove) {
      // verify if we have a new image (not same url) 
      var currentUrl = content.get('value');
      var currentUrlIndex = currentUrl.indexOf('&url=');
      var tempUrl = currentUrl.substring(currentUrlIndex + 5, currentUrl.length);
      
      var nextUrlIndex = url.indexOf('&url=');
      var nextUrl = url.substring(nextUrlIndex + 5, url.length);
      // if new url move scroll bar if needed
      if (tempUrl !== nextUrl) {
        if (needHorizontalScrollToMove) {
          this.set('horizontalScrollOffset', 0);
        }
        if (needVerticalScrollToMove) {
          this.set('verticalScrollOffset', 0);
        }
      }
      else {
        // same url, verify if page_nr is different
        var currentPagenrIndex = currentUrl.indexOf('page_nr=');
        var currentPageNumber = undefined;
        if (currentPagenrIndex !== -1) {
          var pagenrEnd = currentUrl.indexOf('&');
          currentPageNumber = currentUrl.substring(currentPagenrIndex + 8, pagenrEnd);
        }
        var nextPagenrIndex = url.indexOf('page_nr=');
        var nextPageNumber = undefined;
        if (nextPagenrIndex !== -1) {
          var nextpagenrEnd = url.indexOf('&');
          nextPageNumber = url.substring(nextPagenrIndex + 8, nextpagenrEnd);
        }
        if (currentPageNumber !== nextPageNumber) {
          if (needHorizontalScrollToMove) {
            this.set('horizontalScrollOffset', 0);
          }
          if (needVerticalScrollToMove) {
            this.set('verticalScrollOffset', 0);
          }
        }
      }
    }

    content.set('value', url);
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
