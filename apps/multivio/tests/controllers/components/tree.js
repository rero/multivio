/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/
/*globals Multivio module test ok equals same stop start */

var myTreeController, myMasterController, myTreeDispatcher;

module("Test treeController", {
  
  setup: function () { 
      
    //load Fixtures VAA
    Multivio.CDM.setReferer('VAA');
    //get and set metadata
    var metadata = {};
    metadata['VAA'] = Multivio.CDM.FIXTURES.metadata['VAA'];
    Multivio.CDM.metadata = metadata;
    //get and set logicalStructure
    var logical = {};
    logical['VAA'] = Multivio.CDM.FIXTURES.logical['VAA'];
    Multivio.CDM.logicalStructure = logical;
    //get and set physicalStructure
    var physical = {};
    physical['VAA'] = Multivio.CDM.FIXTURES.physical['VAA'];
    Multivio.CDM.physicalStructure = physical;
  
    //initialize masterController, treeDispatcher & treeController
    myMasterController = Multivio.masterController;
    myMasterController.currentFile = 'VAA';
    
    myTreeDispatcher = Multivio.treeDispatcher;
    myTreeController = Multivio.treeController;
    myTreeController.bind('position', 'Multivio.masterController.currentPosition');
    
    myTreeDispatcher.createIndex('VAA');
  },
  
  teardown: function () {
    delete myMasterController;
    delete myTreeController;
    delete myTreeDispatcher;
  }
});
  
test("after initialization no selection and no currentPosition", function () {
  equals(myMasterController.get('currentPosition'), null,
      "should find currentPosition is null");
  equals(myTreeController.get('selection').firstObject(), undefined,
      "should find selection is undefined");
});

test("masterController select first file: currentPosition = 1", function () {  
  
  SC.RunLoop.begin();
  myMasterController.selectFirstPosition();
  SC.RunLoop.end();
  
  equals(myTreeController.get('selection').firstObject().file_position.index, 1,
      "treeController first index of the selection is 1");
  equals(myTreeController.get('position'), 1,
      "treeController first position is 1");
  equals(myMasterController.get('currentPosition'), 1, 
      "masterController currentPosition is 1");
    console.info('K');
});

test("treeController._selectionDidChange", function () { 
  
  SC.RunLoop.begin();
  myTreeController.position = 1;
  SC.RunLoop.end();
  
  SC.RunLoop.begin();  
  var treeLabelToSelect = myTreeController._getListOfLabelsForIndex(5);
  myTreeController.set('selection', 
        SC.SelectionSet.create().addObject(treeLabelToSelect[0])); 
  SC.RunLoop.end();

  equals(myMasterController.get('currentPosition'), 5, 
      "masterController currentPosition should be 5");
  equals(myTreeController.get('position'), 5, 
    "treeController position should be 5");
});

test("masterController.set('currentPosition')", function () {
  
  SC.RunLoop.begin();
  myMasterController.set('currentPosition', 7);
  SC.RunLoop.end();
  
  equals(myTreeController.get('selection').firstObject().file_position.index, 7, 
      "treeController selection index should be 7");
  
  SC.RunLoop.begin();
  myMasterController.set('currentPosition', 19);
  SC.RunLoop.end();
  
  equals(myTreeController.get('selection').firstObject().file_position.index, 19,
      "treeController selection index should be 19");
  ok(myTreeController.get('position') ===  
      myTreeController.get('selection').firstObject().file_position.index,
      "treeController selection index should be the same as position")
});
