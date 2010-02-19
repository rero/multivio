/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

var myZoomController;

module("Test zoomController", {
  setup: function () {
    myZoomController = Multivio.zoomController;
    /*SC.Observers.suspendPropertyObserving();
    myZoomController.set('isZooming', NO);
    myZoomController.set('factor', null);
    SC.Observers.resumePropertyObserving();*/
  },
  
  teardown: function () {
    myZoomController = null;
  }
});

test("_isZoomStepValid method", function () {
  equals(myZoomController._isZoomStepValid(0), YES, "should find step 0 is a valid zoom step");
  equals(myZoomController._isZoomStepValid(3), YES, "should find step 3 is a valid zoom step");
  equals(myZoomController._isZoomStepValid(-5), YES, "should find step -5 is a valid zoom step");
  equals(myZoomController._isZoomStepValid(5), NO, "should find step 5 is a non valid zoom step");
  equals(myZoomController._isZoomStepValid(-6), NO, "should find step -6 is a non valid zoom step");    
});

test("doZoomIn method", function () {
  myZoomController.doZoomIn();
  equals(myZoomController.get('_current_zoom_step'), 1, "should find the _current_zoom_step with the value 1");
  equals(myZoomController.get('current_zoom_factor'), 1.3, "should find the current_zoom_factor with the value 1.3");  
});

test("doZoomOut method", function () {
  myZoomController.doZoomOut();
  equals(myZoomController.get('_current_zoom_step'), 0, "should find the _current_zoom_step with the value 0");
  equals(myZoomController.get('current_zoom_factor'), 1, "should find the current_zoom_factor with the value 1");
  myZoomController.doZoomOut();
  equals(myZoomController.get('_current_zoom_step'), -1, "should find the _current_zoom_step with the value -1");
  equals(myZoomController.get('current_zoom_factor'), myZoomController._zoomFactorForStep(-1), "should find the current_zoom_factor with the value 0.7"); 
});

test("doZoomOriginal method", function () {
  myZoomController.doZoomOriginal();
  equals(myZoomController.get('_current_zoom_step'), 0, "should find the _current_zoom_step with the value 0");
  equals(myZoomController.get('current_zoom_factor'), myZoomController.ZOOM_ORIGINAL_FACTOR, "should find the current_zoom_factor with the value ZOOM_ORIGINAL_FACTOR");  
});