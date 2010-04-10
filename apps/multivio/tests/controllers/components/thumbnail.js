/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/
/*globals Multivio module test ok equals same stop start */

var  nodes, myThumbnailController, myMasterController, rec, sel1, rec2, sel2;

module("Test thumbnailController", {
  setup: function () {
    Multivio.store = SC.Store.create().from(SC.Record.fixtures);
    nodes = Multivio.store.find(Multivio.CoreDocumentNode);
    
    myThumbnailController = Multivio.thumbnailController;
    myThumbnailController.initialize(nodes);
    
    myMasterController = Multivio.masterController;
    myMasterController.initialize(nodes);
    
    //need to be created to avoid problem
    Multivio.treeController.initialize(nodes);
    Multivio.navigationController.initialize();    
        
    rec = Multivio.store.find(Multivio.Thumbnail, "fn00004");   
    sel1 = SC.SelectionSet.create().addObject(rec);
    
    rec2 = Multivio.store.find(Multivio.Thumbnail, "fn00006");
    sel2 = SC.SelectionSet.create().addObject(rec2);
  },
  
  teardown: function () {
    rec = null;
    sel1 = null;
    rec2 = null;
    sel2 = null;
    nodes = null; 
 
    myMasterController = null;
    myThumbnailController = null;
  }
});

test("after initialization no selection and no masterSelection", function () {
  equals(myMasterController.get('masterSelection'), undefined, "should find masterSelection is undefined");
  equals(myThumbnailController.get('selection').firstObject(), undefined, "should find selection is undefined");
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
  equals(myThumbnailController.get('selection').firstObject(), sel1.firstObject(), "should find the record");
});

test("_selectionDidChange method with two different selection", function () {  
  SC.RunLoop.begin();
  myThumbnailController.set('selection', sel1);
  SC.RunLoop.end();
  equals(myMasterController.get('masterSelection').get('guid'), 'n00004', "should find the record");
  
  SC.RunLoop.begin();
  myThumbnailController.set('selection', sel2);
  SC.RunLoop.end();
  ok(myMasterController.get('masterSelection').get('guid') !== 'n00004', "shouldn't find the 'n00004' record but the 'n00006' record");
});

test("_masterSelectionDidChange method with two different masterSelection", function () {
  SC.RunLoop.begin();
  var cdmNode =  Multivio.store.find(Multivio.CoreDocumentNode, "n00004");
  myMasterController.set('masterSelection', cdmNode);
  SC.RunLoop.end();
  equals(myThumbnailController.get('selection').firstObject().get('guid'), 'fn00004', "should find the selection");
  
  SC.RunLoop.begin();
  cdmNode =  Multivio.store.find(Multivio.CoreDocumentNode, "n00006");  
  myMasterController.set('masterSelection', cdmNode);
  SC.RunLoop.end();
  ok(myThumbnailController.get('selection').firstObject().get('guid') !== 'fn00004', "shouldn't find the 'fn00004' selection but the 'fn00006' selection");
});
