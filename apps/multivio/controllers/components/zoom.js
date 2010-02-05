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

  @author {fma, che, mmo}
  @extends {SC.ObjectController}
  @since {0.1.0}
*/
Multivio.zoomController = SC.ObjectController.create(
/** @scope Multivio.zoomController.prototype */ {

  /** Zoom parameter @property */
  ZOOM_FACTOR: 1.3,
  /** Zoom parameter @property */
  ZOOM_ORIGINAL_FACTOR: 1,
  /** Zoom parameter @property */
  ZOOM_MAX_STEP: 3,
  /** Zoom parameter @property */
  ZOOM_MIN_STEP: -5,
  /** Zoom parameter @property */
  ZOOM_MAX_SIZE: 2000,
  /** Zoom parameter @property */
  ZOOM_MIN_SIZE: 100,

  /** 
    @property {Number}
    
    Current zoom factor: multiplicative value applied to the original image
    size; it is exponentially proportional to the current zoom step:

    current_zoom_factor = ZOOM_FACTOR ^ _current_zoom_step 

    @default {1}
  */
  current_zoom_factor: 1,

  /**
    @property {Number}
    
    Current zoom step: its value always equals one of the possible discrete
    values within the zoom range [ZOOM_MIN_STEP, ZOOM_MAX_STEP]

    @private
    @default {0}
  */
  _current_zoom_step: 0,

  /**
    @method
    
    Zoom in.
  */  
  doZoomIn: function () {
    if (this._current_zoom_step < this.ZOOM_MAX_STEP) {
      this._setCurrentValue(this._current_zoom_step + 1);
    }
  },

  /**
    @method
    
    Zoom out.
  */   
  doZoomOut: function () {
    if (this._current_zoom_step > this.ZOOM_MIN_STEP) {
      this._setCurrentValue(this._current_zoom_step - 1);
    }    
  },
  
  /**
    @method
    
    Zoom original. _current_zoom_step = 0 & current_zoom_factor = 1.3 
  */  
  doZoomOriginal: function () {
    this.set('_current_zoom_step', 0);
    this.set('current_zoom_factor', this.ZOOM_ORIGINAL_FACTOR);
  },
  
  /**
    @method
    
    Return the zoomFactor for a specific step
    
    @param {Number} step
    @private
  */
  _zoomFactorForStep: function (step) {
    return Math.pow(this.ZOOM_FACTOR, step);
  },
  
  /**
    @method
    
    Return YES if ZOOM_MIN_STEP =< step <=  ZOOM_MAX_STEP else return NO
    
    @param {Number} step
    @private
  */  
  _isZoomStepValid: function (step) {
    if (step >= this.ZOOM_MIN_STEP && step <=  this.ZOOM_MAX_STEP) {
      return YES;
    }
    else {
      return NO;
    }
  },
  
  /**
    @method
    
    Set _current_zoom_step and current_zoomFactor
    
    @param {Number} step
    @private
  */
  _setCurrentValue: function (step) {
    if (this._isZoomStepValid(step)) {
      this.set('_current_zoom_step', step);
      this.set('current_zoom_factor', Math.pow(this.ZOOM_FACTOR, this._current_zoom_step));
    }
    else {
      Multivio.logger.warn('unable to set this zoom step value ' + step);
    }
  },
  
  /**
    @method
    
    Set zoomFactor and zoomStep according to the size of the first image 
    and to the size of the view. The goal is to resize the image so that it is
    totally visible
    
    @param {Number} viewWidth
    @param {Number} viewHeight
    @param {Number} imageWidth
    @param {Number} imageHeight
  */   
  setBestZoom: function (viewWidth, viewHeight, imageWidth, imageHeight) {       
    var zoomFactor = this.get('current_zoom_factor');
    var zoomStep = this.get('_current_zoom_step');  
    
    var isWidthOK = imageWidth * zoomFactor < viewWidth ? YES : NO;
    //adjust first width
    while (!isWidthOK) {
      zoomStep--;
      if (this._isZoomStepValid(zoomStep)) {
        zoomFactor = this._zoomFactorForStep(zoomStep);
        if (imageWidth * zoomFactor < viewWidth) {
          isWidthOK = YES;
        }
      }
      else {
        //if zoomStep is not valid stop minimize 
        zoomStep ++;
        isWidthOK = YES;
      }     
    }
    
    var isHeightOK = imageHeight * zoomFactor < viewHeight ? YES : NO;
    //adjust height
    while (!isHeightOK) {
      zoomStep--;
      if (this._isZoomStepValid(zoomStep)) {
        zoomFactor = this._zoomFactorForStep(zoomStep);
        if (imageHeight * zoomFactor < viewHeight) {
          isHeightOK = YES;
        }
      }
      else {
        //if zoomStep is not valid stop minimize 
        zoomStep ++;
        isHeightOK = YES;
      }
    }
    this._setCurrentValue(zoomStep);
    Multivio.logger.info('zoomController zoom values adjusted');
  }
  
});