/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
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
  Pre-defined zoom values
  */
  FULLPAGE: 'Full',
  PAGEWIDTH: 'Width',
  HUNDREDPERCENT: 'Native',
  
  /**
  @property
  currentZoomState = one pre-defined zoom value
  maxVirtualSize = max value in the configurator
  minVirtualSize = min value in the configurator
  nativeImageHeight & nativeImageWidth = the native size of an image
  windowHeight & windowWidth = size of the contentView
  */
  currentZoomState: undefined,
  
  maxVirtualSize: undefined,
  minVirtualSize: undefined,
  
  nativeImageHeight: undefined,
  nativeImageWidth: undefined,
  windowHeight: undefined,
  windowWidth: undefined,
  
  /** 
    Zoom parameter 
    @property {Integer}
    @final
  */
  ZOOM_FACTOR: 1.3,
  
  /** 
    Zoom parameter 
    @property {Integer}
    @final
  */
  ZOOM_ORIGINAL_FACTOR: 1,

  /** 
    Current zoom factor: multiplicative value applied to the original image
    size; it is exponentially proportional to the current zoom step:

    current_zoom_factor = ZOOM_FACTOR ^ _current_zoom_step 

    @property {Number}
    @default 1
  */
  current_zoom_factor: 1,

  /**
    Current zoom step: its value always equals one of the possible discrete
    values within the zoom range [ZOOM_MIN_STEP, ZOOM_MAX_STEP]
    
    @property {Number}
    @private
    @default 0
  */
  _current_zoom_step: 0,
  
  /**
  Boolean to enabled and disabled zoom Button
  */
  isZoomInAllow: YES,
  isZoomOutAllow: YES,
  
  /**
  Initialize this controller.
  */ 
  initialize: function () {
    Multivio.sendAction('addComponent','zoomController');
    this.maxVirtualSize = Multivio.configurator.get('zoomParameters').max;
    this.minVirtualSize = Multivio.configurator.get('zoomParameters').min;
    this.currentZoomState = Multivio.configurator.get('zoomParameters').initState;
    this.disabledNativePreference();
  },
  
  /**
  Initialize windowWidth & windowHeight
  
  @param {Number} windowWidth the width of the contentView
  @param {Number} windowHeight the height of the contentView
  */
  setWindowSize: function (windowWidth, windowHeight) {
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;
  },
  
  /**
  Initialize nativeImageWidth & nativeImageHeight
  
  @param {Number} imageWidth the native width of the selected image
  @param {Number} imageHeight the native height of the selected image 
  */
  setNativeImageSize: function (imageWidth, imageHeight) {
    this.nativeImageWidth = imageWidth;
    this.nativeImageHeight = imageHeight;
    if (!SC.none(imageWidth) && !SC.none(imageHeight)) {
      this.enabledNativePreference();
    }
  },
  
  /**
  The currentZoomState
  */
  zoomState: function () {
    return this.get('currentZoomState');
  }.property('currentZoomState').cacheable(),

  /**
    Zoom in.
    _current_zoom_step + 1
  */  
  doZoomIn: function () {
    //allow zoom out
    if (!this.isZoomOutAllow) {
      this.set('isZoomOutAllow', YES);
    }
    this.set('currentZoomState', null);    
    var nextStep = this._current_zoom_step + 1;
    this._setCurrentValue(nextStep);
  },

  /** 
    Zoom out. _current_zoom_step - 1
  */   
  doZoomOut: function () {
    //allow zoom in
    if (!this.isZoomInAllow) {
      this.set('isZoomInAllow', YES);
    }

    this.set('currentZoomState', null);
    var prevStep = this._current_zoom_step - 1;
    this._setCurrentValue(prevStep);
  },
  
  /**
  Verify if zoom buttons should be disabled 
  */
  checkButton: function () {

    var width = this.get('windowWidth');
    var isAnImage = SC.none(this.get('nativeImageWidth')) ? NO: YES;
    
    //verify zoom+ 
    var zoomStep = this.get('_current_zoom_step');
    zoomStep++;
    var zoomFactor = this._zoomFactorForStep(zoomStep);
    var newSize = width * zoomFactor;
    if (this.isAnImage) {
      var maxImageW = this.get('nativeImageWidth');
      var maxImageH = this.get('nativeImageHeight');
      if (newSize > maxImageW || this.get('windowHeight') * zoomFactor >
          maxImageH) {
        this.set('isZoomInAllow', NO);
      }
      
      else {
        var pref = this.get('currentZoomState');
        if (pref !== Multivio.zoomController.HUNDREDPERCENT && 
            newSize > this.get('maxVirtualSize')) {
          this.set('isZoomInAllow', NO);
        }
      }
    }
    else {
      //its a pdf
      if (newSize > this.get('maxVirtualSize')) {
        this.set('isZoomInAllow', NO);
      }
    }
    
    //verify zoom-
    zoomStep = zoomStep - 2;
    zoomFactor = this._zoomFactorForStep(zoomStep);
    newSize = width * zoomFactor;
    if (newSize < this.get('minVirtualSize')) {
      this.set('isZoomOutAllow', NO);
    }
  },
  
  /**
  Disabled native preference
  */
  disabledNativePreference: function () {
    var zoomPage = Multivio.views.get('toolbar').get('zoomView');
    zoomPage.get('zoomPredefinedView').items[2].enabled = NO;
    zoomPage.get('zoomPredefinedView').itemContentDidChange();
  },
  
  /**
  Enabled native preference
  */
  enabledNativePreference: function () {
    var zoomPage = Multivio.views.get('toolbar').get('zoomView');
    zoomPage.get('zoomPredefinedView').items[2].enabled = YES;
    zoomPage.get('zoomPredefinedView').itemContentDidChange();
  },
  
  /**
    Zoom original. _current_zoom_step = 0 & current_zoom_factor = 1.3 
  */  
  doZoomOriginal: function () {
    this.set('_current_zoom_step', 0);
    this.set('current_zoom_factor', this.ZOOM_ORIGINAL_FACTOR);
  },
  
  /**
    Return the zoomFactor for a specific step
    
    @param {Number} step
    @private
    @returns {Integer}
  */
  _zoomFactorForStep: function (step) {
    return Math.pow(this.ZOOM_FACTOR, step);
  },
  
  /**
    Set _current_zoom_step and current_zoomFactor
    
    @param {Number} step
    @private
  */
  _setCurrentValue: function (step) {
    this.set('_current_zoom_step', step);
    this.set('current_zoom_factor', Math.pow(this.ZOOM_FACTOR, this._current_zoom_step));
  },
  
  /**
    Set the new pre-defined zoom.
    Enabled zoomOut and zoomIn and reset current_zoomFactor and
    _current_zoom_step.
    
    @param {Object} button selected 
  */
  setPredefinedZoom: function (button) {
    this.set('isZoomOutAllow', YES);
    this.set('isZoomInAllow', YES);
    this._current_zoom_step = 0;
    this.current_zoom_factor = this.ZOOM_ORIGINAL_FACTOR;
    var newPref = button.get('value');
    SC.RunLoop.begin();
    this.set('currentZoomState', newPref);
    if (newPref === Multivio.zoomController.HUNDREDPERCENT && 
        !SC.none(this.get('nativeImageHeight'))) {
          this.set('isZoomInAllow', NO);
    }
    SC.RunLoop.end();

    /*this._current_zoom_step = 0;
    this.current_zoom_factor = this.ZOOM_ORIGINAL_FACTOR;*/
  }
  
});