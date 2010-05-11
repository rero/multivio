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
    Binds to the masterController's currentPosition
    
    @binding {hash}
  */
  position: null,
  selection: null,
  //positionBinding: "Multivio.masterController.currentPosition",
  
  treeExist: NO,
  
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
    this.set('treeExist', NO);
    this.position = null;
    this.bind('position', 'Multivio.masterController.currentPosition');
    Multivio.logger.info('treeController initialized');
  },



  /**
    Create the sub-model of this controller and set the content.
    
    @param {Object} logicalStructure
    @private
  */  
  _createTree: function (structure) {
    if (! this.get('treeExist')) {
      this.set('treeExist', YES);
      console.info('TR: createTree ' + structure);
      var ref = Multivio.CDM.getReferer();
      var meta = Multivio.CDM.getMetadata(ref); 
      var referer = [{
        file_position: {
          index: 1,
          url: 'http://referer'  
        },
        label: meta.title,
        childs: structure
      }];
      var rootNodeHash = {
        file_position: {
          index: 0,
          url: 'http://badUrl.pdf'
        },
        label: "A new PDF",
        childs: referer
      };
      this._treeLabelByPosition = [];
      //this._treeLabelByPosition[0] = [rootNodeHash];
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
    console.info('TR: position did change ' + newPosition);
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
    console.info('TR: selectionDidChange ' + newSelection);
    if (!SC.none(newSelection) && !SC.none(newSelection.firstObject())) {
      var selectionIndex = newSelection.firstObject().file_position.index;
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
