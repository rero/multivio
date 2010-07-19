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
    Binds to the zoomValue in the zoom controller.
    
    @binding {Number}
   */
  zoomValueBinding:
      SC.Binding.oneWay('Multivio.zoomController.current_zoom_factor'), 

  /**
    Binds to the currentValue in the rotate controller.
    
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
    Binds to the currentZoomState value in the zoomController
  
    @binding {string}
  */
  currentZoomStateBinding: 
      SC.Binding.oneWay('Multivio.zoomController.currentZoomState'),
 
  /**
    Old or new currentZoomState
  */
  localZoomState: undefined, 

  /**
    Content properties
  
    frameWidth {Number} the view width
    frameHeight {Number} the view height
    isAnImage {Boolean}
    maxImageWidth {Number} native image width (only for image)
    maxImageHeight {Number} native image height (only for image)
  */
  
  frameWidth: undefined,
  frameHeight: undefined,
  
  isAnImage: NO, 
  
  //Tempory => TO DO 
  maxImageWidth: 2500,
  maxImageHeight: 3000, 
  
  /**
    ZoomFactor has changed.

    @observes zoomValue
  */  
  doZoom: function () {
    var zoomVal = this.get('zoomValue');
    if (!SC.none(zoomVal)) { 
      this._loadNewImage();
    }
  }.observes('zoomValue'),
  
  /**
    Pre-defined zoom has changed. Reset initial values.
    
    @observes currentZoomState
  */
  currentZoomStateDidChange: function () {
    var state = this.get('currentZoomState');
    //if state !== null set localZoomState
    if (!SC.none(state)) {
      this.set('zoomValue', 1);
      this.localZoomState = state;
      this._loadNewImage();
    }
  }.observes('currentZoomState'),
  
  /**
    Rotate value has changed. Load new image.
  
    @observes rotateValue
  */
  rotateValueDidChange: function () {
    var rot = this.get('rotateValue');
    if (!SC.none(rot)) {
      this._loadNewImage();
    }
  }.observes('rotateValue'), 
  

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
    content.set('value', url);

    content.adjust('width', image.width);
    content.adjust('height', image.height);
    
    Multivio.zoomController.checkButton();
    SC.RunLoop.end();
    if (!this.get('isHorizontalScrollerVisible') ) {
          content.adjust('left', undefined);
    }
    Multivio.logger.debug('ContentView#_adjustSize');
  },
  
  /**
    Load the image with adapated width and height and rotation 
  
  */
  _loadNewImage: function () {
    var currentSelection = this.get('selection');
    if (!SC.none(currentSelection) && !SC.none(currentSelection.firstObject())) {
      var defaultUrl = currentSelection.firstObject().url;
      var zoomVal = this.get('zoomValue');
    
      // if its the first image get width and height of the view
      var tempWidth = this.get('frameWidth');
      var tempHeight = this.get('frameHeight');
      if (SC.none(tempWidth)) {
        tempWidth = this.get('frame').width;
        tempHeight = this.get('frame').height;
        this.set('frameWidth', tempWidth);
        this.set('frameHeight', tempHeight);
        Multivio.zoomController.setWindowSize(tempWidth, tempHeight);
      }
    
      // calculate the image.width to ask to the server 
      var newWidth = zoomVal * tempWidth;
      var newUrl = '';
      var rot = this.get('rotateValue');
      
      switch (this.localZoomState) {
      case Multivio.zoomController.FULLPAGE:
      // full page => call with max_height & max_width
        var newHeight = zoomVal * tempHeight;
        newUrl = defaultUrl.replace('width=1500', 'max_width=' +
            parseInt(newWidth, 10) + '&max_height=' + parseInt(newHeight, 10) +
            '&angle=' + rot);
        break;
        
      case Multivio.zoomController.PAGEWIDTH:
      //page width => call with max_width
        newUrl = defaultUrl.replace('width=1500', 'max_width=' +
            parseInt(newWidth, 10) + '&angle=' + rot);
        break;
        
      case Multivio.zoomController.HUNDREDPERCENT:
        if (this.isAnImage) {
          // call with native size if zoomVal === 1
          if (zoomVal === 1) {
          newUrl = defaultUrl.replace('width=1500', 'max_width=' +
              this.maxImageWidth + '&max_height=' + this.maxImageHeight + 
              '&angle=' + rot);
          }
          else {
            var newSize = zoomVal * Multivio.configurator.get('zoomParameters').max;
            newUrl = defaultUrl.replace('width=1500', 'max_width=' +
                parseInt(newSize, 10) + '&max_height=' + 
                parseInt(newSize, 10) + '&angle=' + rot);
          }
        }
        else {
          // TO DO size for pdf or new call 
          Multivio.log.error('no native size for a PDF');
        }
        break;
      }
      Multivio.logger.debug('load new image %@'.fmt(newUrl));
      SC.imageCache.loadImage(newUrl, this, this._adjustSize);
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
      var defaultUrl = currentSelection.firstObject().url;
      var index = defaultUrl.indexOf('&url=');
      var metadataUrl = defaultUrl.substring(index + 5, defaultUrl.length);
      // TO DO get metadata to know if it's a pdf or an image
      // if image get maxW & maxH
      if (defaultUrl.indexOf('pdf') === -1) {
        // TO DO retreive native size of the image in the metadata
        /*
        this.maxImageWidth = metadata.width;
        this.maxImageHeight = metadata.height;
        */
        this.isAnImage = YES;
        Multivio.zoomController.setNativeImageSize(this.maxImageWidth, this.maxImageHeight);
      }
      else {
        // if it's not an image reset native size
        Multivio.zoomController.setNativeImageSize(null, null);
      }
      // new selection rotate value = 0
      this.rotateValue = 0;
      Multivio.rotateController.resetRotateValue();
      this._loadNewImage();
    }
    
  }.observes('selection')

});
