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
    Pre-defined zoom mode
  */
  FULLPAGE: 'Full',
  PAGEWIDTH: 'Width',
  HUNDREDPERCENT: 'Native',
  
  /**
    @property
  
    currentZoomState = null if we are in the 'zoom' mode or one of 
        the pre-defined mode
    zoomStep = if zoomStep = -1 one of the pre-defined mode has been selected
        else (zoomStep >= 0) we are in the 'zoom' mode
    zoomValue = the value (percentage) of the image size
    zoomScale = one of the scale defined in the configurator 
  */
  currentZoomState: undefined,
  zoomStep: -1,
  zoomValue: 0.0,
  zoomScale: undefined,
 
  /**
    @property 
    
    maxStep = the number of steps of the scale
    maxVal = the scale value of the last step
    minVal = the scale value of the first step
  */
  maxStep: 0,
  maxVal: 0.0,
  minVal: 0.0,
  
  /**
    Binds to the imageController isLoading property.
    
    This binding is used to enabled and disabled navigation buttons

    @binding {Boolean}
  */
  isLoading: null,
  isLoadingBinding: 'Multivio.imageController.isLoading',
  
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
    this.currentZoomState = Multivio.configurator.get('zoomParameters').initState;
    // TO DO Change choosing the scale
    if (Multivio.masterController.currentType === 'image/jpeg' || 
        Multivio.masterController.currentType === 'image/jpg') { 
      this.zoomScale = Multivio.configurator.get('zoomStep2');    
    }
    else {
      this.zoomScale = Multivio.configurator.get('zoomStep1');
    }
    this.maxStep = this.zoomScale.length - 1;
    this.minVal = this.zoomScale[0];
    this.maxVal = this.zoomScale[this.maxStep];
    Multivio.sendAction('addComponent', 'zoomController');
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
    SC.RunLoop.begin();
    this.set('isLoading', YES);
    SC.RunLoop.end();
    
    var zoomSt = this.get('zoomStep');
    if (zoomSt !== -1) {
      zoomSt++;
      this.set('zoomStep', zoomSt);
      var newZoomVal = this.zoomScale[zoomSt];
      this.set('zoomValue', newZoomVal);
    }
    else {
      // first set zoomState undefined to change mode to zoom 
      this.set('currentZoomState', null);
      var zoomVal = this.get('zoomValue');
      if (zoomVal < this.minVal) {
        this.set('zoomStep', 0);
        this.set('zoomValue', this.minVal);  
      }
      else {
        var nexStep = this.getNextStep(zoomVal);
        this.set('zoomStep', nexStep);
        this.set('zoomValue', this.zoomScale[nexStep]);
      }
    }
  },

  /** 
    Zoom out. _current_zoom_step - 1
  */   
  doZoomOut: function () {
    SC.RunLoop.begin();
    this.set('isLoading', YES);
    SC.RunLoop.end();
    var zoomSt = this.get('zoomStep');
    if (zoomSt !== -1) {
      zoomSt--;
      this.set('zoomStep', zoomSt);
      var newZoomVal = this.zoomScale[zoomSt];
      this.set('zoomValue', newZoomVal);
    }
    else {
      // first set zoomState undefined to change mode to zoom
      this.set('currentZoomState', null);
      var zoomVal = this.get('zoomValue');
      if (zoomVal > this.maxVal) {
        this.set('zoomStep', this.maxStep);
        this.set('zoomValue', this.maxVal);  
      }
      else {
        var preStep = this.getPreviousStep(zoomVal);
        this.set('zoomStep', preStep);
        this.set('zoomValue', this.zoomScale[preStep]);
      }
    }
  },
  
  /**
    Get the next zoom step for this value
   
    @param {Number} the current value
    @return {Number} the next step
  */
  getNextStep: function (val) {
    var step = 0;
    while (step < this.zoomScale.length) {
      var zoomVal = this.zoomScale[step];
      if (zoomVal <= val) {
        step++;
      }
      else {
        break;
      }
    }
    return step;
  },
  
  /**
    Get the previous zoom step for this value
   
    @param {Number} the current value
    @return {Number} the previous step
  */
  getPreviousStep: function (val) {
    var step = 0;
    while (step < this.zoomScale.length) {
      var zoomVal = this.zoomScale[step];
      if (zoomVal >= val) {
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
    Change buttons status observing isloading property.
    
    @observes isLoading
  */
  isLoadingDidChange: function () {
    var isLoading = this.get('isLoading');
    if (isLoading) {
      // disabled
      this.set('isZoomInAllow', NO);
      this.set('isZoomOutAllow', NO);
      this.set('isStateEnabled', NO);
    }
    else {
      // enabled
      this.set('isStateEnabled', YES);
      var newZoomStep = this.get('zoomStep');
      if (newZoomStep === -1) {
        var receivedZoomVal = this.get('zoomValue');
        if (receivedZoomVal > this.minVal) {
          this.set('isZoomOutAllow', YES);
        }
        if (receivedZoomVal < this.maxVal) {
          this.set('isZoomInAllow', YES);
        }
      }
      else {
        if (newZoomStep > 0) {
          this.set('isZoomOutAllow', YES);
        }
        if (newZoomStep < this.maxStep) {
          this.set('isZoomInAllow', YES);
        }
      }
    }  
  }.observes('isLoading'),
  
  /**
    Set the new pre-defined zoom.
    Enabled zoomOut and zoomIn and reset current_zoomFactor and
    _current_zoom_step.
    
    @param {Object} button selected 
  */
  setPredefinedZoom: function (button) {
    var newMode = button.get('value');
    if (this.get('currentZoomState') !== newMode) {
      this.zoomStep = -1;
      SC.RunLoop.begin();
      this.set('isLoading', YES);
      SC.RunLoop.end();
      this.set('currentZoomState', newMode);
    }
  }
  
});