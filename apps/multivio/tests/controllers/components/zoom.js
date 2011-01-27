/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/

var myZoomController;

module("Test zoomController", {
  setup: function () {
    myZoomController = Multivio.zoomController;
    myZoomController.zoomScale = Multivio.configurator.get('zoomParameters').scaleForBitmapGraphics;
    myZoomController.maxStep = myZoomController.zoomScale.length - 1;
    myZoomController.minRatio = myZoomController.zoomScale[0];
    myZoomController.maxRatio = myZoomController.zoomScale[myZoomController.maxStep];
  },
  
  teardown: function () {
    myZoomController = null;
  }
});

// Test if initialization is OK
test("initialize", function () {
  equals(myZoomController.get('zoomScale').length, 8, "length of the scaleForBitmapGraphics is 8");
  equals(myZoomController.get('zoomScale')[0], 0.1, "should find 0.1 as first step");
  equals(myZoomController.get('zoomScale')[7], 1, "should find 1 as last step");   
});

// Test zoomIn method
test("doZoomIn method", function () {
  myZoomController.zoomStep = 2;
  myZoomController.doZoomIn();
  equals(myZoomController.get('zoomStep'), 3, "should find the zoomStep with the value 3");
  equals(myZoomController.get('zoomRatio'), 0.3, "should find the zoomRatio with the value 0.3");  
});

// Test zoomIn method with not allowed value
test("doZoomIn failed method", function () {
  // should not zoomIn
  myZoomController.zoomStep = 7;
  myZoomController.doZoomIn();
  equals(myZoomController.get('zoomStep'), 7, "should find the zoomStep with the value 7");
  
  myZoomController.zoomStep = -1;
  myZoomController.zoomRatio = 0.08;
  myZoomController.doZoomIn();
  equals(myZoomController.get('zoomStep'), 0, "should find the zoomStep with the value 0");
  
  myZoomController.zoomStep = -1;
  myZoomController.zoomRatio = 1.4;
  myZoomController.doZoomIn();
  equals(myZoomController.get('zoomRatio'), 1.4, "should find the zoomRatio with the value 1.4");
});

// Test nextStep method
test("getNextstep method", function () {
  var step = myZoomController.getNextStep(0.18);
  equals(step, 2, "should return 2");
  // if ratio is the value of one step
  step = myZoomController.getNextStep(0.5);
  equals(step, 6, "should return 6");
});

// Test zoomOut method
test("doZoomOut method", function () {
  myZoomController.zoomStep = 2;
  myZoomController.doZoomOut();
  equals(myZoomController.get('zoomStep'), 1, "should find the zoomStep with the value 1");
  equals(myZoomController.get('zoomRatio'), 0.15, "should find the zoomRatio with the value 0.15");  
});

// Test zoomOut method with not allowed value
test("doZoomOut failed method", function () {
  //should not zoomOut
  myZoomController.zoomStep = 0;
  myZoomController.doZoomOut();
  equals(myZoomController.get('zoomStep'), 0, "should find the zoomStep with the value 0");
  
  myZoomController.zoomStep = -1;
  myZoomController.zoomRatio = 1.4;
  myZoomController.doZoomOut();
  equals(myZoomController.get('zoomStep'), 7, "should find the zoomStep with the value 4");
  
  myZoomController.zoomStep = -1;
  myZoomController.zoomRatio = 0.04;
  myZoomController.doZoomOut();
  equals(myZoomController.get('zoomRatio'), 0.04, "should find the zoomRatio with the value 0.04");
});

// Test previousStep method
test("getPreviousStep method", function () {
  var step = myZoomController.getPreviousStep(0.46);
  equals(step, 4, "should return 4");
  // if ratio is the value of one step
  step = myZoomController.getPreviousStep(0.15);
  equals(step, 0, "should return 0");  
});

// Test setBestStep method
test("setBestStep method", function () {
  myZoomController.setBestStep(3000, 3000);
  equals(myZoomController.get('zoomStep'), 5, "should return 5");
  equals(myZoomController.get('zoomRatio'), 0.5, "should find the zoomRatio with the value 0.5");
});