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
    Local variable for binding
  */
  position: null,
  
  /**
  Boolean that say if the tree has been already created or not
  */
  treeExist: NO,
  
  /**
  Structure used to create the tree. The globalStructure is the basic 
  structure of the tree. The new branches are added to this structure.
  */
  globalStructure: null,
  
  /**
    An Array that contains all nodes of the tree for a position.
  
    @private
  */
  _treeLabelByPosition: undefined,
  
  /**
    Initialize this controller and create or update the tree. 
    To create this tree we need the treeStructure created by the 
    treeDispatcher. 
  */
  initialize: function () {
    var structure = Multivio.treeDispatcher.treeStructure;
    if (this.get('treeExist')) {
      this._updateTree(structure);
    }
    else {
      //create a binding for position
      this.bind('position', 'Multivio.masterController.currentPosition');
      this._createTree(structure);
    }

    Multivio.logger.info('treeController initialized');
    //order keys to use correctly this._getListOfLabelsForIndex
    var keys = this.ascendingKeys(this._treeLabelByPosition);
    var temp = [];
    for (var i = 0; i < keys.length; i++) {
      var oneKey = keys[i];
      temp[oneKey] = this._treeLabelByPosition[oneKey];
    }
    this._treeLabelByPosition = temp;
  },

  /**
    Create the tree of this controller and set its content.
    
    @param {Object} logicalStructure
    @private
  */  
  _createTree: function (structure) {
    if (!this.get('treeExist')) {
      this.set('treeExist', YES);
      var isGlobalStValid = NO;
      var subT = [];
      //j = 2 =>remove rootNode and referNode
      /*for (var j = 2; j < structure.length; j++) {
        if (structure[j].level !== 0) {
          isGlobalStValid = YES;
        }
        subT.push(structure[j]);
      }
      //global structure is not valid if we have only label with level = 0
      //we need label with level = 1 to add or remove branches 
      if (!isGlobalStValid) {
        var t = this.createNewStructure(subT, []);
        structure = structure.concat(t);        
      }*/

      this.set('globalStructure', structure);
      this._treeLabelByPosition = [];
      //create treeContent and set content
      var treeContent = Multivio.TreeContent.create(structure[0]);
      this.set('content', treeContent);
      //add view
      if (Multivio.layoutController.get('isBasicLayoutUp')) {
        Multivio.layoutController.addComponent('treeDispatcher');
      }
      
      Multivio.logger.info('treeController#_createTree');
      //if no label have position = 1 get the referer node as the leaf
      //to select when currentPosition = 1
      if (SC.none(this._treeLabelByPosition[1])) {
        var arr = this.get('arrangedObjects');
        this._treeLabelByPosition[1] = [arr.objectAt(0)];
      }
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
  Order keys increasingly
  
  @param {Array} oneArray the array to order the keys
  */
  ascendingKeys: function (oneArray) { 
    var keys = [];
    for (var k in oneArray) {
      if (oneArray.hasOwnProperty(k)) {
        keys.push(parseInt(k));
      }
    }
    keys.sort(function (a, b) {return (a > b) - (a < b); });
    return keys;
  },
  
  /**
  Create the new global structure with childs of the treeContent
  
  @param {Array} st array of label
  @parm {Array} ret array to return
  */
  createNewStructure: function (st, ret) {
    for (var i = 0; i < st.length; i++) {
      if (!SC.none(st[i].childs)) {
        st[i].level = 0;
        this.createNewStructure(st[i].childs, ret);
      }
      else {
        st[i].level = 1;
        ret.push(st[i]);
      }
    }
    return ret;
  },
  
  /**
  Add new labels to the tree
  
  @param {Object} lgs the logicalstructure of the file to added
  @private
  */
  _updateTree: function (lgs) {
    //first remove old bindings and create news
    var listOfBindings = this.get('bindings');
    for (var j = 0; j < listOfBindings.length; j++) {
      var oneBinding = listOfBindings[j];
      oneBinding.disconnect();
    }
    this.set('bindings', []);
    this.position = null;
    this.bind('position', 'Multivio.masterController.currentPosition');    
    this.set('selection', null);
    this.set('content', null);
    
    //retreive the old structure and append at the right position the new one
    var globs = this.get('globalStructure');
    var selected = Multivio.masterController.get('currentFile');
    var newStruct = [];
    for (var i = 0; i < globs.length; i++) {
      var temp = globs[i];
      //if (temp.level !== 0) {
        //remove old children
        if (!SC.none(temp.file_position.url) && 
            temp.file_position.url !== Multivio.CDM.getReferer() &&
            !SC.none(temp.childs)) {
          temp.childs = undefined;
        }
        //add new children
        if (temp.file_position.url === selected) {
          temp.childs = lgs;
        }
        /*if (temp.level !== 1) {
          temp.level = 1;
        }*/
      //}
      newStruct.push(temp);
    }
    
    this._treeLabelByPosition = [];
    var treeContent = Multivio.TreeContent.create(newStruct[0]);
    this.set('content', treeContent);
    //add view   
    Multivio.layoutController.addComponent('treeDispatcher');

    if (SC.none(this._treeLabelByPosition[1]) && 
        this._treeLabelByPosition.length !== 0) {
      var arr = this.get('arrangedObjects');
      this._treeLabelByPosition[1] = [arr.objectAt(1)];
    }
    Multivio.logger.info('treeController#_updateTree');
  },
  
  /**
    Updates position by observing changes of the selection property.
    
    @observes selection
  */
  _selectionDidChange: function () {
    var newSelection = this.get('selection'); 
    if (!SC.none(newSelection) && !SC.none(newSelection.firstObject())) {
      //var selectionLevel = newSelection.firstObject().level;
      var selectionIndex = newSelection.firstObject().file_position.index;
      //if level != 2 => change file
      //if index === null => change file
      /*if (selectionLevel !== 2) {
        var url = newSelection.firstObject().file_position.url;
        if (!SC.none(url)) {
          Multivio.masterController.set('currentFile', url);
        }
        else {
          var listOfTree = this.get('arrangedObjects');
          var ind = listOfTree.indexOf(newSelection.firstObject());
          //get next element (normaly the first child)
          // TO DO Verify if url is not null else find next valid url
          ind++;
          Multivio.masterController.set('currentFile', 
              listOfTree.objectAt(ind).file_position.url);
        }
      }*/
      if (SC.none(selectionIndex)) {
        var url = newSelection.firstObject().file_position.url;
        if (!SC.none(url)) {
          Multivio.masterController.set('currentFile', url);
        }
        else {
          var listOfTree = this.get('arrangedObjects');
          var ind = listOfTree.indexOf(newSelection.firstObject());
          //get next element (normaly the first child)
          // TO DO Verify if url is not null else find next valid url
          ind++;
          Multivio.masterController.set('currentFile', 
              listOfTree.objectAt(ind).file_position.url);
        }
      }
      
      //set new position
      else {
        var currentPosition = this.get('position');
        var labelFCPosition = this._getListOfLabelsForIndex(currentPosition);
        var selectionIndex = newSelection.firstObject().file_position.index;
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
    }
  }.observes('selection')

});
