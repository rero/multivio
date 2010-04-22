/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This controller manages the behavior of the tree view. It depends on
  the master controller.

  @author che
  @extends SC.TreeController
  @since 0.1.0  
*/

Multivio.treeController = SC.TreeController.create(
/** @scope Multivio.treeController.prototype */ {

  /**
    Binds to the masterController's masterSelection
    
    @binding {Multivio.CoreDocumentNode}
  */
 // masterSelectionBinding: "Multivio.masterController.masterSelection",
  
  //masterBinding: "Multivio.masterController",
  logicalStructure: null,
  logicalStructureBinding: "Multivio.CDM.logicalStructure",
  treeExist: NO,

  /**
    A conversion table (masterSelectionId -> treeNodeId) used to quickly
    determine the treeNode associated with a certain master selection
    
    @private
   */
  _cdmNodeToTreeNode: {},
  
  /**
    An Array that contains all nodes of the tree with there id.
  
    @private
  */
  _treeNodeById: {},
  
  /**
    Initialize this controller, create the sub-model and the tree model

    @param {SC.RecordArray} nodes records of the CDM
  */
  initialize: function (url) {
    var logStr = Multivio.CDM.getLogicalStructure(url);
    if (!SC.none(logStr) && logStr !== -1) {
      this._createTree(logStr);
    }
    Multivio.logger.info('treeController initialized');
  },
  
  logicalStructureDidChange: function () {
    var cf = Multivio.masterController.get('currentFile');
    if (!SC.none(cf)) {    
      var logStr = this.get('logicalStructure')[cf];
      if (!SC.none(logStr) && logStr !== -1) {
        this._createTree(logStr);
      }
      else if (logStr === -1) {
        Multivio.layoutController.removeComponent('views.treeView');
      }
    }
  }.observes('logicalStructure'),
  
  _createTree: function (structure) {
    if (!this.get('treeExist')) {
      this.set('treeExist', YES);
      var rootNodeHash = {
        label: "A new PDF",
        childs: structure
      };
      //this.set('treeItemChildrenKey', 'childs');
      var treeContent = Multivio.TreeContent.create(rootNodeHash);
      this.set('content', treeContent);
      Multivio.layoutController.addComponent('views.treeView');
    }
  },


  /**
    Updates the masterSelection binding if the currently 
    selected tree node has changed.

    @private
    @observes selection
   */
  _selectionDidChange: function () {
    var needToChange =  YES;
    var treeSelectionId = this.get('selection');
    // if selection is not undefined, retrieve the corresponding Tree record
    if (!SC.none(this.get('selection')) && 
      !SC.none(this.get('selection').firstObject()))  {
      treeSelectionId = this.get('selection').firstObject().get('guid');
      var treeSelection = Multivio.store.find(Multivio.Tree, treeSelectionId);
      
      // retrieve target and leaf of this Tree record
      if (!SC.none(treeSelection)) {
        var target = treeSelection.get('targetCdmLeaf');
        var cdmLeafNodeIds = treeSelection.get('cdmLeafNodeIds');
        
        // retrieve the master selection
        var currentMasterSelection = this.get('masterSelection');
        if (!SC.none(currentMasterSelection)) {
          var masterSelectionId = currentMasterSelection.get('guid');
          
          // verify if the selection is not the selected Tree Node
          if (SC.typeOf(cdmLeafNodeIds) === SC.T_ARRAY) {
            for (var i = 0; i < cdmLeafNodeIds.length; i++) {
              if (cdmLeafNodeIds[i] === masterSelectionId) {
                // the change in the three selection does not imply a change of
                // the master selection
                needToChange = NO;
                break;
              }
            }
          }
        }
        // verify target !== masterSelection
        if (!SC.none(target) && this.get('masterSelection') !== target) {
          // change the masterSelection if needed
          if (needToChange) {
            SC.RunLoop.begin();
            this.set('masterSelection', treeSelection.get('targetCdmLeaf'));
            SC.RunLoop.end();
            
            Multivio.logger.debug('treeController#_selectionDidChange: %@'.
                fmt(treeSelectionId));
          }
        }
      }
    }
  }.observes('selection'),

  /**
    Updates selection by observing changes in master controller's master
    selection

    @private
    @observes masterSelection
  */
  _masterSelectionDidChange: function () {
    var needToChange = YES;
    var currentMasterSelection = this.get('masterSelection');
    // if masterSelection is not undefined retrieve the guid
    if (!SC.none(currentMasterSelection)) {
      var masterSelectionId = currentMasterSelection.get('guid');      
      
      // verify that the new masterSelection is not a leaf of the TreeNode
      if (!SC.none(this.get('selection')) && 
          !SC.none(this.get('selection').firstObject())) {
        var currentSelection = 
            this.get('selection').firstObject().get('guid');
        var treeSelection = Multivio.store.find(Multivio.Tree, currentSelection);
        if (!SC.none(treeSelection)) {
          var cdmLeafNodeIds = treeSelection.get('cdmLeafNodeIds');

          if (SC.typeOf(cdmLeafNodeIds) === SC.T_ARRAY) {
            for (var i = 0; i < cdmLeafNodeIds.length; i++) {
              if (cdmLeafNodeIds[i] === masterSelectionId) {
                // the change in the content selection does not imply 
                // a change of the tree selection
                needToChange = NO;
                break;
              }
            }
            if (treeSelection.get('targetCdmLeaf').get('guid') ===
                masterSelectionId) {
              needToChange = NO;
            }
          }
        }
      }
      // change the selection if needed
      if (needToChange) {
        var newSelection = 
            this.get('_cdmNodeToTreeNode')[currentMasterSelection.get('guid')];
        this.set('selection', 
            SC.SelectionSet.create().addObject(this._treeNodeById[newSelection]));
        
        Multivio.logger.debug('treeController#_masterSelectionDidChange: %@'.
            fmt(this.get('masterSelection').get('guid')));
      }
    }
  }.observes('masterSelection'),
  
  /**
    Write on the logger console the tree sub-model
    
    @private
    */
  _showTreeSubModel: function () {
    // TODO document this and define where to put it
    var treeNodes = Multivio.store.find(Multivio.Tree)
        .sortProperty('guid').enumerator();
    
    var treeNodesArray = [];
    for (var t = 0; t < treeNodes._length; t++) {
      var treeNodeHash = JSON.stringify(treeNodes.nextObject().attributes());
      treeNodesArray.push(treeNodeHash);
    }
    treeNodes.reset();
    var treeNodesJSON = JSON.stringify(treeNodesArray);
    Multivio.logger.info(treeNodesJSON);
  }

});
