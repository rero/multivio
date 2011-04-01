/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

/**
  @class

  This controller is used to zoom in the document.

  @author fma, che, mmo
  @extends SC.ObjectController
  @since 0.1.0
*/
Multivio.zoomController = SC.ObjectController.create(
/** @scope Multivio.zoomController.prototype */ {
  
  /**
    Pre-defined zoom mode
  */
  FULLPAGE:       'Full',
  PAGEWIDTH:      'Width',
  HUNDREDPERCENT: 'Native',
  
  /**
    @property
  
    currentZoomState = null if we are in the 'zoom' mode or one of 
        the pre-defined mode
    zoomStep = if zoomStep = -1 one of the pre-defined mode has been selected
        else (zoomStep >= 0) we are in the 'zoom' mode
    zoomRatio = the ratio (percentage) of the image size
    zoomScale = one of the scale defined in the configurator 
  */
  currentZoomState: null,
  zoomStep:         -1,
  zoomRatio:        0.0,
  zoomScale:        undefined,
 
  /**
    @property 
    
    maxStep = the number of steps of the scale
    maxRatio = the scale ratio of the last step
    minRatio = the scale ratio of the first step
  */
  maxStep:  0,
  maxRatio: 0.0,
  minRatio: 0.0,
  
  /**
    Binds to the masterController isLoadingContent property.
    
    This binding is used to enable and disable navigation buttons

    @binding {Boolean}
  */
  isLoadingContent: null,
  isLoadingContentBinding: 'Multivio.masterController.isLoadingContent',
  
  /**
    Booleans to enable and disable the zoom buttons
  */
  isZoomInAllowed:  YES,
  isZoomOutAllowed: YES,
  isStateEnabled:   YES,
  
  /**
    Initialize this controller. Retrieve zoom values from the configurator.
  */
  initialize: function () {
    // get zoomScale parameter in the configurator
    var type = Multivio.configurator.
        getTypeForMimeType(Multivio.masterController.currentFileType);
    var config = Multivio.configurator.get('layoutConfig')[type];
    var scaleParameter = config.zoomScale;
    this.zoomScale = Multivio.configurator.
        get('zoomParameters')[scaleParameter];
    
    this.maxStep = this.zoomScale.length - 1;
    this.minRatio = this.zoomScale[0];
    this.maxRatio = this.zoomScale[this.maxStep];
    Multivio.sendAction('addComponent', 'zoomController');
  },
  
  /**
    Set the currentZoomState
    
    @param {String} the new value of the currentZoomState
  */
  setZoomState: function (newState) {
    this.set('currentZoomState', newState);
  },

  /**
    Zoom in. _currentZoomStep + 1
  */  
  doZoomIn: function () {
    var zoomSt = this.get('zoomStep');
    //verify if we can make a zoomIn
    if (zoomSt < this.maxStep) {
      // TODO why is the zoom controller updating the variable
      // isLoadingContent? 
      // => No change now because I have to understand how to order call of bindings
    
      SC.RunLoop.begin();
      this.set('isLoadingContent', YES);
      SC.RunLoop.end();
    
      //var zoomSt = this.get('zoomStep');
      if (zoomSt !== -1) {
        if (zoomSt < this.maxStep) {
          zoomSt++;
          this.set('zoomStep', zoomSt);
        }
      }
      else {
        // first set zoomState undefined to change mode to zoom 
        this.set('currentZoomState', null);
        var zoomRatio = this.get('zoomRatio');
        // check if zoomRatio is smaller than the minRatio
        if (zoomRatio < this.minRatio) {
          this.set('zoomStep', 0); 
        }
        else {
          // check if zoomratio is smaller than the maxRatio
          if (zoomRatio < this.maxRatio) {
            var nexStep = this.getNextStep(zoomRatio);
            this.set('zoomStep', nexStep);
          }
        }
      }
    }
  },

  /** 
    Zoom out. _currentZoomStep - 1
  */   
  doZoomOut: function () {
    var zoomRatio = this.get('zoomRatio');
    // verify if we can make a zoomOut
    if (zoomRatio > this.minRatio) {
    
      SC.RunLoop.begin();
      this.set('isLoadingContent', YES);
      SC.RunLoop.end();
      
      var zoomSt = this.get('zoomStep');
      if (zoomSt !== -1) {
        if (zoomSt > 0) {
          zoomSt--;
          this.set('zoomStep', zoomSt);
        }
      }
      else {
        // first set zoomState undefined to change mode to zoom
        this.set('currentZoomState', null);
        //var zoomRatio = this.get('zoomRatio');
        // check if zoomRatio is bigger than the maxRatio
        if (zoomRatio > this.maxRatio) {
          this.set('zoomStep', this.maxStep); 
        }
        else {
          //check if zoomRatio is bigger than the minRatio
          if (zoomRatio > this.minRatio) {
            var preStep = this.getPreviousStep(zoomRatio);
            this.set('zoomStep', preStep);
          }
        }
      }
    }
  },
  
  /**
    Get the next zoom step for this ratio
   
    @param {Number} ratio the current ratio
    @return {Number} the next step
  */
  getNextStep: function (ratio) {
    var step = 0;
    while (step < this.zoomScale.length) {
      var zRatio = this.zoomScale[step];
      if (zRatio <= ratio) {
        step++;
      }
      else {
        break;
      }
    }
    return step;
  },
  
  /**
    Get the previous zoom step for this ratio
   
    @param {Number} ratio the current ratio
    @return {Number} the previous step
  */
  getPreviousStep: function (ratio) {
    var step = 0;
    while (step < this.zoomScale.length) {
      var zRatio = this.zoomScale[step];
      if (zRatio >= ratio) {
        step--;
        break;
      }
      else {
        step++;
      }
    }
    return step;
  },
  
  /**
   Find the best value for the zoomStep so that the loaded image size 
   doesn't exceed the max resolution value defined in the configurator.
   
   @param {Number} width the native width of the image to load
   @param {Number} height the native height of the image to load
  */
  setBestStep: function (width, height) {
    var maxRes = Multivio.configurator.get('zoomParameters').maxResolution;
    var step = 0;
    while (step < this.zoomScale.length) {
      var zoomRatio = this.zoomScale[step];
      var imageSize = (width * zoomRatio) * (height * zoomRatio);
      if (imageSize <= maxRes) {
        step++;
      }
      else {
        break;
      }
    }
    step--;
    this.set('currentZoomState', null);
    this.set('zoomStep', step);
  },
  
  /**
    Calculate the zoomRatio
    
    @param {Number} rotate the ratate value
    @param {Number} imageW the width of the image loaded
    @param {Number} imageH the height of the image loaded
    @param {Number} nativeW the native width of the image
  */
  calculateRatio: function (rotate, imageW, imageH, nativeW) {
    var ratio = 0;
    if (rotate % 180 === 0) {
      ratio = imageW / nativeW;
    }
    else {
      ratio = imageH / nativeW;
    }
    this.set('zoomRatio', ratio);
  },
  
  /**
    Set the value of the zoomRatio observing the value of the zoomStep
    
    @observes zoomStep
  */
  setRatio: function () {
    var step = this.get('zoomStep');
    var newRatio = this.zoomScale[step];
    this.set('zoomRatio', newRatio);
  }.observes('zoomStep'),
  
  /**
    Change buttons status observing isLoadingContent property.
    
    @observes isLoadingContent
  */
  isLoadingContentDidChange: function () {
    var isLoadingContent = this.get('isLoadingContent');
    if (isLoadingContent) {
      // disabled
      this.set('isZoomInAllowed', NO);
      this.set('isZoomOutAllowed', NO);
      this.set('isStateEnabled', NO);
    }
    else {
      // enabled
      this.set('isStateEnabled', YES);
      var newZoomStep = this.get('zoomStep');
      if (newZoomStep === -1) {
        var receivedZoomRatio = this.get('zoomRatio');
        if (receivedZoomRatio > this.minRatio) {
          this.set('isZoomOutAllowed', YES);
        }
        if (receivedZoomRatio < this.maxRatio) {
          this.set('isZoomInAllowed', YES);
        }
      }
      else {
        if (newZoomStep > 0) {
          this.set('isZoomOutAllowed', YES);
        }
        if (newZoomStep < this.maxStep) {
          this.set('isZoomInAllowed', YES);
        }
      }
    }  
  }.observes('isLoadingContent'),
  
  /**
    Set the new pre-defined zoom.
    Enable zoomOut and zoomIn and reset current_zoomFactor and
    _currentZoomStep.
    
    @param {Object} button selected 
  */
  setPredefinedZoom: function (button) {
    var newMode = button.name;
    if (this.get('currentZoomState') !== newMode) {
      this.zoomStep = -1;
      SC.RunLoop.begin();
      this.set('isLoadingContent', YES);
      SC.RunLoop.end();
      this.set('currentZoomState', newMode);
    }
    else {
      button.set('isActive', YES);
    }
  },
  
  /**
    Change buttons isActive property observing currentZoomState.

    @observes currentZoomState
  */
  currentZoomStateDidChange: function () {
    var zoomSt = this.get('currentZoomState');
    var fullB = Multivio.getPath('views.bottomButtons.backgroundView.zoomFullSizeButton');
    var widthB = Multivio.getPath('views.bottomButtons.backgroundView.zoomFullWidthButton');
    var nativeB = Multivio.getPath('views.bottomButtons.backgroundView.zoomNativeSizeButton');

    switch (zoomSt) {
    case 'Full':
      fullB.set('isActive', YES);
      widthB.set('isActive', NO);
      nativeB.set('isActive', NO);
      break;
    case 'Width':
      fullB.set('isActive', NO);
      widthB.set('isActive', YES);
      nativeB.set('isActive', NO);
      break;
    case 'Native':
      fullB.set('isActive', NO);
      widthB.set('isActive', NO);
      nativeB.set('isActive', YES);
      break;
    case null:
      fullB.set('isActive', NO);
      widthB.set('isActive', NO);
      nativeB.set('isActive', NO);
      break;
    default:
      break;
    }
  }.observes('currentZoomState'),
  
  /**
    Intercept the key event and call the good zoom method
  
    @param {SC.Event} evt the event fired
  */
  keyEvent: function (evt) {
    switch (evt.which) {
    // -
    case 45:
      this.doZoomOut();
      return YES;
    // +
    case 43:
      this.doZoomIn();
      return YES;
    default:
      return NO;
    }
  }
  
});