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
  
  metadata: null,

  /**
    Content properties
  
    frameMin {Number} the view min size
    maxImageWidth {Number} native image width (only for image)
    maxImageHeight {Number} native image height (only for image)
  */

  frameMin: undefined,
  
  // Tempory => TO DO 
  maxImageWidth: 2500,
  maxImageHeight: 3000, 
  
  /**
    ZoomFactor has changed.

    @observes zoomValue
  */  
  doZoom: function () {
    var zoomVal = this.get('zoomValue');
    this._loadNewImage();
  }.observes('zoomValue'),
  
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
    FileMetadata has changed. See if we can load the image
  */
  metadataDidChange: function () {
    var met = this.get('metadata');
    if (!SC.none(met)) {
      var currentSelection = this.get('selection');
      if (!SC.none(currentSelection) && !SC.none(currentSelection.firstObject())) {
        var defaultUrl = currentSelection.firstObject().url;
        var index = defaultUrl.indexOf('&url=');
        var metadataUrl = defaultUrl.substring(index + 5, defaultUrl.length);
        var fileMeta = this.get('metadata')[metadataUrl];
        // fileMetadata is avalaible
        if (fileMeta !== -1 && !SC.none(fileMeta)) {
          var mime = fileMeta.mime;
          // if image get maxW & maxH
          if (Multivio.layoutController.get('typeForMimeType')[mime] === 'image') {
            this.maxImageWidth = fileMeta.width;
            this.maxImageHeight = fileMeta.height;
          }
          // new selection rotate value = 0
          this.rotateValue = 0;
          Multivio.rotateController.resetRotateValue();
          this._loadNewImage();
        }
      }
    }
  }.observes('metadata'),
  

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
    // enabled all buttons
    this.enabledButtons();
    var content =  this.get('contentView');
    content.set('value', url);

    content.adjust('width', image.width);
    content.adjust('height', image.height);
    
    Multivio.zoomController.checkButton();
    Multivio.navigationController.checkButton();
    
    SC.RunLoop.end();
    if (!this.get('isHorizontalScrollerVisible')) {
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
      // disabled all button
      this.disabledButtons();
      var defaultUrl = currentSelection.firstObject().url;
      var zoomVal = this.get('zoomValue');
      var rot = this.get('rotateValue');
      //var newUrl = '';
      // zoomVal is null ask for native image
      if (SC.none(zoomVal)) {
        var maximum = Multivio.configurator.get('zoomParameters').max;
        if (this.maxImageWidth > maximum || this.maxImageHeight > maximum) {
          Multivio.usco.showAlertPaneWarn(
              '_Loading the requested resolution may take a long time'.loc(),
              '_Would you like to proceed?'.loc(),
              '_Proceed'.loc(),
              '_Use lower resolution'.loc(),
              this);
        }
        else {
          var newUrl = defaultUrl.replace('width=1500', 'max_width=' +
            this.maxImageWidth + '&max_height=' + this.maxImageHeight + 
            '&angle=' + rot);
          SC.imageCache.loadImage(newUrl, this, this._adjustSize);
        }
      }
      else {
        // calculate the size to ask to the server 
        var frame = zoomVal * this.get('frameMin');
        var loadUrl = defaultUrl.replace('width=1500', 'max_width=' +
            parseInt(frame, 10) + '&max_height=' + parseInt(frame, 10) +
            '&angle=' + rot);
        SC.imageCache.loadImage(loadUrl, this, this._adjustSize);
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
      var currentSelection = this.get('selection');
      var defaultUrl = currentSelection.firstObject().url;
      var zoomVal = this.get('zoomValue');
      var rot = this.get('rotateValue');
      var newUrl = defaultUrl.replace('width=1500', 'max_width=' +
          this.maxImageWidth + '&max_height=' + this.maxImageHeight + 
          '&angle=' + rot);
      SC.imageCache.loadImage(newUrl, this, this._adjustSize);
      break;
        
    case SC.BUTTON2_STATUS:
      // load old image
      var oldStep = Multivio.zoomController._current_zoom_step;
      Multivio.zoomController.set('currentZoomState', null);
      Multivio.zoomController._setCurrentValue(oldStep);
      break;
    }
  },
  
  /**
    Disabled all buttons that can interact with this view 
  */  
  disabledButtons: function () {
    SC.RunLoop.begin();
    Multivio.navigationController.set('isNextEnabled', NO);
    Multivio.navigationController.set('isPreviousEnabled', NO);
    Multivio.navigationController.set('isCurrentPageEnabled', NO);
    Multivio.rotateController.set('isRigthAllow', NO);
    Multivio.rotateController.set('isLeftAllow', NO);
    Multivio.zoomController.set('isZoomInAllow', NO);
    Multivio.zoomController.set('isZoomOutAllow', NO);
    Multivio.zoomController.set('isStateEnabled', NO);
    SC.RunLoop.end();
  },
  
  /**
    Enabled all buttons that can intercat with this view
  */
  enabledButtons: function () {
    SC.RunLoop.begin();
    Multivio.navigationController.set('isNextEnabled', YES);
    Multivio.navigationController.set('isPreviousEnabled', YES);
    Multivio.navigationController.set('isCurrentPageEnabled', YES);
    Multivio.rotateController.set('isRigthAllow', YES);
    Multivio.rotateController.set('isLeftAllow', YES);
    Multivio.zoomController.set('isZoomInAllow', YES);
    Multivio.zoomController.set('isZoomOutAllow', YES);
    Multivio.zoomController.set('isStateEnabled', YES);
    SC.RunLoop.end(); 
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
      // set frameMin
      var frame = this.get('frameMin');
      if (SC.none(frame)) {
        var tempWidth = this.get('frame').width;
        var tempHeight = this.get('frame').height;
        frame = tempWidth < tempHeight ? tempWidth : tempHeight;
        this.set('frameMin', frame);
        Multivio.zoomController.setWindow(frame, tempWidth);
      }
      
      var defaultUrl = currentSelection.firstObject().url;
      var index = defaultUrl.indexOf('&url=');
      var metadataUrl = defaultUrl.substring(index + 5, defaultUrl.length);
      var fileMeta = Multivio.CDM.getFileMetadata(metadataUrl);
      // fileMetadata is avalaible
      if (fileMeta !== -1) {
        var mime = fileMeta.mime;
        // if image get maxW & maxH
        if (Multivio.layoutController.get('typeForMimeType')[mime] === 'image') {  
          this.maxImageWidth = fileMeta.width;
          this.maxImageHeight = fileMeta.height;
        }
        // new selection rotate value = 0
        this.rotateValue = 0;
        Multivio.rotateController.resetRotateValue();
        this._loadNewImage();   
      }
      else {
        var listOfBindings = this.get('bindings');
        if (listOfBindings.length === 3) {
          this.bind('metadata', 'Multivio.CDM.fileMetadata');
        }
      }
    }
  }.observes('selection')

});
