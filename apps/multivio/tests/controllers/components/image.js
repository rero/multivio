// ==========================================================================
// Project:   Multivio Unit Test
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Multivio module test ok equals same stop start */

var myImageController, myMasterController;

module("Test imageController", {
  
  setup: function () { 
      
    //load Fixtures VAA
    //get physicalStructure
    var physical = {};
    physical = Multivio.CDM.FIXTURES.physical['VAA'];
  
    //initialize masterController & myImageController
    myMasterController = Multivio.masterController;
    myMasterController.currentFile = 'VAA';
    
    myImageController = Multivio.imageController;
    myImageController.bind('position', 'Multivio.masterController.currentPosition');
    myImageController._createImages(physical);
  },
  
  teardown: function () {
    delete myMasterController;
    delete myImageController;
  }
});

test("after initialization no selection and no currentPosition", function () {
  equals(myMasterController.get('currentPosition'), null,
      "should find currentPosition is null");
  equals(myImageController.get('selection').firstObject(), undefined,
      "should find selection is undefined");
});

test("masterController select first file: currentPosition = 1", function () {  
  
  SC.RunLoop.begin();
  myMasterController.selectFirstPosition();
  SC.RunLoop.end();
  
  equals(myImageController.get('selection').firstObject().pageNumber, 1,
      "myImageController page number of the selection is 1");
  equals(myImageController.get('position'), 1,
      "myImageController first position is 1");
  equals(myMasterController.get('currentPosition'), 1, 
      "masterController currentPosition is 1");
});

test("masterController.set('currentPosition')", function () {
  
  SC.RunLoop.begin();
  myMasterController.set('currentPosition', 51);
  SC.RunLoop.end();
  
  equals(myImageController.get('selection').firstObject().pageNumber, 51, 
      "imageController selection page number should be 51");
  
  SC.RunLoop.begin();
  myMasterController.set('currentPosition', 19);
  SC.RunLoop.end();
  
  equals(myImageController.get('selection').firstObject().pageNumber, 19,
      "imageController selection index should be 19");
  ok(myImageController.get('position') ===  
      myImageController.get('selection').firstObject().pageNumber,
      "imageController selection page number should be the same as position")
});

