/**
==============================================================================
  Project:    Multivio - https://www.multivio.org/
  Copyright:  (c) 2009-2010 RERO
  License:    See file license.js
==============================================================================
*/

/** 
  @class

  This controller manages the behavior of the tree document Structure. 
  It depends on the master controller.

  @author che
  @extends SC.Object
  @since 0.1.1  
*/

Multivio.treeDispatcher = SC.Object.create(
/** @scope Multivio.treeDispatcher.prototype */ {

  /**
    Binds to the CDM.logicalStructure
    
    @binding {hash}
  */
  lS: null,
  pS: null,
  
  /**
  Structure created using logical or physical structure. 
  This structure is then used by the treeController to create the tree.
  */ 
  treeStructure: null,
  
  
  /**
    Initialize this controller and verify if the sub-model can be created. 
    The sub-model need to have the logical structure of the document.
    
    algo:
    
    get logical structure
      if (lg = -1): create binding
      else:
      
        if (lg = null): get physical structure
          if (ph = -1): create binding
          if (ph = null): error (no structure)
          if (ph = ok): create logical structure using ph
      
        if (lg = ok) test file_position.index
          if (index = null): get physical structure to create index
            if (ph = -1): create binding
            if (ph = null): error (no index)
            if (ph = ok): create index using ph
          else: create logical structure using lg

    @param {String} url the current file url
  */
  initialize: function (url) {
    if (this.get('bindings').length !== 0) {
      this.reset();
    }

    //Create the first time the rootNode and referer
    if (SC.none(this.treeStructure)) {
      var metadata = Multivio.CDM.getMetadata(url);
      if (metadata !== -1) {
        this._createRootNode();
        var ref = Multivio.CDM.getReferer();
        this._createRefererNode(metadata.title, ref);
      }
    }
    //it not the first time we call initialize reset treeStructure
    else {
      this.treeStructure = null;
    }
    
    //get logical structure first 
    var logStr = Multivio.CDM.getLogicalStructure(url);
    if (logStr !== -1) {
      //if  logicalStructure = null get physical structure
      if (SC.none(logStr)) {
        var phySt = Multivio.CDM.getPhysicalstructure(url);
        if (phySt === -1) {
          this.bind('pS',  'Multivio.CDM.physicalStructure');
        }
        else {
          if (SC.none(phySt)) {
            Multivio.logger.error('This document has no logical and no physical structure');
          }
          //create logical structure with physical structure
          else {
            var structure = [];
            for (var i = 0; i < phySt.length; i++) {
              var oneElem = phySt[i];
              var newElem = {
                file_position: {
                  index: i + 1,
                  url: oneElem.url
                },
                label: oneElem.label
              };
              structure.push(newElem);
            }
            this._addSubtree(structure);
            Multivio.treeController.initialize();
          }
        }
      }
      
      //logical structure != null
      else {
        //now test if file_position.index = null
        //if index is null create index using physicalStructure
        var firstLogicalEl = logStr[0];
        var newLogStr = [];
        if (firstLogicalEl.file_position.index === null) {
          var phyStr = Multivio.CDM.getPhysicalstructure(url);
          if (phyStr !== -1) {
            if (SC.none(phyStr)) {
              Multivio.logger.error('This document has no physical structure to create index');
            }
            //create index
            else {
              var fakeNode = {
                file_position: {
                  index: 0,
                  url: ''
                },
                label: 'fake node',
                childs: logStr          
              };
              var newLogSt = this.setLogicalIndex(fakeNode, phyStr);
              //remove the fake node
              this._addSubtree(newLogSt.childs);
              Multivio.treeController.initialize(); 
            }
          }
          //phyStr = -1
          else {
            this.bind('lS', 'Multivio.CDM.logicalStructure');
          }
        }
        //index for logical structure already exist use it
        else {
          this._addSubtree(logStr);
          Multivio.treeController.initialize();
        }
      }
    }
    //logicalStructure not in the client create the binding
    else {
      this.bind('lS', 'Multivio.CDM.logicalStructure');
    }
    Multivio.logger.info('treeDispatcher initialized');
  },
  
  /**
    Create the root node of the treeView. This node is never show

    @private
  */  
  _createRootNode: function () {
    this.treeStructure = [];
    var rootNode = {
      file_position: {
        index: 0,
        url: null
      },
      label: "Root Node",
      level: 0,
      childs: null
    };
    this.treeStructure.push(rootNode);
  },
  
  /**
    Create the first visible node of the treeView (the label of the referer).

    @param {String} refererLabel the title of the referer
    @param {String} refererUrl the url of the referer
  */
  _createRefererNode: function (refererLabel, refererUrl) {
    var refererNode = [{
      file_position: {
        index: 0,
        url: refererUrl
      },
      label: refererLabel,
      level: 0,
      childs: null
    }];
    //add refererNode as a child of the rootNode
    var rootNode = this.treeStructure.pop();
    rootNode.childs = refererNode;
    this.treeStructure.push(rootNode);
    this.treeStructure.push(refererNode);
  },
  
  /**
    Add new logical structure to the treeStructure
    and set level.

    @private
  */
  _addSubtree: function (list) {
    var newStructure = [];
    //if treeStructure is not null
    //append child to the refererNode
    if (!SC.none(this.treeStructure)) {
      var refererNode = this.treeStructure[1];
      refererNode[0].childs = list;
      newStructure.push(this.treeStructure[0]);
      newStructure.push(refererNode[0]);
    }
    for (var i = 0; i < list.length; i++) {  
      if (SC.none(list[i].level)) {
        if (list[i].childs && SC.none(list[i].file_position.url)) {
          list[i].level = 0;
        }
        else {
          list[i].level = 2;
        }
      }
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
  Create the index for a logical structure. To do it we compare urls
  of the logical and the physical structures
  
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
    if (!SC.none(this.get('lS'))) {
      var cf = Multivio.masterController.get('currentFile');
      
      if (!SC.none(cf)) {
        var logStr = this.get('lS')[cf];
        if (logStr !== -1) {
          //logical structure = null get physical structure
          if (SC.none(logStr)) {
            var phSt = Multivio.CDM.getPhysicalstructure(cf);
            //physical structure
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
                      index: i + 1,
                      url: oneElem.url
                    },
                    label: oneElem.label
                  };
                  structure.push(newElem);
                }
                this._addSubtree(structure);
                Multivio.treeController.initialize();
              }
            }
            //physical structure  = -1 create the binding 
            else {
              this.bind('pS',  'Multivio.CDM.physicalStructure');              
            }
          }
          //logical structure exist
          else {
            //now test if file_position.index = null
            //if index is null create index using physical structure
            var firstLogicalEl = logStr[0];
            var newLogStr = [];
            if (firstLogicalEl.file_position.index === null) {
              var phyStr = Multivio.CDM.getPhysicalstructure(cf);
              if (phyStr !== -1) {
                if (SC.none(phyStr)) {
                  Multivio.logger.error('This document has no physical structure to create index');
                }
                else {
                  var fakeNode = {
                    file_position: {
                      index: 0,
                      url: ''
                    },
                    label: 'fake node',
                    childs: logStr          
                  };
                  var newLogSt = this.setLogicalIndex(fakeNode, phyStr);
                  //remove the fake node
                  this._addSubtree(newLogSt.childs);
                  Multivio.treeController.initialize();
                }
              }
              //physical structure = -1 create the binding
              else {
                this.bind('pS',  'Multivio.CDM.physicalStructure');
              }
            }
            //logical strcuture index exist use it
            else {
              this._addSubtree(logStr);
              Multivio.treeController.initialize();
            }            
          }
        }
        else {
          Multivio.logger.debug('treeDispatcher waiting for logicalStructure');
        }
      }
    }
  }.observes('lS'),
  
  /**
    CDM.physicalStructure has changed. Verify if we can create the sub-model.

    @observes physicalStructure
  */  
  physicalStructureDidChange: function () {
    if (!SC.none(this.get('pS'))) {
      var cf = Multivio.masterController.get('currentFile');
      if (!SC.none(cf)) {    
        var phStr = this.get('pS')[cf];
        var phSFCDM = Multivio.CDM.getPhysicalstructure(cf);
        if (phStr !== -1 && phStr === phSFCDM) {
          
          //physical structure is null get logical structure
          if (SC.none(phStr)) {
            var logSt = Multivio.CDM.getLogicalStructure(cf);
            if (logSt !== -1) {
              if (SC.none(logSt)) {
                Multivio.logger.error('This document has no physical and no logical structure');
              }
              else {
                //now test if file_position.index = null
                //if index is null create index using physicalStructure
                var firstLogicalEl = logSt[0];
                if (firstLogicalEl.file_position.index === null) {
                  Multivio.logger.error('This document has no physical structure to create index');
                }
                else {
                  this._addSubtree(logSt);
                  Multivio.treeController.initialize();
                } 
              }
            }
          }
          //physical structure is not null
          else {
            var logStr = Multivio.CDM.getLogicalStructure(cf);
            if (logStr !== -1) {
              if (SC.none(logStr)) {
                var structure = [];
                for (var i = 0; i < phStr.length; i++) {
                  var oneElem = phStr[i];
                  var newElem = {
                    file_position: {
                      index: i + 1,
                      url: oneElem.url
                    },
                    label: oneElem.label
                  };
                  structure.push(newElem);
                }
                this._addSubtree(structure);
                Multivio.treeController.initialize();
              }
              else {
                //now test if file_position.index = null
                //if index is null create index using physicalStructure
                var firstLogicalEle = logStr[0];
                var newLogStr = [];
                if (firstLogicalEle.file_position.index === null) {
                  var fakeNode = {
                    file_position: {
                      index: 0,
                      url: ''
                    },
                    label: 'fake node',
                    childs: logStr          
                  };
                  var newLogStr2 = this.setLogicalIndex(fakeNode, phStr);
                  //remove the fake node
                  this._addSubtree(newLogStr2.childs);
                  Multivio.treeController.initialize();
                }
                else {
                  this._addSubtree(logStr);
                  Multivio.treeController.initialize();
                }
              }
            }
          }
        }
      }
    }
  }.observes('pS')

});
