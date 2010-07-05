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
  Preference values
  */
  FULLPAGE: 'Full',
  PAGEWIDTH: 'Width',
  HUNDREDPERCENT: 'Native',
  
  currentPreference: 'Full',

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
    Zoom parameter 
    @property {Integer}
    @final
  */
  ZOOM_MAX_SIZE: 2500,
  
  /** 
    Zoom parameter 
    @property {Integer}
    @final
  */
  ZOOM_MIN_SIZE: 100,

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
    Zoom in.
    _current_zoom_step + 1
  */  
  doZoomIn: function () {
    //verify if zoomInPageView is enabled
    var zoomPage = Multivio.views.get('navigationView').get('zoomPageView');
    if (!zoomPage.get('zoomInPageView').get('isEnabled')) {
      zoomPage.get('zoomInPageView').set('isEnabled', YES);
    }
    this.disabledPreferenceView();    
    var nextStep = this._current_zoom_step + 1;
    this._setCurrentValue(nextStep);
  },

  /** 
    Zoom out. _current_zoom_step - 1
  */   
  doZoomOut: function () {
    //verify if zoomOutPageView is enabled
    var zoomPage = Multivio.views.get('navigationView').get('zoomPageView');
    if (!zoomPage.get('zoomOutPageView').get('isEnabled')) {
      zoomPage.get('zoomOutPageView').set('isEnabled', YES);
    }

    this.disabledPreferenceView();
    var prevStep = this._current_zoom_step - 1;
    this._setCurrentValue(prevStep);
  },
  
  /**
  Disabled zoomInPageView button
  */
  disabledZoomIn: function () {
    var zoomPage = Multivio.views.get('navigationView').get('zoomPageView');
    zoomPage.get('zoomInPageView').set('isEnabled', NO);
  },
  
  /**
  Enabled zoomInPageView button
  */
  enabledZoomIn: function () {
    var zoomPage = Multivio.views.get('navigationView').get('zoomPageView');
    zoomPage.get('zoomInPageView').set('isEnabled', YES);
  },

  /**
  Disabled zoomOutPageView button
  */  
  disabledZoomOut: function () {
    var zoomPage = Multivio.views.get('navigationView').get('zoomPageView');
    zoomPage.get('zoomOutPageView').set('isEnabled', NO);
  },
  
  /**
  Enabled zoomOutPageView button
  */
  enabledZoomOut: function () {
    var zoomPage = Multivio.views.get('navigationView').get('zoomPageView');
    zoomPage.get('zoomOutPageView').set('isEnabled', YES);
  },
  
  /**
  Disabled zoomPreferenceView
  */
  disabledPreferenceView: function () {
    var zoomPage = Multivio.views.get('navigationView').get('zoomPageView');
    zoomPage.get('zoomPreferenceView').set('value', null);
    this.set('currentPreference', null);
  },
  
  /**
  Disabled native preference
  */
  disabledNativePreference: function () {
    var zoomPage = Multivio.views.get('navigationView').get('zoomPageView');
    zoomPage.get('zoomPreferenceView').items[2].enabled = NO;
    zoomPage.get('zoomPreferenceView').itemContentDidChange();
  },
  
  /**
  Enabled native preference
  */
  enabledNativePreference: function () {
    var zoomPage = Multivio.views.get('navigationView').get('zoomPageView');
    zoomPage.get('zoomPreferenceView').items[2].enabled = YES;
    zoomPage.get('zoomPreferenceView').itemContentDidChange();
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
    Set the new currentPreference.
    Enabled zoomOut and zoomIn and reset current_zoomFactor and
    _current_zoom_step.
    
    @param {Object} button selected 
  */
  setPreference: function (button) {
    var newPref = button.get('value');
    this.set('currentPreference', newPref);
    this.enabledZoomOut();
    this.enabledZoomIn();

    this._current_zoom_step = 0;
    this.current_zoom_factor = this.ZOOM_ORIGINAL_FACTOR;
  }
  
});