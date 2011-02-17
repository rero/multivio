/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2011 RERO
  License:    See file license.js
==============================================================================
*/   

/** 
  @class

  This controller manages the behavior of the search results tree view.
  
  TODO for search results
  
  @author dwy
  @extends SC.TreeController
  @since 0.4.0  
*/

Multivio.searchTreeController = SC.TreeController.create(
/** @scope Multivio.searchTreeController.prototype */ {
  
  /**
    Local variables for binding
  */
  logicalStructure: null,
  physicalStructure: null,
  
  fileList: null,
  
  searchResults: null,
  
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
  
  
  fileListDidChange: function () {
    
    if (SC.none(this.fileList)) return;
    
    Multivio.logger.debug('searchTreeController, fileListDidChange()');
    
    // build structure for files
    var ref_url = Multivio.CDM.getReferer();
    var files = this.get('fileList');
    var cf = undefined, structure = [], node = undefined;
    var single_file = files.length === 1;
    for (var i = 0; i < files.length; i++) {
      cf = files[i];
      //skip referer URL, except if there's only one file
      if (!single_file && cf.url === ref_url) continue;
      
      Multivio.logger.debug('->adding file node #%@, label: %@, url: %@'.fmt(i, cf.label, cf.url));

      // build file node
      node = {
        file_position: {
          index: null,
          url: cf.url
        },
        label: cf.label,
        type: 'file',
        childs: null
      };
      structure.push(node);
      
    }
    
    // add file structure under refererNode
    this._addSubtree(structure);
    this.initializeTree();
    
  }.observes('fileList'),
  
  searchResultsDidChange: function () {
    
    if (SC.none(this.searchResults)) return;    
    
    Multivio.logger.debug('searchTreeController, searchResultsDidChange()');
    
    // go through file nodes in tree
    var files = this.treeStructure[0].childs; // this.get('fileList');
    var search_results = this.get('searchResults');
    var cf = undefined, csr = undefined, node = undefined, file_node = undefined;
    var structure = [], children = []; //this.treeStructure;
    var fi, ri, res = undefined;
    for (fi = 0; fi < files.length; fi++) {
      cf = files[fi];
      
      Multivio.logger.debug('cf.type: ' + cf.type);
      
      // check that it's a file
      if (SC.none(cf.type) || cf.type !== 'file') continue;
      
      // NOTE: need to add the files again since we rebuild the whole tree.
      // build and add file node 
      file_node = {
        file_position: {
          index: null,
          url: cf.file_position.url
        },
        label: cf.label,
        type: 'file',
        childs: null
      };
      structure.push(file_node);
      
      csr = search_results[cf.file_position.url];

      // no results for this file, skip
      if (SC.none(csr) || SC.none(csr.file_position)) continue;

      res = csr.file_position.results;
      if (res.length > 0) file_node.childs = [];
      // go through search results for the current file
      for (ri = 0; ri < res.length; ri++) {
        Multivio.logger.debug('adding search result: ' + res[ri].preview);
        //build tree node for this result
        node = {
          file_position: {index: res[ri].index.page, url: csr.file_position.url},
          label: res[ri].preview,
          type: 'result' 
        };
        // add the result as a child of the file node
        file_node.childs.push(node);
      }
      
      // TODO max results reached, add a 'More' node
      if (csr.max_reached !== 0) {
        node = {
          file_position: {index: null, url: csr.file_position.url},
          label: '_More'.loc(), // TODO translation
          type: 'more' 
        };
        file_node.childs.push(node);
      }
      
    }
    
    // add file structure under root node
    this._addSubtree(structure);
    this.initializeTree();
    
  }.observes('searchResults'),
  
  
  /**
    Initialize this controller and verify if the sub-model can be created. 
    The sub-model need to have the logical or the physical structure of the document .

    @param {String} url the current file url
  */
  initialize: function (url) {
    
    Multivio.logger.info('searchTreeController, begin initialize(), url: ' + url);
   
    this.set('content', []);
    
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
    
    
    // TODO test: remove this section below, as we listen to fileList instead
    var phySt = Multivio.CDM.getPhysicalstructure(url);
    if (phySt === -1) {
      this.bind('physicalStructure',  'Multivio.CDM.physicalStructure');
    }
    else {
      if (SC.none(phySt)) {
        //Multivio.logger.info('This document has no logical and no physical structure');
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
   
    Multivio.logger.info('searchTreeController initialized, adding bindings');
  
    // TODO test
    this.bind('fileList', 'Multivio.searchController.currentFileList');
    this.bind('searchResults', 'Multivio.searchController.searchResults');   
   
    // NOTE: when this is not done, UI freezes on load. This is done in 
    // _createTree
    //Multivio.sendAction('addComponent', 'searchTreeController');
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
    // TODO test: don't add a referer node
    var rootNode = {
      file_position: {
        index: null,
        url: null
      },
      label: "Root Node",
      childs: null
    };
    this.treeStructure.push(rootNode);
    //this.treeStructure.push(refererNode);
  },
  
  /**
    CDM.physicalStructure has changed. Verify if we can create the sub-model.

    @observes physicalStructure
  */  
  physicalStructureDidChange: function () {
    
    // TODO test
    return;
    
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
    Add new logical structure to the current treeStructure

    @private
  */
  _addSubtree: function (list) {
    var newStructure = [];
    // if treeStructure is not null
    // append child to the refererNode
    if (!SC.none(this.treeStructure)) {
      // TODO remove refererNode, use root node
      //var refererNode = this.treeStructure[1];
      var refererNode = this.treeStructure[0];
      // TODO debug here 
      refererNode.childs = list;
      newStructure.push(this.treeStructure[0]);
      //newStructure.push(refererNode[0]);
    }
    for (var i = 0; i < list.length; i++) {
      newStructure.push(list[i]);
    }
    this.treeStructure = newStructure;
  },
 
  /**
    Choose if a new tree must be create or if we have to update the tree. 
  */
  initializeTree: function () {
    this.reset();
    // TODO test bindings
    //this.bind('position', 'Multivio.masterController.currentPosition');
    this.bind('fileList', 'Multivio.searchController.currentFileList');
    this.bind('searchResults', 'Multivio.searchController.searchResults');
    
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
    var treeContent = Multivio.SearchTreeContent.create(structure[0]);
    this.set('content', treeContent);
    Multivio.sendAction('addComponent', 'searchTreeController');
    Multivio.logger.info('searchTreeController#_createTree');
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
    keys.sort(function (a, b) {
      return (a > b) - (a < b); 
    });
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
  
  lastAdded: [],
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
    this.bindings = [];
    this.position = null;
    
    // TODO bindings
    //this.bind('position', 'Multivio.masterController.currentPosition');
    this.bind('fileList', 'Multivio.searchController.currentFileList');
    this.bind('searchResults', 'Multivio.searchController.searchResults');    
    this.selection = null;
    this.content = null;
    
    // retrieve the old structure and append at the right position the new one
    var globs = this.get('globalStructure');
    var selected = Multivio.masterController.get('currentFile');
    var newStruct = [];
    if (lgs.length === 1) {
      lgs[0].file_position.index = 1;
    }
    // remove children
    if (this.lastAdded.length !== 0) {
      var reverseArray = this.lastAdded.reverse();
      var newArray = [];
      for (var k = 0; k < reverseArray.length; k++) {
        if (!SC.none(reverseArray[k].childs)) {
          var listOfChild = reverseArray[k].childs;
          var removeChild = YES;
          for (var t = 0; t < listOfChild.length; t++) {
            if (listOfChild[t].file_position.url === selected) {
              removeChild = NO;
              break;
            }
          }
          if (removeChild) {
            reverseArray[k].childs = undefined;
          }
          else {
            newArray.push(reverseArray[k]);
          }
        }
      }
      this.lastAdded = newArray;
    }
    
    for (var i = 0; i < globs.length; i++) {
      var temp = globs[i];
      // add new children
      if (temp.file_position.url === selected) {
        temp.childs = lgs;
        this.lastAdded.push(temp);
        
        for (var j = 0; j < lgs.length; j++) {
          newStruct.push(lgs[j]);
          this.lastAdded.push(lgs[j]);
        }
      }
      newStruct.push(temp);
    }
    this.globalStructure = newStruct;
    this._treeLabelByPosition = [];
    var treeContent = Multivio.SearchTreeContent.create(newStruct[0]);
    this.set('content', treeContent);
    // add view 
    Multivio.sendAction('addComponent', 'searchTreeController');
    Multivio.logger.info('searchTreeController#_updateTree');
  },
  
  /**
    Enabled or disabled the selection of the treeController
    
    @param {Boolean} 
  */
  allowSelection: function (allowValue) {
    this.set('allowsSelection', allowValue);
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
    //this.selection =  SC.SelectionSet.EMPTY;
    this.bindings =  [];
  },
  
  clear: function () {
    this.position = null;
    this.logicalStructure = null;
    this.physicalStructure = null;    
    this.treeExist = NO;
    this.globalStructure = null;
    this.treeStructure = null;
    this._treeLabelByPosition = undefined;
  }

});
