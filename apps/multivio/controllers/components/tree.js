/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This controller manages the behavior of the tree view.
  
  algo for the treeStructure:

  get logical structure (lg)
    if (lg = -1): create binding
    else:

      if (lg = null): get physical structure (ph)
        if (ph = -1): create binding
        if (ph = null): error (no structure)
        if (ph = ok): 
          if (isGrouped) : create logical structure using ph with index
          else : create logical structure with ph but without index

      if (lg = ok) test file_position.index
        if (index = null): get physical structure to create index
          if (ph = -1): create binding
          if (ph = null): error (no index)
          if (ph = ok): 
            if (isGrouped) :create index using ph
            else: use lg
        else: create logical structure using lg

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
  logicalStructure: null,
  physicalStructure: null,
  
  /**
    Boolean that say if the tree has been already created or not
  */
  treeExist: NO,
  
  /**
    Structure used to create the tree. The globalStructure is the basic 
    structure of the tree. The treeStructure is the current structure 
    that can be added to the globalStructure.
  */
  globalStructure: null,
  treeStructure: null,
  
  /**
    An Array that contains all nodes of the tree for a position.
  
    @private
  */
  _treeLabelByPosition: undefined,
  
  /**
    Initialize this controller and verify if the sub-model can be created. 
    The sub-model need to have the logical or the physical structure of the document .

    @param {String} url the current file url
  */
  initialize: function (url) {
    if (this.get('bindings').length !== 0) {
      this.reset();
    }
    // if isGrouped get the structure of the referer 
    if (Multivio.masterController.isGrouped) {
      this.treeStructure = null;
      url = Multivio.CDM.getReferer();
      this.treeExist = NO;
    }

    // Create the first time the rootNode and referer
    if (SC.none(this.treeStructure)) {
      var metadata = Multivio.CDM.getFileMetadata(url);
      if (metadata !== -1) {
        var ref = Multivio.CDM.getReferer();
        this._createRootAndRefererNodes(metadata.title, ref);
      }
    }
    // it not the first time we call initialize reset treeStructure
    else {
      this.treeStructure = null;
    }
    
    // get logical structure first 
    var logStr = Multivio.CDM.getLogicalStructure(url);
    if (logStr !== -1) {
      // if  logicalStructure = null get physical structure
      if (SC.none(logStr)) {
        var phySt = Multivio.CDM.getPhysicalstructure(url);
        if (phySt === -1) {
          this.bind('physicalStructure',  'Multivio.CDM.physicalStructure');
        }
        else {
          if (SC.none(phySt)) {
            Multivio.logger.info('This document has no logical and no physical structure');
          }
          // create logical structure with physical structure
          else {
            var structure = [];
            for (var i = 0; i < phySt.length; i++) {
              var oneElem = phySt[i];
              var newElem = {
                file_position: {
                  index: Multivio.masterController.isGrouped ? i + 1 :null,
                  url: oneElem.url
                },
                label: oneElem.label
              };
              structure.push(newElem);
            }
            this._addSubtree(structure);
            this.initializeTree();
          }
        }
      }

      // logical structure != null
      else {
        // now test if file_position.index = null
        // if index is null create index using physicalStructure
        var firstLogicalEl = logStr[0];
        var newLogStr = [];
        if (firstLogicalEl.file_position.index === null) {
          var phyStr = Multivio.CDM.getPhysicalstructure(url);
          if (phyStr !== -1) {
            if (SC.none(phyStr)) {
              Multivio.logger.error('This document has no physical structure to create index');
            }
            // create index
            else {
              if (Multivio.masterController.isGrouped) {
                var fakeNode = {
                  file_position: {
                    index: 0,
                    url: ''
                  },
                  label: 'fake node',
                  childs: logStr          
                };
                var newLogSt = this.setLogicalIndex(fakeNode, phyStr);
                // remove the fake node
                this._addSubtree(newLogSt.childs);
                this.initializeTree();
              } 
              else {
                this._addSubtree(logStr);
                this.initializeTree();
              }
            }
          }
          // phyStr = -1 : create a binding
          else {
            this.bind('physicalStructure', 'Multivio.CDM.physicalStructure');
          }
        }
        // index for logical structure already exist use it
        else {
          this._addSubtree(logStr);
          this.initializeTree();
        }
      }
    }
    // logicalStructure not in the client create the binding
    else {
      this.bind('logicalStructure', 'Multivio.CDM.logicalStructure');
    }
    Multivio.logger.info('treeController initialized');
  },
  
  /**
    Create the root node of the treeView. This node is never show
    Create the first visible node of the treeView (the label of the referer).

    @param {String} refererLabel the title of the referer
    @param {String} refererUrl the url of the referer
    @private
  */
  _createRootAndRefererNodes: function (refererLabel, refererUrl) {
    this.treeStructure = [];
    var refererNode = [{
      file_position: {
        index: null,
        url: refererUrl
      },
      label: refererLabel,
      childs: null
    }];
    // create rootNode and add refererNode as it child
    var rootNode = {
      file_position: {
        index: null,
        url: null
      },
      label: "Root Node",
      childs: refererNode
    };
    this.treeStructure.push(rootNode);
    this.treeStructure.push(refererNode);
  },
  
  /**
    Add new logical structure to the current treeStructure

    @private
  */
  _addSubtree: function (list) {
    var newStructure = [];
    // if treeStructure is not null
    // append child to the refererNode
    if (!SC.none(this.treeStructure)) {
      var refererNode = this.treeStructure[1];
      refererNode[0].childs = list;
      newStructure.push(this.treeStructure[0]);
      newStructure.push(refererNode[0]);
    }
    for (var i = 0; i < list.length; i++) {
      newStructure.push(list[i]);
    }
    this.treeStructure = newStructure;
  },
  
  /**
    Reset bindings
  */
  reset: function () {
    var listOfBindings = this.get('bindings');
    for (var i = 0; i < listOfBindings.length; i++) {
      var oneBinding = listOfBindings[i];
      oneBinding.disconnect();
    }   
    this.set('bindings', []);
  },
  
  /**
    Create the index for a logical structure. 
    To do it we compare urls of the logical and the physical structures

    @param {Object} oneNode a node of the logicalStructure. At the first call,
        this node has as childs the logical structure file
    @param {Objet} list the physical structure of the file
  */
  setLogicalIndex: function (oneNode, list) {  
    var url = oneNode.file_position.url;

    for (var j = 0; j < list.length; j++) {
      var physicalUrl = list[j].url;
      if (physicalUrl === url) {
        oneNode.file_position.index = j + 1;
        break;
      }
    }
    var hasChildren = oneNode.childs;
    if (!SC.none(hasChildren)) {
      for (var i = 0; i < hasChildren.length; i++) {
        var onechild = oneNode.childs[i];
        this.setLogicalIndex(onechild, list);
      }
    }
    return oneNode;
  },

  /**
    CDM.logicalStructure has changed. Verify if we can create the sub-model.

    @observes logicalStructure
  */  
  logicalStructureDidChange: function () {
    if (!SC.none(this.get('logicalStructure'))) {
      var cf = Multivio.masterController.get('currentFile');
      if (Multivio.masterController.isGrouped) {
        cf = Multivio.CDM.getReferer();
      }
      if (!SC.none(cf)) {
        var logStr = this.get('logicalStructure')[cf];
        if (logStr !== -1) {
          // logical structure = null get physical structure
          if (SC.none(logStr)) {
            var phSt = Multivio.CDM.getPhysicalstructure(cf);
            // physical structure
            if (phSt !== -1) {
              if (SC.none(phSt)) {
                Multivio.logger.error('This document has no logical and no physical structure ');
              }
              else {
                var structure = [];
                for (var i = 0; i < phSt.length; i++) {
                  var oneElem = phSt[i];
                  var newElem = {
                    file_position: {
                      index: Multivio.masterController.isGrouped ? i + 1 :null,
                      url: oneElem.url
                    },
                    label: oneElem.label
                  };
                  structure.push(newElem);
                }
                this._addSubtree(structure);
                this.initializeTree();
              }
            }
            // physical structure  = -1 create the binding 
            else {
              this.bind('physicalStructure',  'Multivio.CDM.physicalStructure');              
            }
          }
          // logical structure exist
          else {
            // now test if file_position.index = null
            // if index is null create index using physical structure
            var firstLogicalEl = logStr[0];
            var newLogStr = [];
            if (firstLogicalEl.file_position.index === null) {
              var phyStr = Multivio.CDM.getPhysicalstructure(cf);
              if (phyStr !== -1) {
                if (SC.none(phyStr)) {
                  Multivio.logger.error('This document has no physical structure to create index');
                }
                else {
                  if (Multivio.masterController.isGrouped) {
                    var fakeNode = {
                      file_position: {
                        index: 0,
                        url: ''
                      },
                      label: 'fake node',
                      childs: logStr          
                    };
                    var newLogSt = this.setLogicalIndex(fakeNode, phyStr);
                    // remove the fake node
                    this._addSubtree(newLogSt.childs);
                    this.initializeTree();
                  }
                  else {
                    this._addSubtree(logStr);
                    this.initializeTree();
                  }
                }
              }
              // physical structure = -1 create the binding
              else {
                this.bind('physicalStructure',  'Multivio.CDM.physicalStructure');
              }
            }
            // logical strcuture index exist use it
            else {
              this._addSubtree(logStr);
              this.initializeTree();
            }            
          }
        }
      }
    }
  }.observes('logicalStructure'),

  /**
    CDM.physicalStructure has changed. Verify if we can create the sub-model.

    @observes physicalStructure
  */  
  physicalStructureDidChange: function () {
    if (!SC.none(this.get('physicalStructure'))) {
      var cf = Multivio.masterController.get('currentFile');
      if (Multivio.masterController.isGrouped) {
        cf = Multivio.CDM.getReferer();
      }
      if (!SC.none(cf)) {    
        var phStr = this.get('physicalStructure')[cf];
        var phSFCDM = Multivio.CDM.getPhysicalstructure(cf);
        if (phStr !== -1 && phStr === phSFCDM) {

          // physical structure is null get logical structure
          if (SC.none(phStr)) {
            Multivio.logger.error('This document has no physicalStructure');
          }
          // physical structure is not null
          else {
            var logStr = Multivio.CDM.getLogicalStructure(cf);
            if (logStr !== -1) {
              if (SC.none(logStr)) {
                var structure = [];
                for (var i = 0; i < phStr.length; i++) {
                  var oneElem = phStr[i];
                  var newElem = {
                    file_position: {
                      index: Multivio.masterController.isGrouped ? i + 1 : null,
                      url: oneElem.url
                    },
                    label: oneElem.label
                  };
                  structure.push(newElem);
                }
                this._addSubtree(structure);
                this.initializeTree();
              }
              else {
                // now test if file_position.index = null
                // if index is null create index using physicalStructure
                var firstLogicalEle = logStr[0];
                var newLogStr = [];
                if (firstLogicalEle.file_position.index === null) {
                  if (Multivio.masterController.isGrouped) {
                    var fakeNode = {
                      file_position: {
                        index: 0,
                        url: ''
                      },
                      label: 'fake node',
                      childs: logStr          
                    };
                    var newLogSt = this.setLogicalIndex(fakeNode, phStr);
                    // remove the fake node
                    this._addSubtree(newLogSt.childs);
                    this.initializeTree();
                  } 
                  else {
                    this._addSubtree(logStr);
                    this.initializeTree();
                  }
                }
                else {
                  this._addSubtree(logStr);
                  this.initializeTree();
                }
              }
            }
          }
        }
      }
    }
  }.observes('physicalStructure'),
  
  /**
    Choose if a new tree must be create or if we have to update the tree. 
  */
  initializeTree: function () {
    this.reset();
    this.bind('position', 'Multivio.masterController.currentPosition');
    var structure = this.treeStructure;
    if (this.get('treeExist')) {
      this._updateTree(structure);
    }
    else {
      this._createTree(structure);
    }
    // order keys to use correctly this._getListOfLabelsForIndex
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
    this.set('treeExist', YES);
    // create the globalStructure
    var tempStruct = [];
    tempStruct.push(structure[0]);
    tempStruct.push(structure[1]);
    for (var i = 2; i < structure.length; i++) {
      var oneEl = structure[i];
      if (oneEl.childs) {
        var res = this.getListOfChilds(oneEl);
        tempStruct = tempStruct.concat(res);
      }
      else {
        tempStruct.push(oneEl);
      } 
    }
    this.set('globalStructure', tempStruct);
    this._treeLabelByPosition = [];
    // create treeContent and set content
    var treeContent = Multivio.TreeContent.create(structure[0]);
    this.set('content', treeContent);
    Multivio.sendAction('addComponent', 'treeController');
    Multivio.logger.info('treeController#_createTree');
  },
  
  /**
    Return the list of all branches of the tree
    
    @param {Object} a logical Node with children
    @return {Array}
  */
  getListOfChilds: function (oneNode) {
    var res = [];
    var children = oneNode.childs;
    for (var i = 0; i < children.length; i++) {
      if (children[i].childs) {
        this.getListOfChilds(children[i]);
      }
      else {
        res.push(children[i]);
      }
    }
    res.push(oneNode);
    return res;
  },

  /**
    Updates selection by observing changes of the position property.
    
    @observes position
  */
  positionDidChange: function () {
    var newPosition = this.get('position');
    if (!SC.none(newPosition)) {  
      // retreive the list of labels for this position
      var labels = this._getListOfLabelsForIndex(newPosition);
      if (!SC.none(labels)) {
        // verify if we really need to set selection
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
          // verify if label is already selected
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
      else {
        // select the currentFile label
        var listOfLabels = this.get('arrangedObjects');
        for (var j = 0; j < listOfLabels.length; j++) {
          var elem = listOfLabels.objectAt(j);
          if (elem.file_position.url === Multivio.masterController.currentFile) {
            this.set('selection', SC.SelectionSet.create().addObject(elem));
            break;
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
    // simple the position is an index
    if (!SC.none(this._treeLabelByPosition) && !SC.none(index)) {
      var label = this._treeLabelByPosition[index];
      if (!SC.none(label)) {
        listToReturn = label;
      }
      else {
        // found the right label
        var lastIndex = 0;
        var newIndex = 0;
        for (var key in this._treeLabelByPosition) {
          // TO DO How to have only key = number
          if (this._treeLabelByPosition.hasOwnProperty(key)) {
            newIndex = key;
            if (newIndex < index) {
              lastIndex = newIndex;
            }
            else {
              // get the lastIndex
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
        keys.push(parseInt(k, 10));
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
    // first remove old bindings and create news
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
    
    // retreive the old structure and append at the right position the new one
    var globs = this.get('globalStructure');
    var selected = Multivio.masterController.get('currentFile');
    var newStruct = [];
    if (lgs.length === 1) {
      lgs[0].file_position.index = 1;
    }
    for (var i = 0; i < globs.length; i++) {
      var temp = globs[i];
      // remove old children
      if (!SC.none(temp.file_position.url) && 
          temp.file_position.url !== Multivio.CDM.getReferer() &&
          !SC.none(temp.childs)) {
        temp.childs = undefined;
      }
      // add new children
      if (temp.file_position.url === selected) {
        temp.childs = lgs;
      }
      newStruct.push(temp);
    }
    
    this._treeLabelByPosition = [];
    var treeContent = Multivio.TreeContent.create(newStruct[0]);
    this.set('content', treeContent);
    // add view 
    Multivio.sendAction('addComponent', 'treeController');
    Multivio.logger.info('treeController#_updateTree');
  },
  
  /**
    Updates position by observing changes of the selection property.
    
    @observes selection
  */
  _selectionDidChange: function () {
    var newSelection = this.get('selection'); 
    if (!SC.none(newSelection) && !SC.none(newSelection.firstObject())) {
      var selectionIndex = newSelection.firstObject().file_position.index;
      // if index === null => change file
      if (SC.none(selectionIndex)) {
        var url = newSelection.firstObject().file_position.url;
        if (!SC.none(url)) {
          if (url !== Multivio.masterController.currentFile &&
              url !== Multivio.CDM.getReferer()) {
            Multivio.makeFirstResponder(Multivio.INIT);
            Multivio.masterController.set('currentFile', url);
          }
          else {
            // currentfile selected set position = 1
            // referer selected do nothing
            if (url === Multivio.masterController.currentFile) {
              this.set('position', 1);
            }
          }
        }
        else {
          var listOfTree = this.get('arrangedObjects');
          var ind = listOfTree.indexOf(newSelection.firstObject());
          // get next element (normaly the first child)
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
        //var selectionIndex = newSelection.firstObject().file_position.index;
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
