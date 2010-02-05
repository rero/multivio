/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** @class

  The mainContentView of the application

  @author {che}
  @extends {SC.ScrollView}
  @since {0.1.0}
*/
Multivio.ContentView = SC.ScrollView.extend(
/** @scope Multivio.Content.prototype */ {

  /**
    @binding {Number}
    
    Binds to the zoomValue in the zoom controller.
   */
  zoomValueBinding:
      SC.Binding.oneWay('Multivio.zoomController.current_zoom_factor'), 
  
  /**
    @binding {Multivio.CoreDocumentNode}
    
    Binds to the masterController' masterSelection
  */
  masterSelectionBinding: 'Multivio.masterController.masterSelection', 
  
  /**
    @binding {Boolean}
    
    Binds to the isFirstFile property of the masterController
  */   
  isFirstFileBinding: 'Multivio.masterController.isFirstFile',
  
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
    @method

    Zoom in the picture.

    @observes {zoomValue}
  */  
  doZoom: function () {
    var zoomVal = this.get('zoomValue');
    if (!SC.none(zoomVal)) {
      var div = this.get('contentView');
      if (zoomVal === 1) {
        div.adjust('width', this.get('_originalWidth'));
        div.adjust('height', this.get('_originalHeight'));  
      }
      else {
        var newWidth = this._originalWidth * zoomVal;
        var max = Math.max(newWidth, Multivio.zoomController.ZOOM_MAX_SIZE);
        if (newWidth > max) {
          Multivio.logger.info("%@ > maxWidth [%@]".fmt(newWidth, max));
          // Keep the good rate for the picture
          if (this.get('_originalWidth') > max) {
            div.adjust('width', this.get('_originalWidth'));
            div.adjust('height', this.get('_originalHeight'));
          }
          return;
        }
        var min = Math.min(newWidth, Multivio.zoomController.ZOOM_MIN_SIZE);
        if (newWidth < min) {
          Multivio.logger.info("%@ < minWidth [%@]".fmt(newWidth, min));
          // Keep the good rate for the picture
          if (this.get('_originalWidth') < min) {
            div.adjust('width', this.get('_originalWidth'));
            div.adjust('height', this.get('_originalHeight'));
          }          
          return;
        }             
        var newHeight = this._originalHeight * zoomVal;
        div.adjust('width', newWidth);
        div.adjust('height', newHeight);
      } 
    }
  }.observes('zoomValue'),

  /**
    @method 
    
    Callback applied after image has been loaded.
    
    It puts the image in the container and applies the current zoom factor.

    @private
    @callback {SC.imageCache.load}
    @param {String} url
    @param {Image} image
  */
  _adjustSize: function (url, image) {
    SC.RunLoop.begin();
    var content =  this.get('contentView');
    content.set('value', url);
    this.set('_originalWidth', image.width);
    this.set('_originalHeight', image.height);
    if (this.get('isFirstFile')) {
      this.adjustZoomValue();
      this.set('isFirstFile', NO);
    }
    this.doZoom();
    SC.RunLoop.end();
      
    Multivio.logger.debug('ContentView#_adjustSize');
  },
  

  /**
    @method
    
    Updates value by observing changes in master controller's master
    selection
    
    @private
    @observes {masterSelection}
  */
  _masterSelectionDidChange: function () {
    var currentMasterSelection = this.get('masterSelection');
    if (!SC.none(currentMasterSelection)) {
      var defaultUrl = currentMasterSelection.get('urlDefault');
      var pageNumber = !SC.none(currentMasterSelection.get('localSequenceNumber')) ?
          currentMasterSelection.get('localSequenceNumber') : 0;
      var imageUrl = Multivio.configurator.getImageUrl(defaultUrl, pageNumber);
      SC.RunLoop.begin();
      SC.imageCache.loadImage(imageUrl, this, this._adjustSize);
      SC.RunLoop.end();
    }
    Multivio.logger.debug('ContentView#_masterSelectionDidChange: %@'.
        fmt(this.get('masterSelection').get('guid')));
  }.observes('masterSelection'),
  
  /**
    @method
    
    Set zoomFactor and zoomStep according to the size of the first image 
    and to the size of this view. The goal is to resize the image so that it is
    totally visible
  */   
  adjustZoomValue: function () {
    // retreive view width and height, zoomFactor and zoomStep
    var contentWidth = this.get('layer').clientWidth;
    var contentHeight = this.get('layer').clientHeight;  
    
    Multivio.zoomController.setBestZoom(contentWidth, contentHeight, 
        this.get('_originalWidth'), this.get('_originalHeight'));
  }

});
