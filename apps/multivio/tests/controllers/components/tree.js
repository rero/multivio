/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/
/*globals Multivio module test ok equals same stop start */

var  nodes, myTreeController, myMasterController, rec1, sel1, rec2, sel2;

module("Test treeController", {
  
  setup: function () {
    Multivio.store = SC.Store.create().from(SC.Record.fixtures);
    nodes = Multivio.store.find(Multivio.CoreDocumentNode);
    
    myTreeController = Multivio.treeController;
    myTreeController.initialize(nodes);
    
    myMasterController = Multivio.masterController;
    myMasterController.initialize(nodes);
    
    //need to be created to avoid problem
    Multivio.thumbnailController.initialize(nodes);
    Multivio.navigationController.initialize();    
        
    rec1 = myTreeController._treeNodeById[myTreeController.get('_cdmNodeToTreeNode')['n00004']];   
    sel1 = SC.SelectionSet.create().addObject(rec1);
    
    rec2 = myTreeController._treeNodeById[myTreeController.get('_cdmNodeToTreeNode')['n00017']];
    sel2 = SC.SelectionSet.create().addObject(rec2);
  },
  
  teardown: function () {
    rec1 = null;
    sel1 = null;
    rec2 = null;
    sel2 = null;
    nodes = null; 
 
    myMasterController = null;
    myTreeController = null;
  }
});
  
test("after initialization no selection and no masterSelection", function () {
  equals(myMasterController.get('masterSelection'), undefined, "should find masterSelection is undefined");
  equals(myTreeController.get('selection').firstObject(), undefined, "should find selection is undefined");
});

test("set masterSelection with first leafNode method", function () {
  SC.RunLoop.begin();
  var sortedNodes = nodes.sortProperty('guid');
  for (var i = 0; i < sortedNodes.length; i++) {
    if (sortedNodes[i].get('isLeafNode')) {
      myMasterController.set('masterSelection', sortedNodes[i]);
      break;
    }
  }
  SC.RunLoop.end();
  equals(myTreeController.get('selection').firstObject(), sel1.firstObject(), "should find the record");
});

test("_selectionDidChange method with two different selection", function () {  
  SC.RunLoop.begin();
  myTreeController.set('selection', sel1);
  SC.RunLoop.end();
  equals(myMasterController.get('masterSelection').get('guid'), 'n00004', "should find the record");
  
  SC.RunLoop.begin();
  myTreeController.set('selection', sel2);
  SC.RunLoop.end();
  ok(myMasterController.get('masterSelection').get('guid') !== 'n00004', "shouldn't find the 'n00004' record but the 'n00017' record");
  equals(myMasterController.get('masterSelection').get('guid'), 'n00017', "should find the record");
});

test("_masterSelectionDidChange method with three different masterSelection", function () {
  SC.RunLoop.begin();
  var cdmNode =  Multivio.store.find(Multivio.CoreDocumentNode, "n00018");
  myMasterController.set('masterSelection', cdmNode);
  SC.RunLoop.end();
  equals(myTreeController.get('selection').firstObject().get('guid'), 'tn00015', "should find the selection");
  
  SC.RunLoop.begin();
  cdmNode =  Multivio.store.find(Multivio.CoreDocumentNode, "n00019");  
  myMasterController.set('masterSelection', cdmNode);
  SC.RunLoop.end();
  equals(myTreeController.get('selection').firstObject().get('guid'), 'tn00015', "should find the same selection");
  
  SC.RunLoop.begin();
  cdmNode =  Multivio.store.find(Multivio.CoreDocumentNode, "n00047");  
  myMasterController.set('masterSelection', cdmNode);
  SC.RunLoop.end();
  ok(myTreeController.get('selection').firstObject().get('guid') !== 'tn00015', "shouldn't find the same selection as before");  
});


