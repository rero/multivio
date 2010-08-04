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
    windowHeight & windowWidth = size of the contentView
  */
  currentZoomState: undefined,
  
  maxVirtualSize: undefined,
  minVirtualSize: undefined,

  windowMin: undefined,
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
    Current zoom step
    
    @property {Number}
    @private
    @default 0
  */
  _current_zoom_step: 0,
  
  maxStep: 0,
  minStep: 0,
  
  /**
    Boolean to enabled and disabled zoom Button
  */
  isZoomInAllow: YES,
  isZoomOutAllow: YES,
  isStateEnabled: YES,
  
  /**
    Initialize this controller. Retrieve zoom values from the configurator.
  */
  initialize: function () {
    Multivio.sendAction('addComponent', 'zoomController');
    this.maxVirtualSize = Multivio.configurator.get('zoomParameters').max;
    this.minVirtualSize = Multivio.configurator.get('zoomParameters').min;
    this.currentZoomState = Multivio.configurator.get('zoomParameters').initState;
    if (Multivio.masterController.currentType === 'image/jpeg' || 
        Multivio.masterController.currentType === 'image/jpg') {
      this.addNativePreference();      
    }
  },
  
  /**
    Initialize windowWidth & windowMin
  
    @param {Number} size the min size of the contentView
    @param {Number} windowWidth the width of the contentView
  */
  setWindow: function (size, windowWidth) {
    this.windowMin = size;
    this.windowWidth = windowWidth;
    
    var localStep = 0;
    var localZoom = this._zoomFactorForStep(localStep);
    var newSize = size * localZoom;
    while (newSize < this.maxVirtualSize) {
      localStep++;
      localZoom = this._zoomFactorForStep(localStep);
      newSize = size * localZoom;
    }
    localStep--;
    this.maxStep = localStep;
    
    localStep = 0;
    localZoom = this._zoomFactorForStep(localStep);
    newSize = size * localZoom;
    while (newSize > this.minVirtualSize) {
      localStep--;
      localZoom = this._zoomFactorForStep(localStep);
      newSize = size * localZoom;
    }
    localStep++;
    this.minStep = localStep;
    // test if disabled width
    var widthFirstStep = this.getBestStep();
    if (widthFirstStep > this.maxStep) {
      var zoomPage = Multivio.views.get('toolbar').get('zoomView');
      zoomPage.get('zoomPredefinedView').items[1].enabled = NO;
      zoomPage.get('zoomPredefinedView').itemContentDidChange();
    }
    Multivio.logger.debug('minStep & maxStep setted');
  },
  
  /**
    The currentZoomState
  */
  zoomState: function () {
    return this.get('currentZoomState');
  }.property('currentZoomState').cacheable(),

  /**
    Zoom in. _current_zoom_step + 1
  */  
  doZoomIn: function () {
    // allow zoom out
    if (this._current_zoom_step < this.maxStep) {
      if (!this.isZoomOutAllow) {
        this.set('isZoomOutAllow', YES);
      }
      this.set('currentZoomState', null);    
      var nextStep = this._current_zoom_step + 1;
      this._setCurrentValue(nextStep);
    }
  },

  /** 
    Zoom out. _current_zoom_step - 1
  */   
  doZoomOut: function () {
    //allow zoom in
    if (this.get('currentZoomState') === Multivio.zoomController.HUNDREDPERCENT) {
      this.set('currentZoomState', null);
      this._setCurrentValue(this.maxStep);
    }
    else {  
      if (this._current_zoom_step > this.minStep) {
        if (!this.isZoomInAllow) {
          this.set('isZoomInAllow', YES);
        }
        this.set('currentZoomState', null);
        var prevStep = this._current_zoom_step - 1;
        this._setCurrentValue(prevStep);
      }
    }
  },
  
  /**
    Verify if zoom buttons should be disabled 
  */
  checkButton: function () {
    var zoomStep = this.get('_current_zoom_step');
    if (zoomStep === this.maxStep) {
      this.set('isZoomInAllow', NO);
    }
    if (zoomStep === this.minStep) {
      this.set('isZoomOutAllow', NO);
    }
    if (this.get('currentZoomState') === Multivio.zoomController.HUNDREDPERCENT) {
      this.set('isZoomInAllow', NO);
    }
  },
  
  /**
  Add the native button 
  */
  addNativePreference: function () {
    var zoomPage = Multivio.views.get('toolbar').get('zoomView');
    var itemsWithNative = [
      {title: "Full", value: "Full", enabled: YES},
      {title: "Width", value: "Width", enabled: YES},
      {title: "Native", value: "Native", enabled: YES}
    ];
    zoomPage.get('zoomPredefinedView').set('items', itemsWithNative);
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
  
  getBestStep: function () {
    var width = this.get('windowWidth');
    var temp = this.get('windowMin');
    
    var localStep = 0;
    var localZoom = this._zoomFactorForStep(localStep);
    var newHeight =  temp * localZoom;
    
    while (newHeight < width) {
      localStep++;
      localZoom = this._zoomFactorForStep(localStep);
      newHeight = temp * localZoom;
    }
    return localStep;
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
    var newPref = button.get('value');
    this.set('currentZoomState', newPref);
    
    switch (newPref) {
    case Multivio.zoomController.FULLPAGE:
      this.doZoomOriginal();
      break;
  
    case Multivio.zoomController.PAGEWIDTH:
      var newStep = this.getBestStep();
      this._setCurrentValue(newStep);
      break;
      
    case Multivio.zoomController.HUNDREDPERCENT:
      this.set('current_zoom_factor', null);
      this.set('isZoomInAllow', NO);
      break;
    }
  }
  
});