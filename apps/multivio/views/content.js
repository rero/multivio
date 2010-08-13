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
    Binds to the masterController isLoading property.

    @binding {Boolean}
  */
  isLoading: null,
  isLoadingBinding: 'Multivio.masterController.isLoading',
  
  /**
    Binds to the zoomValue in the zoom controller.
    
    @binding {Number}
  */ 
  zoomValue: null,
  zoomValueBinding: 'Multivio.zoomController.zoomValue',
  
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
    ZoomValue has changed, check if we need to load a new image

    @observes zoomValue
  */  
  zoomValueDidChange: function () {
    var zoomVal = this.get('zoomValue');
    if (SC.none(this.get('zoomState'))) {
      this._loadNewImage();
    }
  }.observes('zoomValue'),
  
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
        var index = defaultUrl.indexOf('&page_nr=');
        if (index === -1) {
          index = defaultUrl.indexOf('&url=');
        }
        var fileUrl = defaultUrl.substring(index + 1, defaultUrl.length);
        var imageSize = this.get('imageSize')[fileUrl];
        
        // imageSize is avalaible
        if (imageSize !== -1) {
          this.nativeWidth = imageSize.width;
          this.nativeHeight = imageSize.height;
          // new selection rotate value = 0
          this.rotateValue = 0;
          Multivio.rotateController.resetRotateValue();
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
    //this.set('isLoading', NO);
    var content =  this.get('contentView');
    content.set('value', url);
    content.adjust('width', image.width);
    content.adjust('height', image.height);    
    SC.RunLoop.end();
    
    if (!this.get('isHorizontalScrollerVisible')) {
      content.adjust('left', undefined);
    }
    
    // calculate zoomValue if zoomState !== null
    var state = this.get('zoomState');
    if (!SC.none(state)) {
      //this.zoomValue = 0;
      var rot = this.get('rotateValue');
      var rat = 0;
      
      // verify the position of the image
      if (rot % 180 === 0) {
        rat = image.width / this.nativeWidth;
      }
      else {
        rat = image.height / this.nativeWidth;
      }
      SC.RunLoop.begin();
      this.set('zoomValue', Math.round(rat * 100) / 100);      
      SC.RunLoop.end();
      Multivio.logger.info('New zoomValue setted ' + Math.round(rat * 100) / 100);
    }
    
    //enabled buttons
    SC.RunLoop.begin();
    this.set('isLoading', NO);
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
      // get zoomState
      var zoomSt = this.get('zoomState');
      var rot = this.get('rotateValue');
      var max = Multivio.configurator.get('zoomParameters').max;
      var isBiggerThanMax = NO;
      var newUrl = "";
      
      switch (zoomSt) {    
      case Multivio.zoomController.FULLPAGE:
        var windowWidth = this.get('frame').width;
        var windowHeight = this.get('frame').height;
        newUrl = defaultUrl.replace('width=1500', 'max_width=' +
            windowWidth + '&max_height=' + windowHeight + '&angle=' + rot);
        // calculate if the image size > max  
        var imageMaxW = this.nativeWidth / windowWidth;
        var imageMaxH = this.nativeHeight / windowHeight;
        var maxRat = imageMaxW > imageMaxH ? imageMaxW : imageMaxH;
        var tempM = (this.nativeWidth / maxRat) * (this.nativeHeight / maxRat);
        if (tempM > max) {
          isBiggerThanMax = YES;
        }
        break;

      case Multivio.zoomController.PAGEWIDTH:
        newUrl = defaultUrl.replace('width=1500', 'max_width=' +
            this.get('frame').width + '&angle=' + rot);
        // calculate if the image size > max  
        var rat = this.nativeWidth / windowWidth;
        var nextSize = (this.nativeWidth / rat) * (this.nativeHeight / rat);
        if (nextSize > max) {
          isBiggerThanMax = YES;
        }
        break;

      case Multivio.zoomController.HUNDREDPERCENT:
        newUrl = defaultUrl.replace('width=1500', 'angle=' + rot);
        // calculate if the image size > max
        if (this.nativeWidth * this.nativeHeight > max) {
          isBiggerThanMax = YES;
        }
        break;
        
      default:
        var zoomVal = this.get('zoomValue');
        Multivio.logger.info('currentpercent ' + zoomVal);
        var newWidth = this.nativeWidth * zoomVal;
        var newHeight = this.nativeHeight * zoomVal;
        newUrl = defaultUrl.replace('width=1500', 'max_width=' +
            parseInt(newWidth, 10) + '&max_height=' + parseInt(newHeight, 10) +
            '&angle=' + rot);
        // calculate if the image size > max
        if (parseInt(newWidth, 10) * parseInt(newHeight, 10) > max) {
          isBiggerThanMax = YES;
        } 
        break;
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
      var defaultUrl = currentSelection.firstObject().url;
      // first check if page_nr exist
      var index = defaultUrl.indexOf('&page_nr=');
      if (index === -1) {
        index = defaultUrl.indexOf('&url=');
      }
      var fileUrl = defaultUrl.substring(index + 1, defaultUrl.length);
      Multivio.zoomController.setBestStep(fileUrl);
      break;
    }
  },
  
  /**
    The view size has changed load a new image if the zoom state is Full or
    Width. 
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
      // reset nativeWidth & nativeHeight
      this.nativeWidth = 0;
      this.nativeHeight = 0;
      
      var defaultUrl = currentSelection.firstObject().url;
      // first check if page_nr exist
      var index = defaultUrl.indexOf('&page_nr=');
      if (index === -1) {
        index = defaultUrl.indexOf('&url=');
      }
      var fileUrl = defaultUrl.substring(index + 1, defaultUrl.length);
           
      var nativeSize = Multivio.CDM.getImageSize(fileUrl);
      // nativeSize is avalaible
      if (nativeSize !== -1) {
        this.nativeWidth = nativeSize.width;
        this.nativeHeight = nativeSize.height;
        // new selection rotate value = 0
        this.rotateValue = 0;
        Multivio.rotateController.resetRotateValue();
        this._loadNewImage();
      }
    }
  }.observes('selection')

});
