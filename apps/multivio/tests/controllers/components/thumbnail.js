/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/
/*globals Multivio module test ok equals same stop start */

var myThumbnailController, myMasterController;

module("Test thumbnailController", {
  
  setup: function () {   
    //load Fixtures VAA
    //get and set physicalStructure
    var physical = {};
    physical = Multivio.CDM.FIXTURES.physical['VAA'];
    
    //initialize masterController & thumbnailController
    myMasterController = Multivio.masterController;
    myMasterController.currentFile = 'VAA';
    
    myThumbnailController = Multivio.thumbnailController;
    myThumbnailController.bind('position', 'Multivio.masterController.currentPosition');
    myThumbnailController._createThumbnails(physical);
  },
  
  teardown: function () {
    delete myMasterController;
    delete myThumbnailController;
  }
  
});

test("after initialization no selection and no currentPosition", function () {
  equals(myMasterController.get('currentPosition'), null,
      "should find currentPosition is null");
  equals(myThumbnailController.get('selection').firstObject(), undefined,
      "should find selection is undefined");
}); 

test("masterController select first file: currentPosition = 1", function () {  
  
  SC.RunLoop.begin();
  myMasterController.selectFirstPosition();
  SC.RunLoop.end();
  
  equals(myThumbnailController.get('selection').firstObject().pageNumber, 1,
      "thumbnailController first page number of the selection is 1");
  equals(myThumbnailController.get('position'), 1,
      "thumbnailController first position is 1");
  equals(myMasterController.get('currentPosition'), 1, 
      "masterController currentPosition is 1");
    console.info('K');
});

test("thumbnailController.selectionDidChange", function () { 
  
  SC.RunLoop.begin();
  myThumbnailController.position = 1;
  SC.RunLoop.end();
  
  SC.RunLoop.begin();  
  var thumbnailToSelect = {
      url:  'http://purl.dlib.indiana.edu/iudl/brittlebooks/page/VAA1194-03-screen.gif',
      pageNumber: 4
    };
  myThumbnailController.set('selection', 
      SC.SelectionSet.create().addObject(thumbnailToSelect)); 
  SC.RunLoop.end();

  equals(myMasterController.get('currentPosition'), 4, 
      "currentPosition should be 4");
});

test("masterController.set('currentPosition')", function () {
  
  SC.RunLoop.begin();
  myMasterController.set('currentPosition', 8);
  SC.RunLoop.end();
  
  equals(myThumbnailController.get('selection').firstObject().pageNumber, 8, 
      "should find 8");
  
  SC.RunLoop.begin();
  myMasterController.set('currentPosition', 24);
  SC.RunLoop.end();
  
  equals(myThumbnailController.get('selection').firstObject().pageNumber, 24,
      "should find the 24");
});
