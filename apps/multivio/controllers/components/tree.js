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
    Binds to the CDM.logicalStructure
    
    @binding {hash}
  */
  logicalStructure: null,
  logicalStructureBinding: "Multivio.CDM.logicalStructure",
  
  /**
    Binds to the masterController's currentPosition
    
    @binding {hash}
  */
  position: null,
  positionBinding: "Multivio.masterController.currentPosition",
  
  treeExist: NO,
  

  /**
    A conversion table (masterSelectionId -> treeNodeId) used to quickly
    determine the treeNode associated with a certain master selection
    
    @private
   */
  _cdmNodeToTreeNode: {},
  
  /**
    An Array that contains all nodes of the tree for a position.
  
    @private
  */
  _treeLabelByPosition: undefined,
  
  /**
    Initialize this controller and verify if the sub-model can be created. 
    The sub-model need to have the logical structure of the document.

    @param {String} url the current file url
  */
  initialize: function (url) {
    var logStr = Multivio.CDM.getLogicalStructure(url);
    if (!SC.none(logStr) && logStr !== -1) {
      this._createTree(logStr);
    }
    Multivio.logger.info('treeController initialized');
  },

  /**
    CDM.logicalStructure has changed. Verify if we can create the sub-model.

    @observes logicalStructure
  */  
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

  /**
    Create the sub-model of this controller and set the content.
    
    @param {Object} logicalStructure
    @private
  */  
  _createTree: function (structure) {
    if (! this.get('treeExist')) {
      this.set('treeExist', YES);
      var rootNodeHash = {
        file_postition: {
          index: 0
        },
        label: "A new PDF",
        childs: structure
      };
      this._treeLabelByPosition = [];
      this._treeLabelByPosition[0] = [rootNodeHash];
      var treeContent = Multivio.TreeContent.create(rootNodeHash);
      this.set('content', treeContent);
      Multivio.layoutController.addComponent('views.treeView');
      Multivio.logger.info('treeController#_createTree');
    }
  },

  /**
    Updates selection by observing changes of the position property.
    
    @observes position
  */
  positionDidChange: function () {
    var newPosition = this.get('position');
    if (!SC.none(newPosition)) {  
      //retreive the list of labels for this position
      var labels = this._getListOfLabelsForIndex(newPosition);
      if (!SC.none(labels)) {
        //verify if we really need to set selection
        //var currentSelection = ;
        var currentSelection = !SC.none(this.get('selection')) ?
            this.get('selection').firstObject() : undefined;
        if (labels.length === 1) {
          var treeLabelToSelect = labels[0];
          if (currentSelection !== treeLabelToSelect) {
            this.set('selection', 
                SC.SelectionSet.create().addObject(treeLabelToSelect));
            Multivio.logger.info('treeController#positionDidChange case 1: %@'.
                fmt(this.get('selection').firstObject()));
          }
        }
        else {
          //verify if label is already selected
          var isAlreadySelected = NO;
          for (var i = 0; i < labels.length; i++) {
            var tempLabel = labels[i];
            if (currentSelection === tempLabel) {
              isAlreadySelected = YES;
              break;
            }
          }
          if (!isAlreadySelected) {
            this.set('selection', 
                SC.SelectionSet.create().addObject(labels[0]));
            Multivio.logger.info('treeController#positionDidChange case 2: %@'.
                fmt(this.get('selection').firstObject()));
          }
        } 
      }
    }
  }.observes('position'),
  
  /**
    Return a list of treeLabel link to this index.
    
    @param {number} index
    @private
  */
  _getListOfLabelsForIndex: function (index) {
    var listToReturn = undefined;
    //case simple the position is an index
    if (!SC.none(this._treeLabelByPosition) && !SC.none(index)) {
      var label = this._treeLabelByPosition[index];
      if (!SC.none(label)) {
        listToReturn = label;
      }
      else {
        //found the right label
        var lastIndex = 0;
        var newIndex = 0;
        for (var key in this._treeLabelByPosition) {
          //TO DO How to have only key = number
          if (this._treeLabelByPosition.hasOwnProperty(key)) {
            newIndex = key;
            if (newIndex < index) {
              lastIndex = newIndex;
            }
            else {
              //get the lastIndex
              listToReturn = this._treeLabelByPosition[lastIndex];
              break;
            }
          }
          else {
            listToReturn = this._treeLabelByPosition[lastIndex];
            break;
          }
        }
      }
    }
    return listToReturn;
  },
  
  /**
    Updates position by observing changes of the selection property.
    
    @observes selection
  */
  _selectionDidChange: function () {
    var newSelection = this.get('selection'); 
    if (!SC.none(newSelection) && !SC.none(newSelection.firstObject())) {
      var selectionIndex = newSelection.firstObject().file_postition.index;
      var currentPosition = this.get('position');
      var labelFCPosition = this._getListOfLabelsForIndex(currentPosition);
      if (!SC.none(labelFCPosition)) {
        labelFCPosition = labelFCPosition[0];
      }
      var selectionLabel = newSelection.firstObject();
      if (selectionIndex !== currentPosition && selectionLabel !== labelFCPosition) {
        this.set('position', selectionIndex);
        Multivio.logger.info('treeController#selectionDidChange: %@'.
            fmt(this.get('position')));
      }
    }
  }.observes('selection')

});
